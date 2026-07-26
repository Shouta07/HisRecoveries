import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clusters, CLUSTER_UPDATED, type ClusterArticle } from "@/lib/clusters";
import { citationsByComplex } from "@/lib/citations";
import { purposes, decidePurpose } from "@/lib/library";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";

// Library — 目的から探すことに振り切った記事一覧。
//
// 記事そのものは悩み（清潔感・薄毛・肌…）で書かれているが、読む人は目的で来る。
// なので主導線は5つの目的（＝サイト全体と同じ Job）にし、悩み別は
// 「領域から探す」として下部に温存する（SEO の受け皿を失わないため）。
//
// SEO / GEO の設計：
//   ・目的ごとに「問い → 1文回答 → 要点3つ」を可視のテキストで置く。
//     引用されるのはこの粒度なので、記事本文まで読ませる前に答えが立っている必要がある。
//   ・同じ内容を FAQPage の構造化データにも出す
//     （画面に無い内容を schema に書かない、が守るべき線）。
//   ・専門性は自分で断定せず、キュレーション＝出典への明示リンクで担保する。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

// 文節を inline-block で包み、スマホの改行を「、。」の区切りで自然に起こすヘルパー。
function W({ children }: { children: React.ReactNode }) {
  return <span className="inline-block">{children}</span>;
}

export const metadata: Metadata = {
  title: "His Recoveries Library — 目的から探す、男の整え方",
  description:
    "恋愛・大切な日・仕事・家族・自己再起。目的から逆算して、何から始めるべきかを整理した男性向けの記事ライブラリ。出典を明記し、何も売らない中立の解説。匿名で読めます。",
  keywords: [
    "自分磨き 男 何から",
    "メンズ 垢抜け 順番",
    "清潔感 出し方",
    "第一印象 改善 男性",
    "婚活写真 服装 男",
    "ビジネス 第一印象 男性",
    "40代 男性 老け見え",
    "AGA 費用 総額",
  ],
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    type: "website",
    url: `${site.url}/areas`,
    title: "His Recoveries Library — 目的から探す、男の整え方",
    description:
      "目的から逆算して、何から始めるべきかを整理した記事ライブラリ。出典明記・中立・匿名で読めます。",
  },
};

const bySlug = new Map(clusters.map((a) => [a.slug, a]));
const AREA_JA = new Map(complexes.map((c) => [c.id, c.ja]));
const AREA_ACCENT = new Map(complexes.map((c) => [c.id, c.accent]));

/** 目的に属する記事を、キュレーションの意図どおりに並べて返す。 */
function articlesFor(p: (typeof purposes)[number]): ClusterArticle[] {
  const out: ClusterArticle[] = [];
  const seen = new Set<string>();
  const push = (a?: ClusterArticle) => {
    if (!a || seen.has(a.slug) || a.kind === "interview") return;
    seen.add(a.slug);
    out.push(a);
  };
  push(bySlug.get(p.starter)); // はじめの1本は必ず先頭
  p.extraSlugs.forEach((s) => push(bySlug.get(s)));
  clusters.filter((a) => a.desire && p.desires.includes(a.desire)).forEach(push);
  return out;
}

function badgeOf(a: ClusterArticle) {
  if (a.kind === "guide") return { label: "ガイド", cls: "bg-[#eef3ea] text-[#3d5638]" };
  if (a.kind === "choose") return { label: "選び方", cls: "bg-[#16241A] text-[#EDF1E8]" };
  if (a.kind === "interview") return { label: "取材", cls: "bg-[#3d5638] text-white" };
  return { label: "解説", cls: "bg-[#f0f4ee] text-[#6b7a66]" };
}

