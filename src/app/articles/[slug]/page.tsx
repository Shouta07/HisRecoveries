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
    <article className="mx-auto max-w-reading px-6 pb-24 pt-12 sm:pt-20">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="mb-12 text-[11px] tracking-widest text-sub-gray"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-ink transition-colors uppercase"
            >
              Home
            </Link>
          </li>
          <li aria-hidden>—</li>
          <li>
            <Link
              href="/articles"
              className="hover:text-ink transition-colors uppercase"
            >
              Articles
            </Link>
          </li>
          <li aria-hidden>—</li>
          <li>
            <Link
              href={`/articles/category/${article.category}`}
              className="hover:text-ink transition-colors"
            >
              {categoryLabel(article.category)}
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

      <header className="mb-16">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          A Record
        </p>
        <div className="mt-5 text-xs tracking-widest text-sub-gray">
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
        <h1 className="mt-5 font-mincho text-3xl sm:text-[2.5rem] text-ink leading-[1.55]">
          {article.title}
        </h1>

        {article.cover && (
          <div className="mt-12">
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

        <div className="mt-10 pt-6 border-t border-hair-line flex items-center justify-between text-sm text-sub-gray">
          <span className="logo-type tracking-wider text-ink">
            {site.author}
          </span>
          <span className="text-xs tracking-widest">
            {article.readingMinutes} 分
          </span>
        </div>
      </header>

      <div
        className="article-body font-mincho"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {/* Conversion immediately after the body — the moment of highest intent. */}
      <ArticleConversion articleSlug={article.slug} territory={territory} />

      {parentConcerns.length > 0 && (
        <section className="mt-24 border-t border-hair-line pt-10">
          <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
            Appears in
          </p>
          <h2 className="mt-3 font-mincho text-lg sm:text-xl text-ink leading-[1.55]">
            この記録が紐づく悩み票
          </h2>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parentConcerns.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/concerns/${c.slug}`}
                  className="group block border border-hair-line bg-paper/40 p-4 hover:border-gold transition-colors"
                >
                  <p className="text-[11px] tracking-[0.1em] text-gold">
                    #{c.ticketId}
                  </p>
                  <p className="mt-1.5 font-mincho text-[14px] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                    {c.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24 border-t border-hair-line pt-12">
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

      <footer className="mt-24 border-t border-hair-line pt-12">
        <div className="flex items-center gap-4">
          <span aria-hidden className="block w-10 h-px bg-gold" />
          <span className="logo-type tracking-[0.2em] text-sm text-ink">
            {site.name}
          </span>
        </div>
      </footer>
    </article>
  );
}
