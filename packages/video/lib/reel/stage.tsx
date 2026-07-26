import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { LAYOUT, MOTION, TONES, easeInOut, easeOut, type Tone } from "../brand";

// ============================================================
// 下地層 — 地色・粒子・スクリム・シーンの器
// ============================================================

/** 現在のシーンのトーン。atoms 側が文字色を自分で決めるために使う。 */
export const ToneContext = React.createContext<Tone>("dark");
export const useTone = () => TONES[React.useContext(ToneContext)];

/**
 * 紙の粒子。サイトの .grain（globals.css）と同じ feTurbulence を敷く。
 * これが無いと、べた塗りの面が「印刷物」ではなく「画面」に見える。
 */
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  );

export const Grain: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity,
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundRepeat: "repeat",
      mixBlendMode: "multiply",
    }}
  />
);

/** 上部のセージの光。サイトのヒーローにある blur した円と同じもの。 */
const Glow: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      position: "absolute",
      top: -260,
      left: "50%",
      width: 820,
      height: 820,
      transform: "translateX(-50%)",
      borderRadius: "50%",
      background: color,
      filter: "blur(150px)",
      pointerEvents: "none",
    }}
  />
);

/** 上下のスクリム。9:16 の端を締めて、中央の余白を「意図」に見せる。 */
const Vignette: React.FC<{ tone: Tone }> = ({ tone }) => {
  const shade = tone === "dark" ? "15,26,18" : "31,42,29";
  const top = tone === "dark" ? 0.55 : 0.05;
  const bottom = tone === "dark" ? 0.75 : 0.07;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `linear-gradient(180deg, rgba(${shade},${top}) 0%, rgba(${shade},0) 26%, rgba(${shade},0) 68%, rgba(${shade},${bottom}) 100%)`,
      }}
    />
  );
};

/** 1トーンぶんの地色一式。 */
const Surface: React.FC<{ tone: Tone; style?: React.CSSProperties }> = ({ tone, style }) => {
  const t = TONES[tone];
  return (
    <AbsoluteFill style={{ backgroundColor: t.bg, ...style }}>
      <AbsoluteFill style={{ background: t.gradient }} />
      <Glow color={t.glow} />
      <Vignette tone={tone} />
      <Grain opacity={t.grainOpacity} />
    </AbsoluteFill>
  );
};

/**
 * 地色を、シーンを跨いでクロスフェードさせる。
 * シーン本体（文字）は Sequence 側で入れ替わるが、地色は途切れず溶ける。
 * 明→暗の反転そのものが演出なので、切り替えは MOTION.overlap かけて溶かす。
 */
export const Backdrop: React.FC<{ schedule: { from: number; tone: Tone }[] }> = ({ schedule }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {schedule.map((s, i) => {
        // トーンが変わらない境目では地色も変わらない＝レイヤーを重ねない。
        if (i > 0 && schedule[i - 1].tone === s.tone) return null;
        // 先頭は常に不透明。以降は境目の前後で 0→1 に立ち上がり、
        // 後ろのレイヤーとして残り続ける（上に来た層が塗り替える）。
        const opacity =
          i === 0
            ? 1
            : interpolate(frame, [s.from - MOTION.toneLead, s.from + MOTION.toneTail], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: easeInOut,
              });
        if (opacity === 0) return null;
        return <Surface key={i} tone={s.tone} style={{ opacity }} />;
      })}
    </AbsoluteFill>
  );
};

/**
 * シーンの器。
 * - 入り/抜けのディゾルブ（文字が溶けて入れ替わる）
 * - 余白（左右 156px・最大幅 768px）
 * - 緩慢なズーム（scale を内包）
 * 中身のレイアウトだけをシーン側に書けばよくする。
 */
export const SceneFrame: React.FC<{
  durationInFrames: number;
  tone: Tone;
  align?: "left" | "center";
  /** 縦位置。既定は中央。 */
  justify?: "center" | "flex-start" | "flex-end";
  /** ズームの終わり倍率を個別に変えたいとき */
  zoomTo?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ durationInFrames, tone, align = "left", justify = "center", zoomTo, style, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, MOTION.sceneIn, durationInFrames - MOTION.sceneOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
  );
  const scale = interpolate(frame, [0, durationInFrames], [MOTION.zoomFrom, zoomTo ?? MOTION.zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <ToneContext.Provider value={tone}>
      <AbsoluteFill
        style={{
          opacity,
          justifyContent: justify,
          alignItems: align === "center" ? "center" : "flex-start",
          textAlign: align,
          padding: `0 ${LAYOUT.padX}px`,
          willChange: "opacity",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: LAYOUT.maxContent,
            transform: `scale(${scale})`,
            transformOrigin: align === "center" ? "center center" : "left center",
            willChange: "transform",
            ...style,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </ToneContext.Provider>
  );
};
