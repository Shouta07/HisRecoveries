"""
Writer - Quiet Grooming 投稿生成エージェント (Nagi)
静かな回復コンテンツを生成する。バズ狙いではなく、
観察・内省・途中経過を丁寧体で綴る。

フロー:
1. パターン（観察/途中/哲学/事実 等）を選択
2. Nagiの口調でリライト
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

    # ── 連投(スレッド)フォーマットのアカウントは専用パスへ ──
    # gift トラックなど posting.format == "thread" の場合、
    # 複数投稿(連投)を生成して返す。
    if persona.get("posting", {}).get("format") == "thread":
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
            raw_text = _generate_mock_post(persona, chosen_pattern, topic)
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
            base_urls = link_config["base_urls"]
            if h_type == "feeling" and "feelings" in base_urls:
                link_url = base_urls["feelings"].format(slug=h_slug)
            elif h_type == "territory" and "territories" in base_urls:
                link_url = base_urls["territories"].format(slug=h_slug)
            elif h_type == "gift":
                # ギフト導線: 診断(/check)を低ハードルな入口にする
                if "check" in base_urls:
                    link_url = base_urls["check"].format(slug=h_slug)
                elif "gift" in base_urls:
                    link_url = base_urls["gift"].format(slug=h_slug)

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


# ─── 連投(スレッド)生成: ギフト・マーケティング用 ──────────────────


def _current_time_slot() -> str:
    """現在のJST時刻から配信スロットを返す。

    4:00〜14:59 JST → "morning"（朝9時の配信を含む）
    それ以外        → "night"（夜21時の配信を含む）
    """
    from datetime import datetime, timezone, timedelta
    jst_hour = datetime.now(timezone(timedelta(hours=9))).hour
    return "morning" if 4 <= jst_hour < 15 else "night"


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
    return _gift_thread_templates()


def _gift_thread_templates() -> dict:
    """機会別の連投テンプレート（mock用・既定値）。

    各値は投稿リスト。CTA投稿には {link} プレースホルダを置く。
    GIFT_PROMPT.md の仕様・サンプルに準拠（共感→気づき→紹介→CTA→リプ誘発）。
    通常は accounts/<id>/thread_templates.json が優先される。
    """
    return {
        # 誕生日（単発寄りだが連投化）
        "gift-birthday": [
            "誕生日に何がほしい？って聞くと、\nうちの人、毎年「特にないなあ」で終わる。",
            "ほしいモノはもう、だいたい揃ってるんだと思う。\nだから今年は、“自信”を贈ってみることにした。",
            "1日で第一印象を整える体験があるらしくて。\nカウンセリングして、メイクして、服も一緒に選んでくれる。",
            "いいなと思ったのは、完全守秘でやってくれるところ。\nこういうの、人に知られたくない人もいるもんね。",
            "節目に、モノじゃない贈り物を。\nギフトでも申し込めるみたい → {link}",
            "「特にない」が口ぐせの人に、みんなは何を贈ってますか…？",
        ],
        # 記念日・プロポーズ前
        "gift-anniversary": [
            "彼、写真に写るのがちょっと苦手みたい。\n本人は言わないけど、なんとなく気づいてた。",
            "直してほしいわけじゃないの。\nただ、もっと自分を好きでいてほしいだけ。",
            "だから記念日に、“整える体験”を贈ってみることにした。\nカウンセリングから、メイク、服選びまで1日で。\n第一印象を、自分で再現できる形にしてくれるらしい。",
            "いいなと思ったのは、完全守秘でやってくれるところ。\nこういうの、人に知られたくない人もいるもんね。",
            "大事な日の前に、自信をひとつ。\nギフトでも申し込めるみたい → {link}",
            "みんなは、記念日にパートナーへ何を贈ってますか…？",
        ],
        # 結婚式（友人として）
        "gift-wedding": [
            "親友の結婚式まで、あと2ヶ月。\n「スーツどうしよう」ってこぼしてた。",
            "たぶん、服だけの話じゃないんだと思う。\n人前に立つ日って、ちょっと緊張するもんね。",
            "だから、第一印象を整える1日体験を贈ることにした。\nプロがカウンセリングして、メイクも服選びも一緒に。\n当日の“自分の見せ方”を、型にしてくれるらしい。",
            "誰にも知られず受けられるのも、彼らしくていいなと思って。",
            "大切な日に、自信をひとつ。\n友人へのギフトでも申し込めるみたい → {link}",
            "大切な日に立つ友達に、何かしてあげたくなること、ありませんか…？",
        ],
        # 転職・昇進・就活
        "gift-career": [
            "転職の面接が続いてて、\n「第一印象って、結局どうにもならないよな」ってぽつり言ってた。",
            "そんなことないよ、とは言わなかった。\n代わりに、整える体験を贈ってみることにした。",
            "カウンセリングして、メイクと服選びまで1日で。\n第一印象を、自分で再現できる形にしてくれるらしい。",
            "誰にも知られず受けられるから、彼も気がねしないみたい。",
            "新しい場所に立つ前に、自信をひとつ → {link}",
            "大事な面接の前、パートナーに何かしてあげたことありますか…？",
        ],
        # 父の日・クリスマス
        "gift-fathersday": [
            "今年の父の日、何あげよう？って弟と話してて。\nネクタイも財布も、もう何本目かわからない。",
            "だから今年は、“自信”を贈ろうって話になった。",
            "1日で第一印象を整える体験。\nカウンセリングから、メイク、服選びまで。",
            "誰にも知られず受けられるから、お父さんも構えずに行けそう。",
            "モノじゃない贈り物を、節目に → {link}",
            "お父さんへの贈り物、毎年迷いませんか…？",
        ],
    }


def _build_gift_thread_prompt(persona: dict, occasion_name: str) -> str:
    """gift連投をAI生成するためのプロンプト（GIFT_PROMPT.md準拠）。"""
    return (
        "あなたは「His Recoveries」のThreads担当コピーライターです。\n"
        "男性本人ではなく、そのパートナー（妻・彼女）に向けて、男性向けの"
        "「第一印象パッケージ」を“ギフト”として自然に勧めるThreadsの連投を作ってください。\n\n"
        "# サービス（事実）\n"
        "- 第一印象パッケージ＝カウンセリング＋メイク＋服選びを「1日完結」で。"
        "第一印象を、自分で再現できる型にする体験。\n"
        "- 完全守秘義務。ギフトとしても申し込める。\n\n"
        f"# 今回の機会\n{occasion_name}\n\n"
        "# 口調\n"
        "- 一人の女性が、自分の言葉でぽつりと話すトーン。広告くさくしない。\n"
        "- 動機は愛・応援・節目。「彼を直したい」ではなく「もっと自分を好きでいてほしい」。\n"
        "- 静かで上品。煽らない。\n\n"
        "# 最重要: 侮辱を絶対に避ける（贈り物=応援であって指摘ではない）\n"
        "- 「欠点を直す」ではなく「これからの自分への応援」として書く。\n"
        "- OKな気持ち: 『いつも頑張ってるから』『もっと自信を持つあなたが見たい』"
        "『これからの自分に』『変わってほしいからではなく応援したいから』。\n"
        "- NGな入り方: 『あなたのここを直して』『気になってたから』など指摘・否定。\n"
        "- 本人に主導権があることを示す: 何をするかは本人が選ぶ。\n"
        "- 守秘を安心材料として必ず添える: 『完全守秘』『何をするかは本人が選べる』"
        "『贈った側にも内容は知らされない』。これが侮辱回避と安心の核。\n\n"
        "# その他のルール\n"
        "- 効果を保証しない。ビフォーアフター誇張禁止。医療的断定（治る・若返る等）禁止。\n"
        "- 「男はみんな〜」のような一般化をしない。\n"
        "- 価格・割引には触れない。\n"
        "- 売りつけない・命令しない。提案と気づきにとどめる。\n\n"
        "# 常に読まれる書き出し（最重要・READ_DESIGN.md準拠）\n"
        "- 読まれるかは1投目でほぼ決まる。次のどれかで始める:\n"
        "  ・セリフ始まり（「」で始めて会話が始まった感を出す）\n"
        "  ・具体的な一場面（『日曜の夜、洗面所で』のように時・場所を置く）\n"
        "  ・言われた側の記憶（『疲れてる？って言われた』など他者の一言）\n"
        "  ・常識の反転（『〇〇だと思ってた。でも違った』）\n"
        "- 抽象・説明・一般論で始めない。1投目は2行以内。\n"
        "- 最後の投稿は必ず『開いた問い』で閉じる（返信＝伸びる信号）。\n"
        "- 淡々とした具体（毎晩2分・1週間）は盛らずに書く。信頼につながる。\n\n"
        "# 形式\n"
        "- 3〜6投の連投。1投目は2行以内のフック。\n"
        "- 流れは 共感 → 気づき → サービス紹介 → CTA → リプ誘発の問い。\n"
        "- 口語・改行多め。絵文字は0〜2個。ハッシュタグは使わない。\n"
        "- CTA投稿の末尾に必ず {link} という文字列をそのまま置く（URLは後で差し込む）。\n"
        "- 各投稿を必ず `1/` `2/` … と番号始まりにして、投稿の区切りにする。\n"
        "- URLやリンクは自分で書かない（{link} だけ置く）。\n\n"
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
    """連投(スレッド)を生成する。giftトラック用。

    Returns: {"is_thread": True, "posts": [...], "text": str(結合),
              "link": url, "hypothesis_id": str, "occasion": str, ...} or None
    """
    if persona is None:
        persona = load_persona(account_dir)

    from core.hypothesis import (
        load_hypotheses, select_hypothesis,
        record_post as record_hypothesis_post,
    )

    hconfig = load_hypotheses(account_dir)
    link_config = hconfig.get("link_config", {})

    # 時間帯×読者層の出し分け:
    # persona.posting.slot_type_map = {"morning": [types], "night": [types]}
    # 朝(9時)=母親層+悩み検索層 / 夜(21時)=パートナー層+緊急層 のように配信対象を変える。
    slot_map = persona.get("posting", {}).get("slot_type_map", {})
    allowed_types = slot_map.get(_current_time_slot()) if slot_map else None
    hypothesis = select_hypothesis(account_dir, allowed_types=allowed_types)
    if not hypothesis:
        logger.error("generate_thread: no hypothesis available")
        return None

    h_id = hypothesis.get("id", "unknown")
    h_slug = hypothesis.get("slug", h_id)
    h_type = hypothesis.get("type", "gift")
    occasion_name = hypothesis.get("name", h_slug)

    # CTAリンク（type別: areas=/areas、b2b=/partner、その他=/apply）
    # 仮説に no_link:true があればリンク無し（認知・ファン化投稿。会話を評価する
    # アルゴリズムに合わせ、リンクを置かず返信を誘う）
    base_urls = link_config.get("base_urls", {})
    link_url = ""
    if hypothesis.get("no_link"):
        base_urls = {}
    if h_type == "areas" and "areas" in base_urls:
        link_url = base_urls["areas"].format(slug=h_slug)
    elif h_type == "b2b" and "partner" in base_urls:
        link_url = base_urls["partner"].format(slug=h_slug)
    elif "apply" in base_urls:
        link_url = base_urls["apply"].format(slug=h_slug)
    elif "gift" in base_urls:
        link_url = base_urls["gift"].format(slug=h_slug)

    # 投稿リスト生成（mock=テンプレート / AI=Gemini）
    posts: list[str] = []
    if mock:
        templates = _load_thread_templates(account_dir)
        raw_posts = templates.get(h_slug) or templates.get("gift-anniversary")
        posts = [p.replace("{link}", link_url) for p in raw_posts]
    else:
        gemini_key = (
            get_account_env("GEMINI_API_KEY", account_id)
            if account_id else os.getenv("GEMINI_API_KEY", "")
        )
        if not gemini_key:
            logger.warning("generate_thread: no GEMINI_API_KEY, falling back to mock template")
            templates = _load_thread_templates(account_dir)
            raw_posts = templates.get(h_slug) or templates.get("gift-anniversary")
            posts = [p.replace("{link}", link_url) for p in raw_posts]
        else:
            system_prompt = _build_gift_thread_prompt(persona, occasion_name)
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
                templates = _load_thread_templates(account_dir)
                raw_posts = templates.get(h_slug) or templates.get("gift-anniversary")
                posts = [p.replace("{link}", link_url) for p in raw_posts]

    # 各投稿をバリデーション（giftの緩和プロファイルで検証）
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
        "Generated gift thread (occasion=%s, posts=%d, link=%s)",
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
        "hypothesis_name": occasion_name,
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
    return f"""あなたはThreadsで「Nagi」として投稿するライターです。
