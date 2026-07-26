"""Tests for core.researcher"""

import json
from pathlib import Path
from unittest import mock

import pytest

from core import researcher


@pytest.fixture(autouse=True)
def clean_data(tmp_path, monkeypatch):
    monkeypatch.setattr(researcher, "DATA_DIR", tmp_path)
    monkeypatch.setattr(researcher, "TOPICS_FILE", tmp_path / "topics.json")
    monkeypatch.setattr(researcher, "VIRAL_POSTS_FILE", tmp_path / "viral_posts.json")


class TestExtractTag:
    def test_extracts(self):
        assert researcher._extract_tag("<title>Hello</title>", "title") == "Hello"

    def test_missing(self):
        assert researcher._extract_tag("<other>x</other>", "title") == ""


class TestCollectTopics:
    def test_filters_by_genre(self):
        items = [
            {"title": "転職市場が活況", "link": "https://example.com/1", "source": "rss"},
            {"title": "天気予報", "link": "https://example.com/2", "source": "rss"},
        ]
        persona = {"genre": "転職"}

        with mock.patch.object(researcher, "fetch_trending_from_rss", return_value=items):
            topics = researcher.collect_topics(["https://dummy"], persona)

        titles = [t["title"] for t in topics]
        assert "転職市場が活況" in titles

    def test_fills_up_when_few_relevant(self):
        items = [
            {"title": "無関係トピック", "link": "", "source": "rss"},
        ]
        persona = {"genre": "転職"}

        with mock.patch.object(researcher, "fetch_trending_from_rss", return_value=items):
            topics = researcher.collect_topics(["https://dummy"], persona)

        assert len(topics) >= 1


class TestSaveLoadTopics:
    def test_save_and_load(self):
        topics = [{"title": "test", "link": "", "source": "rss"}]
        researcher.save_topics(topics)

        loaded = researcher.load_topics()
        assert len(loaded) == 1
        assert loaded[0]["title"] == "test"

    def test_load_empty(self):
        assert researcher.load_topics() == []


class TestSaveLoadViralPosts:
    def test_save_and_load(self):
        posts = [
            {"text": "バズ投稿1", "likes": 50, "source_type": "competitor"},
            {"text": "バズ投稿2", "likes": 100, "source_type": "own_viral"},
        ]
        researcher.save_viral_posts(posts)
        loaded = researcher.load_viral_posts()
        assert len(loaded) == 2
        assert loaded[0]["text"] == "バズ投稿1"

    def test_load_empty(self):
        assert researcher.load_viral_posts() == []


class TestFetchOwnViralPosts:
    def test_extracts_viral(self, tmp_path):
        history = {
            "posts": [
                {"text": "普通1", "likes": 5},
                {"text": "普通2", "likes": 3},
                {"text": "バズ投稿", "likes": 50},
            ]
        }
        (tmp_path / "history.json").write_text(json.dumps(history))
        result = researcher.fetch_own_viral_posts(tmp_path)
        assert len(result) >= 1
        assert result[0]["text"] == "バズ投稿"

    def test_empty_history(self, tmp_path):
        (tmp_path / "history.json").write_text(json.dumps({"posts": []}))
        assert researcher.fetch_own_viral_posts(tmp_path) == []


class TestBalanceByTheme:
    def test_distributes_across_themes(self):
        posts = [
            {"text": "AGA治療について", "likes": 100},
            {"text": "AGA治療のコスト", "likes": 80},
            {"text": "薄毛対策のシャンプー", "likes": 60},
        ]
        themes = ["AGA治療", "薄毛対策"]
        result = researcher._balance_by_theme(posts, themes)
        # 各テーマから均等に取得される
        assert len(result) >= 2

    def test_empty_posts(self):
        result = researcher._balance_by_theme([], ["テーマ1"])
        assert result == []


class TestCollectViralPosts:
    def test_collects_rss_fallback(self, tmp_path):
        persona = {"genre": "テスト", "viral_sources": {}}
        (tmp_path / "history.json").write_text(json.dumps({"posts": []}))
        rss_items = [{"title": "RSSネタ", "link": "", "source": "rss"}]
        with mock.patch.object(researcher, "fetch_trending_from_rss", return_value=rss_items):
            result = researcher.collect_viral_posts(tmp_path, persona, ["https://dummy"])
        assert len(result) >= 1
        assert result[0]["source_type"] == "rss_trend"

    def test_uses_search_keywords(self, tmp_path):
        persona = {
            "genre": "テスト",
            "viral_sources": {
                "search_keywords": ["AGA治療", "薄毛"],
            },
        }
        (tmp_path / "history.json").write_text(json.dumps({"posts": []}))
        keyword_results = [
            {"text": "キーワード検索結果", "likes": 50, "keyword": "AGA治療",
             "source_type": "keyword_search", "collected_at": "2025-01-01"},
        ]
        with mock.patch.object(researcher, "fetch_keyword_viral_posts", return_value=keyword_results):
            result = researcher.collect_viral_posts(tmp_path, persona, [])
        assert len(result) >= 1
        assert result[0]["source_type"] == "keyword_search"

    def test_fallback_keywords_from_theme_tree(self, tmp_path):
        """search_keywords未設定時、theme_treeから自動生成"""
        persona = {
            "genre": "テスト",
            "viral_sources": {
                "theme_tree": ["テーマA", "テーマB"],
            },
        }
        (tmp_path / "history.json").write_text(json.dumps({"posts": []}))
        with mock.patch.object(researcher, "fetch_keyword_viral_posts", return_value=[]) as mock_fetch:
            with mock.patch.object(researcher, "fetch_trending_from_rss", return_value=[]):
                researcher.collect_viral_posts(tmp_path, persona, [])
        # theme_treeがsearch_keywordsとして使われた
        mock_fetch.assert_called_once()
        called_keywords = mock_fetch.call_args[0][0]
        assert "テーマA" in called_keywords
