import type { Metadata } from "next";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import { getAllTerritories } from "@/lib/territories";
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
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />

      <header className="mb-16 max-w-reading">
        <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
          原因を読む
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          その悩みは、なぜ起こるのか。6 つの領域それぞれのメカニズムを、
          原因から整理しました。対処を急ぐ前に、まず仕組みを知るための場所です。
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
        {territories.map((t) => (
          <Link
            key={t.slug}
            href={`/territories/${t.slug}`}
            className="group block bg-paper border border-hair-line hover:border-gold transition-colors overflow-hidden"
          >
            <TerritoryArt slug={t.slug} aspectClass="aspect-[16/10]" />
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-ink transition-colors">
                {t.title}
              </h2>
              <p className="mt-3 font-mincho text-sm text-sub-gray leading-[1.9]">
                {t.subtitle}
              </p>
              <p className="mt-4 text-[13px] text-sub-gray leading-[1.9] line-clamp-3">
                {t.intro}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

