// ============================================================
// His Recoveries — ブランドリール用トークン
//
// 色は www.hisrecoveries.com の実装（src/app/page.tsx のヒーロー、
// src/app/opengraph-image.tsx、src/components/*）から採った実測値。
// 深緑 #16241A を基調に、セージ #85AB8B を差し色、明部は #F4F6F2。
// 真鍮 #D9B584 は TerritoryArt の細線と同じ「静かな高級」の記号として、
// CTA の罫線にだけ使う。
//
// 注意: 既存の lib/theme.ts は記事→動画テンプレート(RoadmapVideo)用。
// 同じ深緑系だが用途が違うので、リールはこちらのトークンだけを見る。
// ============================================================

/** 面（サーフェス）と文字色。site hero / OG 画像と同じ register。 */
export const PALETTE = {
  // 深緑（ヒーロー・OG と同一）
  inkDeep: "#0F1A12",
  ink: "#16241A",
  inkSoft: "#1F2A1D",
  inkMid: "#24382B",
  // セージ（差し色）
  sage: "#85AB8B",
  sageBright: "#9EC4A3",
  sageDeep: "#3D5638",
  // 明部
  offWhite: "#EDF1E8",
  muted: "#C9D2C4",
  paper: "#F4F6F2",
  paperWarm: "#EEF3EA",
  // 明部の文字
  inkText: "#1F2A1D",
  inkSub: "#4B5B47",
  inkFaint: "#6B7A66",
  // 真鍮（CTA の罫線だけ）
  brass: "#D9B584",
  sand: "#E8DCBF",
} as const;

export type Tone = "dark" | "light";

/**
 * トーン = 1シーンぶんの色一式。
 * 明暗の反転そのものが演出（暗い問い → 明るい回復 → 深緑のブランドカード）。
 */
export const TONES: Record<
  Tone,
  {
    bg: string;
    gradient: string;
    glow: string;
    fg: string;
    sub: string;
    accent: string;
    rule: string;
    grainOpacity: number;
  }
> = {
  dark: {
    bg: PALETTE.ink,
    gradient: `radial-gradient(ellipse 95% 62% at 50% 30%, ${PALETTE.inkMid} 0%, ${PALETTE.ink} 56%, ${PALETTE.inkDeep} 100%)`,
    glow: "rgba(133,171,139,0.16)",
    fg: PALETTE.offWhite,
    sub: PALETTE.muted,
    accent: PALETTE.sage,
    rule: "rgba(133,171,139,0.55)",
    grainOpacity: 0.05,
  },
  light: {
    bg: PALETTE.paper,
    gradient: `radial-gradient(ellipse 95% 62% at 50% 32%, #FFFFFF 0%, ${PALETTE.paper} 52%, ${PALETTE.paperWarm} 100%)`,
    glow: "rgba(133,171,139,0.14)",
    fg: PALETTE.inkText,
    sub: PALETTE.inkSub,
    accent: PALETTE.sageDeep,
    rule: "rgba(61,86,56,0.42)",
    grainOpacity: 0.035,
  },
};

/** 書体。見出しは明朝（サイトのヒーローと同じ editorial な register）。 */
export const FONTS = {
  /** 見出し・本文の主役。Shippori Mincho B1。 */
  mincho: "Shippori Mincho B1",
  /** 補助テキスト。Noto Sans JP。 */
  sans: "Noto Sans JP",
  /** ロゴタイプ。サイトの .logo-type と同じ Cormorant Garamond。 */
  logo: "Cormorant Garamond",
} as const;

/**
 * タイポスケール（1080×1920 基準）。
 * Aesop / Kinfolk の静けさ = 大きい字を細く、字間を広く、行間を深く。
 * 太字で殴らない。最大でも weight 400。
 */
export const TYPE = {
  // 見出しは「幅768px(= 1080 - 左右156)に収まる最大」で決めてある。
  // 大きくするなら data 側の1行文字数も一緒に減らすこと（validate が弾く）。
  eyebrow: { size: 26, tracking: "0.34em", weight: 400 },
  headline: { size: 76, tracking: "0.07em", line: 1.62, weight: 400 },
  headlineSm: { size: 58, tracking: "0.08em", line: 1.72, weight: 400 },
  body: { size: 34, tracking: "0.05em", line: 2.0, weight: 400 },
  bodySm: { size: 29, tracking: "0.06em", line: 1.95, weight: 400 },
  wordmark: { size: 76, tracking: "0.09em", weight: 400 },
  itemLabel: { size: 46, tracking: "0.12em", weight: 400 },
} as const;

/**
 * 動きの定数。
 * すべて「ゆっくり・等速に近い・跳ねない」。spring は使わない。
 */
export const MOTION = {
  /** 文字のフェードイン尺（フレーム） */
  fadeIn: 26,
  /** シーンの入り／抜けのディゾルブ尺 */
  sceneIn: 24,
  sceneOut: 24,
  /**
   * 同じトーンのシーン同士を重ねるフレーム数（クロスディゾルブ）。
   * トーンが変わる境目では重ねない（明転の途中に前の文字が残ると濁るため）。
   */
  overlap: 22,
  /**
   * 明暗を入れ替える窓。境目の少し手前から始めて、少し後で終える。
   * 前のシーンの文字は easeOut で先に消えるので、地色が変わり切る頃には残っていない。
   */
  toneLead: 10,
  toneTail: 12,
  /** フェードインに添える微小な上方向移動(px)。大きくすると軽薄になる。 */
  rise: 16,
  /** 緩慢なズーム（シーン頭→終わりで到達する倍率） */
  zoomFrom: 1.0,
  zoomTo: 1.05,
} as const;

/** 余白。9:16 の左右は思い切って空ける（余白重視）。 */
export const LAYOUT = {
  padX: 156,
  maxContent: 768,
} as const;

/** 1080×1920 / 30fps / 30.0秒 = 900 フレーム。 */
export const REEL = { width: 1080, height: 1920, fps: 30, durationInFrames: 900 } as const;

/** ease-out cubic。Remotion の interpolate に渡す。 */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
/** ease-in-out sine。地色のクロスフェード用（境目を感じさせない）。 */
export const easeInOut = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;
