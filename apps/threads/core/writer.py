"""
Writer - 投稿生成エージェント

アカウントの中身（語り手・トーン・扱う言葉・行き先）は
accounts/<id>/persona.json と hypotheses.json が持つ。
このモジュールは、そこから投稿を組み立てる手順だけを持つ。
事業の文面をここに直接書かない（書くと、アカウントを入れ替えても
前の事業の投稿が出続ける）。

フロー:
1. 場面（仮説のslug）を選択
2. persona のトーンで生成（連投 or 単発）
3. 自己採点 → 類似度チェック → 検証
"""

import json
import logging
import os
import random
import re
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path

from core.config import atomic_write_json, safe_load_json, get_account_env
from core.validator import validate_post, sanitize_post
from core.monetize import (
    load_monetize_config,
    select_cta,
    inject_cta,
    select_product_topic,
    get_cta_rate,
)

logger = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.6  # これ以上類似していたらリジェクト

# Gemini 429 サーキットブレーカー: 無料枠使い切り後にAPIを叩き続けるのを防止
_gemini_quota_exhausted_until: float = 0.0  # Unixタイムスタンプ。この時刻まではGemini呼び出しをスキップ


def load_persona(account_dir: Path) -> dict:
    path = account_dir / "persona.json"
    return json.loads(path.read_text())


def load_patterns(account_dir: Path) -> list[str]:
    """patterns.md からパターン名リストを抽出"""
    path = account_dir / "patterns.md"
    content = path.read_text()
    patterns = re.findall(r"^#{2,3} \d+\.\s+(.+)$", content, re.MULTILINE)
    return patterns


def load_history(account_dir: Path) -> list[dict]:
    path = account_dir / "history.json"
    data = safe_load_json(path, {"posts": []})
    return data.get("posts", [])


MAX_HISTORY = 500  # 履歴の上限件数


def save_to_history(account_dir: Path, post: dict) -> None:
    path = account_dir / "history.json"
    data = safe_load_json(path, {"posts": [], "last_posted_at": None, "total_count": 0})

    data["posts"].append(post)
    data["posts"] = data["posts"][-MAX_HISTORY:]  # 上限を超えたら古いものを削除
    data["last_posted_at"] = post.get("posted_at") or post.get("generated_at")
    data["total_count"] = len(data["posts"])

    atomic_write_json(path, data)


def is_too_similar(new_text: str, history: list[dict]) -> bool:
    """過去投稿との類似度チェック"""
    for past in history[-100:]:  # 直近100件と比較
        ratio = SequenceMatcher(None, new_text, past.get("text", "")).ratio()
        if ratio >= SIMILARITY_THRESHOLD:
            logger.warning("Too similar (%.2f): %s", ratio, new_text[:50])
            return True
    return False


BUZZ_SCORE_THRESHOLD = 7  # この点数未満はリトライ


def select_viral_source(account_dir: Path, persona: dict) -> dict | None:
    """バズ投稿プールから元ネタを1つ選択する。

    優先順位: viral_posts.json → history.jsonのバズ投稿 → None
    """
    from core.researcher import load_viral_posts

    viral_posts = load_viral_posts()
    if viral_posts:
        # いいね数で重み付けランダム選択
        weights = [max(p.get("likes", 1), 1) for p in viral_posts]
        return random.choices(viral_posts, weights=weights, k=1)[0]

    # フォールバック: 自分の過去バズ投稿
    history = load_history(account_dir)
    with_likes = [p for p in history if p.get("likes", 0) > 0]
    if with_likes:
        avg = sum(p["likes"] for p in with_likes) / len(with_likes)
        viral = [p for p in with_likes if p["likes"] >= avg * 1.5]
        if viral:
            return random.choice(viral)

    return None


