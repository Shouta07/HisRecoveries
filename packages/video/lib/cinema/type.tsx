import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLOR, FONT, FRAME, TIME, TYPE, easeOut } from "./theme";
import type { Anchor } from "./film";

// ============================================================
// 文字層 — 「1文ずつ・遅く・映像を邪魔しない場所に」
//
// 文字はフェードだけ。移動は 6px。スライドさせない、拡大させない。
// 動かすほど安くなる。
// ============================================================

/**
 * 文字のフェード。カットの終わりでちゃんと消えるところまで持つ。
 * durationInFrames を渡すと、抜け際に自分で退場する。
 */
export const Reveal: React.FC<{
  delay?: number;
  durationInFrames?: number;
  /** 立ち上がりの移動量(px)。既定6px＝ほぼ動かない。 */
  rise?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, durationInFrames, rise = 6, style, children }) => {
  const frame = useCurrentFrame();

  const appear = interpolate(frame, [delay, delay + TIME.textIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const leave = durationInFrames
    ? interpolate(
        frame,
        [durationInFrames - TIME.textOut - TIME.dissolve, durationInFrames - TIME.dissolve],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
      )
    : 1;

  const opacity = Math.min(appear, leave);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - appear) * rise}px)`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 配置。中央には置かない（center はブランドカードだけの例外）。 */
export const Anchored: React.FC<{ anchor: Anchor; children: React.ReactNode }> = ({
  anchor,
  children,
}) => {
  const common: React.CSSProperties = {
    padding: `0 ${FRAME.padX}px`,
    display: "flex",
    flexDirection: "column",
  };
  if (anchor === "center") {
    return (
      <AbsoluteFill style={{ ...common, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ maxWidth: FRAME.maxText }}>{children}</div>
      </AbsoluteFill>
    );
  }
  const isLower = anchor === "lower-left" || anchor === "lower-right";
  const isRight = anchor === "lower-right";
  return (
    <AbsoluteFill
      style={{
        ...common,
        justifyContent: "flex-start",
        alignItems: isRight ? "flex-end" : "flex-start",
        textAlign: isRight ? "right" : "left",
        paddingTop: isLower ? FRAME.height * FRAME.lowerY : FRAME.height * FRAME.upperY,
      }}
    >
      <div style={{ maxWidth: FRAME.maxText }}>{children}</div>
    </AbsoluteFill>
  );
};

const jpStyle = (
  t: { size: number; weight: number; line?: number; tracking: string },
  color: string,
): React.CSSProperties => ({
  fontFamily: `${FONT.jp}, ${FONT.latin}, sans-serif`,
  fontWeight: t.weight,
  fontSize: t.size,
  lineHeight: t.line ?? 1.5,
  letterSpacing: t.tracking,
  color,
  fontFeatureSettings: '"palt" 1',
  textShadow: "0 2px 28px rgba(0,0,0,0.55)",
});

/** 単語ひとつ。字間を大きく開けて、余白に置く。 */
export const Word: React.FC<{ word: string }> = ({ word }) => (
  <div style={jpStyle(TYPE.word, COLOR.bone)}>{word}</div>
);

/**
 * 1文。**1行ずつ順に**現れる（要件）。
 * 行間は深く。行が増えても中央には寄せない。
 */
export const Statement: React.FC<{
  lines: string[];
  accent?: string;
  /** 1行あたりの間隔（フレーム） */
  step?: number;
  durationInFrames?: number;
}> = ({ lines, accent, step = 26, durationInFrames }) => (
  <div style={jpStyle(TYPE.statement, COLOR.bone)}>
    {lines.map((line, i) => (
      <Reveal key={i} delay={TIME.textHold + i * step} durationInFrames={durationInFrames}>
        <div>
          {accent && line.includes(accent) ? (
            <>
              {line.slice(0, line.indexOf(accent))}
              <span style={{ color: COLOR.brownLight }}>{accent}</span>
              {line.slice(line.indexOf(accent) + accent.length)}
            </>
          ) : (
            line
          )}
        </div>
      </Reveal>
    ))}
  </div>
);

/**
 * 英字ラベル。字間を極端に開ける（0.42em）。ブランドの記号。
 * SNS のハンドルなど、そのまま読ませたい文字列は upper={false} で渡す
 * （@his_recoveries を大文字にすると別のアカウントに見えるため）。
 */
export const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  upper?: boolean;
}> = ({ children, color = COLOR.brown, upper = true }) => (
  <div
    style={{
      fontFamily: FONT.latin,
      fontWeight: TYPE.label.weight,
      fontSize: TYPE.label.size,
      letterSpacing: TYPE.label.tracking,
      textTransform: upper ? "uppercase" : "none",
      color,
    }}
  >
    {children}
  </div>
);

/** ワードマーク。Inter・weight 300・字間 0.3em。太らせない。 */
export const Wordmark: React.FC<{ size?: number }> = ({ size = TYPE.wordmark.size }) => (
  <div
    style={{
      fontFamily: FONT.latin,
      fontWeight: TYPE.wordmark.weight,
      fontSize: size,
      letterSpacing: TYPE.wordmark.tracking,
      color: COLOR.bone,
      whiteSpace: "nowrap",
      // 字間を開けると右に空白が余るので、その分だけ左に戻して光学的に中央へ。
      textIndent: TYPE.wordmark.tracking,
      marginRight: `-${TYPE.wordmark.tracking}`,
    }}
  >
    His Recoveries
  </div>
);

/** 補助テキスト（タグライン・導線）。 */
export const Caption: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = COLOR.boneSub, style }) => (
  <div style={{ ...jpStyle(TYPE.caption, color), textShadow: "none", ...style }}>{children}</div>
);

/** 細い横罫。ブラウン。伸びるのではなく、静かに現れる。 */
export const Hairline: React.FC<{ width?: number; color?: string; style?: React.CSSProperties }> = ({
  width = 46,
  color = COLOR.brown,
  style,
}) => <div style={{ width, height: 1, backgroundColor: color, opacity: 0.8, ...style }} />;
