"""Tests for core.supervisor"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock

import pytest

from core import supervisor


@pytest.fixture(autouse=True)
def clean_data(tmp_path, monkeypatch):
    """テストごとにDATA_DIRをtmp_pathに差し替え"""
    monkeypatch.setattr(supervisor, "DATA_DIR", tmp_path)
    monkeypatch.setattr(supervisor, "KILL_SWITCH_FILE", tmp_path / "kill_switch.json")
    monkeypatch.setattr(supervisor, "ERROR_LOG_FILE", tmp_path / "error_log.json")
    monkeypatch.delenv("KILL_SWITCH", raising=False)


class TestKillSwitch:
    def test_not_active_by_default(self):
        assert supervisor.is_kill_switch_active() is False

    def test_env_kill_switch(self, monkeypatch):
        monkeypatch.setenv("KILL_SWITCH", "true")
        assert supervisor.is_kill_switch_active() is True

    def test_file_kill_switch(self):
        supervisor.activate_kill_switch("test reason")
        assert supervisor.is_kill_switch_active() is True

    def test_deactivate(self):
        supervisor.activate_kill_switch("test")
        supervisor.deactivate_kill_switch()
        assert supervisor.is_kill_switch_active() is False

    def test_deactivate_no_file(self):
        supervisor.deactivate_kill_switch()  # should not raise


class TestRateLimit:
    def test_empty_history(self, tmp_path):
        history_path = tmp_path / "history.json"
        assert supervisor.check_rate_limit("test", history_path) is True

    def test_within_limit(self, tmp_path):
        history_path = tmp_path / "history.json"
        posts = [
            {"posted_at": datetime.now().isoformat(), "text": f"post {i}"}
            for i in range(3)
        ]
        history_path.write_text(json.dumps({"posts": posts}))
        assert supervisor.check_rate_limit("test", history_path) is True

    def test_exceeded(self, tmp_path):
        history_path = tmp_path / "history.json"
        posts = [
            {"posted_at": datetime.now().isoformat(), "text": f"post {i}"}
            for i in range(10)
        ]
        history_path.write_text(json.dumps({"posts": posts}))
        assert supervisor.check_rate_limit("test", history_path) is False


class TestRecordError:
    def test_records_error(self):
        supervisor.record_error("test_type", "some detail")
        errors = json.loads(supervisor.ERROR_LOG_FILE.read_text())
        assert len(errors) == 1
        assert errors[0]["type"] == "test_type"

    def test_auto_kill_on_threshold(self):
        for i in range(supervisor.MAX_ERRORS_PER_HOUR):
            supervisor.record_error("flood", f"error {i}")
        assert supervisor.is_kill_switch_active() is True


class TestPreflightCheck:
    def test_passes(self, tmp_path):
        history_path = tmp_path / "history.json"
        assert supervisor.preflight_check("test", history_path) is True

    def test_fails_with_kill_switch(self, tmp_path):
        history_path = tmp_path / "history.json"
        supervisor.activate_kill_switch("test")
        assert supervisor.preflight_check("test", history_path) is False
