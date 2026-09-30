import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { isPlanId, plan } from "@/lib/ask/plans";
import { refundFor } from "@/lib/ask/shortfall";
import { refundTicket } from "@/lib/ask/pass";
import { refund as stripeRefund, stripeEnabled } from "@/lib/stripe";

// 人数が集まらなかったときの、相談者の選択を受け取る。
//
// ── 選ぶのは相談した人 ────────────────────────────
// こちらで勝手に返金も続行も決めない。
//
// ── 返金は二度出さない ────────────────────────────
// 同じ Idempotency-Key で出す。押し直しても1回。
//
// ── 「広げて続行」でお金は動かさない ──────────────
// 追加の請求はしない。条件をゆるめて、もう一度声をかけるだけ。

export const runtime = "edge";

type Row = {
  id: string;
  status: string;
  panel_size: number;
  product_type: string | null;
  price: number | null;
};

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いま受け付けられません" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = body.token;
  const choice = body.choice;
  if (!isConsultToken(token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }
  if (choice !== "partial" && choice !== "widen" && choice !== "full") {
    return NextResponse.json({ error: "選択が不正です" }, { status: 400 });
  }

  const rows = await dbSelect<Row>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id,status,panel_size,product_type,price`,
  );
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "この相談は見つかりません" }, { status: 404 });
  if (!["recruiting", "collecting"].includes(c.status)) {
    return NextResponse.json({ error: "この相談は募集中ではありません" }, { status: 409 });
  }

  const answers = await dbSelect<{ id: string }>(
    `responses?consultation_id=eq.${c.id}&select=id`,
  );
  const got = answers.length;
  const want = c.panel_size;
  const yen = c.price ?? (isPlanId(c.product_type) ? plan(c.product_type).yen : 0);

  // 条件を広げて続行。お金は動かさない。
  if (choice === "widen") {
    await dbUpdate("consultations", c.id, {
      panel_age: "any",
      panel_attrs: [],
      widened_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, widened: true });
  }

  // ── チケットで払った相談は、チケットで返す ──
  //
  // 5回パスの1回分に対して、お金を按分して返そうとすると
  // 「¥7,980 のうち ¥1,596 を返す」という話になり、
  // 何回分を使ったのかが残高と合わなくなる。
  //
  // 使った1回分を、そのまま戻す。
  // 消さずに、打ち消す行を足す（refund_pass）。
  const usedTicket = await dbSelect<{ id: string }>(
    `pass_uses?consultation_id=eq.${c.id}&select=id&limit=1`,
  );
  if (usedTicket.length > 0) {
    const r = await refundTicket(
      c.id,
      choice === "full" ? "集まらなかったので全部返した" : "足りなかった分を返した",
    );
    if (!r.ok) {
      return NextResponse.json({ error: r.why ?? "戻せませんでした" }, { status: 502 });
    }
    await dbUpdate("consultations", c.id, {
      // 全部返したら、届いた回答も見せない。部分なら、届いた分で締める。
      status: choice === "full" ? "refunded" : "completed",
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({
      ok: true,
      // お金ではなく回数で返したことを、そのまま伝える
      tickets: r.refunded,
      remaining: r.remaining,
    });
  }

  const back = choice === "full" ? yen : refundFor(yen, got, want);
  if (back <= 0) {
    return NextResponse.json({ error: "お返しする分がありません" }, { status: 409 });
  }

  const pays = await dbSelect<{ id: string; stripe_payment_intent_id: string | null }>(
    `payments?consultation_id=eq.${c.id}&payment_status=eq.paid&select=id,stripe_payment_intent_id&limit=1`,
  );
  const pay = pays[0];
  if (!pay?.stripe_payment_intent_id || !stripeEnabled) {
    return NextResponse.json({ error: "返金の設定が入っていません" }, { status: 503 });
  }

  // 押し直しても1回。
  const r = await stripeRefund(
    pay.stripe_payment_intent_id,
    `shortfall_${c.id}_${choice}`,
    back,
  );
  if (!r.ok) {
    return NextResponse.json({ error: r.error ?? "返金できませんでした" }, { status: 502 });
  }

  await dbUpdate("payments", pay.id, {
    payment_status: choice === "full" ? "refunded" : "partially_refunded",
    refunded_at: new Date().toISOString(),
  });
  await dbUpdate("consultations", c.id, {
    // 全額返したら、届いた回答も見せない。部分なら、届いた分で締める。
    status: choice === "full" ? "refunded" : "completed",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, refunded: back });
}
