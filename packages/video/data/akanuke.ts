import type { RoadmapData } from "../lib/RoadmapVideo";

// 記事: /areas/impression/men-akanuke-junban（track: refine）
// 「垢抜けは顔ではなく要素の入れ替え。足すより引き算。効く順に1つずつ」を動画化。
export const akanuke: RoadmapData = {
  eyebrow: "His Recoveries",
  hook: [{ text: "「垢抜けたい」。" }, { text: "でも、何から？" }],
  problem: {
    lead: [{ text: "顔のせいに、" }, { text: "する前に。" }],
    punch: [{ text: "垢抜けは、" }, { text: "要素の入れ替え。", accent: "入れ替え" }],
  },
  steps: [
    { n: "01", t: "足すより、引き算から", d: "伸びた髪・ぼさ眉・合わない服。まず「ノイズ」を減らす。" },
    { n: "02", t: "髪型を、今の自分に", d: "流行より、骨格と髪質に合う長さへ。" },
    { n: "03", t: "眉と肌の「ノイズ」を消す", d: "余分な毛と、赤み・青ヒゲ。顔がすっきりする。" },
    { n: "04", t: "服は、サイズ感が9割", d: "高い服より、肩・着丈・袖が合った服。" },
  ],
  close: {
    lead: [{ text: "一気に、やらない。" }],
    punch: [{ text: "効く順に、1つずつ。", accent: "1つずつ" }],
  },
};
