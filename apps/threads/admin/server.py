"""投稿管理ページ（ローカル / Vercel 両対応）

ストレージは admin.storage が決める:
- ローカル: accounts/<id>/ を直接読み書き（python -m admin.server）
- Vercel  : GitHub Contents API で読み書き（編集＝リポジトリへコミット）

UIの描画・ルーティングは共通。ローカルは http.server、Vercelは WSGI(api/index.py)
から同じ dispatch() を呼ぶ。追加依存ゼロ（標準ライブラリのみ）。

起動（ローカル）:
    python -m admin.server            # http://127.0.0.1:8765
"""

from __future__ import annotations

import argparse
import base64
import html
import json
import os
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from admin.storage import get_storage, ROOT, ACCOUNTS_DIR

ST = get_storage()

EDITABLE_FILES = [
    ("persona.json", "ペルソナ", "json"),
    ("hypotheses.json", "仮説・リンク設定", "json"),
    ("patterns.md", "パターン", "md"),
    ("GIFT_PROMPT.md", "ギフトプロンプト", "md"),
    ("GIFT_STRATEGY.md", "ギフト戦略メモ", "md"),
    ("thread_templates.json", "連投テンプレ(raw)", "json"),
    ("seo_clusters.json", "SEO/GEOクラスタ", "json"),
    ("content_sources.json", "引用リソース(投稿の素)", "json"),
    ("CONTENT_SOURCES.md", "引用リソースの型(仕様)", "md"),
    ("READ_DESIGN.md", "読まれる投稿設計(型×ドメイン)", "md"),
    ("BIZ_HYPOTHESES.md", "事業仮説の検証設計", "md"),
    ("BIZ_B2B_VALIDATION.md", "B2B仮説の検証設計(C/D1)", "md"),
]
EDITABLE_NAMES = {f[0] for f in EDITABLE_FILES}

POST_SEP = "\n---\n"


# ─── 認証（パスワード保護: ADMIN_PASSWORD があれば必須）──────────


def _auth_configured() -> bool:
    return bool(os.getenv("ADMIN_USERS") or os.getenv("ADMIN_PASSWORD"))


def _verify_credentials(user: str, password: str) -> bool:
    """ID+パスワードを検証する。

    優先:
      1) ADMIN_USERS = '{"alice":"pw1","bob":"pw2"}' があればそのマップで照合（複数発行向け）
      2) ADMIN_USER + ADMIN_PASSWORD（単一のID+パスワード）
      3) ADMIN_PASSWORD のみ（IDは任意・後方互換）
    どれも未設定ならローカル扱いで認証なし。
    """
    users_json = os.getenv("ADMIN_USERS", "")
    if users_json:
        try:
            users = json.loads(users_json)
        except Exception:
            return False
        return bool(password) and users.get(user) == password
    pw = os.getenv("ADMIN_PASSWORD", "")
    if not pw:
        return True  # 認証未設定（ローカル）
    expected_user = os.getenv("ADMIN_USER", "")
    if expected_user:
        return user == expected_user and password == pw
    return password == pw  # IDは任意（後方互換）


def check_basic_auth(auth_header: str | None) -> bool:
    if not _auth_configured():
        return True  # 未設定（ローカル）なら認証なし
    if not auth_header or not auth_header.startswith("Basic "):
        return False
    try:
        decoded = base64.b64decode(auth_header[6:]).decode("utf-8")
    except Exception:
        return False
    user, _, password = decoded.partition(":")
    return _verify_credentials(user, password)


# ─── on-disk アカウントパス（プレビュー生成用。読み取りのみ）───────


def account_dir(account: str) -> Path:
    d = (ACCOUNTS_DIR / account).resolve()
    if ACCOUNTS_DIR not in d.parents and d != ACCOUNTS_DIR:
        raise ValueError("invalid account path")
    if not d.is_dir():
        raise ValueError(f"unknown account: {account}")
    return d


def list_accounts() -> list[str]:
    return ST.list_accounts()


# ─── HTML描画 ──────────────────────────────────────────────

