// 価格の唯一のソース。
//
// サイトの表示・Stripe の請求・管理画面の3つが同じ数字を見るようにする。
// ここを直せば全部が変わる。逆に、ここ以外に金額を書かない。
//
// セキュリティ上の理由でもある：クライアントから金額を受け取らないため、
// 決済セッションを作るときは必ずこの定義（またはStripeのPrice ID）を使う。

export type TierId = "founder" | "standard";

export const PLAN = {
  name: "第一印象改善プラン",
  /** 期間（日） */
  days: 30,
  /** 実施の制約（表示用） */
  where: "東京都内",
  when: "土日のみ",
} as const;

export const TIERS: Record<
  TierId,
  {
    id: TierId;
    label: string;
    /** 税込・円 */
    amount: number;
    /** 先着枠（null は無制限） */
    seats: number | null;
    note: string;
  }
> = {
  founder: {
    id: "founder",
    label: "先着10名",
    amount: 49800,
    seats: 10,
    note: "記録（Before / After）の掲載にご協力いただける方",
  },
  standard: {
    id: "standard",
    label: "通常",
    amount: 66000,
    seats: null,
    note: "先着10名さまのあとのご案内価格",
  },
};

/** 先着枠の上限（= 事例づくりの期間） */
export const FOUNDER_SEATS = TIERS.founder.seats ?? 0;

/**
 * 納品物。ここがこのプランの「渡すもの」の全部。
 *
 * ── なぜ成果ではなく納品物で書くか ────────────────────
 * 以前は「自分で再現できるまで伴走します」と書いていた。
 * これは終わりの条件が相手の習得度で決まる約束なので、
 *   ・いつ終わったのか、こちらからは言えない
 *   ・「まだできない」と言われたら、無期限に続く
 *   ・できるようになったかどうかを争点にされる
 * という三重のリスクがある。役務の範囲としても曖昧すぎる。
 *
 * だから「何を渡すか」に置き換えた。納品物は数えられて、
 * 渡した時点で完了が確定する。質問窓口も日数で区切る。
 * 顧客にとっても、手元に残るものが具体的なほうが分かりやすい。
 *
 * ※ 効果・習得は保証しない（薬機法・景表法）。
 */
export const DELIVERABLES: { t: string; d: string }[] = [
  {
    t: "メイクの手順動画",
    d: "あなたの顔で、その日に撮影します。あとから何度でも見返せます。",
  },
  {
    t: "眉の型と、手入れの手順",
    d: "整えた形と、伸びてきたときにどこを落とすか。写真と手順でお渡しします。",
  },
  {
    t: "服のサイズ表",
    d: "肩幅・着丈・袖丈の数値。次に買うとき、そのまま使えます。",
  },
  {
    t: "髪型のオーダー資料",
    d: "美容室でそのまま見せられる写真と、伝え方のメモ。",
  },
  {
    t: "Before / After の写真データ",
    d: "撮影した写真はお渡しします。掲載はご本人の許可があるときだけです。",
  },
  {
    t: "改善プラン（1枚）",
    d: "何をやるか、何をやらないか。当日までに決めたことを一枚にまとめます。",
  },
];

/** 実施後の質問窓口。期間で区切る（成果では区切らない）。 */
export const SUPPORT = {
  days: 30,
  channel: "LINE",
  note: "即時の返信はお約束していません",
} as const;

/** ¥49,800 のような表示に整える */
export function yen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function isTierId(v: unknown): v is TierId {
  return v === "founder" || v === "standard";
}
