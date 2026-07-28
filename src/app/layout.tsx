import type { Metadata, Viewport } from "next";
// Self-hosted fonts via fontsource (no build-time Google Fonts fetch → no
// more transient CI deploy failures). CSS vars are set in globals.css.
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-sans-jp/800.css";
import "@fontsource/noto-sans-jp/900.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
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
  themeColor: "#2C3A2E",
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
    alternateName: ["His Recoveries", "男性ウェルネスメディア"],
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
    publishingPrinciples: `${site.url}/#about`,
    // 紹介料を受け取らないことが、この媒体の立場そのもの。構造化データにも出す。
    ethicsPolicy: `${site.url}/#about`,
    knowsAbout: [
      "男性の美容",
      "男性の健康",
      "第一印象",
      "薄毛・AGA",
      "メンズスキンケア",
      "メンズメイク",
      "髭・体毛の処理",
      "顔の印象",
      "睡眠・習慣",
      "男性のコンプレックス",
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
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
