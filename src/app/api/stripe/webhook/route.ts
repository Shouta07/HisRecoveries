// Stripe Webhook — 入金の確定をここで受ける。
//
// このサイトで唯一の「認証なしで叩ける決済系エンドポイント」。守り方：
//  1. 署名検証（constructEvent）。生ボディでしか通らない。JSONパースは検証の後。
//  2. タイムスタンプ許容5分。古いリクエストは弾く＝リプレイ防止。
//  3. 冪等。同じ session が二度来ても paid は1回しか立たない
//     （markOrderPaid の filter に status=neq.paid が入っている）。
//  4. 検証に失敗したものは 400 を返して何も書かない。
//  5. 署名が通ったあとも、金額・通貨・payment_status を自分で確かめる。
//
// なお成果の反映は「席の消費」だけで、メール送付などの副作用はここに置かない
// （失敗時の再送で二重送信になるため。連絡は管理画面から人が行う）。

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, stripeWebhookEnabled } from "@/lib/stripe";
import { findOrderBySession, markOrderPaid, markOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!stripeWebhookEnabled) {
    // 未設定のまま公開されても、何も受け付けない。
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  // 生のボディ。req.json() を先に呼ぶと署名検証が通らなくなる。
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(raw, signature);
  } catch (e) {
    console.error("[stripe:webhook] signature verification failed", e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 署名が通っても内容は自分で確かめる。
        if (session.payment_status !== "paid") break;
        if (session.currency !== "jpy") {
          console.error("[stripe:webhook] unexpected currency", session.currency);
          break;
        }

        const known = await findOrderBySession(session.id);
        if (!known) {
          // 管理画面を通さずに作られたセッション。記録だけ残して人が見る。
          console.error("[stripe:webhook] unknown session paid", session.id);
          break;
        }
        if (known.status === "paid") break; // 冪等：すでに反映済み

        await markOrderPaid(session.id, {
          stripe_payment_intent:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          stripe_event_id: event.id,
          amount: session.amount_total ?? known.amount,
          email: session.customer_details?.email ?? known.email,
          paid_at: new Date(event.created * 1000).toISOString(),
        });
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        // 期限切れは枠を返す（issued のまま残さない）。
        const known = await findOrderBySession(session.id);
        if (known && known.status === "issued") {
          await markOrderStatus(session.id, "expired");
        }
        break;
      }

      case "charge.refunded":
      case "charge.dispute.created": {
        // 返金・チャージバックは自動処理しない。人が確認する。
        console.error(`[stripe:webhook] needs review: ${event.type}`, event.id);
        break;
      }

      default:
        break;
    }
  } catch (e) {
    // ここで 500 を返すと Stripe が再送してくれる（＝取りこぼさない）。
    console.error("[stripe:webhook] handler failed", event.type, e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
