// 90日ロードマップ。
//
// 診断は「順番」を出すが、順番は優先順位であって予定ではない。
// 「STEP 1 → 2 → 3」を見せられても、今週どこにいるのかは分からない。
// ここは、順番を13週の時間軸に展開する。
//
// ── フェーズの中身は、順番表から作る ─────────────────
// フェーズ名は固定（土台 → 見た目 → 必要なら専門）だが、
// 中に入るものは診断結果の順番から取る。
// 別々に決めると、同じ画面に2つの違う順序が並ぶことになる。
//
// ── 週数の置き方 ────────────────────────────────
// 選択肢ごとに「確かめるまでの週数」を持たせてあるので、
// フェーズの長さはその合計ではなく、いちばん長いものに合わせる。
// 直列に足すと90日に収まらないし、実際には並行して進む。
//
// ── 人が判断しない ──────────────────────────────
// ここに人の裁量は入らない。同じ回答なら同じ計画が出る。
// 個別対応で精度を上げる代わりに、人数が増えても壊れない形を取る。

import type { AreaId } from "./check";
import { OPTIONS, sortOptions, type Constraints, type Option } from "./options";

export type Phase = {
  n: 1 | 2 | 3;
  label: string;
  /** 何週目から何週目か（1始まり） */
  fromWeek: number;
  toWeek: number;
  /** このフェーズの狙い。1文 */
  aim: string;
  /** 扱う領域。診断の順番から入る */
  areas: AreaId[];
  /** この期間にやること。条件で絞ったあとの選択肢 */
  todo: Option[];
  /** 何をもって次へ進むか */
  moveOn: string;
};

const PHASE_META = [
  {
    n: 1 as const,
    label: "土台をそろえる",
    fromWeek: 1,
    toWeek: 4,
    aim: "手をつけていない項目を減らす。買わずにできることから。",
    moveOn: "決めた曜日の作業が3週続いたら次へ",
  },
  {
    n: 2 as const,
    label: "見た目を動かす",
    fromWeek: 5,
    toWeek: 9,
    aim: "物とやり方を替えて、変化が確かめられる状態にする。",
    moveOn: "同じ条件の写真が2枚たまったら次へ",
  },
  {
    n: 3 as const,
    label: "必要なら、専門を検討する",
    fromWeek: 10,
    toWeek: 13,
    aim: "ここまでで動かなかった部分だけを、外に相談する。検討しないまま終える人のほうが多い。",
    moveOn: "——",
  },
];

/**
 * 診断の順番と条件から、90日（13週）の計画を作る。
 *
 * steps は診断が返す順番（減点 → 現在地 → ケア → 内側）。
 * これを3つに割る。割り方は本数ではなく「何をする段階か」で決める。
 */
export function buildPlan(steps: { areaId: AreaId }[], limits: Constraints): Phase[] {
  const areas = steps.map((s) => s.areaId);
  // 順番の前半＝土台、後半＝見た目。奇数なら土台側に寄せる（軽いほうを先に厚くする）
  const cut = Math.ceil(areas.length / 2);
  const groups: AreaId[][] = [areas.slice(0, cut), areas.slice(cut), areas];

  return PHASE_META.map((meta, i) => {
    const mine = groups[i];
    let todo: Option[] = [];

    if (meta.n === 3) {
      // 専門は、全領域の「人に頼む」と「医療の領域」だけを集める
      todo = mine
        .flatMap((a) => sortOptions(a, limits).fits)
        .filter((o) => o.tier === "pro" || o.tier === "care");
    } else {
      const wantSelf = meta.n === 1;
      todo = mine
        .flatMap((a) => sortOptions(a, limits).fits)
        .filter((o) => (wantSelf ? o.tier === "self" : o.tier === "buy"));
      // 該当がなければ、その領域の通った選択肢の先頭を1つだけ入れる。
      // 空のフェーズを見せると「やることがない」と読めてしまう。
      if (todo.length === 0) {
        todo = mine.flatMap((a) => sortOptions(a, limits).fits.slice(0, 1));
      }
    }

    // 同じものが複数領域から入ることがあるので落とす
    const seen = new Set<string>();
    todo = todo.filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)));

    return { ...meta, areas: mine, todo };
  });
}

/** 90日で扱わない領域（順番に入らなかったもの）。「やらなくていい」と対で使う */
export function untouchedAreas(steps: { areaId: AreaId }[]): AreaId[] {
  const inPlan = new Set(steps.map((s) => s.areaId));
  const all = [...new Set(OPTIONS.map((o) => o.area))];
  return all.filter((a) => !inPlan.has(a));
}
