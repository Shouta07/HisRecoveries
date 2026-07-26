"""Tests for core.writer"""

import json
from pathlib import Path
from unittest import mock

import pytest

from core import writer


@pytest.fixture
def account_dir(tmp_path):
    """テスト用アカウントディレクトリ"""
    persona = {
        "account_id": "test",
        "genre": "男性の体の悩み・Recovery（多汗症・ニキビ・ワキガ・顔の自信）",
        "target_audience": "10代後半〜30代の体の悩みを抱える男性",
        "tone": {
            "style": "丁寧体・観察スタイル",
            "formality": "丁寧体",
            "emoji_usage": "完全禁止",
            "line_breaks": "1文ごとに改行",
            "recommended_words": ["気づいた", "思った", "だった", "整える", "向き合う", "続けている", "静かに"],
            "forbidden_words": ["マジで", "実は", "正直", "おすすめです"],
        },
        "character": {
            "name": "Nagi",
            "background": "多汗症・ニキビ・ワキガと向き合い続けている当事者",
            "first_person": "僕",
            "values": ["観察を主張に優先する"],
            "ng_words": ["マジで", "実は", "正直", "俺"],
        },
        "posting": {
            "max_chars": 450,
            "min_chars": 30,
            "hashtag_count": [0, 0],
        },
        "allowed_topics": ["鏡", "写真", "清潔感", "匂い", "汗", "肌", "整える", "皮膚科", "顔", "疲", "自信", "印象", "自意識", "髪", "髭", "朝", "距離", "ニキビ", "ワキガ"],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n"
        "## 1. mirror\n**構造**: test\n**例**: test\n\n"
        "## 2. photo\n**構造**: test\n**例**: test\n\n"
        "## 3. cleanliness\n**構造**: test\n**例**: test\n\n"
        "## 4. sweat-odor\n**構造**: test\n**例**: test\n\n"
        "## 5. mind-awareness\n**構造**: test\n**例**: test\n"
    )
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "mirror", "type": "feeling", "name": "鏡", "slug": "mirror",
             "topics": ["鏡"], "status": "active", "min_posts_to_evaluate": 10, "current_posts": 0}
        ],
        "link_config": {"has_link_ratio": 0, "base_urls": {}, "link_intro_phrases": []},
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 2, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


@pytest.fixture
def persona():
    return {
        "genre": "男性の体の悩み・Recovery（多汗症・ニキビ・ワキガ・顔の自信）",
        "target_audience": "10代後半〜30代の体の悩みを抱える男性",
    }


class TestLoadPersona:
    def test_loads(self, account_dir):
        persona = writer.load_persona(account_dir)
        assert "Recovery" in persona["genre"]


class TestLoadPatterns:
    def test_extracts_patterns(self, account_dir):
        patterns = writer.load_patterns(account_dir)
        assert len(patterns) == 5
        assert "mirror" in patterns
        assert "photo" in patterns


class TestLoadHistory:
    def test_empty(self, account_dir):
        history = writer.load_history(account_dir)
        assert history == []

    def test_with_posts(self, account_dir):
        data = {
            "posts": [{"text": "hello", "posted_at": "2025-01-01T00:00:00"}],
            "total_count": 1,
        }
        (account_dir / "history.json").write_text(json.dumps(data))
        history = writer.load_history(account_dir)
        assert len(history) == 1


class TestSimilarity:
    def test_not_similar(self):
        history = [{"text": "今日はいい天気ですね"}]
        assert writer.is_too_similar("転職に大事なのは準備です", history) is False

    def test_too_similar(self):
        text = "転職で一番大事なのはタイミングではなく準備です"
        history = [{"text": "転職で一番大事なのはタイミングではなく準備です。"}]
        assert writer.is_too_similar(text, history) is True

    def test_empty_history(self):
        assert writer.is_too_similar("anything", []) is False


class TestSaveToHistory:
    def test_saves(self, account_dir):
        post = {"text": "test post", "posted_at": "2025-01-01T00:00:00"}
        writer.save_to_history(account_dir, post)

        data = json.loads((account_dir / "history.json").read_text())
        assert data["total_count"] == 1
        assert data["posts"][0]["text"] == "test post"

    def test_appends(self, account_dir):
        for i in range(3):
            writer.save_to_history(account_dir, {
                "text": f"post {i}", "posted_at": f"2025-01-0{i+1}T00:00:00"
            })
        data = json.loads((account_dir / "history.json").read_text())
        assert data["total_count"] == 3