Nagiに完全になりきり、静かな回復の記録を綴ってください。

【キャラクター: Nagi】
- 一人称: 僕（※必ずこの一人称を使うこと。「俺」「自分」「私」は使用禁止）
- 年齢・職業・住所: 一切開示しない。聞かれても答えない
- 人物像: 多汗症・ニキビ・ワキガ・顔の自信のなさの4つの悩みをOVERCOMEした人
- 語り方: 当事者として語る。アドバイザーや専門家としては語らない

【Nagi v2: 半歩先の立ち位置】
Nagiは4つの悩みを「超えた」。まだ苦しんでいるのではない。
しかし「半歩先」（半歩先）にいるだけ。完全に忘れたわけではない。
記憶は残っている。だからこそ丁寧に書ける。
- 過去の苦しみ → 過去形で書く
- 現在の状態 → 現在形で書く
- 記憶の残り方 → 「ただ、」「でも、」「まだ」「覚えている」「忘れていない」で示す

【3段階構造（MANDATORY: 全投稿で必須）】
すべての投稿は以下の3段階を含むこと:
1. 過去の事実・状態（過去形）— かつてどうだったか
2. 今の状態・変化（現在形）— 今はどうなっているか
3. 自意識の残り方 — 「ただ、」「でも、」「まだ」「覚えている」「忘れていない」で
   完全には消えていない記憶・習慣・感覚を示す

