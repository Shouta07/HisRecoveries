// 空のとき・待っているとき・誘うときの文言。
//
// ══════════════════════════════════════════════════
// タシカメは、もうキャラクターの名前ではない
// ══════════════════════════════════════════════════
// サービスの名前をタシカメにした。
// キャラクターも同じ名前だったので、両方がタシカメになっていた。
//
// 名前がぶつかるだけなら、まだ我慢できる。
// 問題は、キャラクターが「〜カメ。」で喋っていたこと。
// サービス名がタシカメなら、サービスが語尾を跳ねさせていることになる。
//
//   勘で、出さない。
//   まだ、誰も登録していないカメ。
//
// この2つが同じ画面に並んでいた（/answerers）。
// 重さを作った直後の段落で、自分でそれを打ち消していた。
// 結婚相談所の隣にマスコットは立てない。
//
// ── どちらを捨てたか ──────────────────────────────
// 声を捨てて、姿を残した。
//
// 亀そのものは、この製品に合っている。
// 急がば回れ。慎重。焦らない。「勘で、出さない。」と同じことを言う。
// だからマークとしては残す。ただし、喋らない。
//
// ここにあるのは、キャラクターの台詞ではなく、
// サービスが空のときに出す文になった。

export type Line = { text: string; mood: "normal" | "thinking" | "going" | "report" | "idle" };

/* ── 語尾を出してよい場所 ───────────────────────── */

/** まだ何も起きていないとき */
export const EMPTY: Record<string, Line> = {
  noQuestions: {
    text: "まだ、誰も聞いていません。",
    mood: "idle",
  },
  noAnswerers: {
    text: "まだ、どなたも登録がありません。",
    mood: "idle",
  },
  noRecords: {
    text: "まだ何もありません。",
    mood: "idle",
  },
};

/** 動いている最中 */
export const WORKING: Record<string, Line> = {
  asking: { text: "条件に合う方をさがしています。", mood: "going" },
  waiting: { text: "いま読んでもらっています。", mood: "going" },
  collected: { text: "みんなに聞いてきた。", mood: "report" },
};

/** 誘い文句 */
export const INVITE: Record<string, Line> = {
  ask: { text: "送る前に、通しておく。", mood: "normal" },
  join: { text: "あなたの感じ方が、誰かの判断材料になります。", mood: "normal" },
};

/* ── 語尾を出さない場所 ─────────────────────────
   同じキャラクターでも、ここでは普通に喋る。
   キャラクターが黙るのではなく、真面目な顔で言う、という扱い。 */

export const PLAIN: Record<string, string> = {
  resultReady: "みんなに聞いてきました。",
  resultSplit: "意見が分かれました。",
  resultWaiting: "まだ集まっている途中です。",
  blocked: "この相談は、お預かりできません。",
};

/** 件数から1行作る。数字は必ず実データから渡す */
export function collected(n: number, of: number): string {
  if (n === 0) return "まだ、1人も答えていません。";
  if (n < of) return `${of}人のうち、${n}人が答えました。`;
  return `${n}人に聞いてきました。`;
}

/* ── 公開の前に止めること ───────────────────────── */

// 語尾の「〜カメ」は、どこにも入れない。
//
// 以前は「空の画面と読み込み中なら跳ねてよい」という分け方にしていた。
// サービス名がタシカメになった時点で、その分け方は成立しない。
// どこで跳ねても、サービスが跳ねていることになる。
const TIC = /カメ。|カメ！|カメ\?|カメ？|カメ$/;

{
  const all = [
    ...Object.values(EMPTY).map((l) => l.text),
    ...Object.values(WORKING).map((l) => l.text),
    ...Object.values(INVITE).map((l) => l.text),
    ...Object.values(PLAIN),
  ];
  for (const v of all) {
    if (TIC.test(v)) {
      throw new Error(`「${v}」に語尾が入っています（タシカメはサービスの名前で、喋りません）`);
    }
  }
  for (const n of [0, 3, 5]) {
    if (TIC.test(collected(n, 5))) {
      throw new Error("件数の文に語尾が入っています");
    }
  }
}

// 答えを出さない。助言の口調になっていないか。
const ADVICE = [
  "したほうがいい", "すべき", "おすすめ", "正解", "間違い",
  "必ず", "絶対", "成功", "attack", "落とせ",
];
{
  const all = [
    ...Object.values(EMPTY).map((l) => l.text),
    ...Object.values(WORKING).map((l) => l.text),
    ...Object.values(INVITE).map((l) => l.text),
    ...Object.values(PLAIN),
  ];
  for (const t of all) {
    const hit = ADVICE.find((a) => t.includes(a));
    if (hit) {
      throw new Error(`タシカメの文に「${hit}」が入っています（答えは出しません）`);
    }
  }
}

// 空のときの文が、状態を言えていること。
//
// 以前はここに「語尾が1つも無い」を落とすチェックがあった。
// キャラクターの人格が消えないようにするためのものだったが、
// サービス名がタシカメになった時点で、人格そのものを畳んだ。
//
// 代わりに見るのは、何が起きているかが書けているか。
// 「まだありません」だけだと、壊れているのか作っている途中かが分からない。
{
  const lines = [...Object.values(EMPTY), ...Object.values(WORKING)];
  for (const l of lines) {
    if (l.text.length < 8) {
      throw new Error(`空のときの文が短すぎます（${l.text}）。何が起きているかを書いてください`);
    }
  }
}
