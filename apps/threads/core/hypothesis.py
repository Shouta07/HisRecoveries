"""
Hypothesis Engine — 事業仮説探索システムの中核
投稿を作る前に「どの仮説を検証するか」を決める。

このシステムはコンテンツ自動化ツールではない。
事業仮説探索システムである。
"""

import json
import logging
import random
from datetime import datetime
from pathlib import Path

from core.config import safe_load_json, atomic_write_json

logger = logging.getLogger(__name__)


def load_hypotheses(account_dir: Path) -> dict:
    """仮説定義ファイルを読み込む"""
    path = account_dir / "hypotheses.json"
    if not path.exists():
        logger.warning("hypotheses.json not found in %s", account_dir)
        return {"hypotheses": [], "cta_variants": [], "discovery_questions": []}
    return json.loads(path.read_text())


def load_experiment_state(account_dir: Path) -> dict:
    """実験状態を読み込む"""
    path = account_dir / "experiments.json"
    return safe_load_json(path, {
        "hypothesis_post_counts": {},
        "cta_post_counts": {},
        "total_posts": 0,
        "current_phase": "explore",
        "week_number": 1,
        "last_updated": None,
    })


def save_experiment_state(account_dir: Path, state: dict) -> None:
    """実験状態を保存する"""
    path = account_dir / "experiments.json"
    state["last_updated"] = datetime.now().isoformat()
    atomic_write_json(path, state)


def select_hypothesis(account_dir: Path, allowed_types: list[str] | None = None) -> dict:
    """次に検証すべき仮説を選択する。

    Phase explore: 最も投稿数が少ない仮説を優先（均等配分）
    Phase focus: 上位3仮説のみから選択
    Phase commit: 最強仮説のみ

    allowed_types: 指定すると該当typeの仮説だけから選ぶ（時間帯×読者層の出し分け用）。
    該当activeが無ければ全activeへフォールバック。
    """
    config = load_hypotheses(account_dir)
    state = load_experiment_state(account_dir)
    hypotheses = config.get("hypotheses", [])
    phase = state.get("current_phase", "explore")

    active = [h for h in hypotheses if h.get("status") == "active"]
    if allowed_types:
        filtered = [h for h in active if h.get("type") in allowed_types]
        if filtered:
            active = filtered
        else:
            logger.warning(
                "No active hypotheses for types %s; falling back to all", allowed_types)
    if not active:
        logger.error("No active hypotheses found")
        return {}

    counts = state.get("hypothesis_post_counts", {})

    if phase == "explore":
        # 最も投稿数が少ない仮説を優先（均等配分）
        min_count = min(counts.get(h["id"], 0) for h in active)
        candidates = [h for h in active if counts.get(h["id"], 0) == min_count]
        selected = random.choice(candidates)

    elif phase == "focus":
        # 上位3仮説のみ（experiment_stateに記録されている前提）
        top_ids = state.get("top_hypotheses", [h["id"] for h in active[:3]])
        candidates = [h for h in active if h["id"] in top_ids]
        if not candidates:
            candidates = active
        min_count = min(counts.get(h["id"], 0) for h in candidates)
        candidates = [h for h in candidates if counts.get(h["id"], 0) == min_count]
        selected = random.choice(candidates)

    else:  # commit
        top_id = state.get("commit_hypothesis", active[0]["id"])
        selected = next((h for h in active if h["id"] == top_id), active[0])

    logger.info("Selected hypothesis: %s (%s) [phase=%s]",
                selected["id"], selected["name"], phase)
    return selected


def select_cta_variant(account_dir: Path) -> dict:
    """CTAバリアントをラウンドロビンで選択する"""
    config = load_hypotheses(account_dir)
    state = load_experiment_state(account_dir)
    variants = config.get("cta_variants", [])

    if not variants:
        return {"id": "none", "name": "CTAなし", "text": ""}

    counts = state.get("cta_post_counts", {})
    min_count = min(counts.get(v["id"], 0) for v in variants)
    candidates = [v for v in variants if counts.get(v["id"], 0) == min_count]
    selected = random.choice(candidates)

    logger.info("Selected CTA variant: %s", selected["id"])
    return selected


def should_post_discovery_question(account_dir: Path) -> bool:
    """今回の投稿をdiscovery question（問いかけ）にすべきか判定する"""
    state = load_experiment_state(account_dir)
    config = load_hypotheses(account_dir)

    questions_per_week = config.get("experiment_config", {}).get("discovery_questions_per_week", 1)
    weekly_discovery_count = state.get("weekly_discovery_count", 0)

    return weekly_discovery_count < questions_per_week


def select_discovery_question(account_dir: Path) -> str:
    """discovery questionを選択する（未使用のものを優先）"""
    config = load_hypotheses(account_dir)
    state = load_experiment_state(account_dir)

    questions = config.get("discovery_questions", [])
    used = state.get("used_discovery_questions", [])

    unused = [q for q in questions if q not in used]
    if not unused:
        unused = questions  # 全部使ったらリセット

    return random.choice(unused) if unused else ""


def record_post(account_dir: Path, hypothesis_id: str, cta_variant: str,
                is_discovery: bool = False) -> None:
    """投稿結果を実験状態に記録する"""
    state = load_experiment_state(account_dir)

    # 仮説別カウント
    h_counts = state.get("hypothesis_post_counts", {})
    h_counts[hypothesis_id] = h_counts.get(hypothesis_id, 0) + 1
    state["hypothesis_post_counts"] = h_counts

    # CTA別カウント
    c_counts = state.get("cta_post_counts", {})
    c_counts[cta_variant] = c_counts.get(cta_variant, 0) + 1
    state["cta_post_counts"] = c_counts

    # 総投稿数
    state["total_posts"] = state.get("total_posts", 0) + 1

    # discovery count
    if is_discovery:
        state["weekly_discovery_count"] = state.get("weekly_discovery_count", 0) + 1

    save_experiment_state(account_dir, state)
    logger.info("Recorded: hypothesis=%s, cta=%s, total=%d",
                hypothesis_id, cta_variant, state["total_posts"])


def get_experiment_summary(account_dir: Path) -> dict:
    """実験状態のサマリーを返す"""
    config = load_hypotheses(account_dir)
    state = load_experiment_state(account_dir)
    hypotheses = config.get("hypotheses", [])
    counts = state.get("hypothesis_post_counts", {})

    summary = {
        "phase": state.get("current_phase", "explore"),
        "total_posts": state.get("total_posts", 0),
        "hypotheses": {},
    }

    for h in hypotheses:
        summary["hypotheses"][h["id"]] = {
            "name": h["name"],
            "posts": counts.get(h["id"], 0),
            "status": h.get("status", "active"),
        }

    return summary
