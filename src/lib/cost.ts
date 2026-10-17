/* ══════════════════════════════════════════════════
   変動費の率
   ══════════════════════════════════════════════════
   economics.ts（マチアプ版の商品ごとの採算表）を消した。
   残すのは、商品が変わっても変わらない率だけ。

   値段を動かしたときに採算が崩れていないかは、
   lib/pass/trip.ts が、この4つから計算して止める。 */

/** 決済手数料。Stripe の国内カードは 3.6% 前後 */
export const PAYMENT_RATE = 0.036;

/** 返金と補填の引当。実績が出るまでは保守的に置く */
export const REFUND_RATE = 0.03;

/** そのほかの取引変動費（通知・保存など）。1件あたり */
export const MISC_COST_YEN = 10;

/** 整理のAIを呼ぶぶん。1件あたり */
export const AI_COST_YEN = 20;

/**
 * 確カメる1回で、答える人に払う額。
 *
 * 行ったばかりの人に、自分の旅のことを思い出して書いてもらう。
 * 安くすると答えが薄くなり、薄い答えは次の人が買わない理由になる。
 */
export const ANSWER_REWARD = 250;

/** 限界利益率の床。ここを割る値段は、公開の前に止まる */
export const MARGIN_FLOOR = 0.5;

{
  for (const [n, v] of [["決済", PAYMENT_RATE], ["返金", REFUND_RATE]] as const) {
    if (v < 0 || v > 0.2) throw new Error(`${n}の率が ${v} です`);
  }
  if (MARGIN_FLOOR < 0.4 || MARGIN_FLOOR > 0.9) {
    throw new Error(`限界利益率の床が ${MARGIN_FLOOR} です`);
  }
  if (ANSWER_REWARD < 150) {
    throw new Error(`答える人への支払いが ¥${ANSWER_REWARD} です。薄い答えしか集まりません`);
  }
}
