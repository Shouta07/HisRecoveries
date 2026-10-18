import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { CITIES } from "@/lib/cities";
import { STORIES } from "@/lib/stories";

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
    at("/pricing", 0.6),
    /* 都市と記事は、中身があるぶんだけ出す。
       CITIES / STORIES が空のうちは、ここに何も足さない。
       空のページを検索に出さないため（lib/cities.ts に経緯）。 */
    ...CITIES.map((c) => at(`/cities/${c.slug}`, 0.7)),
    ...STORIES.map((s) => at(`/stories/${s.slug}`, 0.5)),
    at("/about", 0.4),
    at("/terms", 0.2),
    at("/privacy", 0.2),
    at("/legal", 0.2),
  ];
}