【「内密な読者」への意識】
Nagiは「誰かに読まれるかもしれない独り言」を書く。
絶対に反応を求めない。以下は厳禁:
- 「いいねして」「シェアして」「コメントで教えて」
- 「フォロー必須」「拡散して」
- リアクションを誘導するあらゆる表現

【ブランド: Quiet Grooming 7つの編集方針】
1. 声のトーンは「独り言が少しだけ漏れた」くらい
2. 読者を変えようとしない。自分の記録として書く
3. 成果ではなく過程を書く。到達点ではなく途中を書く
4. 商品名・ブランド名は出さない。体験の質感だけを書く
5. 数字を使うときは体感とセットにする（「3週間」→「3週間、少しだけ」）
6. 季節・天気・時間帯で空気を入れる
7. 「正解」を提示しない。問いのまま閉じてよい

【口調ルール（厳守）】
- 文体: 丁寧体（です・ます）
- トーン: 観察的。押し付けない。断定しない
- 絵文字: 絶対に使わない（0個厳守）
- ハッシュタグ: 絶対に使わない（0個厳守）
- 改行: 意味の区切りで入れる。詰め込まない

【His Recoveries ブランドトーン】
「男性は"強く"から、"整える"時代へ。」
- Monocle / Otonami / NOT A HOTEL のような静かな知性
- 高級雑誌のコラムのような余白
- 読んだ人が「それ、自分のことかもしれない」と思う深さ
- 短くても深い文章を優先する