function ArticleCard({ a, starter = false }: { a: ClusterArticle; starter?: boolean }) {
  const b = badgeOf(a);
  return (
    <Link
      href={`/areas/${a.areaId}/${a.slug}`}
      style={{ borderLeftColor: AREA_ACCENT.get(a.areaId) ?? "#85AB8B", borderLeftWidth: 3 }}
      className="group flex flex-col rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4 hover:border-[#3d5638]/40 hover:shadow-[0_18px_38px_-24px_rgba(20,32,26,0.5)] transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-bold ${b.cls}`}>{b.label}</span>
        <span className="text-[10px] text-[#9aa79a]">{AREA_JA.get(a.areaId)}</span>
        {starter && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#16241A] text-[#EDF1E8] px-2 py-0.5 text-[9.5px] font-bold">
            <span aria-hidden>★</span>はじめの1本
          </span>
        )}
      </div>
      <h3
        className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6] group-hover:text-[#3d5638] transition-colors"
        style={HEAD}
      >
        {a.title}
      </h3>
      <p className="mt-1.5 text-[11.5px] text-[#4b5b47] leading-[1.8] line-clamp-2">{a.lead}</p>
    </Link>
  );
}

/** 目的ブロックの「問い → 1文回答 → 要点」。ここが引用される単位。 */
function AnswerBlock({ question, answer, points }: { question: string; answer: string; points: readonly string[] }) {
  return (
    <div className="rounded-[1.2rem] bg-[#16241A] text-[#EDF1E8] p-5 sm:p-6 mb-5">
      <p className="text-[13px] sm:text-[13.5px] font-bold leading-[1.75] text-[#9ec4a3]">{question}</p>
      <p className="mt-2.5 text-[13px] sm:text-[13.5px] leading-[2] text-[#EDF1E8]">{answer}</p>
      <ul className="mt-4 space-y-1.5 border-t border-white/12 pt-3.5">
        {points.map((x) => (
          <li key={x} className="flex gap-2 text-[12px] leading-[1.85] text-[#C9D2C4]">
            <span aria-hidden className="text-[#85AB8B] shrink-0">—</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LibraryPage() {
  const url = `${site.url}/areas`;

  const sections = purposes.map((p) => ({ p, articles: articlesFor(p) }));
  const chooseArticles = clusters.filter((a) => a.kind === "choose");
  const interviews = clusters.filter((a) => a.kind === "interview");

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: "His Recoveries Library",
    description:
      "恋愛・大切な日・仕事・家族・自己再起。目的から逆算して「何から始めるべきか」を整理した男性向けの記事ライブラリ。",
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    dateModified: CLUSTER_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: clusters.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
      })),
    },
  };

  // 目的レベルの問い＝AIに引用される単位。画面に出している文言と一致させる。
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...purposes, decidePurpose].map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `${p.answer} ${p.points.map((x) => `・${x}`).join(" ")}`,
      },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "記事", item: url },
    ],
  };

  const citationEntries = Object.entries(citationsByComplex).filter(([, list]) => list.length > 0);

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-7">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">記事</span>
        </nav>

        {/* ── ヘッダー ── */}
        <header className="mb-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-[#3d5638] font-medium">
              His Recoveries Library
            </span>
          </div>
          <h1 className="text-[1.8rem] sm:text-[2.4rem] leading-[1.3]" style={HEAD}>
            <W>知識より、</W>
            <W><span className="text-[#3d5638]">変化につながる</span>情報を。</W>
          </h1>
          <div className="mt-5 space-y-3 text-[13.5px] sm:text-[14.5px] text-[#4b5b47] leading-[1.95]">
            <p>
              <W>世の中には多くの美容・健康情報があります。</W>
              <W>しかし、本当に必要なのは、</W>
              <W>たくさんの情報を集めることではありません。</W>
            </p>
            <p>
              <W>あなたの目的に対して、</W>
              <W><span className="font-semibold text-[#1f2a1d]">「何から始めるべきか」</span>を知ること。</W>
            </p>
            <p>
              <W>His Recoveriesの記事では、</W>
              <W>男性が自分自身を整えるための考え方と、</W>
              <W>具体的な方法を届けます。</W>
            </p>
          </div>
        </header>

        {/* ── 目的ナビ（主導線） ── */}
        <div className="sticky top-[62px] sm:top-[72px] z-30 -mx-5 sm:mx-0 mb-10 border-b border-[#1f2a1d]/10 bg-[#f4f6f2]/92 backdrop-blur-sm">
          <div className="flex gap-2 overflow-x-auto px-5 sm:px-0 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="shrink-0 self-center text-[11px] font-bold text-[#9aa79a] pr-1">目的から</span>
            {purposes.map((p) => (
              <a
                key={p.id}
                href={`#p-${p.id}`}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#1f2a1d]/12 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#3a423a] hover:border-[#3d5638]/50 hover:text-[#1f2a1d] transition-colors"
              >
                <span className="font-mono text-[10px] text-[#85AB8B]">{p.no}</span>
                {p.label}
              </a>
            ))}
            <a
              href="#p-decide"
              className="shrink-0 inline-flex items-center rounded-full border border-[#16241A]/25 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#16241A] hover:border-[#16241A] transition-colors"
            >
              決める前に
            </a>
            <a
              href="#interviews"
              className="shrink-0 inline-flex items-center rounded-full border border-[#3d5638]/25 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#3d5638] hover:border-[#3d5638] transition-colors"
            >
              取材
            </a>
          </div>
        </div>

        {/* ── 目的別セクション ── */}
        <div className="space-y-14">
          {sections.map(({ p, articles }) => {
            const shown = articles.slice(0, 6);
            const rest = articles.slice(6);
            return (
              <section key={p.id} id={`p-${p.id}`} className="scroll-mt-[128px]">
                <div className="flex items-baseline gap-2.5 mb-3">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#85AB8B]">{p.no}</span>
                  <h2 className="text-[1.15rem] sm:text-[1.35rem] font-bold text-[#1f2a1d]" style={HEAD}>
                    {p.label}
                  </h2>
                </div>

                <AnswerBlock question={p.question} answer={p.answer} points={p.points} />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shown.map((a, i) => (
                    <ArticleCard key={a.slug} a={a} starter={i === 0} />
                  ))}
                </div>

                {rest.length > 0 && (
                  <details className="group mt-3">
                    <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
                      この目的の記事を、あと{rest.length}本みる
                      <span aria-hidden className="text-[11px] group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {rest.map((a) => (
                        <ArticleCard key={a.slug} a={a} />
                      ))}
                    </div>
                  </details>
                )}

                {/* 最初の目的の直後に、静かな導線をひとつだけ */}
                {p.id === "romance" && (
                  <div className="mt-7 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]">
                        <W>調べ続けるより、</W>
                        <W>先に順番を決めたほうが早いこともあります。</W>
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7a66] leading-[1.8]">
                        <W>30秒で、あなた用の構成と日程が出ます。</W>
                        <W>登録不要・匿名。</W>
                      </p>
                    </div>
                    <Link
                      href="/#occasions"
                      className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[13px] font-bold px-6 py-3 transition-colors"
                    >
                      パッケージを組む <span aria-hidden>→</span>
                    </Link>
                  </div>
                )}
              </section>
            );
          })}

          {/* ── 決める前に読む ── */}
          <section id="p-decide" className="scroll-mt-[128px]">
            <div className="flex items-baseline gap-2.5 mb-3">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#85AB8B]">{decidePurpose.no}</span>
              <h2 className="text-[1.15rem] sm:text-[1.35rem] font-bold text-[#1f2a1d]" style={HEAD}>
                {decidePurpose.label}
              </h2>
            </div>
            <AnswerBlock
              question={decidePurpose.question}
              answer={decidePurpose.answer}
              points={decidePurpose.points}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chooseArticles.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </section>

          {/* ── 取材（一次情報） ── */}
          <section id="interviews" className="scroll-mt-[128px]">
            <h2 className="text-[1.15rem] sm:text-[1.35rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              取材 — 現場のプロに、直接聞く
            </h2>
            <p className="text-[12.5px] text-[#6b7a66] leading-[1.9] mb-5">
              <W>メイク・スタイリスト・撮影ほか、</W>
              <W>現場の第一線で働く人に His Recoveries が直接聞いた一次情報です。</W>
            </p>
            {interviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {interviews.map((a) => (
                  <ArticleCard key={a.slug} a={a} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-[#1f2a1d]/15 bg-white/50 p-7 text-center">
                <p className="text-[13px] text-[#6b7a66] leading-[1.9]">取材記事を、これから掲載していきます。</p>
              </div>
            )}
          </section>

          {/* ── キュレーション（出典） ── */}
          <section id="citations" className="scroll-mt-[128px]">
            <h2 className="text-[1.15rem] sm:text-[1.35rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              参考にしている、一次情報
            </h2>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.95] mb-5 max-w-2xl">
              <W>専門的な内容は、私たちが断定しません。</W>
              <W>仕組みの説明は公的・中立の情報源にあたり、</W>
              <W>出典を明記してリンクします。</W>
              <W>改変せず、特定の医療機関・製品には偏らせません。</W>
            </p>
            <ul className="rounded-[1.2rem] border border-[#1f2a1d]/10 bg-white divide-y divide-[#1f2a1d]/8 overflow-hidden">
              {citationEntries.map(([areaId, list]) =>
                list.map((c) => (
                  <li key={`${areaId}-${c.url}`} className="px-4 py-3.5">
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <span className="text-[10px] font-bold text-[#9aa79a]">{AREA_JA.get(areaId) ?? areaId}</span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-[12.5px] font-semibold text-[#3d5638] underline underline-offset-4 hover:opacity-70 transition-opacity"
                      >
                        {c.source}
                      </a>
                    </div>
                    {c.note && <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.8]">{c.note}</p>}
                  </li>
                )),
              )}
            </ul>
          </section>

          {/* ── 領域から探す（悩み軸は温存） ── */}
          <section id="areas" className="scroll-mt-[128px]">
            <h2 className="text-[1.15rem] sm:text-[1.35rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              領域から探す
            </h2>
            <p className="text-[12.5px] text-[#6b7a66] leading-[1.9] mb-5">
              <W>目的ではなく、気になっている部位から探したいときは、こちらから。</W>
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complexes.map((c) => {
                const area = getArea(c.id);
                return (
                  <Link
                    key={c.id}
                    href={`/areas/${c.id}`}
                    style={{ borderLeftColor: c.accent, borderLeftWidth: 3 }}
                    className="group rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4 hover:border-[#3d5638]/40 transition-colors"
                  >
                    <div
                      className="text-[13.5px] font-bold text-[#1f2a1d] group-hover:text-[#3d5638] transition-colors"
                      style={HEAD}
                    >
                      {c.ja}
                    </div>
                    <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.8] line-clamp-2">
                      {area?.lead ?? c.worry}
                    </p>
                  </Link>
                );
              })}
              <Link
                href="/areas/confidence"
                style={{ borderLeftColor: "#85AB8B", borderLeftWidth: 3 }}
                className="group rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4 hover:border-[#3d5638]/40 transition-colors"
              >
                <div
                  className="text-[13.5px] font-bold text-[#1f2a1d] group-hover:text-[#3d5638] transition-colors"
                  style={HEAD}
                >
                  自信・パートナーシップ
                </div>
                <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.8]">見た目の外側にある、関係と自信の話。</p>
              </Link>
            </div>
          </section>
        </div>

        {/* ── 読み終わりの受け皿 ── */}
        <div className="mt-14 rounded-[1.3rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-[13.5px] leading-[1.85] flex-1">
            <W>読むだけでも大丈夫です。</W>
            <W>順番を決めたくなったら、30秒で構成が出ます。</W>
            <W>相談も無料・匿名。</W>
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/#occasions"
              className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[13px] font-bold px-6 py-3 transition-colors"
            >
              パッケージを組む <span aria-hidden>→</span>
            </Link>
            <ConsultLink className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:bg-white/[0.08] text-[#EDF1E8] text-[13px] font-semibold px-6 py-3 transition-colors">
              無料で相談する
            </ConsultLink>
          </div>
        </div>

        <p className="mt-8 text-[11.5px] text-[#6b7a66] leading-[1.9]">
          ※ 記事は一般的に知られる情報や実践のヒントを、出典を明記して整理したものです。効果を保証するものではなく、
          診断・治療・受診勧奨を目的としたものではありません。「選び方・向き合い方」の記事も、選ぶときの観点を中立に整理したもので、
          特定の医療機関・製品・施術を推奨するものではありません。「今はやらない」も含め、選ぶのはあなたです。個別の判断は専門家にご相談ください。
          最終更新：{AREA_UPDATED}
        </p>
      </div>
    </div>
  );
}
