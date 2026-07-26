import type { RoadmapData } from "../lib/RoadmapVideo";

// 記事: /areas/skin/mens-skincare-junban（track: refine）
// 「種類より順番。洗う→守る→日中の対策、を3つだけ続ける」を動画化。
// トーン厳守: 断定・医療的表現をしない（薬機法）。静かに、順番だけ伝える。
export const skincare: RoadmapData = {
  eyebrow: "His Recoveries",
  hook: [{ text: "スキンケア、" }, { text: "何から？" }],
  problem: {
    lead: [{ text: "種類が多すぎて、" }, { text: "迷う。" }],
    punch: [{ text: "大事なのは、" }, { text: "順番。", accent: "順番" }],
  },
  steps: [
    { n: "01", t: "まず「洗う」を、やさしく", d: "ゴシゴシしない。ぬるま湯で、こすらず落とす。" },
    { n: "02", t: "次に「守る」を、ひとつ", d: "あれこれ足さず、まず水分を逃がさないケアから。" },
    { n: "03", t: "日中は、紫外線対策", d: "印象の土台になる。曇りの日も、習慣にする。" },
    { n: "04", t: "増やすのは、慣れてから", d: "一度に足さない。ひとつ続いてから、次を。" },
  ],
  close: {
    lead: [{ text: "あれこれ買う前に、" }],
    punch: [{ text: "3つを、続ける。", accent: "3つ" }],
  },
};
