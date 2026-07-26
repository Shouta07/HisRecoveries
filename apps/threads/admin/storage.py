"""管理ページのストレージ抽象（ローカルFS / GitHub API）

- LocalStorage: `python -m admin.server` 用。accounts/<id>/ を直接読み書き。
- GitHubStorage: Vercel(サーバーレス)用。読み書きをGitHub Contents APIで行い、
  編集はリポジトリへのコミットとして永続化する（読み取り専用FSでも保存可能）。

どちらも標準ライブラリのみ（urllib）。依存追加なし。
"""

from __future__ import annotations

import base64
import json
import os
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ACCOUNTS_DIR = ROOT / "accounts"


class LocalStorage:
    """ローカルファイルシステム。編集はファイルへ直接書き込む。"""

    backend = "local"

    def list_accounts(self) -> list[str]:
        if not ACCOUNTS_DIR.exists():
            return []
        return sorted(p.name for p in ACCOUNTS_DIR.iterdir() if p.is_dir())

    def _path(self, account: str, filename: str) -> Path:
        d = (ACCOUNTS_DIR / account).resolve()
        if ACCOUNTS_DIR not in d.parents and d != ACCOUNTS_DIR:
            raise ValueError("invalid account path")
        return d / filename

    def read(self, account: str, filename: str) -> str | None:
        p = self._path(account, filename)
        return p.read_text(encoding="utf-8") if p.exists() else None

    def read_json(self, account: str, filename: str, default):
        raw = self.read(account, filename)
        if raw is None:
            return default
        try:
            return json.loads(raw)
        except Exception:
            return default

    def write(self, account: str, filename: str, content: str, message: str) -> str:
        p = self._path(account, filename)
        p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
        return "保存しました（ローカル）"


class GitHubStorage:
    """GitHub Contents API。読み書きをリポジトリ上で行う。

    必要な環境変数:
      GITHUB_TOKEN  : repo書き込み権限のあるトークン
      GITHUB_REPO   : "owner/repo"（例 Shouta07/threads）
      GITHUB_BRANCH : 対象ブランチ（既定 main）
    """

    backend = "github"
    API = "https://api.github.com"

    def __init__(self, token: str, repo: str, branch: str = "main"):
        self.token = token
        self.repo = repo
        self.branch = branch

    def _req(self, method: str, path: str, body: dict | None = None) -> dict:
        url = f"{self.API}/repos/{self.repo}/{path}"
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("User-Agent", "threads-admin")
        if data:
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode())

    def list_accounts(self) -> list[str]:
        try:
            items = self._req("GET", f"contents/accounts?ref={self.branch}")
            return sorted(i["name"] for i in items if i.get("type") == "dir")
        except Exception:
            # フォールバック: バンドルされたローカルコピー
            return LocalStorage().list_accounts()

    def read(self, account: str, filename: str) -> str | None:
        path = f"accounts/{account}/{filename}"
        try:
            res = self._req("GET", f"contents/{path}?ref={self.branch}")
            content = res.get("content", "")
            return base64.b64decode(content).decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            raise

    def read_json(self, account: str, filename: str, default):
        raw = self.read(account, filename)
        if raw is None:
            return default
        try:
            return json.loads(raw)
        except Exception:
            return default

    def _sha(self, path: str) -> str | None:
        try:
            res = self._req("GET", f"contents/{path}?ref={self.branch}")
            return res.get("sha")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            raise

    def write(self, account: str, filename: str, content: str, message: str) -> str:
        path = f"accounts/{account}/{filename}"
        sha = self._sha(path)
        body = {
            "message": message,
            "content": base64.b64encode(content.replace("\r\n", "\n").encode("utf-8")).decode(),
            "branch": self.branch,
        }
        if sha:
            body["sha"] = sha
        res = self._req("PUT", f"contents/{path}", body)
        commit = res.get("commit", {}).get("sha", "")[:7]
        return f"GitHubにコミットしました（{self.branch} {commit}）"


def get_storage():
    """環境変数からストレージを決定する。

    GITHUB_TOKEN と GITHUB_REPO があれば GitHubStorage、無ければ LocalStorage。
    """
    token = os.getenv("GITHUB_TOKEN", "")
    repo = os.getenv("GITHUB_REPO", "")
    if token and repo:
        branch = os.getenv("GITHUB_BRANCH", "main")
        return GitHubStorage(token, repo, branch)
    return LocalStorage()
