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


def test_run_approved_cycle_fails_when_nothing_could_be_posted(monkeypatch, tmp_path):
    # トークンが無いなど、承認済みを1本も出せなかったときは失敗を返す。
    # 緑のまま終わると「承認したのに投稿されない」が見えない。
    persona = {"posting": {"format": "thread"}}
    monkeypatch.setattr(main, "load_account_config", lambda acc: {
        "account_dir": str(tmp_path), "history_path": str(tmp_path / "history.json"),
        "persona": persona, "rss_feeds": [],
    })
    monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
    monkeypatch.setattr(main.poster, "get_user_id", lambda *a, **k: "uid")
    monkeypatch.setattr(main, "record_post_with_cta", lambda *a, **k: None)

    def _boom(*a, **k):
        raise ValueError("THREADS_ACCESS_TOKEN is not set")
    monkeypatch.setattr(main.poster, "create_thread_chain", _boom)

    a = approvals.enqueue(tmp_path, {"text": "承認する", "posts": ["x"], "is_thread": True})
    approvals.approve(tmp_path, a)

    assert main.run_approved_cycle("acc", dry_run=False, mock=False) is False
    # 失敗した分は approved のまま残す（投稿済みにしない）
    assert approvals.get(tmp_path, a)["status"] == "approved"


def test_run_approved_cycle_succeeds_when_queue_is_empty(monkeypatch, tmp_path):
    # 承認済みが無いのは正常。失敗にしない
    persona = {"posting": {"format": "thread"}}
    monkeypatch.setattr(main, "load_account_config", lambda acc: {
        "account_dir": str(tmp_path), "history_path": str(tmp_path / "history.json"),
        "persona": persona, "rss_feeds": [],
    })
    monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
    assert main.run_approved_cycle("acc", dry_run=False, mock=False) is True


# ──────────────────────────────────────────────────────────────
# 自動承認（型ごとに、人を通すかどうかを分ける）
# ──────────────────────────────────────────────────────────────


def _persona(**over):
    cfg = {
        "enabled": True,
        "categories": ["empathy", "split", "product"],
        "max_per_day": 5,
        "max_pending_approved": 10,
    }
    cfg.update(over)
    return {
        "posting": {
            "format": "single",
            "posting_types": {"automated": {"auto_approve": cfg}},
        }
    }


class TestAutoApprove:
    def test_low_risk_categories_pass(self, tmp_path):
        for cat in ("empathy", "split", "product"):
            ok, why = approvals.auto_approve_decision(
                _persona(), {"post_category": cat}, tmp_path,
            )
            assert ok, (cat, why)

    def test_announcements_need_a_human(self, tmp_path):
        """告知はURLを貼って商品の話をする。ここは人が見る。"""
        ok, why = approvals.auto_approve_decision(
            _persona(), {"post_category": "announce"}, tmp_path,
        )
        assert not ok
        assert "announce" in why

    def test_disabled_by_default(self, tmp_path):
        ok, _ = approvals.auto_approve_decision(
            {"posting": {}}, {"post_category": "empathy"}, tmp_path,
        )
        assert not ok, "設定が無いアカウントで勝手に通ってはいけない"

    def test_kill_switch_stops_everything(self, tmp_path):
        (tmp_path / "KILL_SWITCH").write_text("stop")
        ok, why = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert not ok
        assert "KILL_SWITCH" in why

    def test_stops_when_posting_is_backed_up(self, tmp_path):
        """投稿側が詰まっているのに生成だけ進むと、古い投稿が後から出る。"""
        for _ in range(10):
            i = approvals.enqueue(tmp_path, {"text": "x"})
            approvals.approve(tmp_path, i, by="auto")
        ok, why = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert not ok
        assert "たまって" in why

    def test_daily_cap(self, tmp_path):
        for _ in range(2):
            i = approvals.enqueue(tmp_path, {"text": "x"})
            approvals.approve(tmp_path, i, by=approvals.AUTO_APPROVER)
            approvals.set_status(tmp_path, i, "posted")
        ok, why = approvals.auto_approve_decision(
            _persona(max_per_day=2), {"post_category": "empathy"}, tmp_path,
        )
        assert not ok
        assert "上限2" in why

    def test_human_approvals_do_not_count_toward_the_cap(self, tmp_path):
        """人が押したぶんで、自動の枠を食わない。"""
        for _ in range(3):
            i = approvals.enqueue(tmp_path, {"text": "x"})
            approvals.approve(tmp_path, i, by="shota")
            approvals.set_status(tmp_path, i, "posted")
        ok, _ = approvals.auto_approve_decision(
            _persona(max_per_day=2), {"post_category": "empathy"}, tmp_path,
        )
        assert ok


