"""
Daemon - 完全自動運用エンジン
スケジューリング・トークン自動更新・ヘルスチェック・自動復旧を統合。
これ1つ起動すれば全自動でマネタイズが回る。
"""

import fcntl
import json
import logging
import os
import signal
import time
from datetime import datetime, timedelta
from pathlib import Path

from core.config import load_account_config, list_accounts, DATA_DIR, atomic_write_json
from core.supervisor import is_kill_switch_active, record_error, deactivate_kill_switch
from core.monetize import get_revenue_summary

logger = logging.getLogger(__name__)

HEALTH_FILE = DATA_DIR / "health.json"
PID_FILE = DATA_DIR / "daemon.pid"
TOKEN_REFRESH_INTERVAL_DAYS = 50  # 60日有効のうち50日で更新


class DaemonState:
    """デーモンの状態管理"""

    def __init__(self):
        self.running = True
        self.started_at = datetime.now()
        self.cycles_completed = 0
        self.cycles_failed = 0
        self.last_post_at = None
        self.last_token_refresh = None
        self.consecutive_errors = 0
        self.max_consecutive_errors = 5

    def record_success(self):
        self.cycles_completed += 1
        self.consecutive_errors = 0
        self.last_post_at = datetime.now()

    def record_failure(self):
        self.cycles_failed += 1
        self.consecutive_errors += 1

    def should_pause(self) -> bool:
        """連続エラー時に一時停止すべきか"""
        return self.consecutive_errors >= self.max_consecutive_errors

    def to_dict(self) -> dict:
        return {
            "running": self.running,
            "started_at": self.started_at.isoformat(),
            "uptime_hours": round(
                (datetime.now() - self.started_at).total_seconds() / 3600, 1
            ),
            "cycles_completed": self.cycles_completed,
            "cycles_failed": self.cycles_failed,
            "last_post_at": self.last_post_at.isoformat() if self.last_post_at else None,
            "last_token_refresh": (
                self.last_token_refresh.isoformat()
                if self.last_token_refresh
                else None
            ),
            "consecutive_errors": self.consecutive_errors,
        }


def _write_health(state: DaemonState, accounts: list[str]):
    """ヘルスチェック情報をファイルに書き出す"""
    rev = get_revenue_summary()
    health = {
        "status": "running" if state.running else "stopped",
        "daemon": state.to_dict(),
        "accounts": accounts,
        "revenue": rev,
        "checked_at": datetime.now().isoformat(),
    }
    atomic_write_json(HEALTH_FILE, health)


_pid_fd = None  # PIDファイルロック用ファイルディスクリプタ


