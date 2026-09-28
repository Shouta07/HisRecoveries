// リンクの鍵。
//
// ── なぜ会員登録を入れないか ──────────────────────
// MVP で必要なのは「投稿 → 回答 → 結果」の3歩だけ。
// そこに登録画面を挟むと、多くの人は1歩目の前で帰る。
// 相談者には結果のURLを、回答者には1件ごとのURLを渡す。
// URL を知っていること自体を鍵にする。
//
// このやり方はこのサイトで既に動いている（取材の受付番号）。
// 新しい仕組みを増やさない。
//
// ── 推測されない長さにする ────────────────────────
// 受付番号（8文字）は人が書き写すためのもので、短い。
// こちらは書き写さないので、総当たりが成立しない長さにする。
// 32文字・英数字32種で、2^160 相当。

// l / 1 / 0 / o を抜いた32文字。
// 32 は 256 の約数なので、1バイトを % で落としても偏りが出ない。
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const LEN = 32;

function make(prefix: string): string {
  const bytes = new Uint8Array(LEN);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `${prefix}${out}`;
}

/** 相談者が結果を見るための鍵 */
export function makeConsultToken(): string {
  return make("c");
}

/** 回答者1人・相談1件ごとの鍵。使い回さない */
export function makeReplyToken(): string {
  return make("r");
}

const SHAPE = new RegExp(`^[cr][${ALPHABET}]{${LEN}}$`);

export function isToken(x: unknown): x is string {
  return typeof x === "string" && SHAPE.test(x);
}

// この2つは「string かどうか」ではなく「どちらの鍵か」を見る。
// 型述語（x is string）にすると、string を渡したときに
// 否定側が never へ絞られて、取り違えの検査が書けなくなる。
export function isConsultToken(x: unknown): boolean {
  return isToken(x) && x.startsWith("c");
}

export function isReplyToken(x: unknown): boolean {
  return isToken(x) && x.startsWith("r");
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const c = makeConsultToken();
  const r = makeReplyToken();
  if (!isConsultToken(c)) throw new Error(`相談の鍵の形が不正です: ${c}`);
  if (!isReplyToken(r)) throw new Error(`回答の鍵の形が不正です: ${r}`);
  // 種類を取り違えると、回答用のURLで結果が見えてしまう。
  if (isConsultToken(r) || isReplyToken(c)) throw new Error("鍵の種類が区別できていません");
  if (c.length !== LEN + 1) throw new Error("鍵の長さが足りません");
  if (isToken("c" + "0".repeat(LEN))) throw new Error("使っていない文字を受け入れています");
  if (isToken("")) throw new Error("空文字を鍵として受け入れています");
  // 紛らわしい文字（l / 1 / 0 / o）を入れない。口頭やチャットで壊れる。
  for (const bad of ["l", "1", "0", "o"]) {
    if (ALPHABET.includes(bad)) throw new Error(`鍵に紛らわしい文字「${bad}」が入っています`);
  }
  // 偏りが出ない長さであること。256 を割り切らないと、先頭の文字ほど出やすくなる。
  if (256 % ALPHABET.length !== 0) {
    throw new Error(`鍵の文字数 ${ALPHABET.length} では、乱数に偏りが出ます`);
  }
  if (new Set(ALPHABET).size !== ALPHABET.length) {
    throw new Error("鍵の文字に重複があります");
  }
}
