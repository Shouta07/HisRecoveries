"""
トークンが指すアカウント（現在: @koikame.jp）の全投稿を一括削除する。

**取り消せない。** 旧事業（His Recoveries）時代の投稿を消して、タシカメとして
出し直すときに使う。

2026-10-03、@koikame.jp の153件に対して実行済み（APIで100件、残り53件は手動）。
いまは空のアカウントから始まっている。削除の前に、取得した投稿を手元のJSONに保存する
（`data/deleted_posts_<時刻>.json`。gitignore 済みのディレクトリ）。

使い方:
  1. .env に THREADS_ACCESS_TOKEN を設定（GitHub Secrets と同じ値）
     ユーザーIDは設定しない。トークンから引く（下の get_user_id を参照）
  2. python scripts/delete_all_posts.py --dry-run  （一覧を見るだけ。消さない）
  3. python scripts/delete_all_posts.py              （実行。yes の入力を求める）

トークンが手元に無いときは、GitHub Actions の
`Threads Delete All Posts (manual)` を手動実行する（Secrets のトークンを使う）。
その経路では --yes が付くので、確認はワークフロー側の入力で行う。

必要な権限（2026-10-03 に実地で確認）:
  - threads_basic   すべての呼び出しに必要
  - threads_delete  削除に必要。**別の権限で、投稿用のトークンには入っていない**

  足りないと、全件がこう返る（403ではなく500で来る）:
    HTTP 500 {"error":{"message":"Application does not have permission
              for this action","code":10,"type":"THApiException"}}

  直し方:
    1. Metaの開発者ダッシュボード → アプリ → ユースケースに threads_delete を追加
    2. **トークンを発行し直す**。スコープはトークンに焼き込まれるので、
       アプリ側に権限を足しただけでは既存トークンでは通らない

上限:
  - **削除は1アカウントあたり1日100件まで。** 超える分は翌日に回す。
    既定の --limit 100 はこの上限に合わせてある。

投稿履歴（accounts/*/history.json）は別物。Threads上から消しても自動では減らない
（現在は空なので、やることは無い）。

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
    """投稿を消す対象のユーザーIDを、トークン自身に聞いて決める。

    Threads のユーザーIDは**アプリごとに別の値**になる。環境変数に保存した
    IDは、トークンの発行元アプリが変わると途端に通らなくなり、こう返る:

      HTTP 400 {"error":{"message":"Unsupported get request. Object with ID
                '...' does not exist, cannot be loaded due to missing
                permissions, or does not support this operation",
                "code":100,"error_subcode":33}}

    2026-10-03 に threads_delete を足すため再認可した直後、実際にこれが出た。
    だから保存値は使わず、毎回 /me から引く。ユーザー名も一緒に出して、
    消す相手を取り違えていないことを目で確かめられるようにする。
    """
    data = api_get("me", {"fields": "id,username"})
    user_id = data.get("id")
    if not user_id:
        print("ERROR: トークンからユーザーIDを取得できませんでした。")
        sys.exit(1)
    return user_id, data.get("username", "(不明)")


def api_get(endpoint, params=None):
    token = get_token()
    query = {"access_token": token}
    if params:
        query.update(params)
    url = f"{API_BASE}/{endpoint}?{urllib.parse.urlencode(query)}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = ""
        try:
            body = e.read().decode()
        except Exception:
            pass
        print(f"ERROR: 投稿の取得に失敗しました（HTTP {e.code}）")
        print(f"  {body[:300]}")
        print("  トークンの期限切れ・権限不足・USER_ID の取り違えを確認してください。")
        sys.exit(1)


def api_delete(thread_id):
    """1件削除する。Returns (成功したか, 失敗の理由)。

    以前は失敗を None で返していたので、呼び出し側が理由を区別できず、
    権限が無いまま153件を6分かけて叩き続けた。理由を返す。
    """
    token = get_token()
    url = f"{API_BASE}/{thread_id}?{urllib.parse.urlencode({'access_token': token})}"
    req = urllib.request.Request(url, method="DELETE")

    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            if data.get("success", False):
                return True, None
            return False, f"success=false {json.dumps(data, ensure_ascii=False)[:200]}"
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
            reason = f"HTTP {e.code} {body[:200]}"
            print(f"  DELETE failed: {reason}")
            return False, reason
    return False, "リトライ上限"


# 権限不足のときに返ってくる文言（403ではなく500で来る）
_NO_PERMISSION = "does not have permission"

# 1日の上限に当たったときの文言
_RATE_LIMITED = ("rate limit", "too many", "limit reached")


def _permission_help() -> str:
    return (
        "\n"
        "=== 削除の権限がありません ===\n"
        "Metaアプリに threads_delete が付いていません。投稿用の権限とは別物です。\n"
        "\n"
        "  1. developers.facebook.com → 該当アプリ → ユースケースに threads_delete を追加\n"
        "  2. **トークンを発行し直す**\n"
        "     スコープはトークンに焼き込まれるので、アプリ側に足しただけでは\n"
        "     いま使っているトークンでは通りません。\n"
        "  3. 新しいトークンを Secrets の THREADS_ACCESS_TOKEN に入れて、もう一度実行\n"
        "\n"
        "※ 削除は1アカウント1日100件まで。それ以上は翌日に回してください。\n"
    )


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


def _arg_value(name, default, cast=int):
    """--name VALUE の形で渡された値を読む。読めなければ default。"""
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            try:
                return cast(sys.argv[i + 1])
            except ValueError:
                pass
    return default


def main():
    dry_run = "--dry-run" in sys.argv
    # --yes は CI 用。対話の入力が使えない場所で、確認を呼び出し側に委ねる。
    # 手で実行するときは付けない（yes の入力を求めるのが安全側）。
    assume_yes = "--yes" in sys.argv
    # Threads API の削除は1アカウント1日100件まで。既定をそこに合わせる。
    limit = _arg_value("--limit", 100)
    user_id, username = get_user_id()

    # 消す相手の取り違えを、ここでも止める。ユーザーIDはトークンから引くので、
    # トークンを差し替えると黙って別アカウントを消しに行ってしまう。
    expect = _arg_value("--expect", "", cast=str)
    if expect and expect.lstrip("@") != (username or "").lstrip("@"):
        print(f"ERROR: トークンのアカウント（@{username}）が指定（{expect}）と違います。")
        print("  消す相手が違う可能性があるので中止しました。")
        sys.exit(1)

    print(f"アカウント: @{username}")
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
        if len(posts) > limit:
            print(f"  うち今回消せるのは {limit}件（1日の上限）。"
                  f"残り {len(posts) - limit}件は翌日以降。")
        print("実行するには --dry-run を外して再実行してください。")
        return

    # 削除は取り消せないので、消す前に手元へ保存しておく
    backup_dir = Path(__file__).resolve().parent.parent / "data"
    backup_dir.mkdir(exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    backup_path = backup_dir / f"deleted_posts_{stamp}.json"
    backup_path.write_text(
        json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8",
    )
    print(f"削除前の控えを保存しました: {backup_path}")
    print()

    # 確認
    if assume_yes:
        print(f"--yes が指定されています。{len(posts)}件を削除します。")
    else:
        confirm = input(f"{len(posts)}件の投稿を全て削除します。よろしいですか？ (yes/no): ")
        if confirm.lower() != "yes":
            print("キャンセルしました。")
            return

    # 削除実行。1日の上限までしか触らない
    targets = posts[:limit]
    deleted = 0
    failed = 0
    stopped = ""
    for i, post in enumerate(targets):
        thread_id = post["id"]
        text_preview = post.get("text", "")[:40].replace("\n", " ")
        print(f"  [{i+1}/{len(targets)}] 削除中: {thread_id} ({text_preview}...)")

        ok, reason = api_delete(thread_id)
        if ok:
            deleted += 1
        else:
            failed += 1
            low = (reason or "").lower()
            # 権限が無いなら、残りを叩いても全部同じ。1件目で止める
            if _NO_PERMISSION in low:
                stopped = "permission"
                break
            if any(w in low for w in _RATE_LIMITED):
                stopped = "rate_limit"
                break

        # レート制限回避: 1件ずつ間隔を空ける
        time.sleep(2)

    remaining = len(posts) - deleted
    print()
    print(f"完了: {deleted}件削除, {failed}件失敗")
    if stopped == "permission":
        print(_permission_help())
    elif stopped == "rate_limit":
        print("\n1日の上限（100件）に達したので止めました。明日もう一度実行してください。")
    if remaining > 0:
        print(f"残り {remaining}件。もう一度実行すると続きから消します"
              f"（1日100件まで）。")

    # 1件でも失敗したら失敗として返す。
    # 以前は常に0で終わっていたので、153件全部失敗してもワークフローは緑だった。
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
