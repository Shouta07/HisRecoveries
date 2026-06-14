import type { Metadata } from "next";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Causes — Why it happens",
  description:
    "Why do men's complexes happen? Hyperhidrosis and body odor, acne and scars, hair loss (AGA), beard and body hair, facial impression (looking older), sleep, fatigue and self-consciousness — the mechanism of six areas, explained from the cause.",
  alternates: {
    canonical: `${site.url}/en/territories`,
    languages: {
      ja: `${site.url}/territories`,
      en: `${site.url}/en/territories`,
      "x-default": `${site.url}/territories`,
    },
  },
  openGraph: {
    locale: "en_US",
    title: `Causes — ${site.name}`,
    description: "Why do men's complexes happen? Six areas, explained from the cause.",
  },
};

export default function EnTerritoriesPage() {
  const territories = getAllTerritories("en");

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/en/territories#collection`,
    name: `Causes — ${site.name}`,
    description: "The causes and mechanisms of six areas of male complexes.",
    url: `${site.url}/en/territories`,
    inLanguage: "en",
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: territories.length,
      itemListElement: territories.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/en/territories/${t.slug}`,
        name: t.title,
      })),
    },
  };

  return (
    <div lang="en" className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />

      <header className="mb-16 max-w-reading">
        <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
          Causes
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          Why does it happen? We organized the mechanism of six areas from the
          cause. A place to understand the workings before rushing to a response.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
        {territories.map((t) => (
          <Link
            key={t.slug}
            href={`/en/territories/${t.slug}`}
            className="group block bg-paper border border-hair-line hover:border-gold transition-colors overflow-hidden"
          >
            <TerritoryArt slug={t.slug} aspectClass="aspect-[16/10]" />
            <div className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold leading-[1.55] text-ink">
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
