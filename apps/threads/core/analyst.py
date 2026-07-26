"""
Analyst - バズ分析エージェント
投稿パフォーマンスを分析し、バズスコア・ソースタイプ・構文パターン別の
効果測定と改善提案を行う。
"""

import json
import logging
from datetime import datetime
from pathlib import Path

from core.config import atomic_write_json, safe_load_json

from core.fetcher import get_user_threads, get_thread_insights

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ANALYSIS_FILE = DATA_DIR / "analysis.json"


def analyze_recent_posts(user_id: str = "me", limit: int = 25, history: list | None = None) -> dict:
    """直近の投稿を分析し、パフォーマンスサマリーを返す。

    history: writer.load_history()のリストを渡すとバズスコア分析も実施。
    """
    threads = get_user_threads(user_id, limit)

    if not threads:
        return {"status": "no_data", "message": "投稿データがありません"}

    total_likes = 0
    total_replies = 0
    best_post = None
    best_likes = -1

    for thread in threads:
        likes = thread.get("like_count", 0)
        replies = thread.get("reply_count", 0)
        total_likes += likes
        total_replies += replies

        if likes > best_likes:
            best_likes = likes
            best_post = thread

    count = len(threads)
    summary = {
        "analyzed_at": datetime.now().isoformat(),
        "post_count": count,
        "total_likes": total_likes,
        "total_replies": total_replies,
        "avg_likes": round(total_likes / count, 1) if count else 0,
        "avg_replies": round(total_replies / count, 1) if count else 0,
        "best_post": {
            "id": best_post.get("id"),
            "text": best_post.get("text", "")[:100],
            "likes": best_likes,
        } if best_post else None,
    }

    # バズスコア・ソースタイプ分析（history提供時）
    if history:
        buzz_analysis = analyze_buzz_effectiveness(history)
        summary["buzz_analysis"] = buzz_analysis

    return summary


def analyze_buzz_effectiveness(history: list[dict]) -> dict:
    """バズスコア・ソースタイプ別の効果を分析する。

    Returns: {
        "avg_buzz_score": float,
        "source_type_performance": {ソースタイプ: {count, avg_likes, avg_score}},
        "high_score_hit_rate": float,  # スコア7+で実際にバズった割合
    }
    """
    if not history:
        return {}

    scored = [p for p in history if p.get("buzz_score")]
    if not scored:
        return {"avg_buzz_score": 0, "source_type_performance": {}, "high_score_hit_rate": 0}

    # 全体の平均バズスコア
    avg_score = sum(p["buzz_score"] for p in scored) / len(scored)

    # ソースタイプ別パフォーマンス
    by_source: dict[str, list] = {}
    for p in scored:
        st = p.get("source_type", "original")
        by_source.setdefault(st, []).append(p)

    source_perf = {}
    for st, posts in by_source.items():
        likes_list = [p.get("likes", 0) for p in posts]
        scores = [p.get("buzz_score", 0) for p in posts]
        source_perf[st] = {
            "count": len(posts),
            "avg_likes": round(sum(likes_list) / len(likes_list), 1) if likes_list else 0,
            "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
        }

    # 高スコア(7+)投稿の実際のバズ率
    high_score = [p for p in scored if p["buzz_score"] >= 7]
    if high_score:
        all_likes = [p.get("likes", 0) for p in scored if p.get("likes", 0) > 0]
        avg_likes = sum(all_likes) / len(all_likes) if all_likes else 0
        actually_viral = sum(1 for p in high_score if p.get("likes", 0) >= avg_likes * 1.5)
        hit_rate = round(actually_viral / len(high_score) * 100, 1)
    else:
        hit_rate = 0

    return {
        "avg_buzz_score": round(avg_score, 1),
        "source_type_performance": source_perf,
        "high_score_hit_rate": hit_rate,
    }


def classify_post_performance(post: dict, avg_likes: float) -> str:
    """投稿のパフォーマンスをランク分けする"""
    likes = post.get("like_count", 0)

    if likes >= avg_likes * 3:
        return "viral"
    elif likes >= avg_likes * 1.5:
        return "good"
    elif likes >= avg_likes * 0.5:
        return "average"
    else:
        return "low"


def save_analysis(summary: dict) -> None:
    """分析結果を保存"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    history = safe_load_json(ANALYSIS_FILE, [])

    history.append(summary)

    # 直近30件の分析のみ保持
    history = history[-30:]

    atomic_write_json(ANALYSIS_FILE, history)
    logger.info("Analysis saved: %d likes avg", summary.get("avg_likes", 0))


def get_improvement_suggestions(summary: dict) -> list[str]:
    """分析結果から改善提案を生成（バズ分析対応）"""
    suggestions = []

    avg_likes = summary.get("avg_likes", 0)
    avg_replies = summary.get("avg_replies", 0)

    if avg_likes < 5:
        suggestions.append("いいね数が少ないです。フック（1行目）を強化しましょう。")

    if avg_replies < 1:
        suggestions.append("リプライが少ないです。問いかけ型の構文を増やしましょう。")

    if summary.get("post_count", 0) < 10:
        suggestions.append("投稿数が少ないです。まず量を確保しましょう。")

    best = summary.get("best_post")
    if best and best.get("likes", 0) >= avg_likes * 3:
        suggestions.append(
            f"バズ投稿あり！類似テーマで横展開を検討: {best['text'][:50]}..."
        )

    # バズ分析からの提案
    buzz = summary.get("buzz_analysis", {})
    if buzz:
        avg_score = buzz.get("avg_buzz_score", 0)
        if avg_score < 7:
            suggestions.append(
                f"平均バズスコアが{avg_score}と低めです。元ネタの選定基準を上げましょう。"
            )

        hit_rate = buzz.get("high_score_hit_rate", 0)
        if hit_rate < 30 and avg_score >= 7:
            suggestions.append(
                f"高スコア投稿の実バズ率が{hit_rate}%です。"
                f"自己採点の精度向上が必要かもしれません。"
            )

        # ソースタイプ別の提案
        source_perf = buzz.get("source_type_performance", {})
        if source_perf:
            best_source = max(source_perf.items(),
                              key=lambda x: x[1].get("avg_likes", 0), default=None)
            if best_source:
                suggestions.append(
                    f"最もバズりやすいソース: {best_source[0]} "
                    f"(平均{best_source[1]['avg_likes']}いいね)。このソースを増やしましょう。"
                )

    return suggestions
