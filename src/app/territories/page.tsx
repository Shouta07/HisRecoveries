import type { Metadata } from "next";
import Link from "next/link";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "地形図",
  description:
    "6 領域それぞれの地形図。選択肢を、推奨ではなく層として並べておく場所。",
  alternates: { canonical: `${site.url}/territories` },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
        {territories.map((t, i) => (
          <Link
            key={t.slug}
            href={`/territories/${t.slug}`}
            className="group block bg-paper border border-hair-line p-7 sm:p-9 hover:border-gold transition-colors"
          >
            <p className="logo-type text-sm text-gold tracking-widest">
              {romanize(i + 1)}.
            </p>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
              {t.title}
            </h2>
            <p className="mt-3 font-mincho text-sm text-sub-gray leading-[1.9]">
              {t.subtitle}
            </p>
            <p className="mt-4 text-[13px] text-sub-gray leading-[1.9] line-clamp-3">
              {t.intro}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function romanize(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][n - 1] ?? `${n}`;
}
