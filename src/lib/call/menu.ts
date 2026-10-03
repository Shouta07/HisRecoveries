import { PAYMENT_RATE, REFUND_RATE, MISC_COST_YEN, AI_COST_YEN, REWARDS } from "../economics";
import { PASS_MARGIN_FLOOR } from "../pass/entitle";
import { plan } from "../ask/plans";

/* ══════════════════════════════════════════════════
   電話で確カメる。長さの選び方
   ══════════════════════════════════════════════════

   ── 何を売っているか ────────────────────────────
   「話し相手」ではない。「判断を10〜30分で片付けること」。

   文字で確カメると、聞く → 返る → また聞く で半日かかる。
   そこが急ぐ場面（今日誘うか、この返信をいま送るか）では、
   話したほうが早い。それだけの商品。

   ── 主役にしない ────────────────────────────────
   タシカメの芯は、マッチ後を覚えておくこと。
   電話は、AIでも文字でも決めきれなかったときの最後の手段。

   トップでは1節だけ、Pass の下に小さく置く。
   ここを大きくすると、製品が「異性と話せるサービス」に見える。
   そう見えた時点で、月額の理由が消える。

   ── 長さで、単価を下げる ────────────────────────
   10分 ¥1,980 ／ 20分 ¥3,480 ／ 30分 ¥4,980
        ¥198/分      ¥174/分      ¥166/分

   長いほど、答える側の段取り（前後の準備・記入）が
   1件あたりでは薄まる。そのぶんを値段に返す。
   逆転したら、長いほうを選ぶ理由が無くなる。下の判定が止める。

   ── 入口は、既存の15分より安いこと ──────────────
   いま plans.ts にある通話は 15分 ¥2,980 の1本だけ。
   はじめて声で聞く人に ¥2,980 は重い。
   10分 ¥1,980 は、その下に置く入口。
   15分以上になったら、入口の意味が無い。判定で止める。 */

export type CallOption = {
  minutes: number;
  yen: number;
  /** 誰向けか。1行だけ。長さを選ぶ理由になっていること */
  why: string;
};

/**
 * 答える人に、1分あたり払う額。
 *
 * economics.ts の talk_short（15分話す／¥700〜1,100）を
 * 1分あたりに直した範囲に収める。
 *   ¥700 / 15分 = ¥46.7   ¥1,100 / 15分 = ¥73.3
 *
 * 帯の真ん中に置く。下限に寄せると人が集まらず、
 * 上限に寄せると長い通話で床を割る。
 */
export const CALL_REWARD_PER_MIN = 60;

export const CALL_OPTIONS: CallOption[] = [
  { minutes: 10, yen: 1980, why: "1つだけ決めたいとき。" },
  { minutes: 20, yen: 3480, why: "いま進んでいる相手が、何人かいるとき。" },
  { minutes: 30, yen: 4980, why: "この先どう動くかを、ひととおり。" },
];

/** 1分あたりの値段 */
export function perMinute(o: CallOption): number {
  return Math.round(o.yen / o.minutes);
}

/** その長さの、答える人への支払い */
export function rewardOf(o: CallOption): number {
  return o.minutes * CALL_REWARD_PER_MIN;
}

/** 限界利益率 */
export function marginOf(o: CallOption): number {
  const variable =
    o.yen * PAYMENT_RATE + o.yen * REFUND_RATE + MISC_COST_YEN + AI_COST_YEN + rewardOf(o);
  return (o.yen - variable) / o.yen;
}

/** いちばん短いもの。入口として画面に出す */
export const CALL_ENTRY = CALL_OPTIONS[0];

/* ══════════════════════════════════════════════════
   画面に置かない言い方
   ══════════════════════════════════════════════════
   売っているのは「判断を片付けること」で、
   話すこと自体ではない。

   ここを外すと、同じ値段・同じ仕組みのまま
   別の業種の商品になる。言葉のほうが先に滑るので、
   言葉で止める。 */
