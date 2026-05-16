import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllCategorySlugs,
  getArticlesByCategory,
} from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { categories, CategorySlug, site } from "@/lib/site";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return getAllCategorySlugs().map((category) => ({ category }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const c = categories[params.category as CategorySlug];
  if (!c) return {};
  return {
    title: c.label,
    description: c.description,
    alternates: {
      canonical: `${site.url}/articles/category/${params.category}`,
    },
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const c = categories[params.category as CategorySlug];
  if (!c) notFound();

  const articles = getArticlesByCategory(params.category);
  const categoryUrl = `${site.url}/articles/category/${params.category}`;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection`,
    name: `${c.label} — ${site.name}`,
    description: c.description,
    url: categoryUrl,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    hasPart: articles.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      url: `${site.url}/articles/${a.slug}`,
      datePublished: new Date(a.publishedAt).toISOString(),
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${site.url}/articles`,
      },
      { "@type": "ListItem", position: 3, name: c.label, item: categoryUrl },
    ],
  };

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <header className="mb-16">
        <p className="text-xs tracking-widest text-sub-gray">CATEGORY</p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink">
          {c.label}
        </h1>
        <p className="mt-4 font-mincho text-sub-gray">{c.description}</p>
      </header>

      <nav aria-label="categories" className="mb-12">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-sub-gray">
          <li>
            <Link
              href="/articles"
              className="hover:text-ink transition-colors"
            >
              すべて
            </Link>
          </li>
          {Object.entries(categories).map(([slug, cat]) => (
            <li key={slug}>
              <Link
                href={`/articles/category/${slug}`}
                className={
                  slug === params.category
                    ? "text-ink underline-offset-4"
                    : "hover:text-ink transition-colors"
                }
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {articles.length === 0 ? (
        <p className="text-sm text-sub-gray">
          このカテゴリの記事はまもなく公開されます。
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
