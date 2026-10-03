import type { Metadata, Viewport } from "next";
// ── Webフォントを積むのをやめた ─────────────────────────────
//
// 以前は Noto Sans JP を5ウェイト＋Cormorant を4ウェイト読んでいて、
// 記事1ページが 2.2MB・96リクエストだった。本文600字の記事に載せる重さではない。
//
// ウェイトを 400/700 の2つに絞ってもフォントは 730KB のままだった。
// 実測すると、日本語のサブセット分割で 69ファイル に分かれて落ちてくる
// （119番のブロックだけで 43KB × 2ウェイト）。ウェイトを減らしても、
// ページに出る漢字の種類が減るわけではないので、ここは削れない。
//
// なので端末のフォントで組む。iOS/Mac は ヒラギノ角ゴ、Windows は 游ゴシック。
// どちらも日本語メディアで広く使われている本文書体で、Noto Sans JP と
// 大きく印象が変わらない。転送量は 730KB → 0KB、リクエストは 69 → 0。
//
// もしブランド書体を戻すなら、fontsource ではなく
// 「実際に使う文字だけを含むサブセットを1ファイル作って自前で置く」形にすること。
// fontsource のサブセット分割は、日本語ではこの症状が必ず出る。
import Header from "@/components/Header";
import Landed from "@/components/brand/Landed";
import Tags from "@/components/brand/Tags";
import Analytics from "@/components/Analytics";
import SearchProvider from "@/components/search/SearchProvider";
import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { site, socialSameAs } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author }],
  creator: site.author,
  publisher: site.name,
  category: "lifestyle",
  keywords: [...site.topics],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    creator: site.handle,
    site: site.handle,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: site.url,
    types: {
      "application/rss+xml": [{ url: `${site.url}/feed.xml`, title: `${site.name} — 新着記事` }],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": site.region,
    "geo.placename": "Japan",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E4A66",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    alternateName: site.tagline,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#publisher` },
    // トップの絞り込みは ?q= を URL に載せるので、この宣言は実際に動く
    // （検索結果からサイト内検索に直接入れる可能性を残す）。
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/?q={search_term_string}#index`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // 出版者。メディアなので Organization ではなく NewsMediaOrganization…ではなく、
  // 報道機関ではないため Organization のまま publishingPrinciples を持たせる。
  // 編集方針は独立ページを持たないので、トップの #about を指す。
  const publisherLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#publisher`,
    name: site.name,
    /* ここに旧ブランドと旧カテゴリを残していた。
       検索エンジンに「別名はこれです」と伝える欄なので、
       残すと旧ブランドで引き続き紐づく。

       「男性ウェルネスメディア」は、男性限定に見える表現でもある。
       サービスは男女どちらでも使える形にしたので、両方外す。 */
    alternateName: "恋亀",
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/icon.png`,
      width: 256,
      height: 256,
    },
    sameAs: socialSameAs,
    description: site.description,
    slogan: site.promise,
    foundingDate: "2026",
    publishingPrinciples: `${site.url}/about`,
    // サイトの主題。プロダクトが変わったので、ここも合わせる。
    // 記事の主題（薄毛・肌など）は、各記事のメタデータ側に残っている。
    knowsAbout: [
      // 「人の視点のマーケットプレイス」を外した。
      // 場貸しではなく、当社が相談サービスとして売っている。
      // 公開の構造化データに marketplace と書いてあると、
      // 実態とも、決済（Stripe）への説明とも食い違う。
      "オンライン恋愛相談",
      "匿名の意見収集",
      "属性を指定した意見の収集",
      "メッセージの受け取られ方",
      "プロフィール写真の印象",
      "デートの誘い方",
      "人間関係の距離感",
    ],
    knowsLanguage: ["ja"],
    areaServed: { "@type": "Country", name: "Japan" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "editorial",
      email: site.email,
      availableLanguage: ["Japanese", "English"],
    },
  };

  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(publisherLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-3 focus:py-2 focus:text-off-white"
        >
          本文へスキップ
        </a>
        <SearchProvider allCount={clusters.length}>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          {/* 購入率の分母。1来訪につき1回だけ数える */}
          <Landed />
          {/* 広告と解析のタグ。鍵を入れた分だけ動く */}
          <Tags />
        </SearchProvider>
        <Analytics />
      </body>
    </html>
  );
}
