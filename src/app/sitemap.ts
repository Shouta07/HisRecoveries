import { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";
import { clusters } from "@/lib/clusters";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = ["", "/reserve", "/apply", "/areas", "/areas/confidence", "/why", "/faq", "/privacy"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "" ? 1.0 : 0.7,
  }));

  const areaPaths: MetadataRoute.Sitemap = complexes.map((c) => ({
    url: `${site.url}/areas/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const clusterPaths: MetadataRoute.Sitemap = clusters.map((a) => ({
    url: `${site.url}/areas/${a.areaId}/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPaths, ...areaPaths, ...clusterPaths];
}
