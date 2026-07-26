"""
Main - エージェント連携司令塔
8エージェントを統括し、バズリライト型の投稿サイクルを実行する。

フロー:
1. Supervisor: preflight check
2. Researcher: バズ投稿収集（競合・自アカウント・RSS）
3. Monetize: 商材トピック選定
4. Writer: バズリライト + 自己採点 + CTA挿入
5. Supervisor: 最終チェック
6. Poster: Threads APIに投稿
7. Monetize: 収益トラッキング記録
8. Analyst: バズ効果分析（定期）
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

from core import supervisor, researcher, writer, poster, analyst, fetcher, approvals
from core.monetize import (
    load_monetize_config,
    record_post_with_cta,
    get_revenue_summary,
)
from core.config import (
    load_account_config,
    validate_account,
    validate_account_name,
    list_accounts,
    LOGS_DIR,
    ACCOUNTS_DIR,
)

# .env 読み込み
load_dotenv()

# RSSフォールバック（アカウント設定にRSSが無い場合）
FALLBACK_RSS_FEEDS = [
    "https://news.google.com/rss/search?q=転職&hl=ja&gl=JP&ceid=JP:ja",
    "https://news.google.com/rss/search?q=キャリア+働き方&hl=ja&gl=JP&ceid=JP:ja",
]


LOG_RETENTION_DAYS = 7  # ログ保持期間


def setup_logging(account_id: str, verbose: bool = False) -> None:
    """ログ設定 + 古いログの自動削除"""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = LOGS_DIR / f"{account_id}_{datetime.now():%Y%m%d}.log"

    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )

    # 古いログファイルを自動削除
    _cleanup_old_logs()


def _cleanup_old_logs() -> None:
    """LOG_RETENTION_DAYS日以上前のログファイルを削除"""
    import time as _time
    cutoff = _time.time() - (LOG_RETENTION_DAYS * 86400)
    try:
        for f in LOGS_DIR.iterdir():
            if f.suffix == ".log" and f.stat().st_mtime < cutoff:
                f.unlink()
    except OSError:
        pass


def _payload_from_result(post_result: dict) -> dict:
    """承認キューに積む/後で投稿するために必要な生成結果だけを抽出。"""
    keys = (
        "text", "posts", "is_thread", "link", "cta_used",
        "hypothesis_id", "hypothesis_name", "topic_slug",
        "buzz_score", "source_type",
    )
    payload = {k: post_result.get(k) for k in keys}
    product = post_result.get("product")
    payload["product"] = product.get("name") if isinstance(product, dict) else product
    return payload


def _publish_payload(
    account_id: str, persona: dict, payload: dict, dry_run: bool = False,
) -> dict | None:
    """承認済み(または即時)の生成物を Threads へ投稿し、履歴用 result を返す。"""
    logger = logging.getLogger(__name__)
    is_thread = payload.get("is_thread", False)
    thread_posts = payload.get("posts", []) or []
    post_text = payload.get("text", "")
    if dry_run:
        logger.info("[DRY RUN] Would publish approved item (thread=%s)", is_thread)
        result = {"thread_id": "dry_run", "dry_run": True}
    else:
        user_id = poster.get_user_id(account_id=account_id)
        if is_thread:
            result = poster.create_thread_chain(
                user_id=user_id, posts=thread_posts, account_id=account_id,
                persona=persona, link_attachment_last=payload.get("link") or None,
            )
        else:
            result = poster.create_thread_post(
                user_id=user_id, text=post_text, account_id=account_id,
            )
        if not result:
            return None
    result["text"] = post_text
    result["cta_used"] = payload.get("cta_used")
    result["product"] = payload.get("product")
    result["buzz_score"] = payload.get("buzz_score", 0)
    result["source_type"] = payload.get("source_type", "original")
    result["hypothesis_id"] = payload.get("hypothesis_id")
    result["hypothesis_name"] = payload.get("hypothesis_name")
    result["topic_slug"] = payload.get("topic_slug")
    result["link"] = payload.get("link") or payload.get("cta_used")
    result["is_thread"] = is_thread
    if is_thread:
        result["post_count"] = len(thread_posts)
    result["posted_at"] = result.get("posted_at") or datetime.now().isoformat()
    return result


def run_approved_cycle(
    account_id: str, dry_run: bool = False, mock: bool = False,
) -> bool:
    """承認済み(approved)の生成物だけを投稿する（cron 想定）。"""
    logger = logging.getLogger(__name__)
    try:
        config = load_account_config(account_id)
    except FileNotFoundError as e:
        logger.error("Account config error: %s", e)
        return False
    account_dir = config["account_dir"]
    persona = config["persona"]
    poster.set_current_account(account_id)

    pending_approved = approvals.list_items(account_dir, status="approved")
    if not pending_approved:
        logger.info("No approved items to post.")
        return True

    posted = 0
    for item in pending_approved:
        try:
            result = _publish_payload(account_id, persona, item["payload"], dry_run=dry_run)
        except Exception as e:  # noqa: BLE001 — 1件の失敗で全体を止めない
            supervisor.record_error("poster", str(e))
            logger.error("Publishing approved item %s failed: %s", item["id"], e)
            continue
        if not result:
            logger.error("Publishing approved item %s returned no result.", item["id"])
            continue
        if not dry_run:
            writer.save_to_history(account_dir, result)
            approvals.set_status(account_dir, item["id"], "posted")
            record_post_with_cta(result, result.get("cta_used"), None)
        posted += 1
        logger.info("Posted approved item %s: %s", item["id"], result["text"][:50])
    logger.info("Approved cycle done: %d posted.", posted)
    return True


def run_post_cycle(
    account_id: str, dry_run: bool = False, mock: bool = False,
    approval_required: bool | None = None,
) -> bool:
    """1回の投稿サイクルを実行（マネタイズ対応）。

    approval_required が True（または persona で immediate_posting_forbidden）なら、
    生成物を投稿せず承認キューに積んで終了する（人間の承認を挟む）。
    """
    logger = logging.getLogger(__name__)

    # アカウント設定を一括読み込み
    try:
        config = load_account_config(account_id)
    except FileNotFoundError as e:
        logger.error("Account config error: %s", e)
        return False

    account_dir = config["account_dir"]
    history_path = config["history_path"]
    persona = config["persona"]
    rss_feeds = config["rss_feeds"] or FALLBACK_RSS_FEEDS

    # バリデーション
    errors = validate_account(account_id)
    if errors:
        for err in errors:
            logger.warning("Config warning: %s", err)

    # アカウント別API鍵を有効化（後方互換）
    poster.set_current_account(account_id)

    # 1. Supervisor: プリフライトチェック
    logger.info("=== [1/8] Supervisor: preflight check ===")
    if not supervisor.preflight_check(account_id, history_path):
        logger.warning("Preflight check failed. Aborting cycle.")
        return False

    # 2. Researcher: バズ投稿収集
    logger.info("=== [2/8] Researcher: collecting viral posts ===")
    try:
        viral_posts = researcher.collect_viral_posts(
            account_dir, persona, rss_feeds, account_id=account_id,
        )
        researcher.save_viral_posts(viral_posts)
        logger.info("Collected %d viral posts", len(viral_posts))
    except Exception as e:
        logger.warning("Viral post collection failed (non-fatal): %s", e)
        viral_posts = []
    # 後方互換: topicsも収集（fallback用）
    topics = []
    try:
        topics = researcher.collect_topics(rss_feeds, persona)
        researcher.save_topics(topics)
    except Exception as e:
        logger.debug("Topic collection failed (non-fatal): %s", e)

    # フォロワー数取得（CTA挿入率の段階調整に使用）
    follower_count = 0
    if not mock and not dry_run:
        try:
            user_id = poster.get_user_id(account_id=account_id)
            insights = fetcher.get_user_insights(user_id, account_id=account_id)
            for item in insights.get("data", []):
                if item.get("name") == "followers_count":
                    values = item.get("values", [])
                    if values:
                        follower_count = int(values[0].get("value", 0))
                        break
            logger.info("Follower count: %d", follower_count)
        except Exception as e:
            logger.warning("Could not fetch follower count (non-fatal): %s", e)

    # 3-4. Writer: バズリライト + 自己採点 + CTA挿入
    logger.info("=== [3-4/8] Writer + Monetize: buzz rewrite with CTA ===")
    topic_text = topics[0]["title"] if topics else None
    try:
        post_result = writer.generate_post(
            account_dir, topic=topic_text, mock=mock,
            follower_count=follower_count,
            account_id=account_id,
        )
    except Exception as e:
        supervisor.record_error("writer", str(e))
        logger.error("Post generation failed: %s", e)
        return False

    if not post_result:
        logger.error("Writer returned empty. Aborting.")
        return False

    post_text = post_result["text"]
    cta_used = post_result.get("cta_used")
    product = post_result.get("product")
    buzz_score = post_result.get("buzz_score", 0)
    source_type = post_result.get("source_type", "original")

    logger.info("Buzz score: %d, Source: %s", buzz_score, source_type)
    if cta_used:
        logger.info("CTA inserted: %s", cta_used[:40])
    if product:
        logger.info("Product: %s (%s)", product.get("name"), product.get("type"))

    # 5. Supervisor: 最終チェック
    logger.info("=== [5/8] Supervisor: final check ===")
    if not supervisor.preflight_check(account_id, history_path):
        logger.warning("Final check failed. Aborting.")
        return False

    # 5.5 承認ゲート: 承認制なら投稿せずキューに積んで終了（人間の承認を挟む）
    require_approval = (
        approval_required if approval_required is not None
        else poster.check_approval_required(persona)
    )
    if require_approval and not dry_run:
        payload = _payload_from_result(post_result)
        item_id = approvals.enqueue(account_dir, payload, account_id=account_id)
        logger.info(
            "=== Approval required: queued (id=%s), NOT posted. "
            "承認後に `post-approved` で投稿されます ===", item_id,
        )
        return True

    # 6. Poster: 投稿
    logger.info("=== [6/8] Poster: publishing to Threads ===")
    is_thread = post_result.get("is_thread", False)
    thread_posts = post_result.get("posts", [])
    if dry_run:
        if is_thread:
            logger.info("[DRY RUN] Would post thread (%d posts):", len(thread_posts))
            for i, p in enumerate(thread_posts, start=1):
                logger.info("[DRY RUN] --- %d/%d ---\n%s", i, len(thread_posts), p)
        else:
            logger.info("[DRY RUN] Would post:\n%s", post_text)
        result = {
            "thread_id": "dry_run",
            "text": post_text,
            "posted_at": datetime.now().isoformat(),
            "dry_run": True,
        }
    else:
        try:
            user_id = poster.get_user_id(account_id=account_id)
            if is_thread:
                result = poster.create_thread_chain(
                    user_id=user_id, posts=thread_posts, account_id=account_id,
                    persona=persona,
                    link_attachment_last=post_result.get("link") or None,
                )
            else:
                result = poster.create_thread_post(
                    user_id=user_id, text=post_text, account_id=account_id,
                )
        except Exception as e:
            supervisor.record_error("poster", str(e))
            logger.error("Posting failed: %s", e)
            return False

        if not result:
            logger.error("Posting returned no result. Aborting.")
            return False

    # 履歴に保存
    result["text"] = post_text
    result["cta_used"] = cta_used
    result["product"] = product.get("name") if product else None
    result["buzz_score"] = buzz_score
    result["source_type"] = source_type
    # 分析用メタ情報（機会・リンク先・連投かどうか）を残す
    result["hypothesis_id"] = post_result.get("hypothesis_id")
    result["hypothesis_name"] = post_result.get("hypothesis_name")
    result["topic_slug"] = post_result.get("topic_slug")
    result["link"] = post_result.get("link") or cta_used
    result["is_thread"] = post_result.get("is_thread", False)
    if is_thread:
        result["post_count"] = len(thread_posts)
    writer.save_to_history(account_dir, result)
    logger.info("Post saved to history: %s", post_text[:50])

    # 7. Monetize: 収益トラッキング記録
    logger.info("=== [7/8] Monetize: recording revenue data ===")
    record_post_with_cta(result, cta_used, product)

    # 8. Analyst: バズ効果分析（毎回ではなく、蓄積後に実行）
    logger.info("=== [8/8] Analyst: buzz effectiveness analysis ===")
    if dry_run:
        logger.info("[DRY RUN] Skipping analysis")
    else:
        try:
            history = writer.load_history(account_dir)
            if len(history) % 10 == 0 and len(history) > 0:
                summary = analyst.analyze_recent_posts(history=history)
                analyst.save_analysis(summary)
                suggestions = analyst.get_improvement_suggestions(summary)
                for s in suggestions:
                    logger.info("Suggestion: %s", s)
                # バズ分析ログ
                buzz = summary.get("buzz_analysis", {})
                if buzz:
                    logger.info("Avg buzz score: %.1f, Hit rate: %.1f%%",
                                buzz.get("avg_buzz_score", 0),
                                buzz.get("high_score_hit_rate", 0))
        except Exception as e:
            logger.warning("Analysis failed (non-fatal): %s", e)

    logger.info("=== Cycle completed successfully ===")
    return True


# ─── CLI Commands ────────────────────────────────────────────


def cmd_post(args) -> int:
    """post サブコマンド: 1回の投稿サイクル"""
    setup_logging(args.account, args.verbose)
    logger = logging.getLogger(__name__)
    mock = getattr(args, "mock", False)
    dry = args.dry_run  # mockでもdry_runは明示的に指定した場合のみ
    if mock:
        logger.info("[MOCK] Starting mock post cycle for: %s", args.account)
    else:
        logger.info("Starting post cycle for: %s", args.account)

    approval_required = True if getattr(args, "require_approval", False) else None
    success = run_post_cycle(
        args.account, dry_run=dry, mock=mock, approval_required=approval_required,
    )
    return 0 if success else 1


def cmd_queue(args) -> int:
    """queue サブコマンド: 承認キューの一覧表示。"""
    account_dir = load_account_config(args.account)["account_dir"]
    status = getattr(args, "status", None)
    items = approvals.list_items(account_dir, status=status)
    if not items:
        print("(承認キューは空です)")
        return 0
    for it in items:
        txt = (it["payload"].get("text") or "").replace("\n", " ")[:60]
        print(f'[{it["status"]:8}] {it["id"]}  {txt}')
    return 0


def cmd_approve(args) -> int:
    """approve サブコマンド: 承認キューの1件を承認。"""
    account_dir = load_account_config(args.account)["account_dir"]
    ok = approvals.approve(account_dir, args.id, by=getattr(args, "by", None))
    print("承認しました。post-approved で投稿されます。" if ok else "該当IDが見つかりません")
    return 0 if ok else 1


def cmd_reject(args) -> int:
    """reject サブコマンド: 承認キューの1件を却下。"""
    account_dir = load_account_config(args.account)["account_dir"]
    ok = approvals.reject(account_dir, args.id, by=getattr(args, "by", None))
    print("却下しました。" if ok else "該当IDが見つかりません")
    return 0 if ok else 1


def cmd_post_approved(args) -> int:
    """post-approved サブコマンド: 承認済みだけを投稿（cron 想定）。"""
    setup_logging(args.account, getattr(args, "verbose", False))
    ok = run_approved_cycle(
        args.account, dry_run=args.dry_run, mock=getattr(args, "mock", False),
    )
    return 0 if ok else 1


def cmd_schedule(args) -> int:
    """schedule サブコマンド: スケジューラ起動"""
    from core.scheduler import run_scheduler
    mock = getattr(args, "mock", False)
    dry = args.dry_run
    run_scheduler(args.account, dry_run=dry)
    return 0


def cmd_validate(args) -> int:
    """validate サブコマンド: アカウント設定チェック"""
    accounts = [args.account] if args.account != "all" else list_accounts()

    all_ok = True
    for account_id in accounts:
        errors = validate_account(account_id)
        if errors:
            print(f"[NG] {account_id}:")
            for err in errors:
                print(f"  - {err}")
            all_ok = False
        else:
            config = load_account_config(account_id)
            monetize = load_monetize_config(config["account_dir"])
            status = "ON" if monetize.get("enabled") else "OFF"
            products = len(monetize.get("products", []))
            print(f"[OK] {account_id} (monetize={status}, products={products})")

    return 0 if all_ok else 1


def cmd_status(args) -> int:
    """status サブコマンド: システム状態 + 収益サマリー"""
    accounts = list_accounts()
    print(f"=== Threads CEO Status ===\n")
    print(f"Accounts: {len(accounts)}")
    for a in accounts:
        config = load_account_config(a)
        history = writer.load_history(config["account_dir"])
        persona = config["persona"]
        monetize = load_monetize_config(config["account_dir"])
        m_status = "ON" if monetize.get("enabled") else "OFF"
        print(f"  {a}: {persona.get('genre', '?')} | "
              f"posts={len(history)} | "
              f"monetize={m_status} | "
              f"slots={persona.get('posting', {}).get('time_slots', [])}")

    kill = supervisor.is_kill_switch_active()
    print(f"\nKILL_SWITCH: {'ON' if kill else 'OFF'}")

    # 収益サマリー
    rev = get_revenue_summary()
    if rev["total_posts"] > 0:
        print(f"\n=== Revenue Summary ===")
        print(f"Total posts: {rev['total_posts']}")
        print(f"Posts with CTA: {rev['posts_with_cta']} ({rev['cta_rate']}%)")
        if rev["product_breakdown"]:
            print("Product breakdown:")
            for name, count in rev["product_breakdown"].items():
                print(f"  {name}: {count} posts")

    return 0


def cmd_revenue(args) -> int:
    """revenue サブコマンド: 収益ダッシュボード"""
    rev = get_revenue_summary()
    print("=== Revenue Dashboard ===\n")
    print(f"Total tracked posts:  {rev['total_posts']}")
    print(f"Posts with CTA:       {rev['posts_with_cta']}")
    print(f"CTA insertion rate:   {rev['cta_rate']}%")

    if rev["product_breakdown"]:
        print(f"\n--- Product Breakdown ---")
        for name, count in sorted(
            rev["product_breakdown"].items(), key=lambda x: x[1], reverse=True
        ):
            pct = round(count / rev["total_posts"] * 100, 1) if rev["total_posts"] else 0
            bar = "#" * int(pct / 2)
            print(f"  {name:30s} {count:4d} ({pct:5.1f}%) {bar}")
    else:
        print("\nNo product data yet. Start posting with monetize.json configured.")

    return 0


def cmd_new_account(args) -> int:
    """new-account サブコマンド: 新規アカウント作成"""
    if not validate_account_name(args.name):
        print(f"Error: Invalid account name '{args.name}'. Use only letters, numbers, hyphens, underscores.")
        return 1

    account_dir = ACCOUNTS_DIR / args.name

    if account_dir.exists():
        print(f"Error: Account '{args.name}' already exists")
        return 1

    account_dir.mkdir(parents=True)

    # persona.json テンプレート
    persona = {
        "account_id": args.name,
        "display_name": args.display_name or args.name,
        "genre": args.genre or "未設定",
        "target_audience": "未設定",
        "tone": {
            "style": "友達に話しかける口調",
            "formality": "カジュアル",
            "emoji_usage": "控えめ（0〜2個）",
            "line_breaks": "1文ごとに改行",
        },
        "character": {
            "background": "未設定",
            "values": [],
            "ng_words": [],
            "first_person": "自分",
        },
        "posting": {
            "frequency_per_day": 3,
            "time_slots": ["08:00", "12:00", "20:00"],
            "max_chars": 500,
            "hashtag_count": [2, 4],
        },
        "viral_sources": {
            "search_keywords": [],
            "theme_tree": [],
        },
    }
    (account_dir / "persona.json").write_text(
        json.dumps(persona, ensure_ascii=False, indent=2)
    )

    # history.json 初期化
    (account_dir / "history.json").write_text(
        json.dumps({"posts": [], "last_posted_at": None, "total_count": 0},
                    ensure_ascii=False, indent=2)
    )

    # patterns.md テンプレート
    (account_dir / "patterns.md").write_text(
        "# バズ構文パターン\n\n"
        "## 1. 断言型\n**構造**: `〇〇は△△です。`\n**例**: \n\n"
        "## 2. 逆説型\n**構造**: `〇〇と思ってる人多いけど、実は△△。`\n**例**: \n\n"
        "## 3. 共感型\n**構造**: `〇〇な人、正直めちゃくちゃ多い。`\n**例**: \n\n"
        "## 4. 問いかけ型\n**構造**: `〇〇って思ったこと、ありませんか？`\n**例**: \n\n"
        "## 5. ストーリー型\n**構造**: `友人/同僚のエピソード → 学び`\n**例**: \n"
    )

    # rss_feeds.json テンプレート
    (account_dir / "rss_feeds.json").write_text(
        json.dumps({"feeds": []}, ensure_ascii=False, indent=2)
    )

    # monetize.json テンプレート
    monetize = {
        "enabled": False,
        "cta_insertion_rate": 0.4,
        "profile_link": "",
        "cta_templates": [
            {"text": "→ 詳しくはプロフのリンクからどうぞ", "weight": 1},
        ],
        "products": [],
    }
    (account_dir / "monetize.json").write_text(
        json.dumps(monetize, ensure_ascii=False, indent=2)
    )

    print(f"Account '{args.name}' created at {account_dir}")
    print("Next steps:")
    print(f"  1. vi {account_dir}/persona.json     # キャラ設定")
    print(f"  2. vi {account_dir}/patterns.md      # バズ構文")
    print(f"  3. vi {account_dir}/rss_feeds.json   # RSSフィード")
    print(f"  4. vi {account_dir}/monetize.json    # マネタイズ設定")
    print(f"  5. python -m core.main validate {args.name}")
    return 0


def cmd_kill(args) -> int:
    """kill サブコマンド: KILL_SWITCH操作"""
    if args.action == "on":
        reason = args.reason or "Manual activation"
        supervisor.activate_kill_switch(reason)
        print(f"KILL_SWITCH activated: {reason}")
    elif args.action == "off":
        supervisor.deactivate_kill_switch()
        print("KILL_SWITCH deactivated")
    elif args.action == "status":
        active = supervisor.is_kill_switch_active()
        print(f"KILL_SWITCH: {'ON' if active else 'OFF'}")
    return 0


def cmd_prelaunch(args) -> int:
    """pre-launch サブコマンド: 本番運用前の全項目チェック"""
    account_id = args.account
    print(f"=== Pre-Launch Checklist: {account_id} ===\n")

    all_ok = True

    def check(label: str, ok: bool, detail: str = ""):
        nonlocal all_ok
        mark = "OK" if ok else "NG"
        if not ok:
            all_ok = False
        msg = f"  [{mark}] {label}"
        if detail:
            msg += f" — {detail}"
        print(msg)

    # 1. アカウント設定
    print("--- Account Config ---")
    errors = validate_account(account_id)
    check("アカウント設定バリデーション", len(errors) == 0,
          f"{len(errors)}件のエラー" if errors else "")
    for e in errors:
        print(f"       {e}")

    try:
        config = load_account_config(account_id)
        account_dir = config["account_dir"]
        persona = config["persona"]
    except Exception as e:
        print(f"  [NG] アカウント読み込み失敗: {e}")
        return 1

    check("ジャンル設定", persona.get("genre", "未設定") != "未設定",
          persona.get("genre", "未設定"))
    check("ターゲット設定", persona.get("target_audience", "未設定") != "未設定",
          persona.get("target_audience", ""))
    check("キャラ背景", persona.get("character", {}).get("background", "未設定") != "未設定")
    check("NGワード設定", len(persona.get("character", {}).get("ng_words", [])) > 0,
          f"{len(persona.get('character', {}).get('ng_words', []))}個")

    patterns = writer.load_patterns(account_dir)
    check("バズ構文パターン数", len(patterns) >= 10,
          f"{len(patterns)}種類（推奨10以上）")

    check("RSSフィード", len(config.get("rss_feeds", [])) > 0,
          f"{len(config.get('rss_feeds', []))}件")

    # 2. マネタイズ設定
    print("\n--- Monetize Config ---")
    monetize = load_monetize_config(account_dir)
    check("マネタイズ有効", monetize.get("enabled", False))
    check("CTA挿入率", 0 < monetize.get("cta_insertion_rate", 0) <= 1,
          f"{monetize.get('cta_insertion_rate', 0) * 100:.0f}%")
    check("CTAテンプレート", len(monetize.get("cta_templates", [])) >= 2,
          f"{len(monetize.get('cta_templates', []))}種類")
    check("プロフリンク", bool(monetize.get("profile_link")),
          monetize.get("profile_link", "未設定"))
    products = [p for p in monetize.get("products", []) if p.get("active")]
    check("有効商材", len(products) >= 1,
          f"{len(products)}件")

    # 3. API設定
    print("\n--- API Keys ---")

    def _is_real_key(val: str | None) -> bool:
        """プレースホルダーや空値でないか判定"""
        if not val:
            return False
        placeholders = ("your_", "sk-xxx", "xxx", "placeholder", "dummy", "_here")
        return not any(p in val.lower() for p in placeholders)

    check("THREADS_ACCESS_TOKEN", _is_real_key(os.getenv("THREADS_ACCESS_TOKEN")))
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    gemini_ok = _is_real_key(gemini_key)
    openai_ok = _is_real_key(openai_key)
    check("GEMINI_API_KEY（推奨・無料枠で¥0運用）", gemini_ok,
          "設定済み" if gemini_ok else "未設定またはプレースホルダー → 実際のキーを設定してください")
    if not gemini_ok and openai_ok:
        check("OPENAI_API_KEY（フォールバック）", True,
              "有効だがコスト発生。GEMINI_API_KEYの設定を推奨")
    elif not gemini_ok and not openai_ok:
        check("AI API キー", False, "GEMINI_API_KEY または OPENAI_API_KEY が必要")
    check("THREADS_APP_SECRET（トークン自動更新用）",
          _is_real_key(os.getenv("THREADS_APP_SECRET")),
          "任意だが推奨")

    # 4. 安全設定
    print("\n--- Safety ---")
    check("KILL_SWITCH", not supervisor.is_kill_switch_active(), "OFF=正常")

    # 5. 結果
    print(f"\n{'=' * 40}")
    if all_ok:
        print("ALL CHECKS PASSED — 本番運用準備完了!")
        print(f"\n起動コマンド:")
        print(f"  python -m core.main post {account_id}           # 1回投稿")
        print(f"  python -m core.main schedule {account_id}        # スケジューラ")
    else:
        print("一部チェックが失敗しています。上記の [NG] 項目を修正してください。")

    return 0 if all_ok else 1


def cmd_daemon(args) -> int:
    """daemon サブコマンド: 完全自動運用デーモン"""
    from core.daemon import run_daemon, is_daemon_running

    logger = logging.getLogger(__name__)
    mock = getattr(args, "mock", False)
    dry = args.dry_run or mock

    if is_daemon_running():
        print("Daemon is already running. Use 'status' to check.")
        return 1

    # アカウント指定（カンマ区切りで複数可、"all"で全アカウント）
    if args.account == "all":
        account_ids = list_accounts()
    else:
        account_ids = [a.strip() for a in args.account.split(",")]

    if not account_ids:
        print("No accounts found.")
        return 1

    post_now = getattr(args, "post_now", False)

    print(f"Starting Threads CEO Daemon...")
    print(f"  Accounts: {', '.join(account_ids)}")
    print(f"  Dry run:  {dry}")
    print(f"  Mock:     {mock}")
    print(f"  Post now: {post_now}")
    print(f"  PID:      {os.getpid()}")
    print()
    print("Press Ctrl+C to stop.")
    print()

    if post_now:
        logger.info("=== --post-now: Immediate post cycle ===")
        for aid in account_ids:
            try:
                success = run_post_cycle(aid, dry_run=dry, mock=mock)
                if success:
                    logger.info("[%s] Immediate post completed", aid)
                else:
                    logger.warning("[%s] Immediate post failed", aid)
            except Exception as e:
                logger.error("[%s] Immediate post error: %s", aid, e)

    semi_auto = getattr(args, "semi_auto", False)
    run_daemon(account_ids, dry_run=dry, mock=mock, semi_auto=semi_auto)
    return 0


def cmd_collect(args) -> int:
    """collect サブコマンド: 投稿の成果データを回収"""
    setup_logging(args.account)
    logger = logging.getLogger(__name__)
    logger.info("Collecting metrics for: %s (last %d days)", args.account, args.days)

    from core.collector import run_collection
    run_collection(account_id=args.account, days_back=args.days)
    return 0


def cmd_import_history(args) -> int:
    """import-history サブコマンド: Threadsの過去投稿を全件取り込む"""
    setup_logging(args.account)
    logger = logging.getLogger(__name__)
    from core.config import get_account_dir
    from core.collector import import_history

    account_dir = get_account_dir(args.account)
    logger.info("Importing past posts from Threads for: %s", args.account)
    added = import_history(
        account_dir, account_id=args.account,
        max_pages=args.max_pages, with_insights=not args.no_insights,
    )
    print(f"Imported {added} new posts into history.json")
    return 0


def cmd_sheets_sync(args) -> int:
    """sheets-sync サブコマンド: スプレッドシートと投稿内容を同期する。

    push: 現在のJSON → シート（初期化・現状反映）
    pull: シート → JSON（編集を投稿に反映）
    """
    setup_logging(args.account)
    logger = logging.getLogger(__name__)
    from core.config import get_account_dir
    from core.sheets import is_sheets_configured
    from core import sheets_sync

    if not is_sheets_configured():
        print("Google Sheets未設定（GOOGLE_SHEETS_ID / GOOGLE_SHEETS_CREDENTIALS_JSON）")
        return 1

    account_dir = get_account_dir(args.account)
    if args.direction == "push":
        ok = sheets_sync.push_content(account_dir)
        print("シートへ書き出し:", "完了" if ok else "一部失敗")
    else:
        changed = sheets_sync.pull_content(account_dir)
        print("シートから取り込み:", "更新あり" if changed else "変更なし")
    return 0


def cmd_check_connection(args) -> int:
    """check-connection サブコマンド: Threads APIに繋がるか診断する。

    トークン→プロフィール(投稿権限)→インサイト(分析権限)の順に確認し、
    「何が足りないか」を人が読める形で報告する。トークンは一切表示しない。
    """
    setup_logging(args.account)
    from core import poster, fetcher
    from core.config import get_account_env

    aid = args.account
    print("=== Threads API 接続チェック:", aid, "===\n")
    ok = True

    # 1. トークン設定の有無
    token = get_account_env("THREADS_ACCESS_TOKEN", aid) or os.getenv("THREADS_ACCESS_TOKEN", "")
    if not token:
        print("[NG] THREADS_ACCESS_TOKEN が未設定です（GitHub Secrets / .env）")
        return 1
    print("[OK] THREADS_ACCESS_TOKEN: 設定あり")

    user_id = poster.get_user_id(account_id=aid)
    uid_label = user_id if user_id != "me" else "(未設定→ me で解決)"
    print(f"[..] THREADS_USER_ID: {uid_label}")

    # 2. プロフィール取得 = トークン有効＋threads_basic＋USER_ID整合
    try:
        prof = fetcher.get_user_profile(user_id, account_id=aid)
        print(f"[OK] プロフィール取得: @{prof.get('username')} (id={prof.get('id')})")
        print("     → 投稿の下地(トークン有効・アカウント整合)は繋がっています")
    except Exception as e:
        print(f"[NG] プロフィール取得に失敗: {e}")
        print("     → トークン失効/スコープ不足(threads_basic)/USER_ID不一致 のいずれか")
        return 1

    # 3. インサイト権限（分析用）
    try:
        fetcher.get_user_insights(user_id, account_id=aid)
        print("[OK] インサイト権限(threads_manage_insights): あり（閲覧数の取得可）")
    except Exception as e:
        ok = False
        print(f"[warn] インサイト取得不可: {e}")
        print("       → 投稿はできるが分析(閲覧数)には threads_manage_insights の承認が必要")

    print("\n接続チェック完了。", "全て良好。" if ok else "投稿は可・分析権限は要確認。")
    return 0


def cmd_health(args) -> int:
    """health サブコマンド: デーモンのヘルス情報を表示"""
    from core.daemon import get_daemon_status, is_daemon_running

    status = get_daemon_status()
    if not status:
        print("No health data found. Is the daemon running?")
        running = is_daemon_running()
        print(f"Daemon process: {'running' if running else 'not running'}")
        return 1

    print("=== Threads CEO Health ===\n")
    d = status.get("daemon", {})
    print(f"Status:           {status.get('status', '?')}")
    print(f"Uptime:           {d.get('uptime_hours', 0):.1f} hours")
    print(f"Cycles completed: {d.get('cycles_completed', 0)}")
    print(f"Cycles failed:    {d.get('cycles_failed', 0)}")
    print(f"Last post:        {d.get('last_post_at', 'N/A')}")
    print(f"Token refresh:    {d.get('last_token_refresh', 'N/A')}")
    print(f"Accounts:         {', '.join(status.get('accounts', []))}")

    rev = status.get("revenue", {})
    if rev.get("total_posts", 0) > 0:
        print(f"\n--- Revenue ---")
        print(f"Total posts:    {rev['total_posts']}")
        print(f"Posts with CTA: {rev['posts_with_cta']} ({rev['cta_rate']}%)")

    print(f"\nLast checked: {status.get('checked_at', '?')}")
    running = is_daemon_running()
    print(f"Process alive: {'yes' if running else 'no'}")
    return 0


def cmd_token_refresh(args) -> int:
    """token-refresh サブコマンド: Threadsアクセストークンを更新"""
    if args.mode == "exchange":
        new_token = poster.refresh_long_lived_token()
    else:
        new_token = poster.refresh_existing_long_lived_token()

    if new_token:
        print(f"New token: {new_token[:8]}...{new_token[-4:]}")
        print("Token has been refreshed. Use daemon mode for automatic .env updates.")
        return 0
    else:
        print("Token refresh failed. Check logs for details.")
        return 1


# ─── Parser ──────────────────────────────────────────────────


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="threads-ceo",
        description="Threads CEO - 完全自動SNS収益化システム",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="詳細ログ出力")
    sub = parser.add_subparsers(dest="command", help="利用可能なコマンド")

    # post
    p_post = sub.add_parser("post", help="1回の投稿サイクルを実行")
    p_post.add_argument("account", nargs="?", default="mens-body-lab")
    p_post.add_argument("--dry-run", action="store_true", help="実際には投稿しない")
    p_post.add_argument("--require-approval", action="store_true",
                        help="投稿せず承認キューに積む（人間の承認を挟む）")
    p_post.add_argument("--mock", action="store_true",
                        help="APIキーなしでパイプライン全体をテスト")
    p_post.set_defaults(func=cmd_post)

    # 承認キュー: 一覧 / 承認 / 却下 / 承認済みを投稿
    p_queue = sub.add_parser("queue", help="承認キューを一覧表示")
    p_queue.add_argument("account", help="アカウントID")
    p_queue.add_argument("--status", choices=list(approvals.STATUSES),
                         help="状態で絞り込み（pending/approved/rejected/posted）")
    p_queue.set_defaults(func=cmd_queue)

    p_approve = sub.add_parser("approve", help="承認キューの1件を承認")
    p_approve.add_argument("account", help="アカウントID")
    p_approve.add_argument("id", help="承認する item id")
    p_approve.add_argument("--by", help="承認者名（任意）")
    p_approve.set_defaults(func=cmd_approve)

    p_reject = sub.add_parser("reject", help="承認キューの1件を却下")
    p_reject.add_argument("account", help="アカウントID")
    p_reject.add_argument("id", help="却下する item id")
    p_reject.add_argument("--by", help="却下者名（任意）")
    p_reject.set_defaults(func=cmd_reject)

    p_papproved = sub.add_parser("post-approved", help="承認済みだけを投稿（cron想定）")
    p_papproved.add_argument("account", help="アカウントID")
    p_papproved.add_argument("--dry-run", action="store_true", help="実際には投稿しない")
    p_papproved.add_argument("--mock", action="store_true", help="モック（互換用）")
    p_papproved.set_defaults(func=cmd_post_approved)

    # schedule
    p_sched = sub.add_parser("schedule", help="スケジューラを起動")
    p_sched.add_argument("account", nargs="?", default="mens-body-lab")
    p_sched.add_argument("--dry-run", action="store_true", help="実際には投稿しない")
    p_sched.add_argument("--mock", action="store_true",
                        help="APIキーなしでテスト")
    p_sched.set_defaults(func=cmd_schedule)

    # validate
    p_val = sub.add_parser("validate", help="アカウント設定を検証")
    p_val.add_argument("account", nargs="?", default="all")
    p_val.set_defaults(func=cmd_validate)

    # status
    p_status = sub.add_parser("status", help="システム状態を表示")
    p_status.set_defaults(func=cmd_status)

    # revenue
    p_rev = sub.add_parser("revenue", help="収益ダッシュボードを表示")
    p_rev.set_defaults(func=cmd_revenue)

    # new-account
    p_new = sub.add_parser("new-account", help="新規アカウントを作成")
    p_new.add_argument("name", help="アカウントID（例: client-01）")
    p_new.add_argument("--genre", help="ジャンル")
    p_new.add_argument("--display-name", help="表示名")
    p_new.set_defaults(func=cmd_new_account)

    # kill
    p_kill = sub.add_parser("kill", help="KILL_SWITCHを操作")
    p_kill.add_argument("action", choices=["on", "off", "status"])
    p_kill.add_argument("--reason", help="停止理由")
    p_kill.set_defaults(func=cmd_kill)

    # pre-launch
    p_pre = sub.add_parser("pre-launch", help="本番運用前チェックリスト")
    p_pre.add_argument("account", nargs="?", default="mens-body-lab")
    p_pre.set_defaults(func=cmd_prelaunch)

    # daemon
    p_daemon = sub.add_parser("daemon", help="完全自動運用デーモンを起動")
    p_daemon.add_argument("account", nargs="?", default="all",
                          help="アカウントID（カンマ区切りで複数可、allで全アカウント）")
    p_daemon.add_argument("--dry-run", action="store_true", help="実際には投稿しない")
    p_daemon.add_argument("--mock", action="store_true",
                          help="APIキーなしでテスト")
    p_daemon.add_argument("--semi-auto", action="store_true",
                          help="半自動モード: 下書き生成のみ、即時投稿しない（推奨）")
    p_daemon.add_argument("--post-now", action="store_true",
                          help="起動直後に即1投稿してからスケジュール待機に入る")
    p_daemon.set_defaults(func=cmd_daemon)

    # health
    p_health = sub.add_parser("health", help="デーモンのヘルス情報を表示")
    p_health.set_defaults(func=cmd_health)

    # token-refresh
    p_token = sub.add_parser("token-refresh", help="Threadsトークンを更新")
    p_token.add_argument(
        "mode", choices=["exchange", "refresh"],
        help="exchange=短命→長命, refresh=長命の期限延長",
    )
    p_token.set_defaults(func=cmd_token_refresh)

    # collect
    p_collect = sub.add_parser("collect", help="投稿の成果データを回収（仮説分析用）")
    p_collect.add_argument("account", nargs="?", default="mens-body-lab")
    p_collect.add_argument("--days", type=int, default=3, help="何日前まで遡るか")
    p_collect.set_defaults(func=cmd_collect)

    p_import = sub.add_parser("import-history", help="Threadsの過去投稿を全件取り込む")
    p_import.add_argument("account", nargs="?", default="mens-body-lab")
    p_import.add_argument("--max-pages", type=int, default=10, help="取得する最大ページ数")
    p_import.add_argument("--no-insights", action="store_true", help="閲覧数などを取得しない")
    p_import.set_defaults(func=cmd_import_history)

    p_check = sub.add_parser("check-connection", help="Threads APIに繋がるか診断する")
    p_check.add_argument("account", nargs="?", default="mens-body-lab")
    p_check.set_defaults(func=cmd_check_connection)

    p_sheet = sub.add_parser("sheets-sync", help="スプレッドシートと投稿内容を同期")
    p_sheet.add_argument("direction", choices=["push", "pull"], help="push=JSON→シート / pull=シート→JSON")
    p_sheet.add_argument("account", nargs="?", default="mens-body-lab")
    p_sheet.set_defaults(func=cmd_sheets_sync)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
