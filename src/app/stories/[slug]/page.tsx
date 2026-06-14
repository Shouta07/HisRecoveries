import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import {
  getAllStorySlugs,
  getStory,
  getAllStories,
} from "@/lib/stories";
import { TERRITORY_LABEL, getFeeling } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllStorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const s = await getStory(params.slug);
  if (!s) return {};
  const url = `${site.url}/stories/${s.slug}`;
  const description = s.asker?.context
    ? `${s.asker.context}。当事者の「その後」を匿名化のうえ記録した、His Recoveries の Recovery Story。`
    : "当事者の「その後」を匿名化のうえ記録した、His Recoveries の Recovery Story。";
  return {
    title: s.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: s.title, description, url },
    twitter: { card: "summary_large_image", title: s.title, description },
  };
}

export default async function StoryPage({ params }: { params: Params }) {
  const s = await getStory(params.slug);
  if (!s) notFound();

  const url = `${site.url}/stories/${s.slug}`;
  const territoryLabel = TERRITORY_LABEL[s.territory] ?? s.territory;
  const otherStories = getAllStories().filter((o) => o.slug !== s.slug).slice(0, 4);
  const relatedFeelings = s.feelings
    .map((f) => getFeeling(f))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Recovery Stories", item: `${site.url}/stories` },
      { "@type": "ListItem", position: 3, name: s.title, item: url },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: s.title,
    datePublished: s.publishedAt,
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
            <Link href="/stories" className="hover:text-ink transition-colors">
              Recovery Stories
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mb-10">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          {territoryLabel}
          {s.span ? ` · ${s.span}` : ""}
        </p>
        <h1 className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.5]">
          {s.title}
        </h1>
        {s.asker && (
          <p className="mt-5 font-mincho text-[13px] text-sub-gray leading-[1.95]">
            {s.asker.ageRange && <>— {s.asker.ageRange}　</>}
            {s.asker.context && <>{s.asker.context}</>}
          </p>
        )}
        <p className="mt-5 text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
          {s.publishedAt}
        </p>
      </header>

      <section aria-label="記録" className="mb-14">
        <div
          className="article-body font-mincho"
          dangerouslySetInnerHTML={{ __html: s.contentHtml }}
        />
      </section>

      <section className="mt-12 pt-10 border-t border-hair-line">
        <div className="mb-8">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            原因を読む
          </p>
          <Link
            href={`/territories/${s.territory}`}
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

        {otherStories.length > 0 && (
          <div>
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              ほかの記録も読む
            </p>
            <ul className="space-y-3">
              {otherStories.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/stories/${o.slug}`}
                    className="block font-mincho text-[14.5px] text-ink hover:text-gold transition-colors"
                  >
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-14 pt-10 border-t border-hair-line bg-cream-deep -mx-6 sm:-mx-10 px-6 sm:px-10 py-10">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
          A Next Half-Step
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05]">
          自分の状態を観察したい方は Recovery Check へ。
          日曜日の手紙（Recoveries Letter）も、ここから受け取れます。
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Link href="/check" className="btn-gold justify-center">
            Recovery Check を始める <span aria-hidden>→</span>
          </Link>
          <TrackedCTA
            href={`${site.social.substack}/subscribe`}
            event="membership_subscribe_click"
            eventProps={{ location: "story_detail", story_slug: s.slug }}
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
