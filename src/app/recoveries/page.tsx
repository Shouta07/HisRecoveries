import type { Metadata } from "next";
import Link from "next/link";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllRecoveries } from "@/lib/recoveries";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recoveries — 人生を前進させた男性たちの実例集",
  description:
    "His Recoveries の中核アーカイブ。多汗症・ワキガ・ニキビ跡・薄毛・体毛・顔の印象・睡眠・自意識・キャリア・恋愛。半歩進んだ男性の、悩み・行動・変化・現在の記録。匿名化のうえ、本人同意で公開。",
  alternates: { canonical: `${site.url}/recoveries` },
  openGraph: {
    title: `Recoveries — ${site.name}`,
    description: "人生を前進させた男性たちの実例集。",
    url: `${site.url}/recoveries`,
  },
};

export default function RecoveriesIndexPage() {
  const items = getAllRecoveries();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/recoveries#collection`,
    name: `Recoveries — ${site.name}`,
    description: "人生を前進させた男性たちの実例集。",
    url: `${site.url}/recoveries`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/recoveries/${r.slug}`,
        name: r.title,
      })),
    },
  };

  return (
    <>
      <div className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />

        <header className="mb-14 sm:mb-20">
          <h1 className="font-mincho text-3xl sm:text-5xl text-ink leading-[1.3] tracking-[0.01em]">
            前に進んだ男性たちの、記録。
          </h1>
          <p className="mt-7 font-mincho text-[14.5px] sm:text-[15.5px] text-ink/80 leading-[2.05] max-w-[34rem]">
            悩み・行動・支援者・変化・現在を、当事者の言葉で残しています。
            匿名化のうえ、本人の同意で公開。半歩進んだ時間の記録として。
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
            {items.map((r) => (
              <li key={r.slug} className="border-b border-hair-line">
                <Link
                  href={`/recoveries/${r.slug}`}
                  className="group block py-7 sm:py-8 hover:bg-paper/40 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                      {TERRITORY_LABEL[r.territory] ?? r.territory}
                      {r.span ? ` · ${r.span}` : ""}
                    </p>
                    <p className="text-[11px] tracking-[0.06em] text-sub-gray tabular-nums">
                      {r.publishedAt}
                    </p>
                  </div>
                  <h2 className="mt-3 font-mincho text-lg sm:text-xl text-ink leading-[1.55] group-hover:text-gold transition-colors">
                    {r.title}
                  </h2>
                  {r.asker?.context && (
                    <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[1.95]">
                      — {r.asker.context}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
      </div>

      <NextStepBlock
        body="自分の状態を観察したい方は Recovery Check へ。あなたの「その後」を共有したい方は、記録を投稿できます。"
        tertiary={{ href: "/interview", label: "インタビューを受ける" }}
      />
    </>
  );
}
