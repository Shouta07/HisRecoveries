"""Tests for writer.generate_source_post — 引用リソース(14本在庫)の消費"""

import json
from collections import Counter

import pytest

from core import writer


@pytest.fixture
def source_account_dir(tmp_path):
    persona = {
        "account_id": "hr",
        "character": {"first_person": "私", "ng_words": []},
        "posting": {"format": "thread", "source_post_ratio": 1.0,
                    "max_chars": 500, "min_chars": 10, "hashtag_count": [0, 1]},
        "validation": {"require_first_person_boku": False, "max_emoji": 2, "max_hashtags": 1,
                       "require_recommended_words": False, "require_allowed_topics": False,
                       "require_three_stage": False, "check_similarity": False},
    }
    (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
    sources = {
        "sources": [{
            "id": "src-test",
            "url": "https://hisrecoveries.com/areas/face?utm_campaign=src-test",
            "materials": {
                "empathy": [f"共感の投稿{i}。鏡の前の話。" for i in range(1, 5)],
                "insight": [f"気づきの投稿{i}。そう思っていた。でも違った。" for i in range(1, 5)],
                "question": [f"問いの投稿{i}。なぜだろう。" for i in range(1, 4)],
                "fact": [f"記録の投稿{i}。毎晩2分だった。" for i in range(1, 3)],
                "core": "核心の1行要約。",
            },
            "status": "active",
            "used_count": 0,
        }]
    }
    (tmp_path / "content_sources.json").write_text(json.dumps(sources, ensure_ascii=False))
    return tmp_path


class TestGenerateSourcePost:
    def test_consumes_14_posts_with_distribution(self, source_account_dir):
        persona = writer.load_persona(source_account_dir)
        seq, url_count = [], 0
        for _ in range(20):
            r = writer.generate_source_post(source_account_dir, persona=persona)
            if r is None:
                break
            seq.append(r["cta_variant"])
            if "hisrecoveries.com" in r["text"]:
                url_count += 1
        assert len(seq) == 14
        assert Counter(seq) == {"empathy": 4, "insight": 4, "question": 3, "fact": 2, "cta": 1}
        assert seq[-1] == "cta"          # 誘導は必ず最後
        assert url_count == 1            # URLは14本中1本だけ

    def test_cta_builds_core_plus_url(self, source_account_dir):
        persona = writer.load_persona(source_account_dir)
        data = json.loads((source_account_dir / "content_sources.json").read_text())
        data["sources"][0]["used_count"] = 13
        (source_account_dir / "content_sources.json").write_text(
            json.dumps(data, ensure_ascii=False))
        r = writer.generate_source_post(source_account_dir, persona=persona)
        assert r["cta_variant"] == "cta"
        assert "核心の1行要約。" in r["text"]
        assert "置いておく" in r["text"]
        assert "utm_campaign=src-test" in r["link"]

    def test_record_false_does_not_advance(self, source_account_dir):
        persona = writer.load_persona(source_account_dir)
        writer.generate_source_post(source_account_dir, persona=persona, record=False)
        data = json.loads((source_account_dir / "content_sources.json").read_text())
        assert data["sources"][0]["used_count"] == 0

    def test_missing_materials_are_skipped_not_invented(self, source_account_dir):
        # 素材が足りない分類は飛ばす（創作しない）
        data = json.loads((source_account_dir / "content_sources.json").read_text())
        data["sources"][0]["materials"]["question"] = []   # 問題提起なし
        (source_account_dir / "content_sources.json").write_text(
            json.dumps(data, ensure_ascii=False))
        persona = writer.load_persona(source_account_dir)
        seq = []
        for _ in range(20):
            r = writer.generate_source_post(source_account_dir, persona=persona)
            if r is None:
                break
            seq.append(r["cta_variant"])
        assert "question" not in seq
        assert len(seq) == 11            # 14 - question3
        assert seq[-1] == "cta"

    def test_returns_none_without_sources_file(self, tmp_path):
        (tmp_path / "persona.json").write_text(json.dumps(
            {"character": {"first_person": "私"}, "posting": {}}))
        assert writer.generate_source_post(tmp_path) is None

    def test_generate_post_falls_back_to_thread_when_exhausted(self, source_account_dir):
        # 在庫を使い切ると連投へフォールバック（Noneでなくスレッドが返る）
        data = json.loads((source_account_dir / "content_sources.json").read_text())
        data["sources"][0]["used_count"] = 14
        (source_account_dir / "content_sources.json").write_text(
            json.dumps(data, ensure_ascii=False))
        # 連投側の最小セット
        (source_account_dir / "patterns.md").write_text("# P\n## 1. sweat\n**機会**: 汗\n")
        (source_account_dir / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (source_account_dir / "thread_templates.json").write_text(json.dumps(
            {"sweat": ["ワキガって自分で気づける？", "個人差があるらしい。", "仕組みを書いている。{link}"]},
            ensure_ascii=False))
        (source_account_dir / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [{"id": "areas-sweat", "type": "areas", "name": "汗", "slug": "sweat",
                            "topics": ["汗"], "status": "active",
                            "min_posts_to_evaluate": 10, "current_posts": 0}],
            "link_config": {"link_ratio_by_type": {"areas": 1.0}, "base_urls": {
                "areas": "https://hisrecoveries.com/areas/{slug}?utm_campaign=areas-{slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (source_account_dir / "monetize.json").write_text(json.dumps({"enabled": False}))
        r = writer.generate_post(source_account_dir, mock=True, record=False)
        assert r is not None
        assert r["is_thread"] is True    # 在庫切れ→連投にフォールバック
