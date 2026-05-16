import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllSlugs,
  getArticle,
  getRelatedArticles,
  formatDate,
} from "@/lib/articles";
import { categoryLabel, site } from "@/lib/site";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `${site.url}/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${site.url}/articles/${article.slug}`,
      publishedTime: article.publishedAt,
      authors: [site.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: site.author,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/articles/${article.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-reading px-6 pb-24 pt-16 sm:pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-14">
        <div className="text-xs tracking-widest text-sub-gray">
          <Link
            href={`/articles/category/${article.category}`}
            className="hover:text-ink transition-colors"
          >
            {categoryLabel(article.category)}
          </Link>
          <span className="mx-2">·</span>
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
        <h1 className="mt-5 font-mincho text-3xl sm:text-4xl text-ink leading-[1.6]">
          {article.title}
        </h1>
        <div className="mt-8 text-sm text-sub-gray">
          {site.author}
          <span className="mx-2">·</span>
          <span>{article.readingMinutes} 分</span>
        </div>
      </header>

      <div
        className="article-body font-mincho"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {related.length > 0 && (
        <section className="mt-32 border-t border-hair-line pt-12">
          <h2 className="font-mincho text-sm tracking-widest text-sub-gray">
            関連する記録
          </h2>
          <ul className="mt-8 space-y-6">
            {related.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group block"
                >
                  <div className="text-xs text-sub-gray">
                    {categoryLabel(a.category)}
                  </div>
                  <div className="mt-1 font-mincho text-lg text-ink group-hover:text-quiet-brass transition-colors">
                    {a.title}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-24 border-t border-hair-line pt-12 text-sm text-sub-gray">
        <p>
          連絡は{" "}
          <a
            href={`mailto:${site.email}`}
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            {site.email}
          </a>
          、購読は{" "}
          <Link
            href="/subscribe"
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            Subscribe
          </Link>
          。
        </p>
      </footer>
    </article>
  );
}
