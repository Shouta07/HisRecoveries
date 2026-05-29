import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import readingTime from "reading-time";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type NoteType =
  | "comparison"
  | "explainer"
  | "faq"
  | "guide"
  | "reference";

export type NoteSource = { title: string; url: string };

export type NoteFrontmatter = {
  title: string;
  slug: string;
  territory: string;
  type: NoteType;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  status?: "draft" | "published";
  keywords: string[];
  // AI generation traceability
  generatedBy?: string;
  generatedAt?: string;
  qualityScore?: number;
  sources?: NoteSource[];
  hasAffiliate?: boolean;
};

export type NoteSummary = NoteFrontmatter & {
  readingMinutes: number;
};

export type NoteDetail = NoteSummary & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(NOTES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .filter((f) => !f.startsWith("_"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(NOTES_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: NoteFrontmatter = {
    title: data.title ?? slug,
    slug,
    territory: data.territory ?? "",
    type: (data.type as NoteType) ?? "explainer",
    excerpt: data.excerpt ?? "",
    publishedAt: data.publishedAt ?? "1970-01-01",
    updatedAt: data.updatedAt,
    status: data.status ?? "draft",
    keywords: data.keywords ?? [],
    generatedBy: data.generatedBy,
    generatedAt: data.generatedAt,
    qualityScore: data.qualityScore,
    sources: data.sources ?? [],
    hasAffiliate: Boolean(data.hasAffiliate),
  };
  return { fm, content };
}

export function getAllNotes(): NoteSummary[] {
  return readAllFiles()
    .map((f) => {
      const { fm, content } = parseFile(f);
      return {
        ...fm,
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
      };
    })
    .filter((n) => n.status !== "draft")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getAllNoteSlugs(): string[] {
  return getAllNotes().map((n) => n.slug);
}

export function getNotesByTerritory(territorySlug: string): NoteSummary[] {
  return getAllNotes().filter((n) => n.territory === territorySlug);
}

/**
 * Used by the generation script to avoid re-generating near-duplicate notes.
 * Returns titles + slugs of every existing note (drafts included).
 */
export function getNoteIndex(): { title: string; slug: string }[] {
  return readAllFiles().map((f) => {
    const { fm } = parseFile(f);
    return { title: fm.title, slug: fm.slug };
  });
}

export async function getNote(slug: string): Promise<NoteDetail | null> {
  const file = readAllFiles().find((f) => parseFile(f).fm.slug === slug);
  if (!file) return null;
  const { fm, content } = parseFile(file);
  const html = (
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)
  ).toString();
  return {
    ...fm,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    contentHtml: html,
  };
}
