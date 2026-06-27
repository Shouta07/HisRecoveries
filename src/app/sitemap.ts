import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllEvents } from "@/lib/events";
import { getAllConcerns } from "@/lib/concerns";
import { getAllFeelingSlugs } from "@/lib/feelings";
import { getAllQASlugs } from "@/lib/qa";
import { getAllExpertSlugs } from "@/lib/experts";
import { getAllServiceSlugs } from "@/lib/services";
import { getAllScreenings } from "@/lib/screenings";
import { categories, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/apply",
    "/packages",
    "/experts",
    "/services",
    "/map",
    "/interview",
    "/founder",
    "/articles",
    "/events",
    "/concierge",
    "/concerns",
    "/screen",
    "/check",
    "/membership",
    "/reflect",
    "/submit-story",
    "/subscribe",
    "/privacy",
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

  const concernPaths: MetadataRoute.Sitemap = getAllConcerns().map((c) => ({
    url: `${site.url}/concerns/${c.slug}`,
    lastModified: new Date(c.opened),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const feelingPaths: MetadataRoute.Sitemap = getAllFeelingSlugs().map((slug) => ({
    url: `${site.url}/feelings/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const qaIndex: MetadataRoute.Sitemap = [
    { url: `${site.url}/qa`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site.url}/ask`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
  ];
  const qaPaths: MetadataRoute.Sitemap = getAllQASlugs().map((slug) => ({
    url: `${site.url}/qa/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const expertPaths: MetadataRoute.Sitemap = getAllExpertSlugs().map((slug) => ({
    url: `${site.url}/experts/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const servicePaths: MetadataRoute.Sitemap = getAllServiceSlugs().map((slug) => ({
    url: `${site.url}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const screenPaths: MetadataRoute.Sitemap = getAllScreenings().map((s) => ({
    url: `${site.url}/screen/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    ...staticPaths,
    ...categoryPaths,
    ...articlePaths,
    ...eventPaths,
    ...concernPaths,
    ...feelingPaths,
    ...qaIndex,
    ...qaPaths,
    ...expertPaths,
    ...servicePaths,
    ...screenPaths,
  ];
}
