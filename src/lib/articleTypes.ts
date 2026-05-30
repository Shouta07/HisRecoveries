import { CategorySlug } from "./site";

export type ArticleFrontmatter = {
  title: string;
  slug: string;
  category: CategorySlug;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  status?: "draft" | "published";
  related?: string[];
  keywords?: string[];
  cover?: string;
  coverAlt?: string;
  // Curation flag for home "よく読まれている記事". When no article is
  // flagged true, the home falls back to the most recent 3.
  popular?: boolean;
};

export type Article = ArticleFrontmatter & {
  contentHtml: string;
  contentRaw: string;
  readingMinutes: number;
  wordCount: number;
};

export type ArticleSummary = ArticleFrontmatter & {
  readingMinutes: number;
  wordCount: number;
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
