import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/site";
import { getAllArticles } from "@/lib/articles";
import { githubEnabled } from "@/lib/github";
import EditClient from "../[slug]/edit/EditClient";

export const metadata: Metadata = {
  title: "New Article — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  const today = new Date().toISOString().slice(0, 10);
  const initial = {
    title: "",
    slug: "",
    category: "philosophy",
    publishedAt: today,
    excerpt: "",
    status: "draft" as const,
    related: [] as string[],
    keywords: [] as string[],
    cover: undefined,
    coverAlt: undefined,
    popular: false,
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
            Admin · New
          </p>
          <h1 className="mt-2 font-mincho text-xl sm:text-2xl text-ink leading-[1.4]">
            新しい記事
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
          GitHub 連携が未設定のため、保存はできません。
        </div>
      )}

      <EditClient
        slug={""}
        initial={initial}
        initialBody={""}
        categories={Object.entries(categories).map(([slug, c]) => ({
          slug,
          label: c.label,
        }))}
        allArticles={allArticles}
        mode="new"
      />
    </div>
  );
}
