// 診断の結果を、URLに畳む。
//
// ── なぜ要るか ────────────────────────────────
// 診断を最後まで終えた人に、結果を持ち帰る手段が1つもなかった。
// 保存もしない、ログインもない、共有ボタンが配っていたのは
// /check（まっさらな1問目）へのリンク。
// つまり「LINEで送る」を押すと、相手には何も届かなかった。
//
// いちばん関心が高い瞬間に、持ち帰るものが無いのがいちばん惜しい。
//
// ── なぜサーバーに保存しないのか ──────────────────
// 保存すると、それは個人の健康・身体に関する情報の預かりになる。
// 要配慮個人情報の同意も、消す手段も、預かる期間の約束も要る。
// いまその体制がないので、預からない。
// 答えはURLの中だけに置き、こちらには何も残らない。
// 「回答は保存していません」と書いていることは、これで嘘にならない。
//
// ── 代わりに書かないといけないこと ──────────────────
// URLに答えが入る以上、人に送れば答えも相手に見える。
// それは結果の画面に自分から書く（CheckFlow 側）。
//
// ── 形 ──────────────────────────────────────
//   c1~hair!b1~30e!b4~10000
// 短く、目で読めて、壊れていたら黙って捨てられること。
// 復元するときは設問idと選択肢の値を必ず照合する。
// 知らない値が1つでも入っていたら、その項目を落とす。
// URLは誰でも書き換えられるので、来たものをそのまま信じない。

import { BLOCKS, type Answers } from "./check";

const PAIR = "!";
const KV = "~";

/** 設問id → 取りうる選択肢の値 */
const ALLOWED: Map<string, Set<string>> = new Map(
  BLOCKS.flatMap((b) => b.questions).map((q) => [
    q.id,
    new Set(q.choices.map((c) => c.value)),
  ]),
);

/** 設問の並び順。URLの見た目を安定させる（同じ回答なら同じ文字列） */
const ORDER: string[] = BLOCKS.flatMap((b) => b.questions).map((q) => q.id);

export function encodeAnswers(answers: Answers): string {
  const parts: string[] = [];
  for (const id of ORDER) {
    const v = answers[id];
    if (v === undefined) continue;
    if (!ALLOWED.get(id)?.has(v)) continue; // 知らない値は載せない
    parts.push(`${id}${KV}${v}`);
  }
  return parts.join(PAIR);
}

/**
 * URLから回答を戻す。
 * 知らない設問・知らない選択肢は落とす。壊れていれば空を返す。
 */
export function decodeAnswers(raw: string | null | undefined): Answers {
  if (!raw) return {};
  const out: Answers = {};
  for (const part of raw.split(PAIR)) {
    const i = part.indexOf(KV);
    if (i <= 0) continue;
    const id = part.slice(0, i);
    const v = part.slice(i + 1);
    if (!ALLOWED.get(id)?.has(v)) continue;
    out[id] = v;
  }
  return out;
}

/** 本体5問がそろっているか。そろっていなければ結果は出さない */
export function isComplete(answers: Answers): boolean {
  const core = BLOCKS.filter((b) => b.stage === "core").flatMap((b) => b.questions);
  return core.every((q) => answers[q.id] !== undefined);
}

// 設問idに区切り文字が混ざると、URLが復元できなくなる。
// あとから設問を足したときに気づけるよう、読み込んだ時点で落とす。
for (const id of ORDER) {
  if (id.includes(PAIR) || id.includes(KV)) {
    throw new Error(`設問id「${id}」に区切り文字が入っています（URLに畳めません）`);
  }
  for (const v of ALLOWED.get(id) ?? []) {
    if (v.includes(PAIR) || v.includes(KV)) {
      throw new Error(`選択肢の値「${v}」に区切り文字が入っています（URLに畳めません）`);
    }
  }
}
