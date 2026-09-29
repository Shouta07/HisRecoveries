import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";
import { clusters, CLUSTER_UPDATED } from "@/lib/clusters";
import { SITUATIONS } from "@/lib/situations";
import { publishedAt } from "@/lib/articleDates";
import { AREA_UPDATED } from "@/lib/areas";
import { LAST_UPDATED } from "@/lib/updates";

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

  // 更新記録。lastModified は最後に判断が変わった日を出す。
  // ここだけは articleDate（記事の更新日）を使わない。
  const updatesPath: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/updates`,
      lastModified: new Date(`${LAST_UPDATED}T12:00:00+09:00`),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const staticPaths: MetadataRoute.Sitemap = [
    // 記事の索引と編集方針。もとはトップの中（#index / #about）にあった面で、
    // トップが /app の入口になったときに独立させた。
    // 商品そのもの。広告からも検索からも、ここに直接来てほしい。
    "/ask",
    "/articles",
    "/about",
    // 回答する側の入口。検索から直接来てほしい面なので載せる。
    "/join",
    // 回答者の一覧。マーケットプレイスの供給側。
    "/answerers",
    "/mine",
    // 特定商取引法に基づく表記。課金する以上、検索から辿れる必要がある。
    "/legal",
    // 安全と、いまできないこと。トップから降ろしたものの行き先。
    "/safety",
    // 仕組み。誰が答えるか・AIを何に使うか。トップから降ろした説明の行き先。
    "/how",
    // 人と話す。受付前だが、順番待ちの入口として検索から来てほしい。
    "/talk",
    "/areas/confidence",
    "/disclosure",
    "/privacy",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: areaDate,
    changeFrequency: "monthly",
    priority: p === "/ask" ? 0.9 : 0.4,
  }));

  return [
    ...home,
    ...areaPaths,
    ...situationPaths,
    ...clusterPaths,
    ...updatesPath,
    ...staticPaths,
  ];
}