def generate_post(
    account_dir: Path,
    topic: str | None = None,
    max_retries: int = 3,
    mock: bool = False,
    follower_count: int = 0,
    account_id: str = "",
    record: bool = True,
    slot: str | None = None,
) -> dict | None:
    """
    バズ投稿をリライトして投稿文を生成する。
    Returns: {"text": str, "cta_used": str|None, "product": dict|None,
              "buzz_score": int, "source_type": str} or None

    フロー:
    1. バズ投稿プールから元ネタ選択
    2. ペルソナ口調でリライト
    3. 自己採点（バズスコア）→ 7未満リトライ
    4. 類似度チェック → 検証 → CTA挿入
    """
    persona = load_persona(account_dir)
    patterns = load_patterns(account_dir)
    history = load_history(account_dir)
    monetize_config = load_monetize_config(account_dir)

    # ── 引用リソース(content_sources.json)からの単発投稿 ──
    # posting.source_post_ratio の確率で、在庫(1リソース=14本)を順番に消費する。
    # 在庫が無い/確率で外れたら通常の連投パスへ。
    source_ratio = persona.get("posting", {}).get("source_post_ratio", 0)
    if source_ratio and random.random() < source_ratio:
        source_post = generate_source_post(account_dir, persona=persona, record=record)
        if source_post:
            return source_post

    # ── フォーマット別の専用パスへ ──
    # single = 恋亀の単発投稿。型（post_forms.json）が構造とリンクの有無を決める。
    #          mens-body-lab(恋亀)はここを通る＝ generate_single が本線。
    # thread = 連投。いまどのアカウントも使っていないが、経路は残してある。
    post_format = persona.get("posting", {}).get("format")
    if post_format == "single":
        return generate_single(
            account_dir, persona=persona, mock=mock, account_id=account_id,
            record=record, slot=slot,
        )
    if post_format == "thread":
        return generate_thread(
            account_dir, persona=persona, mock=mock, account_id=account_id,
            record=record,
        )

    # ── 仮説エンジン: 投稿前に「どの仮説を検証するか」を決める ──
    from core.hypothesis import (
        load_hypotheses, select_hypothesis, select_cta_variant,
        should_post_discovery_question, select_discovery_question,
        record_post as record_hypothesis_post,
    )
    hypothesis = select_hypothesis(account_dir)
    cta_variant = select_cta_variant(account_dir)
    is_discovery = should_post_discovery_question(account_dir)

    if is_discovery:
        # Discovery Question: ユーザー理解のための問いかけ投稿
        question = select_discovery_question(account_dir)
        if question:
            logger.info("Discovery question selected: %s", question[:40])
            if record:
                record_hypothesis_post(account_dir, "discovery", cta_variant["id"], is_discovery=True)
            return {
                "text": question,
                "cta_used": None,
                "product": None,
                "buzz_score": 8,
                "source_type": "discovery",
                "hypothesis_id": "discovery",
                "hypothesis_name": "ユーザー理解",
                "cta_variant": "none",
                "template_type": "question_discovery",
            }

    # 仮説に基づいてトピックを設定
    if hypothesis and not topic:
        topic = hypothesis.get("theme", "")
        logger.info("Hypothesis-driven topic: %s (%s)", hypothesis["id"], topic)

    if not patterns:
        logger.warning("No patterns found in patterns.md, using default")
        patterns = ["共感型"]
    # 仮説slugがあれば、それに対応するテンプレートを選ぶ（本文とリンクのslugを一致させる）
    # mockモードでテキストと記事リンクが食い違うのを防ぐ
    h_slug_for_pattern = hypothesis.get("slug", "") if hypothesis else ""
    if h_slug_for_pattern:
        # slug または slug_2 のバリエーションからランダム選択
        chosen_pattern = random.choice([h_slug_for_pattern, f"{h_slug_for_pattern}_2"])
    else:
        chosen_pattern = random.choice(patterns)

    # マネタイズ: 無効
    product = None

    # トレンド分析コンテキストを取得（伸びてる投稿の構造を参照）
    trend_context = ""
    try:
        from core.trend_analyzer import build_writer_context
        trend_context = build_writer_context(max_patterns=3)
        if trend_context:
            logger.info("Trend analysis context loaded (%d chars)", len(trend_context))
    except Exception as e:
        logger.debug("Trend analysis context unavailable: %s", e)

    # バズ投稿プールから元ネタ選択
    viral_source = select_viral_source(account_dir, persona)
    source_type = "original"
    source_text = ""
    if viral_source:
        source_text = viral_source.get("text", "")
        source_type = viral_source.get("source_type", "viral")
        logger.info("Viral source (%s, %d likes): %s",
                     source_type, viral_source.get("likes", 0), source_text[:50])

    if not mock:
        gemini_key = get_account_env("GEMINI_API_KEY", account_id) if account_id else os.getenv("GEMINI_API_KEY", "")
        openai_key = get_account_env("OPENAI_API_KEY", account_id) if account_id else os.getenv("OPENAI_API_KEY", "")
        if not gemini_key and not openai_key:
            raise ValueError("GEMINI_API_KEY must be set (recommended: Gemini free tier for ¥0 operation)")
        if not gemini_key and openai_key:
            logger.warning(
                "OpenAI fallback is active. Gemini free tier recommended for ¥0 operation. "
                "Set GEMINI_API_KEY to switch."
            )

    system_prompt = _build_system_prompt(persona, chosen_pattern)
    # トレンド分析コンテキストをプロンプトに注入
    if trend_context:
        system_prompt += f"\n\n{trend_context}"
    user_prompt = _build_rewrite_prompt(persona, source_text, chosen_pattern, topic)

    for attempt in range(max_retries):
        if mock:
            raw_text = _generate_mock_post(
                persona, chosen_pattern, topic, account_dir=account_dir,
            )
            buzz_score = random.randint(7, 9)  # mockは常に合格
        else:
            gemini_key = get_account_env("GEMINI_API_KEY", account_id) if account_id else os.getenv("GEMINI_API_KEY", "")
            if gemini_key:
                raw_text = _call_gemini(gemini_key, system_prompt, user_prompt)
            else:
                openai_key = get_account_env("OPENAI_API_KEY", account_id) if account_id else os.getenv("OPENAI_API_KEY", "")
                raw_text = _call_openai(openai_key, system_prompt, user_prompt)

            if not raw_text:
                logger.info("Empty response (attempt %d)", attempt + 1)
                continue

            # 自己採点: バズスコアを取得
            buzz_score = _self_score_buzz(
                raw_text, persona, account_id, mock=False,
                gemini_key=gemini_key if gemini_key else None,
            )

        if not raw_text:
            continue

        # バズスコア閾値チェック
        if buzz_score < BUZZ_SCORE_THRESHOLD:
            logger.info("Buzz score %d < %d, retry (attempt %d)",
                         buzz_score, BUZZ_SCORE_THRESHOLD, attempt + 1)
            continue

        # 類似度チェック
        if is_too_similar(raw_text, history):
            logger.info("Too similar, retry (attempt %d)", attempt + 1)
            continue

        # コンテンツ検証
        is_valid, errors = validate_post(raw_text, persona)
        if not is_valid:
            raw_text = sanitize_post(raw_text, persona)
            is_valid, errors = validate_post(raw_text, persona)
            if not is_valid:
                logger.warning(
                    "Validation failed after sanitize (attempt %d): %s",
                    attempt + 1, errors,
                )
                continue

        # リンク付与: has_linkがTrueなら記事リンクを末尾に追加
        h_type = hypothesis.get("type", "feeling") if hypothesis else "feeling"
        h_slug = hypothesis.get("slug", "") if hypothesis else ""
        link_config = {}
        try:
            from core.hypothesis import load_hypotheses
            hconfig = load_hypotheses(account_dir)
            link_config = hconfig.get("link_config", {})
        except Exception:
            pass

        # type別リンク確率: territory=遷移ドライバー(高)、feeling=保存ドライバー(低)
        ratio_by_type = link_config.get("link_ratio_by_type", {})
        link_ratio = ratio_by_type.get(h_type, link_config.get("has_link_ratio", 0.5))
        has_link = random.random() < link_ratio
        link_url = ""
        link_intro = ""

        if has_link and h_slug and link_config.get("base_urls"):
            # 行き先は hypotheses.json の link_config.base_urls が持つ。
            # 仮説の link_key → type と同名のキー → "apply"（既定の入口）の順。
            # 以前はここで feelings / territories / check / gift を名指しして
            # いたが、旧事業の導線なので名指しをやめた。
            base_urls = link_config["base_urls"]
            for key in (hypothesis.get("link_key") if hypothesis else None, h_type, "apply"):
                if key and key in base_urls:
                    link_url = base_urls[key].format(slug=h_slug)
                    break

            if link_url:
                # type別の好奇心ギャップ導入文（A/Bテスト用に記録）
                intro_config = link_config.get("link_intro_phrases", {})
                if isinstance(intro_config, dict):
                    phrases = intro_config.get(h_type, [])
                else:
                    phrases = intro_config  # 後方互換（リスト形式）
                link_intro = random.choice(phrases) if phrases else ""
                if link_intro:
                    final_text = f"{raw_text}\n\n{link_intro}\n{link_url}"
                else:
                    final_text = f"{raw_text}\n\n{link_url}"
            else:
                final_text = raw_text
                has_link = False
        else:
            final_text = raw_text
            has_link = False

        # 実験記録
        h_id = hypothesis.get("id", "unknown") if hypothesis else "unknown"
        cta_id = cta_variant.get("id", "none") if cta_variant else "none"
        if record:
            record_hypothesis_post(account_dir, h_id, cta_id)

        logger.info(
            "Generated post (attempt %d, score=%d, hypothesis=%s, link=%s): %s",
            attempt + 1, buzz_score, h_id, has_link, final_text[:50],
        )
        return {
            "text": final_text,
            "cta_used": link_url or None,
            "product": product,
            "buzz_score": buzz_score,
            "source_type": source_type,
            "hypothesis_id": h_id,
            "hypothesis_name": hypothesis.get("name", "") if hypothesis else "",
            "has_link": has_link,
            "link": link_url,
            "link_intro": link_intro,
            "topic_type": h_type,
            "topic_slug": h_slug,
            "cta_variant": cta_id,
            "template_type": chosen_pattern,
        }

    logger.error("Failed to generate valid post after %d retries", max_retries)
    return None


# ─── 引用リソース消費: 記事/体験メモ→14本の在庫を順番に投稿 ─────────
# 仕様は accounts/<id>/CONTENT_SOURCES.md。
# 配分: 共感4/気づき4/問題提起3/実績2/誘導1。URLは誘導(cta)の1本だけ。

# 投稿順序（固定）: 価値13本を先に置き、ctaは必ず最後
SOURCE_SEQUENCE = [
    "empathy", "insight", "question", "empathy", "insight", "fact",
    "empathy", "question", "insight", "empathy", "fact", "insight",
    "question", "cta",
]


def _load_content_sources(account_dir: Path) -> dict | None:
    path = account_dir / "content_sources.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else None
    except Exception as e:
        logger.warning("Failed to load content_sources.json: %s", e)
        return None


def _next_source_material(source: dict) -> tuple[int, str, str] | None:
    """未消費の次ステップを返す: (step, category, 投稿本文の素) or None(在庫切れ)。

    素材が足りないステップ（記事に無い分類は創作しない方針）は飛ばす。
    """
    materials = source.get("materials", {})
    step = source.get("used_count", 0)
    while step < len(SOURCE_SEQUENCE):
        cat = SOURCE_SEQUENCE[step]
        if cat == "cta":
            core = materials.get("core", "")
            if core and source.get("url"):
                return step, cat, core
        else:
            idx = SOURCE_SEQUENCE[:step].count(cat)
            items = materials.get(cat, [])
            if idx < len(items) and items[idx].strip():
                return step, cat, items[idx]
        step += 1  # 素材が無いステップは飛ばす
    return None


