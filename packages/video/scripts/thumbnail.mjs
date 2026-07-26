#!/usr/bin/env node
// サムネイル生成: thumbnails.json の1件を、ブランド調の 1280x720 PNG に。
// YouTube/OGP 用。Playwright で HTML を描画してスクショ（ネット不要・ローカル完結）。
//
//   node scripts/thumbnail.mjs <slug>
//   node scripts/thumbnail.mjs all      # 全件
// 出力: out/thumb/<slug>.png

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPage } from "./lib/browser.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, "thumbnails.json"), "utf-8"),
);

// ブランド色（lib/theme.ts と対応）
const COLORS = {
  bg: "#16241A",
  cream: "#EDF1E8",
  sage: "#9ec4a3",
  sageBright: "#b7d8bb",
  creamSub: "#c9d2c4",
};

function fontPath() {
  // public/fonts の Noto Sans JP を data URL 化して埋め込む（オフライン描画）
  const dir = path.join(ROOT, "public", "fonts");
  const cands = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const bold =
    cands.find((f) => /bold|700|900/i.test(f) && /\.(woff2?|ttf|otf)$/i.test(f)) ||
    cands.find((f) => /\.(woff2?|ttf|otf)$/i.test(f));
  if (!bold) return null;
  const buf = fs.readFileSync(path.join(dir, bold));
  const mime = bold.endsWith(".woff2")
    ? "font/woff2"
    : bold.endsWith(".woff")
      ? "font/woff"
      : bold.endsWith(".otf")
        ? "font/otf"
        : "font/ttf";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function html({ title, subtitle }, fontDataUrl) {
  const face = fontDataUrl
    ? `@font-face{font-family:'HRJP';src:url('${fontDataUrl}');font-weight:900;}`
    : "";
  const family = fontDataUrl
    ? "'HRJP',sans-serif"
    : "system-ui,-apple-system,'Noto Sans JP',sans-serif";
  const titleHtml = String(title).replace(/\n/g, "<br>");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${face}
    *{margin:0;box-sizing:border-box}
    html,body{width:1280px;height:720px}
    body{
      font-family:${family};
      background:radial-gradient(ellipse 85% 60% at 32% 30%, #24382b 0%, ${COLORS.bg} 60%, #0f1a12 100%);
      color:${COLORS.cream};
      display:flex;flex-direction:column;justify-content:center;
      padding:0 96px;
    }
    .eyebrow{font-family:monospace;letter-spacing:10px;color:${COLORS.sage};
      font-size:22px;text-transform:uppercase;margin-bottom:28px}
    .title{font-weight:900;font-size:104px;line-height:1.24;letter-spacing:.01em;
      font-feature-settings:'palt' 1}
    .accent{color:${COLORS.sageBright}}
    .sub{margin-top:34px;font-weight:400;font-size:40px;color:${COLORS.creamSub};
      font-feature-settings:'palt' 1}
    .brand{position:absolute;right:96px;bottom:64px;font-weight:900;font-size:34px;
      letter-spacing:.06em}
  </style></head><body>
    <div class="eyebrow">His Recoveries</div>
    <div class="title">${titleHtml}</div>
    <div class="sub">${subtitle ?? ""}</div>
    <div class="brand">His Recoveries</div>
  </body></html>`;
}

async function one(slug) {
  const data = registry[slug];
  if (!data) throw new Error(`thumbnails.json に "${slug}" がありません`);
  const outDir = path.join(ROOT, "out", "thumb");
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${slug}.png`);
  await withPage({ width: 1280, height: 720 }, async (page) => {
    await page.setContent(html(data, fontPath()), { waitUntil: "networkidle" });
    await page.screenshot({ path: out });
  });
  console.log(`✔ ${path.relative(ROOT, out)}`);
}

const arg = process.argv[2];
if (!arg) {
  console.error("usage: node scripts/thumbnail.mjs <slug|all>");
  process.exit(1);
}
const slugs = arg === "all" ? Object.keys(registry) : [arg];
for (const s of slugs) await one(s);
