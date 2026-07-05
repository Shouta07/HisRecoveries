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
  /** "なぜ起きるのか" — a short mechanism explainer paragraph (JA) */
  why: string;
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
    why: "テストステロンが 5αリダクターゼによって、より強力な DHT に変換されます。この DHT が、遺伝的に感受性の高い前頭部・頭頂部の毛包に作用すると、髪の成長期が短くなり、太く育つ前に抜ける「軟毛化」が進みます。後頭部が残りやすいのは、その部位の感受性が低いから。進行性なので、気づいた時間が選択肢の幅を最も左右します。",
    accent: "#B45309",
    accentSoft: "#FEF3E2",
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
    why: "皮脂の分泌、毛穴の出口の角化（詰まり）、アクネ菌の増殖、そして炎症。この4つが重なって、ニキビは起きます。男性は皮脂量が多く、摩擦や汗の影響も受けやすい。さらに「ニキビと思っていたら、実はマラセチア（カビ）由来だった」というケースもあり、見分けが対処の分かれ目になります。",
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
    why: "「老けて見える」「疲れて見える」は、骨格・むくみ・表情の癖・肌の質感・睡眠などが複合して生まれます。可逆な要素（むくみ・肌・表情）と、そうでない要素（骨格）が混ざっているのが特徴。だから「何が印象をつくっているか」を要素に分解すると、変えられる部分から手をつけられます。",
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
    why: "髭や体毛の濃さ・分布は、アンドロゲン（男性ホルモン）への毛包の感受性と、毛周期で決まります。これは体質であり、だらしなさではありません。「整える／整えない」「減らす」のどれを選ぶかは好みの問題で、正解はひとつではない領域です。",
    accent: "#15803D",
    accentSoft: "#E7F4EB",
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
