import { site } from "./site";
import { PLANS } from "./ask/plans";

// 特定商取引法に基づく表記。
//
// ── なぜこれが決済のゲートになるか ────────────────
// 通信販売で対価を受け取るには、この表記が要る（特商法11条）。
// 揃っていない状態で決済ボタンを出すと、法令違反になる。
//
// なので「表記が揃っているか」を1か所で判定して、
// 決済を作る API と、画面の決済ボタンの両方がここを見る。
// 揃うまでは、決済そのものが始まらない。
//
// ── 空欄を、それらしく埋めない ────────────────────
// 「準備中」と書いた電話番号は、書いていないのと同じ。
// 足りないものは足りないと出して、決済を止める。

export type LegalField = {
  key: string;
  label: string;
  /** 揃っていない項目は null のまま。埋めたら値を入れる */
  value: string | null;
  /** これが無いと決済できないか */
  required: boolean;
};

/**
 * 表記の中身。
 *
 * ── まだ無いもの ─────────────────────────
 * 代表者名 と 電話番号。この2つが入れば決済を開けられる。
 * 社名・所在地・メール・価格は site.ts に既にある。
 */
export const LEGAL: LegalField[] = [
  { key: "seller", label: "販売事業者", value: site.company.name, required: true },
  // ▼ ここに代表者名を入れてください（例: "山本 翔太"）
  { key: "rep", label: "代表者", value: null, required: true },
  {
    key: "address",
    label: "所在地",
    value: `${site.company.postalCode} ${site.company.address}`,
    required: true,
  },
  // ▼ ここに電話番号を入れてください（例: "03-0000-0000"）
  //    請求があったら遅滞なく開示する運用にする場合も、番号自体は必要です。
  { key: "tel", label: "電話番号", value: null, required: true },
  { key: "email", label: "メールアドレス", value: site.company.email, required: true },
  {
    key: "price",
    label: "販売価格",
    value: PLANS.map((p) => `${p.name} ${p.yen.toLocaleString()}円`).join(" / ") + "（税込）",
    required: true,
  },
  {
    key: "extra",
    label: "商品代金以外の必要料金",
    value: "なし（通信にかかる費用はお客様のご負担となります）",
    required: true,
  },
  { key: "pay_method", label: "支払方法", value: "クレジットカード（Stripe）", required: true },
  { key: "pay_time", label: "支払時期", value: "ご注文時に決済が確定します", required: true },
  {
    key: "delivery",
    label: "提供時期",
    value:
      "決済の確認後、条件に合う回答者へ順次お届けします。回答が規定数に達した時点で結果をご覧いただけます。",
    required: true,
  },
  {
    key: "refund",
    label: "返品・キャンセル",
    value:
      "回答の配信開始前であれば、お申し出により全額をご返金します。配信開始後のキャンセルはお受けできません。規定数の回答が集まらなかった場合は、集まらなかった分を日割りでご返金します。",
    required: true,
  },
  {
    key: "env",
    label: "動作環境",
    value: "最新のブラウザ（Chrome / Safari / Edge / Firefox）",
    required: false,
  },
];

/** まだ埋まっていない必須項目 */
export function missingLegal(): LegalField[] {
  return LEGAL.filter((f) => f.required && !f.value);
}

/**
 * 決済してよいか。
 *
 * 特商法の表記が揃っていて、かつ Stripe の鍵があること。
 * どちらか欠けていたら、決済は始めない。
 */
export function canCharge(): boolean {
  return missingLegal().length === 0 && Boolean(process.env.STRIPE_SECRET_KEY);
}

/** なぜ決済できないか。画面と API で同じ言葉を使う */
export function whyCannotCharge(): string | null {
  const miss = missingLegal();
  if (miss.length > 0) {
    return `特定商取引法に基づく表記が未完成です（${miss.map((m) => m.label).join("・")}）`;
  }
  if (!process.env.STRIPE_SECRET_KEY) return "決済の設定が入っていません";
  return null;
}

/* ── 公開の前に止めること ─────────────────────────
   表記の項目そのものを減らせないようにする。
   減らすと、揃っていないことに気づけなくなる。 */
{
  const need = [
    "seller", "rep", "address", "tel", "email", "price",
    "extra", "pay_method", "pay_time", "delivery", "refund",
  ];
  for (const k of need) {
    const f = LEGAL.find((x) => x.key === k);
    if (!f) throw new Error(`特商法の表記から「${k}」が抜けています`);
    if (!f.required) throw new Error(`特商法の「${f.label}」は必須です`);
  }
  // 「準備中」「未定」で埋めた気にならないようにする。
  for (const f of LEGAL) {
    if (f.value && /準備中|未定|TBD|調整中|追って/.test(f.value)) {
      throw new Error(`特商法の「${f.label}」が実質空欄です（${f.value}）`);
    }
  }
}
