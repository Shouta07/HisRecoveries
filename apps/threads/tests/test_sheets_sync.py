"""Tests for core.sheets_sync — スプレッドシート⇄JSON 変換（純粋関数）"""

import copy

from core import sheets_sync as ss


class TestTemplatesRoundtrip:
    def test_roundtrip(self):
        tmpl = {"gift-a": ["1本目", "2本目", "CTA {link}"], "areas-x": ["A", "B"]}
        slug_type = {"gift-a": "gift", "areas-x": "areas"}
        rows = ss.templates_to_rows(tmpl, slug_type)
        assert ss.rows_to_templates(rows) == tmpl

    def test_rows_sorted_by_order(self):
        rows = [["s", "gift", 2, "二番"], ["s", "gift", 1, "一番"]]
        assert ss.rows_to_templates(rows) == {"s": ["一番", "二番"]}

    def test_cta_note_marks_link(self):
        rows = ss.templates_to_rows({"s": ["本文 {link}"]}, {"s": "gift"})
        assert "CTA" in rows[0][4]

    def test_blank_rows_ignored(self):
        rows = [["", "", "", ""], ["s", "gift", 1, "本文"]]
        assert ss.rows_to_templates(rows) == {"s": ["本文"]}


class TestSourceEdits:
    def test_body_edit_preserves_meta(self):
        csrc = {"sources": [{
            "id": "src1", "url": "u", "reader": {"persona": "keep"},
            "materials": {"empathy": ["old1", "old2"], "core": "oldcore"}}]}
        rows = ss.sources_to_rows(csrc)
        # empathy 1本目を書き換え
        for r in rows:
            if r[1] == "共感" and r[2] == 1:
                r[3] = "new1"
        out = ss.apply_source_rows(copy.deepcopy(csrc), rows)
        assert out["sources"][0]["materials"]["empathy"][0] == "new1"
        assert out["sources"][0]["materials"]["empathy"][1] == "old2"
        assert out["sources"][0]["reader"]["persona"] == "keep"   # メタ保持

    def test_core_edit(self):
        csrc = {"sources": [{"id": "s", "url": "u",
                             "materials": {"core": "old"}}]}
        rows = [["s", "誘導(core)", 1, "new-core", "u"]]
        out = ss.apply_source_rows(csrc, rows)
        assert out["sources"][0]["materials"]["core"] == "new-core"


class TestHypStatus:
    def test_pause_and_activate(self):
        hyps = [{"id": "a", "type": "gift", "name": "A", "status": "active"},
                {"id": "b", "type": "areas", "name": "B", "status": "active"}]
        rows = [["a", "gift", "A", "paused"], ["b", "areas", "B", "active"]]
        out = ss.apply_hyp_status(copy.deepcopy(hyps), rows)
        assert out[0]["status"] == "paused"
        assert out[1]["status"] == "active"


class TestSettings:
    def test_apply(self):
        posting = {"time_slots": ["21:00"], "source_post_ratio": 0.5,
                   "slot_type_map": {"morning": ["areas"], "night": ["gift"]}}
        rows = [
            ["投稿時刻", "09:00 / 21:00", ""],
            ["引用リソース比率", "0.7", ""],
            ["朝の対象層", "mother, areas", ""],
            ["夜の対象層", "gift, urgent", ""],
        ]
        out = ss.apply_settings_rows(copy.deepcopy(posting), rows)
        assert out["time_slots"] == ["09:00", "21:00"]
        assert out["source_post_ratio"] == 0.7
        assert out["slot_type_map"]["morning"] == ["mother", "areas"]
        assert out["slot_type_map"]["night"] == ["gift", "urgent"]

    def test_ratio_clamped(self):
        out = ss.apply_settings_rows({}, [["引用リソース比率", "5", ""]])
        assert out["source_post_ratio"] == 1.0
