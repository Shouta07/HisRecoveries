"""Tests for core.config"""

import json
from pathlib import Path

import pytest

from core import config


@pytest.fixture
def mock_accounts(tmp_path, monkeypatch):
    """テスト用アカウントディレクトリを作成"""
    monkeypatch.setattr(config, "ACCOUNTS_DIR", tmp_path)

    account_dir = tmp_path / "test-account"
    account_dir.mkdir()

    persona = {
        "account_id": "test-account",
        "genre": "テスト",
        "tone": {"style": "test"},
        "character": {"background": "test", "values": [], "ng_words": []},
        "posting": {
            "frequency_per_day": 3,
            "time_slots": ["08:00", "12:00", "20:00"],
            "max_chars": 500,
            "hashtag_count": [2, 4],
        },
    }
    (account_dir / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (account_dir / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (account_dir / "patterns.md").write_text(
        "# Patterns\n"
        + "\n".join(f"## {i}. Pattern{i}\n**構造**: test\n**例**: test"
                     for i in range(1, 6))
    )
    (account_dir / "rss_feeds.json").write_text(
        json.dumps({"feeds": ["https://example.com/rss"]})
    )

    return tmp_path


class TestListAccounts:
    def test_lists(self, mock_accounts):
        accounts = config.list_accounts()
        assert accounts == ["test-account"]

    def test_empty(self, tmp_path, monkeypatch):
        monkeypatch.setattr(config, "ACCOUNTS_DIR", tmp_path)
        assert config.list_accounts() == []


class TestLoadAccountConfig:
    def test_loads(self, mock_accounts):
        cfg = config.load_account_config("test-account")
        assert cfg["account_id"] == "test-account"
        assert cfg["persona"]["genre"] == "テスト"
        assert len(cfg["rss_feeds"]) == 1

    def test_missing_account(self, mock_accounts):
        with pytest.raises(FileNotFoundError):
            config.load_account_config("nonexistent")


class TestValidateAccount:
    def test_valid(self, mock_accounts):
        errors = config.validate_account("test-account")
        assert errors == []

    def test_missing_persona_key(self, mock_accounts):
        persona_path = mock_accounts / "test-account" / "persona.json"
        persona = json.loads(persona_path.read_text())
        del persona["genre"]
        persona_path.write_text(json.dumps(persona))

        errors = config.validate_account("test-account")
        assert any("genre" in e for e in errors)

    def test_missing_directory(self, mock_accounts):
        errors = config.validate_account("nonexistent")
        assert len(errors) == 1