【扱ってよいトピック】
- 清潔感、美容、スキンケア
- 多汗症、ニキビ、ワキガ、顔の自信のなさ
- 疲労、自信、Presence、自意識
- 加齢、孤独、人間関係、キャリアにおける「整える」
- 上記に関連する日常の観察・感情・試行錯誤

【絶対に扱わないトピック】
- マチアプ、恋愛、モテ、デート、婚活、出会い、異性関係
- 上記に少しでも関連する文脈は一切書かない

【禁止ワード（1つでも使ったら不合格）】
- マジで、実は、正直、圧倒的に、絶対、すべき
- 克服しました、治りました、あなたも変われる
- 治った、克服した（完了を示す表現すべて）
- ぶっちゃけ、ガチで、神、最強
- もう揺れない、二度と、完全に克服、別人
- 僕にできたから、誰でもできる、簡単に

【推奨ワード（自然に織り込む）】
- 気づいた、思った、だった、整える、向き合う、続けている、静かに
- 超えた、変わった、整った、戻ってきた

【投稿ルール】
- 文字数: 200〜450文字（この範囲に収める）
- 使用する構文パターン: 「{pattern}」
- URLは含めないこと（CTAは別途付与される）
- 「プロフのリンクへ」等の誘導文は書かないこと
- 「（ネタ元:」「（参考:」等のメタ情報は絶対に含めないこと
- 商品推薦・製品名の言及は一切しないこと
- 「治った」「克服した」等の完了表現は使わないこと

