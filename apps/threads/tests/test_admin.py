"""Tests for admin.server — 投稿管理ページ"""

import base64
import json

from admin import server as s
from admin import storage


class TestAuth:
    def test_no_password_allows_all(self, monkeypatch):
        monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
        monkeypatch.delenv("ADMIN_USERS", raising=False)
        monkeypatch.delenv("ADMIN_USER", raising=False)
        assert s.check_basic_auth(None) is True

    def test_password_blocks_without_header(self, monkeypatch):
        monkeypatch.setenv("ADMIN_PASSWORD", "secret")
        assert s.check_basic_auth(None) is False
        st, headers, _ = s.dispatch("GET", "/", {}, {}, None)
        assert st == 401
        assert any(k == "WWW-Authenticate" for k, _ in headers)

    def test_password_accepts_correct(self, monkeypatch):
        monkeypatch.setenv("ADMIN_PASSWORD", "secret")
        monkeypatch.delenv("ADMIN_USER", raising=False)
        monkeypatch.delenv("ADMIN_USERS", raising=False)
        good = "Basic " + base64.b64encode(b"user:secret").decode()
        assert s.check_basic_auth(good) is True
        bad = "Basic " + base64.b64encode(b"user:wrong").decode()
        assert s.check_basic_auth(bad) is False

    def test_id_and_password_required(self, monkeypatch):
        monkeypatch.setenv("ADMIN_USER", "alice")
        monkeypatch.setenv("ADMIN_PASSWORD", "secret")
        monkeypatch.delenv("ADMIN_USERS", raising=False)
        ok = "Basic " + base64.b64encode(b"alice:secret").decode()
        assert s.check_basic_auth(ok) is True
        wrong_user = "Basic " + base64.b64encode(b"bob:secret").decode()
        assert s.check_basic_auth(wrong_user) is False

    def test_multi_user_map(self, monkeypatch):
        monkeypatch.setenv("ADMIN_USERS", '{"owner":"p1","friend":"p2"}')
        monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
        monkeypatch.delenv("ADMIN_USER", raising=False)
        assert s.check_basic_auth("Basic " + base64.b64encode(b"friend:p2").decode()) is True
        assert s.check_basic_auth("Basic " + base64.b64encode(b"owner:p1").decode()) is True
        assert s.check_basic_auth("Basic " + base64.b64encode(b"friend:wrong").decode()) is False
        assert s.check_basic_auth("Basic " + base64.b64encode(b"ghost:x").decode()) is False


class TestGitHubStorage:
    def test_read_builds_contents_request(self):
        gh = storage.GitHubStorage("tok", "owner/repo", "main")
        seen = {}

        def fake(method, path, body=None):
            seen["call"] = (method, path)
            return {"content": base64.b64encode("やあ".encode()).decode(), "sha": "s"}

        gh._req = fake
        assert gh.read("mens-body-lab", "persona.json") == "やあ"
        assert seen["call"][0] == "GET"
        assert "contents/accounts/mens-body-lab/persona.json?ref=main" in seen["call"][1]

    def test_write_includes_sha_and_branch(self):
        gh = storage.GitHubStorage("tok", "owner/repo", "main")
        seq = [{"sha": "oldsha"}, {"commit": {"sha": "abcdef0"}}]
        bodies = []

        def fake(method, path, body=None):
            if body is not None:
                bodies.append(body)
            return seq.pop(0)

        gh._req = fake
        msg = gh.write("mens-body-lab", "drafts.json", "{}", "m")
        assert bodies[0]["sha"] == "oldsha"
        assert bodies[0]["branch"] == "main"
        assert "abcdef0" in msg


class TestSplitPosts:
    def test_roundtrip(self):
        posts = ["1投目\n2行目", "2投目", "CTA {link}"]
        joined = s.POST_SEP.join(posts)
        assert s.split_posts(joined) == posts

    def test_ignores_blank_segments(self):
        text = "a\n---\n\n---\nb"
        assert s.split_posts(text) == ["a", "b"]

    def test_crlf_normalized(self):
        text = "a\r\n---\r\nb"
        assert s.split_posts(text) == ["a", "b"]


class TestRendering:
    def test_dashboard_lists_accounts(self):
        html = s.render_dashboard().decode()
        assert "投稿管理ページ" in html
        # 既存アカウントが並ぶ
        assert "mens-body-lab" in html

    def test_templates_page_lists_occasions(self):
        html = s.render_templates("mens-body-lab").decode()
        assert "gift-birthday" in html
        assert "{link}" in html

    def test_preview_does_not_pollute_state(self, tmp_path):
        # プレビュー生成は history/experiments を汚さない
        d = s.account_dir("mens-body-lab")
        before_hist = (d / "history.json").read_bytes() if (d / "history.json").exists() else None
        before_exp = (d / "experiments.json").exists()
        s.render_preview("mens-body-lab")
        after_hist = (d / "history.json").read_bytes() if (d / "history.json").exists() else None
        after_exp = (d / "experiments.json").exists()
        assert before_hist == after_hist
        assert before_exp == after_exp


