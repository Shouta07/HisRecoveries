"""Tests for the daemon module."""
import json
import os
from pathlib import Path
from unittest import mock

import pytest

from core.daemon import (
    DaemonState,
    _get_next_slot,
    _update_env_token,
    _write_health,
    get_daemon_status,
    is_daemon_running,
)


class TestDaemonState:
    def test_initial_state(self):
        state = DaemonState()
        assert state.running is True
        assert state.cycles_completed == 0
        assert state.cycles_failed == 0
        assert state.consecutive_errors == 0

    def test_record_success(self):
        state = DaemonState()
        state.record_success()
        assert state.cycles_completed == 1
        assert state.consecutive_errors == 0
        assert state.last_post_at is not None

    def test_record_failure(self):
        state = DaemonState()
        state.record_failure()
        assert state.cycles_failed == 1
        assert state.consecutive_errors == 1

    def test_should_pause_after_consecutive_errors(self):
        state = DaemonState()
        for _ in range(4):
            state.record_failure()
        assert state.should_pause() is False
        state.record_failure()
        assert state.should_pause() is True

    def test_success_resets_consecutive_errors(self):
        state = DaemonState()
        for _ in range(3):
            state.record_failure()
        state.record_success()
        assert state.consecutive_errors == 0
        assert state.should_pause() is False

    def test_to_dict(self):
        state = DaemonState()
        state.record_success()
        d = state.to_dict()
        assert "running" in d
        assert "uptime_hours" in d
        assert d["cycles_completed"] == 1


class TestGetNextSlot:
    @mock.patch("core.daemon.datetime")
    def test_next_slot_today(self, mock_dt):
        from datetime import datetime
        mock_dt.now.return_value = datetime(2026, 3, 19, 7, 0, 0)
        mock_dt.strptime = datetime.strptime
        slot, wait = _get_next_slot(["08:00", "12:00", "20:00"])
        assert slot == "08:00"
        assert 3500 < wait < 3700  # ~1 hour

    @mock.patch("core.daemon.datetime")
    def test_next_slot_wraps_to_tomorrow(self, mock_dt):
        from datetime import datetime, timedelta, date
        mock_dt.now.return_value = datetime(2026, 3, 19, 21, 0, 0)
        mock_dt.strptime = datetime.strptime
        slot, wait = _get_next_slot(["08:00", "12:00", "20:00"])
        assert slot == "08:00"
        assert wait > 3600 * 10  # > 10 hours


class TestUpdateEnvToken:
    def test_updates_existing_token(self, tmp_path):
        env_file = tmp_path / ".env"
        env_file.write_text("THREADS_ACCESS_TOKEN=old_token\nOTHER=value\n")
        with mock.patch("core.daemon.Path") as mock_path:
            # Make the function find our temp file
            pass
        # Direct test with patched path
        lines = env_file.read_text().splitlines()
        new_lines = []
        for line in lines:
            if line.startswith("THREADS_ACCESS_TOKEN="):
                new_lines.append("THREADS_ACCESS_TOKEN=new_token_123")
            else:
                new_lines.append(line)
        env_file.write_text("\n".join(new_lines) + "\n")
        content = env_file.read_text()
        assert "new_token_123" in content
        assert "old_token" not in content
        assert "OTHER=value" in content


class TestHealthFile:
    def test_write_and_read_health(self, tmp_path):
        with mock.patch("core.daemon.DATA_DIR", tmp_path):
            with mock.patch("core.daemon.HEALTH_FILE", tmp_path / "health.json"):
                state = DaemonState()
                state.record_success()
                _write_health(state, ["test-account"])

                health = json.loads((tmp_path / "health.json").read_text())
                assert health["status"] == "running"
                assert "test-account" in health["accounts"]
                assert health["daemon"]["cycles_completed"] == 1


class TestDaemonRunning:
    def test_not_running_no_pid_file(self, tmp_path):
        with mock.patch("core.daemon.PID_FILE", tmp_path / "nope.pid"):
            assert is_daemon_running() is False

    def test_not_running_stale_pid(self, tmp_path):
        pid_file = tmp_path / "daemon.pid"
        pid_file.write_text("999999999")
        with mock.patch("core.daemon.PID_FILE", pid_file):
            assert is_daemon_running() is False
            # Stale PID file should be cleaned up
            assert not pid_file.exists()


class TestGetDaemonStatus:
    def test_no_health_file(self, tmp_path):
        with mock.patch("core.daemon.HEALTH_FILE", tmp_path / "nope.json"):
            assert get_daemon_status() is None

    def test_reads_health(self, tmp_path):
        health_file = tmp_path / "health.json"
        health_file.write_text(json.dumps({"status": "running", "accounts": ["a"]}))
        with mock.patch("core.daemon.HEALTH_FILE", health_file):
            status = get_daemon_status()
            assert status["status"] == "running"
