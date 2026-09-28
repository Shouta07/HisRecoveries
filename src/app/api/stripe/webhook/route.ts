import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { verifyWebhook } from "@/lib/stripe";
import { fulfil, paymentBySession, type Payment } from "@/lib/ask/fulfil";

// Stripe からの通知。
//
// ── 署名を確かめてから、何もかも ──────────────────
// この口は誰でも叩ける。署名を見ずに支払い済みにすると、
// 「決済した」と言い張るだけで回答者に配られる。
// 本文を読む前に、まず署名。
//
// ── success_url は信用しない。ただし待たせもしない ──
// URL は手で叩けるので、戻ってきたこと自体は何の証拠にもならない。
// かわりに、戻ってきた時点で Stripe に直接聞く（retrieveCheckout）。
// Stripe が paid と言えば、その場で配りはじめてよい。
//
// この Webhook は取りこぼしの受け皿。
// どちらから来ても fulfil() が1回だけ走る。
//
// ── 同じ通知が二度来る前提で書く ────────────────
// Stripe は再送する。同じ session を二度処理しても、
// 二重に配らない・二重に記録しないようにする。

export const runtime = "edge";

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
      if (pay) await fulfil(pay, obj.payment_intent ?? null);
      break;
    }

    case "payment_intent.succeeded": {
      // session 経由で拾えていれば済んでいる。取りこぼし用。
      const rows = await dbSelect<Payment>(
        `payments?stripe_payment_intent_id=eq.${encodeURIComponent(obj.id)}&select=id,consultation_id,payment_status&limit=1`,
      );
      if (rows[0]) await fulfil(rows[0], obj.id);
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
