// Recoveries — 「実例集」the canonical archive of men who moved a half-step
// forward. Brand-aligned name (His Recoveries). File-based to keep editor
// in the loop. Reads content/recoveries/*.md, with content/stories/*.md
// merged in for backward compatibility during the migration window.
//
// Frontmatter is a superset of the old Story shape: the new structured
// fields (before / action / change / now / recommend) are all optional —
// legacy stories with only a free-form body still render correctly.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const RECOVERIES_DIR = path.join(process.cwd(), "content", "recoveries");
const STORIES_DIR = path.join(process.cwd(), "content", "stories"); // legacy

export type RecoveryFrontmatter = {
  slug: string;
  title: string;
  territory: string;
  feelings: string[];
  /** light, anonymized profile */
  asker?: { ageRange?: string; context?: string };
  /** time-since-event label, e.g. "半年後" "1年後" */
  span?: string;
  /** new structured tags */
  concernTags?: string[];
  actionTags?: string[];
  outcomeTags?: string[];
  publishedAt: string;
  status: "published" | "draft";
};

export type RecoveryItem = RecoveryFrontmatter & {
  contentHtml: string;
  /** parsed structured sections (if present in frontmatter); editor may
   *  alternatively keep the prose body as-is and leave these empty. */
  structured?: {
    before?: string;
    action?: string;
    change?: string;
    now?: string;
    recommend?: string;
  };
};

function listDir(dir: string): { dir: string; file: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((file) => ({ dir, file }));
}

function readAllFiles(): { dir: string; file: string }[] {
  // recoveries first; stories appended only for slugs not in recoveries.
  const recs = listDir(RECOVERIES_DIR);
  const recsSlugs = new Set(recs.map((r) => r.file));
  const stories = listDir(STORIES_DIR).filter((s) => !recsSlugs.has(s.file));
  return [...recs, ...stories];
}

function parseFile(entry: { dir: string; file: string }) {
  const raw = fs.readFileSync(path.join(entry.dir, entry.file), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? entry.file.replace(/\.mdx?$/, "");
  const fm: RecoveryFrontmatter = {
    slug,
    title: data.title ?? slug,
    territory: data.territory ?? "",
    feelings: (data.feelings as string[]) ?? [],
    asker: data.asker,
    span: data.span,
    concernTags: (data.concernTags as string[]) ?? [],
    actionTags: (data.actionTags as string[]) ?? [],
    outcomeTags: (data.outcomeTags as string[]) ?? [],
    publishedAt: data.publishedAt ?? new Date().toISOString().slice(0, 10),
    status: data.status ?? "published",
  };
  const structured = {
    before: data.before as string | undefined,
    action: data.action as string | undefined,
    change: data.change as string | undefined,
    now: data.now as string | undefined,
    recommend: data.recommend as string | undefined,
  };
  return { fm, content, structured };
}

export function getAllRecoveries(): RecoveryFrontmatter[] {
  return readAllFiles()
    .map((e) => parseFile(e).fm)
    .filter((r) => r.status === "published")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getRecovery(slug: string): Promise<RecoveryItem | null> {
  const files = readAllFiles();
  const entry = files.find((f) => parseFile(f).fm.slug === slug);
  if (!entry) return null;
  const { fm, content, structured } = parseFile(entry);
  const html = (
    await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content)
  ).toString();
  return { ...fm, contentHtml: html, structured };
}

export function getAllRecoverySlugs(): string[] {
  return getAllRecoveries().map((r) => r.slug);
}

export function getRecoveriesForTerritory(territory: string): RecoveryFrontmatter[] {
  return getAllRecoveries().filter((r) => r.territory === territory);
}

export function getRecoveriesForTag(
  tag: string,
  kind: "concern" | "action" | "outcome"
): RecoveryFrontmatter[] {
  const key =
    kind === "concern" ? "concernTags" : kind === "action" ? "actionTags" : "outcomeTags";
  return getAllRecoveries().filter((r) => (r[key] ?? []).includes(tag));
}

export function getAllTagsByKind(): {
  concern: string[];
  action: string[];
  outcome: string[];
} {
  const concern = new Set<string>();
  const action = new Set<string>();
  const outcome = new Set<string>();
  for (const r of getAllRecoveries()) {
    (r.concernTags ?? []).forEach((t) => concern.add(t));
    (r.actionTags ?? []).forEach((t) => action.add(t));
    (r.outcomeTags ?? []).forEach((t) => outcome.add(t));
  }
  return {
    concern: Array.from(concern).sort(),
    action: Array.from(action).sort(),
    outcome: Array.from(outcome).sort(),
  };
}
