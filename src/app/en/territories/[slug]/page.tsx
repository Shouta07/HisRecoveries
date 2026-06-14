import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import {
  getAllTerritories,
  getAllTerritorySlugs,
  getTerritory,
} from "@/lib/territories";
import { getFeelingsForTerritory } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllTerritorySlugs("en").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const t = await getTerritory(params.slug, "en");
  if (!t) return {};
  const url = `${site.url}/en/territories/${t.slug}`;
  const title = `${t.title} — Why it happens`;
  return {
    title,
    description: t.intro,
    alternates: {
      canonical: url,
      languages: {
        ja: `${site.url}/territories/${t.slug}`,
        en: url,
        "x-default": `${site.url}/territories/${t.slug}`,
      },
    },
    openGraph: { type: "article", locale: "en_US", title, description: t.intro, url },
    twitter: { card: "summary_large_image", title, description: t.intro },
  };
}

export default async function EnTerritoryPage({ params }: { params: Params }) {
  const t = await getTerritory(params.slug, "en");
  if (!t) notFound();

  const url = `${site.url}/en/territories/${t.slug}`;
  const relatedFeelings = getFeelingsForTerritory(t.slug);
  const otherTerritories = getAllTerritories("en").filter(
    (o) => o.slug !== t.slug
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Causes",
        item: `${site.url}/en/territories`,
      },
      { "@type": "ListItem", position: 3, name: t.title, item: url },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${t.title} — Why it happens`,
    description: t.intro,
    inLanguage: "en",
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
    mainEntityOfPage: url,
  };

  const faqLd =
    t.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: t.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <article lang="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <header className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/en" className="hover:text-ink transition-colors uppercase">
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link
                href="/en/territories"
                className="hover:text-ink transition-colors"
              >
                Causes
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
              {t.title}: why it happens
            </h1>
            <p className="mt-6 font-mincho text-sub-gray text-base sm:text-lg leading-[2]">
              — {t.subtitle} —
            </p>
            <p className="mt-8 text-[1rem] leading-[2.1] text-ink max-w-[34rem]">
              {t.intro}
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <TerritoryArt slug={t.slug} aspectClass="aspect-[4/3]" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-reading px-6 sm:px-10 pb-8">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: t.contentHtml }}
        />
        <p className="mt-12 text-[12px] text-sub-gray leading-[2] border-t border-hair-line pt-6">
          This page organizes general information and is not medically supervised
          or intended as diagnosis or treatment. For decisions about symptoms or
          treatment, please consult a medical professional.
        </p>
      </div>

      {t.faq.length > 0 && (
        <section
          aria-labelledby="faq"
          className="mx-auto max-w-reading px-6 sm:px-10 py-12"
        >
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            Questions
          </p>
          <h2 id="faq" className="sr-only">
            Frequently asked about {t.title}
          </h2>
          <dl className="space-y-7">
            {t.faq.map((item, i) => (
              <div key={i}>
                <dt className="text-ink font-mincho text-[1.0625rem] leading-[1.8]">
                  <span className="logo-type text-gold mr-2">Q.</span>
                  {item.q}
                </dt>
                <dd className="mt-3 font-mincho text-sub-gray text-[15px] leading-[2.05]">
                  <span className="logo-type text-gold mr-2">A.</span>
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mx-auto max-w-reading px-6 sm:px-10 py-12 border-t border-hair-line">
        {relatedFeelings.length > 0 && (
          <div className="mb-10">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
              If you arrived from a feeling
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {relatedFeelings.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/en/feelings/${f.slug}`}
                    className="inline-flex border border-hair-line bg-paper px-4 py-2 text-[13px] text-ink hover:border-gold hover:text-gold transition-colors"
                  >
                    {f.en.statement}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
            Read other causes
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">
            {otherTerritories.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/en/territories/${o.slug}`}
                  className="text-ink border-b border-hair-line hover:border-gold hover:text-gold transition-colors pb-0.5"
                >
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Next half-step */}
      <section
        aria-labelledby="next-step"
        className="border-t border-hair-line bg-cream-deep"
      >
        <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            A Next Half-Step
          </p>
          <h2
            id="next-step"
            className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.45]"
          >
            After reading
          </h2>
          <p className="mt-4 font-mincho text-[14px] text-sub-gray leading-[2] max-w-[34rem] mx-auto">
            His Recoveries is written in Japanese today; an English edition is
            coming. The Recoveries Letter goes out every Sunday — follow along.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold justify-center"
            >
              Follow on Substack <span aria-hidden>→</span>
            </a>
            <Link
              href="/en"
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
