"""
Sheets - Google Sheets連携モジュール
トレンド投稿の記録、下書きストック、承認フローを管理する。

シート構成:
  1. trends    — 収集したトレンド投稿（URL・いいね数・テキスト・収集日）
  2. drafts    — AI生成した下書き（テキスト・生成日・承認ステータス）
  3. posted    — 投稿済み（テキスト・投稿日・thread_id）
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

# gspread は遅延インポート（未インストール環境でもエラーにならない）
_gc = None
_spreadsheet = None


def _get_client():
    """Google Sheets クライアントを取得する（遅延初期化）"""
    global _gc
    if _gc is not None:
        return _gc

    try:
        import gspread
    except ImportError:
        logger.warning("gspread not installed. Run: pip install gspread")
        return None

    creds_path = os.getenv("GOOGLE_SHEETS_CREDENTIALS", "")
    creds_json = os.getenv("GOOGLE_SHEETS_CREDENTIALS_JSON", "")

    if creds_json:
        import json as _json
        creds_dict = _json.loads(creds_json)
        _gc = gspread.service_account_from_dict(creds_dict)
    elif creds_path and Path(creds_path).exists():
        _gc = gspread.service_account(filename=creds_path)
    else:
        logger.warning("Google Sheets credentials not configured. "
                       "Set GOOGLE_SHEETS_CREDENTIALS or GOOGLE_SHEETS_CREDENTIALS_JSON")
        return None

    return _gc


def _get_spreadsheet():
    """スプレッドシートを取得する"""
    global _spreadsheet
    if _spreadsheet is not None:
        return _spreadsheet

    gc = _get_client()
    if not gc:
        return None

    sheet_id = os.getenv("GOOGLE_SHEETS_ID", "")
    if not sheet_id:
        logger.warning("GOOGLE_SHEETS_ID not set")
        return None

    try:
        _spreadsheet = gc.open_by_key(sheet_id)
        return _spreadsheet
    except Exception as e:
        logger.error("Failed to open spreadsheet: %s", e)
        return None


def _get_or_create_sheet(name: str, headers: list[str]):
    """シートを取得。なければ作成してヘッダーを書く"""
    ss = _get_spreadsheet()
    if not ss:
        return None

    try:
        sheet = ss.worksheet(name)
    except Exception:
        sheet = ss.add_worksheet(title=name, rows=1000, cols=len(headers))
        sheet.append_row(headers)

    return sheet


# ──────────────────────────────────────────────
# 1. トレンド投稿の記録
# ──────────────────────────────────────────────

TREND_HEADERS = [
    "収集日", "キーワード", "テキスト", "いいね数",
    "リプ数", "ソースタイプ", "URL",
]


def record_trend(post: dict, keyword: str = "") -> bool:
    """トレンド投稿をスプレッドシートに記録する"""
    sheet = _get_or_create_sheet("trends", TREND_HEADERS)
    if not sheet:
        return False

    try:
        row = [
            datetime.now().strftime("%Y-%m-%d %H:%M"),
            keyword,
            post.get("text", "")[:500],
            post.get("likes", 0),
            post.get("replies", 0),
            post.get("source_type", ""),
            post.get("url", ""),
        ]
        sheet.append_row(row)
        return True
    except Exception as e:
        logger.error("Failed to record trend: %s", e)
        return False


def record_trends_batch(posts: list[dict]) -> int:
    """複数のトレンド投稿を一括記録する"""
    sheet = _get_or_create_sheet("trends", TREND_HEADERS)
    if not sheet:
        return 0

    rows = []
    for post in posts:
        rows.append([
            datetime.now().strftime("%Y-%m-%d %H:%M"),
            post.get("keyword", ""),
            post.get("text", "")[:500],
            post.get("likes", 0),
            post.get("replies", 0),
            post.get("source_type", ""),
            post.get("url", ""),
        ])

    if not rows:
        return 0

    try:
        sheet.append_rows(rows)
        logger.info("Recorded %d trends to spreadsheet", len(rows))
        return len(rows)
    except Exception as e:
        logger.error("Failed to record trends batch: %s", e)
        return 0


# ──────────────────────────────────────────────
# 2. 下書きストック
# ──────────────────────────────────────────────

DRAFT_HEADERS = [
    "生成日", "テキスト", "パターン", "バズスコア",
    "参照元", "承認", "投稿日", "thread_id",
]


def stock_draft(post_result: dict, pattern: str = "") -> bool:
    """生成した投稿を下書きとしてスプレッドシートにストックする"""
    sheet = _get_or_create_sheet("drafts", DRAFT_HEADERS)
    if not sheet:
        return False

    try:
        row = [
            datetime.now().strftime("%Y-%m-%d %H:%M"),
            post_result.get("text", ""),
            pattern,
            post_result.get("buzz_score", 0),
            post_result.get("source_type", ""),
            "",  # 承認: 空欄 = 未承認
            "",  # 投稿日: 投稿後に更新
            "",  # thread_id: 投稿後に更新
        ]
        sheet.append_row(row)
        logger.info("Draft stocked to spreadsheet")
        return True
    except Exception as e:
        logger.error("Failed to stock draft: %s", e)
        return False


def get_approved_drafts() -> list[dict]:
    """承認済み（「承認」列が「OK」）かつ未投稿の下書きを取得する"""
    sheet = _get_or_create_sheet("drafts", DRAFT_HEADERS)
    if not sheet:
        return []

    try:
        records = sheet.get_all_records()
        approved = []
        for i, row in enumerate(records):
            if str(row.get("承認", "")).strip().upper() == "OK" and not row.get("thread_id"):
                approved.append({
                    "text": row.get("テキスト", ""),
                    "row_index": i + 2,  # ヘッダー行 + 0-indexed → 1-indexed
                    "pattern": row.get("パターン", ""),
                    "buzz_score": row.get("バズスコア", 0),
                })
        return approved
    except Exception as e:
        logger.error("Failed to get approved drafts: %s", e)
        return []


def mark_as_posted(row_index: int, thread_id: str) -> bool:
    """下書きを投稿済みに更新する"""
    sheet = _get_or_create_sheet("drafts", DRAFT_HEADERS)
    if not sheet:
        return False

    try:
        # 投稿日（G列=7）と thread_id（H列=8）を更新
        sheet.update_cell(row_index, 7, datetime.now().strftime("%Y-%m-%d %H:%M"))
        sheet.update_cell(row_index, 8, thread_id)
        logger.info("Marked row %d as posted (thread_id=%s)", row_index, thread_id)
        return True
    except Exception as e:
        logger.error("Failed to mark as posted: %s", e)
        return False


# ──────────────────────────────────────────────
# 3. 投稿済み記録
# ──────────────────────────────────────────────

POSTED_HEADERS = [
    "投稿日", "テキスト", "thread_id", "いいね数",
    "保存数", "インプレッション", "保存率",
]


def record_posted(post_data: dict) -> bool:
    """投稿済みの投稿をスプレッドシートに記録する"""
    sheet = _get_or_create_sheet("posted", POSTED_HEADERS)
    if not sheet:
        return False

    try:
        row = [
            post_data.get("posted_at", datetime.now().strftime("%Y-%m-%d %H:%M")),
            post_data.get("text", "")[:500],
            post_data.get("thread_id", ""),
            "",  # いいね数: あとで分析時に更新
            "",  # 保存数: あとで分析時に更新
            "",  # インプレッション: あとで分析時に更新
            "",  # 保存率: あとで分析時に更新
        ]
        sheet.append_row(row)
        return True
    except Exception as e:
        logger.error("Failed to record posted: %s", e)
        return False


# ──────────────────────────────────────────────
# 4. ユーティリティ
# ──────────────────────────────────────────────

def is_sheets_configured() -> bool:
    """Google Sheets連携が設定されているかチェック"""
    return bool(
        os.getenv("GOOGLE_SHEETS_ID")
        and (os.getenv("GOOGLE_SHEETS_CREDENTIALS") or os.getenv("GOOGLE_SHEETS_CREDENTIALS_JSON"))
    )
