"""承認キュー — AI生成 → 人間の承認 → 投稿 の3段を成立させる。

生成した連投は即投稿せず、ここに status="pending" で積む。
人間が admin もしくは CLI で approve/reject し、承認済み(approved)だけを
`post-approved`（cron 想定）が投稿する。これで「AI生成後に人の承認を挟む」を担保する。

保存先: {account_dir}/approvals.json （標準ライブラリのみ）。
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

STATUSES = ("pending", "approved", "rejected", "posted")


def _path(account_dir: str | Path) -> Path:
    return Path(account_dir) / "approvals.json"


def _load(account_dir: str | Path) -> dict:
    p = _path(account_dir)
    if not p.exists():
        return {"items": []}
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data
    except (json.JSONDecodeError, OSError) as e:
        logger.warning("approvals.json read failed (%s); starting empty", e)
    return {"items": []}


def _save(account_dir: str | Path, data: dict) -> None:
    p = _path(account_dir)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(p)


def _new_id(existing: list) -> str:
    base = datetime.now().strftime("%Y%m%d%H%M%S%f")
    ids = {it.get("id") for it in existing}
    if base not in ids:
        return base
    # 同一マイクロ秒の衝突回避（連続 enqueue 時）
    n = 1
    while f"{base}-{n}" in ids:
        n += 1
    return f"{base}-{n}"


def enqueue(account_dir: str | Path, payload: dict, account_id: str = "") -> str:
    """生成物を承認待ち(pending)として積む。item_id を返す。"""
    data = _load(account_dir)
    item_id = _new_id(data["items"])
    data["items"].append(
        {
            "id": item_id,
            "account_id": account_id,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "decided_at": None,
            "decided_by": None,
            "posted_at": None,
            "payload": payload,
        }
    )
    _save(account_dir, data)
    logger.info("Queued for approval: id=%s", item_id)
    return item_id


def list_items(account_dir: str | Path, status: str | None = None) -> list:
    items = _load(account_dir)["items"]
    if status is None:
        return list(items)
    return [it for it in items if it.get("status") == status]


def get(account_dir: str | Path, item_id: str) -> dict | None:
    for it in _load(account_dir)["items"]:
        if it.get("id") == item_id:
            return it
    return None


def count(account_dir: str | Path, status: str | None = None) -> int:
    return len(list_items(account_dir, status))


def set_status(
    account_dir: str | Path,
    item_id: str,
    status: str,
    decided_by: str | None = None,
) -> bool:
    """承認/却下/投稿済みなどの状態遷移。存在すれば True。"""
    if status not in STATUSES:
        raise ValueError(f"invalid status: {status}")
    data = _load(account_dir)
    changed = False
    for it in data["items"]:
        if it.get("id") == item_id:
            it["status"] = status
            if status in ("approved", "rejected"):
                it["decided_at"] = datetime.now().isoformat()
                it["decided_by"] = decided_by
            elif status == "posted":
                it["posted_at"] = datetime.now().isoformat()
            changed = True
            break
    if changed:
        _save(account_dir, data)
    return changed


def approve(account_dir: str | Path, item_id: str, by: str | None = None) -> bool:
    return set_status(account_dir, item_id, "approved", decided_by=by)


def reject(account_dir: str | Path, item_id: str, by: str | None = None) -> bool:
    return set_status(account_dir, item_id, "rejected", decided_by=by)