CSS = """
* { box-sizing: border-box; }
body { font-family: -apple-system, "Hiragino Sans", sans-serif; margin: 0;
       background: #f6f6f4; color: #222; line-height: 1.6; }
header { background: #2b2b29; color: #f6f6f4; padding: 14px 22px; }
header a { color: #cfcfca; text-decoration: none; margin-right: 16px; font-size: 14px; }
header a:hover { color: #fff; }
.wrap { max-width: 860px; margin: 0 auto; padding: 24px 22px 80px; }
h1 { font-size: 20px; margin: 0; }
h2 { font-size: 17px; margin: 28px 0 10px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
.card { background: #fff; border: 1px solid #e3e3df; border-radius: 10px;
        padding: 16px 18px; margin: 14px 0; }
.card h3 { margin: 0 0 8px; font-size: 15px; }
a.btn, button { display: inline-block; background: #2b2b29; color: #fff; border: none;
        padding: 8px 14px; border-radius: 7px; font-size: 14px; cursor: pointer;
        text-decoration: none; }
a.btn.sec, button.sec { background: #fff; color: #2b2b29; border: 1px solid #bbb; }
a.btn.danger, button.danger { background: #a23; }
textarea { width: 100%; font-family: ui-monospace, monospace; font-size: 13px;
        border: 1px solid #ccc; border-radius: 7px; padding: 10px; }
.muted { color: #888; font-size: 13px; }
.tag { display:inline-block; background:#eee; border-radius:5px; padding:1px 7px;
       font-size:12px; color:#555; margin-left:6px; }
.thread .post { background:#fafafa; border:1px solid #e6e6e2; border-radius:8px;
       padding:10px 12px; margin:8px 0; white-space:pre-wrap; }
.thread .post .n { color:#999; font-size:12px; }
.flash { background:#e7f3e7; border:1px solid #bcd9bc; color:#2a572a;
       padding:10px 14px; border-radius:8px; margin:12px 0; }
.row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
"""


def esc(s) -> str:
    return html.escape(str(s))


def page(title: str, body: str) -> bytes:
    badge = "GitHub" if ST.backend == "github" else "ローカル"
    h = f"""<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} | 投稿管理</title><style>{CSS}</style></head>
<body><header><div class="row" style="justify-content:space-between">
<h1>投稿管理ページ</h1><div><span class="tag">保存先: {badge}</span>
<a href="/">🏠 ダッシュボード</a></div></div></header>
<div class="wrap">{body}</div></body></html>"""
    return h.encode("utf-8")


# ─── 各ページ ──────────────────────────────────────────────


def render_dashboard(flash: str = "") -> bytes:
    rows = []
    for acc in list_accounts():
        persona = ST.read_json(acc, "persona.json", {})
        fmt = persona.get("posting", {}).get("format", "single")
        handle = persona.get("threads_handle", "")
        name = persona.get("display_name", acc)
        drafts = ST.read_json(acc, "drafts.json", {"drafts": []}).get("drafts", [])
        rows.append(f"""<div class="card"><div class="row" style="justify-content:space-between">
<div><h3>{esc(name)} <span class="tag">{esc(acc)}</span>
<span class="tag">{esc(fmt)}</span></h3>
<div class="muted">{esc(handle)} ・ 下書き {len(drafts)}件</div></div>
<div><a class="btn" href="/a/{esc(acc)}">開く</a></div></div></div>""")
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}<h2>アカウント</h2>{''.join(rows) or '<p class="muted">アカウントがありません</p>'}
<p class="muted">編集内容は accounts/&lt;id&gt;/ に保存されます。実際の投稿は GitHub Actions / CLI が行います。</p>"""
    return page("ダッシュボード", body)


def render_account(acc: str, flash: str = "") -> bytes:
    persona = ST.read_json(acc, "persona.json", {})
    files = []
    for fname, label, _kind in EDITABLE_FILES:
        if ST.read(acc, fname) is not None:
            files.append(f"""<div class="row" style="justify-content:space-between;margin:6px 0">
<div>{esc(label)} <span class="tag">{esc(fname)}</span></div>
<a class="btn sec" href="/a/{esc(acc)}/edit?f={esc(fname)}">編集</a></div>""")
    tmpl_link = ""
    if ST.read(acc, "thread_templates.json") is not None:
        tmpl_link = f'<a class="btn" href="/a/{esc(acc)}/templates">連投テンプレを編集</a> '
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}
<p class="muted"><a href="/">← ダッシュボード</a></p>
<h2>{esc(persona.get('display_name', acc))} <span class="tag">{esc(acc)}</span></h2>
<div class="card"><div class="row">
{tmpl_link}
<a class="btn" href="/a/{esc(acc)}/preview">投稿をプレビュー生成</a>
<a class="btn sec" href="/a/{esc(acc)}/drafts">下書き一覧</a>
<a class="btn sec" href="/a/{esc(acc)}/analytics">閲覧数・分析</a>
<a class="btn" href="/a/{esc(acc)}/pdca">PDCA運用</a>
</div></div>
<h2>設定ファイル</h2><div class="card">{''.join(files) or '<p class="muted">編集対象ファイルなし</p>'}</div>
"""
    return page(acc, body)


