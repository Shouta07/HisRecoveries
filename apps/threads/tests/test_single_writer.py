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

    def test_category_mix_follows_ratios(self):
        random.seed(5)
        counts = {}
        n = 600
        for _ in range(n):
            r = _gen()
            counts[r["post_category"]] = counts.get(r["post_category"], 0) + 1
        forms = json.loads((ACCOUNT / "post_forms.json").read_text(encoding="utf-8"))
        for c in forms["categories"]:
            share = counts.get(c["id"], 0) / n
            # 乱数なのでぴったりにはならない。桁が合っていればよい
            assert abs(share - c["ratio"]) < 0.08, (c["id"], share, c["ratio"])

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
