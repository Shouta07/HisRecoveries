"""Tests for core.validator (Nagi/Quiet Grooming版)"""

import pytest

from core.validator import validate_post, sanitize_post, _recent_posts


@pytest.fixture
def persona():
    return {
        "character": {
            "first_person": "僕",
            "ng_words": [],
        },
        "posting": {
            "min_chars": 200,
            "max_chars": 400,
        },
    }


def _make_valid_post(length: int = 250) -> str:
    """ルールを全て満たす投稿を生成するヘルパー。"""
    base = "多汗症と向き合う日々。僕は気づいた、焦らなくていいんだと。ただ、まだ覚えている。"
    # baseを繰り返してlength文字に近づける
    repeated = (base * ((length // len(base)) + 1))[:length]
    return repeated


@pytest.fixture(autouse=True)
def clear_recent_posts():
    """各テスト前に類似投稿バッファをクリアする。"""
    _recent_posts.clear()
    yield
    _recent_posts.clear()


@pytest.fixture
def gift_persona():
    """gift連投トラックの緩和バリデーション・プロファイル。"""
    return {
        "character": {"first_person": "私", "ng_words": []},
        "posting": {"min_chars": 10, "max_chars": 500},
        "validation": {
            "require_first_person_boku": False,
            "max_emoji": 2,
            "max_hashtags": 1,
            "require_recommended_words": False,
            "require_allowed_topics": False,
            "require_three_stage": False,
            "check_similarity": False,
        },
    }


class TestGiftValidationProfile:
    def test_first_person_watashi_allowed(self, gift_persona):
        # giftは「私」一人称を許可する
        text = "私は、彼にギフトを贈ってみることにした。第一印象を整える体験。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is True, errors

    def test_emoji_within_limit_allowed(self, gift_persona):
        text = "彼に贈り物をしてみた☀️ 第一印象を整える体験。匿名で受けられるのがいい。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is True, errors

    def test_emoji_over_limit_rejected(self, gift_persona):
        text = "贈り物☀️☀️☀️ 第一印象を整える体験。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is False
        assert any("絵文字" in e for e in errors)

    def test_one_hashtag_allowed(self, gift_persona):
        text = "彼に贈り物をしてみた。第一印象を整える体験。 #ギフト"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is True, errors

    def test_short_hook_post_allowed(self, gift_persona):
        # 連投1投目の短いフックも通る
        text = "誕生日に何がほしい？って聞くと、毎年「特にない」だった。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is True, errors

    def test_reaction_solicitation_still_blocked(self, gift_persona):
        # 緩和してもリアクション誘導の定型句は弾く
        text = "彼に贈り物をしてみた。第一印象を整える体験。いいねしてね。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is False

    def test_legal_risk_still_blocked(self, gift_persona):
        # 緩和しても薬機法リスク語は弾く
        text = "この体験で必ず治る。ビフォーアフターがすごい。"
        is_valid, errors = validate_post(text, gift_persona)
        assert is_valid is False


class TestValidatePost:
    def test_valid_post(self, persona):
        text = _make_valid_post(250)
        is_valid, errors = validate_post(text, persona)
        # エラーのみ抽出（警告は除外）
        real_errors = [e for e in errors if not e.startswith("[WARNING]")]
        assert is_valid is True, f"Unexpected errors: {real_errors}"

    def test_too_long(self, persona):
        text = _make_valid_post(450)
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("文字数超過" in e for e in errors)

    def test_too_short(self, persona):
        text = "僕は多汗症に気づいた"
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("文字数不足" in e for e in errors)

    def test_dating_vocabulary_is_allowed(self, persona):
        # 恋愛・マチアプは、いまの事業の主題そのもの。
        # 旧事業では全部禁止していたが、禁止すると何も書けない。
        text = _make_valid_post(250)
        text = text[:200] + "マッチングアプリで出会った" + text[200:]
        is_valid, errors = validate_post(text, persona)
        assert is_valid is True, errors

    def test_ng_word_comes_from_persona(self):
        # 言葉の線引きは persona.json の ng_words が持つ
        p = {
            "character": {"first_person": "僕", "ng_words": ["脈あり"]},
            "posting": {"min_chars": 10, "max_chars": 400},
            "validation": {
                "require_first_person_boku": False, "require_recommended_words": False,
                "require_allowed_topics": False, "require_three_stage": False,
                "check_similarity": False, "max_emoji": 2, "max_hashtags": 1,
            },
        }
        is_valid, errors = validate_post("これって脈ありですか。", p)
        assert is_valid is False
        assert any("脈あり" in e for e in errors)

    def test_ng_word_assertive(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "絶対にそうだと")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("絶対" in e for e in errors)

    def test_ng_word_completion(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "治ったんだと")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("治った" in e for e in errors)

    def test_ng_word_evangelism(self, persona):
        text = _make_valid_post(250) + "あなたも変われる"
        # Ensure within char limit
        text = text[:400]
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("あなたも変われる" in e for e in errors)

    def test_ng_word_commercial(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "おすすめですと")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("おすすめです" in e for e in errors)

    def test_forbidden_first_person_ore(self, persona):
        text = _make_valid_post(250).replace("僕は", "俺は")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("俺" in e for e in errors)

    def test_forbidden_first_person_watashi(self, persona):
        text = _make_valid_post(250).replace("僕は", "私は")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("私は" in e or "私" in e for e in errors)

    def test_emoji_zero_tolerance(self, persona):
        text = _make_valid_post(248) + "☀️"
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("絵文字" in e for e in errors)

    def test_hashtag_zero_tolerance(self, persona):
        text = _make_valid_post(250) + " #多汗症"
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("ハッシュタグ" in e for e in errors)

    def test_recommended_word_required(self, persona):
        # 推奨ワードを含まない投稿
        text = "僕は多汗症の治療を受けている。" * 10
        text = text[:300]
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("推奨ワード不足" in e for e in errors)

    def test_topic_required(self, persona):
        # トピックキーワードを含まない投稿（料理の話題）
        text = "僕は気づいた。毎日の料理を楽しむ生活を続けている。ただ、まだ覚えている。" * 5
        text = text[:300]
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("トピック不一致" in e for e in errors)

    def test_meta_leak(self, persona):
        text = _make_valid_post(250) + "（ネタ元：記事A）"
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("メタ情報漏洩" in e for e in errors)

    def test_completion_language(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "完治したんだと")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("完了表現" in e or "完治" in e for e in errors)

    def test_anata_warning(self, persona):
        """「あなた」は警告のみでバリデーション失敗にはならない"""
        text = _make_valid_post(230) + "あなたはどう思いますか。"
        # 文字数調整
        text = text[:350]
        is_valid, errors = validate_post(text, persona)
        warnings = [e for e in errors if e.startswith("[WARNING]")]
        assert any("あなた" in w for w in warnings)

    def test_legal_risk_yakujiho(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "確実にと")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("法的リスク" in e for e in errors)

    def test_legal_risk_medical_ad(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "口コミNo.1と")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("法的リスク" in e for e in errors)

    def test_privacy_clinic_name(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "あおばクリニックに行ったと気づいた。")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("プライバシー違反" in e for e in errors)

    def test_privacy_doctor_name(self, persona):
        text = _make_valid_post(250).replace("焦らなくていいんだと", "山田先生に診てもらったと気づいた。")
        is_valid, errors = validate_post(text, persona)
        assert is_valid is False
        assert any("プライバシー違反" in e for e in errors)

    def test_similarity_detection(self, persona):
        text = _make_valid_post(250)
        # 1回目は成功
        is_valid1, _ = validate_post(text, persona)
        assert is_valid1 is True
        # 同一テキストの2回目は類似で失敗
        is_valid2, errors2 = validate_post(text, persona)
        assert is_valid2 is False
        assert any("類似投稿" in e for e in errors2)


class TestSanitizePost:
    def test_trims_long_text(self, persona):
        text = _make_valid_post(500)
        result = sanitize_post(text, persona)
        assert len(result) <= 400

    def test_removes_emoji(self, persona):
        text = _make_valid_post(250) + "☀️🌟"
        result = sanitize_post(text, persona)
        assert "☀" not in result
        assert "🌟" not in result

    def test_removes_hashtags(self, persona):
        text = _make_valid_post(250) + " #多汗症 #ケア"
        result = sanitize_post(text, persona)
        assert "#" not in result

    def test_replaces_ore_with_boku(self, persona):
        text = _make_valid_post(250).replace("僕", "俺")
        result = sanitize_post(text, persona)
        assert "俺" not in result
        assert "僕" in result

    def test_removes_meta_info(self, persona):
        text = _make_valid_post(250) + "\n（ネタ元：記事A）"
        result = sanitize_post(text, persona)
        assert "ネタ元" not in result

    def test_short_text_untouched(self, persona):
        text = "僕は多汗症と向き合う日々を続けている。気づいたことがある。"
        result = sanitize_post(text, persona)
        assert result == text


# ──────────────────────────────────────────────────────────────
# 恋亀の線（src/lib/koi/prompt.ts の NEVER と同じもの）
# ──────────────────────────────────────────────────────────────

import json as _json
from pathlib import Path as _Path

_ACCOUNT = _Path(__file__).resolve().parent.parent / "accounts" / "mens-body-lab"


def _koi_persona():
    return _json.loads((_ACCOUNT / "persona.json").read_text(encoding="utf-8"))


class TestSelfIntro:
    """誰もフォローしていないアカウントの自己紹介は、誰も読まない。"""

    def test_rejects_koi_introducing_itself(self):
        ok, errors = validate_post(
            "はじめまして、恋亀です🐢\n"
            "マチアプで出会ったあとの恋愛について喋っていきます。\n"
            "よろしくお願いします。",
            _koi_persona(),
        )
        assert not ok
        assert any("自己紹介" in e for e in errors)

    def test_allows_a_quoted_greeting(self):
        """恋亀が人の文面を引用しているだけなら、恋亀の自己紹介ではない。"""
        ok, errors = validate_post(
            "プロフィールの一行目。\n\n"
            "①「はじめまして！よろしくお願いします」\n"
            "②いきなり趣味の話\n\n"
            "恋亀は②。\n"
            "①は、読まんでも中身が分かってまうから。\n\n"
            "これ怒られるやつかな🐢",
            _koi_persona(),
        )
        assert ok, errors


class TestSpeakingFor:
    """聞くのは可。言い切るのは不可。"""

    def test_rejects_an_assertion(self):
        ok, errors = validate_post(
            "女性はこう思っています。送る前に一度よく考えたほうがええで🐢",
            _koi_persona(),
        )
        assert not ok
        assert any("代弁" in e for e in errors)

    def test_allows_asking(self):
        ok, errors = validate_post(
            "男性に聞きたい。\n\n"
            "女性から「また空いてる日おしえて〜」って来たらどう受け取る？\n\n"
            "女性側の意図も気になる🐢",
            _koi_persona(),
        )
        assert ok, errors

    def test_allows_quoting_someone_else(self):
        ok, errors = validate_post(
            "友達に「女性はこう思ってるって」って言われたけど、\n"
            "ほんまにそうなんかな。\n\n"
            "恋亀には分からん🐢",
            _koi_persona(),
        )
        assert ok, errors


class TestLegacyNgSets:
    """旧事業の禁止語は、アカウントが選んだぶんだけ効く。"""

    def test_koi_can_use_casual_words(self):
        """「マジで」「正直」は前のペルソナが使いすぎたから禁止されただけ。"""
        ok, errors = validate_post(
            "マジでこれ分からん。\n\n"
            "正直、返信が来ないよりも来るけど短いほうがこたえる🐢",
            _koi_persona(),
        )
        assert ok, errors

    def test_koi_still_cannot_solicit_reactions(self):
        ok, errors = validate_post(
            "これ刺さった人おったら、いいねして拡散してもらえると嬉しい🐢",
            _koi_persona(),
        )
        assert not ok

    def test_accounts_without_the_setting_keep_every_list(self):
        """指定が無いアカウントは今までどおり全部効く。"""
        ok, _ = validate_post(
            "マジでこれは正直しんどい話やと思う。ぶっちゃけ無理。",
            {"posting": {"min_chars": 1, "max_chars": 300},
             "validation": {"require_first_person_boku": False,
                            "require_recommended_words": False,
                            "require_allowed_topics": False,
                            "require_three_stage": False,
                            "check_similarity": False}},
        )
        assert not ok


class TestExampleFilesStayValid:
    """同梱の例文が、自分の検証を通ること。

    例文は mock の出力であり、AI生成の手本でもある。ここが落ちると、
    手本が落ちる文面になる。
    """

    def _texts(self, path, key):
        data = _json.loads((_ACCOUNT / path).read_text(encoding="utf-8"))
        for f in data[key].values():
            for ex in f.get("examples", []):
                yield ex.replace("{link}", "https://tashikame.app/ask?utm_source=threads")

    def test_every_post_example_passes(self):
        persona = _koi_persona()
        for text in self._texts("post_forms.json", "forms"):
            ok, errors = validate_post(text, persona)
            assert ok, (errors, text[:60])
