// 金額が、画面に直接書かれていないかを見る。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// 値段は lib/ask/plans.ts の1か所で決まっている、はずだった。
//
// 実際には、受付の表（Timetable.tsx）に
//   <span>15分</span><span>¥5,980</span>
//   <span>30分</span><span>¥9,800</span>
// と手で書いてあった。
//
// plans.ts の値段を変えても、この表だけ古いまま残る。
// しかも「30分」は商品ごと消したのに、リンクだけ生きていて、
// 押すと存在しないプランへ飛ぶようになっていた。
//
// TypeScript はこれを見つけられない。ただの文字列だから。
// だからファイルのほうから見る。
//
// ══════════════════════════════════════════════════
// 何を見て、何を見ないか
// ══════════════════════════════════════════════════
// 見る:   画面（src/app, src/components）に書かれた ¥1,234 / 1,234円 / 1234円
// 見ない: コメント（なぜその値段にしたかを日本語で書いてある）
//         lib/ask/plans.ts と lib/economics.ts（値段そのものを決める場所）
//         /admin（運営だけが見る画面）
//         記事（clusters.ts。施術の相場などを書いている）
//
// ══════════════════════════════════════════════════
// 逃げ道を1つだけ置く
// ══════════════════════════════════════════════════
// どうしても直に書く必要があるとき（説明のための例など）は、
// その行に allow-hardcoded-price と書く。
// 書けば通るが、書いた事実がコードに残る。

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const LOOK = ["src/app", "src/components"];
const SKIP = [
  "src/app/admin",
  // 値段を決めている場所そのもの
  "src/lib/ask/plans.ts",
  "src/lib/economics.ts",
];

/** 画面に出る金額の書き方。3桁以上の数字だけを見る（「1回」「5回」は拾わない） */
const MONEY = /(?:¥|￥)\s?\d{1,3}(?:,\d{3})+|(?:¥|￥)\s?\d{3,}|\d{1,3}(?:,\d{3})+\s?円|\d{3,}\s?円/;

const ESCAPE = "allow-hardcoded-price";

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    const rel = relative(ROOT, full);
    if (SKIP.some((s) => rel === s || rel.startsWith(s + "/"))) continue;
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(tsx|ts)$/.test(e.name)) out.push(full);
  }
  return out;
}

/**
 * コメントを落とす。
 *
 * このリポジトリは、なぜその値段にしたかを日本語のコメントで
 * 長く書いてある。そこを見ると、ほぼ全部が引っかかる。
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => (/^\s*\/\//.test(l) ? "" : l.replace(/\s\/\/.*$/, "")))
    .join("\n");
}

const hits = [];
for (const dir of LOOK) {
  for (const file of await walk(join(ROOT, dir))) {
    const raw = await readFile(file, "utf8");
    const lines = stripComments(raw).split("\n");
    lines.forEach((line, i) => {
      if (line.includes(ESCAPE)) return;
      const m = line.match(MONEY);
      if (!m) return;
      hits.push({ file: relative(ROOT, file), line: i + 1, text: m[0], src: line.trim() });
    });
  }
}

if (hits.length > 0) {
  console.error("\n画面に金額が直接書かれています。plans.ts から引いてください。\n");
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  ${h.text}`);
    console.error(`    ${h.src.slice(0, 110)}`);
  }
  console.error(
    `\n値段は lib/ask/plans.ts の1か所で決めています。` +
      `\n書き写すと、値段を変えたときにここだけ古いまま残ります。` +
      `\nどうしても直に書くなら、その行に ${ESCAPE} と書いてください。\n`,
  );
  process.exit(1);
}

console.log("価格チェック: 画面に直接書かれた金額はありません");
