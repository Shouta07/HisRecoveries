// お支払いリンクの発行。管理画面からのみ。
//
// このルートは middleware の matcher（/api/admin/:path*）に入っているので、
// Basic 認証を通らないと到達しない。公開の「今すぐ購入」導線は用意しない
// ——相談で合うことを確かめてから渡す、という商品設計に合わせている。
//
// 受け取るのは「誰に・どちらの価格で・いつ実施か」だけ。金額は受け取らない。

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, stripeEnabled, stripeLiveMode } from "@/lib/stripe";
import { TIERS, isTierId } from "@/lib/pricing";
import { countFounderHeld, ordersEnabled, recordIssuedOrder } from "@/lib/orders";
import { FOUNDER_SEATS } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  if (!stripeEnabled) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY が未設定です。デプロイ環境の環境変数を確認してください。" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const tier = body.tier;
  if (!isTierId(tier)) {
    return NextResponse.json({ error: "tier が不正です" }, { status: 400 });
  }
  const email = clean(body.email, 200).toLowerCase();
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "メールアドレスの形式が不正です" }, { status: 400 });
  }
  const name = clean(body.name, 80);
  const note = clean(body.note, 500);
  const scheduledFor = clean(body.scheduledFor, 10);
  if (scheduledFor && !DATE.test(scheduledFor)) {
    return NextResponse.json({ error: "実施日は YYYY-MM-DD で指定してください" }, { status: 400 });
  }

  // 先着枠はサーバーで止める。DB未接続のときは数えられないので発行を許すが、
  // その旨をレスポンスに含めて運用側に気づかせる。
  let seatWarning: string | null = null;
  if (tier === "founder") {
    if (ordersEnabled) {
      const held = await countFounderHeld();
      if (held >= FOUNDER_SEATS) {
        return NextResponse.json(
          {
            error: `先着${FOUNDER_SEATS}名の枠は埋まっています（発行済み ${held} 件）。通常価格で発行してください。`,
          },
          { status: 409 }
        );
      }
    } else {
      seatWarning = "Supabase が未接続のため、先着枠のカウントができていません。";
    }
  }

  // 冪等キー：同じ相手・同じ価格・同じ実施日なら、二重送信しても1つしか作らない。
  const idempotencyKey = `co_${tier}_${email}_${scheduledFor || "tbd"}`;

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || req.nextUrl.origin;

  try {
    const session = await createCheckoutSession({
      tier,
      email,
      name,
      scheduledFor: scheduledFor || undefined,
      note: note || undefined,
      idempotencyKey,
      origin,
    });

    const saved = await recordIssuedOrder({
      stripe_session_id: session.id,
      status: "issued",
      tier,
      amount: session.amount,
      currency: "jpy",
      email,
      display_name: name || null,
      scheduled_for: scheduledFor || null,
      note: note || null,
    });

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
      amount: session.amount,
      tierLabel: TIERS[tier].label,
      expiresAt: session.expiresAt,
      liveMode: stripeLiveMode,
      warning:
        seatWarning ??
        (saved.ok ? null : "決済リンクは作成しましたが、注文の記録に失敗しました（枠の集計に反映されません）。"),
    });
  } catch (e) {
    // Stripe の生のエラーはそのまま返さない（内部情報が混ざりうるため）
    console.error("[checkout] create failed", e);
    const message = e instanceof Error ? e.message : "決済リンクの作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
