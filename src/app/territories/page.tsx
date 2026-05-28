import type { Metadata } from "next";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chapters — 地形図",
  description:
    "His Recoveries が扱う 6 領域の地形図 — 汗・におい（多汗症・ワキガ）、肌・ニキビ、顔の印象、心と自意識、薄毛・AGA、髭・体毛。Male Conditioning の章として、男性のコンプレックスの選択肢を推奨ではなく「層」として並べておく場所。",
  alternates: { canonical: `${site.url}/territories` },
  openGraph: {
    title: `Chapters — ${site.name}`,
    description:
      "Male Conditioning の 6 領域。男性のコンプレックスを、地形のように見渡す。",
  },
};

export default function TerritoriesPage() {
  const territories = getAllTerritories();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/territories#collection`,
    name: `地形図 — ${site.name}`,
    description: "6 領域の地形図。",
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
          地形図
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          6 つの領域それぞれを、推奨ではなく「層」として見渡すための地図。
          急がず、選ばず、まずは地形を眺めるための場所です。
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
              <h2 className="text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
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

