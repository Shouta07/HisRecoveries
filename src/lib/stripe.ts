// Stripe — サーバー専用。決済まわりの設計方針は docs/PAYMENTS_SECURITY.md。
//
// 要点だけ先に：
//  1. カード情報は一切こちらを通らない（Stripe Checkout のホスト画面で入力）。
//     したがって PCI DSS の適用範囲は SAQ-A に収まる。
//  2. 金額はサーバーが決める。クライアントから金額を受け取らない。
//  3. 決済セッションを作れるのは管理画面（Basic 認証の内側）だけ。
//     公開エンドポイントは Webhook のみで、そこは署名検証で守る。
//  4. 秘密鍵は NEXT_PUBLIC_ を付けない。付いていたら起動時に落とす。
//
// 環境変数が未設定でもビルド・表示が壊れないようにする（既存の db.ts と同じ方針）。

import Stripe from "stripe";
import { TIERS, type TierId } from "@/lib/pricing";

const SECRET = process.env.STRIPE_SECRET_KEY ?? "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** 価格は Stripe 側の Price を正とする。未設定なら金額指定にフォールバック。 */
const PRICE_IDS: Record<TierId, string> = {
  founder: process.env.STRIPE_PRICE_FOUNDER ?? "",
  standard: process.env.STRIPE_PRICE_STANDARD ?? "",
};

export const stripeEnabled = Boolean(SECRET);
export const stripeWebhookEnabled = Boolean(SECRET && WEBHOOK_SECRET);
export const stripeLiveMode = SECRET.startsWith("sk_live_");

/**
 * 秘密鍵が公開バンドルに漏れていないかを確認する。
 * NEXT_PUBLIC_ が付いた変数は必ずクライアントに埋め込まれるので、
 * そこに sk_ / whsec_ が入っていたら即座に落とす（黙って動かさない）。
 */
function assertNoLeakedSecrets() {
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("NEXT_PUBLIC_") || typeof value !== "string") continue;
    if (value.startsWith("sk_") || value.startsWith("rk_") || value.startsWith("whsec_")) {
      throw new Error(
        `[stripe] ${key} に秘密鍵が入っています。NEXT_PUBLIC_ はクライアントに露出します。`
      );
    }
  }
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!stripeEnabled) {
    throw new Error("[stripe] STRIPE_SECRET_KEY is not configured");
  }
  assertNoLeakedSecrets();
  if (!client) {
    client = new Stripe(SECRET, {
      // 障害時に握りつぶさず、短いリトライだけ行う
      maxNetworkRetries: 2,
      timeout: 20_000,
      telemetry: false,
      appInfo: { name: "His Recoveries", url: "https://hisrecoveries.com" },
    });
  }
  return client;
}

export type IssueParams = {
  tier: TierId;
  /** 送付先。Checkout の宛先プリフィルとレシート送付に使う。 */
  email: string;
  /** 表示用の呼び名（ニックネーム可） */
  name?: string;
  /** 実施予定日（YYYY-MM-DD）。当日の枠を押さえるための控え。 */
  scheduledFor?: string;
  /** 運用メモ。顧客には出ない。 */
  note?: string;
  /** 冪等キー。同じキーで2回叩いても決済は1つしか作られない。 */
  idempotencyKey: string;
  /** 戻り先のオリジン（https://hisrecoveries.com など） */
  origin: string;
};

/**
 * Checkout Session を1件つくり、支払いページのURLを返す。
 *
 * 顧客に渡すのはこのURLだけ。URLは推測できず、expires_at で失効する。
 * 金額は Price ID（無ければ TIERS の定義）から取り、引数では受け取らない。
 */
export async function createCheckoutSession(p: IssueParams): Promise<{
  id: string;
  url: string;
  amount: number;
  expiresAt: number;
}> {
  const tier = TIERS[p.tier];
  const priceId = PRICE_IDS[p.tier];

  // Checkout の有効期限。最短30分・最長30日。ここでは3日。
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = priceId
    ? { price: priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "jpy",
          unit_amount: tier.amount, // JPY はゼロ十進通貨。円をそのまま渡す。
          tax_behavior: "inclusive", // 表示価格は税込
          product_data: {
            name: `第一印象改善プラン（30日）`,
            description:
              "カウンセリング／改善プランの作成／オフライン体験（東京都内・土日・1日）／納品物6点（手順動画・眉の型・服のサイズ表・オーダー資料・写真・改善プラン）／30日間の質問窓口",
          },
        },
      };

  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      locale: "ja",
      currency: "jpy",
      line_items: [lineItem],
      customer_email: p.email,
      expires_at: expiresAt,
      // 領収書は Stripe から自動送信させる（こちらでPDFを持たない）
      payment_intent_data: {
        description: `第一印象改善プラン（${tier.label}）`,
        metadata: {
          tier: p.tier,
          scheduled_for: p.scheduledFor ?? "",
        },
      },
      metadata: {
        tier: p.tier,
        display_name: p.name ?? "",
        scheduled_for: p.scheduledFor ?? "",
        note: p.note ?? "",
      },
      // 規約・キャンセル条件への同意を Stripe 側でも取る
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "お支払い後のキャンセル・返金はお受けできません（実施者の日程と会場を確保するためです）。日程の変更は実施日の1週間前まで承ります。",
        },
        submit: {
          message:
            "お支払いの確認後、実施日が確定します。ご連絡用のLINEは、このあとメールでご案内します。",
        },
      },
      success_url: `${p.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${p.origin}/checkout/canceled`,
    },
    { idempotencyKey: p.idempotencyKey }
  );

  if (!session.url) {
    throw new Error("[stripe] checkout session has no url");
  }
  return {
    id: session.id,
    url: session.url,
    amount: session.amount_total ?? tier.amount,
    expiresAt,
  };
}

/** 成功ページ用。クライアントの申告を信じず、Stripe に問い合わせて確認する。 */
export async function retrieveSession(id: string): Promise<Stripe.Checkout.Session | null> {
  if (!stripeEnabled) return null;
  // session_id は URL から来る。形式を確かめてから投げる。
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return null;
  try {
    return await stripe().checkout.sessions.retrieve(id);
  } catch {
    return null;
  }
}

/**
 * Webhook の署名検証。
 * 生のリクエストボディ（パース前の文字列）でなければ検証は通らない。
 * tolerance で古いリクエストを弾き、リプレイ攻撃を防ぐ。
 */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  if (!stripeWebhookEnabled) {
    throw new Error("[stripe] webhook secret is not configured");
  }
  return stripe().webhooks.constructEvent(
    rawBody,
    signature,
    WEBHOOK_SECRET,
    // 署名の許容ずれ：5分（既定値と同じだが、意図として明示しておく）
    300
  );
}
