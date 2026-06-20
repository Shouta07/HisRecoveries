// Services directory — 編集者が「ここなら任せられる」と保証するサービス。
// 紹介手数料は取らず、外部直リンクで送る（Vouch Link）。HR は仲介しない。
// Sprint 1 はファイルベース。

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const SERVICES_DIR = path.join(process.cwd(), "content", "services");

export type ServiceFrontmatter = {
  slug: string;
  name: string;
  operator: string;          // サービス提供者名（事業者）
  category: string;          // "AGA" "メンズ美容" "睡眠" "ジム" "コーチング" 等
  fields: string[];          // 関連 territory slug
  priceBand?: string;        // "〜¥10K" "¥10〜30K/月" 等（断定的でない範囲）
  region?: string;
  external: { website: string; bookingUrl?: string };
  certifiedAt?: string;
  publishedAt: string;
  status: "published" | "draft";
};

export type ServiceItem = ServiceFrontmatter & {
  contentHtml: string;
  structured?: {
    features?: string;       // 特徴
    idealClient?: string;    // 向いている人
    expertNote?: string;     // 専門家コメント
  };
  relatedRecoveries?: string[]; // recovery slugs
};

function ensureDir() {
  if (!fs.existsSync(SERVICES_DIR)) fs.mkdirSync(SERVICES_DIR, { recursive: true });
}
function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(SERVICES_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: ServiceFrontmatter = {
    slug,
    name: data.name ?? slug,
    operator: data.operator ?? "",
    category: data.category ?? "",
    fields: (data.fields as string[]) ?? [],
    priceBand: data.priceBand,
    region: data.region,
    external: data.external ?? { website: "" },
    certifiedAt: data.certifiedAt,
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "published",
  };
  const structured = {
    features: data.features as string | undefined,
    idealClient: data.idealClient as string | undefined,
    expertNote: data.expertNote as string | undefined,
  };
  const relatedRecoveries = (data.relatedRecoveries as string[]) ?? [];
  return { fm, content, structured, relatedRecoveries };
}

export function getAllServices(): ServiceFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((s) => s.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getService(slug: string): Promise<ServiceItem | null> {
  const files = readAllFiles();
  const file = files.find((f) => parseFile(f).fm.slug === slug);
  if (!file) return null;
  const { fm, content, structured, relatedRecoveries } = parseFile(file);
  const html = (
    await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content)
  ).toString();
  return { ...fm, contentHtml: html, structured, relatedRecoveries };
}

export function getAllServiceSlugs(): string[] {
  return getAllServices().map((s) => s.slug);
}

export function vouchLink(url: string, serviceSlug: string): string {
  if (!url) return "";
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=hisrecoveries&utm_medium=vouch&utm_campaign=${serviceSlug}`;
}
