import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const TERRITORIES_DIR = path.join(process.cwd(), "content", "territories");

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

function ensureDir() {
  if (!fs.existsSync(TERRITORIES_DIR)) {
    fs.mkdirSync(TERRITORIES_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(TERRITORIES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(TERRITORIES_DIR, filename), "utf8");
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

export function getAllTerritories(): TerritoryFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((t) => t.status !== "draft")
    .sort((a, b) => a.order - b.order);
}

export async function getTerritory(slug: string): Promise<Territory | null> {
  const files = readAllFiles();
  const file = files.find((f) => parseFile(f).fm.slug === slug);
  if (!file) return null;
  const { fm, content } = parseFile(file);
  const html = (
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)
  ).toString();
  return { ...fm, contentHtml: html };
}

export function getAllTerritorySlugs(): string[] {
  return getAllTerritories().map((t) => t.slug);
}
