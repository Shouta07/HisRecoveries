import type { Metadata } from "next";
import { site } from "@/lib/site";
import { EN } from "@/lib/inbound";
import InboundPage from "@/components/site/InboundPage";

/* 日本へ来る人向け（英語）。
 *
 * hreflang は en ↔ zh だけで結ぶ。
 * 日本語の面は「海外へ行く日本人」向けで、対象が違う。
 * 同じページの訳として結ぶと、検索エンジンにも読む人にも嘘になる。 */
export const metadata: Metadata = {
  title: { absolute: EN.title },
  description: EN.description,
  alternates: {
    canonical: `${site.url}/en`,
    languages: { en: `${site.url}/en`, "zh-Hans": `${site.url}/zh` },
  },
  openGraph: {
    type: "website",
    locale: "en",
    url: `${site.url}/en`,
    siteName: "Tabi no Tashikame",
    title: EN.title,
    description: EN.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: EN.title }],
  },
};

export default function EnPage() {
  return <InboundPage c={EN} />;
}
