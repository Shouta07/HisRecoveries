export const site = {
  name: "His Recoveries",
  tagline: "From Complex to Confidence",
  promise: "男の自己投資に、遠回りをなくす。",
  description:
    "男の自己投資から、遠回りをなくす相談窓口。今の自分から理想まで、何が正解か・いくらかかるか・どこへ行けば安心か——「探す・恥・迷う」の負担を私たちが引き受けます。モノや施術は売らず、紹介料も受け取りません。あなたのペースで、遠回りのない道だけを。",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisrecoveries.com",
  author: "His Recoveries",
  authorBio:
    "男性のコンプレックスを当事者として経験した運営チームによる、匿名で始められるウェルネス伴走サービス。運営チームの実名・顔・実年齢は非公開です。",
  handle: "@his_recoveries",
  email: "contact@vitality-design.jp",
  social: {
    threads: "https://www.threads.com/@hisrecoveries_jp",
    x: "https://x.com/his_recoveries",
    note: "https://note.com/his_recoveries",
    substack: "https://hisrecoveries.substack.com",
  },
  // LINE は SaaS モード（LINE Login + LIFF + 詳細診断）の入口。
  // addFriendUrl が空の間は、UI は「準備中」表示になる（壊れない）。
  // 値が入った瞬間に Hero / Screen result / Letter から自動で出る。
  line: {
    addFriendUrl: process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL ?? "",
    liffUrl: process.env.NEXT_PUBLIC_LINE_LIFF_URL ?? "",
  },
  locale: "ja_JP",
  language: "ja",
  region: "JP",
  // Global-ready foundation. Content is validated in Japanese first; the
  // English layer is a single brand landing (/en) for now. Expansion later.
  locales: {
    default: "ja",
    supported: ["ja", "en"],
  },
  company: {
    name: "バイタリティデザイン合同会社",
    nameEn: "Vitality Design LLC",
    statement: "We Design Vitality.",
    definition: "人と事業の活力を設計する会社",
    email: "contact@vitality-design.jp",
    postalCode: "〒153-0064",
    address: "東京都目黒区下目黒1丁目1番14号 コノトラビル7F",
  },
  topics: [
    "第一印象 改善",
    "メンズメイク 初心者",
    "男性 身だしなみ",
    "薄毛 原因",
    "ニキビ跡",
    "顔の印象",
    "メンズスキンケア",
    "From Complex to Confidence",
  ],
} as const;

export const socialSameAs = [
  site.social.threads,
  site.social.x,
  site.social.note,
  site.social.substack,
];

export type CategorySlug =
  | "philosophy"
  | "hyperhidrosis"
  | "acne"
  | "bromhidrosis"
  | "face"
  | "hair-loss"
  | "body-hair";

export const categories: Record<
  CategorySlug,
  { label: string; description: string }
> = {
  philosophy: {
    label: "哲学・思想",
    description: "観察と姿勢についての記録。",
  },
  hyperhidrosis: {
    label: "多汗症",
    description: "汗と過ごした時間について。",
  },
  acne: {
    label: "ニキビ",
    description: "肌と鏡についての記録。",
  },
  bromhidrosis: {
    label: "ワキガ",
    description: "距離と匂いについての記録。",
  },
  face: {
    label: "顔",
    description: "顔と自意識についての記録。",
  },
  "hair-loss": {
    label: "薄毛",
    description: "髪と、髪以外のことについての記録。",
  },
  "body-hair": {
    label: "髭・体毛",
    description: "整えると整えないのあいだについての記録。",
  },
};

export function categoryLabel(slug: string): string {
  return categories[slug as CategorySlug]?.label ?? slug;
}
