/* ══════════════════════════════════════════════════
   月額の状態を、Webhook から受け取って決める
   ══════════════════════════════════════════════════

   ── 画面の「成功しました」を信じない ────────────
   戻り道（success_url）は演出。本当のことは Stripe から届く。
   戻り道だけで使えるようにすると、URL を直接開くだけで通る。

   ── 同じものが何度も届く ────────────────────────
   Stripe は再送する。順番も前後する。
   「更新 → 作成」の順で届くことがある。

   だから、受け取った時刻ではなく、
   届いた中身どうしを比べて、新しいほうを残す。

   ── 止めるときは、期末まで使える ────────────────
   解約を押した日に切らない。払った期間は使える。
   cancel_at_period_end を持って、期末で切る。

   ここは DB に触らない。
   「この知らせで、状態はどうなるべきか」を返すだけ。
   分けてあるので、ここだけで試せる。 */

export type PassStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid";

export type PassRow = {
  userToken: string;
  customerId: string | null;
  subscriptionId: string | null;
  priceId: string | null;
  status: PassStatus;
  periodStart: string | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/** Stripe から届く、月額に関わる知らせ */
export const PASS_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;
export type PassEvent = (typeof PASS_EVENTS)[number];

export function isPassEvent(x: unknown): x is PassEvent {
  return typeof x === "string" && (PASS_EVENTS as readonly string[]).includes(x);
}

function isStatus(x: unknown): x is PassStatus {
  return (
    typeof x === "string" &&
    ["trialing", "active", "past_due", "canceled", "incomplete", "unpaid"].includes(x)
  );
}

function iso(sec: unknown): string | null {
  return typeof sec === "number" && sec > 0 ? new Date(sec * 1000).toISOString() : null;
}

/**
 * 知らせ1つから、こうあるべき状態を作る。
 *
 * now は、いま持っている状態。初めてなら null。
 */
export function apply(
  type: PassEvent,
  obj: Record<string, unknown>,
  now: PassRow | null,
): PassRow | null {
  const userToken =
    str(obj.client_reference_id) ??
    str((obj.metadata as Record<string, unknown> | undefined)?.user_token) ??
    now?.userToken ??
    null;
  if (!userToken) return null;

  const base: PassRow = now ?? {
    userToken,
    customerId: null,
    subscriptionId: null,
    priceId: null,
    status: "incomplete",
    periodStart: null,
    periodEnd: null,
    cancelAtPeriodEnd: false,
  };

  switch (type) {
    case "checkout.session.completed": {
      // 月額の Checkout でなければ、触らない（単発と同じ口に来る）
      if (obj.mode !== "subscription") return null;
      return {
        ...base,
        userToken,
        customerId: str(obj.customer) ?? base.customerId,
        subscriptionId: str(obj.subscription) ?? base.subscriptionId,
        // ここではまだ active にしない。
        // 実際に使えるかは subscription 側の知らせで決まる。
        status: base.status === "incomplete" ? "incomplete" : base.status,
      };
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const items = obj.items as { data?: { price?: { id?: string } }[] } | undefined;
      return {
        ...base,
        userToken,
        customerId: str(obj.customer) ?? base.customerId,
        subscriptionId: str(obj.id) ?? base.subscriptionId,
        priceId: items?.data?.[0]?.price?.id ?? base.priceId,
        status: isStatus(obj.status) ? obj.status : base.status,
        periodStart: iso(obj.current_period_start) ?? base.periodStart,
        periodEnd: iso(obj.current_period_end) ?? base.periodEnd,
        cancelAtPeriodEnd: obj.cancel_at_period_end === true,
      };
    }

    case "customer.subscription.deleted":
      return { ...base, userToken, status: "canceled", cancelAtPeriodEnd: false };

    case "invoice.paid":
      // 更新された。期末が伸びる
      return {
        ...base,
        userToken,
        status: "active",
        periodEnd: iso(obj.period_end) ?? base.periodEnd,
      };

    case "invoice.payment_failed":
      // ここで切らない。Stripe が再試行する。
      // 切ると、カードを直せば済む人まで締め出す。
      return { ...base, userToken, status: "past_due" };
  }
}

/** いま使えるか */
export function usable(row: PassRow | null): boolean {
  if (!row) return false;
  if (row.status !== "active" && row.status !== "trialing") return false;
  if (row.periodEnd && new Date(row.periodEnd) <= new Date()) return false;
  return true;
}

function str(x: unknown): string | null {
  return typeof x === "string" && x ? x : null;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const T = "u".repeat(32);

  // 月額でない Checkout は、触らないこと。
  // 単発と同じ口に届くので、ここで分けないと単発が月額になる。
  if (apply("checkout.session.completed", { mode: "payment", client_reference_id: T }, null)) {
    throw new Error("単発の決済で、月額が作られています");
  }

  // Checkout が終わっただけでは、使えるようにしないこと。
  {
    const r = apply(
      "checkout.session.completed",
      { mode: "subscription", client_reference_id: T, customer: "cus_1", subscription: "sub_1" },
      null,
    );
    if (!r) throw new Error("月額の Checkout が取れていません");
    if (usable(r)) throw new Error("Checkout が終わっただけで、使えることになっています");
  }

  // subscription の知らせで、使えるようになること。
  const future = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const activeRow = apply(
    "customer.subscription.updated",
    {
      id: "sub_1",
      customer: "cus_1",
      status: "active",
      current_period_end: future,
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_1" } }] },
      metadata: { user_token: T },
    },
    null,
  );
  if (!activeRow) throw new Error("subscription の知らせが取れていません");
  if (!usable(activeRow)) throw new Error("active なのに、使えないことになっています");
  if (activeRow.priceId !== "price_1") throw new Error("Price が取れていません");

  // 支払いに失敗しても、その場で切らないこと。
  // Stripe が再試行する。切ると、カードを直せば済む人まで締め出す。
  {
    const r = apply("invoice.payment_failed", { metadata: { user_token: T } }, activeRow);
    if (!r) throw new Error("失敗の知らせが取れていません");
    if (r.status !== "past_due") throw new Error("支払い失敗が past_due になっていません");
  }

  // 解約を押しても、期末までは使えること。
  {
    const r = apply(
      "customer.subscription.updated",
      {
        id: "sub_1",
        customer: "cus_1",
        status: "active",
        current_period_end: future,
        cancel_at_period_end: true,
        items: { data: [{ price: { id: "price_1" } }] },
        metadata: { user_token: T },
      },
      activeRow,
    );
    if (!r) throw new Error("解約予約が取れていません");
    if (!r.cancelAtPeriodEnd) throw new Error("解約予約が残っていません");
    if (!usable(r)) throw new Error("解約を押した日に、使えなくなっています");
  }

  // 本当に終わったら、使えないこと。
  {
    const r = apply("customer.subscription.deleted", { metadata: { user_token: T } }, activeRow);
    if (!r) throw new Error("解約の知らせが取れていません");
    if (usable(r)) throw new Error("解約済みなのに、使えることになっています");
  }

  // 期限が切れていたら、status が active でも使えないこと。
  {
    const past = new Date(Date.now() - 1000).toISOString();
    if (usable({ ...activeRow, periodEnd: past })) {
      throw new Error("期限が切れているのに、使えることになっています");
    }
  }

  // 持ち主が分からない知らせは、受け取らないこと。
  if (apply("customer.subscription.updated", { id: "sub_x", status: "active" }, null)) {
    throw new Error("持ち主の分からない知らせが、通っています");
  }

  // 扱う知らせが、全部ここに書いてあること。
  for (const t of PASS_EVENTS) {
    if (!isPassEvent(t)) throw new Error(`知らせ「${t}」が、扱いに入っていません`);
  }
}
