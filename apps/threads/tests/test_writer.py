"""Tests for core.writer

アカウントの中身（語り手・場面・行き先）は persona.json / hypotheses.json /
thread_templates.json が持つ。ここのフィクスチャは、いま稼働している
タシカメ（送る前の文面を女性に読んでもらうサービス）の形に合わせてある。
以前は旧事業（ギフト／areas／母／施術者）のフィクスチャだった。
"""

import json
from pathlib import Path
from unittest import mock

import pytest

from core import writer


# 連投テンプレの既定値（場面 = hypotheses.json の slug）
DEFAULT_SCENES = ["message", "photo", "date", "signal", "distance"]

# 緩和プロファイル。タシカメの persona.json と同じ設定。
RELAXED_VALIDATION = {
    "require_first_person_boku": False,
    "max_emoji": 2,
    "max_hashtags": 1,
    "require_recommended_words": False,
    "require_allowed_topics": False,
    "require_three_stage": False,
    "check_similarity": False,
}


@pytest.fixture
def account_dir(tmp_path):
    """単発投稿アカウント（format を thread にしない）のテスト用ディレクトリ"""
    persona = {
        "account_id": "test",
        "display_name": "タシカメ",
        "genre": "タシカメ（マチアプで迷った男性が、実在の女性に相談できるサービス）",
        "target_audience": "マッチングアプリを使っている20〜30代の男性",
        "tone": {
            "style": "口語・断定しない",
            "formality": "親しみのある口語",
            "emoji_usage": "0〜2個まで",
            "hashtag_usage": "0〜1個まで",
            "line_breaks": "改行多め",
            "recommended_words": ["止まる", "読み返す", "決める", "確かめる"],
            "forbidden_words": ["マジで", "実は", "正直", "おすすめです"],
        },
        "character": {
            "name": "タシカメ（運営の語り手）",
            "background": "送信ボタンの前で止まる人を、たくさん見てきた側",
            "first_person": "",
            "values": ["断定しない。当てにいかない"],
            "ng_words": ["脈あり", "モテる", "落とす", "攻略"],
        },
        "validation": RELAXED_VALIDATION,
        "posting": {"max_chars": 500, "min_chars": 10, "hashtag_count": [0, 1]},
        "allowed_topics": [
            "送る前のLINE", "返信の間", "誘い方", "自己紹介文", "距離感", "既読",
        ],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n"
        "## 1. message\n**場面**: 送る前のLINE\n\n"
        "## 2. photo\n**場面**: 自己紹介文\n\n"
        "## 3. date\n**場面**: 誘うタイミング\n\n"
        "## 4. signal\n**場面**: デートのあと\n\n"
        "## 5. distance\n**場面**: 距離感\n"
    )
    (tmp_path / "thread_templates.json").write_text(json.dumps({
        "message": [
            "文面はもうできてる。\n誤字もない。\nそれでも送信ボタンの前で止まる。",
            "読み返しても、分かるのは「自分がどう読むか」だけ。",
            "送る前に、一度だけ知らない人の目を通しておく。{link}",
        ],
    }, ensure_ascii=False))
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "message", "type": "message", "name": "送る前のLINEで止まる",
             "slug": "message", "topics": ["LINE"], "status": "active",
             "min_posts_to_evaluate": 10, "current_posts": 0}
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
        "display_name": "タシカメ",
        "genre": "タシカメ（送る前の文面を、実在の女性に読んでもらうサービス）",
        "target_audience": "マッチングアプリを使っている20〜30代の男性",
    }


class TestLoadPersona:
    def test_loads(self, account_dir):
        persona = writer.load_persona(account_dir)
        assert "タシカメ" in persona["genre"]


class TestLoadPatterns:
    def test_extracts_patterns(self, account_dir):
        patterns = writer.load_patterns(account_dir)
        assert len(patterns) == 5
        assert "message" in patterns
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
        prompt = writer._build_rewrite_prompt(persona, "", "共感型", topic="既読")
        assert "既読" in prompt
        assert "リライト" not in prompt

    def test_without_source_or_topic(self, persona):
        prompt = writer._build_rewrite_prompt(persona, "", "逆説型")
        assert "逆説型" in prompt

    def test_persona_drives_the_rules(self):
        # 事業の文面をコードに書かない。線引きは persona が持つ
        p = {
            "character": {"first_person": "", "ng_words": ["脈あり", "モテる"]},
            "tone": {"emoji_usage": "0〜2個まで"},
            "allowed_topics": ["送る前のLINE"],
            "posting": {"min_chars": 10, "max_chars": 500},
        }
        prompt = writer._build_rewrite_prompt(p, "", "共感型")
        assert "脈あり" in prompt
        assert "送る前のLINE" in prompt
        assert "一人称は使わない" in prompt
        # 旧事業の名指しが残っていない
        assert "Nagi" not in prompt
        assert "多汗症" not in prompt


