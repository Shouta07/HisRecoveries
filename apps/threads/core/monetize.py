"""
Monetize - マネタイズエージェント
CTA（Call to Action）挿入・アフィリエイトリンク管理・収益トラッキング。

マネタイズ戦略:
1. プロフィールリンク誘導型 → Threads投稿からプロフリンク(リンクまとめ)へ誘導
2. CTA挿入型 → 投稿末尾にCTAを自然に挿入
3. アフィリエイト連携型 → 商材に関連するネタで投稿 → CTA → LP
"""

import json
import logging
import random
from datetime import datetime
from pathlib import Path

from core.config import atomic_write_json, safe_load_json

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
REVENUE_FILE = DATA_DIR / "revenue.json"


def load_monetize_config(account_dir: Path) -> dict:
    """アカウントのマネタイズ設定を読み込む"""
    path = account_dir / "monetize.json"
    if not path.exists():
        return {"enabled": False, "cta_templates": [], "products": []}
    return json.loads(path.read_text())


def get_cta_rate(config: dict, follower_count: int = 0) -> float:
    """
    フォロワー数に応じたCTA挿入率を返す。
    cta_tier設定がある場合は段階的に調整。なければcta_insertion_rateを使用。
    """
    tiers = config.get("cta_tier")
    if tiers and follower_count > 0:
        for tier_name in ["growth", "mid", "mature"]:
            tier = tiers.get(tier_name, {})
            if follower_count <= tier.get("max_followers", 0):
                return tier.get("rate", 0.3)
    return config.get("cta_insertion_rate", 0.3)


def is_monetize_day(persona: dict) -> bool:
    """今日がCTA挿入日かどうかをweekly_scheduleから判定する。

    新設計: layer=L3の日のみCTAを挿入。
    旧設計: monetize=trueの日のみCTAを挿入。
    """
    schedule = persona.get("posting", {}).get("weekly_schedule", {})
    if not schedule:
        return True  # スケジュール未設定なら制限しない

    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    today = day_names[datetime.now().weekday()]
    day_config = schedule.get(today, {})

    # 新設計: L3レイヤーの日
    if day_config.get("layer") == "L3":
        return True
    # 旧設計との後方互換
    if day_config.get("monetize", False):
        return True
    return False


def is_warmup_day(persona: dict) -> bool:
    """今日がCTA挿入前日かどうかを判定する。"""
    schedule = persona.get("posting", {}).get("weekly_schedule", {})
    if not schedule:
        return False

    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    tomorrow_idx = (datetime.now().weekday() + 1) % 7
    tomorrow = day_names[tomorrow_idx]
    tomorrow_config = schedule.get(tomorrow, {})
    return tomorrow_config.get("layer") == "L3" or tomorrow_config.get("monetize", False)


def get_tomorrow_product(persona: dict, config: dict) -> dict | None:
    """明日のPR商材を取得する（布石投稿のテーマ選定用）。"""
    schedule = persona.get("posting", {}).get("weekly_schedule", {})
    if not schedule:
        return None

    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    tomorrow_idx = (datetime.now().weekday() + 1) % 7
    tomorrow = day_names[tomorrow_idx]
    tomorrow_config = schedule.get(tomorrow, {})

    # 偶数週/奇数週の商材を判定
    from datetime import date
    week_number = date.today().isocalendar()[1]
    is_even_week = week_number % 2 == 0

    product_id = None
    if is_even_week and "product_even_week" in tomorrow_config:
        product_id = tomorrow_config["product_even_week"]
    elif not is_even_week and "product_odd_week" in tomorrow_config:
        product_id = tomorrow_config["product_odd_week"]
    elif f"product_week{(week_number % 4) + 1}" in tomorrow_config:
        product_id = tomorrow_config[f"product_week{(week_number % 4) + 1}"]

    if not product_id:
        return None

    products = config.get("products", [])
    for p in products:
        if p.get("id") == product_id:
            return p
    return None


