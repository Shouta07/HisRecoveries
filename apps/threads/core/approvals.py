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

# 自動承認の印。人が押したものと区別できないと、
# 「これ誰が通した？」に答えられなくなる。
AUTO_APPROVER = "auto"

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


def opening_remaining(account_dir: str | Path) -> int:
    """最初の10本（accounts/<id>/OPENING.md）のうち、まだ出ていない数。

    アカウントが空の状態では、最初の数本でこの亀が何者かが決まる。
    自動生成は型をランダムに掛けるので、放っておくと
    「告知 → 実演 → 告知」のように並び、誰もまだ恋亀を知らないうちに
    商品の話が先に来る。

    印（payload.opening）の付いた投稿が残っているあいだは、
      - 新しいぶんを自動承認しない（auto_approve_decision）
      - そもそも生成しない（main.run_post_cycle）
    全部 posted / rejected になれば、この条件はひとりでに消える。
    """
    return len([
        it for it in list_items(account_dir)
        if (it.get("payload") or {}).get("opening")
        and it.get("status") in ("pending", "approved")
    ])


def auto_approve_decision(
    persona: dict, payload: dict, account_dir: str | Path,
) -> tuple[bool, str]:
    """この1本を、人を通さずに承認してよいか。

    Returns: (承認してよいか, 理由)

    ── なぜ型で分けるのか ──────────────────────────
    危なさが一様ではない。

    A（共感）B（問い）C（恋亀）は、リンクも商品の話も持たない。
    外した投稿が出ても、滑るだけで済む。

    D（告知）はURLを貼り、サービスの話をする。
    いまは恋亀と話す機能が公開されていない（src/lib/koi/gate.ts）ので、
    書き方を1つ間違えると、できないことを売ったことになる。
    D は全体の1割（週に2本ほど）なので、ここだけ人が見ても手間は小さい。

    ── 止める口を残す ──────────────────────────────
    accounts/<id>/KILL_SWITCH があれば、何があっても自動承認しない。
    設定をいじらなくても、ファイルを1つ置けば止まる。
    """
    cfg = (
        persona.get("posting", {})
        .get("posting_types", {})
        .get("automated", {})
        .get("auto_approve", {})
    )
    if not cfg.get("enabled", False):
        return False, "自動承認が無効"

    if (Path(account_dir) / "KILL_SWITCH").exists():
        return False, "KILL_SWITCH があるので自動承認しない"

    waiting = opening_remaining(account_dir)
    if waiting:
        return False, (
            f"最初の10本が残っている（あと{waiting}本）。"
            "出きるまで自動承認しない（OPENING.md）"
        )

    category = payload.get("post_category")
    allowed = cfg.get("categories", [])
    if category not in allowed:
        return False, f"型 {category} は人の承認が要る"

    # 承認済み（まだ投稿されていない）が溜まりすぎていたら止める。
    # 投稿側が詰まっているのに生成だけ進むと、古い投稿が後から出る。
    cap = cfg.get("max_pending_approved", 10)
    waiting = len(list_items(account_dir, status="approved"))
    if waiting >= cap:
        return False, f"投稿待ちが{waiting}本たまっている（上限{cap}）"

    # 1日に自動で通す本数の上限。生成が暴走したときの最後の歯止め。
    daily = cfg.get("max_per_day", 0)
    if daily:
        today = datetime.now().date().isoformat()
        done = [
            it for it in list_items(account_dir)
            if (it.get("decided_by") == AUTO_APPROVER)
            and str(it.get("decided_at") or "").startswith(today)
        ]
        if len(done) >= daily:
            return False, f"今日はすでに{len(done)}本自動承認した（上限{daily}）"

    return True, f"型 {category} は自動承認の対象"


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
