import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export type Locale = "ja" | "en";

const BASE_DIR = path.join(process.cwd(), "content", "territories");

// ja content lives directly in content/territories; en mirrors in /en.
function dirFor(locale: Locale): string {
  return locale === "en" ? path.join(BASE_DIR, "en") : BASE_DIR;
}

export type TerritoryFrontmatter = {
  title: string;
  slug: string;
  subtitle: string;
  intro: string;
  categories: string[];
  relatedExit: "events" | "subscribe" | "territory";
  order: number;
  status?: "draft" | "published";
  faq: { q: string; a: string }[];
};

export type Territory = TerritoryFrontmatter & {
  contentHtml: string;
};

function readAllFiles(locale: Locale): string[] {
  const dir = dirFor(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(locale: Locale, filename: string) {
  const raw = fs.readFileSync(path.join(dirFor(locale), filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: TerritoryFrontmatter = {
    title: data.title ?? slug,
    slug,
    subtitle: data.subtitle ?? "",
    intro: data.intro ?? "",
    categories: data.categories ?? [],
    relatedExit: data.relatedExit ?? "subscribe",
    order: data.order ?? 99,
    status: data.status ?? "published",
    faq: (data.faq as { q: string; a: string }[]) ?? [],
  };
  return { fm, content };
}

export function getAllTerritories(locale: Locale = "ja"): TerritoryFrontmatter[] {
  return readAllFiles(locale)
    .map((f) => parseFile(locale, f).fm)
    .filter((t) => t.status !== "draft")
    .sort((a, b) => a.order - b.order);
}

export async function getTerritory(
  slug: string,
  locale: Locale = "ja"
): Promise<Territory | null> {
  const files = readAllFiles(locale);
  const file = files.find((f) => parseFile(locale, f).fm.slug === slug);
  if (!file) return null;
  const { fm, content } = parseFile(locale, file);
  const html = (
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)
  ).toString();
  return { ...fm, contentHtml: html };
}

export function getAllTerritorySlugs(locale: Locale = "ja"): string[] {
  return getAllTerritories(locale).map((t) => t.slug);
}
