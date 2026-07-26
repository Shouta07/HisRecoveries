#!/usr/bin/env node
// 出典リンクの生存確認。
//
// なぜ必要か: 医療系のキュレーションでリンク切れは信頼を直接損なう。
// また、引用文（quote）を追加する前には必ず原文を開いて逐語確認する必要があり、
// その入口としてもこのスクリプトを使う（docs/CURATION_PLAYBOOK.md §1-1）。
//
// 使い方:
//   npm run check:citations
//
// 注意: 実行環境から外部ネットワークに出られない場合（社内プロキシ・
// サンドボックス等）は、到達できないだけで「リンク切れ」ではありません。
// その場合は BLOCKED と表示され、終了コードは 0 のままにしています。

import { readFile } from "node:fs/promises";

const SRC = new URL("../src/lib/citations.ts", import.meta.url);
const TIMEOUT_MS = 20000;

const text = await readFile(SRC, "utf8");

// `const MSD = "..."` のような文字列定数を解決できるようにしておく
// （source: MSD のように識別子で書かれている出典があるため）。
const consts = new Map();
for (const m of text.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*"((?:[^"\\]|\\.)*)"/g)) {
  consts.set(m[1], m[2]);
}

// source と url の対を、定義順に拾う。source は文字列リテラルと識別子の両方に対応。
const entries = [];
const re =
  /source:\s*(?:"((?:[^"\\]|\\.)*)"|([A-Za-z_$][\w$]*))[\s\S]{0,400}?url:\s*"([^"]+)"/g;
for (const m of text.matchAll(re)) {
  const source = m[1] ?? consts.get(m[2]) ?? m[2];
  entries.push({ source, url: m[3] });
}

// 同一URLは1回だけ確認する。
const seen = new Map();
for (const e of entries) if (!seen.has(e.url)) seen.set(e.url, e.source);

if (seen.size === 0) {
  console.error("citations.ts から出典を抽出できませんでした。");
  process.exit(1);
}

console.log(`出典リンク ${seen.size} 件を確認します…\n`);

async function check(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    // HEAD を拒否するサイトがあるため GET で確認（本文は読み捨てる）。
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctl.signal,
      headers: { "user-agent": "HisRecoveries-link-check/1.0" },
    });
    return { ok: res.ok, status: res.status, finalUrl: res.url };
  } catch (err) {
    return { ok: false, status: 0, error: err?.cause?.code ?? err?.name ?? String(err) };
  } finally {
    clearTimeout(timer);
  }
}

const results = await Promise.all(
  [...seen.entries()].map(async ([url, source]) => ({ url, source, ...(await check(url)) })),
);

let dead = 0;
let blocked = 0;

for (const r of results) {
  if (r.ok) {
    const moved = r.finalUrl && r.finalUrl !== r.url;
    console.log(`  OK      ${r.status}  ${r.source}`);
    if (moved) console.log(`          ↳ リダイレクト先: ${r.finalUrl}`);
  } else if (r.status === 0 || r.status === 403 || r.status === 407) {
    // 到達不可、またはプロキシの拒否。
    // 403/407 は egress ポリシーによる遮断で返る代表的なコードで、
    // 「サイトが消えた」ことを意味しない（bot 対策で 403 を返すサイトもある）。
    // リンク切れと誤って報告しないため、DEAD ではなく BLOCKED として扱う。
    blocked++;
    console.log(`  BLOCKED ${r.status || "--"}  ${r.source}  (${r.error ?? "拒否された"})`);
    console.log(`          ↳ ${r.url}`);
  } else {
    dead++;
    console.log(`  DEAD    ${r.status}  ${r.source}`);
    console.log(`          ↳ ${r.url}`);
  }
}

console.log(
  `\n結果: OK ${results.length - dead - blocked} / DEAD ${dead} / BLOCKED ${blocked}（計 ${results.length}）`,
);

if (blocked > 0) {
  console.log(
    "\nBLOCKED は、この実行環境から当該ホストに到達できなかったことを示します" +
      "（egress ポリシーによる遮断や bot 対策の 403 を含む）。" +
      "\nリンク切れとは限らないため、ネットワーク制限のない環境で再実行して確認してください。",
  );
}

if (dead > 0) {
  console.error("\nリンク切れが見つかりました。citations.ts を更新してください。");
  process.exit(1);
}
