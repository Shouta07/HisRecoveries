import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexById } from "@/lib/complexes";
import { citationsByComplex } from "@/lib/citations";
import { clusters, getCluster, CLUSTER_UPDATED, DESIRES } from "@/lib/clusters";
import { charCount, headingId, readingMinutes, sameSituationArticles } from "@/lib/reading";
import MarketView from "@/components/MarketView";
import { site } from "@/lib/site";

// 記事ページ。検索から来た人が最初に見る面であり、このサイトのPVの大半がここに立つ。
//
// 組みはトップと同じ（生成りの地・明朝の見出し・罫線・カードなし）。
// 読み物として成立させたうえで、次の一本に進める導線を3種類だけ置く：
//   ① 目次 …………… ページ内で迷わせない。Google のジャンプリンクにも効く
//   ② 同じ状況 ……… 分野をまたぐ回遊。ここが2本目への最大の入口
//   ③ 同じ分野 ……… 深掘りしたい人向け
// 「無料診断」のような存在しない導線は置かない。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return clusters.map((c) => ({ id: c.areaId, slug: c.slug }));
}

export function generateMetadata({ params }: { params: { id: string; slug: string } }): Metadata {
  const a = getCluster(params.id, params.slug);
  const c = complexById(params.id);
  if (!a || !c) return {};
  const url = `${site.url}/areas/${a.areaId}/${a.slug}`;
  return {
    title: a.title,
    description: a.lead,
    keywords: a.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      locale: site.locale,
      title: a.title,
      description: a.lead,
      section: c.ja,
      publishedTime: "2026-06-01",
      modifiedTime: CLUSTER_UPDATED,
      tags: a.keywords,
    },
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
  const minutes = readingMinutes(a);
  const situationBlocks = sameSituationArticles(a);
  const situationSlugs = new Set(situationBlocks.flatMap((b) => b.items.map((x) => x.slug)));

  // あわせて読む（related slug → 記事解決。存在しない slug は無視）
  const relatedArticles = (a.related ?? [])
    .map((s) => clusters.find((x) => x.slug === s))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .filter((x) => !situationSlugs.has(x.slug));

  // 袋小路をなくす：related が3本未満なら同カテゴリで補完（回遊/PV）。
  // 補完順は「選び方 → ガイド → 解説」——下流（相談に近い）記事へ自然に流す。
  if (relatedArticles.length < 4) {
    const seen = new Set([a.slug, ...relatedArticles.map((r) => r.slug), ...situationSlugs]);
    const rank = (x: (typeof clusters)[number]) =>
      x.kind === "choose" ? 0 : x.kind === "guide" ? 1 : 2;
    const fill = clusters
      .filter((x) => x.areaId === a.areaId && x.kind !== "interview" && !seen.has(x.slug))
      .sort((p, q) => rank(p) - rank(q));
    for (const x of fill) {
      if (relatedArticles.length >= 4) break;
      relatedArticles.push(x);
    }
  }

  const kindLabel =
    a.kind === "interview" ? "取材" : a.kind === "guide" ? "実践ガイド" : a.kind === "choose" ? "選び方" : "仕組みの解説";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: a.title,
    name: a.title,
    description: a.lead,
    inLanguage: "ja",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    about: c.ja,
    articleSection: c.ja,
    genre: kindLabel,
    wordCount: charCount(a),
    timeRequired: `PT${minutes}M`,
    datePublished: "2026-06-01",
    dateModified: CLUSTER_UPDATED,
    author: { "@type": "Organization", name: site.name, url: site.url },
    // 要点を machine-readable に（AI検索が抜き出しやすくする）
    abstract: a.summary.join(" "),
    keywords: a.keywords.join(", "),
    // 音声アシスタント／AI検索に「まずここを読め」と伝える
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#article-title", "#tldr"],
    },
    isPartOf: { "@id": `${site.url}/#website` },
    ...(a.kind === "interview" && a.interviewee
      ? { interviewee: { "@type": "Person", name: a.interviewee.name, jobTitle: a.interviewee.role } }
      : {}),
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
    publisher: { "@id": `${site.url}/#publisher` },
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
      { "@type": "ListItem", position: 2, name: c.ja, item: `${site.url}/areas/${c.id}` },
      { "@type": "ListItem", position: 3, name: a.title, item: url },
    ],
  };

  return (
    <div className="bg-kinari text-sumi">
      <MarketView market={a.areaId} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <article className="mx-auto max-w-reading px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-dou">ホーム</Link>
          <span className="mx-1.5" aria-hidden>/</span>
          <Link href={`/areas/${c.id}`} className="transition-colors hover:text-dou">{c.ja}</Link>
        </nav>

        <header className="mt-7">
          <p className="text-[13px] text-dou">{kindLabel}</p>
          <h1
            id="article-title"
            className="mt-3 text-[26px] leading-[1.5] sm:text-[34px]"
            style={{ ...MINCHO, fontWeight: 600 }}
          >
            {a.title}
          </h1>
          {a.kind === "interview" && a.interviewee && (
            <p className="mt-4 text-[14px] text-keshizumi">
              語り手：<span className="font-semibold text-dou">{a.interviewee.name}</span>（{a.interviewee.role}）
              {a.interviewee.link && (
                <>
                  {" "}
                  <a
                    href={a.interviewee.link}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline decoration-dou/40 underline-offset-[4px] hover:decoration-dou"
                  >
                    活動ページ<span aria-hidden> ↗</span>
                  </a>
                </>
              )}
            </p>
          )}
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">{a.lead}</p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-shironezu pt-4 text-[12.5px] text-ainezu">
            <span>{c.ja}</span>
            <span>読了 約{minutes}分</span>
            <span>最終更新 {CLUSTER_UPDATED.replace(/-/g, ".")}</span>
          </p>
        </header>

        {/* 要点（TL;DR）— 読者にもAI検索にも、最初に結論を渡す */}
        <div id="tldr" className="mt-10 border-l-2 border-dou pl-5 sm:pl-6">
          <p className="text-[13px] text-dou">この記事の要点</p>
          <ul className="mt-3 space-y-2.5">
            {a.summary.map((s, i) => (
              <li key={i} className="text-[15px] leading-[1.95] text-sumi">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* 目次 — 長い記事で迷わせない。検索結果のジャンプリンクにも使われる */}
        {a.sections.length > 2 && (
          <nav aria-label="目次" className="mt-10 border-y border-shironezu py-6">
            <p className="text-[13px] text-ainezu">目次</p>
            <ol className="mt-3 space-y-2">
              {a.sections.map((s, i) => (
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

        {/* 欲求のブレイクダウン — 「これは自分の話だ」と接続する一行 */}
        {a.desire && DESIRES[a.desire] && (
          <p className="mt-10 text-[14.5px] leading-[2] text-keshizumi">
            <span className="font-semibold text-sumi">{DESIRES[a.desire].label}</span>
            <span className="mx-2 text-shironezu" aria-hidden>|</span>
            {DESIRES[a.desire].hook}
          </p>
        )}

        {/* 本文 */}
        <div className="mt-12 flex flex-col gap-11">
          {a.sections.map((s, i) => (
            <section key={s.h} id={headingId(i)} className="scroll-mt-20">
              <h2 className="text-[20px] leading-[1.6] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
                {s.h}
              </h2>
              <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">{s.body}</p>
            </section>
          ))}
        </div>

        {/* FAQ */}
        {a.faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 600 }}>
              よくある質問
            </h2>
            <dl className="mt-6 border-t border-shironezu">
              {a.faqs.map((f) => (
                <div key={f.q} className="border-b border-shironezu py-5">
                  <dt className="text-[15px] font-semibold leading-[1.7]">{f.q}</dt>
                  <dd className="mt-2 text-[14.5px] leading-[1.95] text-keshizumi">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 出典 — 根拠を示すことで、読者にもAI検索にも検証可能にする */}
        {sources.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
              参考にした情報源
            </h2>
            <ul className="mt-5 space-y-3">
              {sources.map((q) => (
                <li key={q.url} className="text-[14px] leading-[1.9] text-keshizumi">
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-semibold text-dou underline decoration-dou/40 underline-offset-[4px] hover:decoration-dou"
                  >
                    {q.source}
                    <span aria-hidden> ↗</span>
                  </a>
                  {q.note ? <span className="ml-1.5 text-ainezu">— {q.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
          {a.kind === "guide"
            ? "※ 本記事は一般的な情報と実践のヒントを整理したものです。効果を保証するものではありません。医療的な判断が必要な場合は医療機関にご相談ください。"
            : a.kind === "choose"
              ? "※ 本記事は、選ぶときの観点を中立に整理したものです。特定の医療機関・製品・施術を推奨するものではなく、効果・有効性を示すものでも、診断・治療・受診勧奨を目的としたものでもありません。「今はやらない」も含め、選ぶのはあなたです。個別の判断は専門家にご相談ください。"
              : "※ 本記事は一般的に知られる情報を、出典を明記して整理したものです。診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。"}
        </p>
      </article>

      {/* ══ ここから先は回遊。地を変えて、記事が終わったことを示す ══ */}
      <div className="border-t border-shironezu bg-hakuji">
        <div className="mx-auto max-w-[860px] px-5 sm:px-8 py-16 sm:py-20">
          {/* 同じ状況の人が読んでいる記事 — 分野をまたぐ導線 */}
          {situationBlocks.map((b) => (
            <section key={b.situationLabel} className="mb-14 last:mb-0">
              <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
                「{b.situationLabel}」で読まれている記事
              </h2>
              <ul className="mt-5 border-t border-shironezu">
                {b.items.map((r) => (
                  <li key={r.slug} className="border-b border-shironezu">
                    <Link
                      href={`/areas/${r.areaId}/${r.slug}`}
                      className="group block py-5 transition-colors hover:text-dou"
                    >
                      <p className="text-[12.5px] text-ainezu">
                        {complexById(r.areaId)?.ja ?? ""}
                      </p>
                      <p className="mt-1 text-[15.5px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 600 }}>
                        {r.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* あわせて読む — 同じ分野で深掘りする人向け */}
          {relatedArticles.length > 0 && (
            <section className="mb-14 last:mb-0">
              <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
                あわせて読む
              </h2>
              <ul className="mt-5 border-t border-shironezu">
                {relatedArticles.map((r) => (
                  <li key={r.slug} className="border-b border-shironezu">
                    <Link
                      href={`/areas/${r.areaId}/${r.slug}`}
                      className="group block py-5 transition-colors hover:text-dou"
                    >
                      <p className="text-[15.5px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 600 }}>
                        {r.title}
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-[1.85] text-keshizumi line-clamp-2">
                        {r.lead}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="flex flex-wrap gap-x-8 gap-y-3 border-t border-shironezu pt-8 text-[14px]">
            <Link
              href={`/areas/${c.id}`}
              className="font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
            >
              {c.ja}の記事をすべて見る<span aria-hidden> →</span>
            </Link>
            <Link
              href="/#index"
              className="font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
            >
              ほかの分野からさがす<span aria-hidden> →</span>
            </Link>
          </p>

          {/* サービス — 押さない。読んで進む人のほうが多い前提で置く */}
          <p className="mt-10 border-t border-shironezu pt-8 text-[13.5px] leading-[1.95] text-ainezu">
            記事はすべて無料で公開しています。一人だと止まってしまう場合だけ、
            <Link href="/plan" className="mx-1 font-semibold text-dou underline decoration-dou/40 underline-offset-[4px] hover:decoration-dou">
              第一印象改善プラン
            </Link>
            をご覧ください。東京都内・土日のみ。
          </p>
        </div>
      </div>
    </div>
  );
}
