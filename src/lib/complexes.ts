// The six complexes are the spine of the redesigned media. Each one is an
// entry point that leads to (1) interviews with people who work on the
// front line and carry it, and (2) a mechanism explainer — why it happens,
// from the body's side. Territory slugs map 1:1 to content/territories/*.md.
//
// Accent colors are per-complex so the whole site can be color-coded:
// a reader always knows which complex they're inside. Tuned to read as a
// global editorial palette (deep, journalistic), not pastel.

export type Complex = {
  /** stable id, used in URLs that aren't territory-bound */
  id: string;
  /** content/territories/{territory}.md — the mechanism explainer */
  territory: string;
  /** article category slugs that belong to this complex */
  categories: string[];
  ja: string;
  en: string;
  /** one-line mechanism hook (JA) */
  mechanism: string;
  /** the body system named in plain terms (shown as a chip) */
  system: string;
  /** a relatable, first-person "あるある" worry used as a friendly entry */
  worry: string;
  /** normalization line — "you're not alone" framing */
  stat: string;
  accent: string;
  accentSoft: string;
};

export const complexes: Complex[] = [
  {
    id: "hair",
    territory: "hair-loss",
    categories: ["hair-loss"],
    ja: "薄毛・AGA",
    en: "Hair",
    mechanism: "テストステロンから DHT への変換と、毛包の感受性。",
    system: "5αリダクターゼ / DHT",
    worry: "生え際、後退してきた気がする",
    stat: "成人男性の約 3 人に 1 人",
    accent: "#B45309",
    accentSoft: "#FEF3E2",
  },
  {
    id: "sweat",
    territory: "sweat-odor",
    categories: ["hyperhidrosis", "bromhidrosis"],
    ja: "汗・におい",
    en: "Sweat & Odor",
    mechanism: "エクリン／アポクリン腺の働きと、皮膚常在菌の代謝。",
    system: "アポクリン腺 / 常在菌",
    worry: "汗ジミとにおいが、ずっと気になる",
    stat: "多汗症は約 20 人に 1 人とも",
    accent: "#0F766E",
    accentSoft: "#E5F4F2",
  },
  {
    id: "skin",
    territory: "skin-acne",
    categories: ["acne"],
    ja: "ニキビ・肌",
    en: "Skin",
    mechanism: "皮脂・毛穴の角化・アクネ菌が重なって起きる炎症。",
    system: "皮脂腺 / 角化 / アクネ菌",
    worry: "ニキビ跡が、なかなか消えない",
    stat: "大人の男性にも、とても多い",
    accent: "#BE123C",
    accentSoft: "#FCE9EE",
  },
  {
    id: "face",
    territory: "face-impression",
    categories: ["face"],
    ja: "顔の印象",
    en: "Face",
    mechanism: "骨格・むくみ・表情の癖が、印象の評価をつくる。",
    system: "骨格 / 浮腫 / 表情",
    worry: "実年齢より、老けて見られる",
    stat: "第一印象は数秒で決まる",
    accent: "#6D28D9",
    accentSoft: "#F1EAFC",
  },
  {
    id: "body-hair",
    territory: "beard-body-hair",
    categories: ["body-hair"],
    ja: "髭・体毛",
    en: "Body Hair",
    mechanism: "アンドロゲンと毛周期が、濃さと分布を決める。",
    system: "アンドロゲン / 毛周期",
    worry: "髭や体毛の濃さが、気になる",
    stat: "濃さは遺伝とホルモン次第",
    accent: "#15803D",
    accentSoft: "#E7F4EB",
  },
  {
    id: "self",
    territory: "mind-awareness",
    categories: ["philosophy"],
    ja: "自意識",
    en: "Self-Image",
    mechanism: "注意のバイアスと、自己評価の癖が悩みを増幅する。",
    system: "注意バイアス / 自己評価",
    worry: "鏡を見るのが、ちょっと怖い",
    stat: "気にしすぎ、には理由がある",
    accent: "#4338CA",
    accentSoft: "#EAEAFB",
  },
];

export function complexByTerritory(territory: string): Complex | undefined {
  return complexes.find((c) => c.territory === territory);
}

export function complexByCategory(category: string): Complex | undefined {
  return complexes.find((c) => c.categories.includes(category));
}

export function complexById(id: string): Complex | undefined {
  return complexes.find((c) => c.id === id);
}