def generate_source_post(
    account_dir: Path, persona: dict | None = None, record: bool = True,
) -> dict | None:
    """引用リソースの在庫から単発投稿を1本取り出す。

    Returns: generate_post と同形の dict。在庫が無ければ None（連投へフォールバック）。
    """
    if persona is None:
        persona = load_persona(account_dir)

    data = _load_content_sources(account_dir)
    if not data:
        return None

    for source in data.get("sources", []):
        if source.get("status", "active") != "active":
            continue
        nxt = _next_source_material(source)
        if not nxt:
            continue
        step, cat, material = nxt

        if cat == "cta":
            # 誘導: 核心1行＋「置いておく」の距離感＋URL（14本中この1本だけURL可）
            link_url = source.get("url", "")
            text = f"{material}\n\nまとめた記事を、ここに置いておく。\n{link_url}"
        else:
            link_url = ""
            text = material

        is_valid, errors = validate_post(text, persona)
        if not is_valid:
            text2 = sanitize_post(text, persona)
            is_valid, errors = validate_post(text2, persona)
            if is_valid:
                text = text2
        if not is_valid:
            logger.warning("source post invalid (%s step %d): %s",
                           source.get("id"), step, errors)
            # このステップは消費済みにして事故投稿を防ぐ
            if record:
                source["used_count"] = step + 1
                atomic_write_json(account_dir / "content_sources.json", data)
            return None

        if record:
            source["used_count"] = step + 1
            atomic_write_json(account_dir / "content_sources.json", data)

        src_id = source.get("id", "unknown")
        logger.info("Source post (%s, step %d/%d, %s, link=%s)",
                    src_id, step + 1, len(SOURCE_SEQUENCE), cat, bool(link_url))
        return {
            "is_thread": False,
            "text": text,
            "link": link_url,
            "cta_used": link_url or None,
            "product": None,
            "buzz_score": 8,
            "source_type": "content_source",
            "hypothesis_id": f"src:{src_id}",
            "hypothesis_name": f"引用リソース {src_id}",
            "has_link": bool(link_url),
            "topic_type": "source",
            "topic_slug": src_id,
            "cta_variant": cat,
            "template_type": f"source_{cat}",
        }

    return None  # 全リソース消費済み


# ─── 連投(スレッド)生成: 稼働中の本線 ─────────────────────────────


def _current_time_slot() -> str:
    """現在のJST時刻から配信スロットを返す。

    恋亀の枠は 08:00 / 12:30 / 21:00 JST。
      4:00〜10:59  → "morning"
     11:00〜16:59  → "noon"
     それ以外      → "night"

    ただし生成は夜にまとめて走る（threads-post.yml は 22:00 JST の1回で
    3本積む）ので、**生成時刻で判定すると全部 night になる**。
    どの枠に出すつもりかは、呼ぶ側が slot で渡す。ここはその既定値。
    """
    from datetime import datetime, timezone, timedelta
    jst_hour = datetime.now(timezone(timedelta(hours=9))).hour
    if 4 <= jst_hour < 11:
        return "morning"
    if 11 <= jst_hour < 17:
        return "noon"
    return "night"


def _load_post_forms(account_dir: Path | None) -> dict:
    """恋亀の投稿の型（post_forms.json）を読む。

    categories が A/B/C/D の比率とリンクの有無、forms が型1〜5 の
    構造・規則・例を持つ。GROWTH.md §4 と同じもの。

    ここに型を直書きしない。writer.py に人格を直書きして
    persona.json が効かなくなった失敗と、同じ種類の失敗になる。
    """
    if not account_dir:
        return {}
    path = account_dir / "post_forms.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception as e:
        logger.warning("Failed to load post_forms.json: %s", e)
        return {}


def _select_category(
    forms_config: dict,
    persona: dict | None = None,
    slot: str | None = None,
    recent: list[dict] | None = None,
) -> dict | None:
    """A共感40% / B問い30% / C恋亀20% / D告知10% から1つ選ぶ。

    比率は post_forms.json の ratio。

    時間帯で寄せる。テーマは縛らない（縛ると夜のテーマが朝に出せなくなって
    同じ話が続く）が、型は寄せてよい。夜のほうが手が止まるので、返信の来る
    問い（B）を夜に厚くする。告知（D）は昼だけ——朝は読み飛ばされ、夜は
    売り込みが目立つ。

    重みは persona.posting.slot_category_weights。無ければ ratio のまま。
    """
    # human_only のカテゴリは、自動生成の対象から外す。
    #
    # 「実在異性の反応」は、実際に集まった回答だけで書ける。
    # 回答が無いのに AI に書かせると、女性の反応の創作になる。
    # それを売っているサービスが作り話を出したら、商品そのものが嘘になる
    # （CLAUDE.md §1 の最初の行）。
    #
    # 外したぶんの比率は、残りが重みの比で吸う。
    # 「10%空ける」ではなく「10%ぶん他が増える」。
    categories = [
        c for c in forms_config.get("categories", [])
        if c.get("ratio", 0) > 0 and not c.get("human_only")
    ]
    if not categories:
        return None

    weights = [float(c["ratio"]) for c in categories]

    slot = slot or _current_time_slot()
    slot_weights = (
        (persona or {}).get("posting", {}).get("slot_category_weights", {})
    ).get(slot, {})
    if slot_weights:
        weights = [
            w * float(slot_weights.get(c["id"], 1.0))
            for c, w in zip(categories, weights)
        ]
        if sum(weights) <= 0:
            logger.warning(
                "_select_category: %s の重みが全部0。比率のまま出します", slot,
            )
            weights = [float(c["ratio"]) for c in categories]

    # 直近に出した型を避ける。
    #
    # 避けないと、60日のうち34日で1日3本の型が重なった。
    # 告知が同じ日に2本出る日もあった（1日2回の売り込みになる）。
    # 同じ形が続くと、恋亀がテンプレを回しているように見える。
    #
    # 禁止ではなく重みを下げるだけ。直前と同じ型しか選べない状況でも
    # 生成が止まらないようにする。
    if recent:
        last_categories = [r.get("category") for r in recent[:2]]
        for i, c in enumerate(categories):
            if c["id"] == last_categories[0]:
                weights[i] *= 0.25            # 直前と同じ
            elif c["id"] in last_categories:
                weights[i] *= 0.6             # 2つ前と同じ
        if sum(weights) <= 0:
            weights = [float(c["ratio"]) for c in categories]

    return random.choices(categories, weights=weights, k=1)[0]


def _recent_posts_meta(account_dir: Path | None, n: int = 4) -> list[dict]:
    """直近に作った投稿の型・カテゴリを、新しい順で返す。

    history.json だけでは足りない。恋亀は1日3本をまとめて生成するが、
    history に入るのは**投稿したあと**なので、同じ生成の中で作った
    直前の1本が見えない。承認キューも一緒に見る。
    """
    if not account_dir:
        return []

    out: list[dict] = []

    # まだ出していないぶん（承認待ち・承認済み）
    queue = safe_load_json(account_dir / "approvals.json", {"items": []})
    for it in reversed(queue.get("items", [])):
        if it.get("status") in ("pending", "approved"):
            pl = it.get("payload") or {}
            out.append({
                "form": pl.get("post_form"),
                "category": pl.get("post_category"),
            })
        if len(out) >= n:
            return out

    # 出したぶん
    history = safe_load_json(account_dir / "history.json", {"posts": []})
    for post in reversed(history.get("posts", [])):
        out.append({
            "form": post.get("post_form"),
            "category": post.get("post_category"),
        })
        if len(out) >= n:
            break
    return out


def _tracking_code() -> str:
    """投稿1本を見分けるための短い符号。

    Threads の投稿IDは投稿したあとにしか分からないが、リンクは
    投稿する前に本文へ埋め込まれる。だから、こちらで先に振る。
    history.json に一緒に残すので、あとから
    utm_content → 投稿 → 表示数 の順でたどれる。

    これが無いと、utm_campaign（テーマ）までしか分からず、
    「3千表示→恋亀開始15 の投稿を高く評価する」が実行できない
    （GROWTH.md §7）。
    """
    import uuid
    return uuid.uuid4().hex[:8]


