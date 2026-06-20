import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import NeutralBadge from "@/components/NeutralBadge";
import {
  getAllRecoverySlugs,
  getRecovery,
  getAllRecoveries,
} from "@/lib/recoveries";
import { TERRITORY_LABEL, getFeeling } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllRecoverySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const r = await getRecovery(params.slug);
  if (!r) return {};
  const url = `${site.url}/recoveries/${r.slug}`;
  const description = r.asker?.context
    ? `${r.asker.context}。当事者の「その後」を匿名化のうえ記録した、His Recoveries の Recovery。`
    : "当事者の「その後」を匿名化のうえ記録した、His Recoveries の Recovery。";
  return {
    title: r.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: r.title, description, url },
    twitter: { card: "summary_large_image", title: r.title, description },
  };
}

function StructuredSection({ label, body }: { label: string; body?: string }) {
  if (!body) return null;
  return (
    <section className="mb-9">
      <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold mb-3">
        {label}
      </p>
      <div className="font-mincho text-[15px] text-ink leading-[2.05] whitespace-pre-wrap">
        {body}
      </div>
    </section>
  );
}

export default async function RecoveryPage({ params }: { params: Params }) {
  const r = await getRecovery(params.slug);
  if (!r) notFound();

  const url = `${site.url}/recoveries/${r.slug}`;
  const territoryLabel = TERRITORY_LABEL[r.territory] ?? r.territory;
  const others = getAllRecoveries().filter((o) => o.slug !== r.slug).slice(0, 4);
  const relatedFeelings = r.feelings
    .map((f) => getFeeling(f))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  const hasStructured = Boolean(
    r.structured?.before ||
      r.structured?.action ||
      r.structured?.change ||
      r.structured?.now ||
      r.structured?.recommend
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Recoveries", item: `${site.url}/recoveries` },
      { "@type": "ListItem", position: 3, name: r.title, item: url },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: r.title,
    datePublished: r.publishedAt,
    inLanguage: site.language,
    articleSection: territoryLabel,
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
    mainEntityOfPage: url,
    about: r.territory
      ? { "@type": "Thing", name: territoryLabel }
      : undefined,
    keywords: [
      ...(r.concernTags ?? []),
      ...(r.actionTags ?? []),
      ...(r.outcomeTags ?? []),
    ].join(", "),
  };

  return (
    <>
      <article className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-24 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />

        <nav aria-label="breadcrumb" className="mb-10 text-[11px] tracking-widest text-sub-gray">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-ink transition-colors uppercase">
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link href="/recoveries" className="hover:text-ink transition-colors">
                Recoveries
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            {territoryLabel}
            {r.span ? ` · ${r.span}` : ""}
          </p>
          <h1 className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.5]">
            {r.title}
          </h1>
          {r.asker && (
            <p className="mt-5 font-mincho text-[13px] text-sub-gray leading-[1.95]">
              {r.asker.ageRange && <>— {r.asker.ageRange}　</>}
              {r.asker.context && <>{r.asker.context}</>}
            </p>
          )}
          <p className="mt-5 text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
            {r.publishedAt}
          </p>
        </header>

        {/* Structured (preferred). Falls back to prose body if absent. */}
        {hasStructured ? (
          <>
            <StructuredSection label="悩み" body={r.structured?.before} />
            <StructuredSection label="行動" body={r.structured?.action} />
            <StructuredSection label="変化" body={r.structured?.change} />
            <StructuredSection label="現在" body={r.structured?.now} />
            <StructuredSection label="おすすめしたい人" body={r.structured?.recommend} />
            {/* Optional free-form supplement */}
            {r.contentHtml.trim() && (
              <div
                className="mt-8 article-body font-mincho"
                dangerouslySetInnerHTML={{ __html: r.contentHtml }}
              />
            )}
          </>
        ) : (
          <section aria-label="記録" className="mb-10">
            <div
              className="article-body font-mincho"
              dangerouslySetInnerHTML={{ __html: r.contentHtml }}
            />
          </section>
        )}

        {/* Tags */}
        {((r.concernTags ?? []).length +
          (r.actionTags ?? []).length +
          (r.outcomeTags ?? []).length >
          0) && (
          <section className="mt-10 pt-6 border-t border-hair-line">
            {r.concernTags && r.concernTags.length > 0 && (
              <TagRow label="悩み" tags={r.concernTags} kind="concern" />
            )}
            {r.actionTags && r.actionTags.length > 0 && (
              <TagRow label="行動" tags={r.actionTags} kind="action" />
            )}
            {r.outcomeTags && r.outcomeTags.length > 0 && (
              <TagRow label="変化" tags={r.outcomeTags} kind="outcome" />
            )}
          </section>
        )}

        <section className="mt-12 pt-10 border-t border-hair-line">
          <div className="mb-8">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              原因を読む
            </p>
            <Link
              href={`/territories/${r.territory}`}
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

          {others.length > 0 && (
            <div>
              <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
                ほかの実例も読む
              </p>
              <ul className="space-y-3">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/recoveries/${o.slug}`}
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

        <div className="mt-10">
          <NeutralBadge variant="subtle" />
        </div>
        <div className="mt-4">
          <MedicalDisclaimer />
        </div>
      </article>

      <NextStepBlock
        body="自分の状態を観察したい方は Recovery Check へ。あなたの「その後」を記録に残したい方は、インタビューに応募できます。"
        tertiary={{ href: "/interview", label: "インタビューを受ける" }}
      />
    </>
  );
}

function TagRow({
  label,
  tags,
  kind,
}: {
  label: string;
  tags: string[];
  kind: "concern" | "action" | "outcome";
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-2">
      <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
        {label}
      </span>
      {tags.map((t) => (
        <Link
          key={t}
          href={`/recoveries/by-tag/${kind}/${encodeURIComponent(t)}`}
          className="text-[12px] text-ink border-b border-hair-line hover:border-gold hover:text-gold transition-colors pb-0.5"
        >
          #{t}
        </Link>
      ))}
    </div>
  );
}
