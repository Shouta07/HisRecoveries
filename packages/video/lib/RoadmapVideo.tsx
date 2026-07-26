import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONT } from "./theme";
import { ensureFont } from "./fonts";

// ============================================================
// RoadmapVideo — 記事の「整える順番」型を縦動画にする汎用テンプレート。
// 記事1本 = data 1つ（remotion/data/*.ts）。AIに data だけ生成させれば量産できる。
// docs/AI_MARKETING_ENGINE.md §3-⑤（記事→動画流用）の実装。
// 構成: フック → 問題提起 → ステップ(可変) → 締め。1080×1920 / 30fps。
// ============================================================

export type Line = { text: string; accent?: string };
export type RoadmapStep = { n: string; t: string; d: string };
export type RoadmapData = {
  eyebrow: string;
  hook: Line[]; // 大見出し（複数行）
  problem: { lead: Line[]; punch: Line[] };
  steps: RoadmapStep[];
  close: { lead: Line[]; punch: Line[] };
  tagline?: string; // 既定: 男の「変わりたい」に、伴走する。
};

// シーンの尺（フレーム）
const HOOK = 105;
const PROBLEM = 150;
const STEP = 128;
const CLOSE = 253;

export function roadmapDuration(data: RoadmapData): number {
  return HOOK + PROBLEM + data.steps.length * STEP + CLOSE;
}

// accent 部分だけセージで強調して1行を描く
const Accented: React.FC<{ line: Line; color: string }> = ({ line, color }) => {
  if (!line.accent || !line.text.includes(line.accent)) {
    return <span style={{ color }}>{line.text}</span>;
  }
  const [before, after] = line.text.split(line.accent);
  return (
    <span style={{ color }}>
      {before}
      <span style={{ color: COLORS.sageBright }}>{line.accent}</span>
      {after}
    </span>
  );
};

const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 85% 55% at 50% 30%, #24382b 0%, #16241A 55%, #0f1a12 100%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: -220,
        left: "50%",
        width: 760,
        height: 760,
        transform: "translateX(-50%)",
        borderRadius: "50%",
        background: "rgba(133,171,139,0.16)",
        filter: "blur(120px)",
      }}
    />
  </AbsoluteFill>
);

const Scene: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 14, durationInFrames - 16, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill
      style={{
        opacity,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 110px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 46, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.9 } });
  const translateY = interpolate(s, [0, 1], [y, 0]);
  const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ transform: `translateY(${translateY}px)`, opacity, ...style }}>{children}</div>;
};

const H: React.FC<{ size?: number; weight?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size = 96,
  weight = 900,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1.32,
      letterSpacing: "0.01em",
      color: COLORS.cream,
      fontFeatureSettings: '"palt" 1',
      ...style,
    }}
  >
    {children}
  </div>
);

const Lines: React.FC<{ lines: Line[]; size: number; weight?: number; color?: string; style?: React.CSSProperties }> = ({
  lines,
  size,
  weight = 900,
  color = COLORS.cream,
  style,
}) => (
  <H size={size} weight={weight} style={style}>
    {lines.map((l, i) => (
      <div key={i}>
        <Accented line={l} color={color} />
      </div>
    ))}
  </H>
);

const StepScene: React.FC<{ step: RoadmapStep }> = ({ step }) => (
  <div style={{ width: "100%", maxWidth: 820 }}>
    <Rise delay={2}>
      <div
        style={{
          margin: "0 auto 44px",
          width: 132,
          height: 132,
          borderRadius: "50%",
          background: COLORS.sage,
          color: COLORS.bg,
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {step.n}
      </div>
    </Rise>
    <Rise delay={10}>
      <H size={72}>{step.t}</H>
    </Rise>
    <Rise delay={20}>
      <div
        style={{
          marginTop: 28,
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 40,
          lineHeight: 1.85,
          color: COLORS.creamSub,
          fontFeatureSettings: '"palt" 1',
        }}
      >
        {step.d}
      </div>
    </Rise>
  </div>
);

export const RoadmapVideo: React.FC<{ data: RoadmapData }> = ({ data }) => {
  ensureFont();
  const stepsStart = HOOK + PROBLEM; // 255
  const closeStart = stepsStart + data.steps.length * STEP;
  const total = closeStart + CLOSE;
  const tagline = data.tagline ?? "男の「変わりたい」に、伴走する。";

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background />

      {/* ① フック */}
      <Sequence durationInFrames={HOOK}>
        <Scene durationInFrames={HOOK}>
          <Rise delay={2}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 30,
                letterSpacing: 10,
                color: COLORS.sage,
                textTransform: "uppercase",
                marginBottom: 40,
              }}
            >
              {data.eyebrow}
            </div>
          </Rise>
          <Rise delay={12}>
            <Lines lines={data.hook} size={108} />
          </Rise>
        </Scene>
      </Sequence>

      {/* ② 問題提起 */}
      <Sequence from={HOOK} durationInFrames={PROBLEM}>
        <Scene durationInFrames={PROBLEM}>
          <Rise delay={2}>
            <Lines lines={data.problem.lead} size={62} weight={700} color={COLORS.creamSub} />
          </Rise>
          <Rise delay={26}>
            <Lines lines={data.problem.punch} size={84} style={{ marginTop: 56 }} />
          </Rise>
        </Scene>
      </Sequence>

      {/* ③ ステップ */}
      {data.steps.map((step, i) => (
        <Sequence key={step.n} from={stepsStart + i * STEP} durationInFrames={STEP}>
          <Scene durationInFrames={STEP}>
            <StepScene step={step} />
          </Scene>
        </Sequence>
      ))}

      {/* ④ 締め */}
      <Sequence from={closeStart} durationInFrames={total - closeStart}>
        <Scene durationInFrames={total - closeStart}>
          <Rise delay={2}>
            <Lines lines={data.close.lead} size={70} weight={700} color={COLORS.creamSub} />
          </Rise>
          <Rise delay={22}>
            <Lines lines={data.close.punch} size={92} style={{ marginTop: 44 }} />
          </Rise>
          <Rise delay={46} style={{ marginTop: 96 }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: "0.06em", color: COLORS.cream }}>
              His Recoveries
            </div>
            <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 400, fontSize: 34, color: COLORS.sage }}>
              {tagline}
            </div>
          </Rise>
        </Scene>
      </Sequence>
    </AbsoluteFill>
  );
};
