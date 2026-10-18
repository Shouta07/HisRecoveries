import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ZH } from "@/lib/inbound";
import InboundPage from "@/components/site/InboundPage";

/* 来日本旅行的人（简体中文）。
 *
 * hreflang 只连接 en ↔ zh。
 * 日语页面面向去海外旅行的日本人，对象不同。 */
export const metadata: Metadata = {
  title: { absolute: ZH.title },
  description: ZH.description,
  alternates: {
    canonical: `${site.url}/zh`,
    languages: { en: `${site.url}/en`, "zh-Hans": `${site.url}/zh` },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: `${site.url}/zh`,
    siteName: "Tabi no Tashikame",
    title: ZH.title,
    description: ZH.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: ZH.title }],
  },
};

export default function ZhPage() {
  return <InboundPage c={ZH} />;
}
