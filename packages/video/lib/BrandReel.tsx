import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { MOTION, REEL, type Tone } from "./brand";
import { ensureReelFonts } from "./reel/fonts";
import { Backdrop } from "./reel/stage";
import {
  SceneBrand,
  SceneConcerns,
  SceneConfidence,
  SceneCta,
  SceneDesire,
  type ConcernEntry,
} from "./reel/scenes";
import type { Line } from "./reel/atoms";

// ============================================================
// BrandReel — Instagram リール（30秒 / 9:16 / 1080×1920 / 30fps）
//
// 目的: 男性ウェルネスブランドの認知獲得。売り込まず、名前を置いて帰る。
// トーン: Aesop / Kinfolk。明朝・細字・広い字間・深い余白・緩慢なズーム。
// 色: www.hisrecoveries.com と同一（lib/brand.ts に実測値）。
//
// 構成（合計 900 フレーム = 30.0 秒）
//   1. もっといい男になりたい      0–150   (5.0s)  深緑
//   2. 男性の悩み（肌/体/清潔感） 150–360   (7.0s)  深緑
//   3. His Recoveries とは       360–555   (6.5s)  明転 ← 回復の合図
//   4. 小さな改善が自信になる     555–735   (6.0s)  明
//   5. CTA                      735–900   (5.5s)  深緑へ戻る
// ============================================================

export type { Line };

export type BrandReelData = {
  /** Scene1 の小ラベル（例: HIS RECOVERIES） */
  eyebrow: string;
  desire: { headline: Line[]; note: Line[] };
  concerns: { lead: Line[]; items: ConcernEntry[]; punch: Line[] };
  brand: { lead: Line[]; body: Line[] };
  confidence: { headline: Line[]; body: Line[] };
  cta: { lead: Line[]; cta: Line[]; url: string; handle?: string };
  /** ナレーション（VOICEVOX）。public/ からの相対パス。未設定なら無音。 */
  audioSrc?: string;
};

/** シーンの尺（フレーム）。合計が REEL.durationInFrames と一致すること。 */
export const SCENE_FRAMES = {
  desire: 150,
  concerns: 210,
  brand: 195,
  confidence: 180,
  cta: 165,
} as const;

type Slot = { key: keyof typeof SCENE_FRAMES; from: number; duration: number; tone: Tone };

/** 開始フレームとトーンを1か所で決める（地色のクロスフェードもこれを見る）。 */
export const SCHEDULE: Slot[] = (() => {
  const tones: Record<keyof typeof SCENE_FRAMES, Tone> = {
    desire: "dark",
    concerns: "dark",
    brand: "light",
    confidence: "light",
    cta: "dark",
  };
  let at = 0;
  return (Object.keys(SCENE_FRAMES) as (keyof typeof SCENE_FRAMES)[]).map((key) => {
    const slot: Slot = { key, from: at, duration: SCENE_FRAMES[key], tone: tones[key] };
    at += SCENE_FRAMES[key];
    return slot;
  });
})();

export const brandReelDuration = (): number =>
  SCHEDULE.reduce((sum, s) => sum + s.duration, 0);

export const BrandReel: React.FC<{ data: BrandReelData }> = ({ data }) => {
  ensureReelFonts();

  // 同じトーンが続く境目では、次のシーンへ overlap ぶん食い込ませる。
  // 抜けと入りのフェードが重なり、切れ目のないディゾルブになる。
  // トーンが変わる境目では重ねない。明転の途中に前の文字（明色）が残ると、
  // 明るくなった地に埋もれて濁るため。文字が消えた一瞬に、光だけが入れ替わる。
  const span = (s: Slot) => {
    const i = SCHEDULE.indexOf(s);
    const next = SCHEDULE[i + 1];
    if (!next) return s.duration;
    return next.tone === s.tone ? s.duration + MOTION.overlap : s.duration;
  };

  const slot = (key: keyof typeof SCENE_FRAMES) => SCHEDULE.find((s) => s.key === key)!;

  const desire = slot("desire");
  const concerns = slot("concerns");
  const brand = slot("brand");
  const confidence = slot("confidence");
  const cta = slot("cta");

  return (
    <AbsoluteFill>
      <Backdrop schedule={SCHEDULE.map((s) => ({ from: s.from, tone: s.tone }))} />

      {data.audioSrc ? <Audio src={staticFile(data.audioSrc)} /> : null}

      <Sequence from={desire.from} durationInFrames={span(desire)} name="1 もっといい男に">
        <SceneDesire
          data={{ eyebrow: data.eyebrow, ...data.desire }}
          durationInFrames={span(desire)}
        />
      </Sequence>

      <Sequence from={concerns.from} durationInFrames={span(concerns)} name="2 悩み">
        <SceneConcerns data={data.concerns} durationInFrames={span(concerns)} />
      </Sequence>

      <Sequence from={brand.from} durationInFrames={span(brand)} name="3 His Recoveries とは">
        <SceneBrand data={data.brand} durationInFrames={span(brand)} />
      </Sequence>

      <Sequence from={confidence.from} durationInFrames={span(confidence)} name="4 小さな改善">
        <SceneConfidence data={data.confidence} durationInFrames={span(confidence)} />
      </Sequence>

      <Sequence from={cta.from} durationInFrames={span(cta)} name="5 CTA">
        <SceneCta data={data.cta} durationInFrames={span(cta)} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** 尺の取り違えを起動時に気づけるように（900 フレーム = 30.0 秒）。 */
if (brandReelDuration() !== REEL.durationInFrames) {
  // eslint-disable-next-line no-console
  console.warn(
    `[BrandReel] 尺が合っていない: SCENE_FRAMES 合計 ${brandReelDuration()} / 期待 ${REEL.durationInFrames}`,
  );
}
