import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categories } from "@/lib/site";
import { getAllArticles } from "@/lib/articles";
import { githubEnabled } from "@/lib/github";
import EditorClient from "./EditorClient";

export const metadata: Metadata = {
  title: "Edit — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function loadRaw(
  slug: string
): { frontmatter: Record<string, unknown>; body: string } | null {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data, body: content };
}

export default function EditPage({
  params,
}: {
  params: { slug: string };
}) {
  const isNew = params.slug === "new";
  const loaded = isNew ? null : loadRaw(params.slug);
  if (!isNew && !loaded) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const fm = loaded?.frontmatter ?? {};
  const initial = {
    title: (fm.title as string) ?? "",
    slug: isNew ? "" : params.slug,
    category: (fm.category as string) ?? "philosophy",
    publishedAt: (fm.publishedAt as string) ?? today,
    excerpt: (fm.excerpt as string) ?? "",
    status: ((fm.status as string) ?? (isNew ? "draft" : "published")) as
      | "draft"
      | "published",
    related: (fm.related as string[]) ?? [],
    keywords: (fm.keywords as string[]) ?? [],
    cover: (fm.cover as string | undefined) ?? undefined,
    coverAlt: (fm.coverAlt as string | undefined) ?? undefined,
    popular: fm.popular === true,
  };

  const allArticles = getAllArticles().map((a) => ({
    slug: a.slug,
    title: a.title,
  }));

  return (
    <EditorClient
      slug={isNew ? "" : params.slug}
      mode={isNew ? "new" : "edit"}
      initial={initial}
      initialBody={loaded?.body ?? ""}
      categories={Object.entries(categories).map(([slug, c]) => ({
        slug,
        label: c.label,
      }))}
      allArticles={allArticles}
      githubReady={githubEnabled}
    />
  );
}
