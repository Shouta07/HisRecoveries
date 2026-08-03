import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE, GUIDE_UPDATED, assertCites, citedSlugs, uncited } from "@/lib/orderGuide";
import { clusters } from "@/lib/clusters";
import { areaLabel, type AreaId } from "@/lib/check";
import { formatDate, publishedAt } from "@/lib/articleDates";
import CheckCta from "@/components/check/CheckCta";
import { ReadingProgress } from "@/components/ReadingAids";
import ShareRow from "@/components/ShareRow";
import { site } from "@/lib/site";

// サイトの最上位に置く一本。55本の記事を、順番という1本の線に通す。
//
// ── 役割の分担 ────────────────────────────────
//   /order            … 全部の順番（ここ）
//   /areas/[分野]      … その分野の仕組み
//   /areas/[分野]/[記事] … 個別
//   /choices/[分野]    … で、何を選ぶか
//   /check            … あなたの場合はどれか
//
// ── 引用は slug で持つ ───────────────────────────
// 題名は clusters.ts から引く。本文に書き写すと、記事の題名を直したとき
// ここが古いままになる。リンク切れは気づけるが、題名のずれは気づけない。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/order`;
const TITLE = "男の改善、全部の順番 — 55本を1本の線に通す";
const DESC =
  "何から始めるかで迷う人のための、順番の全体像。減点をなくす → 進むものだけ早く知る → 続けるものを絞る → 内側を触る。His Recoveries の記事55本すべてを、その順番の上に置いています。やらなくていいことも書いています。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "自分磨き 順番",
    "男 見た目 改善",
    "清潔感 上げる",
    "垢抜け 男",
    "メンズ 身だしなみ",
    "何から始める",
  ],
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: site.name,
    locale: site.locale,
    title: TITLE,
    description: DESC,
    modifiedTime: GUIDE_UPDATED,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function OrderPage() {
  // 存在しない記事を引用していたら、ここでビルドを落とす。
  // 公開してから気づくたぐいの間違いなので、静かに直せる場所には置かない。
  assertCites();

  const cited = citedSlugs();
  const missing = uncited();

  const resolve = (slug: string) => clusters.find((a) => a.slug === slug);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: TITLE,
    description: DESC,
    inLanguage: "ja",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    about: "男性の見た目・体・習慣の改善",
    articleSection: "順番",
    abstract: GUIDE.map((s) => `${s.h}：${s.body[0]}`).join(" "),
    dateModified: GUIDE_UPDATED,
    author: { "@type": "Organization", name: site.name, url: site.url },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#order-title", "#tldr"] },
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
    // どの記事に基づいて書いているかを、機械にも渡す
    citation: cited.map((s) => {
      const a = resolve(s);
      return {
        "@type": "CreativeWork",
        name: a?.title ?? s,
        url: `${site.url}/areas/${a?.areaId}/${s}`,
      };
    }),
  };
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "全部の順番", item: url },
    ],
  };

  return (
    <div className="bg-shironeri text-sumi">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      <ReadingProgress />

      <article className="mx-auto max-w-reading px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">ホーム</Link>
        </nav>

        <header className="mt-7">
          <p className="text-[13px] text-asagi">全体の順番</p>
          <h1
            id="order-title"
            className="mt-3 text-[27px] leading-[1.48] sm:text-[36px]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            男の改善、全部の順番
          </h1>
          <p className="mt-5 text-[16px] leading-[2.05] text-keshizumi">
            やることは、たくさんあります。髪も肌も体も、それぞれに正しいやり方がある。
            足りていないのは情報ではなく、
            <span className="font-bold text-sumi">自分の場合、どれを何番目にやるか</span>
            のほうです。
          </p>
          <p className="mt-4 text-[16px] leading-[2.05] text-keshizumi">
            この一本に、{clusters.length}本の記事を全部置きました。順番の上に並べ直してあるので、
            上から読めば、いま自分がどこにいるかが分かります。
          </p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-shironezu pt-4 text-[12.5px] text-ainezu">
            <span>順番</span>
            <span className="tabular-nums">記事 {clusters.length}本を収録</span>
            <span className="tabular-nums">更新 {formatDate(GUIDE_UPDATED)}</span>
          </p>
        </header>

        <div id="tldr" className="mt-10 border-l-2 border-asagi pl-5 sm:pl-6">
          <p className="text-[13px] text-asagi">この記事の要点</p>
          <ul className="mt-3 space-y-2.5">
            {[
              "順番が要るのは、情報が足りないからではなく、全部やろうとして続かないから。",
              "最初は加点ではなく減点をなくす。ほとんど0円で、今日か今週で終わる。",
              "進行するもの（髪）だけは、対処ではなく現在地の把握を早める。",
              "続けるもの（肌・顔・体毛）は、増やす前に続く数まで減らす。",
              "内側（睡眠・習慣）はいちばん効くが、いちばん遅い。だから最後に触る。",
            ].map((s) => (
              <li key={s} className="text-[15px] leading-[1.95] text-sumi">{s}</li>
            ))}
          </ul>
        </div>

        {/* 目次 */}
        <nav aria-label="目次" className="mt-10 border-y border-shironezu py-6">
          <p className="text-[13px] text-ainezu">この順番</p>
          <ol className="mt-3 space-y-2">
            {GUIDE.map((s) => (
              <li key={s.id} className="flex items-baseline gap-3">
                <span className="w-[4.2em] shrink-0 text-[12px] text-asagi">{s.kicker}</span>
                <a
                  href={`#${s.id}`}
                  className="text-[14.5px] leading-[1.75] text-keshizumi underline decoration-shironezu underline-offset-[5px] transition-colors hover:text-asagi hover:decoration-asagi"
                >
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 本文 */}
        <div className="mt-14 flex flex-col gap-16">
          {GUIDE.map((s, si) => (
            <section
              key={s.id}
              id={s.id}
              className={`scroll-mt-20 ${si === 0 ? "" : "border-t border-shironezu pt-12"}`}
            >
              <p className="text-[12px] tabular-nums tracking-[0.14em] text-asagi">{s.kicker}</p>
              <h2 className="mt-2 text-[22px] leading-[1.5] sm:text-[26px]" style={{ ...MINCHO, fontWeight: 700 }}>
                {s.h}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="mt-4 text-[16px] leading-[2.0] text-keshizumi">
                  {p}
                </p>
              ))}

              <div className="mt-9 flex flex-col gap-9">
                {s.parts.map((part) => (
                  <div key={part.h}>
                    <h3 className="text-[17.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                      {part.h}
                    </h3>
                    <p className="mt-2.5 text-[15.5px] leading-[1.95] text-keshizumi">{part.body}</p>
                    <ul className="mt-4 border-t border-shironezu">
                      {part.cites.map((c) => {
                        const a = resolve(c.slug);
                        if (!a) return null;
                        const d = publishedAt(a.slug);
                        return (
                          <li key={c.slug} className="border-b border-shironezu py-3.5">
                            <Link
                              href={`/areas/${a.areaId}/${a.slug}`}
                              className="text-[15px] font-bold leading-[1.7] text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
                            >
                              {a.title}
                              <span aria-hidden> →</span>
                            </Link>
                            <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[13px] leading-[1.85] text-ainezu">
                              {c.note && <span className="text-keshizumi">{c.note}</span>}
                              {d && <span className="tabular-nums">{formatDate(d)}</span>}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 選択肢へ */}
        <section className="mt-16 border-t border-shironezu pt-12">
          <h2 className="text-[22px] leading-[1.5] sm:text-[26px]" style={{ ...MINCHO, fontWeight: 700 }}>
            で、何を選ぶか
          </h2>
          <p className="mt-4 text-[16px] leading-[2.0] text-keshizumi">
            順番が決まっても、各段階で何を選ぶかは残ります。
            分野ごとに、買わずにできることから医療の領域まで並べた面を別に置いてあります。
            <span className="font-bold text-sumi">おすすめの順ではありません。</span>
            費用の目安・1日の手間・確かめるまでの期間・向いている人・まだ早い条件で並べています。
          </p>
          <ul className="mt-6 grid gap-px border border-shironezu bg-shironezu sm:grid-cols-2">
            {(["impression", "hair", "skin", "face", "body-hair", "mind"] as AreaId[]).map((a) => (
              <li key={a} className="bg-shironeri">
                <Link
                  href={`/choices/${a}`}
                  className="block px-5 py-4 text-[15px] transition-colors hover:bg-hakuji hover:text-asagi"
                  style={{ ...MINCHO, fontWeight: 700 }}
                >
                  {areaLabel(a)}：何から選ぶか
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* やらなくていいこと */}
        <section className="mt-16 border border-shironezu bg-hakuji px-5 py-7 sm:px-7">
          <h2 className="text-[19px] leading-[1.55] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            いまは、やらなくていいこと
          </h2>
          <ul className="mt-5 space-y-3.5 text-[15.5px] leading-[1.95] text-keshizumi">
            <li>
              <span className="font-bold text-sumi">全部を同時に始めること。</span>
              3つ揃えて2週間でやめるより、1つを3ヶ月続けるほうが、確かめられることが多くあります。
            </li>
            <li>
              <span className="font-bold text-sumi">顔立ちそのものを変えようとすること。</span>
              第一印象で見られているのは、骨格より手入れで動く部分です。順番としては、あとになります。
            </li>
            <li>
              <span className="font-bold text-sumi">気になっていないものに手をつけること。</span>
              体毛も、メイクも、そのままで構いません。減らすことが上位互換ではありません。
            </li>
            <li>
              <span className="font-bold text-sumi">記録を残す前に、お金を使うこと。</span>
              比べる基準がないと、効いたかどうかを判断できません。0円でできることが先です。
            </li>
          </ul>
        </section>

        <CheckCta from="order" className="mt-14" />

        {/* 収録漏れを自分で申告する */}
        {missing.length > 0 && (
          <section className="mt-16 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
            <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
              この一本に収録していない記事
            </h2>
            <p className="mt-3 text-[14px] leading-[1.9] text-keshizumi">
              「全部の順番」と書いている以上、漏れているものは出しておきます。
              新しく公開した記事が、まだこの線の上に置けていないものです。
            </p>
            <ul className="mt-4 space-y-2">
              {missing.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/areas/${a.areaId}/${a.slug}`}
                    className="text-[14.5px] leading-[1.8] text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
          <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            この記事が答えていないこと
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14.5px] leading-[1.95] text-keshizumi">
            <li>どのくらいで変わるか。個人差が大きく、こちらでは言えません。</li>
            <li>この順番が、あなたにとっても最短かどうか。順番は一般論で、条件が変われば前後します。</li>
            <li>医療が必要かどうか。それは医師が判断する領域です。</li>
            <li>実際にいくらかかるか。費用は目安の幅で書いており、実額の調査はまだしていません。</li>
          </ul>
        </section>

        <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
          ※ 本記事は、当サイトの記事{clusters.length}本を順番の観点から整理したものです。
          効果を保証するものではなく、診断・治療・受診勧奨を目的としたものでもありません。
          個別の判断は専門家にご相談ください。
        </p>

        <ShareRow url={url} title="男の改善、全部の順番。" label="人に送る" />
      </article>
    </div>
  );
}