def _build_single_prompt(
    persona: dict,
    category: dict,
    form: dict,
    scene_name: str,
    scene_topics: list[str] | None = None,
) -> str:
    """恋亀の単発投稿を生成するプロンプトを組む。

    人格は persona.json（src/lib/koi/prompt.ts の写し）、
    型は post_forms.json。ここは組み立てだけを持つ。
    """
    ch = persona.get("character", {}) or {}
    tone = persona.get("tone", {}) or {}
    brand = persona.get("brand", {}) or {}
    biz = persona.get("business_context", {}) or {}
    posting = persona.get("posting", {}) or {}

    def block(title: str, items) -> str:
        items = [str(x).strip() for x in (items or []) if str(x).strip()]
        if not items:
            return ""
        return "\n【" + title + "】\n" + "\n".join("- " + x for x in items) + "\n"

    who = [
        f"あなたは「{ch.get('name') or persona.get('display_name') or '恋亀'}」本人です。",
        "運営でも公式アカウントでもありません。企業として名乗りません。",
    ]
    if ch.get("background"):
        who.append(ch["background"])
    if persona.get("role_description"):
        who.append(persona["role_description"])

    parts = [
        "Threadsの投稿を1本だけ書いてください。",
        block("あなたは誰か", who),
        block("話し方", ch.get("speech")),
        block("大事にしていること", ch.get("values")),
        block("書かないこと", ch.get("never_write_list")),
        block("使わない言葉", ch.get("ng_words")),
        block("編集方針", brand.get("editorial_principles")),
    ]

    form_rules = [
        f"型: {form.get('label', '')}",
        f"構造: {form.get('structure', '')}",
    ]
    if form.get("rule"):
        form_rules.append(form["rule"])
    parts.append(block("今回の型", form_rules))

    examples = form.get("examples") or []
    if examples:
        parts.append(
            "\n【この型の例（丸写ししない。構造だけ真似る）】\n"
            + "\n\n---\n\n".join(examples) + "\n"
        )

    scene = [f"今回のテーマ: {scene_name}"]
    if scene_topics:
        scene.append("扱う言葉: " + " / ".join(str(t) for t in scene_topics))
    scene.append(f"ねらい: {category.get('goal', '')}")
    parts.append(block("今回の中身", scene))

    # ── 1行目 ──────────────────────────────────────
    # 読まれるかは1行目でほぼ決まる（READ_DESIGN.md §3）。
    # 指示が無いと、AIは説明から書き始める。
    parts.append(block("1行目", [
        "具体的な場面・セリフ（「」）・数字のどれかから始める",
        "説明や前置きから始めない（「〜について」「最近よく聞くのは」）",
        "1行目だけ読んで、自分のことだと思える長さにする（20字以内が目安）",
    ]))

    # ── 恋亀の見立て ───────────────────────────────
    # ここがこの投稿群でいちばん大事。
    #
    # 「断定しない」を「意見を持たない」と取ると、
    # 「人によるよね」で終わる投稿になる。誰も反論できないので返信が来ない。
    #
    # 返信を生むのは訂正したくなること。恋亀が外れた見立てを出して、
    # 人が「いや違う」と言う。その往復がアルゴリズムの最重要指標
    # （READ_DESIGN.md §0）。
    #
    # 相手の気持ちの判定にはならない。恋亀が自分にどう見えたかを
    # 言っているだけで、prompt.ts の NEVER も「わたしはそう感じる」までは
    # 許している。
    if not category.get("link"):
        parts.append(block("恋亀の見立て", [
            "恋亀自身にどう見えたかを、必ず1行入れる（「恋亀は②に見えた」）",
            "見立てには理由を1行つける。理由があるから、違う人が反論できる",
            "外れていてよい。外れているから訂正が来る",
            "「人によるよね」「どっちもあるよね」で閉じない。それは意見の不在",
            "ただし相手の気持ちは当てない。恋亀にどう見えたか、までにする",
            "最後は、違う意見の人に理由を聞いて閉じる",
        ]))

    # ── AIっぽさ ───────────────────────────────────
    # 放っておくと、整った・両論併記の・説明的な文章になる。
    # 規則違反では落ちないが、いちばん読まれない形。
    parts.append(block("こう書くと読まれない", [
        "両論併記（「一方で」「とはいえ」）。恋亀は片方に寄ってよい",
        "まとめ（「つまり」「大事なのは」）。言い切って終わる",
        "助言（「〜するといい」「〜してみては」）。恋亀は教えない",
        "敬語・丁寧語。友達の距離で書く",
        "整った文。言いよどみ・体言止め・短い行が混ざっているほうが読まれる",
        "一般論。固有の場面（曜日・時間・回数・セリフ）を1つ入れる",
    ]))

    fmt = [
        f"長さ: {posting.get('min_chars', 20)}〜{posting.get('max_chars', 300)}文字",
        tone.get("line_breaks", "改行多め。1投稿4〜8行"),
        tone.get("emoji_usage", "🐢を1個だけ、文末に"),
        "ハッシュタグは使わない",
        "最後は問いで閉じる。質問は1つだけ",
        "いいね・シェア・拡散をお願いしない",
        "価格・割引・キャンペーンには触れない",
    ]
    if category.get("link"):
        fmt.append("最後の行に {link} とだけ書く（URLは後でこちらが入れる）")
    else:
        fmt.append("URLは書かない")
    parts.append(block("形式", fmt))

    if biz.get("available_now"):
        parts.append(block("いま書いてよいこと", [biz["available_now"]]))

    parts.append("\n投稿文だけを出力してください。前置きも説明も要りません。\n")
    return "".join(x for x in parts if x)


