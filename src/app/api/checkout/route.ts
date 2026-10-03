import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbInsertReturning, dbAdminEnabled } from "@/lib/db";
import { plan, priceOf, formalName } from "@/lib/ask/plans";
import { isSellableNow, whyCannotSellCalls } from "@/lib/call/gate";
import { canCharge, whyCannotCharge } from "@/lib/legal";
import { supply, shortMessage } from "@/lib/supply";
import { createCheckout, stripeEnabled } from "@/lib/stripe";
import { isConsultToken } from "@/lib/ask/token";
import { site } from "@/lib/site";
import { readyToSell, whyNotReady, NOT_READY_USER } from "@/lib/ready";

// 決済を始める。
//
// ── 金額を受け取らない ────────────────────────────
// 画面から来るのは相談の鍵とプランIDだけ。
// 金額は plans.ts から引く。受け取る経路を作らない。
//
// ── 特商法が揃うまで始めない ──────────────────────
// 通信販売で対価を受け取るには表記が要る。
// 揃っていない状態で決済を開くと法令違反になるので、ここで止める。
//
// ── 二重に作らない ────────────────────────────────
// 同じ相談に対しては、同じ Idempotency-Key で作る。
// 通信が切れて押し直されても、課金は1回で済む。
//
// ── 決済が終わるまで配らない ──────────────────────
// ここでは status を payment_pending にするだけ。
// 回答者に配るのは、Webhook が支払いを確認してから。

export const runtime = "edge";

type Consult = { id: string; token: string; status: string; category: string };
type Payment = { id: string; stripe_checkout_session_id: string | null; payment_status: string };

export async function POST(req: NextRequest) {
  // 揃っていないものがあるなら、理由をそのまま返す。
  if (!canCharge()) {
    return NextResponse.json(
      { error: whyCannotCharge() ?? "いまは決済を受け付けていません", blocked: true },
      { status: 503 },
    );
  }
  // 揃っていないものは、相談の口（/api/consult）と同じ判定で見る。
  // 別々に書くと、片方だけ通って、もう片方で止まる
  if (!readyToSell()) {
    console.error("[checkout] not ready", whyNotReady());
    return NextResponse.json({ error: NOT_READY_USER, blocked: true }, { status: 503 });
  }
  if (!dbAdminEnabled || !stripeEnabled) {
    return NextResponse.json({ error: NOT_READY_USER, blocked: true }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = body.token;
  const planId = body.plan;
  if (!isConsultToken(token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }
  // 受付前のプラン（対面を含むもの）では決済を作らない。
  // 作れてしまうと、届けられない約束に対して課金することになる。
  if (!isSellableNow(planId)) {
    // 通話の商品なら、何が足りないのかをそのまま返す。
    // 「受け付けていません」だけだと、待てばよいのか諦めるのかが分からない。
    const why = typeof planId === "string" && planId.startsWith("call")
      ? whyCannotSellCalls()
      : null;
    return NextResponse.json(
      { error: why ?? "このプランはいま受け付けていません" },
      { status: 400 },
    );
  }

  const cs = await dbSelect<Consult>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id,token,status,category`,
  );
  const c = cs[0];
  if (!c) return NextResponse.json({ error: "この相談は見つかりません" }, { status: 404 });

  // もう払い終わっているものに、もう一度決済を作らない。
  if (!["draft", "payment_pending"].includes(c.status)) {
    return NextResponse.json(
      { error: "この相談はすでに受け付けています" },
      { status: 409 },
    );
  }

  const p = plan(planId);

  const yen = priceOf(planId);
  const answers = p.answers;

  // 答えられる人がいないのに売らない。
  // 決済だけ通って誰にも届かないのが、いちばん信用を失う。
  // 返金すれば済む話ではない。
  const sup = await supply(answers);
  if (!sup.open) {
    return NextResponse.json(
      { error: shortMessage(sup, answers), waitlist: true },
      { status: 409 },
    );
  }

  // 作りかけの決済が残っていれば、それを返す。新しく作らない。
  const existing = await dbSelect<Payment>(
    `payments?consultation_id=eq.${c.id}&payment_status=eq.pending&select=id,stripe_checkout_session_id,payment_status&limit=1`,
  );

  const base = site.url.replace(/\/$/, "");
  // ══════════════════════════════════════════════
  // 明細に「女性N人」と書かない
  // ══════════════════════════════════════════════
  // カードの明細と Stripe の画面に出るのは、この2行だけ。
  // 「実在の女性1人の反応」と書くと、女性1人ぶんを
  // 買ったように読める。売っているのは当社の相談サービスで、
  // 女性の反応はその提供工程の一部。
  //
  // 実態（B2C）と、決済に出る文言を、同じにしておく。
  const r = await createCheckout({
    yen,
    // 明細・領収書・審査で読める形（plans.ts の formalName）
    name: formalName(planId),
    description: `販売者: ${site.company.name} / 提供: オンライン。${
      p.uses ? `${p.uses}回分。` : ""
    }このお申し込みは1回かぎりで、自動更新されません。`,
    consultationToken: c.token,
    successUrl: `${base}/ask/${c.token}?paid=1`,
    cancelUrl: `${base}/ask/${c.token}?canceled=1`,
    // 相談1件につき1つの鍵。押し直しても課金は1回。
    idempotencyKey: `consult_${c.id}_${planId}`,
  });

  if (!r.ok || !r.session) {
    return NextResponse.json({ error: r.error ?? "決済を開始できませんでした" }, { status: 502 });
  }

  // 決済の記録を残す。ここではまだ pending。
  if (existing[0]) {
    await dbUpdate("payments", existing[0].id, {
      stripe_checkout_session_id: r.session.id,
      amount: yen,
    });
  } else {
    await dbInsertReturning("payments", {
      consultation_id: c.id,
      stripe_checkout_session_id: r.session.id,
      amount: yen,
      currency: "jpy",
      payment_status: "pending",
      provider: "stripe",
    });
  }

  await dbUpdate("consultations", c.id, {
    status: "payment_pending",
    product_type: planId,
    price: yen,
    panel_size: answers,
  });

  return NextResponse.json({ ok: true, url: r.session.url });
}
