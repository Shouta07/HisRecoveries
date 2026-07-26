import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { MOTION, easeOut } from "../brand";

// ============================================================
// モーション層 — 「ゆっくり・跳ねない・気づかれない」
// spring は使わない（跳ねは軽薄に見える）。すべて長めの ease-out。
// ============================================================

/**
 * 文字フェード。opacity 0→1 に、ごく小さな上方向移動を添えるだけ。
 * rise を大きくすると "動画っぽく" なって静けさが壊れるので既定16px。
 */
export const FadeIn: React.FC<{
  /** 開始フレーム（シーン内の相対） */
  delay?: number;
  /** フェード尺 */
  duration?: number;
  /** 立ち上がりの移動量(px)。0 で純粋なフェード。 */
  rise?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, duration = MOTION.fadeIn, rise = MOTION.rise, style, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${(1 - t) * rise}px)`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 緩慢なズーム。シーンの頭から終わりまで、等速で 1.00 → 1.05。
 * 30fps・5秒で 5% なので「動いていると気づかないが、止まってもいない」。
 */
export const SlowZoom: React.FC<{
  durationInFrames: number;
  from?: number;
  to?: number;
  /** ズームの原点。"center" | "top" など transform-origin の値 */
  origin?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  durationInFrames,
  from = MOTION.zoomFrom,
  to = MOTION.zoomTo,
  origin = "center center",
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: origin,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 子要素を step フレームずつ遅らせて FadeIn する。
 * Scene2 の「肌 / 体 / 清潔感」のように、並ぶものを1つずつ置いていく用。
 */
export const Stagger: React.FC<{
  delay?: number;
  /** 子1つあたりの遅延 */
  step?: number;
  rise?: number;
  children: React.ReactNode;
}> = ({ delay = 0, step = 20, rise = MOTION.rise, children }) => (
  <>
    {React.Children.map(children, (child, i) => (
      <FadeIn delay={delay + i * step} rise={rise}>
        {child}
      </FadeIn>
    ))}
  </>
);
