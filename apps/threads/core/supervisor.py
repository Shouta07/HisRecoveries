"""
Supervisor - 異常検知・KILL_SWITCH エージェント
全処理の前にチェックし、異常時は即座に全停止する。
"""

import os
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

from core.config import atomic_write_json, safe_load_json

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
KILL_SWITCH_FILE = DATA_DIR / "kill_switch.json"
ERROR_LOG_FILE = DATA_DIR / "error_log.json"

# 閾値設定
MAX_POSTS_PER_HOUR = 5
MAX_ERRORS_PER_HOUR = 10
MAX_API_CALLS_PER_DAY = 500


def is_kill_switch_active() -> bool:
    """環境変数またはファイルベースのKILL_SWITCHを確認"""
    if os.getenv("KILL_SWITCH", "false").lower() == "true":
        logger.warning("KILL_SWITCH is ON (env)")
        return True

    data = safe_load_json(KILL_SWITCH_FILE, {})
    if data:
        if data.get("active", False):
            logger.warning("KILL_SWITCH is ON (file): %s", data.get("reason", "不明"))
            return True

    return False


def activate_kill_switch(reason: str) -> None:
    """KILL_SWITCHを有効化"""
    payload = {
        "active": True,
        "reason": reason,
        "activated_at": datetime.now().isoformat(),
    }
    atomic_write_json(KILL_SWITCH_FILE, payload)
    logger.critical("KILL_SWITCH activated: %s", reason)


def deactivate_kill_switch() -> None:
    """KILL_SWITCHを解除"""
    if KILL_SWITCH_FILE.exists():
        KILL_SWITCH_FILE.unlink()
    logger.info("KILL_SWITCH deactivated")


MAX_ERROR_LOG = 1000  # エラーログの上限件数


def record_error(error_type: str, detail: str) -> None:
    """エラーを記録し、閾値超過で自動KILL_SWITCH"""
    errors = safe_load_json(ERROR_LOG_FILE, [])

    errors.append({
        "type": error_type,
        "detail": detail,
        "timestamp": datetime.now().isoformat(),
    })

    errors = errors[-MAX_ERROR_LOG:]
    atomic_write_json(ERROR_LOG_FILE, errors)

    one_hour_ago = datetime.now() - timedelta(hours=1)
    recent_errors = [
        e for e in errors
        if datetime.fromisoformat(e["timestamp"]) > one_hour_ago
    ]

    if len(recent_errors) >= MAX_ERRORS_PER_HOUR:
        activate_kill_switch(
            f"1時間以内のエラー数が閾値超過: {len(recent_errors)}/{MAX_ERRORS_PER_HOUR}"
        )


def check_rate_limit(account_id: str, history_path: Path) -> bool:
    """投稿頻度が閾値を超えていないか確認"""
    if not history_path.exists():
        return True

    data = safe_load_json(history_path, {"posts": []})
    posts = data.get("posts", [])

    one_hour_ago = datetime.now() - timedelta(hours=1)
    recent_posts = []
    for p in posts:
        posted_at = p.get("posted_at")
        if posted_at:
            try:
                if datetime.fromisoformat(posted_at) > one_hour_ago:
                    recent_posts.append(p)
            except (ValueError, TypeError):
                continue

    if len(recent_posts) >= MAX_POSTS_PER_HOUR:
        logger.warning(
            "[%s] Rate limit exceeded: %d posts in last hour",
            account_id, len(recent_posts),
        )
        return False

    return True


def preflight_check(account_id: str, history_path: Path) -> bool:
    """投稿前の総合チェック。Falseなら処理を中断すべき。"""
    if is_kill_switch_active():
        return False

    if not check_rate_limit(account_id, history_path):
        return False

    logger.info("[%s] Preflight check passed", account_id)
    return True
