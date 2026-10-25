// 構想の面が、構想のまま出ていることを見る。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// ここは 3,980円の相談を売っていた。
// 売る口（値段・申し込み・LINE）が、面と lib の両方にあった。
//
// 構想に差し替えたあとも、どこかに1つ残ると、
// 「売っている構想」に見える。
// 文章が丁寧なぶん、読んだ人は本気で申し込もうとする。
//
// lib/concept.ts は中身を見る。ここは面と、残り全部を見る。
//
// ══════════════════════════════════════════════════
// 5つを見る
// ══════════════════════════════════════════════════
// 1. トップが「まだ提供していません」を、面に出していること
// 2. トップが、何が無いか（NOT_BUILT）と、誰のためか（市場・ICP）を出していること
// 3. 売る口の言葉が、どこにも無いこと（値段・申し込み・LINE・決済）
// 4. 畳んだ商品の言葉が、どこにも無いこと
// 5. 例が、最初の市場（東京）に揃っていること

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const LOOK = ["src/app", "src/components", "src/lib"];

/* 禁止語の一覧そのものを持つところ。見ると自分で落ちる */
const HOLDS_THE_LIST = [
  "src/lib/voice.ts",
  "src/lib/concept.ts",
  "src/lib/legal.ts",
  "src/lib/terms.ts",
  "src/lib/privacy.ts",
];

/** コメントを同じ長さの空白に置き換える。行番号を保つ */
function stripComments(src) {
  let out = "", i = 0, quote = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (quote) {
      if (c === "\\") { out += c + (n ?? ""); i += 2; continue; }
      if (c === quote) quote = null;
      out += c; i++; continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") { out += " "; i++; } continue; }
    if (c === "/" && n === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++; }
      out += "  "; i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}

async function files(dir) {
  const out = [];
  let entries;
  try { entries = await readdir(join(ROOT, dir), { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await files(rel)));
    else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

const top = stripComments(await readFile(join(ROOT, "src/app/(ja)/page.tsx"), "utf8"));

/* ══════════════════════════════════════════════════
   1〜2. トップが、出すべきものを出していること
   ══════════════════════════════════════════════════ */
for (const [sym, what] of [
  ["STATUS_LINE", "まだ提供していないこと"],
  ["NOT_BUILT", "何が無いか"],
  ["MARKET", "最初の市場"],
  ["ICP", "声をかける宿の姿"],
  ["END_USER", "旅行者側の相手"],
  ["BUYER", "宿側の相手"],
  ["NOT_FOR", "最初に声をかけない相手"],
  ["MVP", "最初に作るものの大きさ"],
  ["contactEmail", "連絡先が無いときの出し分け"],
]) {
  if (!top.includes(sym)) {
    console.error(`トップが、${what}（${sym}）を出していません。`);
    console.error("");
    console.error("構想の面は、何が無いかと、誰のためかを出さないと、売り場に見えます。");
    process.exit(1);
  }
}

/* ══════════════════════════════════════════════════
   3〜4. 売る口と、畳んだ商品の言葉が、どこにも無いこと
   ══════════════════════════════════════════════════ */
const GONE = [
  // 売る口
  ["お申し込み", "申し込みの口（売っていない）"],
  ["申し込む", "申し込みの口（売っていない）"],
  ["今すぐ", "急かす言葉（売っていない）"],
  ["ご購入", "購入の口（売っていない）"],
  ["決済リンク", "決済の口（売っていない）"],
  ["Stripe", "決済（売っていない）"],
  ["NEXT_PUBLIC_LINE_URL", "LINEの口（畳んだ）"],
  ["lineUrl", "LINEの口（畳んだ）"],
  // 畳んだ相談サービス
  ["LINEで相談", "相談サービス（畳んだ）"],
  ["LINEで対応できるか", "相談サービス（畳んだ）"],
  ["Google Meet", "相談サービス（畳んだ）"],
  ["相談パス", "相談サービス（畳んだ）"],
  ["聞ける人がいる", "相談サービスの看板（畳んだ）"],
  ["行ったことのある人", "相談サービス（畳んだ）"],
  ["対象期間", "相談サービス（畳んだ）"],
  ["24時間以内", "相談サービス（畳んだ）"],
  ["3,980", "相談サービスの値段（畳んだ）"],
  ["3980", "相談サービスの値段（畳んだ）"],
  ["1旅行", "相談サービスの単位（畳んだ）"],
  ["緊急時の対応は含みません", "相談サービス（畳んだ）"],
  // さらに前
  ["回答者", "もっと前の商品"],
  ["音声通話", "もっと前の商品"],
  ["旅パス", "もっと前の商品"],
  ["マチアプ", "もっと前の商品"],
];

const hit = [];
for (const dir of LOOK) {
  for (const f of await files(dir)) {
    if (HOLDS_THE_LIST.includes(f)) continue;
    const src = stripComments(await readFile(join(ROOT, f), "utf8"));
    src.split("\n").forEach((line, n) => {
      if (/throw new Error/.test(line)) return;
      for (const [w, where] of GONE) {
        if (line.includes(w)) { hit.push({ f, n: n + 1, w, where, line: line.trim().slice(0, 80) }); return; }
      }
    });
  }
}
if (hit.length > 0) {
  console.error("売る口か、畳んだ商品の言葉が残っています。");
  console.error("");
  for (const h of hit) { console.error(`  ${h.f}:${h.n}  「${h.w}」（${h.where}）`); console.error(`    ${h.line}`); }
  console.error("");
  console.error("打ち消しの文でも引っかかります。語そのものを使わない言い方にしてください。");
  process.exit(1);
}

/* ══════════════════════════════════════════════════
   5. 例が、最初の市場に揃っていること
   ══════════════════════════════════════════════════
   最初の市場は東京（浅草・蔵前）。
   構想の例が京都のままだと、読んだ宿が「うちは関係ない」と思う。
   lib/concept.ts の生きている文字列だけを見る。 */
{
  const concept = stripComments(await readFile(join(ROOT, "src/lib/concept.ts"), "utf8"));
  const strings = [...concept.matchAll(/"([^"\n]*)"/g)].map((m) => m[1]).join("\n");
  for (const w of ["京都", "清水寺", "鴨川", "嵐山", "祇園"]) {
    if (strings.includes(w)) {
      console.error(`構想の例に「${w}」が残っています。最初の市場は東京（浅草・蔵前）です。`);
      process.exit(1);
    }
  }
  if (!/浅草/.test(strings)) {
    console.error("構想の例に、最初の検証エリア（浅草）が出てきません。");
    process.exit(1);
  }
}

console.log("concept チェック: まだ無いこと・誰のためか・最初の市場、すべて出ています。売る口0件");