def render_templates(acc: str, flash: str = "") -> bytes:
    data = ST.read_json(acc, "thread_templates.json", {})
    blocks = []
    for occ, posts in data.items():
        joined = POST_SEP.join(posts)
        rows = len(joined.splitlines()) + 2
        blocks.append(f"""<div class="card"><h3>{esc(occ)}
<span class="tag">{len(posts)}投</span></h3>
<div class="muted">投稿の区切りは <code>---</code> だけの行。CTAには <code>{{link}}</code> を置く。</div>
<textarea name="tmpl__{esc(occ)}" rows="{rows}">{esc(joined)}</textarea></div>""")
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}
<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>
<h2>連投テンプレート <span class="tag">thread_templates.json</span></h2>
<form method="post" action="/a/{esc(acc)}/templates">
{''.join(blocks)}
<div class="row"><button type="submit">保存</button>
<a class="btn sec" href="/a/{esc(acc)}/preview">保存後にプレビュー</a></div>
</form>"""
    return page(f"{acc} テンプレ", body)


def render_edit(acc: str, fname: str, flash: str = "") -> bytes:
    if fname not in EDITABLE_NAMES:
        raise ValueError("not editable")
    content = ST.read(acc, fname) or ""
    kind = next((k for f, _, k in EDITABLE_FILES if f == fname), "text")
    rows = max(18, len(content.splitlines()) + 3)
    note = "JSONとして保存時に検証します。" if kind == "json" else ""
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}
<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>
<h2>{esc(fname)} を編集</h2><p class="muted">{note}</p>
<form method="post" action="/a/{esc(acc)}/edit">
<input type="hidden" name="f" value="{esc(fname)}">
<textarea name="content" rows="{rows}">{esc(content)}</textarea>
<div class="row" style="margin-top:10px"><button type="submit">保存</button></div>
</form>"""
    return page(f"{acc} {fname}", body)


def render_thread_html(posts: list[str]) -> str:
    items = []
    for i, p in enumerate(posts, 1):
        items.append(f'<div class="post"><span class="n">{i}/{len(posts)}</span>\n{esc(p)}</div>')
    return f'<div class="thread">{"".join(items)}</div>'


def render_preview(acc: str, flash: str = "") -> bytes:
    # mockで1本生成（record=False で状態を一切書き換えない＝read-only FSでも安全）
    try:
        from core import writer
        result = writer.generate_post(account_dir(acc), mock=True, record=False)
    except Exception as e:
        # Vercel等でcore/accountsが同梱されない場合はローカル実行を案内
        body = (f'<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>'
                f'<div class="card"><p>この環境ではプレビュー生成を実行できませんでした。</p>'
                f'<p class="muted">ローカルで <code>python -m admin.server</code> を起動すると'
                f'プレビューできます。編集・保存はこのままご利用いただけます。</p>'
                f'<p class="muted">詳細: {esc(e)}</p></div>')
        return page(f"{acc} プレビュー", body)
    if not result:
        body = f'<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p><p>生成に失敗しました。</p>'
        return page(f"{acc} プレビュー", body)
    is_thread = result.get("is_thread")
    posts = result.get("posts") or [result.get("text", "")]
    occ = result.get("hypothesis_id", "")
    payload = json.dumps({"occasion": occ, "posts": posts}, ensure_ascii=False)
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}
<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>
<h2>プレビュー <span class="tag">{esc(occ)}</span>
<span class="tag">{'連投' if is_thread else '単発'}</span></h2>
{render_thread_html(posts)}
<form method="post" action="/a/{esc(acc)}/preview" style="margin-top:10px">
<div class="row">
<button type="submit" name="action" value="regen" class="sec">別の案を生成</button>
<input type="hidden" name="payload" value="{esc(payload)}">
<button type="submit" name="action" value="save_draft">この案を下書き保存</button>
</div></form>"""
    return page(f"{acc} プレビュー", body)


def render_drafts(acc: str, flash: str = "") -> bytes:
    drafts = ST.read_json(acc, "drafts.json", {"drafts": []}).get("drafts", [])
    blocks = []
    for dr in reversed(drafts):
        did = dr.get("id")
        posts = dr.get("posts", [])
        joined = POST_SEP.join(posts)
        rows = len(joined.splitlines()) + 2
        blocks.append(f"""<div class="card"><h3>{esc(dr.get('occasion','(無題)'))}
