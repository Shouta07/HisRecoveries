// Recovery Q&A — Check の進化形（モヤモヤ相談室 HR 版）。
// 編集者が受け取った問いを、匿名化し、本人同意のうえで公開アーカイブとして残す。
//
// 詳細は docs/PRODUCT_MOYAMOYA.md を参照。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const QA_DIR = path.join(process.cwd(), "content", "qa");

export type QAFrontmatter = {
  slug: string;
  question: string;
  territory: string; // 6領域の slug（sweat-odor 等）
  feelings: string[]; // 関連 feelings の slug
  /** 投稿者の最低限の輪郭。匿名前提・本人同意で表示 */
  asker?: { ageRange?: string; context?: string };
  publishedAt: string; // ISO date
  status: "published" | "draft";
};

export type QAItem = QAFrontmatter & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(QA_DIR)) fs.mkdirSync(QA_DIR, { recursive: true });
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(QA_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(QA_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: QAFrontmatter = {
    slug,
    question: data.question ?? "",
    territory: data.territory ?? "",
    feelings: (data.feelings as string[]) ?? [],
    asker: data.asker,
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "published",
  };
  return { fm, content };
}

export function getAllQA(): QAFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((q) => q.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getQA(slug: string): Promise<QAItem | null> {
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

export function getAllQASlugs(): string[] {
  return getAllQA().map((q) => q.slug);
}

export function getQAForTerritory(territory: string): QAFrontmatter[] {
  return getAllQA().filter((q) => q.territory === territory);
}

export function getQAForFeeling(feelingSlug: string): QAFrontmatter[] {
  return getAllQA().filter((q) => q.feelings.includes(feelingSlug));
}
