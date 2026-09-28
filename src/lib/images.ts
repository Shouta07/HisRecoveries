// 画面に置く写真の置き場所。
//
// ── ここに無いものは、こちらで用意しない ──────────
// 素材サイトの写真も、生成した人物も使わない。
// 用意できていないあいだは、写真の枠だけを出す（Slot が面を描く）。
// ファイルを public/img/ に置けば、その瞬間から写真になる。
//
// ── 人物の写真について ────────────────────────────
// 回答者として顔を並べるなら、その人が実在して、
// 掲載に同意していることが要る。
// 実在しない顔を「回答している女性」として並べると、
// まだ登録が0の状態で、いる人の数を偽ることになる。
//
// 撮影・許諾が済んだものだけをここに足してください。

export type ImageSlot = {
  /** public からのパス */
  src: string;
  /** 読み上げ用。飾りなら空文字 */
  alt: string;
  /** 何を写すか。撮影を頼むときの指示になる */
  note: string;
};

export const IMAGES = {
  hero: {
    src: "/img/hero.jpg",
    alt: "スマホを見ながら考えている男性",
    note: "送る直前に手が止まっている様子。正面ではなく、画面を見ている横顔。",
  },
  caseMessage: { src: "/img/case-message.jpg", alt: "", note: "LINEの画面" },
  caseDate: { src: "/img/case-date.jpg", alt: "", note: "夜の店の席" },
  casePhoto: { src: "/img/case-photo.jpg", alt: "", note: "プロフィール写真の候補" },
  caseStyle: { src: "/img/case-style.jpg", alt: "", note: "上着とパンツを並べたところ" },
  caseProfile: { src: "/img/case-profile.jpg", alt: "", note: "プロフィール入力画面" },
  caseWords: { src: "/img/case-words.jpg", alt: "", note: "言葉にできずに考えている様子" },
  step1: { src: "/img/step-1.jpg", alt: "", note: "スマホに質問を打ち込んでいる手元" },
  step4: { src: "/img/step-4.jpg", alt: "", note: "決めて、送ったあとの表情" },
} satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof IMAGES;

/* ── 公開の前に止めること ───────────────────────── */
{
  for (const [k, v] of Object.entries(IMAGES)) {
    if (!v.src.startsWith("/img/")) {
      throw new Error(`画像「${k}」は public/img/ の下に置いてください`);
    }
    if (!v.note) throw new Error(`画像「${k}」に、何を写すかが書かれていません`);
  }
}