<span class="tag">{esc(dr.get('status','draft'))}</span>
<span class="tag">{len(posts)}投</span></h3>
<form method="post" action="/a/{esc(acc)}/drafts">
<input type="hidden" name="action" value="update"><input type="hidden" name="id" value="{esc(did)}">
<textarea name="body" rows="{rows}">{esc(joined)}</textarea>
<div class="row" style="margin-top:8px">
<button type="submit">保存</button></form>
<form method="post" action="/a/{esc(acc)}/drafts" onsubmit="return confirm('削除しますか？')">
<input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="{esc(did)}">
<button type="submit" class="danger">削除</button></form>
</div></div>""")
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    body = f"""{flash_html}
<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>
<h2>下書き <span class="tag">{len(drafts)}件</span></h2>
<p class="muted">区切りは <code>---</code> だけの行。ここで本文を直接修正できます。</p>
{''.join(blocks) or '<p class="muted">下書きはありません。プレビューから保存できます。</p>'}
<div class="card"><a class="btn" href="/a/{esc(acc)}/preview">プレビューから新規生成</a></div>"""
    return page(f"{acc} 下書き", body)


# ─── 分析（投稿ごとの閲覧数などを数値表示）──────────────────────


def _fmt(n) -> str:
    return f"{n:,}" if isinstance(n, (int, float)) else "—"


def _link_dest(link: str) -> str:
    if not link:
        return "なし"
    if "/apply" in link:
        return "/apply"
    if "/areas" in link:
        return "/areas"
    if "/check" in link:
        return "/check"
    return "その他"


def _engagement(m: dict):
    imp = m.get("impressions")
    if not imp:
        return None
    eng = (m.get("likes") or 0) + (m.get("replies") or 0) + \
          (m.get("reposts") or 0) + (m.get("quotes") or 0)
    return round(eng / imp * 100, 1)


_SORT_LABELS = {"imp": "閲覧数", "likes": "いいね", "date": "新しい順"}


def render_analytics(acc: str, flash: str = "", q: str = "", sort: str = "imp") -> bytes:
    data = ST.read_json(acc, "history.json", {"posts": []})
    posts = data.get("posts", [])

    # キーワード検索（本文に一致）
    ql = q.strip().lower()
    if ql:
        matched = [p for p in posts if ql in (p.get("text", "") or "").lower()]
    else:
        matched = posts
    measured = [p for p in matched if isinstance(p.get("metrics"), dict)
                and p["metrics"].get("impressions") is not None]

    total_imp = sum(p["metrics"].get("impressions") or 0 for p in measured)
    avg_imp = round(total_imp / len(measured)) if measured else 0

    # 機会別の平均インプレッション
    by_occ: dict = {}
    for p in measured:
        occ = p.get("hypothesis_name") or p.get("hypothesis_id") or "(不明)"
        by_occ.setdefault(occ, []).append(p["metrics"].get("impressions") or 0)
    occ_rows = "".join(
        f"<tr><td>{esc(o)}</td><td style='text-align:right'>{_fmt(round(sum(v)/len(v)))}</td>"
        f"<td style='text-align:right'>{len(v)}</td></tr>"
        for o, v in sorted(by_occ.items(), key=lambda x: -sum(x[1]) / len(x[1]))
    )

    # 並び替え
    if sort == "likes":
        key = lambda p: p["metrics"].get("likes") or -1
    elif sort == "date":
        key = lambda p: p.get("posted_at") or ""
    else:
        key = lambda p: p["metrics"].get("impressions") or -1
    rows = []
    for p in sorted(measured, key=key, reverse=True):
        m = p["metrics"]
        occ = p.get("hypothesis_name") or p.get("hypothesis_id") or "—"
        when = (p.get("posted_at") or "")[:16].replace("T", " ")
        snippet = (p.get("text", "").split("\n", 1)[0])[:24]
        eng = _engagement(m)
        rows.append(
            f"<tr><td class='muted'>{esc(when)}</td>"
            f"<td>{esc(occ)}<br><span class='muted'>{esc(snippet)}</span></td>"
            f"<td style='text-align:right'><b>{_fmt(m.get('impressions'))}</b></td>"
            f"<td style='text-align:right'>{_fmt(m.get('likes'))}</td>"
            f"<td style='text-align:right'>{_fmt(m.get('replies'))}</td>"
            f"<td style='text-align:right'>{_fmt(m.get('reposts'))}</td>"
            f"<td style='text-align:right'>{eng if eng is not None else '—'}%</td>"
            f"<td>{esc(_link_dest(p.get('link', '')))}</td></tr>"
        )

    # 検索＆並び替えフォーム
    sort_opts = "".join(
        f'<option value="{k}"{" selected" if k == sort else ""}>{esc(v)}</option>'
        for k, v in _SORT_LABELS.items()
    )
    search_form = f"""<div class="card"><form method="get" action="/a/{esc(acc)}/analytics" class="row">
