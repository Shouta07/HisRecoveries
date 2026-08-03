import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";
import { clusters, CLUSTER_UPDATED } from "@/lib/clusters";
import { SITUATIONS } from "@/lib/situations";
import { publishedAt } from "@/lib/articleDates";
import { AREA_UPDATED } from "@/lib/areas";

// 優先度は「トップ > 分野ハブ > 記事 > 手続きページ」。
// lastModified は今日ではなく、実際に中身を更新した日を出す。
// 毎日 now を出すと、更新していないのに更新したと言うことになる。
export default function sitemap(): MetadataRoute.Sitemap {
  // 正午（JST）で作る。0時だと UTC に直したとき前日にずれ、
  // sitemap の lastmod が実際より1日古く出る。
  const articleDate = new Date(`${CLUSTER_UPDATED}T12:00:00+09:00`);
  const areaDate = new Date(`${AREA_UPDATED}T12:00:00+09:00`);

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

  const clusterPaths: MetadataRoute.Sitemap = clusters.map((a) => {
    const d = publishedAt(a.slug);
    return {
      url: `${site.url}/areas/${a.areaId}/${a.slug}`,
      lastModified: d ? new Date(`${d}T12:00:00+09:00`) : articleDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
  });

  // 状況ページ。編集の手で束ねた9本で、どれも5本以上の記事を持つ。
  const situationPaths: MetadataRoute.Sitemap = SITUATIONS.map((s) => ({
    url: `${site.url}/situations/${s.id}`,
    lastModified: articleDate,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // 選択肢（判断情報）。記事より少ないが、AI検索が抜き出すのはこちら
  const choicePaths: MetadataRoute.Sitemap = [
    "/choices",
    ...["impression", "hair", "skin", "face", "body-hair", "mind"].map((a) => `/choices/${a}`),
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: articleDate,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const staticPaths: MetadataRoute.Sitemap = [
    "/check",
    "/plan",
    "/areas/confidence",
    "/reserve",
    "/apply",
    "/partner",
    "/disclosure",
    "/privacy",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: areaDate,
    changeFrequency: "monthly",
    priority: p === "/plan" ? 0.7 : 0.4,
  }));

  return [
    ...home,
    ...areaPaths,
    ...choicePaths,
    ...situationPaths,
    ...clusterPaths,
    ...staticPaths,
  ];
}
