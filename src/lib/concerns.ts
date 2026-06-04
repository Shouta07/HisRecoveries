import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const CONCERNS_DIR = path.join(process.cwd(), "content", "concerns");

export type ConcernStatus = "open" | "observed" | "archived";

export type ConcernOption = {
  label: string;
  note?: string;
};

export type ConcernVoice = {
  id?: string;
  body: string;
};

export type ConcernFrontmatter = {
  ticketId: string;
  title: string;
  slug: string;
  territory: string;
  status: ConcernStatus;
  opened: string;
  mirrorTriggers: string[];
  keywords: string[];
  articles: string[]; // article slugs
  options: ConcernOption[];
  shelfRefs: string[];
  voices: ConcernVoice[];
  observers: number;
  excerpt?: string;
};

export type Concern = ConcernFrontmatter & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(CONCERNS_DIR)) {
    fs.mkdirSync(CONCERNS_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(CONCERNS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(CONCERNS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: ConcernFrontmatter = {
    ticketId: (data.ticketId as string) ?? "000",
    title: (data.title as string) ?? slug,
    slug,
    territory: (data.territory as string) ?? "",
    status: ((data.status as ConcernStatus) ?? "open"),
    opened: (data.opened as string) ?? new Date().toISOString().slice(0, 10),
    mirrorTriggers: (data.mirrorTriggers as string[]) ?? [],
    keywords: (data.keywords as string[]) ?? [],
    articles: (data.articles as string[]) ?? [],
    options: (data.options as ConcernOption[]) ?? [],
    shelfRefs: (data.shelfRefs as string[]) ?? [],
    voices: (data.voices as ConcernVoice[]) ?? [],
    observers: (data.observers as number) ?? 0,
    excerpt: data.excerpt as string | undefined,
  };
  return { fm, content };
}

export function getAllConcerns(): ConcernFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((c) => c.status !== "archived")
    .sort((a, b) => Number(a.ticketId) - Number(b.ticketId));
}

export function getAllConcernSlugs(): string[] {
  return getAllConcerns().map((c) => c.slug);
}

export async function getConcern(slug: string): Promise<Concern | null> {
  const file = readAllFiles().find((f) => parseFile(f).fm.slug === slug);
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

/**
 * For a given article slug, find all concerns that reference it.
 * Lets the article page show its parent concerns without requiring
 * article frontmatter edits.
 */
export function getConcernsForArticle(articleSlug: string): ConcernFrontmatter[] {
  return getAllConcerns().filter((c) => c.articles.includes(articleSlug));
}

export function getConcernsByTerritory(
  territorySlug: string
): ConcernFrontmatter[] {
  return getAllConcerns().filter((c) => c.territory === territorySlug);
}
