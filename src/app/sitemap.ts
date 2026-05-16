import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllEvents } from "@/lib/events";
import { categories, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/articles",
    "/events",
    "/subscribe",
    "/privacy",
    "/legal",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "" ? 1.0 : 0.7,
  }));

  const categoryPaths: MetadataRoute.Sitemap = Object.keys(categories).map(
    (slug) => ({
      url: `${site.url}/articles/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  const articlePaths: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${site.url}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const eventPaths: MetadataRoute.Sitemap = getAllEvents().map((e) => ({
    url: `${site.url}/events/${e.slug}`,
    lastModified: new Date(e.startsAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPaths, ...categoryPaths, ...articlePaths, ...eventPaths];
}