class TestPerRunLimit:
    """post-approved 1回で出す本数。

    生成は夜にまとめて3本積む。ここで全部出すと朝8時に3本まとめて出て、
    枠を3つに分けた意味が無くなる。
    """

    def test_posts_one_at_a_time_by_default(self, tmp_path, monkeypatch):
        from core import main

        for n in range(3):
            i = approvals.enqueue(tmp_path, {"text": f"post {n}", "is_thread": False})
            approvals.approve(tmp_path, i, by="auto")

        published = []
        monkeypatch.setattr(
            main, "_publish_payload",
            lambda account_id, persona, payload, dry_run=False: (
                published.append(payload["text"]) or {"id": "x", "text": payload["text"]}
            ),
        )
        monkeypatch.setattr(
            main, "load_account_config",
            lambda account_id: {
                "account_dir": tmp_path,
                "persona": {
                    "posting": {
                        "posting_types": {"automated": {"max_per_run": 1}},
                    }
                },
            },
        )
        monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
        monkeypatch.setattr(main.writer, "save_to_history", lambda *a, **k: None)
        monkeypatch.setattr(main, "record_post_with_cta", lambda *a, **k: None)

        assert main.run_approved_cycle("acct") is True
        assert published == ["post 0"], "1回で1本だけ、古いほうから"

        assert main.run_approved_cycle("acct") is True
        assert published == ["post 0", "post 1"]


class TestOpeningSequence:
    """最初の10本が出きるまで、自動承認しない。

    アカウントが空の状態では最初の数本でこの亀が何者かが決まる。
    自動生成は型をランダムに掛けるので、放っておくと誰もまだ恋亀を
    知らないうちに商品の話が先に来る。
    """

    def test_blocks_while_opening_posts_are_waiting(self, tmp_path):
        i = approvals.enqueue(tmp_path, {"text": "1本目", "opening": True})
        ok, why = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert not ok
        assert "最初の10本" in why

        # 出きったら、ひとりでに通るようになる
        approvals.set_status(tmp_path, i, "posted")
        ok, _ = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert ok

    def test_rejecting_an_opening_post_also_clears_it(self, tmp_path):
        """没にした1本が、永久に自動承認を止めないこと。"""
        i = approvals.enqueue(tmp_path, {"text": "没", "opening": True})
        approvals.reject(tmp_path, i)
        ok, _ = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert ok

    def test_ordinary_pending_posts_do_not_block(self, tmp_path):
        """告知が承認待ちでも、他が止まらないこと。"""
        approvals.enqueue(tmp_path, {"text": "告知", "post_category": "announce"})
        ok, _ = approvals.auto_approve_decision(
            _persona(), {"post_category": "empathy"}, tmp_path,
        )
        assert ok


class TestOpeningBlocksGeneration:
    """最初の10本が残っているあいだは、生成そのものをしない。

    自動承認は止まっているので、生成しても承認されない下書きが
    1日3本ずつ溜まるだけになる。
    """

    def test_counts_what_is_left(self, tmp_path):
        a = approvals.enqueue(tmp_path, {"text": "1", "opening": True})
        approvals.enqueue(tmp_path, {"text": "2", "opening": True})
        approvals.enqueue(tmp_path, {"text": "ふつうの投稿"})
        assert approvals.opening_remaining(tmp_path) == 2

        approvals.set_status(tmp_path, a, "posted")
        assert approvals.opening_remaining(tmp_path) == 1

    def test_post_cycle_stops_while_they_wait(self, tmp_path, monkeypatch):
        from core import main

        approvals.enqueue(tmp_path, {"text": "1本目", "opening": True})
        generated = []
        monkeypatch.setattr(
            main, "load_account_config",
            lambda account_id: {
                "account_dir": tmp_path,
                "persona": {"posting": {"format": "single"}},
                "rss_feeds": [],
                "history_path": tmp_path / "history.json",
            },
        )
        monkeypatch.setattr(main.poster, "set_current_account", lambda *a, **k: None)
        monkeypatch.setattr(main.supervisor, "preflight_check", lambda *a, **k: True)
        monkeypatch.setattr(
            main.writer, "generate_post",
            lambda *a, **k: generated.append(1) or {"text": "x"},
        )

        assert main.run_post_cycle("acct") is True
        assert generated == [], "生成してしまっている"
