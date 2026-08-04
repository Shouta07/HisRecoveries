export const site = {
  name: "His Recoveries",
  // タイトルタグの後半に毎回入る文字列。英語のブランドコピーではなく、
  // 「何のサイトか」を検索結果でそのまま読ませるほうが取れる。
  //
  // 「男性ウェルネスメディア」から変えた。カテゴリ名を名乗ると、
  // 同じカテゴリの何十とある一覧サイトと同じ棚に並ぶ。
  // ここが渡しているのは記事の量ではなく順番なので、動詞で名乗る。
  // schema.org の alternateName にはカテゴリ名も残してある（layout.tsx）。
  tagline: "男性の改善を編集する",
  promise: "もっといい自分は、つくれる。",
  description:
    "髪・肌・睡眠・疲れ・体・パートナーとのこと。男性の改善を、順番として編集しています。薄毛・AGA、ニキビ、第一印象、髭・体毛、顔の印象、心と習慣について、出典を明記して整理し、編集部が実際に確かめたことを書いています。何をやるかと同じくらい、やらなくていいことも書きます。効果の保証はしません。",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hisrecoveries.com",
  author: "His Recoveries",
  authorBio:
    "男性のコンプレックスを当事者として経験した運営チームによる、秘密保持契約のもとで始められるウェルネス伴走サービス。運営チームの実名・顔・実年齢は非公開です。",
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
  // LINE は公開サイトに貼らない。お支払い後の伴走でのみ使い、その時点で
  // 個別に友だち追加をご案内する。公開の入口は /reserve（無料相談）に統一。
  line: {
    addFriendUrl: "",
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
    "男性 美容",
    "メンズ 悩み",
    "第一印象 改善",
    "メンズメイク 初心者",
    "男性 身だしなみ",
    "薄毛 原因",
    "AGA 費用",
    "ニキビ跡",
    "顔の印象",
    "メンズスキンケア",
    "疲れ 取れない 男性",
  ],
} as const;

/**
 * SNSに貼ったときのカード画像。
 *
 * Next.js は、ページ側で openGraph を書くと親の openGraph を丸ごと
 * 置き換える。images だけ書き忘れると、カードから画像が消える。
 * 実測で12ルートが画像なしになっていた（twitter:card は
 * summary_large_image を宣言したまま、画像だけ無い状態）。
 * 各ページで同じ literal を書くと必ずどれかがずれるので、ここに置く。
 */
export const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

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
