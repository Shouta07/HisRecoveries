"""Tests for core.poster — 連投(スレッド)チェーン投稿"""

from unittest import mock

from core import poster


class TestCreateThreadChain:
    def test_posts_head_then_replies_in_order(self):
        # create_thread_post をモックし、連投が返信チェーンになることを検証
        calls = []

        def fake_create(user_id, text, wait=True, link_attachment=None,
                        account_id="", persona=None, reply_to_id=None):
            calls.append({
                "text": text, "reply_to_id": reply_to_id,
                "link_attachment": link_attachment, "wait": wait,
            })
            return {"thread_id": f"id{len(calls)}", "text": text}

        posts = ["1投目", "2投目", "3投目"]
        with mock.patch.object(poster, "create_thread_post", side_effect=fake_create), \
                mock.patch.object(poster.time, "sleep"):
            result = poster.create_thread_chain(
                user_id="me", posts=posts,
                link_attachment_last="https://example.com/apply",
            )

        assert result is not None
        assert result["thread_id"] == "id1"
        assert result["reply_ids"] == ["id2", "id3"]
        # 1投目はreply_to_idなし、以降は直前のIDへの返信
        assert calls[0]["reply_to_id"] is None
        assert calls[1]["reply_to_id"] == "id1"
        assert calls[2]["reply_to_id"] == "id2"
        # リンクは最終投稿にだけ付く
        assert calls[0]["link_attachment"] is None
        assert calls[1]["link_attachment"] is None
        assert calls[2]["link_attachment"] == "https://example.com/apply"

    def test_empty_posts_returns_none(self):
        assert poster.create_thread_chain(user_id="me", posts=[]) is None

    def test_head_failure_aborts(self):
        with mock.patch.object(poster, "create_thread_post", return_value=None):
            result = poster.create_thread_chain(user_id="me", posts=["a", "b"])
        assert result is None

    def test_partial_chain_returns_head(self):
        # 2投目で失敗しても、先頭は投稿済みなので結果を返す（チェーン不完全）
        seq = [{"thread_id": "id1", "text": "a"}, None]

        def fake_create(*args, **kwargs):
            return seq.pop(0)

        with mock.patch.object(poster, "create_thread_post", side_effect=fake_create), \
                mock.patch.object(poster.time, "sleep"):
            result = poster.create_thread_chain(user_id="me", posts=["a", "b", "c"])

        assert result is not None
        assert result["thread_id"] == "id1"
        assert result["reply_ids"] == []
