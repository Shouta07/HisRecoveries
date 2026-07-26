import type { RoadmapData } from "../lib/RoadmapVideo";

// 記事: /areas/mind/shukan-shikumi（track: refine）
// 「続かないのは意志のせいではない。仕組みで続ける」を動画化。
// トーン厳守: 責めない・断定しない。静かに、やり方だけ置く。
export const shukan: RoadmapData = {
  eyebrow: "His Recoveries",
  hook: [{ text: "「続かない」のは、" }, { text: "意志のせい？" }],
  problem: {
    lead: [{ text: "気合いでは、" }, { text: "続かない。" }],
    punch: [{ text: "続くのは、" }, { text: "仕組み。", accent: "仕組み" }],
  },
  steps: [
    { n: "01", t: "ハードルを、下げきる", d: "「1回だけ」でいい。始める抵抗を、なくす。" },
    { n: "02", t: "今ある習慣に、くっつける", d: "歯磨きの後に、とか。きっかけを固定する。" },
    { n: "03", t: "できた日を、印だけつける", d: "記録して見えると、途切れが減る。" },
    { n: "04", t: "空いた日を、責めない", d: "1日休んでも、また戻ればいい。" },
  ],
  close: {
    lead: [{ text: "頑張って続けるのを、" }, { text: "やめる。" }],
    punch: [{ text: "仕組みで、続ける。", accent: "仕組み" }],
  },
};
