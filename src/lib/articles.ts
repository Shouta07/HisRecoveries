import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import readingTime from "reading-time";
import { CategorySlug, categories } from "./site";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

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

function ensureDir() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const filePath = path.join(ARTICLES_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const frontmatter: ArticleFrontmatter = {
    title: data.title ?? slug,
    slug,
    category: (data.category as CategorySlug) ?? "philosophy",
    publishedAt: data.publishedAt ?? "1970-01-01",
    updatedAt: data.updatedAt,
    excerpt: data.excerpt ?? "",
    status: data.status ?? "published",
    related: data.related ?? [],
    keywords: data.keywords ?? [],
    cover: data.cover,
    coverAlt: data.coverAlt,
  };
  return { frontmatter, content };
}

function countWords(content: string): number {
  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~\-]/g, " ");
  const cjk = (stripped.match(/[぀-ヿ㐀-鿿]/g) ?? []).length;
  const latin = (stripped.match(/[a-zA-Z0-9]+/g) ?? []).length;
  return cjk + latin;
}

export function getAllArticles(): ArticleSummary[] {
  const files = readAllFiles();
  return files
    .map((f) => {
      const { frontmatter, content } = parseFile(f);
      return {
        ...frontmatter,
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
        wordCount: countWords(content),
      };
    })
    .filter((a) => a.status !== "draft")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getArticlesByCategory(slug: string): ArticleSummary[] {
  return getAllArticles().filter((a) => a.category === slug);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const files = readAllFiles();
  const file = files.find((f) => {
    const parsed = parseFile(f);
    return parsed.frontmatter.slug === slug;
  });
  if (!file) return null;
  const { frontmatter, content } = parseFile(file);
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(content);
  return {
    ...frontmatter,
    contentHtml: processed.toString(),
    contentRaw: content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    wordCount: countWords(content),
  };
}

export function getRelatedArticles(article: Article): ArticleSummary[] {
  const all = getAllArticles();
  if (article.related && article.related.length > 0) {
    return article.related
      .map((slug) => all.find((a) => a.slug === slug))
      .filter((a): a is ArticleSummary => Boolean(a))
      .slice(0, 3);
  }
  return all
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);
}

export function getAllSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}

export function getAllCategorySlugs(): string[] {
  return Object.keys(categories);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
