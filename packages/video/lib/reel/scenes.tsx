import React from "react";
import { TYPE, PALETTE } from "../brand";
import { SceneFrame } from "./stage";
import { FadeIn, Stagger } from "./motion";
import {
  Body,
  ConcernItem,
  CtaLine,
  Eyebrow,
  Hairline,
  Headline,
  Rule,
  Wordmark,
  type Line,
} from "./atoms";

// ============================================================
// シーン層 — 構成5つ。文言は data から、絵はここで固定。
// 共通ルール:
//   ・1画面に1つのことしか言わない
//   ・入場は上から順に、必ず間を空けて（一斉に出さない）
//   ・左揃え（S1/S2/S4）＝ editorial、中央（S3/S5）＝ブランドカード
// ============================================================

export type ConcernEntry = { label: string; note: string };

type SceneProps<T> = { data: T; durationInFrames: number };

/** Scene 1 — もっといい男になりたい（問いを、静かに置く） */
export const SceneDesire: React.FC<
  SceneProps<{ eyebrow: string; headline: Line[]; note: Line[] }>
> = ({ data, durationInFrames }) => (
  <SceneFrame durationInFrames={durationInFrames} tone="dark" align="left">
    <FadeIn delay={0} rise={10}>
      <Eyebrow>{data.eyebrow}</Eyebrow>
    </FadeIn>
    <Rule delay={12} style={{ margin: "36px 0 52px" }} />
    <FadeIn delay={26}>
      <Headline lines={data.headline} />
    </FadeIn>
    <FadeIn delay={64}>
      <Body lines={data.note} style={{ marginTop: 56 }} />
    </FadeIn>
  </SceneFrame>
);

/** Scene 2 — 男性の悩み（肌・体・清潔感）。並べるだけ。煽らない。 */
export const SceneConcerns: React.FC<
  SceneProps<{ lead: Line[]; items: ConcernEntry[]; punch: Line[] }>
> = ({ data, durationInFrames }) => (
  <SceneFrame durationInFrames={durationInFrames} tone="dark" align="left">
    <FadeIn delay={0}>
      <Body lines={data.lead} size={TYPE.bodySm.size} />
    </FadeIn>

    <div style={{ marginTop: 54 }}>
      <Stagger delay={30} step={26} rise={12}>
        {data.items.map((item) => (
          <div key={item.label}>
            <Hairline />
            <ConcernItem label={item.label} note={item.note} />
          </div>
        ))}
      </Stagger>
      <FadeIn delay={30 + data.items.length * 26} rise={0}>
        <Hairline />
      </FadeIn>
    </div>

    <FadeIn delay={132}>
      <Headline lines={data.punch} size={TYPE.headlineSm.size} line={TYPE.headlineSm.line} style={{ marginTop: 62 }} />
    </FadeIn>
  </SceneFrame>
);

/** Scene 3 — His Recoveries とは。ここで地色が明転する（＝回復の合図）。 */
export const SceneBrand: React.FC<SceneProps<{ lead: Line[]; body: Line[] }>> = ({
  data,
  durationInFrames,
}) => (
  <SceneFrame durationInFrames={durationInFrames} tone="light" align="center">
    <FadeIn delay={6} rise={12}>
      <Wordmark size={84} />
    </FadeIn>
    <Rule delay={30} width={72} style={{ margin: "48px auto" }} />
    <FadeIn delay={48}>
      <Headline lines={data.lead} size={TYPE.headlineSm.size} line={TYPE.headlineSm.line} />
    </FadeIn>
    <FadeIn delay={82}>
      <Body lines={data.body} style={{ marginTop: 52 }} />
    </FadeIn>
  </SceneFrame>
);

/** Scene 4 — 小さな改善が、自信になる。 */
export const SceneConfidence: React.FC<SceneProps<{ headline: Line[]; body: Line[] }>> = ({
  data,
  durationInFrames,
}) => (
  <SceneFrame durationInFrames={durationInFrames} tone="light" align="left">
    <FadeIn delay={4}>
      <Headline lines={data.headline} />
    </FadeIn>
    <Rule delay={44} style={{ margin: "56px 0" }} />
    <FadeIn delay={58}>
      <Body lines={data.body} />
    </FadeIn>
  </SceneFrame>
);

/** Scene 5 — CTA。深緑に戻し、ブランドカードで閉じる（OG 画像と同じ絵）。 */
export const SceneCta: React.FC<
  SceneProps<{ lead: Line[]; cta: Line[]; url: string; handle?: string }>
> = ({ data, durationInFrames }) => (
  <SceneFrame durationInFrames={durationInFrames} tone="dark" align="center" zoomTo={1.035}>
    <FadeIn delay={4} rise={12}>
      <Wordmark size={80} />
    </FadeIn>
    <Rule delay={26} width={72} color={PALETTE.brass} style={{ margin: "46px auto" }} />
    <FadeIn delay={42}>
      <Body lines={data.lead} />
    </FadeIn>
    <FadeIn delay={70}>
      <Headline lines={data.cta} size={TYPE.headlineSm.size} line={TYPE.headlineSm.line} style={{ marginTop: 44 }} />
    </FadeIn>
    <FadeIn delay={100} rise={10}>
      <CtaLine style={{ marginTop: 76 }}>{data.url}</CtaLine>
      {data.handle ? (
        <CtaLine style={{ marginTop: 20, fontSize: 26, color: PALETTE.muted, letterSpacing: "0.2em" }}>
          {data.handle}
        </CtaLine>
      ) : null}
    </FadeIn>
  </SceneFrame>
);
