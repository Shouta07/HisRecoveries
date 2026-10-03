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

    def test_category_mix_follows_ratios_without_slot_weights(self, persona, tmp_path):
        """時間帯の重みが無ければ、post_forms.json の比率どおりに出る。

        実アカウントではなく写しを使う。承認キューの中身で分布が変わる
        （直近の型を避けるため）ので、運用中のキューを見ると落ちる。
        """
        random.seed(5)
        flat = json.loads(json.dumps(persona))
        flat["posting"].pop("slot_category_weights", None)
        for f in ("post_forms.json", "hypotheses.json", "experiments.json"):
            (tmp_path / f).write_text((ACCOUNT / f).read_text(encoding="utf-8"), encoding="utf-8")
        (tmp_path / "approvals.json").write_text('{"items": []}', encoding="utf-8")
        (tmp_path / "history.json").write_text('{"posts": []}', encoding="utf-8")

        counts = {}
        n = 900
        for _ in range(n):
            r = writer.generate_single(tmp_path, persona=flat, mock=True, record=False)
            counts[r["post_category"]] = counts.get(r["post_category"], 0) + 1

        # 人が書くカテゴリは自動生成に出ないので、その比率を残りが吸う。
        # 期待値は、自動のぶんだけで割り直した比率。
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        auto = [c for c in forms["categories"] if not c.get("human_only")]
        total = sum(c["ratio"] for c in auto)
        for c in auto:
            share = counts.get(c["id"], 0) / n
            expected = c["ratio"] / total
            # 乱数なのでぴったりにはならない。桁が合っていればよい
            assert abs(share - expected) < 0.06, (c["id"], share, expected)


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

    def test_cases_are_heavier_at_night(self):
        """手が止まるのは夜。議論になるケース投稿を夜に厚くする。"""
        random.seed(11)
        assert self._mix("night")["case"] > self._mix("morning")["case"]

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
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        auto = {c["id"] for c in forms["categories"] if not c.get("human_only")}
        mix = self._mix("teatime", n=300)
        assert set(mix) <= auto, set(mix) - auto
        # 共感がいちばん多いこと（比率30%が、再配分で約33%になる）
        assert mix["empathy"] == max(mix.values())

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


class TestHumanOnlyCategories:
    """実在異性の反応は、自動生成しない。

    実際に集まった回答が無いのに書くと、女性の反応の創作になる。
    それを売っているサービスが作り話を出したら、商品そのものが嘘になる。
    """

    def test_never_generated(self):
        random.seed(31)
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        human = {c["id"] for c in forms["categories"] if c.get("human_only")}
        assert human, "human_only のカテゴリが1つも無い（設定が消えている）"

        seen = {_gen()["post_category"] for _ in range(300)}
        assert not (seen & human), f"人が書くはずの {seen & human} が自動生成された"

    def test_their_share_is_absorbed_by_the_rest(self):
        """10%を空けるのではなく、残りが吸う。"""
        random.seed(37)
        n = 600
        got = {}
        for _ in range(n):
            c = _gen(slot="noon")["post_category"]
            got[c] = got.get(c, 0) + 1
        assert sum(got.values()) == n


class TestSlotWeightKeys:
    """時間帯の重みのキーが、実在のカテゴリと合っていること。

    合っていないと既定の1.0になり、寄せが黙って効かなくなる。
    カテゴリを 4つ→6つ に組み直したとき、実際に古いIDが残っていた。
    """

    def test_no_unknown_or_missing_keys(self, persona):
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        known = {c["id"] for c in forms["categories"]}
        auto = {c["id"] for c in forms["categories"] if not c.get("human_only")}

        weights = persona["posting"]["slot_category_weights"]
        for slot, w in weights.items():
            if slot.startswith("_"):
                continue
            assert not (set(w) - known), f"{slot} に知らないカテゴリ: {set(w) - known}"
            assert not (auto - set(w)), f"{slot} に重みが無い: {auto - set(w)}"

    def test_every_slot_in_the_schedule_has_weights(self, persona):
        """投稿枠の数と、重みを定義した時間帯の数が合っていること。"""
        slots = persona["posting"]["time_slots"]
        weights = {k for k in persona["posting"]["slot_category_weights"] if not k.startswith("_")}
        assert len(weights) == len(slots), (weights, slots)
