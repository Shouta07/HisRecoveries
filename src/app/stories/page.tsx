import type { Metadata } from "next";
import Link from "next/link";
import { getAllStories } from "@/lib/stories";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Stories — 回復の記録",
  description:
    "Recovery Stories — 多汗症・ワキガ・ニキビ跡・薄毛・顔の印象・自意識。人に言いづらい男性のコンプレックスと向き合った当事者の、その後の記録。匿名化のうえ、本人同意で公開しています。",
  alternates: { canonical: `${site.url}/stories` },
  openGraph: {
    title: `Recovery Stories — ${site.name}`,
    description: "回復の記録は、誰かの希望になる。",
    url: `${site.url}/stories`,
  },
};

export default function StoriesPage() {
  const items = getAllStories();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/stories#collection`,
    name: `Recovery Stories — ${site.name}`,
    description: "当事者の、その後の記録（改善事例）。",
    url: `${site.url}/stories`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/stories/${s.slug}`,
        name: s.title,
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
          Recovery Stories
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          回復の記録は、
          <br />
          誰かの希望になる。
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
          編集者に届いた「その後」の便りを、匿名化のうえで置いておく場所です。
          完了形ではなく、半歩進んだ時間の記録として。
        </p>
        <p className="mt-5 font-mincho text-[13px] text-sub-gray leading-[2]">
          ※ 個別の症状や治療の判断は、医療機関にご相談ください。
        </p>
      </header>

      {items.length === 0 ? (
        <section className="border border-hair-line bg-paper p-8">
          <p className="font-mincho text-[15px] text-ink leading-[2.05]">
            最初の記録が、まだ届いていません。
          </p>
        </section>
      ) : (
        <ul className="border-t border-hair-line">
          {items.map((s) => (
            <li key={s.slug} className="border-b border-hair-line">
              <Link
                href={`/stories/${s.slug}`}
                className="group block py-7 sm:py-8 hover:bg-paper/40 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                    {TERRITORY_LABEL[s.territory] ?? s.territory}
                    {s.span ? ` · ${s.span}` : ""}
                  </p>
                  <p className="text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
                    {s.publishedAt}
                  </p>
                </div>
                <h2 className="mt-3 font-mincho text-lg sm:text-xl text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  {s.title}
                </h2>
                {s.asker?.context && (
                  <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[1.95]">
                    — {s.asker.context}
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
          あなたの「その後」を書いて送りたい方は、
          <Link href="/submit-story" className="border-b border-gold/60 hover:text-gold transition-colors mx-1">
            体験を共有する
          </Link>
          ページから、断片でも構いません。匿名で受け付けています。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/submit-story"
            className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
          >
            体験を共有する →
          </Link>
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
