export const site = {
  name: "His Recoveries",
  tagline: "From Complex to Confidence",
  promise: "コンプレックスから自信への変化を、デザインする。",
  description:
    "コンプレックスから自信への変化を、デザインする。男性のための、完全匿名・完全守秘義務・完全招待制のウェルネス伴走サービス（医療と美容の中間）。現在地を可視化し、専属が伴走。必要なときは、中立に連携医療機関へおつなぎします。",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisrecoveries.com",
  author: "His Recoveries",
  authorBio:
    "多汗症、ワキガ、ニキビ跡、顔の自意識を、当事者として実際に通過した日本人男性が運営するエディトリアル・メディア。20 代前半から多汗症の外用治療と脇のボトックスを継続、20 代後半にワキガの手術、ニキビ跡の美容皮膚科に 6 年。実名・顔・実年齢は非公開で運営しています。",
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
    "Male Conditioning",
    "Quiet Masculinity",
    "Social Recovery",
    "Emotional Grooming",
    "多汗症",
    "ニキビ",
    "ワキガ",
    "腋臭症",
    "ニキビ跡",
    "男性の自意識",
    "メンズスキンケア",
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
