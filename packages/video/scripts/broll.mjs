#!/usr/bin/env node
// 素材キャプチャ(b-roll): URL を縦画面でスクショして動画の実写カットに使う。
// Playwright で描画 → public/broll/<name>.png（Remotion から Img で読める）。
//
//   node scripts/broll.mjs <url> <name> [--full]
//   例) node scripts/broll.mjs https://www.hisrecoveries.com/areas/skin areas-skin
// --full でページ全体、無指定でファーストビュー(1080x1920)。
// ※ ネットワーク到達が前提（サンドボックスの制約で失敗する場合あり）。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage } from "./lib/browser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const url = process.argv[2];
const name = process.argv[3];
const fullPage = process.argv.includes("--full");
if (!url || !name) {
  console.error("usage: node scripts/broll.mjs <url> <name> [--full]");
  process.exit(1);
}

const outDir = path.join(ROOT, "public", "broll");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.png`);

await withPage({ width: 1080, height: 1920 }, async (page) => {
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await page.screenshot({ path: out, fullPage });
});
console.log(`✔ ${path.relative(ROOT, out)}  (data/ で Img として利用可)`);
