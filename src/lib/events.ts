import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const EVENTS_DIR = path.join(process.cwd(), "content", "events");

export type EventStatus = "open" | "closed" | "completed" | "draft";

export type EventFrontmatter = {
  title: string;
  slug: string;
  startsAt: string;
  endsAt?: string;
  status: EventStatus;
  location: string;
  locationCity?: string;
  audience?: string;
  format?: string;
  capacity?: string;
  fee?: string;
  applyUrl?: string;
  excerpt: string;
  cover?: string;
  coverAlt?: string;
  keywords?: string[];
};

export type EventDetail = EventFrontmatter & {
  contentHtml: string;
};

function ensureDir() {
  if (!fs.existsSync(EVENTS_DIR)) {
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
  }
}

function readAllFiles(): string[] {
  ensureDir();
  return fs
    .readdirSync(EVENTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function parseFile(filename: string) {
  const raw = fs.readFileSync(path.join(EVENTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) ?? filename.replace(/\.mdx?$/, "");
  const fm: EventFrontmatter = {
    title: data.title ?? slug,
    slug,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    status: (data.status as EventStatus) ?? "open",
    location: data.location ?? "",
    locationCity: data.locationCity,
    audience: data.audience,
    format: data.format,
    capacity: data.capacity,
    fee: data.fee,
    applyUrl: data.applyUrl,
    excerpt: data.excerpt ?? "",
    cover: data.cover,
    coverAlt: data.coverAlt,
    keywords: data.keywords ?? [],
  };
  return { fm, content };
}

export function getAllEvents(): EventFrontmatter[] {
  return readAllFiles()
    .map((f) => parseFile(f).fm)
    .filter((e) => e.status !== "draft")
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
}

export function getUpcomingEvents(): EventFrontmatter[] {
  const now = Date.now();
  return getAllEvents().filter(
    (e) =>
      new Date(e.startsAt).getTime() >= now &&
      e.status !== "completed" &&
      e.status !== "closed"
  );
}

export function getPastEvents(): EventFrontmatter[] {
  const now = Date.now();
  return getAllEvents()
    .filter(
      (e) =>
        new Date(e.startsAt).getTime() < now ||
        e.status === "completed" ||
        e.status === "closed"
    )
    .reverse();
}

export async function getEvent(slug: string): Promise<EventDetail | null> {
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

export function getAllEventSlugs(): string[] {
  return getAllEvents().map((e) => e.slug);
}

export function formatEventDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatEventTimeRange(
  startsAt: string,
  endsAt?: string
): string {
  const s = new Date(startsAt);
  if (Number.isNaN(s.getTime())) return startsAt;
  const sStr = s.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (!endsAt) return sStr;
  const e = new Date(endsAt);
  if (Number.isNaN(e.getTime())) return sStr;
  const eStr = e.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${sStr} – ${eStr}`;
}
