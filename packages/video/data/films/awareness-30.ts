import { CAMERA, defineFilm } from "../../lib/cinema/film";

// ============================================================
// His Recoveries — 認知獲得フィルム（30秒 / 9:16 / Instagram Reels）
//
// 対象: 25〜40歳男性。「これは自分のためのブランドだ」と感じてもらう。
// 禁じ手: 美容広告調・クリニック調・Before/After・派手なエフェクト。
//
// 9カット。1カットごとに intent（なぜこのカットが要るか）を残してある。
// 素材を差し替えるときは media.src だけを書き換える。
// ============================================================

const M = {
  dawn: { kind: "image", src: "media/reel/dawn-window.jpg" } as const,
  counter: { kind: "image", src: "media/reel/morning-counter.jpg" } as const,
  portrait: { kind: "image", src: "media/reel/window-portrait.jpg" } as const,
};

export const awareness30 = defineFilm({
  id: "Awareness30",
  // アンビエントは scripts/ambient.mjs で生成する（差し替え前提のプレースホルダ）。
  audioSrc: "audio/ambient-30.mp3",
  audioVolume: 0.42,

  cuts: [
    // ── Scene 1（0–5秒）感情を掴む ───────────────────────────
    {
      seconds: 2.6,
      intent: "夜明け。まだ何も始まっていない時間に、ひとりで立つ後ろ姿。文字は置かない",
      media: M.dawn,
      // 引きから、ほんの少しだけ寄る。人物を画面左に置いたまま。
      move: CAMERA.pushDrift({ scale: 1.02, x: 34, y: 46 }, { scale: 1.1, x: 33, y: 45 }),
      layout: { kind: "silent" },
    },
    {
      seconds: 2.4,
      intent: "同じ場所に、もう一段寄る。ここで初めて言葉が出る＝独白として読ませる",
      media: M.dawn,
      move: CAMERA.pushDrift({ scale: 1.22, x: 30, y: 40 }, { scale: 1.32, x: 29, y: 39 }),
      layout: {
        kind: "statement",
        lines: ["もっといい男に", "なりたい。"],
        anchor: "lower-left",
      },
    },

    // ── Scene 2（5–12秒）日常の悩み。煽らず、静かに向き合う ──
    {
      seconds: 2.4,
      intent: "朝の洗面台の壁。ブラインド越しの光の肌理そのものを「肌」に重ねる",
      media: M.counter,
      // 右側の影の壁だけを見せる（左手のボトル類はフレームの外）。
      move: CAMERA.drift(90, 84, 52, 1.16),
      layout: { kind: "word", word: "肌。", anchor: "lower-left" },
    },
    {
      seconds: 2.3,
      intent: "首から肩へ寄る。顔ではなく身体を見せる。品を落とさない範囲で",
      media: M.portrait,
      move: CAMERA.pushDrift({ scale: 1.72, x: 54, y: 46 }, { scale: 1.62, x: 53, y: 47 }),
      layout: { kind: "word", word: "体。", anchor: "lower-left" },
    },
    {
      seconds: 2.3,
      intent: "畳まれたタオル。人を映さずに清潔感を語る＝説明しない",
      media: M.counter,
      move: CAMERA.pushDrift({ scale: 1.5, x: 76, y: 78 }, { scale: 1.58, x: 77, y: 77 }),
      layout: { kind: "word", word: "清潔感。", anchor: "lower-left" },
    },

    // ── Scene 3（12–20秒）思想 ───────────────────────────────
    {
      seconds: 4.0,
      intent: "引いて全身を見せる。ひとりの生活者として立たせてから、思想を置く",
      media: M.portrait,
      move: CAMERA.pull(52, 40, 1.18, 1.02),
      layout: {
        kind: "statement",
        lines: ["変わりたいと思った瞬間から、"],
        anchor: "lower-left",
      },
    },
    {
      seconds: 4.0,
      intent: "夜明けの空が明るい側へ。文の後半を、明るくなる画で受ける",
      media: M.dawn,
      move: CAMERA.pushDrift({ scale: 1.16, x: 70, y: 34 }, { scale: 1.06, x: 68, y: 36 }),
      layout: {
        kind: "statement",
        lines: ["人生は少しずつ変わる。"],
        accent: "少しずつ",
        anchor: "lower-left",
      },
    },

    // ── Scene 4（20–30秒）ブランド提示 ───────────────────────
    {
      seconds: 4.4,
      intent: "光の当たっている面だけを見て、黒へ落ちていく。名前の前の一息",
      media: M.counter,
      // x は 86 より下げない（左手のボトルがフレームに入る）。
      move: CAMERA.pushDrift({ scale: 1.08, x: 88, y: 30 }, { scale: 1.16, x: 90, y: 32 }),
      layout: { kind: "silent" },
    },
    {
      seconds: 5.6,
      intent: "黒に落として、名前だけを残す",
      media: { kind: "plate" },
      move: CAMERA.push(),
      layout: {
        kind: "brand",
        tagline: "男性の「変わりたい」に、伴走する。",
        cta: "プロフィールから、はじめる。",
        handle: "@his_recoveries",
      },
    },
  ],
});