<input type="text" name="q" value="{esc(q)}" placeholder="本文を検索（例: 記念日 / 匿名）"
 style="flex:1;min-width:180px;padding:8px;border:1px solid #ccc;border-radius:7px">
<select name="sort" style="padding:8px;border:1px solid #ccc;border-radius:7px">{sort_opts}</select>
<button type="submit">検索</button>
{'<a class="btn sec" href="/a/'+esc(acc)+'/analytics">クリア</a>' if q else ''}
</form></div>"""

    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    nav = f'<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a></p>'

    if not measured:
        note = (f"「{esc(q)}」に一致する計測済み投稿はありません。" if q
                else "まだ計測データがありません。")
        body = f"""{flash_html}{nav}<h2>閲覧数・分析</h2>{search_form}
<div class="card"><p>{note}</p>
<p class="muted">投稿が始まり Collect Metrics（collect.yml）が回ると、各投稿の
<b>閲覧数・いいね・返信・リポスト</b>が並びます。過去投稿をまとめて取り込むには
<code>python -m core.main import-history mens-body-lab</code>。
履歴総数: {len(posts)}件 / 検索一致: {len(matched)}件 / 計測済み: 0件</p></div>"""
        return page(f"{acc} 分析", body)

    title_tag = f'検索 "{esc(q)}" ・ ' if q else ""
    body = f"""{flash_html}{nav}
<h2>閲覧数・分析 <span class="tag">{title_tag}計測 {len(measured)}件</span></h2>
{search_form}
<div class="card"><div class="row" style="gap:28px">
<div><div class="muted">合計インプレッション</div><div style="font-size:22px"><b>{_fmt(total_imp)}</b></div></div>
<div><div class="muted">平均インプレッション/投稿</div><div style="font-size:22px"><b>{_fmt(avg_imp)}</b></div></div>
<div><div class="muted">計測済み投稿</div><div style="font-size:22px"><b>{len(measured)}</b></div></div>
</div></div>

<h2>機会別の平均インプレッション</h2>
<div class="card"><table style="width:100%;border-collapse:collapse">
<tr class="muted"><th style="text-align:left">機会</th><th style="text-align:right">平均imp</th><th style="text-align:right">本数</th></tr>
{occ_rows}</table></div>