class TestSelectViralSource:
    def test_from_viral_posts(self, account_dir):
        viral = [
            {"text": "バズった投稿", "likes": 100, "source_type": "competitor"},
        ]
        with mock.patch("core.researcher.load_viral_posts", return_value=viral):
            result = writer.select_viral_source(account_dir, {})
        assert result is not None
        assert result["text"] == "バズった投稿"

    def test_fallback_to_own_history(self, account_dir):
        # viral_postsが空のとき、自分のバズ投稿にフォールバック
        history = {
            "posts": [
                {"text": "普通の投稿", "likes": 5},
                {"text": "バズった自分の投稿", "likes": 50},
            ],
            "total_count": 2,
        }
        (account_dir / "history.json").write_text(json.dumps(history))
        with mock.patch("core.researcher.load_viral_posts", return_value=[]):
            result = writer.select_viral_source(account_dir, {})
        assert result is not None
        assert result["text"] == "バズった自分の投稿"

    def test_returns_none_when_empty(self, account_dir):
        with mock.patch("core.researcher.load_viral_posts", return_value=[]):
            result = writer.select_viral_source(account_dir, {})
        assert result is None


class TestBuildRewritePrompt:
    def test_with_source(self, persona):
        prompt = writer._build_rewrite_prompt(persona, "元ネタ投稿", "断言型")
        assert "元ネタ投稿" in prompt
        assert "断言型" in prompt
        assert "リライト" in prompt

    def test_without_source_with_topic(self, persona):
        prompt = writer._build_rewrite_prompt(persona, "", "共感型", topic="手汗")
        assert "手汗" in prompt
        assert "リライト" not in prompt

    def test_without_source_or_topic(self, persona):
        prompt = writer._build_rewrite_prompt(persona, "", "逆説型")
        assert "逆説型" in prompt


class TestSelfScoreBuzz:
    def test_mock_mode(self, persona):
        score = writer._self_score_buzz("テスト投稿", persona, mock=True)
        assert 7 <= score <= 9

    def test_parses_number_from_response(self, persona):
        with mock.patch.object(writer, "_call_gemini", return_value="8"):
            score = writer._self_score_buzz(
                "テスト投稿", persona, gemini_key="fake-key",
            )
        assert score == 8

    def test_clamps_score(self, persona):
        with mock.patch.object(writer, "_call_gemini", return_value="15"):
            score = writer._self_score_buzz(
                "テスト投稿", persona, gemini_key="fake-key",
            )
        assert score == 10

    def test_defaults_on_failure(self, persona):
        with mock.patch.object(writer, "_call_gemini", return_value=None):
            score = writer._self_score_buzz(
                "テスト投稿", persona, gemini_key="fake-key",
            )
        assert score == 7


@pytest.fixture
def gift_account_dir(tmp_path):
    """ギフト導線（贈り手の視点）アカウントのテスト用ディレクトリ"""
    persona = {
        "account_id": "nagi-gift",
        "genre": "贈り手の視点で第一印象を整える贈り物を置く",
        "target_audience": "大切な人の見た目の変化に気づいている人",
        "tone": {
            "style": "丁寧体・観察スタイル",
            "emoji_usage": "完全禁止",
            "forbidden_words": ["あなたも", "おすすめです", "ぜひ"],
        },
        "character": {
            "name": "灯",
            "first_person": "私",
            "ng_words": ["あなたも", "おすすめです", "ぜひ", "恋愛", "デート"],
        },
        "posting": {"max_chars": 450, "min_chars": 30, "hashtag_count": [0, 0]},
        "allowed_topics": ["第一印象", "印象", "整える", "贈り物", "診断"],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n## 1. gift-notice\n**構造**: test\n**例**: test\n"
    )
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "gift-notice", "type": "gift", "name": "気づき",
             "slug": "gift-notice", "topics": ["気づき"], "status": "active",
             "min_posts_to_evaluate": 10, "current_posts": 0}
        ],
        "link_config": {
            "link_ratio_by_type": {"gift": 1.0},
            "base_urls": {
                "check": "https://hisrecoveries.com/check?utm_campaign={slug}",
                "gift": "https://hisrecoveries.com/gift?utm_campaign={slug}",
            },
            "link_intro_phrases": {"gift": ["自分を知る時間を、贈れる場所がある。"]},
        },
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


