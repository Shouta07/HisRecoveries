"""Sheets同期 — スプレッドシートで投稿内容を管理する。

タブ構成（tools/export_sheet.py と一致）:
  連投テンプレ  : ネタID / 種別 / 順番 / 本文 / 備考
  引用リソース  : リソースID / 分類 / 順番 / 本文 / リンク(誘導のみ)
  ネタ一覧      : ネタID / 種別 / 名前 / 状態(active/paused)
  設定          : 項目 / 値 / 説明

push_content: 現在のJSON → シート（初期化・現状反映）
pull_content: シート → JSON（編集を投稿に反映。post前に実行）

行↔構造の変換は純粋関数（gspread不要・テスト可能）。I/Oはgspreadラッパ。
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

TAB_TEMPLATES = "連投テンプレ"
TAB_SOURCES = "引用リソース"
TAB_HYPS = "ネタ一覧"
TAB_SETTINGS = "設定"

H_TEMPLATES = ["ネタID", "種別", "順番", "本文", "備考"]
H_SOURCES = ["リソースID", "分類", "順番", "本文", "リンク(誘導のみ)"]
H_HYPS = ["ネタID", "種別", "名前", "状態(active/paused)"]
H_SETTINGS = ["項目", "値", "説明"]

_CAT_LABEL = {"empathy": "共感", "insight": "気づき", "question": "問題提起",
              "fact": "実績", "core": "誘導(core)"}
_LABEL_CAT = {v: k for k, v in _CAT_LABEL.items()}
_SRC_ORDER = ["empathy", "insight", "question", "fact", "core"]


# ─── 純粋変換関数（gspread不要）─────────────────────────────


def templates_to_rows(tmpl: dict, slug_type: dict) -> list[list]:
    rows = []
    for slug, posts in tmpl.items():
        for i, body in enumerate(posts, 1):
            note = "CTA(リンクはここ)" if "{link}" in body else ""
            rows.append([slug, slug_type.get(slug, ""), i, body, note])
    return rows


def rows_to_templates(rows: list[list]) -> dict:
    """[ネタID,種別,順番,本文,...] の行群 → {slug: [本文...]}（順番でソート）"""
    grouped: dict = {}
    for r in rows:
        if len(r) < 4 or not str(r[0]).strip():
            continue
        slug = str(r[0]).strip()
        try:
            order = int(r[2])
        except (ValueError, TypeError):
            order = len(grouped.get(slug, [])) + 1
        body = str(r[3])
        if not body.strip():
            continue
        grouped.setdefault(slug, []).append((order, body))
    return {slug: [b for _, b in sorted(items)] for slug, items in grouped.items()}


def sources_to_rows(csrc: dict) -> list[list]:
    rows = []
    for s in csrc.get("sources", []):
        sid = s.get("id", "")
        url = s.get("url", "")
        mats = s.get("materials", {})
        for cat in _SRC_ORDER:
            items = mats.get(cat)
            if cat == "core":
                if items:
                    rows.append([sid, _CAT_LABEL[cat], 1, items, url])
            else:
                for i, body in enumerate(items or [], 1):
                    rows.append([sid, _CAT_LABEL[cat], i, body, ""])
    return rows


def apply_source_rows(csrc: dict, rows: list[list]) -> dict:
    """行の本文編集を既存 content_sources に反映（構造は保持）。

    (リソースID, 分類, 順番) で既存スロットを特定し、本文だけ差し替える。
    reader/entry_line/min_action 等のメタ情報は壊さない。
    """
    by_id = {s.get("id"): s for s in csrc.get("sources", [])}
    for r in rows:
        if len(r) < 4:
            continue
        sid, label, order, body = str(r[0]).strip(), str(r[1]).strip(), r[2], str(r[3])
        src = by_id.get(sid)
        if not src or label not in _LABEL_CAT or not body.strip():
            continue
        cat = _LABEL_CAT[label]
        mats = src.setdefault("materials", {})
        if cat == "core":
            mats["core"] = body
        else:
            lst = mats.setdefault(cat, [])
            try:
                idx = int(order) - 1
            except (ValueError, TypeError):
                continue
            if 0 <= idx < len(lst):
                lst[idx] = body
            elif idx == len(lst):
                lst.append(body)
    return csrc


def hyps_to_rows(hyps: list[dict]) -> list[list]:
    return [[h["id"], h.get("type", ""), h.get("name", ""), h.get("status", "active")]
            for h in hyps]


def apply_hyp_status(hyps: list[dict], rows: list[list]) -> list[dict]:
    """行の状態列を hypotheses に反映（active/paused）。"""
    status_by_id = {}
    for r in rows:
        if len(r) < 4 or not str(r[0]).strip():
            continue
        st = str(r[3]).strip().lower()
        status_by_id[str(r[0]).strip()] = "paused" if st == "paused" else "active"
    for h in hyps:
        if h.get("id") in status_by_id:
            h["status"] = status_by_id[h["id"]]
    return hyps


def settings_to_rows(posting: dict) -> list[list]:
    slot = posting.get("slot_type_map", {})
    return [
        ["投稿時刻", " / ".join(posting.get("time_slots", [])), "1日の配信時刻(JST)"],
        ["1日の本数", posting.get("frequency_per_day", ""), ""],
        ["引用リソース比率", posting.get("source_post_ratio", ""), "0=連投のみ 1=引用のみ"],
        ["朝の対象層", ", ".join(slot.get("morning", [])), "朝に出すtype"],
        ["夜の対象層", ", ".join(slot.get("night", [])), "夜に出すtype"],
    ]


def apply_settings_rows(posting: dict, rows: list[list]) -> dict:
    kv = {str(r[0]).strip(): str(r[1]).strip() for r in rows if len(r) >= 2 and str(r[0]).strip()}
    if "投稿時刻" in kv:
        slots = [s.strip() for s in kv["投稿時刻"].replace("/", ",").split(",") if s.strip()]
        if slots:
            posting["time_slots"] = slots
    if "引用リソース比率" in kv:
        try:
            posting["source_post_ratio"] = max(0.0, min(1.0, float(kv["引用リソース比率"])))
        except ValueError:
            pass
    slot = posting.setdefault("slot_type_map", {})
    if "朝の対象層" in kv:
        slot["morning"] = [t.strip() for t in kv["朝の対象層"].split(",") if t.strip()]
    if "夜の対象層" in kv:
        slot["night"] = [t.strip() for t in kv["夜の対象層"].split(",") if t.strip()]
    return posting


# ─── gspread I/O ラッパ ─────────────────────────────────────


def _write_tab(name: str, headers: list[str], rows: list[list]) -> bool:
    from core.sheets import _get_spreadsheet
    ss = _get_spreadsheet()
    if not ss:
        return False
    try:
        try:
            sheet = ss.worksheet(name)
            sheet.clear()
        except Exception:
            sheet = ss.add_worksheet(title=name, rows=max(100, len(rows) + 10),
                                     cols=len(headers))
        sheet.update([headers] + [[str(c) for c in r] for r in rows])
        return True
    except Exception as e:
        logger.error("Failed to write tab %s: %s", name, e)
        return False


def _read_tab(name: str) -> list[list]:
    from core.sheets import _get_spreadsheet
    ss = _get_spreadsheet()
    if not ss:
        return []
    try:
        values = ss.worksheet(name).get_all_values()
        return values[1:] if values else []   # ヘッダー行を除く
    except Exception as e:
        logger.warning("Failed to read tab %s: %s", name, e)
        return []


def push_content(account_dir: Path) -> bool:
    """現在のJSON内容を全タブへ書き出す（初期化・現状反映）。"""
    tmpl = _load(account_dir, "thread_templates.json", {})
    hyps = _load(account_dir, "hypotheses.json", {"hypotheses": []}).get("hypotheses", [])
    csrc = _load(account_dir, "content_sources.json", {"sources": []})
    persona = _load(account_dir, "persona.json", {})
    slug_type = {h.get("slug", h["id"]): h.get("type", "") for h in hyps}

    ok = True
    ok &= _write_tab(TAB_TEMPLATES, H_TEMPLATES, templates_to_rows(tmpl, slug_type))
    ok &= _write_tab(TAB_SOURCES, H_SOURCES, sources_to_rows(csrc))
    ok &= _write_tab(TAB_HYPS, H_HYPS, hyps_to_rows(hyps))
    ok &= _write_tab(TAB_SETTINGS, H_SETTINGS, settings_to_rows(persona.get("posting", {})))
    logger.info("push_content: %s", "OK" if ok else "partial")
    return ok


def pull_content(account_dir: Path) -> bool:
    """シートの編集をJSONへ反映する（post前に実行）。"""
    changed = False

    rows = _read_tab(TAB_TEMPLATES)
    if rows:
        tmpl = rows_to_templates(rows)
        if tmpl:
            _save(account_dir, "thread_templates.json", tmpl)
            changed = True

    rows = _read_tab(TAB_SOURCES)
    if rows:
        csrc = _load(account_dir, "content_sources.json", {"sources": []})
        _save(account_dir, "content_sources.json", apply_source_rows(csrc, rows))
        changed = True

    rows = _read_tab(TAB_HYPS)
    if rows:
        data = _load(account_dir, "hypotheses.json", {"hypotheses": []})
        data["hypotheses"] = apply_hyp_status(data.get("hypotheses", []), rows)
        _save(account_dir, "hypotheses.json", data)
        changed = True

    rows = _read_tab(TAB_SETTINGS)
    if rows:
        persona = _load(account_dir, "persona.json", {})
        persona["posting"] = apply_settings_rows(persona.get("posting", {}), rows)
        _save(account_dir, "persona.json", persona)
        changed = True

    logger.info("pull_content: %s", "更新あり" if changed else "変更なし")
    return changed


def _load(account_dir: Path, name: str, default):
    p = account_dir / name
    if not p.exists():
        return default
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default


def _save(account_dir: Path, name: str, data) -> None:
    (account_dir / name).write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
