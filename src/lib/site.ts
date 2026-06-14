export const site = {
  name: "His Recoveries",
  tagline: "Male Conditioning",
  promise: "Recover Your Presence.",
  description:
    "Male Conditioning — Recover Your Presence. 清潔感、疲労、余白、男性の自意識について、静かに記録する Male Conditioning Journal / Recovery Culture Brand. 都市で疲れた現代男性が、整った状態を取り戻すための場所。",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisrecoveries.com",
  author: "His Recoveries",
  authorBio:
    "多汗症、ワキガ、ニキビ跡、顔の自意識を、当事者として実際に通過した日本人男性が運営するエディトリアル・メディア。20 代前半から多汗症の外用治療と脇のボトックスを継続、20 代後半にワキガの手術、ニキビ跡の美容皮膚科に 6 年。実名・顔・実年齢は非公開で運営しています。",
  handle: "@his_recoveries",
  email: "shota@vitality-design.jp",
  social: {
    threads: "https://www.threads.com/@hisrecoveries_jp",
    x: "https://x.com/his_recoveries",
    note: "https://note.com/his_recoveries",
    substack: "https://hisrecoveries.substack.com",
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
    representative: "山本 翔太",
    email: "shota@vitality-design.jp",
    postalCode: "〒153-0064",
    address: "東京都目黒区下目黒1丁目1番14号 コノトラビル7F",
    businesses: [
      "現場（toB）向け AI・DX システム開発",
      "顧客体験・業務オペレーション設計",
      "ウェルネス・美容領域の事業開発",
    ],
    // Capability detail for the company section on /about.
    capabilities: [
      {
        title: "現場 AX — AI・DX システム開発",
        body: "サロン・クリニック・現場系のオペレーションを、AI と業務システムで再設計します。顧客管理・予約・記録・コミュニケーションを一つの流れにまとめ、属人化していた現場の判断を、データで支える形に変えていきます。",
      },
      {
        title: "顧客体験・オペレーション設計",
        body: "顧客との関係性を「資産」として扱う体験設計です。初回接客からアフターフォロー、教育コンテンツ、再来の動線までを一貫して設計し、満足度・継続率・口コミにつながる仕組みをつくります。",
      },
      {
        title: "ウェルネス・美容領域の事業開発",
        body: "His Recoveries に代表される、当事者起点の事業づくり。メディア・診断・体験・コミュニティを組み合わせ、検証で得た知見を、他の関係性ビジネスの現場へ還元していきます。",
      },
    ],
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
