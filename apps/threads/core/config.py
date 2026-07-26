"""
Config - 共通設定管理
アカウント設定の読み込みとバリデーションを行う。
"""

import json
import logging
import os
import re
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
ACCOUNTS_DIR = BASE_DIR / "accounts"
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# アカウント名の許可パターン（パス走査防止）
SAFE_ACCOUNT_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$")


def atomic_write_json(path: Path, data) -> None:
    """
    JSONファイルをアトミックに書き込む。
    一時ファイルに書いてからos.replace()で置換するため、
    クラッシュ時にもファイルが壊れない。
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_fd, tmp_path = tempfile.mkstemp(
        dir=path.parent, suffix=".tmp", prefix=path.stem + "_"
    )
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, path)
    except BaseException:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


def safe_load_json(path: Path, default=None):
    """
    JSONファイルを安全に読み込む。
    ファイルが存在しない・壊れている場合はdefaultを返す。
    """
    if not path.exists():
        return default if default is not None else {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("JSON read failed (%s): %s — using default", path, e)
        return default if default is not None else {}


def validate_account_name(name: str) -> bool:
    """アカウント名がパス走査攻撃に安全かチェック"""
    return bool(SAFE_ACCOUNT_PATTERN.match(name)) and ".." not in name


def get_account_dir(account_id: str) -> Path:
    """アカウントディレクトリを返す。存在しなければエラー。"""
    if not validate_account_name(account_id):
        raise ValueError(f"Invalid account name: {account_id}")
    path = ACCOUNTS_DIR / account_id
    if not path.is_dir():
        raise FileNotFoundError(f"Account not found: {account_id}")
    return path


def _env_key_for_account(base_key: str, account_id: str) -> str:
    """アカウント別の環境変数名を生成。
    例: _env_key_for_account("GEMINI_API_KEY", "mens-body-lab")
        → "GEMINI_API_KEY_MY_ACCOUNT_01"
    """
    suffix = account_id.upper().replace("-", "_")
    return f"{base_key}_{suffix}"


def get_account_env(base_key: str, account_id: str) -> str:
    """アカウント固有の環境変数を優先取得。なければ共通キーにフォールバック。
    例: GEMINI_API_KEY_MY_ACCOUNT_01 → GEMINI_API_KEY → ""
    """
    account_key = _env_key_for_account(base_key, account_id)
    value = os.getenv(account_key, "")
    if value:
        return value
    return os.getenv(base_key, "")


def load_account_config(account_id: str) -> dict:
    """アカウントの全設定を一括読み込み"""
    account_dir = get_account_dir(account_id)

    persona_path = account_dir / "persona.json"
    if not persona_path.exists():
        raise FileNotFoundError(f"persona.json not found for {account_id}")

    persona = json.loads(persona_path.read_text())

    # RSS設定（あれば読み込み）
    rss_path = account_dir / "rss_feeds.json"
    rss_feeds = []
    if rss_path.exists():
        rss_feeds = json.loads(rss_path.read_text()).get("feeds", [])

    # 履歴パス
    history_path = account_dir / "history.json"

    return {
        "account_id": account_id,
        "account_dir": account_dir,
        "persona": persona,
        "rss_feeds": rss_feeds,
        "history_path": history_path,
    }


def list_accounts() -> list[str]:
    """利用可能なアカウントID一覧を返す"""
    if not ACCOUNTS_DIR.exists():
        return []
    return [
        d.name for d in sorted(ACCOUNTS_DIR.iterdir())
        if d.is_dir() and (d / "persona.json").exists()
    ]


def validate_account(account_id: str) -> list[str]:
    """アカウント設定のバリデーション。問題点のリストを返す。"""
    errors = []
    account_dir = ACCOUNTS_DIR / account_id

    if not account_dir.is_dir():
        return [f"アカウントディレクトリが存在しません: {account_id}"]

    # persona.json チェック
    persona_path = account_dir / "persona.json"
    if not persona_path.exists():
        errors.append("persona.json が見つかりません")
    else:
        try:
            persona = json.loads(persona_path.read_text())
            required_keys = ["account_id", "genre", "tone", "character", "posting"]
            for key in required_keys:
                if key not in persona:
                    errors.append(f"persona.json に '{key}' がありません")
        except json.JSONDecodeError as e:
            errors.append(f"persona.json のJSON解析エラー: {e}")

    # patterns.md チェック
    patterns_path = account_dir / "patterns.md"
    if not patterns_path.exists():
        errors.append("patterns.md が見つかりません")
    else:
        content = patterns_path.read_text()
        import re
        pattern_count = len(re.findall(r"^#{2,3} \d+\.", content, re.MULTILINE))
        if pattern_count < 5:
            errors.append(f"patterns.md のパターン数が少なすぎます: {pattern_count}個")

    # history.json チェック
    history_path = account_dir / "history.json"
    if history_path.exists():
        try:
            json.loads(history_path.read_text())
        except json.JSONDecodeError as e:
            errors.append(f"history.json のJSON解析エラー: {e}")

    return errors
