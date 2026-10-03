// 安さで売っていないか、怖がらせて売っていないかを見る。
//
// ══════════════════════════════════════════════════
// なぜ、方針だけでは足りないか
// ══════════════════════════════════════════════════
// /disclosure には「『今だけ』『残りわずか』『お得』『キャンペーン』などの語が
// 原稿に入ると、公開の前に自動で止まります」と書いてある。
// 書いてあるのに止まらないなら、それは嘘になる。
// このスクリプトが、その一文を本当にするためのもの。
//
// lib/voice.ts の assertNotCheap は、そこを通る文だけを見る。
// ページに直接書いた文は通らない。だからファイルのほうから見る。
//
// ══════════════════════════════════════════════════
// 何を見て、何を見ないか
// ══════════════════════════════════════════════════
// 見る:   画面と、商品・価格・回答者まわりの本文（コメントは除く）
// 見ない: コメント（設計の理由を日本語で書いてあるので、語そのものが出る）
//         voice.ts / monetization.ts（禁止語の一覧そのもの）
//         /disclosure（方針としてその語を引用している）
//         /admin（運営だけが見る画面。売り文句ではない）
//         記事の本文（clusters.ts）。売り込みを見分ける話で語そのものが出る。
//         そちらは monetization.ts の PROMO_WORDS が見ている。

import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LOOK = [
  "src/app", "src/components", "src/lib/ask", "src/lib/responder",
  // 体験の入口の文。広告から最初に来る面なので、ここも見る。
  "src/lib/trial.ts",
];

/**
 * voice.ts の SCARE と同じもの。ここを直したら両方直す。
 *
 * 怖がらせて売らない。不安は買う理由にはなるが、続く理由にはならない。
 * 「失敗」そのものは禁じていない（買う人の言葉なので使ってよい）。
 * 止めるのは、こちらが結末を断定する書き方のほう。
 */
const SCARE = [
  "嫌われます", "嫌われる前に", "手遅れ", "取り返しがつか",
  "詰みます", "致命的", "一発アウト", "もう戻れ",
  "痛い男", "失敗します", "終わりです", "選び間違えると",
  "気づいたときには遅", "見限られ", "脈なし確定",
];

/** voice.ts の CHEAP と同じもの。ここを直したら両方直す */
const CHEAP = [
  "最安", "半額", "激安", "格安", "値下げ", "お得", "割引",
  "キャンペーン", "クーポン", "無料お試し", "初回無料",
  "今だけ", "期間限定", "残りわずか", "先着",
  "ワンコイン", "コスパ",
];

/** 見ないファイル。理由はこのファイルの頭に書いてある */
const SKIP = [
  "src/lib/voice.ts",
  "src/lib/monetization.ts",
  "src/lib/clusters.ts",
  "src/lib/threadsEval.ts",
  "src/app/disclosure/page.tsx",
  "src/app/admin/",
];

/**
 * コメントを外す。
 *
 * 設計の理由は日本語のコメントで書いてあるので、
 * 「値下げから入らない」のような行がそのまま引っかかる。
 * 文字列の中の // は消さないように、行コメントは
 * 引用符の外にあるものだけ落とす。
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null; // ' " ` のどれか
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") {
        out += c + (next ?? "");
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      out += c;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i += 1;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

async function files(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    /* ── 1つのファイルを渡されたときに、黙って0件にしない ──
       LOOK にはディレクトリだけが並んでいた。
       ファイルを1つ足したら readdir が ENOTDIR で落ちて、
       この catch が空配列を返し、そのファイルは見られないまま
       「見ました」の扱いになっていた。

       ファイルなら、それ1つを返す。
       それ以外（存在しない）なら、ここで止める。
       黙って0件にすると、確認したつもりで通ってしまう。 */
    const st = await stat(join(ROOT, dir)).catch(() => null);
    if (st?.isFile()) return /\.(tsx?|mdx?)$/.test(dir) ? [dir] : found;
    console.error(`見る場所がありません: ${dir}`);
    process.exit(1);
  }
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) {
      found.push(...(await files(rel)));
    } else if (/\.(tsx?|mdx?)$/.test(e.name)) {
      found.push(rel);
    }
  }
  return found;
}

const hits = [];
let looked = 0;

for (const dir of LOOK) {
  for (const f of await files(dir)) {
    if (SKIP.some((s) => f.startsWith(s))) continue;
    looked += 1;
    const src = stripComments(await readFile(join(ROOT, f), "utf8"));
    const lines = src.split("\n");
    lines.forEach((line, n) => {
      for (const w of [...CHEAP, ...SCARE]) {
        if (line.includes(w)) hits.push({ f, n: n + 1, w, line: line.trim().slice(0, 90) });
      }
    });
  }
}

if (hits.length > 0) {
  console.error("画面に置けない言葉が入っています。");
  console.error("");
  console.error("安さ  — 原価は答える女性への支払いです。値段を下げると");
  console.error("        その人たちへの支払いを下げることになり、回答が薄くなります。");
  console.error("怖さ  — 不安は買う理由にはなりますが、続く理由にはなりません。");
  console.error("        渡すのは決めるための材料で、決めないと大変だという脅しではありません。");
  console.error("");
  for (const h of hits) {
    console.error(`  ${relative(".", h.f)}:${h.n}  「${h.w}」`);
    console.error(`    ${h.line}`);
  }
  console.error("");
  console.error("売れないときに直すのは、値段ではなく");
  console.error("  ・何が返ってくるのか分からない");
  console.error("  ・誰が読むのか分からない");
  console.error("  ・払ったあと何が起きるのか分からない");
  console.error("のどれかです。");
  process.exit(1);
}

console.log(`copy チェック: ${looked} ファイル — 安さ・怖さの言葉なし`);
