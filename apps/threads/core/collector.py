"""
Collector — 投稿成果回収エージェント
投稿後24時間以上経過した投稿のエンゲージメントデータを
Threads APIから取得し、history.jsonとGoogle Sheetsに記録する。

毎朝1回 GitHub Actions で実行。
"""

import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path

from core.config import safe_load_json, atomic_write_json, get_account_env
from core.fetcher import (
    get_user_threads, get_thread_insights, get_all_threads_paginated,
)

logger = logging.getLogger(__name__)


def import_history(
    account_dir: Path, account_id: str = "", max_pages: int = 10,
    with_insights: bool = True,
) -> int:
    """Threadsアカウントの過去投稿を全件取り込み、history.jsonに統合する。

    既存システムが記録していない過去投稿（手動投稿・旧運用分も含む）を
    APIから取得し、閲覧数などの分析対象にできるようにする。
    トークンが必要なため Actions / CLI で実行する。

    Returns: 新規取り込み件数
    """
    from core.poster import get_user_id

    user_id = get_user_id(account_id=account_id)
    threads = get_all_threads_paginated(user_id, max_pages=max_pages, account_id=account_id)
    logger.info("Fetched %d threads from API", len(threads))

    history_path = account_dir / "history.json"
    data = safe_load_json(history_path, {"posts": [], "last_posted_at": None, "total_count": 0})
    posts = data.get("posts", [])
    existing_ids = {p.get("thread_id") for p in posts if p.get("thread_id")}

    added = 0
    for t in threads:
        tid = t.get("id")
        if not tid or tid in existing_ids:
            continue
        entry = {
            "thread_id": tid,
            "text": t.get("text", ""),
            "posted_at": t.get("timestamp", ""),
            "source_type": "imported",
        }
        if with_insights:
            try:
                entry["metrics"] = _parse_insights(get_thread_insights(tid, account_id=account_id))
            except Exception as e:
                logger.warning("Insights failed for %s: %s", tid, e)
        posts.append(entry)
        existing_ids.add(tid)
        added += 1

    data["posts"] = posts
    data["total_count"] = len(posts)
    atomic_write_json(history_path, data)
    logger.info("Imported %d new posts (total now %d)", added, len(posts))
    return added


def collect_metrics(account_dir: Path, account_id: str = "", days_back: int = 3) -> list[dict]:
    """直近N日の投稿のエンゲージメントデータを取得する。

    Returns: 更新された投稿のリスト
    """
    history_path = account_dir / "history.json"
    history_data = safe_load_json(history_path, {"posts": [], "last_posted_at": None, "total_count": 0})
    posts = history_data.get("posts", [])

    if not posts:
        logger.info("No posts in history to collect metrics for")
        return []

    cutoff = datetime.now() - timedelta(days=days_back)
    updated = []

    for post in posts:
        # thread_idがないもの（dry_run等）はスキップ
        thread_id = post.get("thread_id", "")
        if not thread_id or thread_id == "dry_run":
            continue

        # 既に数値取得済みかチェック
        metrics = post.get("metrics", {})
        if metrics.get("impressions") is not None:
            continue

        # 投稿日時が範囲内かチェック
        posted_at = post.get("posted_at", "")
        if not posted_at:
            continue
        try:
            post_dt = datetime.fromisoformat(posted_at)
        except (ValueError, TypeError):
            continue
        if post_dt < cutoff:
            continue

        # 投稿後24時間以上経過しているかチェック
        if datetime.now() - post_dt < timedelta(hours=24):
            continue

        # Threads APIからインサイト取得
        try:
            insights = get_thread_insights(thread_id, account_id=account_id)
            parsed = _parse_insights(insights)
            post["metrics"] = parsed
            updated.append(post)
            logger.info("Collected metrics for %s: likes=%s saves=%s imp=%s",
                        thread_id,
                        parsed.get("likes"),
                        parsed.get("saves"),
                        parsed.get("impressions"))
        except Exception as e:
            logger.warning("Failed to collect metrics for %s: %s", thread_id, e)

    # history.jsonを更新
    if updated:
        atomic_write_json(history_path, history_data)
        logger.info("Updated metrics for %d posts", len(updated))

    return updated


def _parse_insights(insights: dict) -> dict:
    """Threads APIのインサイトレスポンスをパースする"""
    metrics = {
        "likes": None,
        "saves": None,
        "impressions": None,
        "replies": None,
        "reposts": None,
        "quotes": None,
        "save_rate": None,
        "collected_at": datetime.now().isoformat(),
    }

    data = insights.get("data", [])
    for item in data:
        name = item.get("name", "")
        values = item.get("values", [])
        value = values[0].get("value", 0) if values else item.get("total_value", {}).get("value", 0)

        if name == "likes":
            metrics["likes"] = value
        elif name == "views":
            metrics["impressions"] = value
        elif name == "replies":
            metrics["replies"] = value
        elif name == "reposts":
            metrics["reposts"] = value
        elif name == "quotes":
            metrics["quotes"] = value

    # 保存数はThreads APIに直接ないため、repliesで代替推定するか、手動入力
    # save_rateはimpressionがある場合に計算（saves確認後）

    if metrics["impressions"] and metrics["impressions"] > 0:
        if metrics["likes"] is not None:
            metrics["engagement_rate"] = round(
                (metrics["likes"] + (metrics["replies"] or 0) + (metrics["reposts"] or 0))
                / metrics["impressions"] * 100, 2
            )

    return metrics


