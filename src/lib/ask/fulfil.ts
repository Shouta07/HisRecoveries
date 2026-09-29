import { dbSelect, dbUpdate, dbInsertReturning } from "@/lib/db";
import { makeReplyToken, makeConsultToken } from "@/lib/ask/token";
import { waves } from "@/lib/economics";
import { isPlanId, plan, priceOf } from "@/lib/ask/plans";

// 支払いが済んだあと、回答者に配りはじめる。
//
// ══════════════════════════════════════════════════
// ここが2か所から呼ばれる
// ══════════════════════════════════════════════════
//   1. 決済から戻ってきた瞬間（Stripe に直接聞いて paid だったとき）
//   2. Webhook（取りこぼしの受け皿）
//
// どちらから来ても、同じ処理が1回だけ走るようにする。
// 二度目は payments.payment_status を見て、すぐ帰る。
//
// ══════════════════════════════════════════════════
// 「確認しています」で待たせない
// ══════════════════════════════════════════════════
// 支払いが済んでいるのに待たせるのは、ただ遅いだけ。
// かといって success_url を信じるわけにはいかない（URLは手で叩ける）。
// だから戻ってきた時点で Stripe に聞いて、paid ならその場で配る。
//
// ══════════════════════════════════════════════════
// 最初から全員に声をかけない
// ══════════════════════════════════════════════════
// 5人ほしいからといって、50人へ一斉に通知しない。
// 通知が当たり前になると、回答者は通知を見なくなる。
// まず 8人。2分待って足りなければ足す（economics.ts の waves）。
//
// 報酬が発生するのは採用した回答に対してだけ。
// 声をかけた人数分を先に確定させない。

export type Payment = {
  id: string;
  consultation_id: string;
  payment_status: string;
};

export type FulfilResult =
  | { ok: true; already: boolean }
  | { ok: false; why: string };

/**
 * 支払い済みとして記録し、1波目の依頼を作る。
 * 何度呼んでも、配るのは1回だけ。
 */
export async function fulfil(pay: Payment, intentId: string | null): Promise<FulfilResult> {
  // 再送・二重呼び出し。何もしない。
  if (pay.payment_status === "paid") return { ok: true, already: true };

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
    product_type: string | null;
  }>(
    `consultations?id=eq.${pay.consultation_id}&select=id,panel_size,status,needs_review,product_type`,
  );
  const c = cs[0];
  if (!c) return { ok: false, why: "相談が見つかりません" };

  // 1対1で話す商品は、人数を集めるものではない。依頼は作らない。
  const isTalk = isPlanId(c.product_type) && Boolean(plan(c.product_type).talk);

  // ── まとめ売り（5回パス）を買ったとき ──
  //
  // ここが抜けていると、払っても1回分も付かない。
  // 決済は通るのに何も持っていない、がいちばん悪い。
  //
  // 作るのは払いが確認できたあとだけ。
  // 先に作ると、決済をやめた人にも回数が残る。
  if (isPlanId(c.product_type) && plan(c.product_type).uses) {
    const uses = plan(c.product_type).uses!;
    // 同じ相談で二度作らない（Webhook は再送される）。
    const already = await dbSelect<{ id: string }>(
      `pass_uses?consultation_id=eq.${c.id}&select=id&limit=1`,
    );
    if (already.length === 0) {
      const passToken = makeConsultToken();
      const made = await dbInsertReturning<{ id: string }>("ask_passes", {
        token: passToken,
        plan_id: c.product_type,
        uses_total: uses,
        price: priceOf(c.product_type),
        stripe_payment_id: intentId,
        paid_at: new Date().toISOString(),
      });
      // 買ったその相談に、1回目を使う。
      // ここを飛ばすと、5回買って5回残ったまま1件目が配られる。
      const passId = made.rows[0]?.id;
      if (passId) {
        await dbInsertReturning("pass_uses", {
          pass_id: passId,
          consultation_id: c.id,
        } as unknown as Record<string, unknown>);
      }
    }
  }

  // 声で話す商品は、ここで通話の1件を作る。
  // 払う前には作らない（作れてしまうと、ただで部屋が取れる）。
  // 日時と担当は、このあと運営が決める。
  if (isPlanId(c.product_type) && plan(c.product_type).callMinutes) {
    const minutes = plan(c.product_type).callMinutes!;
    const exists = await dbSelect<{ id: string }>(
      `call_sessions?consultation_id=eq.${c.id}&select=id&limit=1`,
    );
    if (exists.length === 0) {
      await dbInsertReturning("call_sessions", {
        token: makeConsultToken(),
        consultation_id: c.id,
        plan_id: c.product_type,
        duration_minutes: minutes,
        price: priceOf(c.product_type),
        status: "waiting_assignment",
        stripe_payment_id: intentId,
        paid_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>);
    }
  }

  if (!isTalk) {
    // 既に作ってあるなら作り直さない。
    const already = await dbSelect<{ id: string }>(
      `response_invites?consultation_id=eq.${c.id}&select=id&limit=1`,
    );
    if (already.length === 0) {
      // 1波目だけ作る。足りなければ次の波で足す。
      const first = waves(c.panel_size)[0];
      const n = first?.n ?? c.panel_size;
      const invites = Array.from({ length: n }, () => ({
        consultation_id: c.id,
        token: makeReplyToken(),
        wave: 1,
      }));
      await dbInsertReturning(
        "response_invites",
        invites as unknown as Record<string, unknown>,
      );
    }
  }

  // 画像つきの相談は、払われても自動では配らない。
  // 人が見てから募集に進む（model.ts の needsReview を参照）。
  await dbUpdate("consultations", c.id, {
    status: c.needs_review ? "review" : "recruiting",
    paid_at: new Date().toISOString(),
  });

  return { ok: true, already: false };
}

/** Checkout のセッションIDから、対応する支払いを引く */
export async function paymentBySession(sessionId: string): Promise<Payment | null> {
  const rows = await dbSelect<Payment>(
    `payments?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}&select=id,consultation_id,payment_status&limit=1`,
  );
  return rows[0] ?? null;
}

/** 相談の鍵から、いちばん新しい支払いを引く */
export async function paymentByConsultation(
  consultationId: string,
): Promise<(Payment & { stripe_checkout_session_id: string | null }) | null> {
  const rows = await dbSelect<Payment & { stripe_checkout_session_id: string | null }>(
    `payments?consultation_id=eq.${consultationId}&select=id,consultation_id,payment_status,stripe_checkout_session_id&order=created_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}
