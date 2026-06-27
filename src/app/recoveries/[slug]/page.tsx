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
import { complexByTerritory } from "@/lib/complexes";
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

function StructuredSection({
  label,
  body,
  accent,
  soft,
}: {
  label: string;
  body?: string;
  accent: string;
  soft: string;
}) {
  if (!body) return null;
  return (
    <section className="mb-8">
      <span
        className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] mb-3"
        style={{ backgroundColor: soft, color: accent }}
      >
        {label}
      </span>
      <div className="font-mincho text-[15px] text-zinc-700 leading-[2.05] whitespace-pre-wrap">
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
  const c = complexByTerritory(r.territory);
  const accent = c?.accent ?? "#18181b";
  const soft = c?.accentSoft ?? "#f4f4f5";
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
    <div className="bg-[#FAF6F0] text-zinc-900">
      <article className="mx-auto max-w-[820px] px-6 sm:px-10 pt-10 sm:pt-14 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />

        <nav aria-label="breadcrumb" className="mb-7 text-[12px] text-zinc-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-zinc-700 transition-colors">
                ホーム
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/recoveries" className="hover:text-zinc-700 transition-colors">
                インタビュー
              </Link>
            </li>
          </ol>
        </nav>

        <div className="rounded-3xl bg-white p-6 sm:p-12 shadow-sm">
          <header className="mb-8">
            <div className="flex items-center gap-2.5 text-[12px] font-bold">
              <Link
                href={`/territories/${r.territory}`}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: soft, color: accent }}
              >
                {c?.ja ?? territoryLabel}
              </Link>
              {r.span && <span className="text-zinc-400">{r.span}の記録</span>}
            </div>
            <h1 className="mt-5 font-mincho text-[1.7rem] sm:text-[2.3rem] font-bold text-zinc-900 leading-[1.45]">
              {r.title}
            </h1>
            {r.asker && (
              <p className="mt-5 text-[13.5px] text-zinc-500 leading-[1.9]">
                {r.asker.ageRange && <>{r.asker.ageRange}・</>}
                {r.asker.context && <>{r.asker.context}</>}
              </p>
            )}
          </header>

          {/* Structured (preferred). Falls back to prose body if absent. */}
          {hasStructured ? (
            <>
              <StructuredSection label="悩み" body={r.structured?.before} accent={accent} soft={soft} />
              <StructuredSection label="行動" body={r.structured?.action} accent={accent} soft={soft} />
              <StructuredSection label="変化" body={r.structured?.change} accent={accent} soft={soft} />
              <StructuredSection label="現在" body={r.structured?.now} accent={accent} soft={soft} />
              <StructuredSection label="おすすめしたい人" body={r.structured?.recommend} accent={accent} soft={soft} />
              {r.contentHtml.trim() && (
                <div
                  className="mt-8 article-body font-mincho"
                  dangerouslySetInnerHTML={{ __html: r.contentHtml }}
                />
              )}
            </>
          ) : (
            <section aria-label="記録">
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
            <section className="mt-10 pt-6 border-t border-zinc-100">
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

          <div className="mt-8">
            <NeutralBadge variant="subtle" />
          </div>
          <div className="mt-4">
            <MedicalDisclaimer />
          </div>
        </div>

        <section className="mt-10">
          <Link
            href={`/territories/${r.territory}`}
            className="group flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <span>
              <span className="block text-[12px] font-bold" style={{ color: accent }}>
                なぜ起きる？
              </span>
              <span className="mt-0.5 block text-[15px] font-bold text-zinc-900">
                {territoryLabel}の仕組みを読む
              </span>
            </span>
            <span aria-hidden className="text-xl group-hover:translate-x-1 transition-transform" style={{ color: accent }}>
              →
            </span>
          </Link>

          {others.length > 0 && (
            <div className="mt-8">
              <p className="text-[12px] font-bold tracking-[0.04em] text-zinc-400 mb-4">
                ほかのインタビューも読む
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {others.map((o) => {
                  const oc = complexByTerritory(o.territory);
                  return (
                    <Link
                      key={o.slug}
                      href={`/recoveries/${o.slug}`}
                      className="group block rounded-2xl bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-all"
                    >
                      <span
                        className="text-[12px] font-bold"
                        style={{ color: oc?.accent ?? "#71717a" }}
                      >
                        {oc?.ja ?? o.territory}
                      </span>
                      <span className="mt-1.5 block text-[14.5px] font-bold text-zinc-900 leading-[1.5] group-hover:text-zinc-600 transition-colors">
                        {o.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </article>

      <NextStepBlock
        body="自分の状態を観察したい方は Recovery Check へ。あなたの「その後」を記録に残したい方は、インタビューに応募できます。"
        tertiary={{ href: "/interview", label: "インタビューを受ける" }}
      />
    </div>
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
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold tracking-[0.06em] text-zinc-400">
        {label}
      </span>
      {tags.map((t) => (
        <Link
          key={t}
          href={`/recoveries/by-tag/${kind}/${encodeURIComponent(t)}`}
          className="rounded-full bg-zinc-100 px-3 py-1 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          #{t}
        </Link>
      ))}
    </div>
  );
}
