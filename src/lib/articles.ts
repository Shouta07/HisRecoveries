import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import readingTime from "reading-time";
import { CategorySlug, categories } from "./site";
import {
  Article,
  ArticleFrontmatter,
  ArticleSummary,
  formatDate,
} from "./articleTypes";

export type { Article, ArticleFrontmatter, ArticleSummary } from "./articleTypes";
export { formatDate } from "./articleTypes";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");
const MEDIA_DIR = path.join(process.cwd(), "public", "media", "articles");

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

/**
 * Auto-discover the cover image for a given article slug.
 *
 *   public/media/articles/{slug}/cover.{jpg,jpeg,png,webp,avif}
 *
 * Returns the public URL (e.g. /media/articles/foo/cover.jpg) or
 * undefined if no file is present. Lets authors drop an image in the
 * folder and have it become the article cover with zero frontmatter.
 */
function autoCoverFor(slug: string): string | undefined {
  const dir = path.join(MEDIA_DIR, slug);
  if (!fs.existsSync(dir)) return undefined;
  const found = fs
    .readdirSync(dir)
    .find((f) => /^cover\.(jpg|jpeg|png|webp|avif)$/i.test(f));
  return found ? `/media/articles/${slug}/${found}` : undefined;
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
    cover: data.cover ?? autoCoverFor(slug),
    coverAlt: data.coverAlt,
    popular: data.popular === true,
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

/**
 * Resolve relative <img>/<video>/<source> src and <a> href attributes
 * that don't start with /, http:, https:, data: or mailto: so they
 * point at the article's media folder.
 *
 *   ![夜](sunset.jpg)
 *   <video src="intro.mp4" controls />
 *   <source src="intro.webm" type="video/webm" />
 *
 * all resolve to /media/articles/{slug}/{filename}, so authors only
 * need to drop the file into that folder.
 */
function resolveRelativeMedia(html: string, slug: string): string {
  const base = `/media/articles/${slug}/`;
  return html.replace(
    /(<(?:img|source|video|audio|a)\b[^>]*?\s(?:src|href)=")([^"]+)(")/gi,
    (full, prefix: string, url: string, suffix: string) => {
      if (
        url.startsWith("/") ||
        /^https?:/i.test(url) ||
        url.startsWith("data:") ||
        url.startsWith("mailto:") ||
        url.startsWith("#")
      ) {
        return full;
      }
      return `${prefix}${base}${url}${suffix}`;
    }
  );
}

/**
 * If a paragraph contains only a bare YouTube URL, replace it with a
 * responsive 16:9 iframe embed wrapped in a figure so the existing
 * .article-body figure styling applies.
 */
function embedYouTube(html: string): string {
  const ytParaRe =
    /<p>\s*(?:<a[^>]*>)?\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_\-]+(?:[?&][^\s<]*)?)\s*(?:<\/a>)?\s*<\/p>/gi;
  return html.replace(ytParaRe, (_full, url: string) => {
    const idMatch = url.match(
      /(?:v=|youtu\.be\/)([A-Za-z0-9_\-]{6,})/
    );
    const id = idMatch?.[1];
    if (!id) return _full;
    return `<figure class="video-embed"><div class="video-embed-frame"><iframe src="https://www.youtube.com/embed/${id}" title="YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></figure>`;
  });
}

function postProcessArticleHtml(html: string, slug: string): string {
  return embedYouTube(resolveRelativeMedia(html, slug));
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
    contentHtml: postProcessArticleHtml(processed.toString(), slug),
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

// Silence "unused import" for the re-exported formatDate
void formatDate;
