// Experts directory — 編集者が認証した「専門家」の公開アーカイブ。
// 共創の入口（§7.1）。HR 編集が事前査読し、回答内の宣伝・広告誘導は
// 入らない規律で運用する。Sprint 1 はファイルベース。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const EXPERTS_DIR = path.join(process.cwd(), "content", "experts");

export type ExpertFrontmatter = {
  slug: string;
  name: string;             // 公開名（実名 or 専門家名）
  role: string;             // "皮膚科医" "睡眠コーチ" 等
  field: string[];          // 関連 territory slug
  region?: string;          // "東京" "オンライン" 等
  /** 直接の連絡先・ウェブ（HR を介さない外部直リンク） */
  contact?: { website?: string; email?: string };
  verifiedAt?: string;      // 編集者が査読・確認した日付
  publishedAt: string;
  status: "published" | "draft";
};

export type ExpertItem = ExpertFrontmatter & {
  contentHtml: string;
  structured?: {
    why?: string;            // なぜこの仕事をしているか
    commonConcerns?: string; // よくある悩み
    approach?: string;       // 解決方法
    idealClient?: string;    // 改善する人の特徴
  };
};

function ensureDir() {
  if (!fs.existsSync(EXPERTS_DIR)) fs.mkdirSync(EXPERTS_DIR, { recursive: true });
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(EXPERTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(EXPERTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: ExpertFrontmatter = {
    slug,
    name: data.name ?? slug,
    role: data.role ?? "",
    field: (data.field as string[]) ?? [],
    region: data.region,
    contact: data.contact,
    verifiedAt: data.verifiedAt,
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "published",
  };
  const structured = {
    why: data.why as string | undefined,
    commonConcerns: data.commonConcerns as string | undefined,
    approach: data.approach as string | undefined,
    idealClient: data.idealClient as string | undefined,
  };
  return { fm, content, structured };
}

export function getAllExperts(): ExpertFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((e) => e.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getExpert(slug: string): Promise<ExpertItem | null> {
  const files = readAllFiles();
  const file = files.find((f) => parseFile(f).fm.slug === slug);
  if (!file) return null;
  const { fm, content, structured } = parseFile(file);
  const html = (
    await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content)
  ).toString();
  return { ...fm, contentHtml: html, structured };
}

export function getAllExpertSlugs(): string[] {
  return getAllExperts().map((e) => e.slug);
}

export function getExpertsForField(territory: string): ExpertFrontmatter[] {
  return getAllExperts().filter((e) => e.field.includes(territory));
}