def generate_single(
    account_dir: Path,
    persona: dict | None = None,
    mock: bool = False,
    account_id: str = "",
    max_retries: int = 3,
    record: bool = True,
    slot: str | None = None,
) -> dict | None:
    """恋亀の単発投稿を1本生成する。posting.format == "single" のときの本線。

    連投（generate_thread）との違いは3つ。
      - 1投稿で完結する
      - リンクを置くのは D（告知）だけ。型が決める（post_forms.json）
      - utm_content に追跡コードを入れる（投稿単位で効果を見るため）
    """
    if persona is None:
        persona = load_persona(account_dir)

    from core.hypothesis import (
        load_hypotheses, select_hypothesis,
        record_post as record_hypothesis_post,
    )

    forms_config = _load_post_forms(account_dir)
    recent = _recent_posts_meta(account_dir)
    category = _select_category(forms_config, persona, slot, recent)
    if not category:
        logger.error(
            "generate_single: post_forms.json に categories がありません "
            "(accounts/<id>/post_forms.json)",
        )
        return None

    form_ids = category.get("forms") or []
    all_forms = forms_config.get("forms", {})
    usable = [f for f in form_ids if f in all_forms]
    if not usable:
        logger.error(
            "generate_single: category=%s に使える型がありません (forms=%s)",
            category.get("id"), form_ids,
        )
        return None
    # 同じカテゴリの中でも、直前と同じ型は避ける。
    # 使える型が1つしか無ければ、それを使う（止めない）。
    recent_forms = [r.get("form") for r in recent[:2]]
    fresh = [f for f in usable if f not in recent_forms]
    form_id = random.choice(fresh or usable)
    form = all_forms[form_id]

    hypothesis = select_hypothesis(account_dir)
    if not hypothesis:
        logger.error("generate_single: no hypothesis available")
        return None

    h_id = hypothesis.get("id", "unknown")
    h_slug = hypothesis.get("slug", h_id)
    h_type = hypothesis.get("type", h_slug)
    scene_name = hypothesis.get("name", h_slug)
    scene_topics = hypothesis.get("topics", [])

    # リンクは型が決める。A・B・C は付けない（Threadsはリンク付きの露出を落とす）。
    code = _tracking_code()
    link_url = ""
    if category.get("link"):
        hconfig = load_hypotheses(account_dir)
        base_urls = hconfig.get("link_config", {}).get("base_urls", {})
        for key in (hypothesis.get("link_key"), h_type, "apply"):
            if key and key in base_urls:
                link_url = base_urls[key].format(slug=h_slug, code=code)
                break
        if not link_url:
            logger.error(
                "generate_single: 告知の型なのに行き先がありません "
                "(hypotheses.json の link_config.base_urls に apply を置く)",
            )
            return None

    def _example_post() -> str:
        """mock / キー無しのとき。型の例から1つ選ぶ。"""
        examples = form.get("examples") or []
        if not examples:
            logger.error(
                "generate_single: 型 %s に例がありません "
                "(post_forms.json の forms.%s.examples)", form_id, form_id,
            )
            return ""
        return random.choice(examples)

    # 同じことを何度も言う亀にしない。
    #
    # validator の類似チェックはプロセス内のバッファを見ているので、
    # ワークフローが毎回新しいプロセスで走る本番では、常に空になる。
    # 実際に避けたいのは「先週と同じ投稿」なので、history.json と比べる。
    #
    # mock では見ない。型ごとの例が数本しか無いので必ず当たるし、
    # mock は画面で型を確かめるためのもので、投稿はされない。
    history = [] if mock else load_history(account_dir)

    text = ""
    if mock:
        text = _example_post()
    else:
        gemini_key = (
            get_account_env("GEMINI_API_KEY", account_id)
            if account_id else os.getenv("GEMINI_API_KEY", "")
        )
        if not gemini_key:
            logger.warning("generate_single: no GEMINI_API_KEY, using example")
            text = _example_post()
        else:
            system_prompt = _build_single_prompt(
                persona, category, form, scene_name, scene_topics,
            )
            for _ in range(max_retries):
                raw = (_call_gemini(gemini_key, system_prompt, "投稿を1本書いてください。") or "").strip()
                if not raw:
                    continue
                candidate = raw.replace("{link}", link_url).strip()
                ok, errors = validate_post(candidate, persona)
                if not ok:
                    fixed = sanitize_post(candidate, persona)
                    ok, errors = validate_post(fixed, persona)
                    if ok:
                        candidate = fixed
                if ok and is_too_similar(candidate, history):
                    logger.info("generate_single: 過去の投稿に似すぎ。書き直す")
                    continue
                if ok:
                    text = candidate
                    break
                logger.warning("generate_single: invalid post: %s", errors)
            if not text:
                logger.warning("generate_single: AI generation failed, using example")
                text = _example_post()

    if not text:
        return None

    text = text.replace("{link}", link_url).strip()
    # 告知なのにリンクが落ちていたら、末尾に足す
    if link_url and link_url not in text:
        text = f"{text}\n\n{link_url}"

    is_valid, errors = validate_post(text, persona)
    if not is_valid:
        fixed = sanitize_post(text, persona)
        is_valid, errors = validate_post(fixed, persona)
        if is_valid:
            text = fixed
    if not is_valid:
        logger.warning("generate_single: post invalid after sanitize: %s", errors)
        return None

    if is_too_similar(text, history):
        logger.warning(
            "generate_single: 過去の投稿に似すぎているので出しません "
            "(theme=%s, form=%s)", h_id, form_id,
        )
        return None

    if record:
        record_hypothesis_post(account_dir, h_id, "none")

    logger.info(
        "Generated single (theme=%s, category=%s, form=%s, link=%s, code=%s)",
        h_id, category.get("id"), form_id, bool(link_url), code,
    )
    return {
        "text": text,
        "link": link_url,
        "cta_used": link_url or None,
        "product": None,
        "buzz_score": 8,
        "source_type": f"{category.get('id')}_{form_id}",
        "hypothesis_id": h_id,
        "hypothesis_name": scene_name,
        "has_link": bool(link_url),
        "topic_type": h_type,
        "topic_slug": h_slug,
        "cta_variant": "none",
        "template_type": form_id,
        "post_category": category.get("id"),
        "post_form": form_id,
        "slot": slot or _current_time_slot(),
        # utm_content に入れた値。history.json から、
        # どの投稿がサイトまで連れてきたかをたどるための鍵。
        "tracking_code": code,
    }


def _load_thread_templates(account_dir: Path | None) -> dict:
    """連投テンプレートを読み込む。

    account_dir/thread_templates.json があればそれを優先（管理ページで編集可能）。
    無ければコード内の既定テンプレートにフォールバックする。
    """
    if account_dir:
        path = account_dir / "thread_templates.json"
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(data, dict) and data:
                    return data
            except Exception as e:
                logger.warning("Failed to load thread_templates.json: %s", e)
    return _default_thread_templates()


def _default_thread_templates() -> dict:
    """場面別の連投テンプレート（mock用・既定値）。

    各値は投稿リスト。CTA投稿には {link} プレースホルダを置く。
    キーは hypotheses.json の slug（= 場面）に対応する。
    通常は accounts/<id>/thread_templates.json が優先され、こちらは
    ファイルが無い/壊れているときの最後の受け皿。

    以前ここには旧事業（His Recoveries の第一印象パッケージを
    パートナーに贈るギフト訴求）のテンプレートが入っていた。
    thread_templates.json に場面別のものが入っていても、slug が
    一致しないときのフォールバックで旧事業の文面が出てしまうため、
    タシカメの5場面に置き換えてある。
    """
    return {
        # 送る前のLINE
        "message": [
            "AIには通した。\n誤字もない。\n\nそれでも送信ボタンの前で、\n一回止まる。",
            "止まるのは、たぶん慎重だから。\n適当な人は止まらない。",
            "ただ、いくら読み返しても\n「自分がどう読むか」しか分からない。\n受け取る側の目は、自分の中には無い。",
            "だから、送る前に\n相手と同じ側に立つ人に読んでもらう。\n\n返ってくるのは、実際にどう受け取ったか。\n{link}",
            "その文面、送る前に止まったことありますか。",
        ],
        # 自己紹介文・プロフィール
        "photo": [
            "マッチはする。\nでも、そこから続かない。",
            "写真を変えてみる。\n変わらない。\n\n読まれているのは、その下の文章かもしれない。",
            "自己紹介文は、書いた本人がいちばん読めない。\n何度も読み返したぶん、\n初めて読む人の目が想像できなくなる。",
            "出す前に、一度だけ\n知らない人の目を通しておく。\n{link}",
            "自己紹介文、最後に書き直したのはいつですか。",
        ],
        # 誘うタイミング
        "date": [
            "誘うタイミングだけが、ずっと決まらない。",
            "早いと重い。\n遅いと冷める。\n\nどっちも怖いから、今日も送らない。",
            "この「まだ早いかな」は、\n何回考えても自分の中では解けない。\n相手側にしか無い情報だから。",
            "決めるのは自分でいい。\nただ、材料が片側しか無いまま決めている。\n{link}",
            "誘うタイミング、どうやって決めてますか。",
        ],
        # デートのあと
        "signal": [
            "デートは楽しかった。\nと思う。",
            "帰ってから、\n温度感が読めなくなる。\n\n今日送るか、明日にするか。\nそれだけで30分たつ。",
            "楽しかったかどうかは、\n自分の記憶からしか分からない。\n相手からどう見えていたかは、別の話。",
            "次の一手を決める前に、\nもう片方の目を借りておく。\n{link}",
            "デートのあと、すぐ送る派ですか。",
        ],
        # 距離感・言いにくいこと
        "distance": [
            "踏み込みたい。\nでも、踏み込みすぎたくない。",
            "この距離の話は、\n友達には聞きにくい。\n相手には、もっと聞けない。",
            "だから、ずっと自分の中だけで回している。",
            "本人には聞けないことを、\n同じ側に立つ人に聞いてみる。\n\n判定ではなく、どう受け取ったかが返る。\n{link}",
            "距離感、どこで決めてますか。",
        ],
    }


