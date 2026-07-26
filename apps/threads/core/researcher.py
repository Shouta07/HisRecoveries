"""
Researcher - バズ投稿収集エージェント
ジャンルごとにバズった投稿を発見し、リライト元ネタを提供する。

収集ソース:
1. 競合Threadsアカウントの高エンゲージメント投稿（Threads API）
2. Google News RSSからのトレンドネタ
3. 自アカウントの過去バズ投稿（バズピボット用）

テーマツリーで偏りを防止し、バランスの取れたネタ供給を実現。
"""

import json
import logging
import random
import urllib.parse
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

from core.config import atomic_write_json, safe_load_json, get_account_env

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
TOPICS_FILE = DATA_DIR / "topics.json"
VIRAL_POSTS_FILE = DATA_DIR / "viral_posts.json"

# バズ判定の閾値（平均のN倍以上でバズ認定）
VIRAL_MULTIPLIER = 2.0


def fetch_keyword_viral_posts(
    keywords: list[str],
    account_id: str = "",
    min_likes: int = 10,
    max_per_keyword: int = 10,
) -> list[dict]:
    """キーワード検索でThreads上のバズ投稿を収集する。

    注意: threads_keyword_search 権限は Meta App Review が必須。
    未承認の場合は空リストを返し、RSSフォールバックに任せる。
    承認済みの場合のみAPIを呼び出す。
    """
    # App Review承認済みかどうかを環境変数でチェック
    import os
    if not os.getenv("THREADS_KEYWORD_SEARCH_APPROVED", ""):
        logger.info("Keyword search skipped: THREADS_KEYWORD_SEARCH_APPROVED not set. "
                     "This requires Meta App Review. Using RSS fallback instead.")
        return []

    import time

    viral_posts = []

    for keyword in keywords:
        try:
            token = get_account_env("THREADS_ACCESS_TOKEN", account_id)
            if not token:
                token = os.getenv("THREADS_ACCESS_TOKEN", "")
            if not token:
                logger.warning("No access token available for keyword search")
                return []

            params = urllib.parse.urlencode({
                "q": keyword,
                "fields": "id,text,username,timestamp,like_count,reply_count",
                "access_token": token,
            })
            url = f"https://graph.threads.net/v1.0/threads_search?{params}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())

            posts = data.get("data", [])
            if not posts:
                continue

            for post in posts:
                likes = post.get("like_count", 0)
                if likes >= min_likes and post.get("text"):
                    viral_posts.append({
                        "text": post["text"],
                        "likes": likes,
                        "replies": post.get("reply_count", 0),
                        "keyword": keyword,
                        "source_type": "keyword_search",
                        "collected_at": datetime.now().isoformat(),
                    })

            time.sleep(2)

        except Exception as e:
            logger.warning("Keyword search failed '%s': %s", keyword, e)
            continue

    result = []
    by_keyword: dict[str, list] = {}
    for p in viral_posts:
        kw = p["keyword"]
        by_keyword.setdefault(kw, []).append(p)
    for kw, posts in by_keyword.items():
        posts.sort(key=lambda x: x["likes"], reverse=True)
        result.extend(posts[:max_per_keyword])

    return result


def fetch_own_viral_posts(
    account_dir: Path,
    min_engagement_ratio: float = 2.0,
) -> list[dict]:
    """自アカウントの過去投稿からバズったものを抽出（バズピボット用）。

    history.jsonからエンゲージメントが高い投稿を取得。
    """
    history_path = account_dir / "history.json"
    data = safe_load_json(history_path, {"posts": []})
    posts = data.get("posts", [])

    if not posts:
        return []

    # likes情報がある投稿のみ
    with_metrics = [p for p in posts if p.get("likes", 0) > 0 or p.get("like_count", 0) > 0]
    if not with_metrics:
        return []

    likes_list = [p.get("likes", p.get("like_count", 0)) for p in with_metrics]
    avg_likes = sum(likes_list) / len(likes_list) if likes_list else 0
    threshold = avg_likes * min_engagement_ratio

    viral = []
    for post in with_metrics:
        likes = post.get("likes", post.get("like_count", 0))
        if likes >= threshold:
            viral.append({
                "text": post.get("text", ""),
                "likes": likes,
                "replies": post.get("replies", post.get("reply_count", 0)),
                "source_type": "own_viral",
                "collected_at": datetime.now().isoformat(),
            })

    viral.sort(key=lambda x: x["likes"], reverse=True)
    return viral[:20]


