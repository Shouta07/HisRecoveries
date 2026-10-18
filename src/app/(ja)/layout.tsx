import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import Shell from "@/components/site/Shell";
import "@/app/globals.css";

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
    /* アカウントがあるときだけ名乗る。
       無いまま書くと、カードの下に押せない名前が出る。 */
    ...(site.handle ? { creator: site.handle, site: site.handle } : {}),
    images: ["/opengraph-image"],
  },
  /* ── 無くなった配信を、head から外した ──────────────
     全ページの <head> から /feed.xml を RSS として指していたが、
     その面はもう無い（記事の一覧と一緒に消えた）。
     購読した人のリーダーには、ずっとエラーが出ていた。 */
  alternates: {
    canonical: site.url,
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
  /* 携帯のブラウザーが、画面の上の帯をこの色で塗る。
     紺のままだったので、画面の色を温かくしたあとも、
     いちばん上の数ミリだけ前の色が残っていた。
     tailwind.config.ts の brand-deep と同じ値。 */
  themeColor: "#8E4330",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/* 日本語の面。海外へ一人旅に行く日本人向け。
 * 言語ごとにルートのレイアウトを分けている（html の lang を変えるため）。 */
export default function JaLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="ja">{children}</Shell>;
}
