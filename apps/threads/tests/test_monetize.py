"""Tests for core.monetize"""

import json
from pathlib import Path
from unittest import mock

import pytest

from core import monetize


@pytest.fixture(autouse=True)
def clean_data(tmp_path, monkeypatch):
    monkeypatch.setattr(monetize, "DATA_DIR", tmp_path)
    monkeypatch.setattr(monetize, "REVENUE_FILE", tmp_path / "revenue.json")


@pytest.fixture
def sample_config():
    return {
        "enabled": True,
        "cta_insertion_rate": 1.0,  # 100% for testing
        "cta_templates": [
            {"text": "→ プロフのリンクへ", "weight": 1},
            {"text": "→ 詳しくはこちら", "weight": 2},
        ],
        "products": [
            {
                "id": "test-product",
                "name": "テスト商品",
                "type": "affiliate",
                "topic_hint": "テスト用ネタ",
                "weight": 1,
                "active": True,
            },
        ],
    }


class TestLoadMonetizeConfig:
    def test_missing_file(self, tmp_path):
        cfg = monetize.load_monetize_config(tmp_path)
        assert cfg["enabled"] is False

    def test_existing_file(self, tmp_path, sample_config):
        (tmp_path / "monetize.json").write_text(
            json.dumps(sample_config, ensure_ascii=False)
        )
        cfg = monetize.load_monetize_config(tmp_path)
        assert cfg["enabled"] is True
        assert len(cfg["cta_templates"]) == 2


class TestSelectCta:
    def test_disabled(self):
        assert monetize.select_cta({"enabled": False}, "text") is None

    def test_selects_cta(self, sample_config):
        cta = monetize.select_cta(sample_config, "some post text")
        assert cta in ["→ プロフのリンクへ", "→ 詳しくはこちら"]

    def test_empty_templates(self):
        cfg = {"enabled": True, "cta_insertion_rate": 1.0, "cta_templates": []}
        assert monetize.select_cta(cfg, "text") is None


class TestInjectCta:
    def test_basic_injection(self):
        result = monetize.inject_cta("本文です", "→ CTAテスト")
        assert "本文です" in result
        assert "→ CTAテスト" in result

    def test_respects_max_chars(self):
        long_text = "あ" * 490
        result = monetize.inject_cta(long_text, "→ CTA", max_chars=500)
        assert len(result) <= 500

    def test_too_long_cta_skips(self):
        long_text = "あ" * 498
        result = monetize.inject_cta(long_text, "→ CTA", max_chars=500)
        assert len(result) <= 500


class TestSelectProductTopic:
    def test_selects(self, sample_config):
        product = monetize.select_product_topic(sample_config)
        assert product is not None
        assert product["id"] == "test-product"

    def test_no_products(self):
        assert monetize.select_product_topic({"products": []}) is None

    def test_inactive_products(self):
        cfg = {"products": [{"id": "x", "active": False, "weight": 1}]}
        assert monetize.select_product_topic(cfg) is None


class TestRevenueTracking:
    def test_record_and_summary(self):
        post = {"thread_id": "123", "text": "test post"}
        monetize.record_post_with_cta(post, "→ CTA", {"id": "p1", "name": "商品A"})
        monetize.record_post_with_cta(post, None, None)

        summary = monetize.get_revenue_summary()
        assert summary["total_posts"] == 2
        assert summary["posts_with_cta"] == 1
        assert summary["cta_rate"] == 50.0
        assert "商品A" in summary["product_breakdown"]

    def test_empty_summary(self):
        summary = monetize.get_revenue_summary()
        assert summary["total_posts"] == 0
