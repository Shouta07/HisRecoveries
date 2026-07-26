"""
Poster - Threads API投稿エージェント
実際のThreads Graph API仕様に準拠した投稿処理。
ランダム待機・リトライ・トークン自動更新を含む。
"""

import json
import logging
import os
import random
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

from core.config import get_account_env

logger = logging.getLogger(__name__)

THREADS_API_BASE = "https://graph.threads.net/v1.0"
MAX_RETRIES = 3
RETRY_BASE_WAIT = 2  # 秒（指数バックオフの基底）

# 後方互換: set_current_account() は非推奨。account_id引数を直接渡すこと。
_current_account_id: str = ""


def set_current_account(account_id: str) -> None:
    """非推奨: 後方互換用。新コードではaccount_id引数を直接渡すこと。

    グローバル状態はマルチアカウント並行実行時にレースコンディションを起こすため、
    関数引数でaccount_idを渡す方式に移行する。
    """
    global _current_account_id
    _current_account_id = account_id


def _get_access_token(account_id: str = "") -> str:
    """アカウントIDに紐づくアクセストークンを取得する。

    優先順位: 引数account_id > グローバル_current_account_id > 環境変数
    """
    aid = account_id or _current_account_id
    if aid:
        token = get_account_env("THREADS_ACCESS_TOKEN", aid)
    else:
        token = os.getenv("THREADS_ACCESS_TOKEN", "")
    if not token:
        raise ValueError("THREADS_ACCESS_TOKEN is not set")
    return token


def get_user_id(account_id: str = "") -> str:
    """アカウント別のTHREADS_USER_IDを取得"""
    aid = account_id or _current_account_id
    if aid:
        return get_account_env("THREADS_USER_ID", aid) or "me"
    return os.getenv("THREADS_USER_ID", "me")


def _api_request(
    method: str, endpoint: str, params: dict | None = None,
    account_id: str = "",
) -> dict:
    """Threads APIへの汎用リクエスト（リトライ付き）"""
    token = _get_access_token(account_id)
    params = params or {}
    params["access_token"] = token

    url = f"{THREADS_API_BASE}/{endpoint}"

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            if method == "GET":
                query = urllib.parse.urlencode(params)
                req = urllib.request.Request(f"{url}?{query}")
            else:
                # Threads APIはPOSTもクエリパラメータで送る
                query = urllib.parse.urlencode(params)
                req = urllib.request.Request(
                    f"{url}?{query}", data=b"", method="POST"
                )

            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())

        except urllib.error.HTTPError as e:
            body = e.read().decode()
            logger.error(
                "API error %d (attempt %d/%d): %s",
                e.code, attempt, MAX_RETRIES, body,
            )
            last_error = e

            # 429 Too Many Requests or 5xx → リトライ
            if e.code in (429, 500, 502, 503) and attempt < MAX_RETRIES:
                wait = RETRY_BASE_WAIT ** attempt
                logger.info("Retrying in %d sec...", wait)
                time.sleep(wait)
                continue
            raise

        except urllib.error.URLError as e:
            logger.error(
                "Network error (attempt %d/%d): %s",
                attempt, MAX_RETRIES, e.reason,
            )
            last_error = e
            if attempt < MAX_RETRIES:
                wait = RETRY_BASE_WAIT ** attempt
                time.sleep(wait)
                continue
            raise

    raise last_error  # type: ignore[misc]


def random_wait(min_sec: int = 30, max_sec: int = 120) -> None:
    """ボット検知回避のためのランダム待機"""
    wait_time = random.randint(min_sec, max_sec)
    logger.info("Waiting %d seconds before posting...", wait_time)
    time.sleep(wait_time)


def check_approval_required(persona: dict) -> bool:
    """投稿が承認制かどうかを判定する。

    automated投稿でimmediate_posting_forbiddenがTrueの場合、
    即時投稿を遮断する（下書きストック→人間レビュー→承認後に投稿）。
    """
    posting = persona.get("posting", {})
    automated = posting.get("posting_types", {}).get("automated", {})
    return automated.get("immediate_posting_forbidden", False)


