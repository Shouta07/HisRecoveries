import type { Metadata } from "next";
import Link from "next/link";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllRecoveries } from "@/lib/recoveries";
import { complexByTerritory } from "@/lib/complexes";
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
    <div className="bg-[#FAF6F0] text-zinc-900">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 pt-14 sm:pt-20 pb-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />

        <header className="mb-12 max-w-[40rem]">
          <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
            Voices
          </p>
          <h1 className="mt-3 text-[2.2rem] sm:text-[3.2rem] font-extrabold leading-[1.25] tracking-[-0.01em] text-zinc-900">
            現場の人の、リアルな声。
          </h1>
          <p className="mt-5 text-[15px] text-zinc-500 leading-[1.95]">
            第一線で働く人たちが、悩みとどう過ごし、何を選び、いまどこにいるのか。
            匿名化のうえ、本人の同意で公開する、飾らない一人称の記録です。
          </p>
        </header>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-[15px] text-zinc-600 leading-[2]">
              最初の記録が、まだ届いていません。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((r) => {
              const c = complexByTerritory(r.territory);
              const accent = c?.accent ?? "#71717a";
              const soft = c?.accentSoft ?? "#f4f4f5";
              return (
                <Link
                  key={r.slug}
                  href={`/recoveries/${r.slug}`}
                  className="group flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2.5 text-[12px]">
                    <span
                      className="rounded-full px-3 py-1 font-bold"
                      style={{ backgroundColor: soft, color: accent }}
                    >
                      {c?.ja ?? r.territory}
                    </span>
                    {r.span && (
                      <span className="text-zinc-400">{r.span}の記録</span>
                    )}
                  </div>
                  <h2 className="mt-5 text-[1.15rem] sm:text-[1.25rem] font-bold leading-[1.55] text-zinc-900 group-hover:text-zinc-600 transition-colors flex-1">
                    {r.title}
                  </h2>
                  {r.asker?.context && (
                    <p className="mt-5 pt-4 border-t border-zinc-100 text-[12.5px] text-zinc-500 leading-[1.8]">
                      {r.asker.ageRange ? `${r.asker.ageRange}・` : ""}
                      {r.asker.context}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </div>

      <NextStepBlock
        body="自分の状態を観察したい方は Recovery Check へ。あなたの「その後」を共有したい方は、記録を投稿できます。"
        tertiary={{ href: "/interview", label: "インタビューを受ける" }}
      />
    </div>
  );
}
