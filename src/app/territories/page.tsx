import type { Metadata } from "next";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import { getAllTerritories } from "@/lib/territories";
import { complexByTerritory } from "@/lib/complexes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "原因を読む — なぜ起こるのか",
  description:
    "男性のコンプレックスは、なぜ起こるのか。多汗症・ワキガ、ニキビとニキビ跡、薄毛・AGA、髭と体毛、顔の印象（老け見え）、睡眠・疲労と自意識。6 つの領域それぞれのメカニズムを、原因から整理して解説します。",
  alternates: { canonical: `${site.url}/territories` },
  openGraph: {
    title: `原因を読む — ${site.name}`,
    description:
      "男性のコンプレックスは、なぜ起こるのか。6 領域のメカニズムを、原因から整理する。",
  },
};

export default function TerritoriesPage() {
  const territories = getAllTerritories();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/territories#collection`,
    name: `原因を読む — ${site.name}`,
    description: "男性のコンプレックス 6 領域の原因とメカニズム。",
    url: `${site.url}/territories`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: territories.length,
      itemListElement: territories.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/territories/${t.slug}`,
        name: t.title,
      })),
    },
  };

  return (
    <div className="bg-[#FAF6F0] text-zinc-900">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 pt-14 sm:pt-20 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />

        <header className="mb-12 max-w-[40rem]">
          <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
            The Six
          </p>
          <h1 className="mt-3 text-[2.2rem] sm:text-[3.2rem] font-extrabold leading-[1.25] tracking-[-0.01em] text-zinc-900">
            悩み別に、仕組みから。
          </h1>
          <p className="mt-5 text-[15px] text-zinc-500 leading-[1.95]">
            その悩みは、なぜ起こるのか。6 つの悩みそれぞれのメカニズムを、
            原因から整理しました。対処を急ぐ前に、まず仕組みを知るための入口です。
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {territories.map((t) => {
            const c = complexByTerritory(t.slug);
            const accent = c?.accent ?? "#18181b";
            const soft = c?.accentSoft ?? "#f4f4f5";
            return (
              <Link
                key={t.slug}
                href={`/territories/${t.slug}`}
                className="group flex flex-col rounded-3xl bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div className="relative">
                  <TerritoryArt slug={t.slug} aspectClass="aspect-[16/10]" />
                  {c && (
                    <span
                      className="absolute top-3 left-3 rounded-full px-3 py-1 text-[11.5px] font-bold"
                      style={{ backgroundColor: soft, color: accent }}
                    >
                      {c.stat}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-[1.35rem] font-extrabold leading-[1.4] text-zinc-900">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-[13.5px] font-medium text-zinc-500 leading-[1.7]">
                    {t.subtitle}
                  </p>
                  <p className="mt-3 text-[13px] text-zinc-500 leading-[1.9] line-clamp-3 flex-1">
                    {t.intro}
                  </p>
                  <span
                    className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold group-hover:gap-2.5 transition-all"
                    style={{ color: accent }}
                  >
                    なぜ起きる？を読む <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