def _build_thread_prompt(
    persona: dict, scene_name: str, scene_topics: list[str] | None = None,
) -> str:
    """連投をAI生成するためのプロンプトを persona.json から組み立てる。

    ここは以前 `_build_gift_thread_prompt` という名前で、旧事業
    （His Recoveries の「第一印象パッケージ」を妻・彼女にギフトとして
    勧める連投）の仕様が本文ごと埋め込まれていた。

    稼働中の生成は mock ではなく Gemini なので、persona.json を
    タシカメに書き換えても、実際に生成されるのは旧事業のギフト訴求
    だった。アカウントの中身は persona.json が持つ。ここはその
    組み立てと、Threadsの連投としての形式だけを受け持つ。
    """
    ch = persona.get("character", {}) or {}
    tone = persona.get("tone", {}) or {}
    brand = persona.get("brand", {}) or {}
    biz = persona.get("business_context", {}) or {}
    posting = persona.get("posting", {}) or {}
    thread_cfg = posting.get("thread", {}) or {}

    name = persona.get("display_name") or brand.get("name") or "このアカウント"
    min_posts = thread_cfg.get("min_posts", 3)
    max_posts = thread_cfg.get("max_posts", 6)
    structure = thread_cfg.get(
        "structure", "止まる瞬間 → なぜ決まらないか → 誰に聞けば分かるか → CTA → 問い",
    )

    def block(title: str, items) -> str:
        items = [str(x).strip() for x in (items or []) if str(x).strip()]
        if not items:
            return ""
        return "\n【" + title + "】\n" + "\n".join("- " + x for x in items) + "\n"

    who = [f"語り手: {ch.get('name') or name}"]
    if persona.get("role"):
        who.append(f"立場: {persona['role']}")
    if (ch.get("first_person") or "").strip():
        who.append(f"一人称: {ch['first_person']}（これ以外は使わない）")
    else:
        who.append("一人称は使わない。個人の独白にしない")
    if ch.get("background"):
        who.append(f"背景: {ch['background']}")
    if persona.get("role_description"):
        who.append(persona["role_description"])

    facts = [v for k, v in biz.items() if k != "note" and isinstance(v, str)]

    style = [
        tone.get("style", ""),
        f"絵文字: {tone.get('emoji_usage', '0〜2個')}",
        f"ハッシュタグ: {tone.get('hashtag_usage', '0〜1個')}",
        tone.get("line_breaks", ""),
        "読む人に反応を求めない（いいね・シェア・拡散の誘導は書かない）",
        "価格・割引・キャンペーンには触れない",
    ]

    scene = [f"今回の場面: {scene_name}"]
    if scene_topics:
        scene.append("扱う言葉: " + " / ".join(str(t) for t in scene_topics))

    return (
        f"あなたはThreadsで「{name}」として投稿するライターです。\n"
        f"{min_posts}〜{max_posts}投の連投（スレッド）を1本書いてください。\n"
        + block("今回書く場面", scene)
        + block("語り手", who)
        + block("書き方", style)
        + block("守ること", brand.get("editorial_principles"))
        + block("大事にしていること", ch.get("values"))
        + block("扱ってよいトピック", persona.get("allowed_topics"))
        + block("扱わないトピック", persona.get("forbidden_topics"))
        + block("絶対に書かないこと", ch.get("never_write_list"))
        + block("使わない言葉（1つでも使ったら不合格）", ch.get("ng_words"))
        + block("背景（説明しすぎない）", facts)
        # business_context には価格が入っている。背景として渡すが、
        # 投稿に価格を書かせない（persona の forbidden_topics と揃える）。
        + "- 背景にある金額・プラン名は投稿に書かない\n"
        + "\n【1投目（ここで読まれるかが決まる）】\n"
        "- 2行以内。抽象・説明・一般論で始めない\n"
        "- 次のどれかで始める: 具体的な一場面（時・場所・手元が見える）/ "
        "言われた一言（「」で始める）/ 常識の反転（『〜だと思ってた。でも』）\n"
        "\n【連投の流れ】\n"
        f"- {structure}\n"
        "- 1投=1メッセージ。詩にしない。実際に会話で言う言葉で書く\n"
        "- 最後の投稿は開いた問いで閉じる（返信が来る＝伸びる信号）\n"
        "\n【形式】\n"
        "- CTA投稿の末尾に必ず {link} という文字列をそのまま置く（URLは後で差し込む）\n"
        "- URLやリンクは自分で書かない（{link} だけ置く）\n"
        + ("- {link} は最後のCTA投稿にだけ置く。他の投稿には置かない\n"
           if thread_cfg.get("url_in_last_only", True) else "")
        + "- 各投稿を必ず `1/` `2/` … と番号始まりにして、投稿の区切りにする\n"
        "\n読んだ人が、自分の場面を思い出せれば足ります。正解は渡しません。\n"
        "出力は連投本文のみ。説明や見出しは書かないこと。"
    )


def _parse_thread_text(raw: str) -> list[str]:
    """AIが返した連投テキストを `N/` 区切りで投稿リストに分解する。"""
    if not raw:
        return []
    import re as _re
    # 「1/ 」「2/」などの番号マーカーで分割
    parts = _re.split(r"(?m)^\s*\d+\s*/\s*", raw)
    posts = [p.strip() for p in parts if p.strip()]
    return posts


def generate_thread(
    account_dir: Path,
    persona: dict | None = None,
    mock: bool = False,
    account_id: str = "",
    max_retries: int = 3,
    record: bool = True,
) -> dict | None:
    """連投(スレッド)を生成する。これが稼働中の本線。

    Returns: {"is_thread": True, "posts": [...], "text": str(結合),
              "link": url, "hypothesis_id": str, "scene": str, ...} or None
    """
    if persona is None:
        persona = load_persona(account_dir)

    from core.hypothesis import (
        load_hypotheses, select_hypothesis,
        record_post as record_hypothesis_post,
    )

    hconfig = load_hypotheses(account_dir)
    link_config = hconfig.get("link_config", {})

    # 時間帯×場面の出し分け:
    # persona.posting.slot_type_map = {"morning": [types], "night": [types]}
    # 朝(9時)=出す前のもの(LINE・自己紹介文) / 夜(21時)=会ったあと・誘う前・距離感。
    # 夜のほうが、手が止まる時間帯。
    slot_map = persona.get("posting", {}).get("slot_type_map", {})
    allowed_types = slot_map.get(_current_time_slot()) if slot_map else None
    hypothesis = select_hypothesis(account_dir, allowed_types=allowed_types)
    if not hypothesis:
        logger.error("generate_thread: no hypothesis available")
        return None

    h_id = hypothesis.get("id", "unknown")
    h_slug = hypothesis.get("slug", h_id)
    h_type = hypothesis.get("type", h_slug)
    scene_name = hypothesis.get("name", h_slug)
    scene_topics = hypothesis.get("topics", [])

    # CTAリンク。行き先は hypotheses.json の link_config.base_urls が持つ。
    # type と同じ名前のキーがあればそれを使い、無ければ "apply"（既定の入口）。
    # 以前はここで areas / b2b / gift を名指ししていたが、旧事業の導線なので
    # 名指しをやめた。行き先を増やすときは base_urls にキーを足すだけで足りる。
    # 仮説に no_link:true があればリンク無し（認知・ファン化投稿。会話を評価する
    # アルゴリズムに合わせ、リンクを置かず返信を誘う）
    base_urls = {} if hypothesis.get("no_link") else link_config.get("base_urls", {})
    link_url = ""
    for key in (hypothesis.get("link_key"), h_type, "apply"):
        if key and key in base_urls:
            link_url = base_urls[key].format(slug=h_slug)
            break

    def _template_posts() -> list[str]:
        """テンプレートから連投を組む。slug が無ければ中止（Noneを返す）。

        以前はここで `templates.get("gift-anniversary")` にフォールバック
        していた。slug が一致しない場面では、旧事業のギフト文面がそのまま
        投稿される入口になっていたので、落とすようにした。
        """
        templates = _load_thread_templates(account_dir)
        raw_posts = templates.get(h_slug)
        if not raw_posts:
            logger.error(
                "generate_thread: no thread template for slug=%s "
                "(thread_templates.json に場面を足すか、仮説のslugを合わせる)", h_slug,
            )
            return []
        return [p.replace("{link}", link_url) for p in raw_posts]

    # 投稿リスト生成（mock=テンプレート / AI=Gemini）
    posts: list[str] = []
    if mock:
        posts = _template_posts()
    else:
        gemini_key = (
            get_account_env("GEMINI_API_KEY", account_id)
            if account_id else os.getenv("GEMINI_API_KEY", "")
        )
        if not gemini_key:
            logger.warning("generate_thread: no GEMINI_API_KEY, falling back to mock template")
            posts = _template_posts()
        else:
            system_prompt = _build_thread_prompt(persona, scene_name, scene_topics)
            # 伸びてる投稿の構造（trend_analyzer）があれば参考として渡す
            try:
                from core.trend_analyzer import build_writer_context
                trend_context = build_writer_context(max_patterns=3)
                if trend_context:
                    system_prompt += f"\n\n{trend_context}"
            except Exception as e:
                logger.debug("Trend analysis context unavailable: %s", e)
            for _ in range(max_retries):
                raw = _call_gemini(gemini_key, system_prompt, "連投を作成してください。")
                parsed = _parse_thread_text(raw or "")
                if len(parsed) >= 3:
                    posts = [p.replace("{link}", link_url) for p in parsed]
                    # CTA投稿に{link}が無ければ末尾投稿の前にリンクを補う
                    if link_url and not any(link_url in p for p in posts):
                        posts[-1] = f"{posts[-1]}\n→ {link_url}"
                    break
            if not posts:
                logger.warning("generate_thread: AI parse failed, using mock template")
                posts = _template_posts()

    if not posts:
        return None

    # 各投稿をバリデーション（アカウント別の緩和プロファイルで検証）
    valid_posts: list[str] = []
    for idx, p in enumerate(posts, start=1):
        is_valid, errors = validate_post(p, persona)
        if not is_valid:
            p2 = sanitize_post(p, persona)
            is_valid, errors = validate_post(p2, persona)
            if is_valid:
                p = p2
        if not is_valid:
            logger.warning("generate_thread: post %d invalid: %s", idx, errors)
            # 連投は全体で意味を成すため、1投でも落ちたら中止
            return None
        valid_posts.append(p)

    if record:
        record_hypothesis_post(account_dir, h_id, "none")
    joined = "\n\n———\n\n".join(valid_posts)
    logger.info(
        "Generated thread (scene=%s, posts=%d, link=%s)",
        h_id, len(valid_posts), bool(link_url),
    )
    return {
        "is_thread": True,
        "posts": valid_posts,
        "text": joined,
        "link": link_url,
        "cta_used": link_url or None,
        "product": None,
        "buzz_score": 8,
        "source_type": f"{h_type}_thread",
        "hypothesis_id": h_id,
        "hypothesis_name": scene_name,
        "has_link": bool(link_url),
        "topic_type": h_type,
        "topic_slug": h_slug,
        "cta_variant": "none",
        "template_type": h_slug,
    }


