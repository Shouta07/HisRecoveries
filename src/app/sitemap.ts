import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";
import { clusters, CLUSTER_UPDATED } from "@/lib/clusters";
import { AREA_UPDATED } from "@/lib/areas";

// 優先度は「トップ > 分野ハブ > 記事 > 手続きページ」。
// lastModified は今日ではなく、実際に中身を更新した日を出す。
// 毎日 now を出すと、更新していないのに更新したと言うことになる。
export default function sitemap(): MetadataRoute.Sitemap {
  const articleDate = new Date(`${CLUSTER_UPDATED}T00:00:00+09:00`);
  const areaDate = new Date(`${AREA_UPDATED}T00:00:00+09:00`);

  const home: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: articleDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  const areaPaths: MetadataRoute.Sitemap = complexes.map((c) => ({
    url: `${site.url}/areas/${c.id}`,
    lastModified: areaDate,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const clusterPaths: MetadataRoute.Sitemap = clusters.map((a) => ({
    url: `${site.url}/areas/${a.areaId}/${a.slug}`,
    lastModified: articleDate,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const staticPaths: MetadataRoute.Sitemap = [
    "/plan",
    "/areas/confidence",
    "/reserve",
    "/apply",
    "/partner",
    "/privacy",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: areaDate,
    changeFrequency: "monthly",
    priority: p === "/plan" ? 0.7 : 0.4,
  }));

  return [...home, ...areaPaths, ...clusterPaths, ...staticPaths];
}
