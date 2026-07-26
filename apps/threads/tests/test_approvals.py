"""承認キュー + 承認ゲートのテスト。"""

from __future__ import annotations

import types

from core import approvals, main


# ── approvals モジュール（隔離ユニット） ───────────────────────────
def test_enqueue_and_list(tmp_path):
    pid = approvals.enqueue(tmp_path, {"text": "hello", "posts": ["a", "b"]}, account_id="acc")
    items = approvals.list_items(tmp_path)
    assert len(items) == 1
    assert items[0]["id"] == pid
    assert items[0]["status"] == "pending"
    assert items[0]["account_id"] == "acc"
    assert approvals.count(tmp_path, "pending") == 1


def test_approve_reject_transitions(tmp_path):
    a = approvals.enqueue(tmp_path, {"text": "A"})
    b = approvals.enqueue(tmp_path, {"text": "B"})
    assert approvals.approve(tmp_path, a, by="hr") is True
    assert approvals.reject(tmp_path, b) is True
    assert approvals.count(tmp_path, "approved") == 1
    assert approvals.count(tmp_path, "rejected") == 1
    assert approvals.get(tmp_path, a)["decided_by"] == "hr"
    assert approvals.set_status(tmp_path, "no-such-id", "approved") is False


def test_posted_status_and_unique_ids(tmp_path):
    ids = [approvals.enqueue(tmp_path, {"text": str(i)}) for i in range(5)]
    assert len(set(ids)) == 5  # 連続 enqueue でも衝突しない
    approvals.set_status(tmp_path, ids[0], "posted")
    assert approvals.get(tmp_path, ids[0])["status"] == "posted"
    assert approvals.get(tmp_path, ids[0])["posted_at"] is not None


# ── 承認ゲート（run_post_cycle が投稿せずキューに積む） ─────────────
def _stub_generation(monkeypatch, tmp_path, posted_flag):
    """run_post_cycle の依存を差し替え、tmp_path をアカウントディレクトリにする。"""
    persona = {"posting": {"format": "thread"}}
    monkeypatch.setattr(main, "load_account_config", lambda acc: {
        "account_dir": str(tmp_path), "history_path": str(tmp_path / "history.json"),
        "persona": persona, "rss_feeds": [],
    })
    monkeypatch.setattr(main, "validate_account", lambda acc: [])
    monkeypatch.setattr(main.supervisor, "preflight_check", lambda *a, **k: True)
    monkeypatch.setattr(main.researcher, "collect_viral_posts", lambda *a, **k: [])
    monkeypatch.setattr(main.researcher, "save_viral_posts", lambda *a, **k: None)
    monkeypatch.setattr(main.researcher, "collect_topics", lambda *a, **k: [])
    monkeypatch.setattr(main.researcher, "save_topics", lambda *a, **k: None)
    monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
    monkeypatch.setattr(main.writer, "generate_post", lambda *a, **k: {
        "text": "1本目\n2本目", "posts": ["1本目", "2本目"], "is_thread": True,
        "link": "https://hisrecoveries.com/apply", "cta_used": None,
        "hypothesis_id": "h1", "hypothesis_name": "gift", "topic_slug": "gift-birthday",
        "buzz_score": 0, "source_type": "template",
    })

    def _spy_chain(*a, **k):
        posted_flag["posted"] = True
        return {"thread_id": "x"}
    monkeypatch.setattr(main.poster, "create_thread_chain", _spy_chain)
    monkeypatch.setattr(main.poster, "create_thread_post", _spy_chain)
    monkeypatch.setattr(main.poster, "get_user_id", lambda *a, **k: "uid")


def test_gate_queues_instead_of_posting(monkeypatch, tmp_path):
    posted = {"posted": False}
    _stub_generation(monkeypatch, tmp_path, posted)
    ok = main.run_post_cycle("acc", dry_run=False, mock=True, approval_required=True)
    assert ok is True
    assert posted["posted"] is False  # 投稿していない
    pend = approvals.list_items(tmp_path, status="pending")
    assert len(pend) == 1
    assert pend[0]["payload"]["is_thread"] is True
    assert pend[0]["payload"]["posts"] == ["1本目", "2本目"]


def test_no_gate_posts_directly(monkeypatch, tmp_path):
    posted = {"posted": False}
    _stub_generation(monkeypatch, tmp_path, posted)
    monkeypatch.setattr(main.writer, "save_to_history", lambda *a, **k: None)
    monkeypatch.setattr(main, "record_post_with_cta", lambda *a, **k: None)
    ok = main.run_post_cycle("acc", dry_run=False, mock=True, approval_required=False)
    assert ok is True
    assert posted["posted"] is True  # 承認ゲート無し→即投稿
    assert approvals.count(tmp_path, "pending") == 0


# ── 承認済みだけを投稿する run_approved_cycle ──────────────────────
def test_run_approved_cycle_posts_only_approved(monkeypatch, tmp_path):
    persona = {"posting": {"format": "thread"}}
    monkeypatch.setattr(main, "load_account_config", lambda acc: {
        "account_dir": str(tmp_path), "history_path": str(tmp_path / "history.json"),
        "persona": persona, "rss_feeds": [],
    })
    monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
    monkeypatch.setattr(main.poster, "get_user_id", lambda *a, **k: "uid")
    monkeypatch.setattr(main.writer, "save_to_history", lambda *a, **k: None)
    monkeypatch.setattr(main, "record_post_with_cta", lambda *a, **k: None)
    calls = {"n": 0}

    def _chain(*a, **k):
        calls["n"] += 1
        return {"thread_id": f"t{calls['n']}"}
    monkeypatch.setattr(main.poster, "create_thread_chain", _chain)

    a = approvals.enqueue(tmp_path, {"text": "承認する", "posts": ["x"], "is_thread": True})
    approvals.enqueue(tmp_path, {"text": "承認しない", "posts": ["y"], "is_thread": True})
    approvals.approve(tmp_path, a)

    ok = main.run_approved_cycle("acc", dry_run=False, mock=False)
    assert ok is True
    assert calls["n"] == 1  # 承認済み1件だけ投稿
    assert approvals.get(tmp_path, a)["status"] == "posted"
    assert approvals.count(tmp_path, "pending") == 1  # 未承認は残る
