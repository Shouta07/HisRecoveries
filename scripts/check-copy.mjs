// 安売りの言葉が、画面に入っていないかを見る。
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

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LOOK = ["src/app", "src/components", "src/lib/ask", "src/lib/responder"];

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
    return found;
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
      for (const w of CHEAP) {
        if (line.includes(w)) hits.push({ f, n: n + 1, w, line: line.trim().slice(0, 90) });
      }
    });
  }
}

if (hits.length > 0) {
  console.error("安売りの言葉が画面に入っています。");
  console.error("");
  console.error("この商品の原価は、答える女性への支払いです。");
  console.error("値段を下げると、その人たちへの支払いを下げることになり、");
  console.error("書かれる回答が薄くなります。薄い回答は、次の人が買わない理由になります。");
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

console.log(`copy チェック: ${looked} ファイル — 安売りの言葉なし`);
