import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categories } from "@/lib/site";
import { getAllArticles } from "@/lib/articles";
import { githubEnabled } from "@/lib/github";
import EditClient from "./EditClient";

export const metadata: Metadata = {
  title: "Edit Article — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function loadRaw(slug: string): { frontmatter: Record<string, unknown>; body: string } | null {
  const file = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data, body: content };
}

export default function EditArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const loaded = loadRaw(params.slug);
  if (!loaded) notFound();

  const fm = loaded.frontmatter;
  const initial = {
    title: (fm.title as string) ?? "",
    slug: params.slug,
    category: (fm.category as string) ?? "philosophy",
    publishedAt: (fm.publishedAt as string) ?? new Date().toISOString().slice(0, 10),
    excerpt: (fm.excerpt as string) ?? "",
    status: ((fm.status as string) ?? "published") as "draft" | "published",
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
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-10 sm:pt-12 pb-24">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Admin · Edit
          </p>
          <h1 className="mt-2 font-mincho text-xl sm:text-2xl text-ink leading-[1.4]">
            {initial.title}
          </h1>
        </div>
        <Link
          href="/admin/articles"
          className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-ink transition-colors"
        >
          ← 一覧
        </Link>
      </header>

      {!githubEnabled && (
        <div className="mb-6 border border-red-300 bg-red-50 text-red-800 p-4 text-[13px]">
          GitHub 連携が未設定のため、保存はできません。<code>/admin/articles</code> の手順を参照。
        </div>
      )}

      <EditClient
        slug={params.slug}
        initial={initial}
        initialBody={loaded.body}
        categories={Object.entries(categories).map(([slug, c]) => ({
          slug,
          label: c.label,
        }))}
        allArticles={allArticles}
        mode="edit"
      />
    </div>
  );
}