<h2>投稿一覧（{esc(_SORT_LABELS.get(sort, '閲覧数'))}順）</h2>
<div class="card"><table style="width:100%;border-collapse:collapse;font-size:13px">
<tr class="muted"><th style="text-align:left">日時</th><th style="text-align:left">機会/冒頭</th>
<th style="text-align:right">閲覧</th><th style="text-align:right">♡</th>
<th style="text-align:right">返信</th><th style="text-align:right">RP</th>
<th style="text-align:right">エンゲ率</th><th style="text-align:left">リンク</th></tr>
{''.join(rows)}</table></div>
<p class="muted">閲覧数はThreads API由来（collect.ymlが日次取得 / import-historyで過去分も取込）。
/apply・/areasへの遷移率はGA4側で確認します。</p>"""
    return page(f"{acc} 分析", body)


# ─── PDCA運用（分析→ネタの停止/集中/比率調整を1画面で）──────────


def _hypothesis_stats(acc: str) -> dict:
    """仮説(ネタ)ごとに計測値を集計する。Returns {hid: {...}}"""
    posts = ST.read_json(acc, "history.json", {"posts": []}).get("posts", [])
    agg: dict = {}
    for p in posts:
        m = p.get("metrics")
        if not isinstance(m, dict) or m.get("impressions") is None:
            continue
        hid = p.get("hypothesis_id")
        if not hid:
            continue
        a = agg.setdefault(hid, {"imps": [], "engs": []})
        a["imps"].append(m.get("impressions") or 0)
        eng = _engagement(m)
        if eng is not None:
            a["engs"].append(eng)
    out = {}
    for hid, a in agg.items():
        out[hid] = {
            "count": len(a["imps"]),
            "avg_imp": round(sum(a["imps"]) / len(a["imps"])) if a["imps"] else 0,
            "avg_eng": round(sum(a["engs"]) / len(a["engs"]), 1) if a["engs"] else None,
        }
    return out


def render_pdca(acc: str, flash: str = "") -> bytes:
    hyp = ST.read_json(acc, "hypotheses.json", {"hypotheses": []})
    hypotheses = hyp.get("hypotheses", [])
    persona = ST.read_json(acc, "persona.json", {})
    exp = ST.read_json(acc, "experiments.json", {"current_phase": "explore"})
    phase = exp.get("current_phase", "explore")
    ratio = persona.get("posting", {}).get("source_post_ratio", 0)
    stats = _hypothesis_stats(acc)

    # 平均閲覧の降順（勝ちネタを上に）。データ無しは最後。
    def key(h):
        s = stats.get(h["id"])
        return s["avg_imp"] if s else -1
    ordered = sorted(hypotheses, key=key, reverse=True)

    rows = []
    for h in ordered:
        s = stats.get(h["id"])
        hid = h["id"]
        active = h.get("status", "active") == "active"
        style = "" if active else "opacity:.45"
        cnt = s["count"] if s else 0
        imp = _fmt(s["avg_imp"]) if s else "—"
        eng = f'{s["avg_eng"]}%' if s and s["avg_eng"] is not None else "—"
        btn_label = "止める" if active else "再開"
        btn_cls = "danger" if active else "sec"
        rows.append(
            f'<tr style="{style}"><td>{esc(h.get("name", hid))}'
            f'<br><span class="muted">{esc(h.get("type",""))} / {esc(hid)}</span></td>'
            f'<td style="text-align:right"><b>{imp}</b></td>'
            f'<td style="text-align:right">{eng}</td>'
            f'<td style="text-align:right">{cnt}</td>'
            f'<td>{"稼働" if active else "停止中"}</td>'
            f'<td><form method="post" action="/a/{esc(acc)}/pdca" style="margin:0">'
            f'<input type="hidden" name="action" value="toggle">'
            f'<input type="hidden" name="id" value="{esc(hid)}">'
            f'<button class="{btn_cls}" type="submit">{btn_label}</button></form></td>'
            f'<td><a class="btn sec" href="/a/{esc(acc)}/templates">編集</a></td></tr>'
        )

    phase_label = {"explore": "均等（探索）", "focus": "勝ち3つに集中", "commit": "1つに集中"}
    flash_html = f'<div class="flash">{esc(flash)}</div>' if flash else ""
    measured_total = sum(s["count"] for s in stats.values())
    body = f"""{flash_html}
<p class="muted"><a href="/a/{esc(acc)}">← {esc(acc)}</a> ・
<a href="/a/{esc(acc)}/analytics">詳しい分析</a></p>
<h2>PDCA運用 <span class="tag">現在: {esc(phase_label.get(phase, phase))}</span></h2>
<p class="muted">分析(Check)を見て、勝ちネタに集中・負けネタを停止(Act)します。計測済み {measured_total}件。</p>

<div class="card"><h3>配信モード（学習フェーズ）</h3>
<div class="muted">均等＝全ネタを試してデータ集め。集中＝閲覧数トップ3のネタだけ出す。</div>
<form method="post" action="/a/{esc(acc)}/pdca" class="row" style="margin-top:8px">
<input type="hidden" name="action" value="phase">
<button type="submit" name="value" value="explore" class="{'sec' if phase!='explore' else ''}">均等（探索）に戻す</button>
<button type="submit" name="value" value="focus" class="{'sec' if phase!='focus' else ''}">勝ち3つに集中する</button>
</form></div>

<div class="card"><h3>引用リソースの比率</h3>
<div class="muted">単発の引用リソース投稿と連投の混ぜ具合（0=連投のみ, 1=引用のみ）。現在 {ratio}。</div>
<form method="post" action="/a/{esc(acc)}/pdca" class="row" style="margin-top:8px">
<input type="hidden" name="action" value="ratio">
<input type="number" name="value" min="0" max="1" step="0.1" value="{ratio}"
 style="width:90px;padding:8px;border:1px solid #ccc;border-radius:7px">
<button type="submit">保存</button></form></div>

