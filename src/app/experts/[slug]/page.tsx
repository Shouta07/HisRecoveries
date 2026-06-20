import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllExpertSlugs, getExpert } from "@/lib/experts";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllExpertSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const e = await getExpert(params.slug);
  if (!e) return {};
  const url = `${site.url}/experts/${e.slug}`;
  const description = `${e.role}${
    e.region ? `（${e.region}）` : ""
  }。${e.field
    .map((f) => TERRITORY_LABEL[f] ?? f)
    .join(" / ")} を扱う、His Recoveries 編集が認証した専門家。`;
  return {
    title: `${e.name} — ${e.role}`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: e.name, description, url },
  };
}

export default async function ExpertPage({ params }: { params: Params }) {
  const e = await getExpert(params.slug);
  if (!e) notFound();

  const url = `${site.url}/experts/${e.slug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Experts", item: `${site.url}/experts` },
      { "@type": "ListItem", position: 3, name: e.name, item: url },
    ],
  };
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: e.name,
    jobTitle: e.role,
    knowsAbout: e.field.map((f) => TERRITORY_LABEL[f] ?? f),
    url: e.contact?.website ?? url,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
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
              <Link href="/experts" className="hover:text-ink transition-colors">
                Experts
              </Link>
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            {e.role}
            {e.region ? ` · ${e.region}` : ""}
          </p>
          <h1 className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.4]">
            {e.name}
          </h1>
          {e.field.length > 0 && (
            <p className="mt-3 text-[12px] text-sub-gray">
              {e.field.map((f) => TERRITORY_LABEL[f] ?? f).join(" / ")}
            </p>
          )}
          <div className="mt-5">
            <NeutralBadge variant="subtle" />
          </div>
        </header>

        {e.structured?.why && (
          <Section label="なぜこの仕事をしているか" body={e.structured.why} />
        )}
        {e.structured?.commonConcerns && (
          <Section label="よくある悩み" body={e.structured.commonConcerns} />
        )}
        {e.structured?.approach && (
          <Section label="解決方法" body={e.structured.approach} />
        )}
        {e.structured?.idealClient && (
          <Section label="改善する人の特徴" body={e.structured.idealClient} />
        )}
        {e.contentHtml.trim() && (
          <div
            className="mt-6 article-body font-mincho"
            dangerouslySetInnerHTML={{ __html: e.contentHtml }}
          />
        )}

        {e.contact?.website && (
          <section className="mt-10 pt-8 border-t border-hair-line">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
              問い合わせ
            </p>
            <p className="font-mincho text-[13.5px] text-sub-gray leading-[2]">
              HR は仲介しません。直接ご連絡ください。
            </p>
            <a
              href={`${e.contact.website}${
                e.contact.website.includes("?") ? "&" : "?"
              }utm_source=hisrecoveries&utm_medium=vouch&utm_campaign=expert_${e.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5"
            >
              {e.name} のサイトを開く <span aria-hidden className="ml-2">→</span>
            </a>
          </section>
        )}

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </article>

      <NextStepBlock
        body="同じ領域の原因を読みたい方は『原因を読む』へ。自分の状態を観察したい方は Recovery Check へ。"
        primary={{
          href: `/territories/${e.field[0] ?? ""}`,
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
