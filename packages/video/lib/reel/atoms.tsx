import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { FONTS, PALETTE, TYPE, easeOut } from "../brand";
import { useTone } from "./stage";

// ============================================================
// タイポ層 — 「大きく・細く・字間広く・行間深く」
// 太字で殴らない。強調はセージ1色と、細い罫線だけで作る。
// ============================================================

/** 行データ。accent に入れた語だけ差し色になる。 */
export type Line = { text: string; accent?: string };

/** accent 部分だけ差し色にして1行を描く。 */
const AccentedText: React.FC<{ line: Line; accent: string }> = ({ line, accent }) => {
  if (!line.accent || !line.text.includes(line.accent)) return <>{line.text}</>;
  const at = line.text.indexOf(line.accent);
  return (
    <>
      {line.text.slice(0, at)}
      <span style={{ color: accent }}>{line.accent}</span>
      {line.text.slice(at + line.accent.length)}
    </>
  );
};

/**
 * 小見出しラベル。OG 画像の "MEN'S WELLNESS CONCIERGE" と同じ組版
 * （小さく・セージ・字間 0.28em 以上・大文字）。
 */
export const Eyebrow: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => {
  const tone = useTone();
  return (
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: TYPE.eyebrow.weight,
        fontSize: TYPE.eyebrow.size,
        letterSpacing: TYPE.eyebrow.tracking,
        textTransform: "uppercase",
        color: tone.accent,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 見出し（明朝）。複数行は配列で渡す＝改行位置を文言側で決める。 */
export const Headline: React.FC<{
  lines: Line[];
  size?: number;
  line?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ lines, size = TYPE.headline.size, line: lineHeight = TYPE.headline.line, color, style }) => {
  const tone = useTone();
  return (
    <div
      style={{
        fontFamily: FONTS.mincho,
        fontWeight: TYPE.headline.weight,
        fontSize: size,
        lineHeight: lineHeight,
        letterSpacing: TYPE.headline.tracking,
        color: color ?? tone.fg,
        fontFeatureSettings: '"palt" 1',
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          <AccentedText line={l} accent={tone.accent} />
        </div>
      ))}
    </div>
  );
};

/** 本文（ゴシック）。見出しより一段落とした色で、行間を深く。 */
export const Body: React.FC<{
  lines: Line[];
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ lines, size = TYPE.body.size, color, style }) => {
  const tone = useTone();
  return (
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: TYPE.body.weight,
        fontSize: size,
        lineHeight: TYPE.body.line,
        letterSpacing: TYPE.body.tracking,
        color: color ?? tone.sub,
        fontFeatureSettings: '"palt" 1',
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          <AccentedText line={l} accent={tone.accent} />
        </div>
      ))}
    </div>
  );
};

/**
 * 髪の毛のような罫線。サイトの .gold-rule（幅60px・1px）に相当。
 * 幅が 0 → width までゆっくり伸びる。これが唯一の「線の動き」。
 */
export const Rule: React.FC<{
  delay?: number;
  duration?: number;
  width?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ delay = 0, duration = 44, width = 64, color, style }) => {
  const frame = useCurrentFrame();
  const tone = useTone();
  const w = interpolate(frame, [delay, delay + duration], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  return (
    <div
      style={{
        width: w,
        height: 1,
        backgroundColor: color ?? tone.rule,
        ...style,
      }}
    />
  );
};

/**
 * ロゴタイプ。サイトの .logo-type（Cormorant Garamond）、
 * OG 画像と同じく "His" を地の文字色、"Recoveries" をセージで。
 */
export const Wordmark: React.FC<{
  size?: number;
  color?: string;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ size = TYPE.wordmark.size, color, accent, style }) => {
  const tone = useTone();
  return (
    <div
      style={{
        fontFamily: FONTS.logo,
        fontWeight: TYPE.wordmark.weight,
        fontSize: size,
        letterSpacing: TYPE.wordmark.tracking,
        lineHeight: 1.1,
        color: color ?? tone.fg,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      His <span style={{ color: accent ?? tone.accent }}>Recoveries</span>
    </div>
  );
};

/**
 * 悩みの一項目（肌 / 体 / 清潔感）。
 * ラベル・細い縦罫・一言。カード化せず、罫線だけで区切る。
 */
export const ConcernItem: React.FC<{ label: string; note: string }> = ({ label, note }) => {
  const tone = useTone();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 34, padding: "26px 0" }}>
      <div
        style={{
          fontFamily: FONTS.mincho,
          fontWeight: TYPE.itemLabel.weight,
          fontSize: TYPE.itemLabel.size,
          letterSpacing: TYPE.itemLabel.tracking,
          color: tone.fg,
          minWidth: 190,
          fontFeatureSettings: '"palt" 1',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONTS.sans,
          fontWeight: TYPE.bodySm.weight,
          fontSize: TYPE.bodySm.size,
          letterSpacing: TYPE.bodySm.tracking,
          lineHeight: TYPE.bodySm.line,
          color: tone.sub,
          fontFeatureSettings: '"palt" 1',
        }}
      >
        {note}
      </div>
    </div>
  );
};

/** 項目間の極細の区切り線。 */
export const Hairline: React.FC<{ color?: string }> = ({ color }) => {
  const tone = useTone();
  return <div style={{ height: 1, width: "100%", backgroundColor: color ?? tone.rule, opacity: 0.5 }} />;
};

/** CTA の最終行（URL / ハンドル）。真鍮色を使う唯一の場所。 */
export const CtaLine: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily: FONTS.sans,
      fontWeight: 400,
      fontSize: 30,
      letterSpacing: "0.16em",
      color: PALETTE.sand,
      ...style,
    }}
  >
    {children}
  </div>
);
