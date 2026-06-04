import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { getAllConcerns } from "@/lib/concerns";
import { categories, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/recoveries",
    "/about",
    "/manifesto",
    "/founder",
    "/articles",
    "/events",
    "/concierge",
    "/territories",
    "/concerns",
    "/shelf",
    "/reflect",
    "/assessment",
    "/stories",
    "/submit-story",
    "/subscribe",
    "/disclosure",
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

  const territoryPaths: MetadataRoute.Sitemap = getAllTerritories().map((t) => ({
    url: `${site.url}/territories/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const concernPaths: MetadataRoute.Sitemap = getAllConcerns().map((c) => ({
    url: `${site.url}/concerns/${c.slug}`,
    lastModified: new Date(c.opened),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...staticPaths,
    ...categoryPaths,
    ...articlePaths,
    ...eventPaths,
    ...territoryPaths,
    ...concernPaths,
  ];
}
