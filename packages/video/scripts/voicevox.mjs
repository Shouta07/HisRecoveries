#!/usr/bin/env node
// VOICEVOX ナレーション合成: narration/<slug>.txt → public/audio/<slug>.wav
//
// 前提: ローカルで VOICEVOX エンジンが起動していること（既定 http://127.0.0.1:50021）。
//   VOICEVOX アプリを起動、または engine を docker/バイナリで動かす。
// 使い方:
//   node scripts/voicevox.mjs <slug> [speaker]
//   例) node scripts/voicevox.mjs skincare 13
// 生成後、data/<slug>.ts に `audioSrc: "audio/<slug>.wav"` を足すと動画に載る。
//
// txt の書式: 1行1文（空行は間として無視）。全文を1つの wav に連結合成する。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HOST = process.env.VOICEVOX_HOST || "http://127.0.0.1:50021";

const slug = process.argv[2];
const speaker = Number(process.argv[3] || process.env.VOICEVOX_SPEAKER || 13); // 13=青山龍星(落ち着いた男性)
if (!slug) {
  console.error("usage: node scripts/voicevox.mjs <slug> [speaker]");
  process.exit(1);
}

const txtPath = path.join(ROOT, "narration", `${slug}.txt`);
if (!fs.existsSync(txtPath)) {
  console.error(`narration script not found: ${txtPath}`);
  process.exit(1);
}

const lines = fs
  .readFileSync(txtPath, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

async function synthLine(text) {
  const q = await fetch(
    `${HOST}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`,
    { method: "POST" },
  );
  if (!q.ok) throw new Error(`audio_query failed: ${q.status}`);
  const query = await q.json();
  query.speedScale = Number(process.env.VOICEVOX_SPEED || 1.0);
  query.prePhonemeLength = 0.1;
  query.postPhonemeLength = 0.3; // 文末に少し間
  const s = await fetch(`${HOST}/synthesis?speaker=${speaker}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!s.ok) throw new Error(`synthesis failed: ${s.status}`);
  return Buffer.from(await s.arrayBuffer());
}

async function main() {
  // エンジン疎通確認
  try {
    const v = await fetch(`${HOST}/version`);
    if (!v.ok) throw new Error(String(v.status));
    console.log(`VOICEVOX ${await v.text()} @ ${HOST}, speaker=${speaker}`);
  } catch (e) {
    console.error(
      `VOICEVOX エンジンに接続できません (${HOST}).\n` +
        `VOICEVOX を起動してから再実行してください。詳細: ${e.message}`,
    );
    process.exit(1);
  }

  // 各行を合成 → WAV を連結（VOICEVOX の WAV は 44バイトヘッダ + PCM）
  const buffers = [];
  for (const [i, line] of lines.entries()) {
    process.stdout.write(`  [${i + 1}/${lines.length}] ${line.slice(0, 24)}…\n`);
    buffers.push(await synthLine(line));
  }
  const merged = mergeWav(buffers);

  const outDir = path.join(ROOT, "public", "audio");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.wav`);
  fs.writeFileSync(outPath, merged);
  console.log(`\n✔ ${path.relative(ROOT, outPath)} (${(merged.length / 1024 / 1024).toFixed(1)}MB)`);
  console.log(`次: data/${slug}.ts に  audioSrc: "audio/${slug}.wav"  を足して render`);
}

// 同一フォーマット前提の素朴な WAV 連結（先頭のヘッダ+全PCM、サイズ再計算）
function mergeWav(wavs) {
  const HEADER = 44;
  const pcms = wavs.map((w) => w.subarray(HEADER));
  const totalPcm = pcms.reduce((n, p) => n + p.length, 0);
  const out = Buffer.concat([wavs[0].subarray(0, HEADER), ...pcms]);
  out.writeUInt32LE(36 + totalPcm, 4); // RIFF chunk size
  out.writeUInt32LE(totalPcm, 40); // data chunk size
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
