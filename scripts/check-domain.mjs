// 正式ドメインが、1か所から出ているかを見る。
//
// ══════════════════════════════════════════════════
// 決まっていること
// ══════════════════════════════════════════════════
// 正式ドメインは tashikame.app。
// hisrecoveries.com は旧ドメインで、301 の移行元としてのみ扱う。
//
// 配信されるURL（canonical・OGP・sitemap・robots・feed・
// Stripe の戻り先・メール文面・法務ページ・CTA）は、
// すべて lib/site.ts の site.url から作る。
//
// ══════════════════════════════════════════════════
// 2つのことを見る
// ══════════════════════════════════════════════════
// 1. 旧ドメインが、URLとして残っていないこと
//
//    実際に残っていた。Threads のCTA（apps/threads）が
//    hisrecoveries.com/ask を指したままで、
//    投稿に載る行き先が旧ドメインになっていた。
//    src/ だけ直しても、外に出ていく口が直っていなかった。
//
// 2. 新しいドメインが、src/ にベタ書きされていないこと
//
//    ベタ書きが1つでもあると、site.url を変えたときに
//    そこだけ取り残される。次にドメインを動かすとき、
//    同じ探し回りをもう一度やることになる。
//    site.ts だけが持つ。
//
// ══════════════════════════════════════════════════
// 何を見ないか
// ══════════════════════════════════════════════════
// コメント    設計の理由として旧ドメインの名前が出る（移行の経緯）
// *.md        docs/DOMAIN_MIGRATION.md は移行手順そのもの
// 投稿済みの記録  何を出したかの記録。書き換えると記録が嘘になる
// *.substack.com などの外部アカウント
//             hisrecoveries.substack.com は別のサービスのアカウント名で、
//             旧ドメインではない。勝手に変えるとリンクが切れる。

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

const OLD = "hisrecoveries.com";
const NEW = "tashikame.app";

/** URLを作る側。ここに旧ドメインがあってはいけない */
const LOOK = [
  "src",
  "apps/threads",
  "packages",
  "scripts",
  "next.config.mjs",
];

/** 見る拡張子。*.md は見ない（移行の手順書が旧ドメインを説明する） */
const EXT = /\.(tsx?|mjs|cjs|jsx?|json|py)$/;

const SKIP = [
  "node_modules",
  ".next",
  "src/lib/site.ts", // 正式URLを持つ唯一の場所
  // この判定そのもの。旧ドメインの名前を定数として持っている
  "scripts/check-domain.mjs",
];

/* ── コメントを外す ─────────────────────────────────
   設計の理由は日本語のコメントに書いてあるので、
   「旧ドメイン（hisrecoveries.com）からの301は…」のような行が
   そのまま引っかかる。

   scripts/check-copy.mjs にも同じものがある。
   どちらも「コメントを外してから本文を見る」ためのもので、
   片方を直したらもう片方も直すこと。 */
function stripComments(src, file) {
  // Python は # から行末まで。三連引用符は文字列なので残す
  if (file.endsWith(".py")) {
    return src
      .split("\n")
      .map((l) => {
        let q = null;
        for (let i = 0; i < l.length; i += 1) {
          const c = l[i];
          if (q) {
            if (c === "\\") { i += 1; continue; }
            if (c === q) q = null;
            continue;
          }
          if (c === '"' || c === "'") { q = c; continue; }
          if (c === "#") return l.slice(0, i);
        }
        return l;
      })
      .join("\n");
  }
  // JSON にコメントは無い
  if (file.endsWith(".json")) return src;

  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") { out += c + (next ?? ""); i += 2; continue; }
      if (c === quote) quote = null;
      out += c;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i += 1; continue; }
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

async function files(p) {
  if (SKIP.some((s) => p === s || p.startsWith(`${s}/`))) return [];
  let entries;
  try {
    entries = await readdir(join(ROOT, p), { withFileTypes: true });
  } catch {
    // ディレクトリでなければ、ファイル1つとして見る
    return EXT.test(p) ? [p] : [];
  }
  const out = [];
  for (const e of entries) {
    const rel = `${p}/${e.name}`;
    if (SKIP.some((s) => rel === s || rel.startsWith(`${s}/`))) continue;
    if (e.isDirectory()) out.push(...(await files(rel)));
    else if (EXT.test(e.name)) out.push(rel);
  }
  return out;
}

/** 投稿済みのものは、記録なので書き換えない。見るのもやめる */
async function postedLines(file) {
  if (!file.endsWith("approvals.json")) return new Set();
  const skip = new Set();
  try {
    const d = JSON.parse(await readFile(join(ROOT, file), "utf8"));
    const raw = (await readFile(join(ROOT, file), "utf8")).split("\n");
    for (const it of d.items ?? []) {
      if (!it.posted_at) continue;
      // 投稿済みの id が出てくる行から、次の id までを見ない
      const at = raw.findIndex((l) => l.includes(`"${it.id}"`));
      if (at < 0) continue;
      for (let i = at; i < raw.length; i += 1) {
        if (i > at && /"id":\s*"/.test(raw[i])) break;
        skip.add(i + 1);
      }
    }
  } catch { /* 読めないなら、ふつうに見る */ }
  return skip;
}

const old = [];
const hard = [];

for (const base of LOOK) {
  for (const f of await files(base)) {
    const raw = await readFile(join(ROOT, f), "utf8");
    const src = stripComments(raw, f);
    const skipLines = await postedLines(f);
    src.split("\n").forEach((line, n) => {
      if (skipLines.has(n + 1)) return;
      if (line.includes(OLD)) {
        old.push({ f, n: n + 1, line: line.trim().slice(0, 100) });
      }
      // 正式ドメインのベタ書きは src/ の中だけ見る。
      // apps/threads は別のアプリで、site.ts を読めない。
      if (f.startsWith("src/") && line.includes(NEW)) {
        hard.push({ f, n: n + 1, line: line.trim().slice(0, 100) });
      }
    });
  }
}

let bad = false;

if (old.length > 0) {
  bad = true;
  console.error(`旧ドメイン（${OLD}）が、URLとして残っています。`);
  console.error("");
  for (const h of old) console.error(`  ${h.f}:${h.n}\n    ${h.line}`);
  console.error("");
  console.error(`正式ドメインは ${NEW} です。`);
  console.error(`${OLD} は 301 の移行元としてのみ扱います（docs/DOMAIN_MIGRATION.md）。`);
  console.error("");
}

if (hard.length > 0) {
  bad = true;
  console.error(`正式ドメイン（${NEW}）が、src/ にベタ書きされています。`);
  console.error("");
  for (const h of hard) console.error(`  ${h.f}:${h.n}\n    ${h.line}`);
  console.error("");
  console.error("正式URLを持つのは src/lib/site.ts だけです。");
  console.error("ほかの場所は site.url を読んでください。");
  console.error("ベタ書きが1つでもあると、ドメインを動かしたときにそこだけ残ります。");
  console.error("");
}

if (bad) process.exit(1);

console.log(`ドメインチェック: 正式 ${NEW} — 旧ドメインの残り0件 / ベタ書き0件`);
