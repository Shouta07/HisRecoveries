"""
Trend Analyzer — 伸びてる投稿の構造分析エンジン
Threads上の伸びてる投稿を収集し、「なぜ伸びてるか」を解析する。

フロー:
1. キーワード検索で伸びてる投稿を収集
2. Gemini APIで構造分析（フック・展開・余韻・感情）
3. 分析結果をDBに蓄積
4. Writerが生成時に「伸びてる構造」を参照
"""

import json
import logging
import os
import random
from datetime import datetime
from pathlib import Path

from core.config import atomic_write_json, safe_load_json, get_account_env

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
TREND_ANALYSIS_FILE = DATA_DIR / "trend_analysis.json"
TREND_RAW_FILE = DATA_DIR / "trend_raw_posts.json"
MAX_ANALYSES = 500
MAX_RAW_POSTS = 2000


def analyze_trending_posts(
    viral_posts: list[dict],
    account_id: str = "",
    max_to_analyze: int = 10,
) -> list[dict]:
    """伸びてる投稿を構造分析する。

    各投稿の「なぜ伸びてるか」をGemini APIで解析し、
    フック・構造・感情・学べる要素を抽出する。
    """
    if not viral_posts:
        return []

    # 収集した全投稿を生データDBに保存
    _save_raw_posts(viral_posts)

    # いいね順にソート、上位を分析
    sorted_posts = sorted(viral_posts, key=lambda x: x.get("likes", 0), reverse=True)
    targets = sorted_posts[:max_to_analyze]

    gemini_key = get_account_env("GEMINI_API_KEY", account_id) if account_id else os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        logger.warning("GEMINI_API_KEY not set, skipping trend analysis")
        return _fallback_analysis(targets)

    analyses = []
    for post in targets:
        text = post.get("text", "")
        if not text or len(text) < 10:
            continue

        analysis = _analyze_single_post(text, post.get("likes", 0), gemini_key)
        if analysis:
            analysis["original_text"] = text[:300]
            analysis["likes"] = post.get("likes", 0)
            analysis["keyword"] = post.get("keyword", "")
            analysis["analyzed_at"] = datetime.now().isoformat()
            analyses.append(analysis)

    if analyses:
        _save_analyses(analyses)
        logger.info("Analyzed %d trending posts", len(analyses))

    return analyses


def _analyze_single_post(text: str, likes: int, gemini_key: str) -> dict | None:
    """1投稿をGemini APIで構造分析する"""
    import urllib.request

    prompt = f"""以下のThreads投稿が{likes}いいねを獲得しています。
なぜ伸びているか構造分析してください。

【投稿テキスト】
{text}

以下のJSON形式で回答してください。日本語で。説明不要、JSONのみ。

{{
  "hook": "1行目のフックの手法（例: 問いかけ、断言、共感、逆説）",
  "structure": "全体の構造（例: 問い→体験→気づき、断言→根拠→余韻）",
  "emotion": "読者が感じる感情（例: 共感、安心、発見、自己投影）",
  "topic": "テーマ（例: 清潔感、自信、孤独、習慣）",
  "length_type": "短文/中文/長文",
  "cta_presence": "CTAの有無と種類",
  "reusable_pattern": "His Recoveriesで再利用可能な構造パターンの説明",
  "suggested_template": "この構造を使ったHis Recoveries向けの投稿テンプレート（1行のみ）"
}}"""

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={gemini_key}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 500, "temperature": 0.3},
    }).encode()

    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        raw = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # JSONを抽出（```json ... ``` で囲まれている場合の対応）
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        logger.warning("Trend analysis failed for post: %s", e)
        return None


def _fallback_analysis(posts: list[dict]) -> list[dict]:
    """Gemini APIが使えない場合のフォールバック分析（基本的な統計のみ）"""
    analyses = []
    for post in posts:
        text = post.get("text", "")
        analyses.append({
            "original_text": text[:300],
            "likes": post.get("likes", 0),
            "keyword": post.get("keyword", ""),
            "analyzed_at": datetime.now().isoformat(),
            "hook": "不明（API未使用）",
            "structure": "不明",
            "emotion": "不明",
            "topic": post.get("keyword", ""),
            "length_type": "短文" if len(text) < 100 else ("中文" if len(text) < 300 else "長文"),
            "cta_presence": "不明",
            "reusable_pattern": "不明",
            "suggested_template": "",
        })
    return analyses


