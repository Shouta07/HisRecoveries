export const site = {
  name: "His Recoveries",
  tagline: "半歩先からの記録",
  description:
    "多汗症・ニキビ・ワキガ・顔。複数のコンプレックスを超えてきた経験を、半歩先から静かに記録する。叫ばず、整える。",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisrecoveries.com",
  author: "Nagi",
  authorBio:
    "多汗症・ニキビ・ワキガ・顔の自信のなさを経験し、超えてきた当事者。半歩先から、後ろを歩く人に静かに記録を残す。",
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
    "多汗症",
    "ニキビ",
    "ワキガ",
    "腋臭症",
    "ニキビ跡",
    "男性の自意識",
    "コンプレックス",
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
  | "face";

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
};

export function categoryLabel(slug: string): string {
  return categories[slug as CategorySlug]?.label ?? slug;
}
