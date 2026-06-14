import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllFeelingSlugs,
  getFeeling,
  TERRITORY_LABEL_EN,
} from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllFeelingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const f = getFeeling(params.slug);
  if (!f) return {};
  const url = `${site.url}/en/feelings/${f.slug}`;
  const title = `"${f.en.statement}"`;
  return {
    title,
    description: f.en.why.slice(0, 150),
    alternates: {
      canonical: url,
      languages: {
        ja: `${site.url}/feelings/${f.slug}`,
        en: url,
        "x-default": `${site.url}/feelings/${f.slug}`,
      },
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      title,
      description: f.en.why.slice(0, 150),
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: f.en.why.slice(0, 150),
    },
  };
}

export default function EnFeelingPage({ params }: { params: Params }) {
  const f = getFeeling(params.slug);
  if (!f) notFound();

  const url = `${site.url}/en/feelings/${f.slug}`;
  const L = f.en;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/en` },
      { "@type": "ListItem", position: 2, name: L.statement, item: url },
    ],
  };

  return (
    <article lang="en">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-24 pb-10">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <Link href="/en" className="hover:text-ink transition-colors uppercase">
            Home
          </Link>
        </nav>
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          A Feeling
        </p>
        <h1 className="mt-5 font-mincho text-[1.9rem] sm:text-[2.8rem] text-ink leading-[1.4]">
          {L.statement}
        </h1>
      </header>

      <section className="mx-auto max-w-reading px-6 sm:px-10 py-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          Why it gets to you
        </p>
        <p className="font-mincho text-[15px] sm:text-base text-ink/90 leading-[2.1]">
          {L.why}
        </p>
      </section>

      <section className="mx-auto max-w-reading px-6 sm:px-10 py-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          Who tends to feel this
        </p>
        <p className="font-mincho text-[15px] text-ink/85 leading-[2.1]">{L.who}</p>
      </section>

      <section className="bg-cream-deep border-y border-hair-line">
        <div className="mx-auto max-w-reading px-6 sm:px-10 py-14 sm:py-20">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-6">
            Small pains in everyday life
          </p>
          <ul className="space-y-px">
            {L.vignettes.map((v) => (
              <li
                key={v}
                className="border-t border-hair-line py-5 flex items-baseline gap-4"
              >
                <span
                  aria-hidden
                  className="logo-type italic text-gold text-[13px] shrink-0"
                >
                  —
                </span>
                <p className="font-mincho text-[15px] sm:text-[16px] text-ink leading-[1.9]">
                  {v}
                </p>
              </li>
            ))}
            <li className="border-t border-hair-line" />
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24">
        <div className="mb-10">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            Possible causes — understand
          </p>
          <h2 className="font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.45]">
            What lies beneath this feeling
          </h2>
          <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2] max-w-[34rem]">
            We lay out possible causes without pushing. Start from the one that
            catches you, and read why it happens.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {f.causes.map((c) => (
            <li key={c.territory}>
              <Link
                href={`/en/territories/${c.territory}`}
                className="group block h-full bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors card-lift"
              >
                <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold">
                  {TERRITORY_LABEL_EN[c.territory] ?? c.territory}
                </p>
                <h3 className="mt-3 font-mincho text-base sm:text-lg text-ink leading-[1.5] group-hover:text-gold transition-colors">
                  {c.causeEn}
                </h3>
                <span className="mt-4 inline-flex text-[13px] tracking-[0.1em] text-sub-gray group-hover:text-gold transition-colors">
                  Read why it happens
                  <span aria-hidden> →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="next-step"
        className="border-t border-hair-line bg-navy text-cream"
      >
        <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
            A Next Half-Step
          </p>
          <h2
            id="next-step"
            className="mt-5 font-mincho text-2xl sm:text-[2rem] leading-[1.5]"
          >
            After understanding
          </h2>
          <p className="mt-4 font-mincho text-[14px] text-cream/80 leading-[2] max-w-[34rem] mx-auto">
            An English edition is coming. The Recoveries Letter goes out every
            Sunday, in a place without advertising.
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
              className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