<h2>ネタ別の成績（閲覧数順）</h2>
<div class="card"><table style="width:100%;border-collapse:collapse;font-size:13px">
<tr class="muted"><th style="text-align:left">ネタ</th><th style="text-align:right">平均閲覧</th>
<th style="text-align:right">エンゲ率</th><th style="text-align:right">本数</th>
<th>状態</th><th>操作</th><th>本文</th></tr>
{''.join(rows)}</table></div>
<p class="muted">「止める」を押したネタは次回以降の生成から除外されます（hypotheses.jsonのstatusを更新）。
勝ち負けはデータが溜まるほど正確になります。</p>"""
    return page(f"{acc} PDCA", body)


def pdca_toggle_status(acc: str, hid: str) -> str:
    data = ST.read_json(acc, "hypotheses.json", {"hypotheses": []})
    name = hid
    for h in data.get("hypotheses", []):
        if h.get("id") == hid:
            active = h.get("status", "active") == "active"
            h["status"] = "paused" if active else "active"
            name = h.get("name", hid)
            new = h["status"]
            break
    else:
        return "対象のネタが見つかりません"
    ST.write(acc, "hypotheses.json", json.dumps(data, ensure_ascii=False, indent=2),
             f"pdca: {hid} を {new} に")
    return f"「{name}」を{'停止' if new == 'paused' else '再開'}しました"


def pdca_set_phase(acc: str, value: str) -> str:
    exp = ST.read_json(acc, "experiments.json", {
        "hypothesis_post_counts": {}, "cta_post_counts": {}, "total_posts": 0,
        "current_phase": "explore", "week_number": 1, "last_updated": None})
    if value not in ("explore", "focus"):
        return "不正なフェーズです"
    exp["current_phase"] = value
    if value == "focus":
        stats = _hypothesis_stats(acc)
        top = sorted(stats.items(), key=lambda kv: kv[1]["avg_imp"], reverse=True)[:3]
        exp["top_hypotheses"] = [hid for hid, _ in top]
    ST.write(acc, "experiments.json", json.dumps(exp, ensure_ascii=False, indent=2),
             f"pdca: フェーズを {value} に")
    if value == "focus":
        return "勝ち3つに集中モードにしました（閲覧数トップ3のみ配信）"
    return "均等（探索）モードに戻しました"


def pdca_set_ratio(acc: str, value: str) -> str:
    try:
        r = max(0.0, min(1.0, float(value)))
    except Exception:
        return "数値が不正です（0〜1）"
    persona = ST.read_json(acc, "persona.json", {})
    persona.setdefault("posting", {})["source_post_ratio"] = r
    ST.write(acc, "persona.json", json.dumps(persona, ensure_ascii=False, indent=2),
             f"pdca: 引用リソース比率を {r} に")
    return f"引用リソース比率を {r} にしました"


# ─── 保存処理（ST 経由で local/GitHub どちらにも対応）──────────


def split_posts(text: str) -> list[str]:
    out, cur = [], []
    for line in text.replace("\r\n", "\n").split("\n"):
        if line.strip() == "---":
            out.append("\n".join(cur).strip())
            cur = []
        else:
            cur.append(line)
    if cur:
        out.append("\n".join(cur).strip())
    return [p for p in out if p]


def save_templates(acc: str, form: dict) -> str:
    data = {}
    for key, val in form.items():
        if key.startswith("tmpl__"):
            data[key[len("tmpl__"):]] = split_posts(val)
    content = json.dumps(data, ensure_ascii=False, indent=2)
    return ST.write(acc, "thread_templates.json", content,
                    f"admin: update thread templates ({acc})")


def save_edit(acc: str, fname: str, content: str) -> str:
    if fname not in EDITABLE_NAMES:
        raise ValueError("not editable")
    kind = next((k for f, _, k in EDITABLE_FILES if f == fname), "text")
    if kind == "json":
        try:
            json.loads(content)
        except Exception as e:
            return f"❌ JSONエラーのため保存しませんでした: {e}"
    return ST.write(acc, fname, content, f"admin: edit {fname} ({acc})")


def save_draft(acc: str, occasion: str, posts: list[str]) -> str:
    data = ST.read_json(acc, "drafts.json", {"drafts": []})
    data.setdefault("drafts", [])
    data["drafts"].append({
        "id": str(int(time.time() * 1000)),
        "occasion": occasion,
        "posts": posts,
        "status": "draft",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    })
    return ST.write(acc, "drafts.json", json.dumps(data, ensure_ascii=False, indent=2),
                    f"admin: add draft ({acc})")


def update_draft(acc: str, did: str, posts: list[str]) -> str:
    data = ST.read_json(acc, "drafts.json", {"drafts": []})
    for dr in data.get("drafts", []):
        if dr.get("id") == did:
            dr["posts"] = posts
            dr["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            break
    return ST.write(acc, "drafts.json", json.dumps(data, ensure_ascii=False, indent=2),
                    f"admin: update draft ({acc})")


def delete_draft(acc: str, did: str) -> str:
    data = ST.read_json(acc, "drafts.json", {"drafts": []})
    data["drafts"] = [x for x in data.get("drafts", []) if x.get("id") != did]
    return ST.write(acc, "drafts.json", json.dumps(data, ensure_ascii=False, indent=2),
                    f"admin: delete draft ({acc})")


# ─── 共通ディスパッチャ（local http.server / Vercel WSGI 両用）───


def _q1(query: dict, key: str) -> str:
    v = query.get(key, [""])
    return v[0] if v else ""


def dispatch(method: str, path: str, query: dict, form: dict, auth_header):
    """Returns (status:int, headers:list[(k,v)], body:bytes)."""
    if not check_basic_auth(auth_header):
        return (401,
                [("WWW-Authenticate", 'Basic realm="admin"'),
                 ("Content-Type", "text/html; charset=utf-8")],
                "<h1>401</h1>認証が必要です".encode("utf-8"))

    html_headers = [("Content-Type", "text/html; charset=utf-8")]
    parts = [p for p in path.split("/") if p]
    try:
        if method == "GET":
            flash = _q1(query, "m")
            if not parts:
                return (200, html_headers, render_dashboard(flash))
            if parts[0] == "a" and len(parts) >= 2:
                acc = parts[1]
                sub = parts[2] if len(parts) > 2 else ""
                if sub == "":
                    return (200, html_headers, render_account(acc, flash))
                if sub == "templates":
                    return (200, html_headers, render_templates(acc, flash))
                if sub == "edit":
                    return (200, html_headers, render_edit(acc, _q1(query, "f"), flash))
                if sub == "preview":
                    return (200, html_headers, render_preview(acc, flash))
                if sub == "drafts":
                    return (200, html_headers, render_drafts(acc, flash))
                if sub == "analytics":
                    return (200, html_headers, render_analytics(
                        acc, flash, q=_q1(query, "q"), sort=_q1(query, "sort") or "imp"))
                if sub == "pdca":
                    return (200, html_headers, render_pdca(acc, flash))
            return (404, html_headers, page("404", "<p>Not found</p>"))

        if method == "POST" and parts and parts[0] == "a" and len(parts) >= 3:
            acc, sub = parts[1], parts[2]
            if sub == "templates":
                msg = save_templates(acc, form)
                return _redirect(f"/a/{acc}/templates?m={urllib.parse.quote(msg)}")
            if sub == "edit":
                msg = save_edit(acc, form.get("f", ""), form.get("content", ""))
                return _redirect(f"/a/{acc}/edit?f={urllib.parse.quote(form.get('f',''))}"
                                 f"&m={urllib.parse.quote(msg)}")
            if sub == "preview":
                if form.get("action") == "save_draft":
                    payload = json.loads(form.get("payload", "{}"))
                    msg = save_draft(acc, payload.get("occasion", ""), payload.get("posts", []))
                    return _redirect(f"/a/{acc}/drafts?m={urllib.parse.quote(msg)}")
                return _redirect(f"/a/{acc}/preview")
            if sub == "drafts":
                action = form.get("action")
                if action == "update":
                    msg = update_draft(acc, form.get("id", ""), split_posts(form.get("body", "")))
                elif action == "delete":
                    msg = delete_draft(acc, form.get("id", ""))
                else:
                    msg = ""
                return _redirect(f"/a/{acc}/drafts?m={urllib.parse.quote(msg)}")
            if sub == "pdca":
                action = form.get("action")
                if action == "toggle":
                    msg = pdca_toggle_status(acc, form.get("id", ""))
                elif action == "phase":
                    msg = pdca_set_phase(acc, form.get("value", ""))
                elif action == "ratio":
                    msg = pdca_set_ratio(acc, form.get("value", ""))
                else:
                    msg = ""
                return _redirect(f"/a/{acc}/pdca?m={urllib.parse.quote(msg)}")
        return (404, html_headers, page("404", "<p>Not found</p>"))
    except Exception as e:
        return (500, html_headers, page("エラー", f"<p>エラー: {esc(e)}</p>"))


def _redirect(location: str):
    return (303, [("Location", location), ("Content-Type", "text/html; charset=utf-8")], b"")


# ─── ローカル http.server ──────────────────────────────────


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _run(self, method: str):
        u = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(u.query)
        form = {}
        if method == "POST":
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length).decode("utf-8") if length else ""
            form = {k: v[0] for k, v in urllib.parse.parse_qs(raw, keep_blank_values=True).items()}
        status, headers, body = dispatch(
            method, u.path, query, form, self.headers.get("Authorization"))
        self.send_response(status)
        for k, v in headers:
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        self._run("GET")

    def do_POST(self):
        self._run("POST")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f"投稿管理ページ: http://{args.host}:{args.port}  (保存先: {ST.backend})")
    print("停止するには Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n停止しました")


if __name__ == "__main__":
    main()