def select_cta(
    config: dict, post_text: str, follower_count: int = 0,
    persona: dict | None = None,
) -> str | None:
    """
    投稿内容に基づいて最適なCTAを選択する。
    マネタイズ無効化時（model=disabled）はCTAを一切挿入しない。
    """
    if not config.get("enabled", False):
        return None

    if config.get("model") == "disabled":
        return None

    # 曜日チェック: PR日以外はCTA挿入しない
    if persona and not is_monetize_day(persona):
        logger.debug("CTA skipped: not a monetize day")
        return None

    insertion_rate = get_cta_rate(config, follower_count)
    if random.random() > insertion_rate:
        logger.debug("CTA skipped (rate: %.0f%%)", insertion_rate * 100)
        return None

    templates = config.get("cta_templates", [])
    if not templates:
        return None

    # 重み付きランダム選択
    weights = [t.get("weight", 1) for t in templates]
    total = sum(weights)
    r = random.uniform(0, total)
    cumulative = 0
    for tpl in templates:
        cumulative += tpl.get("weight", 1)
        if r <= cumulative:
            return tpl["text"]

    return templates[-1]["text"]


def inject_cta(
    post_text: str, cta: str, max_chars: int = 500,
    require_pr_tag: bool = True,
) -> str:
    """投稿文にCTAを自然に挿入する。

    require_pr_tag: Trueならステマ規制対応で#PRを自動付与。
    自社無料ツール（LoveMane等）の紹介では#PR不要なのでFalseにする。
    """
    pr_tag = " #PR" if require_pr_tag else ""
    separator = "\n\n"
    combined = f"{post_text}{separator}{cta}{pr_tag}"

    # 文字数オーバーなら投稿本文を削る
    if len(combined) > max_chars:
        available = max_chars - len(separator) - len(cta) - len(pr_tag) - 1
        if available < 50:
            return post_text[:max_chars]
        post_text = post_text[:available].rstrip() + "…"
        combined = f"{post_text}{separator}{cta}{pr_tag}"

    return combined


def select_product_topic(config: dict) -> dict | None:
    """
    マネタイズ商材からネタを選択する。
    Writerのtopicとして使い、商材に関連した投稿を生成させる。
    """
    products = config.get("products", [])
    if not products:
        return None

    active = [p for p in products if p.get("active", True)]
    if not active:
        return None

    # 重み付き選択
    weights = [p.get("weight", 1) for p in active]
    total = sum(weights)
    r = random.uniform(0, total)
    cumulative = 0
    for product in active:
        cumulative += product.get("weight", 1)
        if r <= cumulative:
            return product

    return active[-1]


def record_post_with_cta(
    post_data: dict, cta_used: str | None, product: dict | None
) -> None:
    """CTA付き投稿を収益トラッキング用に記録"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    records = safe_load_json(REVENUE_FILE, [])

    record = {
        "timestamp": datetime.now().isoformat(),
        "thread_id": post_data.get("thread_id", ""),
        "text_preview": post_data.get("text", "")[:80],
        "cta_used": cta_used,
        "product_id": product.get("id") if product else None,
        "product_name": product.get("name") if product else None,
    }
    records.append(record)

    # 直近500件保持
    records = records[-500:]
    atomic_write_json(REVENUE_FILE, records)


def get_revenue_summary() -> dict:
    """収益トラッキングのサマリーを返す"""
    records = safe_load_json(REVENUE_FILE, [])
    if not records:
        return {
            "total_posts": 0,
            "posts_with_cta": 0,
            "cta_rate": 0,
            "product_breakdown": {},
        }
    total = len(records)
    with_cta = sum(1 for r in records if r.get("cta_used"))

    # 商材別集計
    product_counts: dict[str, int] = {}
    for r in records:
        pid = r.get("product_name") or "no_product"
        product_counts[pid] = product_counts.get(pid, 0) + 1

    return {
        "total_posts": total,
        "posts_with_cta": with_cta,
        "cta_rate": round(with_cta / total * 100, 1) if total else 0,
        "product_breakdown": product_counts,
    }
