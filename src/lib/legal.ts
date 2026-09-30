import { site } from "./site";
import { PLANS, PASS_VALID_DAYS } from "./ask/plans";

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
 *
 * ── 個人の情報を git に置かない ──────────────
 * 代表者名と電話番号は、このファイルに直接書いてもよいが、
 * そうすると公開リポジトリに個人の電話番号が残る。
 * 環境変数からも読めるようにしてある。
 *
 *   LEGAL_REP_NAME  代表者名
 *   LEGAL_TEL       電話番号
 *
 * Vercel の環境変数に入れれば、git には入らない。
 * どちらでも動く（ファイルに書いてあれば、そちらが優先）。
 */

/** 環境変数から読む。空文字は「無い」として扱う */
function fromEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}
export const LEGAL: LegalField[] = [
  // 売主は当社。答える女性ではない。
  // ここを「運営」とだけ書くと、場貸しに見える。
  {
    key: "seller",
    label: "販売事業者",
    value: `${site.company.name}（本サービスの提供者・販売者・代金の受領者は、いずれも当社です。回答する女性は当社の業務委託先であり、お客様に対する販売者ではありません）`,
    required: true,
  },
  // ▼ 代表者名。ここに直接書くか、LEGAL_REP_NAME に入れる
  { key: "rep", label: "代表者", value: fromEnv("LEGAL_REP_NAME"), required: true },
  {
    key: "address",
    label: "所在地",
    value: `${site.company.postalCode} ${site.company.address}`,
    required: true,
  },
  // ▼ 電話番号。ここに直接書くか、LEGAL_TEL に入れる
  //    請求があったら遅滞なく開示する運用にする場合も、番号自体は必要です。
  { key: "tel", label: "電話番号", value: fromEnv("LEGAL_TEL"), required: true },
  { key: "email", label: "メールアドレス", value: site.company.email, required: true },
  {
    key: "price",
    label: "販売価格",
    value:
      PLANS.map((p) => `${p.name} ${p.yen.toLocaleString()}円`).join(" / ") +
      "（すべて税込。月額課金・自動更新はありません）",
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
      "文章・画像のご相談は、決済の確認後、条件に合う女性へ順次お届けし、回答が規定数に達した時点で結果をご覧いただけます。音声通話のご相談は、決済の確認後に当社が日時を調整してご案内します（1回15分）。",
    required: true,
  },
  {
    key: "refund",
    label: "返品・キャンセル",
    value:
      "文章・画像のご相談は、回答者へのお渡しを開始する前にお申し出いただければ全額をご返金します。お渡し開始後のキャンセルはお受けできません。規定数の回答が集まらなかった場合は、集まらなかった分をご返金します（回数でのご利用時は、使用した回数を戻します）。本サービスはインターネットを通じて提供する役務のため、クーリング・オフの適用はありません。",
    required: true,
  },
  {
    // ══════════════════════════════════════════════
    // 通話のキャンセル・遅刻・無断不参加
    // ══════════════════════════════════════════════
    // 相手も実在の人で、その時間を空けて待っている。
    // 「来なかったら返金」にすると、待った人に払えない。
    // 何時間前までなら戻せるのかを、買う前に出しておく。
    key: "cancel_call",
    label: "音声通話のキャンセル",
    value:
      "予約日時の24時間前までのお申し出は、全額返金または回数の返還を行います。24時間を切ってからのキャンセル、および無連絡での不参加は、返金・回数の返還をいたしません。開始予定時刻から10分間お待ちし、その後は実施したものとして取り扱います。遅刻により短くなった時間の延長・返金はいたしません。当社側の事由（回答者の不参加、設備の不具合など）で実施できなかった場合は、全額返金または回数の返還を行います。",
    required: true,
  },
  {
    // ══════════════════════════════════════════════
    // 回数の有効期限
    // ══════════════════════════════════════════════
    // ここに書いていない期限で消すのが、いちばん悪い。
    // 決済の直前の画面（PurchaseTerms）と、この表記と、
    // 残りを見る画面の3か所に、同じことを出す。
    //
    // 180日にしてある理由は plans.ts の PASS_VALID_DAYS。
    key: "expiry",
    label: "回数の有効期限・中途解約",
    value:
      `まとめてお申し込みいただいた回数は、決済確定日から${PASS_VALID_DAYS}日間ご利用いただけます。有効期限は、お申し込み前の確認画面と、残回数の画面に表示します。期限経過後の未使用分の払い戻しはいたしません（当社の責めに帰すべき事由による場合を除きます）。本サービスは月額課金・自動更新ではないため、中途解約のお手続きは不要です。解約のご意思がある場合は、次回のお申し込みをされないことで足ります。未使用の回数について、有効期限内のお申し出があれば、個別にご相談に応じます。`,
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
    // 回数と通話を売る以上、この2つが無いと表記として足りない。
    // 減らせないように、ここに入れておく。
    "cancel_call", "expiry",
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
