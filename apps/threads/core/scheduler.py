"""
Scheduler - 定時投稿スケジューラ
persona.jsonのtime_slotsに基づいて投稿サイクルを自動実行する。
"""

import logging
import time
from datetime import datetime, timedelta

from core.config import load_account_config, list_accounts
from core.main import run_post_cycle, setup_logging
from core.supervisor import is_kill_switch_active

logger = logging.getLogger(__name__)


def get_next_slot(time_slots: list[str]) -> tuple[str, float]:
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
    slot_dt = datetime.strptime(
        f"{tomorrow} {first_slot}", "%Y-%m-%d %H:%M"
    )
    wait_sec = (slot_dt - now).total_seconds()
    return first_slot, wait_sec


def run_scheduler(account_id: str, dry_run: bool = False) -> None:
    """指定アカウントのスケジューラをループ実行"""
    setup_logging(account_id)
    logger.info("Scheduler started for: %s (dry_run=%s)", account_id, dry_run)

    config = load_account_config(account_id)
    time_slots = config["persona"].get("posting", {}).get("time_slots", [])

    if not time_slots:
        logger.error("No time_slots defined in persona.json")
        return

    logger.info("Time slots: %s", time_slots)

    while True:
        if is_kill_switch_active():
            logger.warning("KILL_SWITCH active. Sleeping 5 min before recheck.")
            time.sleep(300)
            continue

        slot, wait_sec = get_next_slot(time_slots)
        logger.info("Next slot: %s (in %.0f sec)", slot, wait_sec)

        # 待機（長時間の場合は60秒ごとにKILL_SWITCHチェック）
        while wait_sec > 0:
            if is_kill_switch_active():
                logger.warning("KILL_SWITCH activated during wait.")
                break
            sleep_time = min(wait_sec, 60)
            time.sleep(sleep_time)
            wait_sec -= sleep_time

        if is_kill_switch_active():
            continue

        # 投稿サイクル実行
        logger.info("=== Executing post cycle for slot %s ===", slot)
        try:
            success = run_post_cycle(account_id, dry_run=dry_run)
            if success:
                logger.info("Slot %s: cycle completed successfully", slot)
            else:
                logger.warning("Slot %s: cycle failed", slot)
        except Exception as e:
            logger.error("Slot %s: unexpected error: %s", slot, e)


def run_all_accounts(dry_run: bool = False) -> None:
    """全アカウントのスケジューラを実行（シーケンシャル・1サイクルずつ）"""
    accounts = list_accounts()
    if not accounts:
        logger.error("No accounts found")
        return

    logger.info("Running cycle for %d accounts: %s", len(accounts), accounts)
    for account_id in accounts:
        if is_kill_switch_active():
            logger.warning("KILL_SWITCH active. Stopping.")
            break
        try:
            run_post_cycle(account_id, dry_run=dry_run)
        except Exception as e:
            logger.error("[%s] Error: %s", account_id, e)
