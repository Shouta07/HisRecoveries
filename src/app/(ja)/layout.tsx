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

/* 日本語の面。海外へ一人旅に行く日本人向け。
 * 言語ごとにルートのレイアウトを分けている（html の lang を変えるため）。 */
export default function JaLayout({ children }: { children: React.ReactNode }) {
  return <Shell lang="ja">{children}</Shell>;
}
