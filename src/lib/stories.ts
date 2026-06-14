// Recovery Stories — 改善事例（その後どうなったか）の公開アーカイブ。
// 編集者が、本人同意のもと、Check のフォローアップや個別の便りから
// 匿名化して書き起こす。Recovery Q&A と対の構造で、ファイルベース。
//
// 詳細は docs/BUSINESS_PLAN.md（堀の §4 改善事例 / Phase 0 ゲート）参照。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const STORIES_DIR = path.join(process.cwd(), "content", "stories");

export type StoryFrontmatter = {
  slug: string;
  title: string;        // 「ワキガ手術から6ヶ月、夏のグレーを選び直せた」
  territory: string;    // 6領域の slug
  feelings: string[];   // 関連 feelings
  /** 投稿者の最低限の輪郭。匿名前提・本人同意で表示 */
  asker?: { ageRange?: string; context?: string };
  /** 経過期間の目安。「半年後」「1年後」など */
  span?: string;
  publishedAt: string;  // ISO date
  status: "published" | "draft";
};

export type StoryItem = StoryFrontmatter & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(STORIES_DIR)) fs.mkdirSync(STORIES_DIR, { recursive: true });
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(STORIES_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: StoryFrontmatter = {
    slug,
    title: data.title ?? slug,
    territory: data.territory ?? "",
    feelings: (data.feelings as string[]) ?? [],
    asker: data.asker,
    span: data.span,
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "published",
  };
  return { fm, content };
}

export function getAllStories(): StoryFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((s) => s.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getStory(slug: string): Promise<StoryItem | null> {
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

export function getAllStorySlugs(): string[] {
  return getAllStories().map((s) => s.slug);
}

export function getStoriesForTerritory(territory: string): StoryFrontmatter[] {
  return getAllStories().filter((s) => s.territory === territory);
}