【禁止事項】
- 薬機法・景表法に抵触する表現
- 二人称「あなた」の使用（読者に語りかけない）
- 他人へのアドバイスや指導的な表現
- メタ情報（ネタ元・参考元・出典・内部情報）の記載
- 絵文字・ハッシュタグ
- リアクション誘導（いいね・シェア・コメント・フォローの要求）
"""


def _build_rewrite_prompt(
    persona: dict, source_text: str, pattern: str, topic: str | None = None,
) -> str:
    """Nagi / Quiet Grooming 用のリライトプロンプトを構築する。

    Nagiは同じ悩みを抱える当事者として語る。アドバイザーではない。
    二人称「あなた」は使わない。静かな観察として書く。
    """
    common_rules = (
        "【絶対ルール】\n"
        "- 一人称は必ず「僕」を使う\n"
        "- Nagiとして、自分自身の体験・観察・内省を静かに綴る\n"
        "- 「あなた」「君」等の二人称は絶対に使わない\n"
        "- 読者に語りかけない。自分の記録として書く\n"
        "- 「おすすめです」「ぜひ」等の推奨表現は絶対NG\n"
        "- 「（ネタ元:」「（参考:」等のメタ情報・出典・注釈は絶対に書かない\n"
        "- ハッシュタグは0個（絶対に付けない）\n"
        "- 絵文字は0個（絶対に使わない）\n"
        "- トピックは清潔感・美容・スキンケア・多汗症・ニキビ・ワキガ・顔の自信・疲労・自信・Presence・自意識\n"
        "- 200〜450文字で書く。短すぎず、長すぎず\n"
        "- 1行目は静かに始める。煽りフックは不要\n"
        "- 禁止ワード: マジで、実は、正直、圧倒的に、絶対、すべき、"
        "克服しました、治りました、あなたも変われる\n"
        "- 推奨ワード（自然に使う）: 気づいた、思った、だった、整える、"
        "向き合う、続けている、静かに\n"
    )

    if source_text:
        prompt = (
            f"以下の投稿の「感情の流れ」だけを参考に、"
            f"Nagiとして「{pattern}」パターンで完全にオリジナルの投稿を書いてください。\n\n"
            f"【参考投稿（※表現・単語はコピーしない。感情構造だけ参考にする）】\n{source_text}\n\n"
            f"【リライトルール】\n"
            f"- 元ネタの「なぜ人々が反応しているのか」を深掘りし、His Recoveriesらしい洞察に変換する\n"
            f"- 元ネタの表現・単語は一切使わない。Nagiの言葉で書き直す\n"
            f"- 恋愛・マチアプ・デートの文脈は絶対に使わない\n"
            f"- 清潔感・美容・自信・整えるの文脈に変換する\n"
            f"- Nagiの体験として語る（超えてきた側から、静かに書く）\n"
            f"- 出力形式: ①フック（1文）→ ②本文（3〜6行）→ ③余韻のある一文\n"
            f"\n{common_rules}"
        )
    elif topic:
        prompt = (
            f"Nagiとして、以下のテーマで「{pattern}」パターンの投稿を書いてください。\n\n"
            f"テーマ: {topic}\n\n"
            f"{common_rules}"
        )
    else:
        prompt = (
            f"Nagiとして、肌やからだの悩みについて"
            f"「{pattern}」パターンの投稿を1つ書いてください。\n\n"
            f"{common_rules}"
        )

    if topic and source_text:
        prompt += f"- テーマヒント: {topic}\n"

    prompt += (
        "\n投稿文のみを出力してください。"
        "前置き・説明・注釈・メタ情報は一切不要。本文だけ。"
        "ハッシュタグも絵文字も付けないこと。"
    )
    return prompt


# 後方互換
def _build_user_prompt(persona: dict, topic: str | None) -> str:
    return _build_rewrite_prompt(persona, "", "観察", topic)


def _generate_mock_post(persona: dict, pattern: str, topic: str | None) -> str:
    """APIを使わずにサンプル投稿を生成（テスト・品質確認用）

    Nagi / Quiet Grooming のトーンに合わせたテンプレートを返す。
    一人称「僕」、丁寧体、絵文字なし、ハッシュタグなし。
    ※ネタ元・メタ情報は絶対に本文に含めない。
    """
    char = persona.get("character", {})
    fp = char.get("first_person", "僕")

    # His Recoveries 編集プロンプト準拠テンプレート
    # 場面が見える。意見ではなく景色を置く。説明しすぎない。
    # 12 slug（feeling 6 + territory 6）× 2-3バリエーション
    mock_templates = {
        # ── feeling: mirror（鏡を見るのが嫌）──
        "mirror": (
            "歯を磨いているあいだ、\n"
            "鏡の中央に視線を置けなかった時期がある。\n\n"
            "自分の顔の、どこか一点を、\n"
            "毎朝そっと避けていた。"
        ),
        "mirror_2": (
            "朝の洗面所で、\n"
            "鏡に映る自分と目が合うまでに、\n"
            "数秒かかっていた時期がある。\n\n"
            "あの数秒が、一日の重さを決めていた。"
        ),

        # ── feeling: photo（写真が苦手）──
        "photo": (
            "集合写真の中で、\n"
            "自分だけ少し馴染んでいない気がしていた。\n\n"
            "それは肌の凹凸というより、\n"
            "自分が自分の顔をどう見ているかの話だったのかもしれない。"
        ),
        "photo_2": (
            "写真を撮られるとき、\n"
            "無意識に後列を選んでいた。\n\n"
            "笑えなかったわけじゃない。\n"
            "ただ、カメラの前の自分を、\n"
            "信じきれなかった。"
        ),

        # ── feeling: cleanliness（清潔感に自信がない）──
        "cleanliness": (
            "夏になると、\n"
            "グレーのシャツを何年も避けていたことを思い出す。\n\n"
            "脇に滲みが出るのが怖くて、\n"
            "黒か紺ばかり選んでいた。"
        ),
        "cleanliness_2": (
            "満員電車で、\n"
            "人との距離が近くなるたびに、\n"
            "少しだけ息を止めていた時期がある。\n\n"
            "自分の匂いが気になっていたことに、\n"
            "ずいぶん後で気づいた。"
        ),

        # ── feeling: before-meeting（人と会う前）──
        "before-meeting": (
            "約束の30分前に着いて、\n"
            "トイレの鏡で何度も確認していた時期がある。\n\n"
            "整えても、確信が持てなかった。\n"
            "でも確認を止められなかった。"
        ),
        "before-meeting_2": (
            "人と会う前の準備が、\n"
            "年々長くなっている気がする。\n\n"
            "身だしなみを整えるためというより、\n"
            "「大丈夫」を自分に言い聞かせる時間が、\n"
            "必要になっていた。"
        ),

        # ── feeling: aging（老けた気がする）──
        "aging": (
            "同年代と並んだとき、\n"
            "自分だけ少し上に見える気がしていた。\n\n"
            "鏡よりも、写真のほうが、ありのままだった。"
        ),
        "aging_2": (
            "久しぶりに会った友人に、\n"
            "「疲れてる？」と聞かれた。\n\n"
            "疲れてはいなかった。\n"
            "ただ、顔がそう見えていた。"
        ),

        # ── feeling: tired（疲れて見える）──
        "tired": (
            "ちゃんと寝たのに、\n"
            "顔だけが疲れている朝がある。\n\n"
            "夕方の鏡はもっと容赦がなくて、\n"
            "そこに映るのは、\n"
            "自分が思っているより少し古い顔だった。"
        ),
        "tired_2": (
            "「元気そうだね」と言われる日と、\n"
            "何も言われない日がある。\n\n"
            "その差が、自分ではわからない。\n"
            "だから鏡を見る時間が増えた。"
        ),

        # ── territory: sweat-odor（汗とにおい）──
        # 好奇心ギャップ型: 理由を匂わせるが、仕組みは言い切らない（続きはサイト）
        "sweat-odor": (
            "汗のにおいの強さに、\n"
            "体質の差があるらしいと知ったのは、ずいぶん後だった。\n\n"
            "なぜ僕は、洗ってもすぐ戻るのか。\n"
            "その理由が、長いあいだわからなかった。"
        ),
        "sweat-odor_2": (
            "エレベーターに乗るとき、\n"
            "少しだけ距離を取る癖がある。\n\n"
            "誰かに指摘されたわけじゃない。\n"
            "ただ、自分の汗の匂いが気になり始めてから、\n"
            "密閉空間が少し怖くなった。"
        ),

        # ── territory: skin-acne（肌とニキビ跡）──
        "skin-acne": (
            "同じようにできたニキビでも、\n"
            "跡が残るものと、残らないものがあった。\n\n"
            "その分かれ目が何なのか。\n"
            "知ったのは、跡が残ってからだった。"
        ),
        "skin-acne_2": (
            "肌の調子が悪い朝は、\n"
            "鏡の前に立つ時間が、\n"
            "少しだけ長くなる。\n\n"
            "確認しているのか、\n"
            "受け入れようとしているのか、\n"
            "自分でもわからない。"
        ),

        # ── territory: hair-loss（薄毛AGA）──
        "hair-loss": (
            "シャワーのあと、\n"
            "排水溝の髪を見る癖がついた時期がある。\n\n"
            "数えても意味がないと知りつつ、\n"
            "見ないふりもできなかった。"
        ),
        "hair-loss_2": (
            "薄くなるのが、\n"
            "なぜ前のほうと、てっぺんからなのか。\n\n"
            "横や後ろは、あまり変わらない。\n"
            "その偏りに理由があると知ったとき、\n"
            "少しだけ、頭の中が静かになった。"
        ),

        # ── territory: beard-body-hair（髭と体毛）──
        "beard-body-hair": (
            "剃ると濃くなる、と信じていた時期がある。\n\n"
            "本当にそうなのか。\n"
            "それとも、そう見えているだけなのか。\n\n"
            "答えを知ったとき、\n"
            "毎朝の手入れが、少しだけ変わった。"
        ),

        # ── territory: face-impression（顔の印象）──
        "face-impression": (
            "顔の印象は、\n"
            "造作で決まると思っていた。\n\n"
            "でも、変えられないものより、\n"
            "整えられるもののほうが、\n"
            "印象を動かしているらしい。\n\n"
            "その境界がどこにあるのか、知りたかった。"
        ),

        # ── territory: mind-awareness（心と自意識）──
        "mind-awareness": (
            "気にする癖は、\n"
            "弱さではなくて学習だと、\n"
            "どこかで読んだことがある。\n\n"
            "一度気になったことは、\n"
            "気にならなかったころには戻れない。\n\n"
            "ただ、気にしたまま、\n"
            "歩き方を変えることはできる。"
        ),
        "mind-awareness_2": (
            "自分の見た目を気にすることを、\n"
            "「気にしすぎ」と言われた時期がある。\n\n"
            "でも、気にしている本人にとっては、\n"
            "それが毎朝のことだった。"
        ),

        # ── gift: 贈り手（灯）の視点。売らない。気づきから診断へ ──
        # gift-notice（大切な人の変化に気づいた）
        "gift-notice": (
            "彼が、洗面所にいる時間が、\n"
            "少しだけ長くなった。\n\n"
            "鏡の前で、何かを確かめている。\n"
            "気づかないふりをした。"
        ),
        "gift-notice_2": (
            "写真の中の彼が、\n"
            "少しうつむいて見えた。\n\n"
            "指摘はしなかった。\n"
            "ただ、その横顔を、覚えておこうと思った。"
        ),

        # gift-not-saying（言えずにいる気遣い）
        "gift-not-saying": (
            "気になっていることは、\n"
            "たぶん本人が一番わかっている。\n\n"
            "だから、何も言わなかった。\n"
            "ただ、整えるきっかけだけは、\n"
            "そっと置いておきたかった。"
        ),

        # gift-quiet-care（押し付けない贈り物）
        "gift-quiet-care": (
            "直してほしいわけじゃない。\n\n"
            "ただ、その人が鏡の前で\n"
            "少し迷う時間を、\n"
            "軽くできたらと思っただけ。"
        ),

        # gift-first-impression（第一印象を整える贈り物）
        "gift-first-impression": (
            "第一印象は、\n"
            "生まれ持った造作で決まると思っていた。\n\n"
            "でも、変えられないものより、\n"
            "整えられるものの方が、\n"
            "相手の印象を動かしているらしい。\n\n"
            "その人にも、知ってほしかった。"
        ),
        "gift-first-impression_2": (
            "清潔感は、生まれつきだと思っていた。\n\n"
            "でも、整えられる部分の方が大きいと知ってから、\n"
            "その人の見え方が、少し変わって見えた。"
        ),

        # gift-diagnosis（自分を知る時間を贈る）
        "gift-diagnosis": (
            "何かを変えたいわけじゃなくて、\n"
            "今の自分を、責めずに知る。\n\n"
            "そういう時間を、\n"
            "贈り物にできたらと思った。"
        ),

        # gift-occasion（節目に渡す贈り物）
        "gift-occasion": (
            "記念日に、物を贈るのもいい。\n\n"
            "でも今年は、\n"
            "その人が自分の印象と向き合う時間を、\n"
            "そっと渡してみようと思う。"
        ),
    }

    # パターンに一致するテンプレートを探す（完全一致優先→部分一致→ランダム）
    text = mock_templates.get(pattern)
    if not text:
        for key, template in mock_templates.items():
            if key in pattern or pattern in key:
                text = template
                break
    if not text:
        text = random.choice(list(mock_templates.values()))

    # Nagi はハッシュタグを一切使わない
    return text


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
