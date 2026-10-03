import { PANEL_SIZE, HUMAN_PER_MONTH } from "./entitle";

/* ══════════════════════════════════════════════════
   3人そろうまでと、そろわなかったとき
   ══════════════════════════════════════════════════

   ── いま回答者は3人 ────────────────────────────
   パネルも3人。つまり予備がいない。

   §23 の「知っている人かもしれない」で1人が辞退すると、
   振替先がいない。3人そろわない。

   これは起きる。相手がマッチングアプリの利用者で、
   回答者も同じ地域の同世代なら、当たることがある。

   ── 非同期なので、失敗ではなく遅れにできる ────────
   通話なら、その場で人がいないと終わり。
   非同期なら、待てる。だから「待ち」の状態を持つ。

   ── 月のぶんは、そろってから数える ──────────────
   届いていないのに権利だけ減るのが、いちばん不満になる。
   そろった依頼だけ数える。そろわなかったぶんは、また使える。

   ── 足りないまま返さない ────────────────────────
   2人ぶんを「3人に聞きました」として返さない。
   そろわなかったときは、そう言う。 */

export type RequestStatus = "open" | "done" | "short" | "cancelled";

export type Req = {
  status: RequestStatus;
  required: number;
  completed: number;
};

/** いま答えられる人の数から、受け付けてよいか決める */
export function canAccept(onlineAdvisors: number): { ok: boolean; why?: string } {
  if (onlineAdvisors < PANEL_SIZE) {
    return {
      ok: false,
      why: `いま答えられる方が${onlineAdvisors}人です。${PANEL_SIZE}人そろってから受け付けます。`,
    };
  }
  return { ok: true };
}

/**
 * 予備がいるか。
 *
 * ちょうど人数ぶんしかいないと、1人辞退した時点で詰む。
 * 受け付けないのではなく、詰む可能性があることを呼ぶ側へ伝える。
 */
export function hasSpare(onlineAdvisors: number): boolean {
  return onlineAdvisors > PANEL_SIZE;
}

/** 回答が1つ増えたときの、次の状態 */
export function onResponse(r: Req): Req {
  const completed = r.completed + 1;
  return {
    ...r,
    completed,
    status: completed >= r.required ? "done" : "open",
  };
}

/**
 * もう振替先がいないと分かったとき。
 *
 * そろわないまま終わらせる。月のぶんは使わない。
 */
export function onNoMoreAdvisors(r: Req): Req {
  if (r.completed >= r.required) return { ...r, status: "done" };
  return { ...r, status: "short" };
}

/** その月に、いくつ使ったことになるか。そろったものだけ */
export function usedThisMonth(reqs: Req[]): number {
  return reqs.filter((r) => r.status === "done").length;
}

/** まだ使えるか */
export function canRequest(reqs: Req[]): boolean {
  return usedThisMonth(reqs) < HUMAN_PER_MONTH;
}

/** そろわなかったときに出す言葉 */
export const SHORT_NOTE =
  "今回は、答えてくれた方が人数に届きませんでした。今月のぶんは使っていないので、また聞けます。";

/** 待っているあいだ */
export const WAITING_NOTE = "いま届けています。そろったら知らせるで。";

/* ── 公開の前に止めること ───────────────────────── */
{
  // ちょうど人数ぶんしかいないときは、予備が無いこと。
  // ここを見落とすと「3人いるから大丈夫」と思い込む。
  if (hasSpare(PANEL_SIZE)) {
    throw new Error("人数ぴったりなのに、予備がいることになっています");
  }
  if (!hasSpare(PANEL_SIZE + 1)) {
    throw new Error("1人多いのに、予備がいないことになっています");
  }

  // 人数が足りないときは、受け付けないこと。
  if (canAccept(PANEL_SIZE - 1).ok) {
    throw new Error("人数が足りないのに、受け付けています");
  }
  if (!canAccept(PANEL_SIZE).ok) {
    throw new Error("人数がそろっているのに、受け付けません");
  }

  // そろうまでは done にしないこと。
  {
    let r: Req = { status: "open", required: PANEL_SIZE, completed: 0 };
    for (let i = 1; i < PANEL_SIZE; i++) {
      r = onResponse(r);
      if (r.status === "done") throw new Error(`${i}人で done になっています`);
    }
    r = onResponse(r);
    if (r.status !== "done") throw new Error("そろったのに done になりません");
  }

  // そろわなかったものは、月のぶんを使わないこと。
  // 届いていないのに権利だけ減るのが、いちばん不満になる。
  {
    const short = onNoMoreAdvisors({ status: "open", required: 3, completed: 2 });
    if (short.status !== "short") throw new Error("そろわないのに short になりません");
    if (usedThisMonth([short]) !== 0) {
      throw new Error("そろわなかったぶんが、月のぶんとして数えられています");
    }
    if (!canRequest([short])) {
      throw new Error("そろわなかったのに、もう使えないことになっています");
    }
  }

  // 待っているあいだも、月のぶんを使わないこと。
  {
    const open: Req = { status: "open", required: 3, completed: 1 };
    if (usedThisMonth([open]) !== 0) throw new Error("待っているぶんが数えられています");
  }

  // そろったら、月のぶんを使うこと。
  {
    const done: Req = { status: "done", required: 3, completed: 3 };
    if (usedThisMonth([done]) !== 1) throw new Error("そろったのに数えられていません");
    if (canRequest([done])) throw new Error("月のぶんを使ったのに、まだ使えることになっています");
  }

  // 足りないまま「3人に聞いた」と言わないこと。
  if (!/人数に届きませんでした/.test(SHORT_NOTE)) {
    throw new Error("そろわなかったことが、伝わる言葉になっていません");
  }
  // 月のぶんが残ることを、必ず伝えること。
  if (!/今月のぶんは使っていない/.test(SHORT_NOTE)) {
    throw new Error("月のぶんが残ることが、書かれていません");
  }
  // 待っているあいだ、終わったように見せないこと。
  if (/できません|エラー/.test(WAITING_NOTE)) {
    throw new Error("待っているあいだの言葉が、止まったように見えます");
  }
}
