"""恋亀の単発投稿（generate_single）。

連投から単発へ移したときに作った。見ているのは3つ。
  - 型の比率どおりに出るか（A/B/C/D）
  - リンクが告知にだけ付くか
  - 追跡コードが、本文のURLと返り値で一致するか（ここがずれると計測が死ぬ）
"""

import json
import random
from pathlib import Path

import pytest

from core import writer
from core.validator import validate_post


ACCOUNT = Path(__file__).resolve().parent.parent / "accounts" / "mens-body-lab"


@pytest.fixture
def persona():
    return json.loads((ACCOUNT / "persona.json").read_text(encoding="utf-8"))


def _gen(**kw):
    return writer.generate_single(ACCOUNT, mock=True, record=False, **kw)


class TestGenerateSingle:
    def test_returns_a_single_post(self, persona):
        r = _gen()
        assert r is not None
        assert "posts" not in r          # 連投ではない
        assert not r.get("is_thread")
        assert r["text"].strip()

    def test_output_passes_validation(self, persona):
        random.seed(3)
        for _ in range(30):
            r = _gen()
            assert r is not None
            ok, errors = validate_post(r["text"], persona)
            assert ok, (errors, r["text"])

    def test_category_mix_follows_ratios_without_slot_weights(self, persona):
        """時間帯の重みが無ければ、post_forms.json の比率どおりに出る。"""
        random.seed(5)
        flat = json.loads(json.dumps(persona))
        flat["posting"].pop("slot_category_weights", None)

        counts = {}
        n = 600
        for _ in range(n):
            r = writer.generate_single(ACCOUNT, persona=flat, mock=True, record=False)
            counts[r["post_category"]] = counts.get(r["post_category"], 0) + 1
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        for c in forms["categories"]:
            share = counts.get(c["id"], 0) / n
            # 乱数なのでぴったりにはならない。桁が合っていればよい
            assert abs(share - c["ratio"]) < 0.08, (c["id"], share, c["ratio"])


class TestSlotWeighting:
    """時間帯で型を寄せる。

    テーマは縛らない（縛ると夜のテーマが朝に出せなくなって同じ話が続く）が、
    型は寄せてよい。夜のほうが手が止まるので、返信の来る問いを夜に厚くする。
    """

    def _mix(self, slot, n=400):
        counts = {}
        for _ in range(n):
            r = _gen(slot=slot)
            counts[r["post_category"]] = counts.get(r["post_category"], 0) + 1
        return {k: v / n for k, v in counts.items()}

    def test_questions_are_heavier_at_night(self):
        random.seed(11)
        assert self._mix("night")["split"] > self._mix("morning")["split"]

    def test_announcements_only_at_noon(self):
        """朝は読み飛ばされ、夜は売り込みが目立つ。"""
        random.seed(13)
        noon = self._mix("noon").get("announce", 0)
        assert noon > self._mix("morning").get("announce", 0)
        assert noon > self._mix("night").get("announce", 0)

    def test_slot_is_recorded(self):
        """どの枠向けに作ったかが残る。承認画面と履歴で見分けるため。"""
        assert _gen(slot="noon")["slot"] == "noon"

    def test_unknown_slot_falls_back_to_the_plain_ratios(self):
        random.seed(17)
        mix = self._mix("teatime", n=200)
        assert set(mix) <= {"empathy", "split", "product", "announce"}
        assert mix["empathy"] > 0.25

    def test_link_only_on_announcements(self):
        random.seed(7)
        for _ in range(200):
            r = _gen()
            if r["post_category"] == "announce":
                assert r["link"], "告知にリンクが無い"
                assert r["link"] in r["text"]
            else:
                assert not r["link"], f"{r['post_category']} にリンクが付いている"
                assert "http" not in r["text"]

    def test_tracking_code_matches_the_url(self):
        """utm_content と返り値の tracking_code が一致すること。

        ここがずれると、どの投稿がサイトまで連れてきたかを辿れなくなる。
        """
        random.seed(9)
        found = 0
        for _ in range(200):
            r = _gen()
            if not r["link"]:
                continue
            found += 1
            assert f"utm_content={r['tracking_code']}" in r["link"]
        assert found > 0, "告知が1本も出なかった"

    def test_codes_are_unique(self):
        codes = {_gen()["tracking_code"] for _ in range(100)}
        assert len(codes) == 100

    def test_aborts_when_forms_file_missing(self, tmp_path):
        """型のファイルが無ければ、別の型で代用せずに中止する。"""
        (tmp_path / "persona.json").write_text(
            json.dumps({"posting": {"format": "single"}}), encoding="utf-8",
        )
        assert writer.generate_single(tmp_path, mock=True, record=False) is None