class TestGiftLinkBranch:
    def test_gift_post_links_to_check_with_slug_utm(self, gift_account_dir):
        # gift type は診断(/check)へ、slug一致のUTM付きで遷移する
        result = writer.generate_post(gift_account_dir, mock=True)
        assert result is not None
        assert result["topic_type"] == "gift"
        assert result["topic_slug"] == "gift-notice"
        assert result["has_link"] is True
        assert "/check?utm_campaign=gift-notice" in result["link"]
        # 本文とリンクのslugが一致している（食い違いバグ防止）
        assert "gift-notice" in result["text"]


@pytest.fixture
def gift_thread_account_dir(tmp_path):
    """連投(スレッド)フォーマットのギフトアカウント。"""
    persona = {
        "account_id": "nagi-gift",
        "genre": "ギフト連投",
        "character": {"name": "贈り手", "first_person": "私", "ng_words": []},
        "posting": {
            "format": "thread", "max_chars": 500, "min_chars": 10,
            "hashtag_count": [0, 1],
        },
        "validation": {
            "require_first_person_boku": False, "max_emoji": 2, "max_hashtags": 1,
            "require_recommended_words": False, "require_allowed_topics": False,
            "require_three_stage": False, "check_similarity": False,
        },
        "allowed_topics": ["第一印象", "贈り物"],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n## 1. gift-birthday\n**機会**: 誕生日\n"
    )
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "gift-birthday", "type": "gift", "name": "誕生日に自信を贈る",
             "slug": "gift-birthday", "topics": ["誕生日"], "status": "active",
             "min_posts_to_evaluate": 10, "current_posts": 0}
        ],
        "link_config": {
            "link_ratio_by_type": {"gift": 1.0},
            "base_urls": {
                "apply": "https://hisrecoveries.com/apply?utm_campaign={slug}",
            },
        },
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


class TestThreadTemplateLoading:
    def test_loads_from_file_when_present(self, gift_thread_account_dir):
        # thread_templates.json があれば優先して読む
        (gift_thread_account_dir / "thread_templates.json").write_text(
            json.dumps({"gift-birthday": ["カスタム1 第一印象", "カスタム2 {link}"]},
                       ensure_ascii=False)
        )
        templates = writer._load_thread_templates(gift_thread_account_dir)
        assert templates["gift-birthday"][0] == "カスタム1 第一印象"

    def test_falls_back_to_defaults_when_absent(self, gift_thread_account_dir):
        # ファイルが無ければ既定テンプレにフォールバック
        templates = writer._load_thread_templates(gift_thread_account_dir)
        assert "gift-anniversary" in templates

    def test_custom_template_used_in_generation(self, gift_thread_account_dir):
        (gift_thread_account_dir / "thread_templates.json").write_text(
            json.dumps({"gift-birthday": [
                "私はこれを贈った。第一印象を整える体験。",
                "節目に、自信をひとつ。{link}",
            ]}, ensure_ascii=False)
        )
        result = writer.generate_post(gift_thread_account_dir, mock=True)
        assert any("私はこれを贈った" in p for p in result["posts"])


