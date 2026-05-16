import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { categories, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Articles",
  description: "His Recoveries のすべての記録。",
  alternates: { canonical: `${site.url}/articles` },
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-sub-gray">ARTICLES</p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink">
          すべての記録
        </h1>
      </header>

      <nav aria-label="categories" className="mb-12">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-sub-gray">
          <li>
            <Link href="/articles" className="text-ink underline-offset-4">
              すべて
            </Link>
          </li>
          {Object.entries(categories).map(([slug, c]) => (
            <li key={slug}>
              <Link
                href={`/articles/category/${slug}`}
                className="hover:text-ink transition-colors"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {articles.length === 0 ? (
        <p className="text-sm text-sub-gray">
          記事はまもなく公開されます。
        </p>
      ) : (
        <div>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
