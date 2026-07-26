"""Tests for core.analyst"""

import pytest

from core import analyst


class TestAnalyzeBuzzEffectiveness:
    def test_with_scored_posts(self):
        history = [
            {"text": "post1", "buzz_score": 8, "likes": 50, "source_type": "competitor"},
            {"text": "post2", "buzz_score": 9, "likes": 100, "source_type": "competitor"},
            {"text": "post3", "buzz_score": 6, "likes": 5, "source_type": "own_viral"},
            {"text": "post4", "buzz_score": 7, "likes": 30, "source_type": "rss_trend"},
        ]
        result = analyst.analyze_buzz_effectiveness(history)
        assert result["avg_buzz_score"] == 7.5
        assert "competitor" in result["source_type_performance"]
        assert result["source_type_performance"]["competitor"]["count"] == 2
        assert isinstance(result["high_score_hit_rate"], float)

    def test_empty_history(self):
        assert analyst.analyze_buzz_effectiveness([]) == {}

    def test_no_scored_posts(self):
        history = [{"text": "post1", "likes": 10}]
        result = analyst.analyze_buzz_effectiveness(history)
        assert result["avg_buzz_score"] == 0


class TestClassifyPostPerformance:
    def test_viral(self):
        assert analyst.classify_post_performance({"like_count": 100}, 10.0) == "viral"

    def test_good(self):
        assert analyst.classify_post_performance({"like_count": 20}, 10.0) == "good"

    def test_average(self):
        assert analyst.classify_post_performance({"like_count": 8}, 10.0) == "average"

    def test_low(self):
        assert analyst.classify_post_performance({"like_count": 2}, 10.0) == "low"


class TestGetImprovementSuggestions:
    def test_buzz_analysis_suggestions(self):
        summary = {
            "avg_likes": 10,
            "avg_replies": 2,
            "post_count": 20,
            "buzz_analysis": {
                "avg_buzz_score": 5.5,
                "high_score_hit_rate": 20,
                "source_type_performance": {
                    "competitor": {"count": 10, "avg_likes": 30, "avg_score": 8},
                    "rss_trend": {"count": 5, "avg_likes": 5, "avg_score": 6},
                },
            },
        }
        suggestions = analyst.get_improvement_suggestions(summary)
        # 低バズスコアの提案が含まれる
        assert any("バズスコア" in s for s in suggestions)
        # ソースタイプの提案が含まれる
        assert any("ソース" in s for s in suggestions)

    def test_no_buzz_analysis(self):
        summary = {"avg_likes": 10, "avg_replies": 2, "post_count": 20}
        suggestions = analyst.get_improvement_suggestions(summary)
        # バズ分析なしでもエラーにならない
        assert isinstance(suggestions, list)
