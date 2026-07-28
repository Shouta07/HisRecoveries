// 申し込み（決済）の記録と、先着枠の残数。サーバー専用。
//
// 「先着10名」はコピーではなく、サーバー側で数えて止める。
// 数えるのは status='paid' の founder だけ。リンクを発行しただけ（issued）は
// 枠を埋めない——支払われなければ枠は空いたままにする。ただし発行済みが
// 上限を超えないよう、発行時は issued も含めて見る（二重発行の防止）。

import { dbAdminEnabled, dbInsertAdmin, dbSelect, dbUpdateWhere } from "@/lib/db";
import { FOUNDER_SEATS, type TierId } from "@/lib/pricing";

export type OrderStatus = "issued" | "paid" | "canceled" | "expired";

export type OrderRow = {
  id?: string;
  created_at?: string;
  paid_at?: string | null;
  stripe_session_id: string;
  stripe_payment_intent?: string | null;
  stripe_event_id?: string | null;
  status: OrderStatus;
  tier: TierId;
  amount: number;
  currency: string;
  email: string;
  display_name?: string | null;
  scheduled_for?: string | null;
  note?: string | null;
};

export const ordersEnabled = dbAdminEnabled;

/** 決済済みの先着枠（事例づくり価格）が何人埋まったか。 */
export async function countFounderPaid(): Promise<number> {
  const rows = await dbSelect<{ id: string }>(
    "orders?select=id&tier=eq.founder&status=eq.paid"
  );
  return rows.length;
}

/** 発行済み（未払い含む）の先着枠。二重発行の抑止に使う。 */
export async function countFounderHeld(): Promise<number> {
  const rows = await dbSelect<{ id: string }>(
    "orders?select=id&tier=eq.founder&status=in.(issued,paid)"
  );
  return rows.length;
}

export async function founderSeatsLeft(): Promise<number> {
  if (!ordersEnabled) return FOUNDER_SEATS;
  return Math.max(0, FOUNDER_SEATS - (await countFounderHeld()));
}

export async function findOrderBySession(sessionId: string): Promise<OrderRow | null> {
  const rows = await dbSelect<OrderRow>(
    `orders?select=*&stripe_session_id=eq.${encodeURIComponent(sessionId)}&limit=1`
  );
  return rows[0] ?? null;
}

export async function recordIssuedOrder(row: OrderRow) {
  return dbInsertAdmin("orders", row);
}

/**
 * 入金確認。Webhook からのみ呼ぶ。
 * 同じ session に対して二度目が来ても paid のままで、二重に数えない。
 */
export async function markOrderPaid(
  sessionId: string,
  patch: {
    stripe_payment_intent?: string | null;
    stripe_event_id: string;
    amount?: number;
    email?: string;
    paid_at: string;
  }
) {
  return dbUpdateWhere(
    "orders",
    `stripe_session_id=eq.${encodeURIComponent(sessionId)}&status=neq.paid`,
    { ...patch, status: "paid" }
  );
}

export async function markOrderStatus(sessionId: string, status: OrderStatus) {
  return dbUpdateWhere(
    "orders",
    `stripe_session_id=eq.${encodeURIComponent(sessionId)}`,
    { status }
  );
}

/** 管理画面の一覧用（新しい順） */
export async function recentOrders(limit = 20): Promise<OrderRow[]> {
  return dbSelect<OrderRow>(
    `orders?select=*&order=created_at.desc&limit=${limit}`
  );
}
