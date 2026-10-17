import { NextRequest, NextResponse } from "next/server";
import { passEnabled, createTripCheckout } from "@/lib/stripe";
import { makeTalkerToken, isTalkerToken } from "@/lib/token";
import { site } from "@/lib/site";
import { TRIP_PASS_YEN, YEAR_PASS_YEN } from "@/lib/pass/trip";

export const runtime = "edge";

/* 旅パスを買う口。
 *
 * ── 商品は2つだけ ──────────────────────────────
 * マチアプ版は7つあった。旅版は旅パスと年パス。
 * 画面から商品IDを受け取らず、どちらかだけを選ばせる。
 * 受け取る形にすると、値段を画面から決められてしまう。
 *
 * ── 値段はここで決めない ────────────────────────
 * Stripe の Price ID が正。金額は lib/pass/trip.ts が
 * 採算の判定のために持っているだけで、請求には使わない。
 * 二重に持つと、片方だけ動いた日に食い違う。 */

type Kind = "trip" | "year";

const PRICE: Record<Kind, string | undefined> = {
  trip: process.env.STRIPE_TRIP_PRICE_ID,
  year: process.env.STRIPE_YEAR_PRICE_ID,
};

export async function POST(req: NextRequest) {
  if (!passEnabled) {
    return NextResponse.json({ error: "いまはお申し込みを受け付けていません。" }, { status: 503 });
  }

  let body: { kind?: unknown; token?: unknown };
  try {
    body = (await req.json()) as { kind?: unknown; token?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const kind: Kind = body.kind === "year" ? "year" : "trip";
  const price = PRICE[kind];
  if (!price) {
    return NextResponse.json({ error: "いまはお申し込みを受け付けていません。" }, { status: 503 });
  }

  /* 旅人の鍵。無ければ発行する。
     会員登録が無いので、これが戻り先と本人の結び目になる。 */
  const token: string = isTalkerToken(body.token) ? (body.token as string) : makeTalkerToken();

  const r = await createTripCheckout({
    price,
    kind,
    token,
    successUrl: `${site.url}/tabi/${token}?paid=1`,
    cancelUrl: `${site.url}/plans`,
  });
  if (!r.ok || !r.url) {
    console.error("[checkout] failed", r.error);
    return NextResponse.json({ error: "いま手続きを始められませんでした。" }, { status: 502 });
  }
  return NextResponse.json({ url: r.url, token });
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 金額を、この口で決めないこと。Stripe の Price ID が正
  for (const [k, v] of Object.entries({ TRIP_PASS_YEN, YEAR_PASS_YEN })) {
    if (typeof v !== "number") throw new Error(`${k} が数ではありません`);
  }
}