class TestGenerateMockPost:
    def test_uses_account_templates(self, account_dir):
        persona = writer.load_persona(account_dir)
        text = writer._generate_mock_post(
            persona, "message", None, account_dir=account_dir,
        )
        assert text
        assert "{link}" not in text

    def test_empty_when_no_template(self, account_dir):
        persona = writer.load_persona(account_dir)
        text = writer._generate_mock_post(
            persona, "存在しない場面", None, account_dir=account_dir,
        )
        assert text == ""


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
def linked_account_dir(tmp_path):
    """単発投稿で、場面ごとのCTAリンクが付くアカウント。"""
    persona = {
        "account_id": "test-linked",
        "display_name": "タシカメ",
        "genre": "送る前に、女性の目を通す",
        "tone": {"style": "口語", "emoji_usage": "0〜2個まで", "hashtag_usage": "0個"},
        "character": {"name": "タシカメ", "first_person": "", "ng_words": ["脈あり"]},
        "validation": RELAXED_VALIDATION,
        "posting": {"max_chars": 500, "min_chars": 10, "hashtag_count": [0, 0]},
        "allowed_topics": ["自己紹介文", "プロフィール"],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n## 1. photo\n**場面**: 自己紹介文\n"
    )
    (tmp_path / "thread_templates.json").write_text(json.dumps({
        "photo": [
            "マッチはする。\nでも、そこから続かない。",
            "自己紹介文は、書いた本人がいちばん読めない。",
        ],
    }, ensure_ascii=False))
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "photo", "type": "photo", "name": "自己紹介文が読まれているか",
             "slug": "photo", "topics": ["自己紹介文"], "status": "active",
             "min_posts_to_evaluate": 10, "current_posts": 0}
        ],
        "link_config": {
            "link_ratio_by_type": {"photo": 1.0},
            "base_urls": {
                "apply": "https://hisrecoveries.com/ask?plan=review&c={slug}",
            },
            "link_intro_phrases": {"photo": ["出す前に、一度だけ。"]},
        },
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


class TestSinglePostLink:
    def test_links_to_ask_with_slug(self, linked_account_dir):
        # 既定の行き先は base_urls["apply"]（= /ask）。slug が c= に入る
        result = writer.generate_post(linked_account_dir, mock=True)
        assert result is not None
        assert result["topic_type"] == "photo"
        assert result["topic_slug"] == "photo"
        assert result["has_link"] is True
        assert "/ask?plan=review&c=photo" in result["link"]
        # 本文とリンクのslugが一致している（食い違いバグ防止）
        assert "c=photo" in result["text"]

    def test_link_key_overrides_destination(self, linked_account_dir):
        # 仮説に link_key があれば、その行き先が優先される
        data = json.loads((linked_account_dir / "hypotheses.json").read_text())
        data["hypotheses"][0]["link_key"] = "areas"
        data["link_config"]["base_urls"]["areas"] = (
            "https://hisrecoveries.com/areas/{slug}"
        )
        (linked_account_dir / "hypotheses.json").write_text(
            json.dumps(data, ensure_ascii=False)
        )
        result = writer.generate_post(linked_account_dir, mock=True)
        assert "/areas/photo" in result["link"]


