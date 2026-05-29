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
  email: "contact@hisrecoveries.com",
  social: {
    threads: "https://www.threads.net/@his_recoveries",
    x: "https://x.com/his_recoveries",
    note: "https://note.com/his_recoveries",
    substack: "https://hisrecoveries.substack.com",
  },
  locale: "ja_JP",
  language: "ja",
  region: "JP",
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
