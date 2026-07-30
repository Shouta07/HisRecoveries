import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexes, complexById } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { citationsByComplex } from "@/lib/citations";
import { clustersByArea } from "@/lib/clusters";
import { fieldVoicesByArea } from "@/lib/fieldVoices";
import { headingId } from "@/lib/reading";
import SectionBody from "@/components/SectionBody";
import MarketView from "@/components/MarketView";
import { site } from "@/lib/site";

// 分野のハブ。役割は2つ。
//  ① その分野の仕組みを一本にまとめた、いちばん上位の読み物（ピラー）
//  ② その分野の記事を全部並べる索引（ここから下位記事へリンクを流す）
//
// 検索は「薄毛 原因」のような分野語でこのページに当たり、
// 「AGA 費用」のような具体語で下位記事に当たる。だから②の全件リストが要る。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return complexes.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) return {};
  const title = area.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`;
  const url = `${site.url}/areas/${c.id}`;
  return {
    title,
    description: area.lead,
    keywords: c.guide
      ? [c.ja, `${c.ja} 男`, "第一印象 改善", "清潔感", "メンズ 身だしなみ", c.en]
      : [c.ja, `${c.ja} 原因`, `${c.ja} 仕組み`, c.system, c.en, "メカニズム", "男性"],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      locale: site.locale,
      title,
      description: area.lead,
      modifiedTime: AREA_UPDATED,
    },
    twitter: { card: "summary_large_image", title, description: area.lead },
  };
}

export default function AreaPage({ params }: { params: { id: string } }) {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) notFound();

  const cites = citationsByComplex[c.id] ?? [];
  const all = clustersByArea(c.id);
  const voices = fieldVoicesByArea(c.id);
  const url = `${site.url}/areas/${c.id}`;
  const pillarTitle = area.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`;

  // 索引は「選び方 → ガイド → 仕組み → 取材」の順。決めたい人を先に通す。
  const rank = (x: (typeof all)[number]) =>
    x.kind === "choose" ? 0 : x.kind === "guide" ? 1 : x.kind === "interview" ? 3 : 2;
  const index = [...all].sort((p, q) => rank(p) - rank(q));

  // ---- structured data (SEO + GEO) ----
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: pillarTitle,
    description: area.lead,
    inLanguage: "ja",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    about: c.ja,
    articleSection: c.ja,
    abstract: area.summary.join(" "),
    datePublished: "2026-06-01",
    dateModified: AREA_UPDATED,
    author: { "@type": "Organization", name: site.name, url: site.url },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#area-title", "#tldr"] },
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
  };
  // 索引としての顔。AI検索に「この分野の記事一覧はここ」と示す。
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${c.ja}の記事`,
    numberOfItems: index.length,
    itemListElement: index.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/areas/${x.areaId}/${x.slug}`,
      name: x.title,
    })),
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
      { "@type": "ListItem", position: 2, name: c.ja, item: url },
    ],
  };

  return (
    <div className="bg-kinari text-sumi">
      <MarketView market={c.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="mx-auto max-w-reading px-5 sm:px-8 pt-12 sm:pt-16 pb-20">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-dou">ホーム</Link>
          <span className="mx-1.5" aria-hidden>/</span>
          <Link href="/#index" className="transition-colors hover:text-dou">記事をさがす</Link>
        </nav>

        <header className="mt-7">
          <p className="text-[13px] text-dou">{c.system}</p>
          <h1
            id="area-title"
            className="mt-3 text-[28px] leading-[1.45] sm:text-[38px]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            {pillarTitle}
          </h1>
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">{area.lead}</p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-shironezu pt-4 text-[12.5px] text-ainezu">
            <span>{c.ja}</span>
            <span>記事 {all.length}本</span>
            <span>最終更新 {AREA_UPDATED.replace(/-/g, ".")}</span>
          </p>
        </header>

        {/* 要点 */}
        <div id="tldr" className="mt-10 border-l-2 border-dou pl-5 sm:pl-6">
          <p className="text-[13px] text-dou">この分野の要点</p>
          <ul className="mt-3 space-y-2.5">
            {area.summary.map((s, i) => (
              <li key={i} className="text-[15px] leading-[1.95] text-sumi">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* 目次 */}
        {area.sections.length > 2 && (
          <nav aria-label="目次" className="mt-10 border-y border-shironezu py-6">
            <p className="text-[13px] text-ainezu">目次</p>
            <ol className="mt-3 space-y-2">
              {area.sections.map((s, i) => (
                <li key={s.h} className="flex items-baseline gap-3">
                  <span className="w-[1.4em] shrink-0 text-[12px] tabular-nums text-ainezu">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${headingId(i)}`}
                    className="text-[14.5px] leading-[1.75] text-keshizumi underline decoration-shironezu underline-offset-[5px] transition-colors hover:text-dou hover:decoration-dou"
                  >
                    {s.h}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* 本文 */}
        <div className="mt-12 flex flex-col gap-11">
          {area.sections.map((s, i) => (
            <section key={s.h} id={headingId(i)} className="scroll-mt-20">
              <h2 className="text-[20px] leading-[1.6] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
                {s.h}
              </h2>
              <SectionBody s={s} />
            </section>
          ))}

          <section className="border-l-2 border-shironezu pl-5 sm:pl-6">
            <h2 className="text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
              {c.guide ? "プロと整える目安" : "受診の目安"}
            </h2>
            <p className="mt-3 text-[15px] leading-[2] text-keshizumi">{area.whenToSee}</p>
          </section>
        </div>

        {/* FAQ */}
        {area.faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
              よくある質問
            </h2>
            <dl className="mt-6 border-t border-shironezu">
              {area.faqs.map((f) => (
                <div key={f.q} className="border-b border-shironezu py-5">
                  <dt className="text-[15px] font-bold leading-[1.7]">{f.q}</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.95] text-keshizumi">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 出典 */}
        {cites.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
              出典・参考リンク
            </h2>
            <ul className="mt-5 space-y-5">
              {cites.map((q, i) => (
                <li key={i}>
                  {q.quote ? (
                    <blockquote className="border-l-2 border-dou pl-4">
                      <p className="text-[14.5px] leading-[1.95] text-sumi">「{q.quote}」</p>
                      <footer className="mt-2 text-[13px] text-ainezu">
                        — {q.source}
                        <a
                          href={q.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="ml-2 font-bold text-dou underline decoration-dou/40 underline-offset-[4px] hover:decoration-dou"
                        >
                          原文<span aria-hidden> ↗</span>
                        </a>
                      </footer>
                    </blockquote>
                  ) : (
                    <p className="text-[14px] leading-[1.9] text-keshizumi">
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-bold text-dou underline decoration-dou/40 underline-offset-[4px] hover:decoration-dou"
                      >
                        {q.source}
                        <span aria-hidden> ↗</span>
                      </a>
                      {q.note && <span className="ml-1.5 text-ainezu">— {q.note}</span>}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 現場の声（キュレーション）— 業界のプロが公開している記事の紹介 */}
        {voices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
              現場の声（キュレーション）
            </h2>
            <p className="mt-3 text-[13.5px] leading-[1.9] text-ainezu">
              この領域の現場で活躍するプロが公開している記事を、出典を明記して紹介します。順不同・中立です。
            </p>
            <ul className="mt-5 border-t border-shironezu">
              {voices.map((v) => (
                <li key={v.url} className="border-b border-shironezu py-5">
                  <p className="text-[12.5px] text-ainezu">
                    {v.industry}／{v.author}
                  </p>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-1.5 block text-[15px] font-bold text-dou underline decoration-dou/40 underline-offset-[5px] hover:decoration-dou"
                  >
                    {v.title}
                    <span aria-hidden> ↗</span>
                  </a>
                  <p className="mt-1.5 text-[13.5px] leading-[1.9] text-keshizumi">{v.note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
          {c.guide
            ? "※ 本記事は一般的な情報と実践のヒントを整理したものです。効果を保証するものではありません。医療的な判断が必要な場合は医療機関にご相談ください。"
            : "※ 本記事は一般的に知られる情報を、出典を明記して整理したものです。出典・参考リンクは中立な医学情報源によります。特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。"}
        </p>
      </article>

      {/* ══ この分野の記事、全件 ══ */}
      <div className="border-t border-shironezu bg-hakuji">
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex items-baseline gap-4 border-b-2 border-sumi pb-3">
            <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
              {c.ja}の記事
            </h2>
            <span className="text-[12.5px] tabular-nums text-ainezu">{index.length}</span>
          </div>
          <ul>
            {index.map((r) => (
              <li key={r.slug} className="border-b border-shironezu">
                <Link
                  href={`/areas/${r.areaId}/${r.slug}`}
                  className="group block py-6 transition-colors hover:text-dou"
                >
                  <p className="text-[12.5px] text-ainezu">
                    {r.kind === "interview"
                      ? "取材"
                      : r.kind === "guide"
                        ? "実践ガイド"
                        : r.kind === "choose"
                          ? "選び方"
                          : "仕組みの解説"}
                    {r.kind === "interview" && r.interviewee
                      ? `／${r.interviewee.name}（${r.interviewee.role}）`
                      : ""}
                  </p>
                  <p className="mt-1.5 max-w-[30em] text-[16.5px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {r.title}
                  </p>
                  <p className="mt-2 max-w-[38em] text-[13.5px] leading-[1.9] text-keshizumi line-clamp-2">
                    {r.lead}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-[14px]">
            <Link
              href="/#index"
              className="font-bold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
            >
              ほかの分野からさがす<span aria-hidden> →</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
