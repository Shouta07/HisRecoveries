import { DEFINITION } from "./voice";
import { advisorWord } from "./who";
export const site = {
  /* ── 旧ブランドをやめた ──────────────────────────
     ここは長いあいだ "His Recoveries" だった。
     運営・記事側の名前で、記事20ルートが使っているから、
     という理由で残していた。

     残した結果、application-name / author / creator / publisher に
     旧ブランドが載り、全ページの <head> に出ていた。
     SNSに貼ったときのカードにも出る。

     サービスはタシカメ1つになったので、名乗りも1つにする。
     記事側のタイトルも、これで「— タシカメ」になる。 */
  name: "タシカメ",
  // タイトルタグの後半に毎回入る文字列。英語のブランドコピーではなく、
  // 「何のサイトか」を検索結果でそのまま読ませるほうが取れる。
  //
  // 「男性ウェルネスメディア」から変えた。カテゴリ名を名乗ると、
  // 同じカテゴリの何十とある一覧サイトと同じ棚に並ぶ。
  // ここが渡しているのは記事の量ではなく順番なので、動詞で名乗る。
  // schema.org の alternateName にはカテゴリ名も残してある（layout.tsx）。
  // ── 名前を「タシカメ」に変えた ──────────────────
  // Recovery は「回復」。回復すべき何かがある、と言っている。
  // この製品を使う人は壊れていない。送る直前のふつうの人。
  // His Recoveries は運営の事業名として残す（会社・記事・旧サービス）。
  //
  // ── 「聞く」をやめて「通す」にした ────────────────
  // 「5人に聞く」は無料のアンケートと同じ形をしている。
  // 同じ形のものに値段を付けると、高く見えるのは当たり前だった。
  // 主語を変える。自分が聞くのではなく、相手側に読まれる。
  tagline: `送る前に、${advisorWord()}の目を通す`,
  promise: "勘で、出さない。",
  // ── 「3人」をやめた ────────────────────────────
  // ここは検索結果に出る説明文で、サイト全体の schema.org と
  // OGP、記事ページのメタ記述が、すべてこの1行を読んでいる。
  //
  // 「女性3人に読んでもらう」と書いてあったが、
  // いま売っている4つの商品はどれも読むのは1人（plans.ts の answers）。
  // 買う前にいちばん多く読まれる場所に、売っていない人数が出ていた。
  //
  // 人数は plans.ts と突き合わせて、ずれたら公開を止める（下の確認）。
  /* ── 開いていない機能を書かない ────────────────────
     ここは長いあいだ「男性が…女性3人…写真…通話で話すこともできます」
     だった。voice.ts の DEFINITION（男女対象・恋亀・異性に確カメる）と
     ずれていたうえ、通話は受付前、画像は IMAGES_BUCKET が入るまで閉じている。

     検索結果とOGPに出る1行で、受け付けていないことを書くと、
     来た人が最初に見るものが嘘になる。

     DEFINITION をそのまま使う。あちらは
     「何をする場所か」と「人に聞けること」を判定で守っている。
     機能ごとの開き閉じは、それぞれの画面が出す。 */
  description: DEFINITION,
  url:
    /* 正式ドメインは tashikame.app。
       hisrecoveries.com は旧ドメインで、新規の正式URLには使わない。

       既定値もこちらにする。環境変数が無い環境で
       旧ドメインに戻るのを防ぐ（canonical・OGP・sitemap・
       robots・feed・Checkout の戻り先が、全部ここを読む）。 */
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://tashikame.app",
  author: "タシカメ",
  // authorBio を消した。旧事業（第一印象改善・ウェルネス伴走）の説明が
  // 入ったまま残っていたが、読んでいる場所が1つも無かった。
  handle: "@tashikame_app",
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
    "プロフィール 自己紹介文 書き方",
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

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 旧ドメインが、既定値として戻ってこないこと。

     ここは canonical・OGP・sitemap・robots・feed・
     Checkout の戻り先が、全部読んでいる1か所。
     ここが旧ドメインに戻ると、全部が旧ドメインに戻る。 */
  if (/hisrecoveries\.com/.test(site.url)) {
    throw new Error(`正式URLが旧ドメインになっています（${site.url}）`);
  }
  // https であること。.app は HTTPS 前提のドメイン。
  if (!site.url.startsWith("https://")) {
    throw new Error(`正式URLが https ではありません（${site.url}）`);
  }
  // www を付けない形であること。www は 301 で寄せている（next.config.mjs）。
  if (/^https:\/\/www\./.test(site.url)) {
    throw new Error(`正式URLに www が付いています（${site.url}）`);
  }
  // 末尾のスラッシュを付けない。付くと、つなげたときに // になる。
  if (site.url.endsWith("/")) {
    throw new Error(`正式URLの末尾にスラッシュがあります（${site.url}）`);
  }

  /* 旧ブランドが、名乗りに戻ってこないこと。
     application-name / author / creator / publisher に載って、
     全ページの <head> に出る。SNSのカードにも出る。 */
  for (const [k, v] of Object.entries({ name: site.name, author: site.author })) {
    if (/His Recoveries/i.test(String(v))) {
      throw new Error(`site.${k} が旧ブランドのままです（${v}）`);
    }
  }
}