def update_hypothesis_metrics(account_dir: Path, updated_posts: list[dict]) -> dict:
    """仮説ごとにメトリクスを集計する"""
    hypotheses_path = account_dir / "hypotheses.json"
    if not hypotheses_path.exists():
        return {}

    config = json.loads(hypotheses_path.read_text())
    history_data = safe_load_json(account_dir / "history.json", {"posts": []})
    all_posts = history_data.get("posts", [])

    results = {}
    for h in config.get("hypotheses", []):
        h_id = h["id"]
        h_posts = [p for p in all_posts
                    if p.get("hypothesis_id") == h_id
                    and p.get("metrics", {}).get("impressions") is not None]

        if not h_posts:
            continue

        impressions = [p["metrics"]["impressions"] for p in h_posts if p["metrics"].get("impressions")]
        likes = [p["metrics"]["likes"] for p in h_posts if p["metrics"].get("likes") is not None]
        replies = [p["metrics"]["replies"] for p in h_posts if p["metrics"].get("replies") is not None]

        total_imp = sum(impressions) if impressions else 0
        total_likes = sum(likes) if likes else 0
        total_replies = sum(replies) if replies else 0

        results[h_id] = {
            "name": h["name"],
            "posts_measured": len(h_posts),
            "total_impressions": total_imp,
            "total_likes": total_likes,
            "total_replies": total_replies,
            "avg_impressions": round(total_imp / len(h_posts)) if h_posts else 0,
            "avg_likes": round(total_likes / len(h_posts), 1) if h_posts else 0,
            "avg_replies": round(total_replies / len(h_posts), 1) if h_posts else 0,
            "engagement_rate": round(
                (total_likes + total_replies) / total_imp * 100, 2
            ) if total_imp > 0 else 0,
        }

    # CTA別集計
    cta_results = {}
    for variant in ["none", "profile_nudge", "assessment", "dm_invite"]:
        v_posts = [p for p in all_posts
                   if p.get("cta_variant") == variant
                   and p.get("metrics", {}).get("impressions") is not None]
        if not v_posts:
            continue

        imp = sum(p["metrics"]["impressions"] for p in v_posts if p["metrics"].get("impressions"))
        lks = sum(p["metrics"]["likes"] for p in v_posts if p["metrics"].get("likes") is not None)

        cta_results[variant] = {
            "posts_measured": len(v_posts),
            "total_impressions": imp,
            "engagement_rate": round((lks) / imp * 100, 2) if imp > 0 else 0,
        }

    # 結果を保存
    results_path = Path(__file__).resolve().parent.parent / "data"
    results_path.mkdir(parents=True, exist_ok=True)
    output = {
        "collected_at": datetime.now().isoformat(),
        "hypotheses": results,
        "cta_variants": cta_results,
    }
    atomic_write_json(results_path / "hypothesis_results.json", output)
    logger.info("Hypothesis metrics updated: %d hypotheses, %d CTA variants",
                len(results), len(cta_results))

    return results


def run_collection(account_id: str = "mens-body-lab", days_back: int = 3) -> None:
    """成果回収の全フローを実行する"""
    from core.config import ACCOUNTS_DIR

    account_dir = ACCOUNTS_DIR / account_id
    logger.info("=== Collecting metrics for %s (last %d days) ===", account_id, days_back)

    updated = collect_metrics(account_dir, account_id=account_id, days_back=days_back)
    logger.info("Collected metrics for %d posts", len(updated))

    if updated:
        results = update_hypothesis_metrics(account_dir, updated)
        for h_id, data in results.items():
            logger.info("  %s: %d posts, avg_imp=%d, avg_likes=%.1f, eng=%.2f%%",
                        h_id, data["posts_measured"], data["avg_impressions"],
                        data["avg_likes"], data["engagement_rate"])

    # トレンド分析（伸びてる投稿の構造を解析してDBに蓄積）
    try:
        from core.researcher import collect_viral_posts, load_viral_posts
        from core.trend_analyzer import analyze_trending_posts
        from core.writer import load_persona

        persona = load_persona(account_dir)
        rss_feeds_path = account_dir / "rss_feeds.json"
        rss_feeds = []
        if rss_feeds_path.exists():
            rss_feeds = json.loads(rss_feeds_path.read_text()).get("feeds", [])

        viral = collect_viral_posts(account_dir, persona, rss_feeds, account_id=account_id)
        if viral:
            analyses = analyze_trending_posts(viral, account_id=account_id, max_to_analyze=10)
            logger.info("Trend analysis: analyzed %d posts", len(analyses))
    except Exception as e:
        logger.debug("Trend analysis skipped: %s", e)

    # Google Sheets連携（設定されていれば）
    try:
        from core.sheets import is_sheets_configured, record_posted
        if is_sheets_configured():
            for post in updated:
                record_posted(post)
            logger.info("Recorded %d posts to Google Sheets", len(updated))
    except Exception as e:
        logger.debug("Sheets recording skipped: %s", e)
