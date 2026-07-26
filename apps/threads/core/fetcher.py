"""
Fetcher - データ取得エージェント
Threads APIからアカウント情報・投稿データを取得する。
リトライ付きの実運用対応版。
"""

import json
import logging
import os
import time
import urllib.parse
import urllib.request
import urllib.error

from core.config import get_account_env

logger = logging.getLogger(__name__)

THREADS_API_BASE = "https://graph.threads.net/v1.0"
MAX_RETRIES = 3
RETRY_BASE_WAIT = 2


def _get_access_token(account_id: str = "") -> str:
    if account_id:
        token = get_account_env("THREADS_ACCESS_TOKEN", account_id)
    else:
        token = os.getenv("THREADS_ACCESS_TOKEN", "")
    if not token:
        raise ValueError("THREADS_ACCESS_TOKEN is not set")
    return token


def _api_get(
    endpoint: str, params: dict | None = None, account_id: str = "",
) -> dict:
    """Threads APIへのGETリクエスト（リトライ付き）"""
    token = _get_access_token(account_id)
    query_params = {"access_token": token}
    if params:
        query_params.update(params)

    query = urllib.parse.urlencode(query_params)
    url = f"{THREADS_API_BASE}/{endpoint}?{query}"

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            logger.error(
                "API error %d (attempt %d/%d): %s",
                e.code, attempt, MAX_RETRIES, body,
            )
            last_error = e
            if e.code in (429, 500, 502, 503) and attempt < MAX_RETRIES:
                time.sleep(RETRY_BASE_WAIT ** attempt)
                continue
            raise
        except urllib.error.URLError as e:
            logger.error(
                "Network error (attempt %d/%d): %s",
                attempt, MAX_RETRIES, e.reason,
            )
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BASE_WAIT ** attempt)
                continue
            raise

    raise last_error  # type: ignore[misc]


def get_user_profile(user_id: str = "me", account_id: str = "") -> dict:
    """ユーザープロフィールを取得"""
    return _api_get(user_id, {
        "fields": "id,username,name,threads_profile_picture_url,threads_biography",
    }, account_id=account_id)


def get_user_threads(
    user_id: str = "me", limit: int = 25, account_id: str = "",
) -> list:
    """ユーザーの投稿一覧を取得"""
    data = _api_get(
        f"{user_id}/threads",
        {
            "fields": "id,text,timestamp,like_count,reply_count,is_quote_post",
            "limit": str(limit),
        },
        account_id=account_id,
    )
    return data.get("data", [])


def get_thread_insights(thread_id: str, account_id: str = "") -> dict:
    """個別投稿のインサイトを取得"""
    return _api_get(
        f"{thread_id}/insights",
        {"metric": "views,likes,replies,reposts,quotes"},
        account_id=account_id,
    )


def get_user_insights(
    user_id: str = "me", period: str = "day", account_id: str = "",
) -> dict:
    """ユーザーレベルのインサイトを取得"""
    return _api_get(
        f"{user_id}/threads_insights",
        {
            "metric": "views,likes,replies,reposts,quotes,followers_count",
            "period": period,
        },
        account_id=account_id,
    )


def get_all_threads_paginated(
    user_id: str = "me", max_pages: int = 5, account_id: str = "",
) -> list:
    """ページネーション対応で全投稿を取得"""
    all_threads = []
    params = {
        "fields": "id,text,timestamp,like_count,reply_count",
        "limit": "50",
    }

    for _ in range(max_pages):
        data = _api_get(f"{user_id}/threads", params, account_id=account_id)
        threads = data.get("data", [])
        all_threads.extend(threads)

        # 次のページ
        paging = data.get("paging", {})
        next_cursor = paging.get("cursors", {}).get("after")
        if not next_cursor or not threads:
            break
        params["after"] = next_cursor

    return all_threads
