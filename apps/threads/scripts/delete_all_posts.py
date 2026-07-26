"""
@mens_body_lab の全投稿を一括削除するスクリプト。

使い方:
  1. .env に THREADS_ACCESS_TOKEN と THREADS_USER_ID を設定
  2. python scripts/delete_all_posts.py --dry-run  （確認のみ）
  3. python scripts/delete_all_posts.py              （実行）

必要な権限:
  - threads_basic
  - threads_content_publish
  - threads_delete（Meta App Review で追加申請が必要な場合あり）

API仕様（2025/3〜）:
  DELETE /{thread_id}?access_token=xxx
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

from pathlib import Path

# .env 読み込み
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

API_BASE = "https://graph.threads.net/v1.0"
MAX_RETRIES = 3
RETRY_WAIT = 5


def get_token():
    token = os.getenv("THREADS_ACCESS_TOKEN", "")
    if not token:
        print("ERROR: THREADS_ACCESS_TOKEN が設定されていません。")
        print("  .env ファイルに設定するか、環境変数で渡してください。")
        sys.exit(1)
    return token


def get_user_id():
    return os.getenv("THREADS_USER_ID", "me")


def api_get(endpoint, params=None):
    token = get_token()
    query = {"access_token": token}
    if params:
        query.update(params)
    url = f"{API_BASE}/{endpoint}?{urllib.parse.urlencode(query)}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def api_delete(thread_id):
    token = get_token()
    url = f"{API_BASE}/{thread_id}?{urllib.parse.urlencode({'access_token': token})}"
    req = urllib.request.Request(url, method="DELETE")

    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode()
            except Exception:
                pass
            if e.code == 429 and attempt < MAX_RETRIES - 1:
                print(f"  Rate limited. Waiting {RETRY_WAIT * (attempt + 1)}s...")
                time.sleep(RETRY_WAIT * (attempt + 1))
                continue
            print(f"  DELETE failed: HTTP {e.code} {body[:200]}")
            return None
    return None


def fetch_all_posts(user_id):
    """全投稿を取得（ページネーション対応）"""
    all_posts = []
    params = {
        "fields": "id,text,timestamp",
        "limit": "50",
    }

    for page in range(20):  # 最大1000件
        data = api_get(f"{user_id}/threads", params)
        posts = data.get("data", [])
        all_posts.extend(posts)

        paging = data.get("paging", {})
        next_cursor = paging.get("cursors", {}).get("after")
        if not next_cursor or not posts:
            break
        params["after"] = next_cursor
        time.sleep(1)

    return all_posts


def main():
    dry_run = "--dry-run" in sys.argv
    user_id = get_user_id()

    print(f"アカウント: {user_id}")
    print(f"モード: {'DRY RUN（確認のみ）' if dry_run else '本番削除'}")
    print()

    # 全投稿取得
    print("投稿を取得中...")
    posts = fetch_all_posts(user_id)
    print(f"取得完了: {len(posts)}件")
    print()

    if not posts:
        print("削除する投稿がありません。")
        return

    # 一覧表示
    for i, post in enumerate(posts):
        text_preview = post.get("text", "")[:60].replace("\n", " ")
        ts = post.get("timestamp", "?")
        print(f"  [{i+1}] {ts} | {text_preview}...")

    print()

    if dry_run:
        print(f"DRY RUN: {len(posts)}件の投稿が削除対象です。")
        print("実行するには --dry-run を外して再実行してください。")
        return

    # 確認
    confirm = input(f"{len(posts)}件の投稿を全て削除します。よろしいですか？ (yes/no): ")
    if confirm.lower() != "yes":
        print("キャンセルしました。")
        return

    # 削除実行
    deleted = 0
    failed = 0
    for i, post in enumerate(posts):
        thread_id = post["id"]
        text_preview = post.get("text", "")[:40].replace("\n", " ")
        print(f"  [{i+1}/{len(posts)}] 削除中: {thread_id} ({text_preview}...)")

        result = api_delete(thread_id)
        if result and result.get("success", False):
            deleted += 1
        else:
            failed += 1

        # レート制限回避: 1件ずつ間隔を空ける
        time.sleep(2)

    print()
    print(f"完了: {deleted}件削除, {failed}件失敗")


if __name__ == "__main__":
    main()
