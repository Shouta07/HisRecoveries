#!/usr/bin/env node
// 静かなアンビエントベッドを生成する（ffmpeg 合成）。
//
//   node scripts/ambient.mjs [秒数] [出力名]
//   例) node scripts/ambient.mjs 30 ambient-30
//   → public/audio/ambient-30.mp3
//
// ⚠ これは**プレースホルダ**。公開前に権利処理済みの楽曲へ差し替えること。
//   高級ホテル／香水広告の音は、低い持続音＋わずかな倍音＋長い呼吸でできている。
//   ここでは 55Hz(A1) を基音に、僅かにデチューンした音を重ねて「うなり」を作り、
//   16秒周期の超低速な音量のうねりで息づかいを与えている。
//
// 実装メモ: Remotion 同梱の ffmpeg は最小構成で、afade / lowpass / tremolo /
//   anoisesrc が入っていない。使えるのは sine / volume / amix / adelay / pan など。
//   フェードもトレモロも volume の時間式（eval=frame の t）で作っている。
//
// 差し替え方: public/audio/ に音源を置き、data/films/<film>.ts の audioSrc を
//   書き換えるだけ（audioVolume で音量調整）。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPO = path.resolve(ROOT, "../..");

const seconds = Number(process.argv[2] ?? 30);
const name = process.argv[3] ?? `ambient-${seconds}`;

const FFMPEG =
  process.env.FFMPEG ??
  path.join(REPO, "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg");
if (!fs.existsSync(FFMPEG)) {
  console.error(`ffmpeg が見つからない: ${FFMPEG}\nFFMPEG=<path> で指定してください。`);
  process.exit(1);
}

const outDir = path.join(ROOT, "public", "audio");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.mp3`);

// 基音 55Hz(A1)。5度・オクターブ・その上の3度まで、上へ行くほど小さく。
// 55 と 55.22 のずれが 0.22Hz のうなり（≒4.5秒周期）を生む＝止まっていない音。
const VOICES = [
  { hz: 55.0, gain: 0.5, delayMs: 0 },
  { hz: 55.22, gain: 0.42, delayMs: 90 },
  { hz: 82.5, gain: 0.2, delayMs: 40 },
  { hz: 110.0, gain: 0.13, delayMs: 160 },
  { hz: 164.81, gain: 0.045, delayMs: 220 },
  { hz: 220.0, gain: 0.022, delayMs: 300 },
];

const inputs = VOICES.flatMap((v) => [
  "-f",
  "lavfi",
  "-t",
  String(seconds),
  "-i",
  `sine=frequency=${v.hz}:sample_rate=48000`,
]);

// 各声部: 音量 → 少し遅らせてステレオに散らす
const voiceChains = VOICES.map(
  (v, i) =>
    `[${i}:a]volume=${v.gain},adelay=${v.delayMs}|${v.delayMs + 25}:all=0[v${i}]`,
).join(";");

const mixIn = VOICES.map((_, i) => `[v${i}]`).join("");

// 呼吸（16秒周期のうねり）と、頭4秒の明転・尻5秒の暗転を1つの式で。
const fadeIn = 4;
const fadeOut = 5;
const breath = `(0.86+0.14*sin(2*PI*t/16))`;
const envelope = `min(t/${fadeIn}\\,1)*min(max(${seconds}-t\\,0)/${fadeOut}\\,1)`;

const filter = [
  voiceChains,
  `${mixIn}amix=inputs=${VOICES.length}:normalize=0[mix]`,
  `[mix]volume=volume='${breath}*${envelope}':eval=frame[env]`,
  // 左右をわずかにずらして広がりを作る（同相にしない）
  `[env]pan=stereo|c0=0.98*c0+0.06*c1|c1=0.98*c1+0.06*c0[wide]`,
  `[wide]loudnorm=I=-26:TP=-3:LRA=6[outa]`,
].join(";");

const args = [
  "-v",
  "error",
  ...inputs,
  "-filter_complex",
  filter,
  "-map",
  "[outa]",
  "-t",
  String(seconds),
  "-ac",
  "2",
  "-c:a",
  "libmp3lame",
  "-b:a",
  "192k",
  "-y",
  out,
];

const res = spawnSync(FFMPEG, args, { stdio: "inherit" });
if (res.status !== 0) process.exit(res.status ?? 1);

console.log(`✔ ${path.relative(REPO, out)}  (${seconds}s)`);
console.log("  ⚠ プレースホルダです。公開前に権利処理済みの楽曲へ差し替えてください。");
