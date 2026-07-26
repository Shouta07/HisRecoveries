"""Tests for CLI (core.main argument parsing)"""

import json
from pathlib import Path
from unittest import mock

import pytest

from core.main import build_parser, cmd_validate, cmd_status, cmd_new_account, cmd_kill
from core import config, supervisor


@pytest.fixture(autouse=True)
def setup_dirs(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "ACCOUNTS_DIR", tmp_path / "accounts")
    monkeypatch.setattr("core.main.ACCOUNTS_DIR", tmp_path / "accounts")
    monkeypatch.setattr(supervisor, "DATA_DIR", tmp_path / "data")
    monkeypatch.setattr(supervisor, "KILL_SWITCH_FILE", tmp_path / "data" / "kill_switch.json")
    monkeypatch.setattr(supervisor, "ERROR_LOG_FILE", tmp_path / "data" / "error_log.json")
    monkeypatch.delenv("KILL_SWITCH", raising=False)

    # テスト用アカウント作成
    acct = tmp_path / "accounts" / "test-acct"
    acct.mkdir(parents=True)
    persona = {
        "account_id": "test-acct",
        "genre": "テスト",
        "tone": {"style": "test"},
        "character": {"background": "test", "values": [], "ng_words": []},
        "posting": {"time_slots": ["08:00"], "max_chars": 500, "hashtag_count": [2, 4]},
    }
    (acct / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
    (acct / "history.json").write_text(json.dumps({"posts": [], "total_count": 0}))
    (acct / "patterns.md").write_text(
        "\n".join(f"## {i}. P{i}\n" for i in range(1, 6))
    )


class TestParser:
    def test_post_command(self):
        parser = build_parser()
        args = parser.parse_args(["post", "mens-body-lab", "--dry-run"])
        assert args.command == "post"
        assert args.account == "mens-body-lab"
        assert args.dry_run is True

    def test_schedule_command(self):
        parser = build_parser()
        args = parser.parse_args(["schedule"])
        assert args.command == "schedule"
        assert args.account == "mens-body-lab"

    def test_validate_command(self):
        parser = build_parser()
        args = parser.parse_args(["validate", "test-acct"])
        assert args.command == "validate"

    def test_kill_command(self):
        parser = build_parser()
        args = parser.parse_args(["kill", "on", "--reason", "test"])
        assert args.action == "on"
        assert args.reason == "test"

    def test_new_account_command(self):
        parser = build_parser()
        args = parser.parse_args(["new-account", "client-01", "--genre", "美容"])
        assert args.name == "client-01"
        assert args.genre == "美容"


class TestCmdValidate:
    def test_valid(self):
        args = mock.Mock(account="test-acct")
        assert cmd_validate(args) == 0

    def test_all(self):
        args = mock.Mock(account="all")
        assert cmd_validate(args) == 0


class TestCmdNewAccount:
    def test_creates(self, tmp_path):
        args = mock.Mock()
        args.name = "new-test"
        args.genre = "美容"
        args.display_name = "Beauty Bot"

        result = cmd_new_account(args)
        assert result == 0

        acct_dir = tmp_path / "accounts" / "new-test"
        assert acct_dir.exists()
        assert (acct_dir / "persona.json").exists()
        assert (acct_dir / "history.json").exists()
        assert (acct_dir / "patterns.md").exists()
        assert (acct_dir / "rss_feeds.json").exists()

        persona = json.loads((acct_dir / "persona.json").read_text())
        assert persona["genre"] == "美容"
        assert persona["display_name"] == "Beauty Bot"

    def test_duplicate(self):
        args = mock.Mock()
        args.name = "test-acct"
        args.genre = ""
        args.display_name = ""
        assert cmd_new_account(args) == 1


class TestCmdKill:
    def test_on_off_status(self):
        args_on = mock.Mock(action="on", reason="testing")
        cmd_kill(args_on)
        assert supervisor.is_kill_switch_active() is True

        args_off = mock.Mock(action="off", reason=None)
        cmd_kill(args_off)
        assert supervisor.is_kill_switch_active() is False

        args_status = mock.Mock(action="status", reason=None)
        assert cmd_kill(args_status) == 0
