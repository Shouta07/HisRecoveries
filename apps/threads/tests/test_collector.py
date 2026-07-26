"""Tests for core.collector.import_history — 過去投稿の取り込み"""

import json
from unittest import mock

from core import collector


def _read(account_dir):
    return json.loads((account_dir / "history.json").read_text())


class TestImportHistory:
    def _patches(self, threads):
        return (
            mock.patch("core.collector.get_all_threads_paginated", return_value=threads),
            mock.patch("core.collector.get_thread_insights", return_value={"data": [
                {"name": "views", "values": [{"value": 1500}]},
                {"name": "likes", "values": [{"value": 40}]},
            ]}),
            mock.patch("core.poster.get_user_id", return_value="me"),
        )

    def test_imports_with_metrics(self, tmp_path):
        (tmp_path / "history.json").write_text(json.dumps(
            {"posts": [], "last_posted_at": None, "total_count": 0}))
        threads = [
            {"id": "t1", "text": "過去投稿1", "timestamp": "2026-06-01T10:00:00"},
            {"id": "t2", "text": "過去投稿2", "timestamp": "2026-06-02T10:00:00"},
        ]
        p1, p2, p3 = self._patches(threads)
        with p1, p2, p3:
            added = collector.import_history(tmp_path, account_id="acc")
        assert added == 2
        data = _read(tmp_path)
        assert data["total_count"] == 2
        assert data["posts"][0]["metrics"]["impressions"] == 1500
        assert data["posts"][0]["source_type"] == "imported"

    def test_dedup_on_reimport(self, tmp_path):
        (tmp_path / "history.json").write_text(json.dumps(
            {"posts": [{"thread_id": "t1", "text": "既存"}], "total_count": 1}))
        threads = [
            {"id": "t1", "text": "過去投稿1", "timestamp": "x"},
            {"id": "t2", "text": "過去投稿2", "timestamp": "y"},
        ]
        p1, p2, p3 = self._patches(threads)
        with p1, p2, p3:
            added = collector.import_history(tmp_path, account_id="acc")
        # t1 は既存なのでスキップ、t2 のみ追加
        assert added == 1
        assert _read(tmp_path)["total_count"] == 2

    def test_skips_insights_when_disabled(self, tmp_path):
        (tmp_path / "history.json").write_text(json.dumps({"posts": []}))
        threads = [{"id": "t1", "text": "x", "timestamp": "z"}]
        p1, p2, p3 = self._patches(threads)
        with p1, p2, p3:
            collector.import_history(tmp_path, account_id="acc", with_insights=False)
        assert "metrics" not in _read(tmp_path)["posts"][0]
