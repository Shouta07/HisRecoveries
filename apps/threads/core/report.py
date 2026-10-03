"""週次の集計 — どの型・どのテーマが効いたか。

投稿を自動で出すところまでは動く。足りないのは、結果が次の投稿に返る経路
（GROWTH.md §5）。ここがその集計。

── 見る順番を固定する ──────────────────────────
リプライが多くても買われない型がある。逆に、静かでもサイトまで
連れてくる型がある。だから順番を決めておく。

  1. 表示数      読まれているか
  2. リプライ率  会話になっているか（＝次も表示されるか）
  3. 着地率      リンクが押されているか
  4. 購入率      金を払う人の話だったか

3と4は events テーブル（Vercel側）にあり、ここからは見えない。
utm_content に入れた追跡コードで後から突き合わせる。
**母数が溜まるまで、3と4で止める判断はしない**（GROWTH.md §5）。

── 平均ではなく中央値 ──────────────────────────
1本バズると平均が持ち上がって、他が全部「平均以下」になる。
中央値なら、たまたま当たった1本に引きずられない。
"""

from __future__ import annotations

import logging
import statistics
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

from core.config import safe_load_json

logger = logging.getLogger(__name__)

# これ未満の本数しかない束は、数字を出しても意味が無い。
# hypotheses.json の min_posts_to_evaluate と同じ考え方。
MIN_POSTS_TO_JUDGE = 5


def _posts_in_window(account_dir: Path, days: int) -> list[dict]:
    """数値が取れている投稿だけを、期間で絞って返す。

    数値が未取得のもの（投稿から24時間たっていない）は外す。
    入れると、新しい投稿ほど数字が低く出て、新しい型が不当に負ける。
    """
    history = safe_load_json(account_dir / "history.json", {"posts": []})
    cutoff = datetime.now() - timedelta(days=days)
    out = []
    for p in history.get("posts", []):
        if (p.get("metrics") or {}).get("impressions") is None:
            continue
        try:
            if datetime.fromisoformat(p.get("posted_at", "")) < cutoff:
                continue
        except (ValueError, TypeError):
            continue
        out.append(p)
    return out


def _summarize(posts: list[dict]) -> dict:
    """1つの束（型やテーマ）の数字をまとめる。"""
    views = [(p["metrics"].get("impressions") or 0) for p in posts]
    replies = [(p["metrics"].get("replies") or 0) for p in posts]
    pairs = [
        (r / v) for v, r in zip(views, replies) if v > 0
    ]
    return {
        "posts": len(posts),
        "views_median": int(statistics.median(views)) if views else 0,
        "views_total": sum(views),
        "replies_total": sum(replies),
        # 返信率は投稿ごとに出してから中央値を取る。
        # 合計÷合計にすると、表示数の大きい1本の率が全体の率になる。
        "reply_rate_median": round(statistics.median(pairs) * 100, 2) if pairs else 0.0,
        "judgeable": len(posts) >= MIN_POSTS_TO_JUDGE,
    }


def _group(posts: list[dict], key: str) -> dict[str, dict]:
    buckets: dict[str, list] = defaultdict(list)
    for p in posts:
        buckets[p.get(key) or "(不明)"].append(p)
    return {k: _summarize(v) for k, v in buckets.items()}


def build(account_dir: Path, days: int = 7) -> dict:
    """集計を組み立てる。画面にも出せるよう、dict で返す。"""
    posts = _posts_in_window(account_dir, days)
    acct = safe_load_json(account_dir / "account_metrics.json", {"days": {}})
    days_sorted = sorted(acct.get("days", {}).items())

    return {
        "generated_at": datetime.now().isoformat(),
        "days": days,
        "posts_measured": len(posts),
        "by_form": _group(posts, "post_form"),
        "by_category": _group(posts, "post_category"),
        "by_theme": _group(posts, "hypothesis_id"),
        "account": {
            "first": days_sorted[0] if days_sorted else None,
            "last": days_sorted[-1] if days_sorted else None,
        },
        # 追跡コード → 投稿。events 側の utm_content と突き合わせるための対応表。
        # これを出しておかないと、サイト側の数字を投稿に戻せない。
        "tracking": {
            p["tracking_code"]: {
                "form": p.get("post_form"),
                "theme": p.get("hypothesis_id"),
                "posted_at": p.get("posted_at"),
                "views": (p.get("metrics") or {}).get("impressions"),
            }
            for p in posts
            if p.get("tracking_code")
        },
    }


