import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/* 検索に出す面。
 *
 * 日本語（/）と訪日版（/en・/zh）は、対象が違うサービス。
 * 同じページの訳ではないので、hreflang は各ページの
 * metadata で en ↔ zh だけを結んでいる。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const at = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  });
  return [
    at("", 1),
    at("/en", 0.8),
    at("/zh", 0.8),
    at("/about", 0.3),
    at("/terms", 0.2),
    at("/privacy", 0.2),
    at("/legal", 0.2),
  ];
}