def create_thread_post(
    user_id: str,
    text: str,
    wait: bool = True,
    link_attachment: str | None = None,
    account_id: str = "",
    persona: dict | None = None,
    reply_to_id: str | None = None,
) -> dict | None:
    """
    Threads APIで投稿を作成する（2段階プロセス）
    1. メディアコンテナを作成
    2. コンテナを公開

    link_attachment: 投稿にリンクプレビューを付与するURL
    reply_to_id: 指定すると、そのスレッドへの返信として投稿する（連投用）
    """
    if wait:
        random_wait()

    # Step 1: メディアコンテナ作成
    logger.info("Creating media container...")
    container_params = {
        "media_type": "TEXT",
        "text": text,
    }
    if link_attachment:
        container_params["link_attachment"] = link_attachment
    if reply_to_id:
        container_params["reply_to_id"] = reply_to_id

    container = _api_request("POST", f"{user_id}/threads", container_params, account_id=account_id)

    container_id = container.get("id")
    if not container_id:
        logger.error("Failed to create container: %s", container)
        return None

    # コンテナ処理待ち（Threads APIの推奨）
    time.sleep(5)

    # Step 2: ステータス確認ループ
    for _ in range(10):
        status = _api_request("GET", container_id, {"fields": "status"}, account_id=account_id)
        if status.get("status") == "FINISHED":
            break
        if status.get("status") == "ERROR":
            logger.error("Container error: %s", status)
            return None
        time.sleep(2)

    # Step 3: 公開
    logger.info("Publishing thread %s...", container_id)
    result = _api_request("POST", f"{user_id}/threads_publish", {
        "creation_id": container_id,
    }, account_id=account_id)

    thread_id = result.get("id")
    if thread_id:
        logger.info("Posted successfully: %s", thread_id)
        return {
            "thread_id": thread_id,
            "text": text,
            "posted_at": datetime.now().isoformat(),
        }

    logger.error("Publish failed: %s", result)
    return None


def create_thread_chain(
    user_id: str,
    posts: list[str],
    account_id: str = "",
    persona: dict | None = None,
    link_attachment_last: str | None = None,
) -> dict | None:
    """連投（スレッド）を投稿する。

    1投目を通常投稿し、以降を直前の投稿への返信として連結する。
    link_attachment_last: 最終投稿にだけリンクプレビューを付ける場合のURL。

    Returns: {"thread_id": 先頭投稿ID, "reply_ids": [...], "posts": [...]} or None
    """
    if not posts:
        logger.error("create_thread_chain: posts is empty")
        return None

    # 1投目（先頭。ボット検知回避のため待機する）
    first = create_thread_post(
        user_id=user_id, text=posts[0], wait=True,
        account_id=account_id, persona=persona,
    )
    if not first or not first.get("thread_id"):
        logger.error("create_thread_chain: failed to post head")
        return None

    head_id = first["thread_id"]
    prev_id = head_id
    reply_ids: list[str] = []

    # 2投目以降は直前への返信として連結
    for idx, text in enumerate(posts[1:], start=2):
        is_last = idx == len(posts)
        link = link_attachment_last if is_last else None
        # 連投の各返信は短い待機で十分（先頭ほど長く待たない）
        res = create_thread_post(
            user_id=user_id, text=text, wait=False,
            account_id=account_id, persona=persona,
            reply_to_id=prev_id, link_attachment=link,
        )
        if not res or not res.get("thread_id"):
            logger.error(
                "create_thread_chain: failed at post %d/%d. "
                "Head posted but chain incomplete.",
                idx, len(posts),
            )
            break
        prev_id = res["thread_id"]
        reply_ids.append(prev_id)
        # API負荷とレート制限に配慮した小休止
        time.sleep(random.randint(8, 20))

    logger.info(
        "Thread chain posted: head=%s, replies=%d/%d",
        head_id, len(reply_ids), len(posts) - 1,
    )
    return {
        "thread_id": head_id,
        "reply_ids": reply_ids,
        "posts": posts,
        "posted_at": datetime.now().isoformat(),
    }


def refresh_long_lived_token() -> str | None:
    """
    短命トークンを長命トークン（60日）に交換する。
    成功したら新トークンを返す。.envの手動更新が必要。
    """
    token = _get_access_token()
    app_secret = os.getenv("THREADS_APP_SECRET", "")
    if not app_secret:
        logger.warning("THREADS_APP_SECRET not set, cannot refresh token")
        return None

    try:
        params = urllib.parse.urlencode({
            "grant_type": "th_exchange_token",
            "client_secret": app_secret,
            "access_token": token,
        })
        url = f"https://graph.threads.net/access_token?{params}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())

        new_token = data.get("access_token")
        expires_in = data.get("expires_in", 0)
        if new_token:
            logger.info(
                "Token refreshed. Expires in %d days.",
                expires_in // 86400,
            )
            return new_token

    except Exception as e:
        logger.error("Token refresh failed: %s", e)

    return None


def refresh_existing_long_lived_token() -> str | None:
    """
    既存の長命トークンを更新する（有効期限が残っている場合のみ可能）。
    """
    token = _get_access_token()

    try:
        params = urllib.parse.urlencode({
            "grant_type": "th_refresh_token",
            "access_token": token,
        })
        url = f"https://graph.threads.net/refresh_access_token?{params}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())

        new_token = data.get("access_token")
        if new_token:
            logger.info("Long-lived token refreshed successfully.")
            return new_token

    except Exception as e:
        logger.error("Token refresh failed: %s", e)

    return None