def _write_pid():
    """PIDファイルをロック付きで書き出す（二重起動防止）"""
    global _pid_fd
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _pid_fd = open(PID_FILE, "w")
    try:
        fcntl.flock(_pid_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        _pid_fd.close()
        _pid_fd = None
        raise RuntimeError("Another daemon is already running (PID file locked)")
    _pid_fd.write(str(os.getpid()))
    _pid_fd.flush()


def _remove_pid():
    global _pid_fd
    if _pid_fd is not None:
        try:
            fcntl.flock(_pid_fd, fcntl.LOCK_UN)
            _pid_fd.close()
        except OSError:
            pass
        _pid_fd = None
    if PID_FILE.exists():
        PID_FILE.unlink()


def _auto_refresh_token(state: DaemonState) -> bool:
    """トークンの自動更新。更新したら.envも自動で書き換える。"""
    now = datetime.now()

    # 前回更新から50日経過していなければスキップ
    if state.last_token_refresh:
        days_since = (now - state.last_token_refresh).days
        if days_since < TOKEN_REFRESH_INTERVAL_DAYS:
            return False

    token = os.getenv("THREADS_ACCESS_TOKEN", "")
    if not token:
        return False

    logger.info("=== Auto token refresh ===")
    try:
        from core.poster import refresh_existing_long_lived_token, refresh_long_lived_token

        # まず既存の長命トークンを更新してみる
        new_token = refresh_existing_long_lived_token()
        if new_token:
            _update_env_token(new_token)
            os.environ["THREADS_ACCESS_TOKEN"] = new_token
            state.last_token_refresh = now
            logger.info("Token refreshed and .env updated automatically")
            return True

        # 長命トークンの更新が失敗した場合、短命→長命交換を試みる
        # （初回起動時やトークン期限切れの場合）
        logger.warning("Long-lived refresh failed. Trying short→long exchange...")
        app_secret = os.getenv("THREADS_APP_SECRET", "")
        if app_secret:
            new_token = refresh_long_lived_token()
            if new_token:
                _update_env_token(new_token)
                os.environ["THREADS_ACCESS_TOKEN"] = new_token
                state.last_token_refresh = now
                logger.info("Token exchanged (short→long) and .env updated")
                return True
            else:
                logger.error("Token exchange also failed — token may be fully expired. "
                             "Re-authenticate via Meta Developer Console.")
        else:
            logger.warning("THREADS_APP_SECRET not set — cannot attempt short→long exchange. "
                           "Token refresh failed.")
    except Exception as e:
        logger.error("Auto token refresh failed: %s", e)

    return False


def _update_env_token(new_token: str):
    """`.env` ファイル内のTHREADS_ACCESS_TOKENをアトミックに書き換える"""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        logger.warning(".env file not found, skipping auto-update")
        return

    lines = env_path.read_text().splitlines()
    updated = False
    new_lines = []
    for line in lines:
        if line.startswith("THREADS_ACCESS_TOKEN="):
            new_lines.append(f"THREADS_ACCESS_TOKEN={new_token}")
            updated = True
        else:
            new_lines.append(line)

    if not updated:
        new_lines.append(f"THREADS_ACCESS_TOKEN={new_token}")

    import tempfile
    content = "\n".join(new_lines) + "\n"
    tmp_fd, tmp_path = tempfile.mkstemp(dir=env_path.parent, suffix=".tmp")
    try:
        with os.fdopen(tmp_fd, "w") as f:
            f.write(content)
        os.replace(tmp_path, env_path)
    except BaseException:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise
    logger.info(".env updated with new token")


def _get_next_slot(time_slots: list[str]) -> tuple[str, float]:
    """次の投稿スロットと待機秒数を返す"""
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    for slot in sorted(time_slots):
        slot_dt = datetime.strptime(f"{today_str} {slot}", "%Y-%m-%d %H:%M")
        if slot_dt > now:
            wait_sec = (slot_dt - now).total_seconds()
            return slot, wait_sec

    # 今日のスロットは全て終了 → 翌日の最初のスロット
    first_slot = sorted(time_slots)[0]
    tomorrow = now.date() + timedelta(days=1)
    slot_dt = datetime.strptime(f"{tomorrow} {first_slot}", "%Y-%m-%d %H:%M")
    wait_sec = (slot_dt - now).total_seconds()
    return first_slot, wait_sec


def _interruptible_sleep(seconds: float, state: DaemonState, check_interval: int = 30):
    """中断可能なスリープ。KILL_SWITCHやシグナルで即座に中断。"""
    remaining = seconds
    while remaining > 0 and state.running:
        if is_kill_switch_active():
            logger.warning("KILL_SWITCH detected during sleep")
            return
        sleep_time = min(remaining, check_interval)
        time.sleep(sleep_time)
        remaining -= sleep_time


def run_daemon(
    account_ids: list[str],
    dry_run: bool = False,
    mock: bool = False,
    semi_auto: bool = False,
) -> None:
    """
    自動デーモン。指定アカウント全てを運用する。

    semi_auto=True の場合（デフォルト推奨）:
    - 投稿を生成して下書きとしてストック
    - 即時投稿はしない（人間レビュー→承認後に別途投稿）
    - トークン自動更新・ヘルスチェックは通常通り

    semi_auto=False の場合:
    - 従来通り完全自動投稿
    """
    # 循環インポート回避のため遅延インポート
    from core.main import run_post_cycle, setup_logging

    state = DaemonState()

    # シグナルハンドラ
    def handle_signal(signum, frame):
        logger.info("Signal %d received, shutting down gracefully...", signum)
        state.running = False

    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    # セットアップ
    setup_logging(account_ids[0])
    _write_pid()

    # 全アカウントの設定を読み込んでスロットを統合
    all_slots = set()
    account_configs = {}
    for aid in account_ids:
        try:
            config = load_account_config(aid)
            slots = config["persona"].get("posting", {}).get("time_slots", [])
            all_slots.update(slots)
            account_configs[aid] = config
        except Exception as e:
            logger.error("Failed to load account %s: %s", aid, e)

    if not all_slots:
        logger.error("No time_slots found in any account. Aborting.")
        _remove_pid()
        return

    all_slots_sorted = sorted(all_slots)

    logger.info("=" * 60)
    logger.info("Threads CEO Daemon started")
    logger.info("Accounts: %s", account_ids)
    logger.info("Time slots: %s", all_slots_sorted)
    logger.info("Dry run: %s | Mock: %s", dry_run, mock)
    logger.info("PID: %d", os.getpid())
    logger.info("=" * 60)

    _write_health(state, account_ids)

    while state.running:
        # KILL_SWITCH チェック
        if is_kill_switch_active():
            logger.warning("KILL_SWITCH active. Sleeping 5 min...")
            _write_health(state, account_ids)
            _interruptible_sleep(300, state)
            continue

        # 連続エラー時の休止
        if state.should_pause():
            logger.warning(
                "Too many consecutive errors (%d). Pausing 30 min...",
                state.consecutive_errors,
            )
            _interruptible_sleep(1800, state)
            state.consecutive_errors = 0  # リセットして再開
            continue

        # トークン自動更新チェック
        if not mock:
            _auto_refresh_token(state)

        # 次のスロットを取得
        slot, wait_sec = _get_next_slot(all_slots_sorted)
        logger.info("Next slot: %s (in %.0f sec / %.1f min)", slot, wait_sec, wait_sec / 60)
        _write_health(state, account_ids)

        # スロットまで待機
        _interruptible_sleep(wait_sec, state)

        if not state.running:
            break

        if is_kill_switch_active():
            continue

        # 全アカウントに対して投稿サイクル実行
        for aid in account_ids:
            if not state.running:
                break
            if is_kill_switch_active():
                break

            # 半自動モード: 生成のみ行い即時投稿しない
            effective_dry_run = dry_run or semi_auto
            mode_label = "SEMI-AUTO (draft)" if semi_auto else ("DRY RUN" if dry_run else "LIVE")
            logger.info("=== Executing cycle: %s @ %s [%s] ===", aid, slot, mode_label)
            try:
                success = run_post_cycle(aid, dry_run=effective_dry_run, mock=mock)
                if success:
                    state.record_success()
                    logger.info("[%s] Cycle completed successfully", aid)
                else:
                    state.record_failure()
                    logger.warning("[%s] Cycle failed", aid)
            except Exception as e:
                state.record_failure()
                record_error("daemon", f"{aid}: {e}")
                logger.error("[%s] Unexpected error: %s", aid, e)

            # アカウント間の間隔（Gemini 15RPM制限 + ボット検知回避）
            # 120秒空けることで同一APIキーでの429エラーを防止
            if len(account_ids) > 1 and not mock:
                _interruptible_sleep(120, state)

        _write_health(state, account_ids)

    # シャットダウン
    state.running = False
    _write_health(state, account_ids)
    _remove_pid()
    logger.info("Daemon stopped. Total cycles: %d ok, %d failed",
                state.cycles_completed, state.cycles_failed)


def get_daemon_status() -> dict | None:
    """稼働中のデーモンの状態を返す"""
    if not HEALTH_FILE.exists():
        return None
    try:
        return json.loads(HEALTH_FILE.read_text())
    except Exception:
        return None


def is_daemon_running() -> bool:
    """デーモンが稼働中かチェック"""
    if not PID_FILE.exists():
        return False
    try:
        pid = int(PID_FILE.read_text().strip())
        os.kill(pid, 0)  # プロセス存在確認（シグナルは送らない）
        return True
    except (ProcessLookupError, ValueError, PermissionError):
        _remove_pid()
        return False
