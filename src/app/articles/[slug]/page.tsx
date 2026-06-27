import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllSlugs,
  getArticle,
  getRelatedArticles,
  formatDate,
} from "@/lib/articles";
import CoverImage from "@/components/CoverImage";
import ArticleConversion from "@/components/ArticleConversion";
import { getConcernsForArticle } from "@/lib/concerns";
import { territoryForCategory, TERRITORY_LABEL } from "@/lib/feelings";
import { complexByCategory } from "@/lib/complexes";
import { categories, categoryLabel, site } from "@/lib/site";

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
  const parentConcerns = getConcernsForArticle(article.slug);
  const complex = complexByCategory(article.category);
  const accent = complex?.accent ?? "#18181b";
  const soft = complex?.accentSoft ?? "#f4f4f5";
  const territorySlug = territoryForCategory(article.category);
  const territory = territorySlug
    ? { slug: territorySlug, label: TERRITORY_LABEL[territorySlug] ?? "この悩み" }
    : null;

  const articleUrl = `${site.url}/articles/${article.slug}`;
  const articleOgImage = `${articleUrl}/opengraph-image`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    description: article.excerpt,
    image: [article.cover ?? articleOgImage],
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(
      article.updatedAt ?? article.publishedAt
    ).toISOString(),
    inLanguage: site.language,
    articleSection: categoryLabel(article.category),
    keywords: [
      ...(article.keywords ?? []),
      categoryLabel(article.category),
    ].join(", "),
    wordCount: article.wordCount,
    author: { "@id": `${site.url}/#publisher` },
    publisher: { "@id": `${site.url}/#publisher` },
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${site.url}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categories[article.category].label,
        item: `${site.url}/articles/category/${article.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <div className="bg-[#FAF6F0] text-zinc-900">
      <article className="mx-auto max-w-[820px] px-6 sm:px-10 pb-20 pt-10 sm:pt-14">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-7 text-[12px] text-zinc-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-zinc-700 transition-colors">
                ホーム
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/articles" className="hover:text-zinc-700 transition-colors">
                記事
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link
                href={`/articles/category/${article.category}`}
                className="hover:text-zinc-700 transition-colors"
              >
                {complex?.ja ?? categoryLabel(article.category)}
              </Link>
            </li>
          </ol>
        </nav>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        <div className="rounded-3xl bg-white p-6 sm:p-12 shadow-sm">
          <header className="mb-10">
            <div className="flex items-center gap-2.5 text-[12px] font-bold">
              <Link
                href={`/articles/category/${article.category}`}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: soft, color: accent }}
              >
                {complex?.ja ?? categoryLabel(article.category)}
              </Link>
              <span className="text-zinc-400">{article.readingMinutes} 分で読める</span>
            </div>
            <h1 className="mt-5 font-mincho text-[1.9rem] sm:text-[2.6rem] font-bold text-zinc-900 leading-[1.45]">
              {article.title}
            </h1>

            {article.cover && (
              <div className="mt-10 rounded-2xl overflow-hidden">
                <CoverImage
                  src={article.cover}
                  alt={article.coverAlt ?? `${article.title}（記事カバー）`}
                  eyebrow={categoryLabel(article.category)}
                  title={article.title}
                  meta={formatDate(article.publishedAt)}
                  aspectRatio="21/9"
                  size="lg"
                  priority
                />
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-between text-[13px] text-zinc-400">
              <span className="font-bold text-zinc-700">{site.name} 編集部</span>
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            </div>
          </header>

          <div
            className="article-body font-mincho"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Conversion immediately after the body — highest intent moment. */}
          <ArticleConversion articleSlug={article.slug} territory={territory} />
        </div>

        {parentConcerns.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.2rem] font-extrabold text-zinc-900 mb-5">
              この記事が紐づく悩み
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parentConcerns.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/concerns/${c.slug}`}
                    className="group block rounded-2xl bg-white p-4 shadow-sm hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-[11px] font-bold" style={{ color: accent }}>
                      #{c.ticketId}
                    </p>
                    <p className="mt-1.5 text-[14px] font-medium text-zinc-800 leading-[1.55] group-hover:text-zinc-600 transition-colors">
                      {c.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.2rem] font-extrabold text-zinc-900 mb-5">
              あわせて読みたい
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((a) => {
                const rc = complexByCategory(a.category);
                return (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="group block rounded-2xl bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      <div
                        className="text-[12px] font-bold"
                        style={{ color: rc?.accent ?? "#71717a" }}
                      >
                        {rc?.ja ?? categoryLabel(a.category)}
                      </div>
                      <div className="mt-1.5 text-[15px] font-bold text-zinc-900 leading-[1.5] group-hover:text-zinc-600 transition-colors">
                        {a.title}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
