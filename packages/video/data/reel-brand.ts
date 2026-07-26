import type { BrandReelData } from "../lib/BrandReel";

// Instagram リール（30秒）— ブランド認知。
//
// 文言の制約（lib/validate.ts の validateBrandReelData が検査する）:
//   ・断定しない／効果効能を言わない（薬機法）。「治る」「改善する」は使わない。
//   ・煽らない。危機感で売らない。読んだ人が静かに頷ける言い方だけ。
//   ・1行は短く。9:16 の左右余白（左右156px）に収める。
//   ・サイトの言葉に揃える: 「もっといい男に」「整える順番」「伴走」。
export const reelBrand: BrandReelData = {
  eyebrow: "His Recoveries",

  // 1. もっといい男になりたい
  desire: {
    headline: [{ text: "もっと、" }, { text: "いい男になりたい。" }],
    note: [{ text: "口には出さないだけで、" }, { text: "たぶん、みんな思っている。" }],
  },

  // 2. 男性の悩み（肌・体・清潔感）
  concerns: {
    lead: [{ text: "鏡の前で、少しだけ止まる。" }],
    items: [
      { label: "肌", note: "乾き、ざらつき、ひげ跡。" },
      { label: "体", note: "抜けきらない、疲れ。" },
      { label: "清潔感", note: "自分では、気づけない。" },
    ],
    punch: [{ text: "気になっても、" }, { text: "相談する相手が、いない。", accent: "相談する相手" }],
  },

  // 3. His Recoveries とは
  brand: {
    lead: [{ text: "男の「変わりたい」に、" }, { text: "伴走する。", accent: "伴走" }],
    body: [
      { text: "髪・肌・体・心を、ひとつの窓口で。" },
      { text: "整える順番を設計し、" },
      { text: "合うプロ・施設へおつなぎします。" },
    ],
  },

  // 4. 小さな改善が自信になる
  confidence: {
    headline: [{ text: "小さな改善が、" }, { text: "自信になる。", accent: "自信" }],
    body: [{ text: "一度に変えなくていい。" }, { text: "ひとつ続いてから、次を。" }],
  },

  // 5. CTA
  cta: {
    lead: [{ text: "相談は無料・完全守秘。" }],
    cta: [{ text: "まず、話すことから。" }],
    url: "hisrecoveries.com",
    handle: "@his_recoveries",
  },
};