export const NOT_THIS = [
  "話し相手", "癒やし", "癒し", "寂しさ", "ひとりじゃない",
  "恋人気分", "デート気分", "疑似恋愛", "彼女気分",
  "いつでも話せ", "何でも話せ", "好きなだけ", "甘え",
  "かわいい", "美人", "指名",
];

/** 電話の説明が、話し相手の商売になっていないか */
export function assertNotCompanion(text: string, where: string): string {
  const hit = NOT_THIS.find((w) => text.includes(w));
  if (hit) {
    throw new Error(
      `${where} に「${hit}」が入っています。` +
        `電話は、判断を10〜30分で片付けるものです（話し相手ではありません）`,
    );
  }
  return text;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  if (CALL_OPTIONS.length < 2) throw new Error("電話の長さが1つしかありません");

  const band = REWARDS.find((b) => b.kind === "talk_short");
  if (!band) throw new Error("economics.ts に talk_short の帯がありません");

  /* 答える人への支払いが、帯の中に収まっていること。
     帯は15分あたりなので、1分あたりに直して比べる。

     下に外れると人が集まらない。
     上に外れると、長い通話から順に床を割る。 */
  const lo = band.min / 15;
  const hi = band.max / 15;
  if (CALL_REWARD_PER_MIN < lo || CALL_REWARD_PER_MIN > hi) {
    throw new Error(
      `電話の報酬が1分 ¥${CALL_REWARD_PER_MIN} です` +
        `（talk_short の帯は1分 ¥${lo.toFixed(0)}〜¥${hi.toFixed(0)}）`,
    );
  }

  let last = Infinity;
  for (const o of CALL_OPTIONS) {
    if (o.minutes <= 0) throw new Error(`電話の長さが ${o.minutes} 分です`);

    /* ── 30分より長くしない ──────────────────────
       それ以上は、判断を片付ける時間ではなくなる。
       economics.ts の talk（30分以上／¥3,000〜7,000）の帯に移り、
       原価の形そのものが変わる。 */
    if (o.minutes > 30) {
      throw new Error(
        `電話が ${o.minutes} 分あります（30分まで）。` +
          `それ以上は、判断を片付ける時間ではなくなります`,
      );
    }

    /* ── 長いほど、1分あたりが安いこと ──────────── */
    const per = perMinute(o);
    if (per > last) {
      throw new Error(
        `${o.minutes}分の1分あたり ¥${per} が、もっと短いもの（¥${last}）より高いです`,
      );
    }
    last = per;

    /* ── 床を割らないこと ──────────────────────── */
    const m = marginOf(o);
    if (m < PASS_MARGIN_FLOOR) {
      throw new Error(
        `${o.minutes}分 ¥${o.yen.toLocaleString()} の限界利益率が ${(m * 100).toFixed(1)}% です` +
          `（${Math.round(PASS_MARGIN_FLOOR * 100)}% 以上）。` +
          `値段か、1分あたりの報酬（¥${CALL_REWARD_PER_MIN}）を見直してください`,
      );
    }

    if (!o.why) throw new Error(`${o.minutes}分に、選ぶ理由が書かれていません`);
    assertNotCompanion(o.why, `電話の${o.minutes}分の説明`);
  }

  /* ── 入口が、既存の通話より安いこと ──────────────
     15分 ¥2,980 の下に置く入口として足したもの。
     そこに並んでしまうと、足した意味が無い。 */
  {
    const existing = plan("call15");
    if (CALL_ENTRY.yen >= existing.yen) {
      throw new Error(
        `電話の入口が ¥${CALL_ENTRY.yen.toLocaleString()} で、` +
          `既存の${existing.name}（¥${existing.yen.toLocaleString()}）より安くありません`,
      );
    }
    if (CALL_ENTRY.minutes >= (existing.callMinutes ?? 15)) {
      throw new Error(
        `電話の入口が ${CALL_ENTRY.minutes}分で、既存の${existing.name}より短くありません`,
      );
    }
  }
}