class TestAnalytics:
    def test_empty_state(self):
        # 計測データが無いアカウントは空状態を表示
        html = s.render_analytics("mens-body-lab").decode()
        assert "まだ計測データがありません" in html

    def test_renders_metrics_sorted(self, monkeypatch):
        sample = {"posts": [
            {"posted_at": "2026-06-30T22:30:00", "text": "A", "hypothesis_name": "記念日",
             "link": "https://hisrecoveries.com/apply?x",
             "metrics": {"impressions": 1240, "likes": 38, "replies": 5, "reposts": 3}},
            {"posted_at": "2026-06-29T22:30:00", "text": "B", "hypothesis_name": "誕生日",
             "link": "https://hisrecoveries.com/apply?y",
             "metrics": {"impressions": 2980, "likes": 51, "replies": 9, "reposts": 7}},
            {"posted_at": "2026-06-28T22:30:00", "text": "C", "hypothesis_name": "結婚式"},
        ]}
        monkeypatch.setattr(s.ST, "read_json",
                            lambda acc, f, d: sample if f == "history.json" else d)
        html = s.render_analytics("mens-body-lab").decode()
        # 計測済みは2件、数値はカンマ整形、インプレッション降順
        assert "計測 2件" in html
        assert "2,980" in html and "1,240" in html
        assert html.index("2,980") < html.index("1,240")

    def test_link_dest_and_engagement(self, monkeypatch):
        sample = {"posts": [
            {"posted_at": "2026-06-30", "text": "A", "hypothesis_name": "x",
             "link": "https://hisrecoveries.com/areas/hair",
             "metrics": {"impressions": 1000, "likes": 30, "replies": 10, "reposts": 10}},
        ]}
        monkeypatch.setattr(s.ST, "read_json",
                            lambda acc, f, d: sample if f == "history.json" else d)
        html = s.render_analytics("mens-body-lab").decode()
        assert "/areas" in html
        # エンゲ率 = (30+10+10)/1000 = 5.0%
        assert "5.0%" in html

    def test_link_dest_helper(self):
        assert s._link_dest("https://x/apply?a") == "/apply"
        assert s._link_dest("https://x/areas/hair") == "/areas"
        assert s._link_dest("") == "なし"

    def test_search_filters_by_keyword(self, monkeypatch):
        sample = {"posts": [
            {"posted_at": "2026-06-30", "text": "記念日に贈る話", "hypothesis_name": "記念日",
             "link": "x/apply", "metrics": {"impressions": 2000, "likes": 50}},
            {"posted_at": "2026-06-29", "text": "誕生日の贈り物", "hypothesis_name": "誕生日",
             "link": "x/apply", "metrics": {"impressions": 900, "likes": 80}},
        ]}
        monkeypatch.setattr(s.ST, "read_json",
                            lambda acc, f, d: sample if f == "history.json" else d)
        html = s.render_analytics("mens-body-lab", q="記念日").decode()
        assert "計測 1件" in html
        nomatch = s.render_analytics("mens-body-lab", q="zzz").decode()
        assert "一致する計測済み投稿はありません" in nomatch

    def test_sort_by_likes(self, monkeypatch):
        sample = {"posts": [
            {"posted_at": "2026-06-30", "text": "A", "metrics": {"impressions": 2000, "likes": 50}},
            {"posted_at": "2026-06-29", "text": "B", "metrics": {"impressions": 900, "likes": 80}},
        ]}
        monkeypatch.setattr(s.ST, "read_json",
                            lambda acc, f, d: sample if f == "history.json" else d)
        html = s.render_analytics("mens-body-lab", sort="likes").decode()
        assert html.index("80") < html.index("50")


class TestPDCA:
    def _wire(self, monkeypatch):
        store = {
            "history.json": {"posts": [
                {"hypothesis_id": "gift-birthday",
                 "metrics": {"impressions": 3000, "likes": 60, "replies": 8, "reposts": 5}},
                {"hypothesis_id": "areas-sweat",
                 "metrics": {"impressions": 800, "likes": 10, "replies": 1, "reposts": 0}},
            ]},
            "hypotheses.json": {"hypotheses": [
                {"id": "gift-birthday", "type": "gift", "name": "誕生日", "status": "active"},
                {"id": "areas-sweat", "type": "areas", "name": "汗", "status": "active"}]},
            "persona.json": {"posting": {"source_post_ratio": 0.5}},
            "experiments.json": {"current_phase": "explore"},
        }
        monkeypatch.setattr(s.ST, "read_json",
                            lambda acc, f, d: store.get(f, d))

        def w(acc, f, c, m):
            store[f] = json.loads(c)
            return "saved"
        monkeypatch.setattr(s.ST, "write", w)
        return store

    def test_render_sorts_winner_first(self, monkeypatch):
        self._wire(monkeypatch)
        html = s.render_pdca("mens-body-lab").decode()
        assert "PDCA運用" in html
        assert html.index("誕生日") < html.index("汗")   # winner on top

    def test_toggle_pauses_hypothesis(self, monkeypatch):
        store = self._wire(monkeypatch)
        msg = s.pdca_toggle_status("mens-body-lab", "areas-sweat")
        assert "停止" in msg
        paused = [h for h in store["hypotheses.json"]["hypotheses"] if h["id"] == "areas-sweat"][0]
        assert paused["status"] == "paused"
        # toggling again reactivates
        s.pdca_toggle_status("mens-body-lab", "areas-sweat")
        paused = [h for h in store["hypotheses.json"]["hypotheses"] if h["id"] == "areas-sweat"][0]
        assert paused["status"] == "active"

    def test_focus_sets_top_hypotheses(self, monkeypatch):
        store = self._wire(monkeypatch)
        s.pdca_set_phase("mens-body-lab", "focus")
        assert store["experiments.json"]["current_phase"] == "focus"
        assert store["experiments.json"]["top_hypotheses"][0] == "gift-birthday"

    def test_ratio_clamped_and_saved(self, monkeypatch):
        store = self._wire(monkeypatch)
        s.pdca_set_ratio("mens-body-lab", "1.5")   # clamp to 1.0
        assert store["persona.json"]["posting"]["source_post_ratio"] == 1.0


class TestJsonGuard:
    def test_bad_json_not_saved(self):
        msg = s.save_edit("mens-body-lab", "hypotheses.json", "{ not valid")
        assert "JSON" in msg and "保存しませんでした" in msg