class TestRouting:
    def test_generate_post_routes_single_format(self, monkeypatch):
        called = {}

        def fake(account_dir, **kw):
            called["yes"] = True
            return {"text": "x"}

        monkeypatch.setattr(writer, "generate_single", fake)
        writer.generate_post(ACCOUNT, mock=True, record=False)
        assert called.get("yes"), "format=single が generate_single に行っていない"


class TestVariety:
    """同じ形が続かないこと。

    避けないと、60日のうち34日で1日3本の型が重なった。
    告知が同じ日に2本出る日もあった（1日2回の売り込みになる）。
    """

    def _account(self, tmp_path):
        for f in ("persona.json", "post_forms.json", "hypotheses.json", "experiments.json"):
            (tmp_path / f).write_text((ACCOUNT / f).read_text(encoding="utf-8"), encoding="utf-8")
        (tmp_path / "approvals.json").write_text('{"items": []}', encoding="utf-8")
        (tmp_path / "history.json").write_text('{"posts": []}', encoding="utf-8")
        return tmp_path

    def _queue(self, d, form, category):
        q = json.loads((d / "approvals.json").read_text(encoding="utf-8"))
        q["items"].append({
            "status": "pending",
            "payload": {"post_form": form, "post_category": category},
        })
        (d / "approvals.json").write_text(json.dumps(q), encoding="utf-8")

    def test_sees_the_queue_not_just_history(self, tmp_path):
        """1日3本をまとめて作るので、history だけだと直前の1本が見えない。"""
        d = self._account(tmp_path)
        self._queue(d, "gap", "split")
        recent = writer._recent_posts_meta(d)
        assert recent and recent[0]["form"] == "gap"

    def test_avoids_repeating_the_last_form(self, tmp_path):
        random.seed(21)
        d = self._account(tmp_path)
        self._queue(d, "odd", "empathy")
        repeats = sum(
            1 for _ in range(60)
            if writer.generate_single(d, mock=True, record=False, slot="morning")["post_form"] == "odd"
        )
        # 禁止ではなく重みを下げるだけなので0にはならない。明確に減ればよい
        assert repeats < 20, repeats

    def test_a_day_rarely_repeats_a_form(self, tmp_path):
        random.seed(23)
        same = 0
        for _ in range(30):
            d = self._account(tmp_path)
            forms = []
            for slot in ("morning", "noon", "night"):
                r = writer.generate_single(d, mock=True, record=False, slot=slot)
                forms.append(r["post_form"])
                self._queue(d, r["post_form"], r["post_category"])
            if len(set(forms)) < 3:
                same += 1
        assert same <= 6, f"30日のうち{same}日で型が重なった"

    def test_never_two_announcements_in_one_day(self, tmp_path):
        """1日2回の売り込みにしない。"""
        random.seed(29)
        for _ in range(30):
            d = self._account(tmp_path)
            cats = []
            for slot in ("morning", "noon", "night"):
                r = writer.generate_single(d, mock=True, record=False, slot=slot)
                cats.append(r["post_category"])
                self._queue(d, r["post_form"], r["post_category"])
            assert cats.count("announce") <= 1, cats

    def test_still_generates_when_only_one_form_is_left(self, tmp_path):
        """直前と同じ型しか選べなくても、生成を止めない。"""
        d = self._account(tmp_path)
        self._queue(d, "announce", "announce")
        r = writer.generate_single(d, mock=True, record=False, slot="noon")
        assert r is not None
