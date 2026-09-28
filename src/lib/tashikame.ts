// タシカメの声。
//
// ── 語尾を出す場所と、出さない場所を分ける ────────────
// 「〜カメ」は、このキャラクターの人格そのものなので大事にしたい。
// ただし、置く場所を選ばないと逆に働く。
//
// 結果の画面を開く人は、たいてい不安な状態で開く。
// 「4人が『少し重い』と言っています」と伝える場所で語尾が跳ねると、
// 茶化されたように読める。人の本音を預かる製品で、そこは崩せない。
//
// だから語尾を出すのは、次の場所だけにする。
//   空の画面 / 読み込み中 / 登録の案内 / トップの見出し周り
// 出さない場所。
//   結果の数字と本文 / 扱えない相談を止めるとき / 安全と privacy の説明
//
// ── 答えを出す口調にしない ────────────────────────
// タシカメは答えを出さない。集めてくるだけ。
// 「こうしたほうがいい」を言わせない。ここはビルドで確かめる。

export type Line = { text: string; mood: "normal" | "thinking" | "going" | "report" | "idle" };

/* ── 語尾を出してよい場所 ───────────────────────── */

/** まだ何も起きていないとき */
export const EMPTY: Record<string, Line> = {
  noQuestions: {
    text: "まだ、誰も聞いていないカメ。",
    mood: "idle",
  },
  noAnswerers: {
    text: "まだ、誰も登録していないカメ。",
    mood: "idle",
  },
  noRecords: {
    text: "まだ何もないカメ。",
    mood: "idle",
  },
};

/** 動いている最中 */
export const WORKING: Record<string, Line> = {
  asking: { text: "みんなに聞いてくるカメ。", mood: "going" },
  waiting: { text: "いま、聞いてきているカメ。", mood: "going" },
  collected: { text: "みんなに聞いてきた。", mood: "report" },
};

/** 誘い文句 */
export const INVITE: Record<string, Line> = {
  ask: { text: "それ、タシカメる？", mood: "normal" },
  join: { text: "あなたの本音も、聞かせてほしいカメ。", mood: "normal" },
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

const TIC = /カメ。|カメ！|カメ\?|カメ？/;

// 真面目な場所に語尾が混ざっていないか。
for (const [k, v] of Object.entries(PLAIN)) {
  if (TIC.test(v)) {
    throw new Error(`「${k}」に語尾が入っています（結果と停止の文面では使いません）`);
  }
}
for (const n of [0, 3, 5]) {
  if (TIC.test(collected(n, 5))) {
    throw new Error("件数の文に語尾が入っています");
  }
}

// タシカメは答えを出さない。助言の口調になっていないか。
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

// 語尾を出す場所には、実際に語尾があること。
// 人格を入れたつもりで、どこにも出ていない状態にしない。
{
  const voiced = [...Object.values(EMPTY), ...Object.values(WORKING), ...Object.values(INVITE)];
  if (!voiced.some((l) => TIC.test(l.text))) {
    throw new Error("タシカメの語尾が1つも使われていません");
  }
}