@pytest.fixture
def thread_account_dir(tmp_path):
    """連投(スレッド)フォーマットのアカウント。稼働中の構成と同じ。"""
    persona = {
        "account_id": "tashikame",
        "display_name": "タシカメ",
        "genre": "送る前に、女性の目を通す",
        "character": {"name": "タシカメ", "first_person": "", "ng_words": []},
        "posting": {
            "format": "thread", "max_chars": 500, "min_chars": 10,
            "hashtag_count": [0, 1],
            "thread": {"min_posts": 3, "max_posts": 6, "url_in_last_only": True},
        },
        "validation": RELAXED_VALIDATION,
        "allowed_topics": ["送る前のLINE", "自己紹介文"],
    }
    (tmp_path / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )
    (tmp_path / "patterns.md").write_text(
        "# Patterns\n## 1. message\n**場面**: 送る前のLINE\n"
    )
    (tmp_path / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0})
    )
    (tmp_path / "hypotheses.json").write_text(json.dumps({
        "hypotheses": [
            {"id": "message", "type": "message", "name": "送る前のLINEで止まる",
             "slug": "message", "topics": ["LINE", "送信前"], "status": "active",
             "min_posts_to_evaluate": 10, "current_posts": 0}
        ],
        "link_config": {
            "link_ratio_by_type": {"message": 1.0},
            "base_urls": {
                "apply": "https://hisrecoveries.com/ask?plan=review&c={slug}"
                         "&utm_campaign={slug}",
            },
        },
        "discovery_questions": [],
        "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                              "evaluation_threshold_posts": 10, "phase": "explore"}
    }, ensure_ascii=False))
    (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
    return tmp_path


class TestThreadTemplateLoading:
    def test_loads_from_file_when_present(self, thread_account_dir):
        # thread_templates.json があれば優先して読む
        (thread_account_dir / "thread_templates.json").write_text(
            json.dumps({"message": ["カスタム1 送る前", "カスタム2 {link}"]},
                       ensure_ascii=False)
        )
        templates = writer._load_thread_templates(thread_account_dir)
        assert templates["message"][0] == "カスタム1 送る前"

    def test_falls_back_to_defaults_when_absent(self, thread_account_dir):
        # ファイルが無ければ既定テンプレ（タシカメの5場面）にフォールバック
        templates = writer._load_thread_templates(thread_account_dir)
        for scene in DEFAULT_SCENES:
            assert scene in templates
        # 旧事業（ギフト）の既定テンプレは残っていない
        assert not any(k.startswith("gift-") for k in templates)

    def test_custom_template_used_in_generation(self, thread_account_dir):
        (thread_account_dir / "thread_templates.json").write_text(
            json.dumps({"message": [
                "打ち終わってから、送信を押すまでが一番長い。",
                "送る前に、読んでもらう。{link}",
                "その文面、止まったことありますか。",
            ]}, ensure_ascii=False)
        )
        result = writer.generate_post(thread_account_dir, mock=True)
        assert any("打ち終わってから" in p for p in result["posts"])

    def test_aborts_when_scene_has_no_template(self, thread_account_dir):
        # slug に対応するテンプレが無ければ、別の場面の文面で代用しない
        (thread_account_dir / "thread_templates.json").write_text(
            json.dumps({"distance": ["踏み込みたい。", "でも踏み込みすぎたくない。",
                                     "どこで決めてますか。"]}, ensure_ascii=False)
        )
        assert writer.generate_thread(
            thread_account_dir, mock=True, record=False,
        ) is None


class TestThreadPrompt:
    def test_built_from_persona(self, thread_account_dir):
        persona = writer.load_persona(thread_account_dir)
        prompt = writer._build_thread_prompt(
            persona, "送る前のLINEで止まる", ["LINE", "送信前"],
        )
        assert "タシカメ" in prompt
        assert "送る前のLINEで止まる" in prompt
        assert "{link}" in prompt
        # 旧事業（ギフト訴求）の仕様が埋まっていない
        for gone in ("第一印象パッケージ", "完全守秘", "贈り物", "His Recoveries"):
            assert gone not in prompt

    def test_ng_words_and_principles_are_passed(self):
        persona = {
            "display_name": "タシカメ",
            "character": {"ng_words": ["脈あり", "攻略"], "first_person": ""},
            "brand": {"editorial_principles": ["女性の反応を、こちらで作らない"]},
            "posting": {"thread": {"min_posts": 3, "max_posts": 6}},
        }
        prompt = writer._build_thread_prompt(persona, "距離感で迷う")
        assert "脈あり" in prompt
        assert "女性の反応を、こちらで作らない" in prompt


class TestSlotTypeRouting:
    """時間帯×場面の出し分け（朝=出す前のもの、夜=会ったあと・距離感）"""

    def _account(self, tmp_path):
        persona = {
            "account_id": "tashikame",
            "display_name": "タシカメ",
            "character": {"first_person": "", "ng_words": []},
            "posting": {"format": "thread", "max_chars": 500, "min_chars": 10,
                        "hashtag_count": [0, 1],
                        "slot_type_map": {"morning": ["photo"], "night": ["distance"]}},
            "validation": RELAXED_VALIDATION,
        }
        (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (tmp_path / "thread_templates.json").write_text(json.dumps({
            "photo": ["マッチはする。でも、そこから続かない。",
                      "自己紹介文は、書いた本人がいちばん読めない。",
                      "出す前に、一度だけ通しておく。{link}"],
            "distance": ["踏み込みたい。でも、踏み込みすぎたくない。",
                         "友達にも、相手にも聞けない。",
                         "距離感、どこで決めてますか。{link}"],
        }, ensure_ascii=False))
        (tmp_path / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [
                {"id": "photo", "type": "photo", "name": "自己紹介文", "slug": "photo",
                 "topics": [], "status": "active", "min_posts_to_evaluate": 10,
                 "current_posts": 0},
                {"id": "distance", "type": "distance", "name": "距離感", "slug": "distance",
                 "topics": [], "status": "active", "min_posts_to_evaluate": 10,
                 "current_posts": 0},
            ],
            "link_config": {"base_urls": {
                "apply": "https://hisrecoveries.com/ask?plan=review&c={slug}"
                         "&utm_campaign={slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
        return tmp_path

    def test_morning_selects_photo(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            for _ in range(5):
                r = writer.generate_thread(acc, mock=True, record=False)
                assert r["topic_type"] == "photo"

    def test_night_selects_distance(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="night"):
            for _ in range(5):
                r = writer.generate_thread(acc, mock=True, record=False)
                assert r["topic_type"] == "distance"

    def test_fallback_when_slot_types_all_paused(self, tmp_path):
        # スロット対象typeが全部停止中なら全activeにフォールバック
        acc = self._account(tmp_path)
        data = json.loads((acc / "hypotheses.json").read_text())
        data["hypotheses"][0]["status"] = "paused"   # photo停止
        (acc / "hypotheses.json").write_text(json.dumps(data, ensure_ascii=False))
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            r = writer.generate_thread(acc, mock=True, record=False)
        assert r is not None
        assert r["topic_type"] == "distance"   # フォールバック

    def test_links_to_ask_with_matching_slug(self, tmp_path):
        acc = self._account(tmp_path)
        with mock.patch.object(writer, "_current_time_slot", return_value="morning"):
            r = writer.generate_thread(acc, mock=True, record=False)
        assert "c=photo" in r["link"]
        assert "utm_campaign=photo" in r["link"]


class TestNoLink:
    def test_no_link_hypothesis_generates_without_url(self, tmp_path):
        persona = {
            "account_id": "tashikame",
            "character": {"first_person": "", "ng_words": []},
            "posting": {"format": "thread", "max_chars": 500, "min_chars": 10,
                        "hashtag_count": [0, 1]},
            "validation": RELAXED_VALIDATION,
        }
        (tmp_path / "persona.json").write_text(json.dumps(persona, ensure_ascii=False))
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": [], "last_posted_at": None, "total_count": 0}))
        (tmp_path / "thread_templates.json").write_text(json.dumps({
            "signal": ["デートは楽しかった。と思う。",
                       "帰ってから、温度感が読めなくなる。",
                       "デートのあと、すぐ送る派ですか。"],
        }, ensure_ascii=False))
        (tmp_path / "hypotheses.json").write_text(json.dumps({
            "hypotheses": [{"id": "signal", "type": "signal", "name": "デートのあと",
                            "slug": "signal", "topics": [], "status": "active",
                            "no_link": True,
                            "min_posts_to_evaluate": 10, "current_posts": 0}],
            "link_config": {"link_ratio_by_type": {"signal": 1.0}, "base_urls": {
                "apply": "https://hisrecoveries.com/ask?plan=review&c={slug}"}},
            "discovery_questions": [],
            "experiment_config": {"posts_per_day": 1, "discovery_questions_per_week": 0,
                                  "evaluation_threshold_posts": 10, "phase": "explore"},
        }, ensure_ascii=False))
        (tmp_path / "monetize.json").write_text(json.dumps({"enabled": False}))
        r = writer.generate_thread(tmp_path, mock=True, record=False)
        assert r["topic_type"] == "signal"
        assert r["has_link"] is False
        assert not any("http" in p for p in r["posts"])   # 全投稿にURL無し


class TestThreadLinkKeyOverride:
    def test_link_key_wins_over_apply(self, thread_account_dir):
        # 行き先を増やすときは base_urls にキーを足し、仮説に link_key を書く
        data = json.loads((thread_account_dir / "hypotheses.json").read_text())
        data["hypotheses"][0]["link_key"] = "guide"
        data["link_config"]["base_urls"]["guide"] = (
            "https://hisrecoveries.com/guide/{slug}"
        )
        (thread_account_dir / "hypotheses.json").write_text(
            json.dumps(data, ensure_ascii=False)
        )
        r = writer.generate_thread(thread_account_dir, mock=True, record=False)
        assert "/guide/message" in r["link"]   # /ask でなく /guide


class TestGenerateThread:
    def test_thread_format_returns_multiple_posts(self, thread_account_dir):
        result = writer.generate_post(thread_account_dir, mock=True)
        assert result is not None
        assert result["is_thread"] is True
        posts = result["posts"]
        assert 3 <= len(posts) <= 6
        # 全投稿が空でない
        assert all(p.strip() for p in posts)

    def test_thread_cta_link_in_one_post_only(self, thread_account_dir):
        result = writer.generate_post(thread_account_dir, mock=True)
        posts = result["posts"]
        link = result["link"]
        assert "c=message" in link
        # URLは連投の中で1投にだけ含まれる（最終投稿に1つだけ、の原則）
        posts_with_link = [p for p in posts if link in p]
        assert len(posts_with_link) == 1

    def test_thread_all_posts_pass_validation(self, thread_account_dir):
        from core.validator import validate_post
        persona = writer.load_persona(thread_account_dir)
        result = writer.generate_post(thread_account_dir, mock=True)
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
