// 自動伴走の判定。
//
// 担当者が状況を見て言葉を選ぶ、という形にしない。
// 状態が決まれば文面が決まる純粋関数にして、人の裁量を入れない。
// 人数が10人でも1万人でも、同じ入力からは同じ出力が出る。
//
// ── ここに人の判断を入れない理由 ───────────────────
// 個別に言葉を選べば精度は上がる。ただしそれは人数に比例して工数が増え、
// 属人化する。「この人だから続いた」は、事業としては再現できない。
// 精度を少し捨てて、壊れない形を取る。
//
// ── 追いかけない ──────────────────────────────
// 3回続けて反応がなければ、送るのを止める。
// 反応がない人に送り続けると、開封率ではなくブロック率が上がる。
// そして「やめたくなったらやめられる」ことは、この事業では機能のひとつ。
// 急かす文面は書かない。

export type Checkin = {
  /** 何週目か（1始まり） */
  week: number;
  /** その週に決めた数のうち、終えた数 */
  done: number;
  total: number;
  /** 記録の写真を出したか */
  photo: boolean;
};

export type NudgeKind =
  | "start" // まだ始まっていない
  | "keep" // 続いている
  | "advance" // 続いていて、次へ進める
  | "slip" // 半分くらい
  | "reduce" // ほとんど進んでいない。減らす
  | "quiet"; // 反応がない。送るのを止める

export type Nudge = {
  kind: NudgeKind;
  /** 送る文面。ここが唯一の出力 */
  text: string;
  /** 次にいつ送るか。pause は送らない */
  cadence: "weekly" | "biweekly" | "pause";
};

/** 直近 n 回の達成率（未提出は 0 として数えない＝別扱い） */
function rate(c: Checkin): number {
  if (c.total === 0) return 0;
  return c.done / c.total;
}

/**
 * 状態から次の一通を決める。
 *
 * trail は新しい順。空なら未開始。
 * 未提出の週は trail に入らない（提出がないこと自体を欠測として扱う）。
 */
export function decideNudge(trail: Checkin[], missedInARow: number): Nudge {
  // 反応がない人を追いかけない。ここが最初に来る。
  if (missedInARow >= 3) {
    return {
      kind: "quiet",
      cadence: "pause",
      text:
        "しばらくお休みですね。こちらからのお知らせは、いったん止めます。\n" +
        "再開したくなったら、いつでも「再開」と送ってください。記録は残しています。",
    };
  }

  if (trail.length === 0) {
    return {
      kind: "start",
      cadence: "weekly",
      text:
        "今週の3つを送ります。ひとつ目は今日中に終わるものです。\n" +
        "全部できなくて構いません。ひとつだけ終わったら、それを教えてください。",
    };
  }

  const last = rate(trail[0]);
  const prev = trail.length > 1 ? rate(trail[1]) : null;

  if (missedInARow >= 2) {
    return {
      kind: "reduce",
      cadence: "biweekly",
      text:
        "忙しい時期でしょうか。今週は3つではなく、1つだけにします。\n" +
        "寝る時刻を決める——これだけで構いません。他は止めておきます。",
    };
  }

  if (last >= 0.7 && prev !== null && prev >= 0.7) {
    return {
      kind: "advance",
      cadence: "weekly",
      text:
        "2週続きました。ここまでは習慣になったと見ていいと思います。\n" +
        "次の段階に進みます。今週から、内容がひとつ入れ替わります。",
    };
  }

  if (last >= 0.7) {
    return {
      kind: "keep",
      cadence: "weekly",
      text:
        "今週は終わりましたね。同じ内容をもう1週続けます。\n" +
        "2週そろったところで、次に進みます。",
    };
  }

  if (last >= 0.3) {
    return {
      kind: "slip",
      cadence: "weekly",
      text:
        "半分まで進みました。残りは来週に回して構いません。\n" +
        "終わらなかったものを1つ外しますか。減らしたほうが続きます。",
    };
  }

  return {
    kind: "reduce",
    cadence: "biweekly",
    text:
      "今週は進みませんでしたね。数が多いのかもしれません。\n" +
      "1つに減らします。できたかどうかだけ、来週教えてください。",
  };
}

/** 判定の一覧。運営が中身を確認するために使う（/admin/nudge） */
export const NUDGE_CASES: { name: string; trail: Checkin[]; missed: number }[] = [
  { name: "登録直後（記録なし）", trail: [], missed: 0 },
  { name: "1週目・3つ中3つ", trail: [{ week: 1, done: 3, total: 3, photo: true }], missed: 0 },
  {
    name: "2週続けて達成",
    trail: [
      { week: 2, done: 3, total: 3, photo: true },
      { week: 1, done: 2, total: 3, photo: true },
    ],
    missed: 0,
  },
  { name: "3つ中1つ", trail: [{ week: 3, done: 1, total: 3, photo: false }], missed: 0 },
  { name: "3つ中0", trail: [{ week: 4, done: 0, total: 3, photo: false }], missed: 0 },
  {
    name: "2週続けて未提出",
    trail: [{ week: 2, done: 2, total: 3, photo: true }],
    missed: 2,
  },
  {
    name: "3週続けて未提出",
    trail: [{ week: 2, done: 2, total: 3, photo: true }],
    missed: 3,
  },
];
