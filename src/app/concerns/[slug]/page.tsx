import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getConcern,
  getAllConcernSlugs,
  getAllConcerns,
} from "@/lib/concerns";
import { getAllArticles } from "@/lib/articles";
import { getAllTerritories } from "@/lib/territories";
import { site, categoryLabel } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllConcernSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const concern = await getConcern(params.slug);
  if (!concern) return {};
  const url = `${site.url}/concerns/${concern.slug}`;
  return {
    title: `${concern.title} — Concern #${concern.ticketId}`,
    description: concern.excerpt,
    keywords: concern.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${concern.title} — ${site.name}`,
      description: concern.excerpt,
      url,
    },
  };
}

export default async function ConcernPage({ params }: { params: Params }) {
  const concern = await getConcern(params.slug);
  if (!concern) notFound();

  const allArticles = getAllArticles();
  const territory = getAllTerritories().find(
    (t) => t.slug === concern.territory
  );

  const relatedArticles = concern.articles
    .map((slug) => allArticles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // Sibling concerns in the same territory for the bottom nav
  const siblings = getAllConcerns()
    .filter((c) => c.territory === concern.territory && c.slug !== concern.slug)
    .slice(0, 4);

  const url = `${site.url}/concerns/${concern.slug}`;
  const concernLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#concern`,
    headline: concern.title,
    description: concern.excerpt,
    datePublished: new Date(concern.opened).toISOString(),
    inLanguage: site.language,
    keywords: concern.keywords.join(", "),
    articleSection: territory?.title ?? concern.territory,
    author: { "@id": `${site.url}/#publisher` },
    publisher: { "@id": `${site.url}/#publisher` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Concerns",
        item: `${site.url}/concerns`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: concern.title,
        item: url,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-10 sm:pt-16 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(concernLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="mb-8 sm:mb-10 text-[11px] tracking-widest text-sub-gray"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink transition-colors uppercase">
              Home
            </Link>
          </li>
          <li aria-hidden>—</li>
          <li>
            <Link
              href="/concerns"
              className="hover:text-ink transition-colors uppercase"
            >
              Concerns
            </Link>
          </li>
          {territory && (
            <>
              <li aria-hidden>—</li>
              <li>
                <Link
                  href={`/territories/${territory.slug}`}
                  className="hover:text-ink transition-colors"
                >
                  {territory.title}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12 sm:mb-16 max-w-[40rem]">
        <div className="flex items-baseline gap-4">
          <span className="logo-type italic text-[14px] tracking-[0.25em] text-gold">
            #{concern.ticketId}
          </span>
          {territory && (
            <span className="text-[11px] tracking-[0.08em] text-sub-gray">
              {territory.title}
            </span>
          )}
          <span className="text-[10px] tracking-[0.1em] text-sub-gray border border-hair-line px-1.5 py-0.5">
            {concern.status === "open"
              ? "Open"
              : concern.status === "observed"
                ? "Observed"
                : "Archived"}
          </span>
        </div>
        <h1 className="mt-5 font-mincho text-2xl sm:text-4xl text-ink leading-[1.4]">
          {concern.title}
        </h1>
        {concern.excerpt && (
          <p className="mt-6 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05]">
            {concern.excerpt}
          </p>
        )}
        <p className="mt-6 text-[11px] tracking-[0.06em] text-sub-gray">
          Opened {concern.opened}
          {concern.observers > 0 && (
            <span className="ml-3">
              · {concern.observers.toLocaleString()} 人が観察
            </span>
          )}
        </p>
      </header>

      {/* About */}
      {concern.contentHtml && (
        <section className="mb-16 sm:mb-20 max-w-[40rem]">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
            About this concern
          </p>
          <div
            className="article-body font-mincho"
            dangerouslySetInnerHTML={{ __html: concern.contentHtml }}
          />
        </section>
      )}

      {/* Voices */}
      <section className="mb-16 sm:mb-20">
        <header className="mb-6 border-b border-hair-line pb-3 flex items-baseline justify-between gap-4">
          <h2 className="font-mincho text-lg sm:text-xl text-ink">Voices</h2>
          <span className="text-[11px] tracking-[0.06em] text-sub-gray">
            当事者の声・匿名抜粋
          </span>
        </header>
        {concern.voices.length === 0 ? (
          <p className="text-[13px] text-sub-gray leading-[2] max-w-[40rem] border-l border-hair-line pl-4">
            この票には、まだ声が並んでいません。
            <br />
            あなたが最初の一通を書くこともできます。
          </p>
        ) : (
          <ul className="space-y-5 max-w-[40rem]">
            {concern.voices.map((v, i) => (
              <li
                key={i}
                className="font-mincho text-[14.5px] sm:text-[15px] leading-[2.05] text-ink/85 border-l border-gold/40 pl-4"
              >
                「{v.body}」
                {v.id && (
                  <span className="block mt-2 text-[11px] text-sub-gray">
                    — Voice #{v.id}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Records (related articles) */}
      {relatedArticles.length > 0 && (
        <section className="mb-16 sm:mb-20">
          <header className="mb-6 border-b border-hair-line pb-3 flex items-baseline justify-between gap-4">
            <h2 className="font-mincho text-lg sm:text-xl text-ink">Records</h2>
            <span className="text-[11px] tracking-[0.06em] text-sub-gray">
              この票に紐づく Journal の記録
            </span>
          </header>
          <ul className="space-y-4 max-w-[44rem]">
            {relatedArticles.map((a) => (
              <li key={a.slug} className="border-b border-hair-line pb-4">
                <Link
                  href={`/articles/${a.slug}`}
                  className="group block"
                >
                  <p className="text-[11px] tracking-[0.06em] text-gold">
                    {categoryLabel(a.category)}
                  </p>
                  <h3 className="mt-1.5 font-mincho text-base sm:text-lg text-ink group-hover:text-gold transition-colors leading-[1.55]">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="mt-2 text-[13px] text-sub-gray leading-[1.95] line-clamp-2">
                      {a.excerpt}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Options map */}
      {concern.options.length > 0 && (
        <section className="mb-16 sm:mb-20">
          <header className="mb-6 border-b border-hair-line pb-3 flex items-baseline justify-between gap-4">
            <h2 className="font-mincho text-lg sm:text-xl text-ink">
              選択肢の地形図
            </h2>
            <span className="text-[11px] tracking-[0.06em] text-sub-gray">
              並列に置いておくだけ
            </span>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[48rem]">
            {concern.options.map((o, i) => (
              <li
                key={i}
                className="border border-hair-line bg-paper p-5"
              >
                <p className="font-mincho text-[15px] text-ink leading-[1.6]">
                  {o.label}
                </p>
                {o.note && (
                  <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
                    {o.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Listening — write to this concern */}
      <section className="mb-16 sm:mb-20 max-w-[40rem]">
        <header className="mb-4 border-b border-hair-line pb-3">
          <h2 className="font-mincho text-lg sm:text-xl text-ink">Listening</h2>
        </header>
        <p className="font-mincho text-[14px] sm:text-[15px] leading-[2] text-ink/85">
          この票に、あなたの声を寄せることができます。
          <br />
          返信は約束できません。ただ、必ず、誰かが読みます。
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            href={`/submit-story?concern=${concern.slug}`}
            className="btn-gold !py-3 !px-5 text-xs"
          >
            この票に声を寄せる →
          </Link>
          <Link
            href="/apply"
            className="text-[12px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5"
          >
            The Mirror を始める →
          </Link>
        </div>
      </section>

      {/* Siblings */}
      {siblings.length > 0 && (
        <section className="mt-20 sm:mt-24 pt-10 border-t border-hair-line">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
            同じ章の票
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/concerns/${s.slug}`}
                  className="group block border border-hair-line bg-paper/40 p-4 hover:border-gold transition-colors"
                >
                  <p className="text-[11px] tracking-[0.1em] text-gold">
                    #{s.ticketId}
                  </p>
                  <p className="mt-1.5 font-mincho text-[14px] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                    {s.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
