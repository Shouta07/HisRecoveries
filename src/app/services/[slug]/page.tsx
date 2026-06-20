import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import NextStepBlock from "@/components/NextStepBlock";
import {
  getAllServiceSlugs,
  getService,
  vouchLink,
} from "@/lib/services";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { getRecovery } from "@/lib/recoveries";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const s = await getService(params.slug);
  if (!s) return {};
  const url = `${site.url}/services/${s.slug}`;
  const description = `${s.operator} の ${s.name}（${s.category}）。HR が編集の目で保証するサービス。紹介手数料は受け取りません。`;
  return {
    title: `${s.name} — ${s.category}`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: s.name, description, url },
  };
}

export default async function ServicePage({ params }: { params: Params }) {
  const s = await getService(params.slug);
  if (!s) notFound();

  const url = `${site.url}/services/${s.slug}`;
  const related = await Promise.all(
    (s.relatedRecoveries ?? []).map((slug) => getRecovery(slug))
  );
  const visible = related.filter((r): r is NonNullable<typeof r> => Boolean(r));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/services` },
      { "@type": "ListItem", position: 3, name: s.name, item: url },
    ],
  };
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.category,
    provider: { "@type": "Organization", name: s.operator },
    areaServed: s.region ? { "@type": "Place", name: s.region } : undefined,
    url: s.external?.website || url,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
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
              <Link href="/services" className="hover:text-ink transition-colors">
                Services
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            {s.category}
            {s.region ? ` · ${s.region}` : ""}
          </p>
          <h1 className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.4]">
            {s.name}
          </h1>
          <p className="mt-3 text-[13px] text-sub-gray">
            {s.operator}
            {s.priceBand ? ` · 目安 ${s.priceBand}` : ""}
          </p>
          <div className="mt-5">
            <NeutralBadge />
          </div>
        </header>

        {s.structured?.features && (
          <Section label="特徴" body={s.structured.features} />
        )}
        {s.structured?.idealClient && (
          <Section label="向いている人" body={s.structured.idealClient} />
        )}
        {s.structured?.expertNote && (
          <Section label="専門家コメント" body={s.structured.expertNote} />
        )}
        {s.contentHtml.trim() && (
          <div
            className="mt-6 article-body font-mincho"
            dangerouslySetInnerHTML={{ __html: s.contentHtml }}
          />
        )}

        {visible.length > 0 && (
          <section className="mt-10 pt-8 border-t border-hair-line">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              関連する実例
            </p>
            <ul className="space-y-3">
              {visible.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/recoveries/${r.slug}`}
                    className="block font-mincho text-[14.5px] text-ink hover:text-gold transition-colors"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {s.external?.website && (
          <section className="mt-10 pt-8 border-t border-hair-line">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              問い合わせ・予約
            </p>
            <p className="font-mincho text-[13.5px] text-sub-gray leading-[2]">
              HR は仲介しません。サービス提供者へ直接ご連絡ください。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={vouchLink(s.external.website, s.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !py-3 !px-5 text-xs"
              >
                {s.operator} のサイトを開く <span aria-hidden>→</span>
              </a>
              {s.external.bookingUrl && (
                <a
                  href={vouchLink(s.external.bookingUrl, s.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
                >
                  予約ページへ
                </a>
              )}
            </div>
            <p className="mt-3 text-[11px] text-sub-gray leading-[1.95]">
              リンクには HR の計測 UTM が付きます。紹介手数料は受け取っていません。
            </p>
          </section>
        )}

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </article>

      <NextStepBlock
        body="同じ領域の原因を読みたい方は『原因を読む』へ。自分の状態を観察したい方は Recovery Check へ。"
        primary={{
          href: s.fields.length > 0 ? `/territories/${s.fields[0]}` : "/territories",
          label: "原因を読む",
        }}
        secondary={{ href: "/check", label: "Recovery Check を始める" }}
      />
    </>
  );
}

function Section({ label, body }: { label: string; body: string }) {
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
