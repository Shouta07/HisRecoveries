import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexById } from "@/lib/complexes";
import { citationsByComplex } from "@/lib/citations";
import { clusters, getCluster, CLUSTER_UPDATED, DESIRES } from "@/lib/clusters";
import ExperienceInvite, { InlineConsult } from "@/components/ExperienceInvite";
import EmpathyLead from "@/components/EmpathyLead";
import QuietConsult from "@/components/QuietConsult";
import ConsultLink from "@/components/ConsultLink";
import MarketView from "@/components/MarketView";
import YourCaseCta from "@/components/YourCaseCta";
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
  // 出典: 記事固有があればそれ、無ければエリア共通（lib/citations.ts の検証済みのみ）
  const sources = a.sources ?? citationsByComplex[a.areaId] ?? [];
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
  // 出典: 記事固有があればそれ、無ければエリア共通（lib/citations.ts の検証済みのみ）
  const sources = a.sources ?? citationsByComplex[a.areaId] ?? [];

  // あわせて読む（related slug → 記事解決。存在しない slug は無視）
  const relatedArticles = (a.related ?? [])
    .map((s) => clusters.find((c) => c.slug === s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // 袋小路をなくす：related が3本未満なら同カテゴリで補完（回遊/PV）。
  // 補完順は「選び方 → ガイド → 解説」——下流（相談に近い）記事へ自然に流す。
  if (relatedArticles.length < 3) {
    const seen = new Set([a.slug, ...relatedArticles.map((r) => r.slug)]);
    const rank = (x: (typeof clusters)[number]) =>
      x.kind === "choose" ? 0 : x.kind === "guide" ? 1 : 2;
    const fill = clusters
      .filter((x) => x.areaId === a.areaId && x.kind !== "interview" && !seen.has(x.slug))
      .sort((p, q) => rank(p) - rank(q));
    for (const x of fill) {
      if (relatedArticles.length >= 3) break;
      relatedArticles.push(x);
    }
  }

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
    // 要点を machine-readable に（AI検索が抜き出しやすくする）
    abstract: a.summary.join(" "),
    keywords: a.keywords.join(", "),
    // 出典を構造化データにも出す＝検証可能性を示す
    ...(sources.length > 0
      ? {
          citation: sources.map((q) => ({
            "@type": "CreativeWork",
            name: q.source,
            url: q.url,
          })),
        }
      : {}),
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
      { "@type": "ListItem", position: 2, name: "記事", item: `${site.url}/areas` },
      { "@type": "ListItem", position: 3, name: c.ja, item: `${site.url}/areas/${c.id}` },
      { "@type": "ListItem", position: 4, name: a.title, item: url },
    ],
  };

  return (
    <div className="bg-[#F3F0EA] text-[#1F1E1B]">
      <MarketView market={a.areaId} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[13.5px] text-[#5E6A70] mb-6">
          <Link href="/" className="hover:text-[#1F1E1B]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#index" className="hover:text-[#1F1E1B]">記事</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/areas/${c.id}`} className="hover:text-[#1F1E1B]">{c.ja}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1F1E1B]">{a.title}</span>
        </nav>

        <header className="mb-8">
          <span
            className="inline-flex rounded-full px-3 py-1 text-[12px] font-bold mb-4"
            style={{ backgroundColor: c.accentSoft, color: c.accent }}
          >
            {c.ja}
          </span>
          {a.kind === "interview" && (
            <span className="inline-flex rounded-full bg-[#8A6A3B] text-white px-3 py-1 text-[12px] font-bold mb-4 ml-2">取材</span>
          )}
          {a.kind === "guide" && (
            <span className="inline-flex rounded-full bg-[#8A6A3B] text-white px-3 py-1 text-[12px] font-bold mb-4 ml-2">ガイド</span>
          )}
          {a.kind === "choose" && (
            <span className="inline-flex rounded-full bg-[#2C3A2E] text-white px-3 py-1 text-[12px] font-bold mb-4 ml-2">選び方</span>
          )}
          <h1 className="text-[1.8rem] sm:text-[2.3rem] leading-[1.35]" style={HEAD}>
            {a.title}
          </h1>
          {a.kind === "interview" && a.interviewee && (
            <p className="mt-3 text-[14.5px] text-[#5E6A70]">
              語り手: <span className="font-semibold text-[#8A6A3B]">{a.interviewee.name}</span>（{a.interviewee.role}）
              {a.interviewee.link && (
                <>
                  {" "}
                  <a href={a.interviewee.link} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-[#B9A06B]/60 underline-offset-2 hover:decoration-[#8A6A3B]">
                    活動ページ↗
                  </a>
                </>
              )}
            </p>
          )}
          <p className="mt-5 text-[15px] text-[#45443E] leading-[2]">{a.lead}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 text-[12px] font-bold">{a.kind === "guide" ? "実践ガイド" : a.kind === "choose" ? "選び方・向き合い方" : "出典明記"}</span>
            <span className="text-[12px] text-[#5E6A70]">最終更新: {CLUSTER_UPDATED}</span>
          </div>
        </header>

        {/* 欲求→悩みのブレイクダウン（普遍的欲求レイヤー。SEO/GEOの共感接点） */}
        {a.desire && DESIRES[a.desire] && (
          <div className="mb-5 flex items-start gap-2.5">
            <span className="shrink-0 inline-flex items-center rounded-full bg-[#2C3A2E] text-[#F3F0EA] px-3 py-1 text-[12px] font-bold tracking-[0.06em]">
              {DESIRES[a.desire].label}
            </span>
            <p className="text-[14px] text-[#45443E] leading-[1.9] pt-0.5">{DESIRES[a.desire].hook}</p>
          </div>
        )}

        {/* 共感リード（心理を正面に・正常化・安心） */}
        <EmpathyLead worry={`「${c.worry}」`} />

        {/* 要点（TL;DR） */}
        <div className="rounded-[1.4rem] bg-gradient-to-br from-white to-[#F3F0EA] border border-[#1F1E1B]/10 p-6 sm:p-7 mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span aria-hidden className="block w-5 h-px bg-[#B9A06B]" />
            <span className="font-mono text-[12px] tracking-[0.18em] uppercase text-[#8A6A3B] font-medium">要点 / TL;DR</span>
          </div>
          <ul className="space-y-2.5">
            {a.summary.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-[#1F1E1B] leading-[1.85]">
                <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#B9A06B] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {c.guide && <InlineConsult />}

        {/* 本文 */}
        <div className="space-y-8">
          {a.sections.map((s) => (
            <section key={s.h}>
              <h2 className="flex items-start gap-2.5 text-[1.2rem] font-bold text-[#1F1E1B] mb-3 leading-[1.5]" style={HEAD}>
                <span aria-hidden className="mt-1.5 w-1 h-5 rounded-full bg-[#B9A06B] shrink-0" />
                {s.h}
              </h2>
              <p className="text-[15.5px] text-[#45443E] leading-[2.05] pl-3.5">{s.body}</p>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-[1.15rem] font-bold text-[#1F1E1B] mb-4" style={HEAD}>よくある質問</h2>
          <dl className="rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-6 divide-y divide-[#1F1E1B]/10">
            {a.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[15px] font-bold text-[#1F1E1B] mb-1.5">{f.q}</dt>
                <dd className="text-[14.5px] text-[#45443E] leading-[1.95]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* あわせて読む — 内部リンク網（潜在→仕組み→選び方の導線） */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.15rem] font-bold text-[#1F1E1B] mb-4" style={HEAD}>あわせて読む</h2>
            <ul className="space-y-2.5">
              {relatedArticles.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/areas/${r.areaId}/${r.slug}`}
                    className="group flex items-start justify-between gap-3 rounded-[1rem] border border-[#1F1E1B]/10 bg-white px-4 py-3.5 hover:border-[#8A6A3B]/40 hover:shadow-[0_14px_30px_-22px_rgba(20,32,26,0.5)] transition-all"
                  >
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-[#1F1E1B] leading-[1.6] group-hover:text-[#8A6A3B] transition-colors">{r.title}</span>
                      <span className="mt-0.5 block text-[13.5px] text-[#5E6A70] leading-[1.7] line-clamp-1">{r.lead}</span>
                    </span>
                    <span aria-hidden className="text-[#8A6A3B] shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 記事 → 検討層への橋。「答えは渡す。ただし順番はあなた固有」で診断へ送る。
            情報収集で満足して離脱するのを防ぐ、最初の一段。 */}
        <YourCaseCta topic={c.ja} market={a.areaId} />

        {/* 次の一歩。ガイド（第一印象）は体験へ、メカニズム／選び方は静かな一本CTA。 */}
        {c.guide ? (
          <ExperienceInvite context={`${c.ja}が気になっているあなたへ`} />
        ) : (
          <QuietConsult />
        )}

        {/* 出典 — 根拠を示すことで、読者にもAI検索にも検証可能にする */}
        {sources.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.05rem] font-bold text-[#1F1E1B] mb-3" style={HEAD}>
              参考にした情報源
            </h2>
            <ul className="space-y-2">
              {sources.map((q) => (
                <li key={q.url} className="flex items-start gap-2">
                  <span aria-hidden className="text-[#B9A06B] mt-px">›</span>
                  <p className="text-[14.5px] text-[#45443E] leading-[1.85]">
                    <a
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-semibold text-[#8A6A3B] underline decoration-[#B9A06B]/60 underline-offset-2 hover:decoration-[#8A6A3B]"
                    >
                      {q.source}↗
                    </a>
                    {q.note ? <span className="ml-1.5 text-[#5E6A70]">— {q.note}</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-[13.5px] text-[#5E6A70] leading-[1.9]">
          {a.kind === "guide"
            ? "※ 本記事は一般的な情報と実践のヒントを整理したものです。効果を保証するものではありません。医療的な判断が必要な場合は医療機関にご相談ください。"
            : a.kind === "choose"
            ? "※ 本記事は、選ぶときの観点を中立に整理したものです。特定の医療機関・製品・施術を推奨するものではなく、効果・有効性を示すものでも、診断・治療・受診勧奨を目的としたものでもありません。「今はやらない」も含め、選ぶのはあなたです。個別の判断は専門家にご相談ください。"
            : "※ 本記事は一般的に知られる情報を、出典を明記して整理したものです。診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。"}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/areas/${c.id}`} className="inline-flex items-center gap-2 rounded-full border border-[#1F1E1B]/20 hover:border-[#1F1E1B] text-[#1F1E1B] text-sm font-semibold px-7 py-3.5 transition-colors">
            {c.ja}の全体を見る <span aria-hidden>→</span>
          </Link>
          <Link href="/#plan" className="inline-flex items-center gap-2 rounded-full bg-[#1F1E1B] hover:bg-[#7E4F33] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            自分の順番を診断する（無料） <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
