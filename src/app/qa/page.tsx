import type { Metadata } from "next";
import Link from "next/link";
import { getAllQA } from "@/lib/qa";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Q&A — 静かな問いと、観察",
  description:
    "編集者に届いた問いを、匿名化のうえ公開アーカイブに置く場所。多汗症・ワキガ・ニキビ跡・薄毛・体毛・顔・自意識——人に言えない悩みの、当事者の観察。診断ではなく、半歩先からの記録。",
  alternates: { canonical: `${site.url}/qa` },
  openGraph: {
    title: `Recovery Q&A — ${site.name}`,
    description: "人に言えない問いと、当事者の観察。",
    url: `${site.url}/qa`,
  },
};

export default function QAIndexPage() {
  const items = getAllQA();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/qa#collection`,
    name: `Recovery Q&A — ${site.name}`,
    description: "編集者に届いた問いの、匿名アーカイブ。",
    url: `${site.url}/qa`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((q, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/qa/${q.slug}`,
        name: q.question,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />

      <header className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Q&A
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          静かな問いと、観察。
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05] max-w-[34rem]">
          編集者に届いた問いを、匿名化のうえ、ここに置いていく場所です。
          答えは断定ではなく、当事者の観察として記しています。
        </p>
        <p className="mt-5 font-mincho text-[13px] text-sub-gray leading-[2]">
          ※ 個別の症状や治療の判断は、医療機関にご相談ください。
        </p>
      </header>

      {items.length === 0 ? (
        <section className="border border-hair-line bg-paper p-8">
          <p className="font-mincho text-[15px] text-ink leading-[2.05]">
            最初の問いが、まだ届いていません。
          </p>
        </section>
      ) : (
        <ul className="border-t border-hair-line">
          {items.map((q) => (
            <li key={q.slug} className="border-b border-hair-line">
              <Link
                href={`/qa/${q.slug}`}
                className="group block py-7 sm:py-8 hover:bg-paper/40 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                    {TERRITORY_LABEL[q.territory] ?? q.territory}
                  </p>
                  <p className="text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
                    {q.publishedAt}
                  </p>
                </div>
                <h2 className="mt-3 font-mincho text-lg sm:text-xl text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  <span className="text-gold mr-2">Q.</span>
                  {q.question}
                </h2>
                {q.asker?.context && (
                  <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[1.95]">
                    — {q.asker.context}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-16 pt-10 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          A Next Half-Step
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05] max-w-[34rem]">
          自分の問いを置きたい方は、Recovery Check に静かに答えてください。
          編集者が読み、24 時間以内に手紙でお返事します。
        </p>
        <div className="mt-5">
          <Link
            href="/check"
            className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
          >
            Recovery Check を始める →
          </Link>
        </div>
      </section>
    </div>
  );
}
