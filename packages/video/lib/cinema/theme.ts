// ============================================================
// Cinema — ブランドフィルムのテーマ（1本ではなく、シリーズ全体の規範）
//
// 黒／チャコール／自然光。差し色は落ち着いたブラウン。
// 「静かな高級感」は色数を絞ることでしか出ない。ここに無い色は使わない。
// ============================================================

export const COLOR = {
  /** 地。真っ黒ではなく、わずかに温度のある黒。 */
  black: "#0F0F0F",
  /** 地のもう一段深い側（ビネット・カード） */
  blackDeep: "#080808",
  /** チャコール（プレート・面の中間調） */
  charcoal: "#1A1A19",
  charcoalSoft: "#242422",
  /** 文字。純白は使わない。紙のような白。 */
  bone: "#F5F5F0",
  /** 二次テキスト */
  boneSub: "rgba(245,245,240,0.62)",
  boneFaint: "rgba(245,245,240,0.34)",
  /** アクセント＝落ち着いたブラウン。罫線と単語1つぶんだけに使う。 */
  brown: "#8A6F55",
  brownLight: "#A98D6D",
  brownDeep: "#5C4835",
  /** グレードの暖色ハイライト（自然光の色） */
  warmLight: "rgba(196,160,120,0.20)",
} as const;

export const FONT = {
  /** 欧文・ワードマーク・小ラベル */
  latin: "Inter",
  /** 和文 */
  jp: "Noto Sans JP",
} as const;

/**
 * タイポスケール（1080×1920）。
 * 細く・大きく・字間広く。weight は 300 が基本、400 は最大でも1箇所。
 */
export const TYPE = {
  /** 画面に置く1文（Scene1・Scene3） */
  statement: { size: 56, weight: 300, line: 1.85, tracking: "0.09em" },
  /** 単語1つ（肌。体。清潔感。） */
  word: { size: 64, weight: 300, tracking: "0.22em" },
  /** 補助 */
  caption: { size: 27, weight: 300, line: 1.9, tracking: "0.1em" },
  /** ラベル（英字・大文字・字間極大） */
  label: { size: 20, weight: 400, tracking: "0.42em" },
  /** ワードマーク */
  wordmark: { size: 58, weight: 300, tracking: "0.3em" },
} as const;

/**
 * 時間の設計。映画広告のテンポ＝カットは長く、繋ぎはもっと長く。
 * ここを短くすると、とたんに「テンプレAI動画」になる。
 */
export const TIME = {
  /** カット同士のディゾルブ（フレーム）。長いほど呼吸が深い。 */
  dissolve: 26,
  /** 文字が現れる尺 */
  textIn: 34,
  /** 文字が消える尺 */
  textOut: 22,
  /** カット頭から文字が出るまでの間（画を先に見せる） */
  textHold: 22,
  /** 冒頭の暗転明け／末尾の暗転 */
  filmIn: 30,
  filmOut: 36,
} as const;

/** 版面。文字は中央に置かない。三分割の下段・左に寄せる。 */
export const FRAME = {
  width: 1080,
  height: 1920,
  fps: 30,
  /** 文字の左右マージン */
  padX: 92,
  /** 下段配置のベースライン（画面高に対する比） */
  lowerY: 0.735,
  /** 上段配置 */
  upperY: 0.2,
  maxText: 800,
} as const;

/**
 * カラーグレード。素材の出自がバラバラでも、これを全カットに掛けると
 * 1本のフィルムに見える。数値は「効きすぎない」ところで止めてある。
 */
export const GRADE = {
  /** img に掛ける CSS filter */
  filter: "saturate(0.62) contrast(1.06) brightness(0.88)",
  /** 黒の持ち上げ（#0F0F0F へ寄せる） */
  lift: 0.16,
  /** ハイライトの暖色寄せ */
  warm: 0.22,
  /** 周辺光量落ち */
  vignette: 0.62,
  /** 粒子 */
  grain: 0.07,
} as const;

/** ease-out cubic。文字・カメラの基本。 */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
/** ease-in-out sine。ディゾルブ。 */
export const easeInOut = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;
/** ほぼ等速（カメラの押し）。わずかに減速するだけ。 */
export const easeLinearish = (t: number): number => 1 - Math.pow(1 - t, 1.35);
