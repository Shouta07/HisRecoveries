import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLOR, TIME, easeInOut, easeOut } from "./theme";
import { ensureCinemaFonts } from "./fonts";
import { CutRenderer } from "./layouts";
import type { Cut, Film as FilmType } from "./film";

// ============================================================
// Film — フィルム本体。カットを並べ、繋ぎ、頭と尻を暗転させる。
// どのフィルムでもこの1つを使い回す（作品ごとに書き換えない）。
// ============================================================

/**
 * カット1枚の入退場。
 * 入りは「前のカットの上に重なって濃くなる」。抜けは次のカットに任せる
 * ＝ 常に上のレイヤーが下を覆っていくので、繋ぎ目に地色が覗かない。
 */
const CutLayer: React.FC<{ cut: Cut }> = ({ cut }) => {
  const frame = useCurrentFrame();
  const opacity = cut.isFirst
    ? 1
    : interpolate(frame, [0, TIME.dissolve], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeInOut,
      });
  return (
    <AbsoluteFill style={{ opacity, willChange: "opacity" }}>
      <CutRenderer cut={cut} />
    </AbsoluteFill>
  );
};

/** 頭の明転と、尻の暗転。フィルムの額縁。 */
const FilmFade: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, TIME.filmIn, durationInFrames - TIME.filmOut, durationInFrames],
    [1, 0, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut },
  );
  return (
    <AbsoluteFill
      style={{ backgroundColor: COLOR.blackDeep, opacity, pointerEvents: "none" }}
    />
  );
};

export const Film: React.FC<{ film: FilmType }> = ({ film }) => {
  ensureCinemaFonts();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR.blackDeep }}>
      {film.audioSrc ? (
        <Audio src={staticFile(film.audioSrc)} volume={film.audioVolume ?? 0.5} />
      ) : null}

      {film.cuts.map((cut) => (
        <Sequence
          key={cut.index}
          from={cut.from}
          durationInFrames={cut.span}
          name={`${cut.index + 1} ${cut.intent ?? cut.layout.kind}`}
        >
          <CutLayer cut={cut} />
        </Sequence>
      ))}

      <FilmFade durationInFrames={film.durationInFrames} />
    </AbsoluteFill>
  );
};