def _self_score_buzz(
    text: str, persona: dict, account_id: str = "",
    mock: bool = False, gemini_key: str | None = None,
) -> int:
    """投稿文のバズ可能性を1-10で自己採点する。

    AIに採点させ、スコアを返す。API失敗時はデフォルト7（通過させる）。
    """
    if mock:
        return random.randint(7, 9)

    scoring_prompt = f"""以下のThreads投稿文のバズ可能性を1〜10で採点してください。

【採点基準】
- フック（1行目）の強さ: 3点
- 共感・感情の揺さぶり: 3点
- 読了率（最後まで読みたくなるか）: 2点
- シェアしたくなるか: 2点

【ターゲット】{persona.get('target_audience', '')}
【ジャンル】{persona.get('genre', '')}

【投稿文】
{text}

数字のみ回答してください（例: 8）"""

    try:
        if not gemini_key:
            gemini_key = get_account_env("GEMINI_API_KEY", account_id) if account_id else os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            result = _call_gemini(gemini_key, "あなたはSNSバズ分析の専門家です。", scoring_prompt)
        else:
            openai_key = get_account_env("OPENAI_API_KEY", account_id) if account_id else os.getenv("OPENAI_API_KEY", "")
            result = _call_openai(openai_key, "あなたはSNSバズ分析の専門家です。", scoring_prompt)

        if result:
            # 数字を抽出
            numbers = re.findall(r"\d+", result.strip())
            if numbers:
                score = int(numbers[0])
                return max(1, min(10, score))
    except Exception as e:
        logger.warning("Buzz scoring failed (defaulting to 7): %s", e)

    return 7  # API失敗時はデフォルト通過


def _build_system_prompt(persona: dict, pattern: str) -> str:
    """persona.json から組み立てる。

    ここは以前「Nagi」という固定のキャラクターに書き下ろしてあった。
    多汗症・ニキビ・ワキガを超えた人の独り言、という前の事業のもの。

    そのため persona.json を書き換えても、生成される中身は変わらなかった。
    さらに「恋愛・マチアプ・デートの文脈は一切書かない」と指示していたので、
    いまの事業（送る前の文面を女性に読んでもらう）では、主題そのものが
    書けない状態だった。

    アカウントの中身は persona.json が持つ。ここはその組み立てだけを行う。
    """
    ch = persona.get("character", {}) or {}
    tone = persona.get("tone", {}) or {}
    brand = persona.get("brand", {}) or {}
    biz = persona.get("business_context", {}) or {}

    name = persona.get("display_name") or brand.get("name") or "このアカウント"
    first_person = (ch.get("first_person") or "").strip()

    def block(title: str, items) -> str:
        items = [str(x).strip() for x in (items or []) if str(x).strip()]
        if not items:
            return ""
        return "\n【" + title + "】\n" + "\n".join("- " + x for x in items) + "\n"

    who = [
        f"語り手: {ch.get('name') or name}",
        f"立場: {persona.get('role') or ''}".strip(),
    ]
    if first_person:
        who.append(f"一人称: {first_person}（これ以外は使わない）")
    else:
        who.append("一人称は使わない。個人の独白にしない")
    if ch.get("background"):
        who.append(f"背景: {ch['background']}")
    if persona.get("role_description"):
        who.append(persona["role_description"])

    facts = [v for k, v in biz.items() if k != "note" and isinstance(v, str)]

    style = [
        tone.get("style", ""),
        f"絵文字: {tone.get('emoji_usage', '0〜1個')}",
        f"ハッシュタグ: {tone.get('hashtag_usage', '0〜1個')}",
        tone.get("line_breaks", ""),
        "読む人に反応を求めない（いいね・シェア・拡散の誘導は書かない）",
    ]

    return (
        f"あなたはThreadsで「{name}」として投稿するライターです。\n"
        f"パターン「{pattern}」で、オリジナルの投稿を1本書いてください。\n"
        + block("語り手", who)
        + block("書き方", style)
        + block("守ること", brand.get("editorial_principles"))
        + block("大事にしていること", ch.get("values"))
        + block("扱ってよいトピック", persona.get("allowed_topics"))
        + block("扱わないトピック", persona.get("forbidden_topics"))
        + block("絶対に書かないこと", ch.get("never_write_list"))
        + block("使わない言葉（1つでも使ったら不合格）", ch.get("ng_words"))
        + block("背景（説明しすぎない）", facts)
        + "\n読んだ人が、自分の場面を思い出せれば足ります。正解は渡しません。\n"
    )



