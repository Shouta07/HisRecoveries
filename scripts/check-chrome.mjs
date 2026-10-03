// プロダクトの面に、記事サイトのヘッダーが重なっていないかを見る。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// components/Header.tsx は、記事サイトのヘッダー
// （「たしかメディア by タシカメ」＋編集方針＋検索）を出す。
//
// プロダクトの面（相談・料金・体験など）は、それ自体が
// 1つのサービスなので、そのヘッダーは出さない。
// 出さないページの一覧が BRAND_PAGES / BRAND_PREFIXES。
//
// この一覧は手で書く。だから、新しい面を足したときに
// 入れ忘れる。入れ忘れても何も落ちない。
// 画面の上にヘッダーが2つ並ぶだけで、ビルドは緑になる。
//
// 実際そうなった。/trial を足したとき、
//   たしかメディア by タシカメ ／ 編集方針 ／ 確かめる
//   タシカメ ／ 体験
// と、ヘッダーが2段で出た。広告の着地点でこれが起きていた。
//
// ══════════════════════════════════════════════════
// 何を見るか
// ══════════════════════════════════════════════════
// src/app の中で data-brand を持つページを探す。
// data-brand は「プロダクトの面」の印（globals.css が色を切り替える）。
//
// その面のルートが、Header の一覧に入っているかを確かめる。
// 入っていなければ、ここで止める。
//
// /admin は見ない（運営だけが見る画面で、記事サイトの導線に乗らない）。

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const APP = "src/app";

/** 見ないルート。運営だけが見る画面 */
const SKIP_ROUTES = [/^\/admin(\/|$)/];

/** src/app の中の page.tsx を全部集める */
async function pages(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await pages(rel)));
    else if (e.name === "page.tsx") out.push(rel);
  }
  return out;
}

/** src/app/foo/[bar]/page.tsx → /foo/[bar] */
function routeOf(file) {
  const r = file.slice(APP.length).replace(/\/page\.tsx$/, "");
  // ルートグループ（(group)）はURLに出ない
  return (r.replace(/\/\([^/]+\)/g, "") || "/");
}

/* ── Header.tsx から一覧を読む ─────────────────────── */
const header = await readFile(join(ROOT, "src/components/Header.tsx"), "utf8");

function listOf(name) {
  const m = header.match(new RegExp(`const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) {
    console.error(`Header.tsx に ${name} が見つかりません`);
    process.exit(1);
  }
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const BRAND_PAGES = listOf("BRAND_PAGES");
const BRAND_PREFIXES = listOf("BRAND_PREFIXES");

/** Header がこのルートでヘッダーを出さないか */
function covered(route) {
  if (route === "/") return true; // トップは自前のナビを持つ（Header 側で除外）
  if (BRAND_PAGES.includes(route)) return true;
  // 動的なルート（/ask/[token]）は、前方一致で見る
  return BRAND_PREFIXES.some((p) => route.startsWith(p) || `${route}/`.startsWith(p));
}

const missing = [];

for (const f of await pages(APP)) {
  const route = routeOf(f);
  if (SKIP_ROUTES.some((re) => re.test(route))) continue;
  const src = await readFile(join(ROOT, f), "utf8");
  if (!src.includes("data-brand")) continue;
  if (!covered(route)) missing.push({ route, f });
}

if (missing.length > 0) {
  console.error("プロダクトの面に、記事サイトのヘッダーが重なります。");
  console.error("");
  for (const m of missing) {
    console.error(`  ${m.route}  (${m.f})`);
  }
  console.error("");
  console.error("src/components/Header.tsx の BRAND_PAGES か");
  console.error("BRAND_PREFIXES に、このルートを足してください。");
  console.error("足さないと、画面の上にヘッダーが2段で出ます。");
  process.exit(1);
}

const n = BRAND_PAGES.length + BRAND_PREFIXES.length;
console.log(`chrome チェック: プロダクトの面 ${n} 件 — ヘッダーの重なりなし`);
