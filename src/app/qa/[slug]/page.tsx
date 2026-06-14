import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { getAllQASlugs, getQA, getAllQA } from "@/lib/qa";
import { TERRITORY_LABEL, getFeeling } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllQASlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const q = await getQA(params.slug);
  if (!q) return {};
  const url = `${site.url}/qa/${q.slug}`;
  const title = `「${q.question}」`;
  const description = q.asker?.context
    ? `${q.asker.context}。当事者の観察として記録した、His Recoveries の Q&A。`
    : "当事者の観察として記録した、His Recoveries の Q&A。";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function QAPage({ params }: { params: Params }) {
  const q = await getQA(params.slug);
  if (!q) notFound();

  const url = `${site.url}/qa/${q.slug}`;
  const territoryLabel = TERRITORY_LABEL[q.territory] ?? q.territory;
  const otherQA = getAllQA().filter((o) => o.slug !== q.slug).slice(0, 4);
  const relatedFeelings = q.feelings
    .map((s) => getFeeling(s))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Recovery Q&A", item: `${site.url}/qa` },
      { "@type": "ListItem", position: 3, name: q.question, item: url },
    ],
  };

  // Strip HTML for the Answer plain text used in FAQPage schema.
  const answerText = q.contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: answerText.slice(0, 1200) },
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: q.question,
    datePublished: q.publishedAt,
    inLanguage: site.language,
    articleSection: territoryLabel,
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
    mainEntityOfPage: url,
  };

  return (
    <article className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <nav
        aria-label="breadcrumb"
        className="mb-10 text-[11px] tracking-widest text-sub-gray"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-ink transition-colors uppercase">
              Home
            </Link>
          </li>
          <li aria-hidden>—</li>
          <li>
            <Link href="/qa" className="hover:text-ink transition-colors">
              Recovery Q&A
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          {territoryLabel}
        </p>
        <h1 className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.5]">
          <span className="text-gold mr-3">Q.</span>
          {q.question}
        </h1>
        {q.asker && (
          <p className="mt-5 font-mincho text-[13px] text-sub-gray leading-[1.95]">
            {q.asker.ageRange && <>— {q.asker.ageRange}　</>}
            {q.asker.context && <>{q.asker.context}</>}
          </p>
        )}
        <p className="mt-5 text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
          {q.publishedAt}
        </p>
      </header>

      <section aria-label="編集者の観察" className="mb-14">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          A.
        </p>
        <div
          className="article-body font-mincho"
          dangerouslySetInnerHTML={{ __html: q.contentHtml }}
        />
      </section>

      {/* Cross-links */}
      <section className="mt-12 pt-10 border-t border-hair-line">
        <div className="mb-8">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            原因を読む
          </p>
          <Link
            href={`/territories/${q.territory}`}
            className="font-mincho text-[15px] text-ink border-b border-gold/60 pb-0.5 hover:text-gold transition-colors"
          >
            {territoryLabel}は、なぜ起こるのか →
          </Link>
        </div>

        {relatedFeelings.length > 0 && (
          <div className="mb-8">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              この感覚から、来た方へ
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {relatedFeelings.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/feelings/${f.slug}`}
                    className="inline-flex border border-hair-line bg-paper px-4 py-2 text-[13px] text-ink hover:border-gold hover:text-gold transition-colors"
                  >
                    {f.statement}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {otherQA.length > 0 && (
          <div>
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              ほかの問いも読む
            </p>
            <ul className="space-y-3">
              {otherQA.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/qa/${o.slug}`}
                    className="block font-mincho text-[14.5px] text-ink hover:text-gold transition-colors"
                  >
                    <span className="text-gold mr-2">Q.</span>
                    {o.question}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Next half-step */}
      <section className="mt-14 pt-10 border-t border-hair-line bg-cream-deep -mx-6 sm:-mx-10 px-6 sm:px-10 py-10">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
          A Next Half-Step
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05]">
          自分の問いを、編集者に届けたい方は Recovery Check へ。
          日曜日の手紙（Recoveries Letter）も、ここから受け取れます。
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Link href="/check" className="btn-gold justify-center">
            Recovery Check を始める <span aria-hidden>→</span>
          </Link>
          <TrackedCTA
            href={`${site.social.substack}/subscribe`}
            event="membership_subscribe_click"
            eventProps={{ location: "qa_detail", qa_slug: q.slug }}
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
          >
            日曜日の手紙を受け取る
          </TrackedCTA>
        </div>
      </section>

      <p className="mt-10 text-[11px] text-sub-gray leading-[2]">
        ※ 本ページは当事者の観察であり、医療行為・診断・受診勧奨を行うものではありません。
        個別の判断は医療機関にご相談ください。
      </p>
    </article>
  );
}
