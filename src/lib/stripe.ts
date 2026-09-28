// Stripe。
//
// ── SDK を入れない ────────────────────────────────
// このリポジトリは Supabase も SDK 無しの fetch で叩いている。
// 同じ形にそろえる。edge runtime でも動き、依存も増えない。
//
// ── 金額はここに来ない ────────────────────────────
// 呼ぶ側はプランIDだけを渡す。金額は plans.ts から引く。
// 画面から金額を受け取る経路を、どこにも作らない。
//
// ── 署名の検証を飛ばさない ────────────────────────
// Webhook は誰でも叩ける。署名を確かめずに支払い済みにすると、
// 「決済した」と言い張るだけで回答者に配られる。

const KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeEnabled = Boolean(KEY);

const API = "https://api.stripe.com/v1";

/** application/x-www-form-urlencoded に落とす。Stripe はこれしか受けない */
function form(obj: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) p.set(k, String(v));
  }
  return p.toString();
}

async function call<T>(
  path: string,
  body: Record<string, string | number | undefined>,
  idempotencyKey?: string,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  if (!KEY) return { ok: false, error: "stripe not configured" };
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // 同じ鍵で二度叩いても、二重に課金されない。
        // 通信が切れて画面側が押し直したときに効く。
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: form(body),
    });
    const data = (await res.json()) as T & { error?: { message?: string } };
    if (!res.ok) {
      const msg = data?.error?.message ?? `stripe ${res.status}`;
      console.error("[stripe]", path, msg);
      return { ok: false, error: msg };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "stripe failed" };
  }
}

export type CheckoutSession = {
  id: string;
  url: string;
  payment_intent: string | null;
};

/**
 * Checkout を1つ作る。
 *
 * 金額と商品名は呼ぶ側（サーバー）が決めた値だけを受け取る。
 * consultationToken を metadata と client_reference_id の両方に入れるのは、
 * Webhook でどちらか片方しか来ない形になっても拾えるようにするため。
 */
export type CheckoutArgs = {
  yen: number;
  name: string;
  description: string;
  consultationToken: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
};

/**
 * Checkout に渡す中身。
 *
 * 組み立てを関数に出しているのは、ビルド時に中身を確かめるため。
 * 以前は createCheckout.toString() を正規表現で見ていたが、
 * 本番ビルドでは最小化で空白が消えるので、文字列を当てにできない。
 * 値そのものを見る。
 */
export function checkoutParams(args: CheckoutArgs): Record<string, string | number> {
  return {
    mode: "payment",
    "line_items[0][quantity]": 1,
    // 円は zero-decimal。100倍しない。
    "line_items[0][price_data][currency]": "jpy",
    "line_items[0][price_data][unit_amount]": args.yen,
    "line_items[0][price_data][product_data][name]": args.name,
    "line_items[0][price_data][product_data][description]": args.description,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    client_reference_id: args.consultationToken,
    "metadata[consultation_token]": args.consultationToken,
    // 支払いが終わらないまま放置されたものを、いつまでも残さない。
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    locale: "ja",
  };
}

export async function createCheckout(
  args: CheckoutArgs,
): Promise<{ ok: boolean; session?: CheckoutSession; error?: string }> {
  const r = await call<CheckoutSession>(
    "/checkout/sessions",
    checkoutParams(args),
    args.idempotencyKey,
  );
  return { ok: r.ok, session: r.data, error: r.error };
}

/**
 * Checkout の結果を、Stripe に直接聞く。
 *
 * ── なぜ要るか ────────────────────────────────────
 * 支払いが済んだのに「確認しています」と待たせるのをやめたい。
 * かといって success_url を信じるわけにはいかない（URLは手で叩ける）。
 *
 * だから、戻ってきた時点で Stripe に聞く。
 * Stripe が paid と言ったら、その場で配信を始めてよい。
 * Webhook は取りこぼしの受け皿として残す（どちらから来ても
 * 同じ処理が1回だけ走るようにしてある）。
 */
export async function retrieveCheckout(
  sessionId: string,
): Promise<{ ok: boolean; session?: CheckoutSession & {
  payment_status?: string;
  status?: string;
  amount_total?: number;
  currency?: string;
  payment_intent?: string | null;
  client_reference_id?: string | null;
}; error?: string }> {
  if (!KEY) return { ok: false, error: "stripe not configured" };
  try {
    const res = await fetch(`${API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${KEY}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message ?? `stripe ${res.status}`;
      console.error("[stripe] retrieve", msg);
      return { ok: false, error: msg };
    }
    return { ok: true, session: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "stripe failed" };
  }
}

export async function refund(
  paymentIntentId: string,
  idempotencyKey: string,
  amountYen?: number,
): Promise<{ ok: boolean; error?: string }> {
  const r = await call<{ id: string }>(
    "/refunds",
    { payment_intent: paymentIntentId, amount: amountYen },
    idempotencyKey,
  );
  return { ok: r.ok, error: r.error };
}

/* ── Webhook の署名 ──────────────────────────────
   Stripe-Signature: t=<秒>,v1=<HMAC-SHA256(t + "." + body)>
   これを確かめずに支払い済みにすると、
   誰でも「決済した」と言えることになる。 */

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

/** 長さが同じでも、内容の比較で時間差を作らない */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * 署名を確かめる。
 * 古い通知を投げ直されないよう、時刻のずれも見る（既定5分）。
 */
export async function verifyWebhook(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSec = 300,
): Promise<{ ok: boolean; error?: string }> {
  if (!WEBHOOK_SECRET) return { ok: false, error: "webhook secret not configured" };
  if (!signatureHeader) return { ok: false, error: "no signature" };

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;

  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!t || !v1) return { ok: false, error: "malformed signature" };

  const age = Math.abs(Math.floor(Date.now() / 1000) - t);
  if (age > toleranceSec) return { ok: false, error: "signature too old" };

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${t}.${rawBody}`),
  );

  return timingSafeEqual(new Uint8Array(mac), hexToBytes(v1))
    ? { ok: true }
    : { ok: false, error: "signature mismatch" };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 通貨は日本円だけ。zero-decimal なので、金額をそのまま渡す。
  // ここを間違えると 1,980円 が 19.80円 や 198,000円 になる。
  // 実際に組み立てた中身を見る。最小化されても壊れない。
  const sample = checkoutParams({
    yen: 1980,
    name: "見本",
    description: "見本",
    consultationToken: "c".repeat(33),
    successUrl: "https://example.com/ok",
    cancelUrl: "https://example.com/ng",
    idempotencyKey: "sample",
  });

  if (sample["line_items[0][price_data][currency]"] !== "jpy") {
    throw new Error("通貨が jpy ではありません（円は zero-decimal です）");
  }
  // 円をそのまま渡していること。100倍していたら、1,980円が198,000円になる。
  if (sample["line_items[0][price_data][unit_amount]"] !== 1980) {
    throw new Error("Checkout の金額の渡し方が変わっています（円は100倍しない）");
  }
  // 相談の鍵が Webhook 側に届くこと。届かないと、払われても誰の分か分からない。
  if (!sample["metadata[consultation_token]"] || !sample.client_reference_id) {
    throw new Error("Checkout に相談の鍵が入っていません");
  }
  if (sample.mode !== "payment") {
    throw new Error("都度払いです。subscription にしないでください");
  }
}
