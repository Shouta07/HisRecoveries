import { assertPlain, assertNotScary, assertNotCheap } from "../voice";
import { OPEN_CATEGORIES } from "./model";

// 手が止まる瞬間。
//
// ══════════════════════════════════════════════════
// 「恋愛で悩んでいませんか？」と書かない
// ══════════════════════════════════════════════════
// 抽象的に聞くと、誰も自分のことだと思わない。
// 「悩んでいる人」は、自分を悩んでいる人だと思っていない。
// 思っているのは「このLINE、重くないかな」だけ。
//
// だから状態ではなく、瞬間を書く。
// 画面を見て「それ、昨日の俺だ」と思えるかどうかがすべて。
//
// ══════════════════════════════════════════════════
// 答えられることしか書かない
// ══════════════════════════════════════════════════
// 「この写真、女性ウケする？」は書けない。画像を受け取る口が無い。
// 「脈あり？」も書かない。相手の気持ちを当てる商売にしない。
// 下の判定が両方とも弾く。
//
// ══════════════════════════════════════════════════
// 怖がらせない
// ══════════════════════════════════════════════════
// 「嫌われます」「手遅れです」は書かない（voice.ts の SCARE）。
// 渡すのは決めるための材料であって、
// 決めないと大変だという脅しではない。

/**
 * 手が止まる瞬間。
 *
 * cat は相談のカテゴリ。押したらその場面から始められるようにする。
 * 受け付けていないカテゴリは書かない（押した先で行き止まりになる）。
 */
export const MOMENTS: { line: string; cat: string }[] = [
  { line: "「このLINE、重くない？」", cat: "message" },
  { line: "「今誘ったら、早すぎる？」", cat: "date" },
  { line: "「昨日のデート、どう思われた？」", cat: "signal" },
  { line: "「この自己紹介文、女性に届いてる？」", cat: "photo" },
  { line: "「電話、何を話せばいい？」", cat: "date" },
  { line: "「2回目、こっちから誘っていい？」", cat: "date" },
  { line: "「距離を縮めたい。でも踏み込みすぎたくない」", cat: "distance" },
  { line: "「本人には聞けないことを、聞いてみたい」", cat: "distance" },
];

/** 瞬間の上に置く一行 */
export const PAIN_LEAD = "送信ボタンを押す前、手が止まる。";

/**
 * 瞬間のあと、なぜここなのかを書く橋。
 *
 * 検索とAIを否定しない。どちらも実際に役に立つ。
 * 足りないのは1点だけで、そこだけを書く
 * （compare.ts の INSTEAD と同じ書き方。
 *  短所から入ると、こちらが疑われる）。
 */
export const BRIDGE = {
  known: "検索すれば、一般論は出てくる。AIに聞けば、それっぽい答えも返ってくる。",
  gap: "知りたいのは、実際の女性なら、どう感じるか。",
  close: "送ってから考えるのではなく、送る前に確かめる。",
};

/* ── 公開の前に止めること ───────────────────────── */
{
  // 画像を前提にしない。受け取る口がまだ無い。
  const NEEDS_IMAGE = /写真|画像|スクショ|スクリーンショット|服|髪/;
  // 相手の気持ちを当てる商売にしない。
  const MIND_READING = /脈あり|脈なし|本命|好きかどうか|気持ちを当て/;

  const open = new Set(OPEN_CATEGORIES.map((c) => c.id as string));

  for (const m of MOMENTS) {
    if (NEEDS_IMAGE.test(m.line)) {
      throw new Error(`手が止まる瞬間「${m.line}」が画像を前提にしています`);
    }
    if (MIND_READING.test(m.line)) {
      throw new Error(`手が止まる瞬間「${m.line}」が、相手の気持ちの判定になっています`);
    }
    // 押した先が行き止まりにならないこと。
    if (!open.has(m.cat)) {
      throw new Error(
        `手が止まる瞬間「${m.line}」の行き先「${m.cat}」は、いま受け付けていません`,
      );
    }
    assertNotScary(m.line, "手が止まる瞬間");
    assertNotCheap(m.line, "手が止まる瞬間");
  }

  // 数。少ないと自分のが無く、多いと読まれない。
  if (MOMENTS.length < 5) throw new Error("手が止まる瞬間が少なすぎます（5つ以上）");
  if (MOMENTS.length > 8) throw new Error("手が止まる瞬間が多すぎます（8つまで）");

  // 同じ場面を2回書かない。
  if (new Set(MOMENTS.map((m) => m.line)).size !== MOMENTS.length) {
    throw new Error("手が止まる瞬間が重複しています");
  }

  // 声の場面と、言いにくい場面が、それぞれ1つは入っていること。
  // ここが全部「この文面でいい？」だと、
  // 文字の添削屋にしか見えない（plans.ts と同じ理由）。
  if (!MOMENTS.some((m) => m.cat === "distance")) {
    throw new Error("手が止まる瞬間に、言いにくい場面がありません");
  }
  // 声の場面。
  // ここは「タシカメは、こんなときに使えます」の節を畳んだ受け皿でもある。
  // あちらが持っていた電話の場面が、ここから消えると行き場が無くなる。
  if (!MOMENTS.some((m) => /電話|声|沈黙|黙っ/.test(m.line))) {
    throw new Error("手が止まる瞬間が、文字の相談だけになっています（電話の場面も置いてください）");
  }

  // 橋の書き方。検索とAIを否定から入らないこと。
  // 「役に立たない」と言った時点で、読んでいる人の実感と食い違う。
  if (/当てにならない|意味がない|役に立たない|無駄|信用できない/.test(BRIDGE.known)) {
    throw new Error(`ほかの手段を否定しています（${BRIDGE.known}）`);
  }
  if (!BRIDGE.known.includes("AI")) {
    throw new Error("なぜAIではないのかが書かれていません（1画面目で必ず答えます）");
  }
  for (const [k, t] of Object.entries(BRIDGE)) {
    assertPlain(t, `橋の文（${k}）`);
    assertNotScary(t, `橋の文（${k}）`);
    assertNotCheap(t, `橋の文（${k}）`);
  }
  for (const t of [PAIN_LEAD]) {
    assertNotScary(t, "手が止まる瞬間の見出し");
  }
}
