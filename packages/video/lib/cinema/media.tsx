import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLOR, GRADE, easeLinearish } from "./theme";
import type { Camera, Media, Move } from "./film";

// ============================================================
// 素材層 — カメラ（Ken Burns）／グレード／粒子／光プレート
//
// 素材の出自がバラバラでも、Grade を全カットに掛ければ1本のフィルムに見える。
// ここが「テンプレAI動画」と「ブランドフィルム」の分かれ目。
// ============================================================

/**
 * Ken Burns。素材を止めない。ただし気づかせない。
 * 30fps・3秒で拡大率 +9% 程度＝「呼吸」の速さ。これ以上速いと広告臭くなる。
 */
const useCamera = (move: Move, durationInFrames: number): Camera => {
  const frame = useCurrentFrame();
  const at = (a: number, b: number) =>
    interpolate(frame, [0, durationInFrames], [a, b], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeLinearish,
    });
  return {
    scale: at(move.from.scale, move.to.scale),
    x: at(move.from.x, move.to.x),
    y: at(move.from.y, move.to.y),
  };
};

/** 粒子。フィルムの肌理。これが無いとデジタル臭が抜けない。 */
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  );

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = GRADE.grain }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity,
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundRepeat: "repeat",
      mixBlendMode: "overlay",
    }}
  />
);

/**
 * カラーグレード。
 * ① 彩度を落として黒を #0F0F0F へ寄せる ② ハイライトを暖色へ
 * ③ 周辺光量を落とす。3枚重ねるだけで、素材が同じ映画の中に入る。
 */
export const Grade: React.FC<{ vignette?: number }> = ({ vignette = GRADE.vignette }) => (
  <>
    {/* 黒の持ち上げ＝黒を締めすぎない（安いコントラストにしない） */}
    <AbsoluteFill
      style={{
        backgroundColor: COLOR.black,
        opacity: GRADE.lift,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    />
    {/* 自然光の暖色。上から差す光の色に寄せる。 */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(170deg, ${COLOR.warmLight} 0%, rgba(196,160,120,0.06) 38%, rgba(0,0,0,0) 70%)`,
        mixBlendMode: "soft-light",
        opacity: GRADE.warm * 3.2,
        pointerEvents: "none",
      }}
    />
    {/* 周辺光量落ち＝視線を中心に置く */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 34%, rgba(8,8,8,${
          vignette * 0.55
        }) 78%, rgba(8,8,8,${vignette}) 100%)`,
        pointerEvents: "none",
      }}
    />
  </>
);

/**
 * 光のプレート。素材が無い枠を埋める、手続き生成の「光と影」。
 * 実写の代用ではなく、フィルムの間（ま）として置く。
 * angle で斜光の向き、intensity で強さ。カメラと一緒にゆっくり動く。
 */
export const LightPlate: React.FC<{
  angle?: number;
  intensity?: number;
  camera: Camera;
}> = ({ angle = 24, intensity = 0.55, camera }) => (
  <AbsoluteFill
    style={{
      backgroundColor: COLOR.blackDeep,
      transform: `scale(${camera.scale}) translate(${(camera.x - 50) * -0.6}%, ${
        (camera.y - 50) * -0.6
      }%)`,
      willChange: "transform",
    }}
  >
    {/* 壁面。左上を沈め、右下に向かって僅かに起きる。 */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(150deg, ${COLOR.blackDeep} 0%, ${COLOR.charcoal} 52%, ${COLOR.charcoalSoft} 100%)`,
      }}
    />
    {/*
      ブラインド越しの斜光。光の帯そのものを描く（暗い帯は描かない）。
      幅の違う帯を2枚重ねると、規則的すぎる CSS の縞に見えなくなる。
    */}
    <AbsoluteFill
      style={{
        transform: `rotate(${angle}deg) scale(2.1)`,
        background: `repeating-linear-gradient(180deg,
          rgba(228,196,152,${intensity * 0.5}) 0px,
          rgba(228,196,152,${intensity * 0.5}) 34px,
          rgba(0,0,0,0) 34px,
          rgba(0,0,0,0) 122px)`,
        filter: "blur(5px)",
      }}
    />
    <AbsoluteFill
      style={{
        transform: `rotate(${angle + 1.5}deg) scale(2.1)`,
        background: `repeating-linear-gradient(180deg,
          rgba(212,176,132,${intensity * 0.26}) 0px,
          rgba(212,176,132,${intensity * 0.26}) 13px,
          rgba(0,0,0,0) 13px,
          rgba(0,0,0,0) 122px)`,
        filter: "blur(11px)",
      }}
    />
    {/* 光が当たっている範囲を絞る＝画面全体が明るくならないように */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 66% 52% at 70% 26%, rgba(0,0,0,0) 0%, rgba(8,8,8,0.55) 62%, rgba(8,8,8,0.94) 100%)`,
      }}
    />
    {/* 光の芯 */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 40% 26% at 72% 22%, rgba(232,200,158,${
          intensity * 0.3
        }) 0%, rgba(0,0,0,0) 72%)`,
      }}
    />
  </AbsoluteFill>
);

/**
 * カット1枚ぶんの画。素材（画像 or プレート）にカメラとグレードを掛ける。
 * レイアウトはこの上に文字を置くだけでよくなる。
 */
export const Plate: React.FC<{
  media: Media;
  move: Move;
  durationInFrames: number;
  vignette?: number;
}> = ({ media, move, durationInFrames, vignette }) => {
  const camera = useCamera(move, durationInFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.black, overflow: "hidden" }}>
      {media.kind === "image" ? (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Img
            src={staticFile(media.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${camera.x}% ${camera.y}%`,
              transform: `scale(${camera.scale})`,
              transformOrigin: `${camera.x}% ${camera.y}%`,
              filter: GRADE.filter,
              willChange: "transform",
            }}
          />
        </AbsoluteFill>
      ) : (
        <LightPlate angle={media.angle} intensity={media.intensity} camera={camera} />
      )}
      <Grade vignette={vignette} />
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * 文字の足元を沈める帯。写真の上に文字を置くときだけ使う。
 * 帯に見えてはいけないので、下端まで伸ばして黒に溶かす。
 */
export const TextScrim: React.FC<{ anchor: "lower" | "upper" }> = ({ anchor }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        anchor === "lower"
          ? "linear-gradient(0deg, rgba(10,10,10,0.86) 0%, rgba(10,10,10,0.58) 24%, rgba(10,10,10,0) 52%)"
          : "linear-gradient(180deg, rgba(10,10,10,0.82) 0%, rgba(10,10,10,0.4) 26%, rgba(10,10,10,0) 52%)",
    }}
  />
);
