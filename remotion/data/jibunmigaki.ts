import type { RoadmapData } from "../lib/RoadmapVideo";

// 記事: /areas/impression/otoko-jibunmigaki-hajimekata（track: refine）
export const jibunmigaki: RoadmapData = {
  eyebrow: "His Recoveries",
  hook: [{ text: "「自分磨き、" }, { text: "何から？」" }],
  problem: {
    lead: [{ text: "情報が多すぎて、" }, { text: "動けない。" }],
    punch: [{ text: "才能じゃない。" }, { text: "順番の問題。", accent: "順番" }],
  },
  steps: [
    { n: "01", t: "まず、見た目の清潔感", d: "髪・眉・肌・服。手応えが、いちばん早い。" },
    { n: "02", t: "次に、続く習慣を1つ", d: "睡眠でも、散歩でも。1つ続いてから、次。" },
    { n: "03", t: "全部を、一度にやらない", d: "同時に始めると、たいてい全部崩れる。" },
    { n: "04", t: "比べるのは、昨日の自分", d: "他人の完成形じゃない。写真で、定点観測。" },
  ],
  close: {
    lead: [{ text: "全部やろうとするのを、" }, { text: "やめる。" }],
    punch: [{ text: "そこが、出発点。", accent: "出発点" }],
  },
};