def _table(title: str, rows: dict[str, dict], label_of=None) -> list[str]:
    if not rows:
        return []
    out = [f"### {title}", "", "| | 本数 | 表示数(中央値) | 返信率(中央値) |", "|---|---:|---:|---:|"]
    for key, v in sorted(rows.items(), key=lambda kv: -kv[1]["views_median"]):
        name = label_of(key) if label_of else key
        mark = "" if v["judgeable"] else f"（{MIN_POSTS_TO_JUDGE}本未満）"
        out.append(
            f"| {name}{mark} | {v['posts']} | {v['views_median']:,} | {v['reply_rate_median']}% |"
        )
    out.append("")
    return out


def render(account_dir: Path, data: dict) -> str:
    """人が読む形にする。"""
    hyp = safe_load_json(account_dir / "hypotheses.json", {"hypotheses": []})
    theme_name = {h["id"]: h.get("name", h["id"]) for h in hyp.get("hypotheses", [])}
    forms = safe_load_json(account_dir / "post_forms.json", {})
    form_name = {
        k: v.get("label", k) for k, v in (forms.get("forms") or {}).items()
    }

    lines = [
        f"# 週次 — 直近{data['days']}日",
        "",
        f"数値の取れた投稿: {data['posts_measured']}本",
        "",
    ]

    first, last = data["account"]["first"], data["account"]["last"]
    if first and last and first[0] != last[0]:
        f_row, l_row = first[1], last[1]
        lines += ["### アカウント全体", "", "| | はじめ | おわり | 差 |", "|---|---:|---:|---:|"]
        for key, label in (("followers_count", "フォロワー"), ("views", "表示数")):
            a, b = f_row.get(key), l_row.get(key)
            if isinstance(a, (int, float)) and isinstance(b, (int, float)):
                lines.append(f"| {label} | {a:,} | {b:,} | {b - a:+,} |")
        for key in ("profile_views", "clicks", "link_clicks"):
            if key in l_row:
                lines.append(f"| {key} | {f_row.get(key, '—')} | {l_row[key]} | |")
        lines.append("")

    lines += _table("型べつ", data["by_form"], form_name.get)
    lines += _table("カテゴリべつ（A/B/C/D）", data["by_category"])
    lines += _table("テーマべつ", data["by_theme"], theme_name.get)

    if data["posts_measured"] < MIN_POSTS_TO_JUDGE:
        lines += [
            "> まだ判断できる本数ではない。"
            f"数値の取れた投稿が{MIN_POSTS_TO_JUDGE}本に届くまでは、数字を見るだけにする。",
            "",
        ]
    else:
        lines += [
            "### 次にやること",
            "",
            "1. 表示数と返信率で、効いている型とテーマを見る",
            "2. 負けているテーマを `hypotheses.json` で `paused` にする",
            f"3. サイト側（着地・購入）は、下の対応表の `utm_content` で突き合わせる",
            "",
            "> 着地率・購入率で型やテーマを止めるのは、母数が溜まってから。"
            "少ない本数で切ると、効くものを先に捨てることになる。",
            "",
        ]

    if data["tracking"]:
        lines += [
            "### utm_content の対応表",
            "",
            "| コード | 型 | テーマ | 表示数 |",
            "|---|---|---|---:|",
        ]
        for code, v in sorted(
            data["tracking"].items(), key=lambda kv: -(kv[1]["views"] or 0),
        ):
            lines.append(
                f"| `{code}` | {form_name.get(v['form'], v['form'])} "
                f"| {theme_name.get(v['theme'], v['theme'])} | {v['views'] or 0:,} |"
            )
        lines.append("")

    return "\n".join(lines)


def run(account_dir: Path, days: int = 7, out: Path | None = None) -> str:
    data = build(account_dir, days=days)
    text = render(account_dir, data)
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        logger.info("週次を書き出しました: %s", out)
    return text
