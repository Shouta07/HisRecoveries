import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { canCharge, whyCannotCharge } from "@/lib/legal";
import { createPassCheckout, passEnabled } from "@/lib/stripe";
import { seats } from "@/lib/pass/seats";
import { supply, shortMessage } from "@/lib/supply";
import { PANEL_SIZE } from "@/lib/pass/entitle";
import { site } from "@/lib/site";
import { readyToSell, whyNotReady, NOT_READY_USER } from "@/lib/ready";

// 月額を始める。
//
// ── 作ってあるのに押せなかった ────────────────────
// passCheckoutParams（mode: subscription）も、subscriptions テーブルも、
// Webhook の受けも、Customer Portal の口も、全部あった。
// **それを呼ぶ API が1つも無かった。** ここがその口。
//
// ── 金額を受け取らない ────────────────────────────
// 画面から来るのは持ち主の鍵だけ。値段は Stripe の Price が持ち、
// どちらの Price かは枠（seats）が決める。画面に決めさせない。
//
// ── 枠は毎回数える ────────────────────────────────
// 「先着100人」と書いた以上、101人目に β 価格で売ってはいけない。
// 人が数えるとずれるので、売る直前に数える。
//
// ── 特商法が揃うまで始めない ──────────────────────
// 自動更新のある取引は、表記の要件が単発より多い（更新時期・解約方法）。
// 揃っていないと legal.ts が止める。

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  if (!passEnabled) {
    return NextResponse.json(
      { error: "月額のお申し込みは、まだ受け付けていません" },
      { status: 503 },
    );
  }
  if (!readyToSell()) {
    return NextResponse.json(
      { error: NOT_READY_USER, detail: whyNotReady() },
      { status: 503 },
    );
  }
  if (!canCharge()) {
    return NextResponse.json({ error: whyCannotCharge() }, { status: 503 });
  }

  let body: { userToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const userToken = typeof body.userToken === "string" ? body.userToken.trim() : "";
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(userToken)) {
    return NextResponse.json({ error: "鍵の形が違います" }, { status: 400 });
  }

  // 答えられる人がいないのに売らない。
  // 月額には「月1回、実在する女性3人に確カメる」が含まれる。
  // 届けられない月が混じると、返金では済まない。
  const sup = await supply(PANEL_SIZE);
  if (!sup.open) {
    return NextResponse.json(
      { error: shortMessage(sup, PANEL_SIZE), waitlist: true },
      { status: 409 },
    );
  }

  // 既に入っている人を、二重に契約させない。
  const live = await dbSelect<{ id: string; status: string; stripe_customer_id: string | null }>(
    `subscriptions?user_token=eq.${encodeURIComponent(userToken)}` +
      `&status=in.(trialing,active,past_due)&select=id,status,stripe_customer_id&limit=1`,
  );
  if (live[0]) {
    return NextResponse.json(
      { error: "すでにご利用中です", manage: "/api/pass/portal" },
      { status: 409 },
    );
  }

  // 前に解約した人の Customer を引き継ぐ。
  // 分かれると、Customer Portal からまとめて管理できなくなる。
  const past = await dbSelect<{ stripe_customer_id: string | null }>(
    `subscriptions?user_token=eq.${encodeURIComponent(userToken)}` +
      `&select=stripe_customer_id&order=updated_at.desc&limit=1`,
  );

  const s = await seats();
  const base = site.url.replace(/\/$/, "");

  const r = await createPassCheckout({
    userToken,
    beta: s.beta,
    customerId: past[0]?.stripe_customer_id ?? undefined,
    successUrl: `${base}/mine?pass=1`,
    cancelUrl: `${base}/plans?canceled=1`,
    // 押し直しても契約は1つ。枠の状態を混ぜるのは、
    // 枠が変わったら別の申し込みとして扱うため。
    idempotencyKey: `pass_${userToken}_${s.beta ? "beta" : "std"}`,
  });

  if (!r.ok || !r.session) {
    return NextResponse.json(
      { error: r.error ?? "決済を開始できませんでした" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    url: r.session.url,
    yen: s.yen,
    beta: s.beta,
    seatsLeft: s.left,
  });
}
