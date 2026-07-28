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

/** ¥49,800 のような表示に整える */
export function yen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function isTierId(v: unknown): v is TierId {
  return v === "founder" || v === "standard";
}
