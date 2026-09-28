export const site = {
  name: "His Recoveries",
  // タイトルタグの後半に毎回入る文字列。英語のブランドコピーではなく、
  // 「何のサイトか」を検索結果でそのまま読ませるほうが取れる。
  //
  // 「男性ウェルネスメディア」から変えた。カテゴリ名を名乗ると、
  // 同じカテゴリの何十とある一覧サイトと同じ棚に並ぶ。
  // ここが渡しているのは記事の量ではなく順番なので、動詞で名乗る。
  // schema.org の alternateName にはカテゴリ名も残してある（layout.tsx）。
  // プロダクトが「人の視点が流通するC2C」に変わったので、
  // サイト全体の名乗りもそちらに合わせる。
  // 記事55本は残っているが、それは読みものであってサイトの主題ではない。
  tagline: "相手に近い人に、聞く",
  promise: "そのLINE、送る前に5人に聞く。",
  description:
    "相手に近い実在の人から、リアルな反応をもらえる場所です。LINEの文面、写真、誘い方、距離感について、年代や立場を指定して匿名で聞けます。答えるのは専門家ではなく、その立場にいる実在の人です。効果や結果の保証はしません。",
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
  // サイト全体の keywords（layout.tsx）。
  // 記事の主題（薄毛・肌など）は各記事のメタデータ側に持たせてあるので、
  // ここはプロダクトの主題に寄せる。
  topics: [
    "女性に聞く",
    "LINE 送る前",
    "恋愛 意見 匿名",
    "プロフィール写真 どっち",
    "デート 誘い方",
    "第三者の意見",
    "匿名 アンケート 恋愛",
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
