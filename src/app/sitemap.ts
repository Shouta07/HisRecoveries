import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { getAllEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { getAllConcerns } from "@/lib/concerns";
import { getAllFeelingSlugs } from "@/lib/feelings";
import { getAllQASlugs } from "@/lib/qa";
import { getAllRecoverySlugs, getAllTagsByKind } from "@/lib/recoveries";
import { getAllExpertSlugs } from "@/lib/experts";
import { getAllServiceSlugs } from "@/lib/services";
import { getAllScreenings } from "@/lib/screenings";
import { categories, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPaths: MetadataRoute.Sitemap = [
    "",
    "/en",
    "/recoveries",
    "/experts",
    "/services",
    "/map",
    "/interview",
    "/manifesto",
    "/founder",
    "/articles",
    "/events",
    "/concierge",
    "/territories",
    "/concerns",
    "/screen",
    "/check",
    "/membership",
    "/network",
    "/reflect",
    "/assessment",
    "/submit-story",
    "/subscribe",
    "/privacy",
    // /stories は /recoveries に 301 リダイレクトされるためインデックスから除外
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

  const recoveryPaths: MetadataRoute.Sitemap = getAllRecoverySlugs().map(
    (slug) => ({
      url: `${site.url}/recoveries/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    })
  );

  const tagsByKind = getAllTagsByKind();
  const tagPaths: MetadataRoute.Sitemap = [
    ...tagsByKind.concern.map((tag) => ({ kind: "concern", tag })),
    ...tagsByKind.action.map((tag) => ({ kind: "action", tag })),
    ...tagsByKind.outcome.map((tag) => ({ kind: "outcome", tag })),
  ].map(({ kind, tag }) => ({
    url: `${site.url}/recoveries/by-tag/${kind}/${encodeURIComponent(tag)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.55,
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

  // English (core) mirror.
  const enStatic: MetadataRoute.Sitemap = [
    "/en/territories",
    "/en/stories",
  ].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const enTerritoryPaths: MetadataRoute.Sitemap = getAllTerritories("en").map(
    (t) => ({
      url: `${site.url}/en/territories/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const enFeelingPaths: MetadataRoute.Sitemap = getAllFeelingSlugs().map(
    (slug) => ({
      url: `${site.url}/en/feelings/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return [
    ...staticPaths,
    ...categoryPaths,
    ...articlePaths,
    ...eventPaths,
    ...territoryPaths,
    ...concernPaths,
    ...feelingPaths,
    ...qaIndex,
    ...qaPaths,
    ...recoveryPaths,
    ...tagPaths,
    ...expertPaths,
    ...servicePaths,
    ...screenPaths,
    ...enStatic,
    ...enTerritoryPaths,
    ...enFeelingPaths,
  ];
}
