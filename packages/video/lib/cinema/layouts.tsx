import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR, FRAME, TIME } from "./theme";
import type { Cut } from "./film";
import { Grain, Plate, TextScrim } from "./media";
import { Anchored, Caption, Hairline, Label, Reveal, Statement, Word, Wordmark } from "./type";

// ============================================================
// レイアウト層 — 「カットの型」。ここに定義した種類の組み合わせだけで、
// 新しいフィルムを1本組める。増やすときは film.ts の Layout に1つ足して、
// ここに実装し、CutRenderer の分岐に1行加える。
// ============================================================

/** 画だけのカット。文字を置かない「息継ぎ」。冒頭と繋ぎに効く。 */
const SilentCut: React.FC<{ cut: Cut }> = ({ cut }) => (
  <Plate media={cut.media} move={cut.move} durationInFrames={cut.span} />
);

/** 単語ひとつ。肌。体。清潔感。 */
const WordCut: React.FC<{ cut: Cut; word: string; anchor: "lower-left" | "lower-right" | "upper-left" | "center" }> = ({
  cut,
  word,
  anchor,
}) => (
  <>
    <Plate media={cut.media} move={cut.move} durationInFrames={cut.span} />
    <TextScrim anchor={anchor.startsWith("upper") ? "upper" : "lower"} />
    <Anchored anchor={anchor}>
      <Reveal delay={TIME.textHold} durationInFrames={cut.span}>
        <Word word={word} />
      </Reveal>
    </Anchored>
  </>
);

/** 1文。1行ずつ現れる。 */
const StatementCut: React.FC<{
  cut: Cut;
  lines: string[];
  accent?: string;
  anchor: "lower-left" | "lower-right" | "upper-left" | "center";
}> = ({ cut, lines, accent, anchor }) => (
  <>
    <Plate media={cut.media} move={cut.move} durationInFrames={cut.span} />
    <TextScrim anchor={anchor.startsWith("upper") ? "upper" : "lower"} />
    <Anchored anchor={anchor}>
      <Statement lines={lines} accent={accent} durationInFrames={cut.span} />
    </Anchored>
  </>
);

/**
 * ブランドカード。ここだけは素材を敷かない。
 * 30秒かけて連れてきた視線を、名前ひとつに集める。
 */
const BrandCard: React.FC<{ cut: Cut; tagline: string; cta?: string; handle?: string }> = ({
  cut,
  tagline,
  cta,
  handle,
}) => (
  <AbsoluteFill style={{ backgroundColor: COLOR.black }}>
    {/* 黒地に、ほんのわずかな光。完全な平面にすると印刷物になってしまう。 */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 74% 50% at 50% 42%, ${COLOR.charcoal} 0%, ${COLOR.black} 58%, ${COLOR.blackDeep} 100%)`,
      }}
    />
    <Grain opacity={0.05} />
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: `0 ${FRAME.padX}px` }}>
      <Reveal delay={8} rise={8}>
        <Wordmark />
      </Reveal>
      <Reveal delay={34} rise={0} style={{ marginTop: 46 }}>
        <Hairline style={{ margin: "0 auto" }} />
      </Reveal>
      <Reveal delay={48} style={{ marginTop: 44 }}>
        <Caption style={{ textAlign: "center" }}>{tagline}</Caption>
      </Reveal>
      {cta ? (
        <Reveal delay={86} style={{ marginTop: 96 }}>
          <Caption color={COLOR.boneFaint} style={{ textAlign: "center", letterSpacing: "0.14em" }}>
            {cta}
          </Caption>
        </Reveal>
      ) : null}
      {handle ? (
        <Reveal delay={100} style={{ marginTop: 18 }}>
          <Label color={COLOR.brown} upper={false}>
            {handle}
          </Label>
        </Reveal>
      ) : null}
    </AbsoluteFill>
  </AbsoluteFill>
);

/**
 * カット1枚を描く。layout の種類で振り分けるだけ。
 * data 側は「どのレイアウトか」を書けばよく、絵の決めごとを知らなくていい。
 */
export const CutRenderer: React.FC<{ cut: Cut }> = ({ cut }) => {
  const { layout } = cut;
  switch (layout.kind) {
    case "silent":
      return <SilentCut cut={cut} />;
    case "word":
      return <WordCut cut={cut} word={layout.word} anchor={layout.anchor ?? "lower-left"} />;
    case "statement":
      return (
        <StatementCut
          cut={cut}
          lines={layout.lines}
          accent={layout.accent}
          anchor={layout.anchor ?? "lower-left"}
        />
      );
    case "brand":
      return (
        <BrandCard cut={cut} tagline={layout.tagline} cta={layout.cta} handle={layout.handle} />
      );
  }
};
