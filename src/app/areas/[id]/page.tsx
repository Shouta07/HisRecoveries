import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexes, complexById } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { citationsByComplex } from "@/lib/citations";
import { clustersByArea } from "@/lib/clusters";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return complexes.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) return {};
  const title = `${c.ja}は、なぜ起きるのか — 原因と仕組み`;
  const url = `${site.url}/areas/${c.id}`;
  return {
    title,
    description: area.lead,
    keywords: [c.ja, `${c.ja} 原因`, `${c.ja} 仕組み`, c.system, c.en, "メカニズム", "男性"],
    alternates: { canonical: url },
    openGraph: { type: "article", url, title, description: area.lead },
    twitter: { card: "summary_large_image", title, description: area.lead },
  };
}

export default function AreaPage({ params }: { params: { id: string } }) {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) notFound();

  const cites = citationsByComplex[c.id] ?? [];
  const related = clustersByArea(c.id);
  const url = `${site.url}/areas/${c.id}`;

  // ---- structured data (SEO + GEO) ----
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
    description: area.lead,
    inLanguage: "ja",
    mainEntityOfPage: url,
    about: c.ja,
    datePublished: "2026-06-01",
    dateModified: AREA_UPDATED,
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
    mainEntity: area.faqs.map((f) => ({
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
      { "@type": "ListItem", position: 2, name: "取り扱う領域", item: `${site.url}/#mechanism` },
      { "@type": "ListItem", position: 3, name: c.ja, item: url },
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
          <Link href="/#mechanism" className="hover:text-[#1f2a1d]">取り扱う領域</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">{c.ja}</span>
        </nav>

        <header className="mb-8">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold mb-4"
            style={{ backgroundColor: c.accentSoft, color: c.accent }}
          >
            {c.system}
          </span>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3]" style={HEAD}>
            {c.ja}は、<span className="text-[#3d5638]">なぜ起きるのか。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{area.lead}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 text-[11px] font-bold">医師監修</span>
            <span className="text-[11px] text-[#9aa79a]">最終更新: {AREA_UPDATED}</span>
          </div>
        </header>

        {/* 要点（TL;DR）— extractable summary for search & AI engines */}
        <div className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-6 mb-10">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3d5638] font-medium mb-3">要点</div>
          <ul className="space-y-2">
            {area.summary.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#1f2a1d] leading-[1.85]">
                <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#85AB8B] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* 原文（主） */}
        <div className="space-y-8">
          {area.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
                {s.h}
              </h2>
              <p className="text-[14px] text-[#3a423a] leading-[2]">{s.body}</p>
            </section>
          ))}

          <section className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-6">
            <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              受診の目安
            </h2>
            <p className="text-[13.5px] text-[#4b5b47] leading-[1.95]">{area.whenToSee}</p>
          </section>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            よくある質問
          </h2>
          <dl className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-6 divide-y divide-[#1f2a1d]/10">
            {area.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[14px] font-bold text-[#1f2a1d] mb-1.5">{f.q}</dt>
                <dd className="text-[13px] text-[#4b5b47] leading-[1.95]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 出典・参考（従） */}
        <section className="mt-12">
          <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            出典・参考リンク
          </h2>
          {cites.length > 0 ? (
            <ul className="space-y-3">
              {cites.map((q, i) => (
                <li key={i} className="rounded-[1rem] border border-[#1f2a1d]/10 bg-white p-4">
                  {q.quote ? (
                    <blockquote className="border-l-2 border-[#85AB8B] pl-3">
                      <p className="text-[13.5px] text-[#1f2a1d] leading-[1.95]">「{q.quote}」</p>
                      <footer className="mt-2 text-[12px] text-[#6b7a66]">
                        — {q.source}
                        <a href={q.url} target="_blank" rel="noopener noreferrer nofollow" className="ml-2 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]">
                          原文を読む↗
                        </a>
                      </footer>
                    </blockquote>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-[#85AB8B] mt-px" aria-hidden>›</span>
                      <p className="text-[13px] text-[#3a423a] leading-[1.85]">
                        <a href={q.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]">
                          {q.source}↗
                        </a>
                        {q.note && <span className="text-[#6b7a66]"> — {q.note}</span>}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[#9aa79a] leading-[1.9]">
              出典は順次追加していきます。
            </p>
          )}
        </section>

        {/* 関連記事（クラスタ） */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>関連記事</h2>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/areas/${c.id}/${r.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3.5 hover:border-[#3d5638]/40 transition-colors"
                  >
                    <span className="text-[13.5px] font-semibold text-[#1f2a1d]">{r.title}</span>
                    <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 本記事は医師監修のもと、一般的に知られる情報を整理したものです。出典・参考リンクは中立な医学情報源によります。
          特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#mechanism" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            ほかの領域を見る <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            予約登録する <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