def _build_rewrite_prompt(
    persona: dict, source_text: str, pattern: str, topic: str | None = None,
) -> str:
    """単発投稿のユーザープロンプトを persona.json から組み立てる。

    ここは以前「Nagi」という固定のキャラクター（多汗症・ニキビ・ワキガの
    当事者）に書き下ろされていた。一人称「僕」や、扱うトピックを
    「清潔感・スキンケア・多汗症…」と名指しする指示が本文に埋まっていて、
    persona.json を書き換えても生成物は前の事業のままだった。

    言葉の線引きはアカウントが持つ（persona の ng_words / allowed_topics）。
    ここは「何をどう書き直すか」の形だけを受け持つ。
    """
    ch = persona.get("character", {}) or {}
    tone = persona.get("tone", {}) or {}
    posting = persona.get("posting", {}) or {}
    first_person = (ch.get("first_person") or "").strip()
    min_chars = posting.get("min_chars", 30)
    max_chars = posting.get("max_chars", 450)

    rules = ["【書き方】"]
    if first_person:
        rules.append(f"- 一人称は「{first_person}」を使う")
    else:
        rules.append("- 一人称は使わない。個人の独白にしない")
    rules += [
        f"- {min_chars}〜{max_chars}文字で書く",
        "- 1行目は具体的な一場面から始める。煽りフックは不要",
        "- 「（ネタ元:」「（参考:」等のメタ情報・出典・注釈は書かない",
        f"- 絵文字: {tone.get('emoji_usage', '0個')}",
        f"- ハッシュタグ: {tone.get('hashtag_usage', '0個')}",
        "- 読む人に反応を求めない（いいね・シェア・拡散の誘導は書かない）",
    ]
    ng = [str(w).strip() for w in (ch.get("ng_words") or []) if str(w).strip()]
    if ng:
        rules.append("- 使わない言葉: " + "、".join(ng))
    recommended = [
        str(w).strip() for w in (tone.get("recommended_words") or []) if str(w).strip()
    ]
    if recommended:
        rules.append("- 自然に使いたい言葉: " + "、".join(recommended))
    allowed = [
        str(t).strip() for t in (persona.get("allowed_topics") or []) if str(t).strip()
    ]
    if allowed:
        rules.append("- 扱うトピック: " + "、".join(allowed))
    common_rules = "\n".join(rules) + "\n"

    if source_text:
        prompt = (
            f"以下の投稿の「感情の流れ」だけを参考に、"
            f"「{pattern}」パターンで完全にオリジナルの投稿を書いてください。\n\n"
            f"【参考投稿（※表現・単語はコピーしない。感情構造だけ参考にする）】\n{source_text}\n\n"
            f"【リライトルール】\n"
            f"- 元ネタの「なぜ人々が反応しているのか」を深掘りし、このアカウントの洞察に変換する\n"
            f"- 元ネタの表現・単語は一切使わない。自分の言葉で書き直す\n"
            f"- 扱うトピックと言葉の線引きは、上のシステムプロンプト（persona）に従う\n"
            f"- 出力形式: ①フック（1文）→ ②本文（3〜6行）→ ③余韻のある一文\n"
            f"\n{common_rules}"
        )
    elif topic:
        prompt = (
            f"以下のテーマで「{pattern}」パターンの投稿を1本書いてください。\n\n"
            f"テーマ: {topic}\n\n"
            f"{common_rules}"
        )
    else:
        prompt = (
            f"「{pattern}」パターンの投稿を1本書いてください。\n\n"
            f"{common_rules}"
        )

    if topic and source_text:
        prompt += f"- テーマヒント: {topic}\n"

    prompt += (
        "\n投稿文のみを出力してください。"
        "前置き・説明・注釈・メタ情報は一切不要。本文だけ。"
    )
    return prompt


# 後方互換
def _build_user_prompt(persona: dict, topic: str | None) -> str:
    return _build_rewrite_prompt(persona, "", "観察", topic)


def _generate_mock_post(
    persona: dict, pattern: str, topic: str | None, account_dir: Path | None = None,
) -> str:
    """APIを使わずにサンプル投稿を組む（テスト・品質確認用）。

    以前ここには旧事業（鏡・清潔感・ワキガ・ニキビ跡・ギフト）の文面が
    約260行、直接書かれていた。アカウントを入れ替えても --mock の出力は
    前の事業のままになるので、アカウントの素（thread_templates.json）から
    組むようにした。文面を変えたいときは、コードではなくそのファイルを直す。

    pattern（= 仮説の slug）に一致するテンプレートがあれば、その中の
    1投を返す。無ければ空文字を返し、呼び出し側のリトライに任せる。
    """
    templates = _load_thread_templates(account_dir) if account_dir else {}

    posts = templates.get(pattern)
    if not posts:
        # slug_2 のようなバリエーション名、部分一致も拾う
        for key, value in templates.items():
            if key and (key in pattern or pattern in key):
                posts = value
                break
    if not posts and topic:
        for key, value in templates.items():
            if any(topic in p for p in value):
                posts = value
                break
    if not posts:
        logger.warning(
            "_generate_mock_post: no template for pattern=%s "
            "(thread_templates.json に追記してください)", pattern,
        )
        return ""

    # CTA投稿（{link} を含む）は単発では使わない。本文として読める投稿だけ。
    body = [p for p in posts if "{link}" not in p] or list(posts)
    return random.choice(body).replace("{link}", "").strip()


def _call_gemini(api_key: str, system_prompt: str, user_prompt: str) -> str | None:
    """Google Gemini APIを呼び出す（無料枠あり、レート制限対応）
    - 429 (quota exhausted): リトライしない（無料枠温存）
    - 500/502/503: 1回だけリトライ（サーバー一時障害対策）
    - その他: リトライしない
    """
    import time as _time

    # サーキットブレーカー: 429で停止中ならスキップ
    global _gemini_quota_exhausted_until
    import time as _time_mod
    if _time_mod.time() < _gemini_quota_exhausted_until:
        remaining = int(_gemini_quota_exhausted_until - _time_mod.time())
        logger.warning("Gemini circuit breaker active. Skipping API call. Resumes in %d sec.", remaining)
        return None

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    payload = json.dumps({
        "contents": [{
            "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}],
        }],
        "generationConfig": {
            "maxOutputTokens": 600,
            "temperature": 0.8,
        },
    }).encode()

    max_attempts = 2  # 500系エラー時に1回リトライ（計2回）
    for attempt in range(max_attempts):
        req = urllib.request.Request(
            url, data=payload,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            return (
                data["candidates"][0]["content"]["parts"][0]["text"].strip()
            )
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode()
            except Exception:
                pass
            if e.code == 429:
                # サーキットブレーカー: 1時間停止して無駄なリクエストを防止
                _gemini_quota_exhausted_until = _time_mod.time() + 3600
                logger.error(
                    "Gemini quota exhausted. Circuit breaker activated for 1 hour. "
                    "Free tier: 20 RPD. Detail: %s",
                    body[:200] if body else "unknown",
                )
                return None  # 429はリトライしない（枠温存）
            elif e.code in (500, 502, 503) and attempt < max_attempts - 1:
                logger.warning("Gemini server error %d, retrying in 5s...", e.code)
                _time.sleep(5)
                continue
            else:
                logger.error("Gemini API error: HTTP %d %s", e.code, body[:200] if body else "")
                return None
        except Exception as e:
            err_msg = str(e)
            if api_key in err_msg:
                err_msg = err_msg.replace(api_key, "***")
            if attempt < max_attempts - 1:
                logger.warning("Gemini API error (retrying): %s", err_msg)
                _time.sleep(5)
                continue
            logger.error("Gemini API error: %s", err_msg)
            return None
    return None


def _call_openai(api_key: str, system_prompt: str, user_prompt: str) -> str | None:
    """OpenAI Chat Completions APIを呼び出す（リトライ付き）"""
    import time as _time

    url = "https://api.openai.com/v1/chat/completions"
    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "max_tokens": 600,
        "temperature": 0.8,
    }).encode()

    for attempt in range(3):
        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            return data["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 2:
                wait = 15 * (2 ** attempt)  # 15s, 30s
                logger.info("OpenAI rate limited (%d), waiting %ds...", e.code, wait)
                _time.sleep(wait)
                continue
            logger.error("OpenAI API error: HTTP %d", e.code)
            return None
        except Exception as e:
            err_msg = str(e)
            if api_key and api_key in err_msg:
                err_msg = err_msg.replace(api_key, "***")
            logger.error("OpenAI API error: %s", err_msg)
            return None
    return None
