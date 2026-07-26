import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONT } from "../lib/theme";
import { ensureFont } from "../lib/fonts";

// ============================================================
// Refine × 動画 #1 — 記事「自分磨きは、何から？ 男の始め方」から。
// docs/AI_MARKETING_ENGINE.md §3 のパイプライン ⑤（記事→動画流用）の実地テスト。
// トーン: 当事者・静か・煽らない。中身は記事の「整える順番」そのまま。
// 縦 1080×1920 / 30fps / 34s(1020f)。
// ============================================================

const STEPS = [
  { n: "01", t: "まず、見た目の清潔感", d: "髪・眉・肌・服。手応えが、いちばん早い。" },
  { n: "02", t: "次に、続く習慣を1つ", d: "睡眠でも、散歩でも。1つ続いてから、次。" },
  { n: "03", t: "全部を、一度にやらない", d: "同時に始めると、たいてい全部崩れる。" },
  { n: "04", t: "比べるのは、昨日の自分", d: "他人の完成形じゃない。写真で、定点観測。" },
];

// 背景（サイトのヒーローと同じ深緑グラデ＋上部のセージの光）
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

// シーン全体の in/out フェード。各シーンは自身の長さ分だけ表示。
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

// 1行ずつ下から静かに立ち上げる。
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

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
    {children}
  </div>
);

const H: React.FC<{ size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size = 96,
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
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

const StepScene: React.FC<{ step: (typeof STEPS)[number] }> = ({ step }) => (
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
      <H size={72} style={{ color: COLORS.cream }}>
        {step.t}
      </H>
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

export const Jibunmigaki: React.FC = () => {
  ensureFont();
  const stepLen = 128;
  const stepsStart = 255;
  const closeStart = stepsStart + STEPS.length * stepLen; // 767

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Background />

      {/* ① フック */}
      <Sequence durationInFrames={105}>
        <Scene durationInFrames={105}>
          <Rise delay={2}>
            <Eyebrow>His Recoveries</Eyebrow>
          </Rise>
          <Rise delay={12}>
            <H size={108}>
              「自分磨き、
              <br />
              何から？」
            </H>
          </Rise>
        </Scene>
      </Sequence>

      {/* ② 問題提起 */}
      <Sequence from={105} durationInFrames={150}>
        <Scene durationInFrames={150}>
          <Rise delay={2}>
            <H size={62} style={{ color: COLORS.creamSub, fontWeight: 700 }}>
              情報が多すぎて、
              <br />
              動けない。
            </H>
          </Rise>
          <Rise delay={26}>
            <H size={84} style={{ marginTop: 56 }}>
              才能じゃない。
              <br />
              <span style={{ color: COLORS.sageBright }}>順番</span>の問題。
            </H>
          </Rise>
        </Scene>
      </Sequence>

      {/* ③ 整える順番（4ステップ） */}
      {STEPS.map((step, i) => (
        <Sequence key={step.n} from={stepsStart + i * stepLen} durationInFrames={stepLen}>
          <Scene durationInFrames={stepLen}>
            <StepScene step={step} />
          </Scene>
        </Sequence>
      ))}

      {/* ④ 締め */}
      <Sequence from={closeStart} durationInFrames={1020 - closeStart}>
        <Scene durationInFrames={1020 - closeStart}>
          <Rise delay={2}>
            <H size={70} style={{ color: COLORS.creamSub, fontWeight: 700 }}>
              全部やろうとするのを、
              <br />
              やめる。
            </H>
          </Rise>
          <Rise delay={22}>
            <H size={92} style={{ marginTop: 44 }}>
              そこが、<span style={{ color: COLORS.sageBright }}>出発点</span>。
            </H>
          </Rise>
          <Rise delay={46} style={{ marginTop: 96 }}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 52,
                letterSpacing: "0.06em",
                color: COLORS.cream,
              }}
            >
              His Recoveries
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: 34,
                color: COLORS.sage,
              }}
            >
              男の「変わりたい」に、伴走する。
            </div>
          </Rise>
        </Scene>
      </Sequence>
    </AbsoluteFill>
  );
};
