import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbInsertReturning, dbAdminEnabled } from "@/lib/db";
import { verifyWebhook } from "@/lib/stripe";
import { makeReplyToken } from "@/lib/ask/token";

// Stripe からの通知。
//
// ── 署名を確かめてから、何もかも ──────────────────
// この口は誰でも叩ける。署名を見ずに支払い済みにすると、
// 「決済した」と言い張るだけで回答者に配られる。
// 本文を読む前に、まず署名。
//
// ── success_url を信用しない ──────────────────────
// 決済の成立を決めるのはこの Webhook だけ。
// 画面側の success_url は「たぶん終わった」以上の意味を持たせない。
// URL は手で叩けるので、そこで配り始めてはいけない。
//
// ── 同じ通知が二度来る前提で書く ────────────────
// Stripe は再送する。同じ session を二度処理しても、
// 二重に配らない・二重に記録しないようにする。

export const runtime = "edge";

type Payment = {
  id: string;
  consultation_id: string;
  payment_status: string;
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_intent?: string | null;
      client_reference_id?: string | null;
      metadata?: Record<string, string>;
      amount_refunded?: number;
    };
  };
};

async function paymentBySession(sessionId: string): Promise<Payment | null> {
  const rows = await dbSelect<Payment>(
    `payments?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}&select=id,consultation_id,payment_status&limit=1`,
  );
  return rows[0] ?? null;
}

/**
 * 支払いが確定したので、ここで初めて回答者へ配る準備をする。
 * 既に配っていたら何もしない（再送で二重に作らない）。
 */
async function onPaid(pay: Payment, intentId: string | null) {
  if (pay.payment_status === "paid") return; // 再送。何もしない

  await dbUpdate("payments", pay.id, {
    payment_status: "paid",
    stripe_payment_intent_id: intentId,
    paid_at: new Date().toISOString(),
  });

  const cs = await dbSelect<{
    id: string;
    panel_size: number;
    status: string;
    needs_review: boolean | null;
  }>(
    `consultations?id=eq.${pay.consultation_id}&select=id,panel_size,status,needs_review`,
  );
  const c = cs[0];
  if (!c) return;

  // 依頼が既にあるなら作り直さない。
  const already = await dbSelect<{ id: string }>(
    `response_invites?consultation_id=eq.${c.id}&select=id&limit=1`,
  );
  if (already.length === 0) {
    const invites = Array.from({ length: c.panel_size }, () => ({
      consultation_id: c.id,
      token: makeReplyToken(),
    }));
    await dbInsertReturning("response_invites", invites as unknown as Record<string, unknown>);
  }

  // 画像つきの相談は、払われても自動では配らない。
  // 人が見てから募集に進む（model.ts の needsReview を参照）。
  await dbUpdate("consultations", c.id, {
    status: c.needs_review ? "review" : "recruiting",
    paid_at: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  // 署名の検証には、加工していない本文が要る。
  const raw = await req.text();
  const v = await verifyWebhook(raw, req.headers.get("stripe-signature"));
  if (!v.ok) {
    // 何が違ったかは返さない。総当たりの手がかりにさせない。
    console.error("[stripe:webhook] rejected:", v.error);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (!dbAdminEnabled) {
    // 200 を返さないと Stripe が再送し続ける。
    // ただし処理はしていないので、その旨を記録する。
    console.error("[stripe:webhook] db not configured; event dropped");
    return NextResponse.json({ received: true, handled: false });
  }

  let ev: StripeEvent;
  try {
    ev = JSON.parse(raw) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const obj = ev.data?.object;

  switch (ev.type) {
    case "checkout.session.completed": {
      const pay = await paymentBySession(obj.id);
      if (pay) await onPaid(pay, obj.payment_intent ?? null);
      break;
    }

    case "payment_intent.succeeded": {
      // session 経由で拾えていれば済んでいる。取りこぼし用。
      const rows = await dbSelect<Payment>(
        `payments?stripe_payment_intent_id=eq.${encodeURIComponent(obj.id)}&select=id,consultation_id,payment_status&limit=1`,
      );
      if (rows[0]) await onPaid(rows[0], obj.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const rows = await dbSelect<Payment>(
        `payments?stripe_payment_intent_id=eq.${encodeURIComponent(obj.id)}&select=id,consultation_id,payment_status&limit=1`,
      );
      if (rows[0]) {
        await dbUpdate("payments", rows[0].id, { payment_status: "failed" });
        // 相談は消さない。同じ内容で払い直せるようにしておく。
        await dbUpdate("consultations", rows[0].consultation_id, { status: "draft" });
      }
      break;
    }

    case "charge.refunded": {
      const pi = obj.payment_intent;
      if (pi) {
        const rows = await dbSelect<Payment>(
          `payments?stripe_payment_intent_id=eq.${encodeURIComponent(pi)}&select=id,consultation_id,payment_status&limit=1`,
        );
        if (rows[0]) {
          await dbUpdate("payments", rows[0].id, {
            payment_status: "refunded",
            refunded_at: new Date().toISOString(),
          });
          // 返金したものを募集したままにしない。
          await dbUpdate("consultations", rows[0].consultation_id, { status: "refunded" });
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const pay = await paymentBySession(obj.id);
      if (pay && pay.payment_status === "pending") {
        await dbUpdate("payments", pay.id, { payment_status: "expired" });
        // 払われていないので、下書きに戻す。配っていないので取り消しではない。
        await dbUpdate("consultations", pay.consultation_id, { status: "draft" });
      }
      break;
    }

    default:
      // 知らない種類は素通しする。200 を返さないと再送され続ける。
      break;
  }

  return NextResponse.json({ received: true });
}
