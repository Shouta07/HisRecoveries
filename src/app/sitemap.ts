import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { CITIES } from "@/lib/voice";
import { SCENES } from "@/lib/scene/problems";

/* 検索に出す面。
 *
 * 記事（/areas・/situations・/articles）は消した。
 * メンズ美容の記事71本で、旅のサイトには置けない。
 *
 * 残るのは、トップ・都市・場面・法務。
 * 都市と場面が、検索から人が来る入口になる。 */
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
    // 行った人が残したことが貯まる面。検索の入口
    ...CITIES.map((c) => at(`/cities/${encodeURIComponent(c)}`, 0.8)),
    at("/scene", 0.7),
    ...SCENES.map((s) => at(`/scene/${s.id}`, 0.6)),
    at("/plans", 0.5),
    at("/about", 0.3),
    at("/terms", 0.2),
    at("/privacy", 0.2),
    at("/legal", 0.2),
  ];
}
