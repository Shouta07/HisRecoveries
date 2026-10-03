"""週次の集計。

見ているのは3つ。
  - 1本バズっても全体の見え方が歪まないか（平均ではなく中央値）
  - 数値の取れていない投稿を混ぜていないか
  - 本数の足りない束に「判断できる」と言っていないか
"""

import json
from datetime import datetime, timedelta

import pytest

from core import report


def _post(form, theme, views, replies, days_ago=1, measured=True, code=None):
    p = {
        "text": "x",
        "posted_at": (datetime.now() - timedelta(days=days_ago)).isoformat(),
        "post_form": form,
        "post_category": "empathy",
        "hypothesis_id": theme,
    }
    if code:
        p["tracking_code"] = code
    p["metrics"] = (
        {"impressions": views, "replies": replies} if measured else {"impressions": None}
    )
    return p


@pytest.fixture
def acct(tmp_path):
    def write(posts, account_days=None):
        (tmp_path / "history.json").write_text(
            json.dumps({"posts": posts}, ensure_ascii=False), encoding="utf-8",
        )
        (tmp_path / "account_metrics.json").write_text(
            json.dumps({"days": account_days or {}}), encoding="utf-8",
        )
        return tmp_path
    return write


class TestWindow:
    def test_ignores_posts_without_numbers(self, acct):
        """投稿から24時間たっていないものを入れると、新しい型が不当に負ける。"""
        d = acct([
            _post("odd", "t1", 1000, 10),
            _post("odd", "t1", 0, 0, measured=False),
        ])
        assert report.build(d, days=7)["posts_measured"] == 1

    def test_ignores_posts_outside_the_window(self, acct):
        d = acct([
            _post("odd", "t1", 1000, 10, days_ago=1),
            _post("odd", "t1", 9999, 99, days_ago=30),
        ])
        assert report.build(d, days=7)["posts_measured"] == 1


class TestMedian:
    def test_one_viral_post_does_not_move_the_number(self, acct):
        """平均だと1本で全体が持ち上がり、他が全部「平均以下」になる。"""
        d = acct([_post("odd", "t1", 1000, 10) for _ in range(9)]
                 + [_post("odd", "t1", 500_000, 5000)])
        form = report.build(d, days=7)["by_form"]["odd"]
        assert form["views_median"] == 1000
        assert form["posts"] == 10

    def test_reply_rate_is_per_post(self, acct):
        """合計÷合計にすると、表示数の大きい1本の率が全体の率になる。"""
        d = acct([
            _post("odd", "t1", 100, 10),       # 10%
            _post("odd", "t1", 100, 10),       # 10%
            _post("odd", "t1", 100_000, 0),    # 0%
        ])
        assert report.build(d, days=7)["by_form"]["odd"]["reply_rate_median"] == 10.0


class TestJudgeable:
    def test_small_buckets_are_marked(self, acct):
        d = acct([_post("odd", "t1", 100, 1) for _ in range(report.MIN_POSTS_TO_JUDGE - 1)])
        assert report.build(d, days=7)["by_form"]["odd"]["judgeable"] is False

    def test_enough_posts_are_judgeable(self, acct):
        d = acct([_post("odd", "t1", 100, 1) for _ in range(report.MIN_POSTS_TO_JUDGE)])
        assert report.build(d, days=7)["by_form"]["odd"]["judgeable"] is True

    def test_render_says_so_when_there_is_not_enough(self, acct):
        d = acct([_post("odd", "t1", 100, 1)])
        text = report.render(d, report.build(d, days=7))
        assert "まだ判断できる本数ではない" in text
        assert "次にやること" not in text


class TestTracking:
    def test_codes_map_back_to_posts(self, acct):
        """utm_content → 投稿。これが無いとサイト側の数字を戻せない。"""
        d = acct([
            _post("announce", "t1", 500, 5, code="abc123"),
            _post("odd", "t2", 900, 9),
        ])
        tracking = report.build(d, days=7)["tracking"]
        assert list(tracking) == ["abc123"]
        assert tracking["abc123"]["form"] == "announce"
        assert tracking["abc123"]["views"] == 500


class TestRender:
    def test_account_growth_shows_the_difference(self, acct):
        d = acct(
            [_post("odd", "t1", 100, 1) for _ in range(5)],
            account_days={
                "2026-09-26": {"followers_count": 120, "views": 4200},
                "2026-10-03": {"followers_count": 318, "views": 15800},
            },
        )
        text = report.render(d, report.build(d, days=7))
        assert "+198" in text
        assert "+11,600" in text

    def test_survives_an_empty_account(self, acct):
        text = report.render(acct([]), report.build(acct([]), days=7))
        assert "0本" in text