def fetch_trending_from_rss(feed_url: str) -> list[dict]:
    """RSSフィードからトレンド情報を取得（簡易パーサー）"""
    try:
        safe_url = urllib.parse.quote(feed_url, safe=":/?=&+")
        req = urllib.request.Request(
            safe_url,
            headers={"User-Agent": "ThreadsCEO/1.0"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode()

        items = []
        for block in content.split("<item>")[1:]:
            title = _extract_tag(block, "title")
            link = _extract_tag(block, "link")
            if title:
                items.append({"title": title, "link": link, "source": feed_url})
        return items

    except (urllib.error.URLError, Exception) as e:
        logger.warning("RSS fetch failed (%s): %s", feed_url, e)
        return []


def _extract_tag(xml: str, tag: str) -> str:
    """XMLタグの中身を簡易抽出"""
    start = xml.find(f"<{tag}>")
    end = xml.find(f"</{tag}>")
    if start == -1 or end == -1:
        return ""
    return xml[start + len(tag) + 2 : end].strip()


def collect_viral_posts(
    account_dir: Path,
    persona: dict,
    rss_feeds: list[str],
    account_id: str = "",
) -> list[dict]:
    """全ソースからバズ投稿を収集し、テーマバランスを考慮して返す。

    優先順位:
    1. キーワード検索によるバズ投稿（最も価値が高い）
    2. 自アカウントの過去バズ投稿（バズピボット）
    3. RSSトレンドネタ（補助）
    """
    all_viral: list[dict] = []

    # 1. キーワード検索でバズ投稿を収集
    search_keywords = persona.get("viral_sources", {}).get("search_keywords", [])
    if not search_keywords:
        # search_keywordsが未設定の場合、theme_treeやgenreから自動生成
        theme_tree = persona.get("viral_sources", {}).get("theme_tree", [])
        genre = persona.get("genre", "")
        if theme_tree:
            search_keywords = theme_tree[:5]
        elif genre:
            search_keywords = [kw for kw in genre.replace("・", " ").replace("／", " ").split() if kw]

    if search_keywords:
        try:
            keyword_viral = fetch_keyword_viral_posts(
                search_keywords, account_id=account_id,
            )
            all_viral.extend(keyword_viral)
            logger.info("Collected %d viral posts from %d keywords",
                        len(keyword_viral), len(search_keywords))
        except Exception as e:
            logger.warning("Keyword search failed (non-fatal): %s", e)

    # 2. 自アカウントのバズ投稿（バズピボット用）
    try:
        own_viral = fetch_own_viral_posts(account_dir)
        all_viral.extend(own_viral)
        logger.info("Collected %d own viral posts for pivot", len(own_viral))
    except Exception as e:
        logger.warning("Own viral fetch failed (non-fatal): %s", e)

    # 3. RSSからトレンドネタ（バズ投稿が少ない場合の補助）
    rss_topics = []
    if len(all_viral) < 5:
        genre = persona.get("genre", "")
        for feed in rss_feeds:
            items = fetch_trending_from_rss(feed)
            rss_topics.extend(items)
        # RSSネタをバズ投稿フォーマットに変換
        for item in rss_topics[:10]:
            all_viral.append({
                "text": item["title"],
                "likes": 0,
                "source_type": "rss_trend",
                "collected_at": datetime.now().isoformat(),
            })

    # テーマツリーによるバランス調整
    theme_tree = persona.get("viral_sources", {}).get("theme_tree", [])
    if theme_tree and all_viral:
        all_viral = _balance_by_theme(all_viral, theme_tree)

    return all_viral


def _balance_by_theme(
    posts: list[dict], theme_tree: list[str],
) -> list[dict]:
    """テーマツリーに基づいてバズ投稿を分散させる。

    同じテーマに偏らないよう、各テーマから均等に選択。
    """
    buckets: dict[str, list[dict]] = {theme: [] for theme in theme_tree}
    uncategorized: list[dict] = []

    for post in posts:
        text = post.get("text", "")
        matched = False
        for theme in theme_tree:
            if theme in text:
                buckets[theme].append(post)
                matched = True
                break
        if not matched:
            uncategorized.append(post)

    # 各テーマから均等に取得
    balanced: list[dict] = []
    max_per_theme = max(3, len(posts) // len(theme_tree)) if theme_tree else len(posts)
    for theme in theme_tree:
        theme_posts = buckets[theme]
        theme_posts.sort(key=lambda x: x.get("likes", 0), reverse=True)
        balanced.extend(theme_posts[:max_per_theme])

    # 未分類も追加
    balanced.extend(uncategorized[:5])

    return balanced


def save_viral_posts(posts: list[dict]) -> None:
    """収集したバズ投稿をファイルに保存"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "collected_at": datetime.now().isoformat(),
        "count": len(posts),
        "posts": posts[-200:],  # 最大200件保持
    }
    atomic_write_json(VIRAL_POSTS_FILE, payload)
    logger.info("Saved %d viral posts", len(posts))


def load_viral_posts() -> list[dict]:
    """保存済みバズ投稿を読み込む"""
    data = safe_load_json(VIRAL_POSTS_FILE, {"posts": []})
    return data.get("posts", [])


# 後方互換: 旧APIを維持
def collect_topics(rss_feeds: list[str], persona: dict) -> list[dict]:
    """後方互換用。collect_viral_postsへの移行を推奨。"""
    genre = persona.get("genre", "")
    all_items = []
    for feed in rss_feeds:
        items = fetch_trending_from_rss(feed)
        all_items.extend(items)
    keywords = genre.replace("・", " ").replace("／", " ").split()
    relevant = [
        item for item in all_items
        if any(kw in item.get("title", "") for kw in keywords)
    ]
    if len(relevant) < 5:
        remaining = [i for i in all_items if i not in relevant]
        random.shuffle(remaining)
        relevant.extend(remaining[: 5 - len(relevant)])
    return relevant


def save_topics(topics: list[dict]) -> None:
    """収集したネタをファイルに保存"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "collected_at": datetime.now().isoformat(),
        "count": len(topics),
        "topics": topics,
    }
    atomic_write_json(TOPICS_FILE, payload)
    logger.info("Saved %d topics", len(topics))


def load_topics() -> list[dict]:
    """保存済みネタを読み込む"""
    if not TOPICS_FILE.exists():
        return []
    data = json.loads(TOPICS_FILE.read_text())
    return data.get("topics", [])
