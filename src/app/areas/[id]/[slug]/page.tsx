import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexById } from "@/lib/complexes";
import { clusters, getCluster, CLUSTER_UPDATED } from "@/lib/clusters";
import ExperienceInvite, { InlineConsult } from "@/components/ExperienceInvite";
import EmpathyLead from "@/components/EmpathyLead";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return clusters.map((c) => ({ id: c.areaId, slug: c.slug }));
}

export function generateMetadata({ params }: { params: { id: string; slug: string } }): Metadata {
  const a = getCluster(params.id, params.slug);
  if (!a) return {};
  const url = `${site.url}/areas/${a.areaId}/${a.slug}`;
  return {
    title: a.title,
    description: a.lead,
    keywords: a.keywords,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: a.title, description: a.lead },
    twitter: { card: "summary_large_image", title: a.title, description: a.lead },
  };
}

export default function ClusterArticlePage({ params }: { params: { id: string; slug: string } }) {
  const a = getCluster(params.id, params.slug);
  const c = complexById(params.id);
  if (!a || !c) notFound();

  const url = `${site.url}/areas/${a.areaId}/${a.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.lead,
    inLanguage: "ja",
    mainEntityOfPage: url,
    about: c.ja,
    datePublished: "2026-06-01",
    dateModified: CLUSTER_UPDATED,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/icon` },
    },
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: a.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "Library", item: `${site.url}/areas` },
      { "@type": "ListItem", position: 3, name: c.ja, item: `${site.url}/areas/${c.id}` },
      { "@type": "ListItem", position: 4, name: a.title, item: url },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-6">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <Link href="/areas" className="hover:text-[#1f2a1d]">Library</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/areas/${c.id}`} className="hover:text-[#1f2a1d]">{c.ja}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">{a.title}</span>
        </nav>

        <header className="mb-8">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold mb-4"
            style={{ backgroundColor: c.accentSoft, color: c.accent }}
          >
            {c.ja}
          </span>
          {a.kind === "interview" && (
            <span className="inline-flex rounded-full bg-[#3d5638] text-white px-3 py-1 text-[11px] font-bold mb-4 ml-2">取材</span>
          )}
          {a.kind === "guide" && (
            <span className="inline-flex rounded-full bg-[#3d5638] text-white px-3 py-1 text-[11px] font-bold mb-4 ml-2">ガイド</span>
          )}
          <h1 className="text-[1.8rem] sm:text-[2.3rem] leading-[1.35]" style={HEAD}>
            {a.title}
          </h1>
          {a.kind === "interview" && a.interviewee && (
            <p className="mt-3 text-[13px] text-[#6b7a66]">
              語り手: <span className="font-semibold text-[#3d5638]">{a.interviewee.name}</span>（{a.interviewee.role}）
              {a.interviewee.link && (
                <>
                  {" "}
                  <a href={a.interviewee.link} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]">
                    活動ページ↗
                  </a>
                </>
              )}
            </p>
          )}
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{a.lead}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 text-[11px] font-bold">{a.kind === "guide" ? "実践ガイド" : "出典明記"}</span>
            <span className="text-[11px] text-[#9aa79a]">最終更新: {CLUSTER_UPDATED}</span>
          </div>
        </header>

        {/* 共感リード（心理を正面に・正常化・安心） */}
        <EmpathyLead worry={`「${c.worry}」`} />

        {/* 要点（TL;DR） */}
        <div className="rounded-[1.4rem] bg-gradient-to-br from-white to-[#f4f6f2] border border-[#1f2a1d]/10 p-6 sm:p-7 mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span aria-hidden className="block w-5 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#3d5638] font-medium">要点 / TL;DR</span>
          </div>
          <ul className="space-y-2.5">
            {a.summary.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#1f2a1d] leading-[1.85]">
                <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#85AB8B] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <InlineConsult />

        {/* 本文 */}
        <div className="space-y-8">
          {a.sections.map((s) => (
            <section key={s.h}>
              <h2 className="flex items-start gap-2.5 text-[1.2rem] font-bold text-[#1f2a1d] mb-3 leading-[1.5]" style={HEAD}>
                <span aria-hidden className="mt-1.5 w-1 h-5 rounded-full bg-[#85AB8B] shrink-0" />
                {s.h}
              </h2>
              <p className="text-[14.5px] text-[#3a423a] leading-[2.05] pl-3.5">{s.body}</p>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>よくある質問</h2>
          <dl className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-6 divide-y divide-[#1f2a1d]/10">
            {a.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[14px] font-bold text-[#1f2a1d] mb-1.5">{f.q}</dt>
                <dd className="text-[13px] text-[#4b5b47] leading-[1.95]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 体験の提案（記事 → 体験の橋渡し） */}
        <ExperienceInvite context={`${c.ja}が気になっているあなたへ`} />

        <p className="mt-12 text-[12px] text-[#6b7a66] leading-[1.9]">
          {a.kind === "guide"
            ? "※ 本記事は一般的な情報と実践のヒントを整理したものです。効果を保証するものではありません。医療的な判断が必要な場合は医療機関にご相談ください。"
            : "※ 本記事は一般的に知られる情報を、出典を明記して整理したものです。診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。"}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/areas/${c.id}`} className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            {c.ja}の全体を見る <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            予約登録する <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