@pytest.fixture
def areas_thread_account_dir(tmp_path):
    """areas(SEO/GEO→/areas)トラックのアカウント。"""
    persona = {
        "account_id": "hr", "genre": "areas",
        "character": {"first_person": "私", "ng_words": []},
        "posting": {"format": "thread", "max_chars": 500, "min_chars": 10, "hashtag_count": [0, 1]},
        "validation": {"require_first_person_boku": False, "max_emoji": 2, "max_hashtags": 1,
                       "require_recommended_words": False, "require_allowed_topics": False,
                       "require_three_stage": False, "check_similarity": False},
        "allowed_topics": [],
    }
    (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
    (tmp_path / "patterns.md").write_text("# P\n## 1. sweat\n**機会**: 汗\n")
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
    (tmp_path / "thread_templates.json").write_text(json.dumps({
        "sweat": ["ワキガって自分で気づける？", "個人差があるらしい。", "仕組みを書いている。{link}"]
    }, ensure_ascii=False))
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [{"id": "areas-sweat", "type": "areas", "name": "汗", "slug": "sweat",
                        "topics": ["汗"], "status": "active", "min_posts_to_evaluate": 10,
                        "current_posts": 0}],
        "link_config": {"link_ratio_by_type": {"areas": 1.0}, "base_urls": {
            "apply": "https://hisrecoveries.com/apply?utm_campaign={slug}",
            "areas": "https://hisrecoveries.com/areas/{slug}?utm_campaign=areas-{slug}"}},
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


class TestSlotTypeRouting:
    """時間帯×読者層の出し分け（朝=mother/areas、夜=gift/urgent）"""

    def _account(self, tmp_path):
        persona = {
            "account_id": "hr",
            "character": {"first_person": "私", "ng_words": []},
            "posting": {"format": "thread", "max_chars": 500, "min_chars": 10,
                        "hashtag_count": [0, 1],
                        "slot_type_map": {"morning": ["mother"], "night": ["gift"]}},
            "validation": {"require_first_person_boku": False, "max_emoji": 2,
                           "max_hashtags": 1, "require_recommended_words": False,
                           "require_allowed_topics": False, "require_three_stage": False,
                           "check_similarity": False},
        }
        (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (tmp_path / "thread_templates.json").write_text(json.dumps({
            "mother-a": ["息子が鏡を見なくなった気がする。", "完全守秘で、何をするかは本人が決める。",
                         "母親にできるのは入口を置くことまで。{link}"],
            "gift-a": ["彼は写真が苦手みたい。", "完全守秘で、何をするかは本人が選ぶ。",
                       "節目に自信をひとつ贈りたい。{link}"],
        }, ensure_ascii=False))
        (tmp_path / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [
                {"id": "mother-a", "type": "mother", "name": "母", "slug": "mother-a",
                 "topics": [], "status": "active", "min_posts_to_evaluate": 10, "current_posts": 0},
                {"id": "gift-a", "type": "gift", "name": "贈", "slug": "gift-a",
                 "topics": [], "status": "active", "min_posts_to_evaluate": 10, "current_posts": 0},
            ],
            "link_config": {"base_urls": {
                "apply": "https://hisrecoveries.com/apply?utm_campaign={slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
        return tmp_path

    def test_morning_selects_mother(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            for _ in range(5):
                r = writer.generate_thread(acc, mock=True, record=False)
                assert r["topic_type"] == "mother"

    def test_night_selects_gift(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="night"):
            for _ in range(5):
                r = writer.generate_thread(acc, mock=True, record=False)
                assert r["topic_type"] == "gift"

    def test_fallback_when_slot_types_all_paused(self, tmp_path):
        # スロット対象typeが全部停止中なら全activeにフォールバック
        acc = self._account(tmp_path)
        data = json.loads((acc / "hypotheses.json").read_text())
        data["hypotheses"][0]["status"] = "paused"   # mother停止
        (acc / "hypotheses.json").write_text(json.dumps(data, ensure_ascii=False))
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            r = writer.generate_thread(acc, mock=True, record=False)
        assert r is not None
        assert r["topic_type"] == "gift"   # フォールバック

    def test_mother_and_urgent_link_to_apply(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            r = writer.generate_thread(acc, mock=True, record=False)
        assert "/apply?utm_campaign=mother-a" in r["link"]


class TestFanNoLink:
    def test_no_link_hypothesis_generates_without_url(self, tmp_path):
        persona = {
            "account_id": "hr", "character": {"first_person": "私", "ng_words": []},
            "posting": {"format": "thread", "max_chars": 500, "min_chars": 10,
                        "hashtag_count": [0, 1]},
            "validation": {"require_first_person_boku": False, "max_emoji": 2,
                           "max_hashtags": 1, "require_recommended_words": False,
                           "require_allowed_topics": False, "require_three_stage": False,
                           "check_similarity": False},
        }
        (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (tmp_path / "thread_templates.json").write_text(json.dumps({
            "fan-x": ["深夜に検索してしまう夜がある。", "誰にも聞けないから、スマホに聞く。",
                      "そういう夜、ありませんか？"],
        }, ensure_ascii=False))
        (tmp_path / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [{"id": "fan-x", "type": "fan", "name": "ファン化", "slug": "fan-x",
                            "topics": [], "status": "active", "no_link": True,
                            "min_posts_to_evaluate": 10, "current_posts": 0}],
            "link_config": {"link_ratio_by_type": {"fan": 1.0}, "base_urls": {
                "apply": "https://hisrecoveries.com/apply?utm_campaign={slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
        r = writer.generate_thread(tmp_path, mock=True, record=False)
        assert r["topic_type"] == "fan"
        assert r["has_link"] is False
        assert not any("http" in p for p in r["posts"])   # 全投稿にURL無し


class TestB2BTrack:
    def test_b2b_links_to_partner_url(self, tmp_path):
        persona = {
            "account_id": "hr", "character": {"first_person": "私", "ng_words": []},
            "posting": {"format": "thread", "max_chars": 500, "min_chars": 10,
                        "hashtag_count": [0, 1]},
            "validation": {"require_first_person_boku": False, "max_emoji": 2,
                           "max_hashtags": 1, "require_recommended_words": False,
                           "require_allowed_topics": False, "require_three_stage": False,
                           "check_similarity": False},
        }
        (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (tmp_path / "thread_templates.json").write_text(json.dumps({
            "b2b-x": ["腕はいいのに広告費ばかりかさむ。", "患者側から中立に送客したい。",
                      "興味がある方、話せたら。{link}"],
        }, ensure_ascii=False))
        (tmp_path / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [{"id": "b2b-x", "type": "b2b", "name": "施術者", "slug": "b2b-x",
                            "topics": [], "status": "active",
                            "min_posts_to_evaluate": 10, "current_posts": 0}],
            "link_config": {"link_ratio_by_type": {"b2b": 1.0}, "base_urls": {
                "apply": "https://hisrecoveries.com/apply?utm_campaign={slug}",
                "partner": "https://hisrecoveries.com/partner?utm_campaign={slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
        r = writer.generate_thread(tmp_path, mock=True, record=False)
        assert r["topic_type"] == "b2b"
        assert "/partner?utm_campaign=b2b-x" in r["link"]   # /apply でなく /partner


class TestAreasTrack:
    def test_areas_links_to_areas_url(self, areas_thread_account_dir):
        result = writer.generate_post(areas_thread_account_dir, mock=True, record=False)
        assert result is not None
        assert result["topic_type"] == "areas"
        assert "/areas/sweat" in result["link"]
        # 本文末のCTAに /areas リンクが入る
        assert any("/areas/sweat" in p for p in result["posts"])


class TestGenerateThread:
    def test_thread_format_returns_multiple_posts(self, gift_thread_account_dir):
        result = writer.generate_post(gift_thread_account_dir, mock=True)
        assert result is not None
        assert result["is_thread"] is True
        posts = result["posts"]
        assert 3 <= len(posts) <= 6
        # 全投稿が空でない
        assert all(p.strip() for p in posts)

    def test_thread_cta_link_in_one_post_only(self, gift_thread_account_dir):
        result = writer.generate_post(gift_thread_account_dir, mock=True)
        posts = result["posts"]
        link = result["link"]
        assert "gift-birthday" in link
        # URLは連投の中で1投にだけ含まれる（最終投稿に1つだけ、の原則）
        posts_with_link = [p for p in posts if link in p]
        assert len(posts_with_link) == 1

    def test_thread_all_posts_pass_validation(self, gift_thread_account_dir):
        from core.validator import validate_post
        persona = writer.load_persona(gift_thread_account_dir)
        result = writer.generate_post(gift_thread_account_dir, mock=True)
        for p in result["posts"]:
            is_valid, errors = validate_post(p, persona)
            assert is_valid, (p, errors)


class TestGeneratePostMock:
    def test_mock_returns_buzz_score(self, account_dir):
        # monetize.jsonが必要
        (account_dir / "monetize.json").write_text(
            json.dumps({"enabled": False, "cta_templates": [], "products": []})
        )
        result = writer.generate_post(account_dir, mock=True)
        assert result is not None
        assert "buzz_score" in result
        assert result["buzz_score"] >= 7
        assert "source_type" in result