def _save_analyses(new_analyses: list[dict]) -> None:
    """分析結果をファイルに保存（蓄積型）"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    existing = safe_load_json(TREND_ANALYSIS_FILE, {"analyses": []})
    all_analyses = existing.get("analyses", [])
    all_analyses.extend(new_analyses)

    # 上限を超えたら古いものを削除
    all_analyses = all_analyses[-MAX_ANALYSES:]

    atomic_write_json(TREND_ANALYSIS_FILE, {
        "last_updated": datetime.now().isoformat(),
        "total_count": len(all_analyses),
        "analyses": all_analyses,
    })


def _save_raw_posts(posts: list[dict]) -> None:
    """収集した全投稿を生データDBに保存（蓄積型）"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    existing = safe_load_json(TREND_RAW_FILE, {"posts": []})
    all_posts = existing.get("posts", [])

    # 重複排除（テキストの先頭100文字で判定）
    existing_texts = {p.get("text", "")[:100] for p in all_posts}
    new_posts = []
    for p in posts:
        text_key = p.get("text", "")[:100]
        if text_key and text_key not in existing_texts:
            new_posts.append({
                "text": p.get("text", ""),
                "likes": p.get("likes", 0),
                "replies": p.get("replies", 0),
                "keyword": p.get("keyword", ""),
                "source_type": p.get("source_type", ""),
                "collected_at": datetime.now().isoformat(),
            })
            existing_texts.add(text_key)

    all_posts.extend(new_posts)
    all_posts = all_posts[-MAX_RAW_POSTS:]

    atomic_write_json(TREND_RAW_FILE, {
        "last_updated": datetime.now().isoformat(),
        "total_count": len(all_posts),
        "posts": all_posts,
    })

    if new_posts:
        logger.info("Saved %d new raw posts to trend DB (total: %d)",
                     len(new_posts), len(all_posts))


def load_raw_posts() -> list[dict]:
    """蓄積された生データ投稿を読み込む"""
    data = safe_load_json(TREND_RAW_FILE, {"posts": []})
    return data.get("posts", [])


def load_trend_analyses() -> list[dict]:
    """蓄積された分析結果を読み込む"""
    data = safe_load_json(TREND_ANALYSIS_FILE, {"analyses": []})
    return data.get("analyses", [])


def get_top_patterns(n: int = 5) -> list[dict]:
    """最もいいねが多い投稿の分析パターンを返す"""
    analyses = load_trend_analyses()
    if not analyses:
        return []
    sorted_a = sorted(analyses, key=lambda x: x.get("likes", 0), reverse=True)
    return sorted_a[:n]


def get_reusable_templates() -> list[str]:
    """再利用可能なテンプレートを抽出する"""
    analyses = load_trend_analyses()
    templates = []
    for a in analyses:
        t = a.get("suggested_template", "")
        if t and t != "不明":
            templates.append(t)
    return templates


def build_writer_context(max_patterns: int = 3) -> str:
    """Writerに渡すトレンド分析コンテキストを構築する。

    直近の伸びてる投稿の構造パターンをテキストで返す。
    Writerのプロンプトに注入して、投稿品質を向上させる。
    """
    top = get_top_patterns(max_patterns)
    if not top:
        return ""

    lines = ["【直近のThreadsトレンド分析（参考にすべき構造）】"]
    for i, a in enumerate(top):
        lines.append(f"\nトレンド#{i+1}（{a.get('likes', 0)}いいね）:")
        lines.append(f"  フック手法: {a.get('hook', '不明')}")
        lines.append(f"  構造: {a.get('structure', '不明')}")
        lines.append(f"  感情: {a.get('emotion', '不明')}")
        lines.append(f"  トピック: {a.get('topic', '不明')}")
        template = a.get('suggested_template', '')
        if template and template != '不明':
            lines.append(f"  テンプレート: {template}")

    lines.append("\n上記の構造を参考に、His Recoveriesのトーンで投稿を生成してください。")
    lines.append("ただしコピーは禁止。構造と感情の流れだけ参考にすること。")

    return "\n".join(lines)
