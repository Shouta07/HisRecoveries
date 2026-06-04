import type { Metadata } from "next";
import Link from "next/link";
import { getAllConcerns } from "@/lib/concerns";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Concerns — 悩み票",
  description:
    "His Recoveries の Concerns は、男性が人に言いにくい悩みを「悩み票」として一つずつ立てた台帳です。汗・におい、肌、顔、髪、髭、心と余白の領域に並ぶ、当事者の声と記録と選択肢の集積。",
  alternates: { canonical: `${site.url}/concerns` },
  openGraph: {
    title: `Concerns — ${site.name}`,
    description:
      "His Recoveries の悩み票。男性の言いにくい悩みを、ひとつずつ起票したアーカイブ。",
    url: `${site.url}/concerns`,
  },
};

export const dynamic = "force-static";

export default function ConcernsIndexPage() {
  const concerns = getAllConcerns();
  const territories = getAllTerritories();

  const byTerritory = territories
    .map((t) => ({
      territory: t,
      items: concerns.filter((c) => c.territory === t.slug),
    }))
    .filter((g) => g.items.length > 0);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/concerns#collection`,
    name: "Concerns — 悩み票",
    description:
      "男性が人に言いにくい悩みを、ひとつずつ「悩み票」として立てた His Recoveries の台帳。",
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    hasPart: concerns.map((c) => ({
      "@type": "Thing",
      name: c.title,
      identifier: `concern-${c.ticketId}`,
      url: `${site.url}/concerns/${c.slug}`,
      description: c.excerpt,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Concerns",
        item: `${site.url}/concerns`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-14 sm:mb-20 max-w-[40rem]">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Concerns
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          悩み票
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2]">
          His Recoveries は、ひとつの悩みごとに「場所」を持っています。
          そこには、当事者の声と、記録と、選択肢の地形図があります。
        </p>
        <p className="mt-5 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
          {concerns.length} 票が立っています。
        </p>
      </header>

      <div className="space-y-16 sm:space-y-20">
        {byTerritory.map((g) => (
          <section key={g.territory.slug} aria-label={g.territory.title}>
            <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-hair-line pb-3">
              <h2 className="font-mincho text-lg sm:text-xl text-ink">
                {g.territory.title}
              </h2>
              <Link
                href={`/territories/${g.territory.slug}`}
                className="text-[11px] tracking-[0.08em] text-sub-gray hover:text-gold transition-colors"
              >
                章を見る →
              </Link>
            </header>

            <ol className="space-y-0">
              {g.items.map((c) => (
                <li key={c.slug} className="border-b border-hair-line">
                  <Link
                    href={`/concerns/${c.slug}`}
                    className="group grid grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_auto] items-baseline gap-4 sm:gap-8 py-5 sm:py-6 hover:bg-paper/60 transition-colors px-2 sm:px-3"
                  >
                    <span className="logo-type italic text-[12px] sm:text-sm tracking-[0.18em] text-gold">
                      #{c.ticketId}
                    </span>
                    <div>
                      <h3 className="font-mincho text-base sm:text-lg text-ink group-hover:text-gold transition-colors leading-[1.55]">
                        {c.title}
                      </h3>
                      {c.excerpt && (
                        <p className="mt-2 text-[12.5px] sm:text-[13px] text-sub-gray leading-[1.95] line-clamp-2 max-w-[36rem]">
                          {c.excerpt}
                        </p>
                      )}
                    </div>
                    <span
                      aria-hidden
                      className="text-sub-gray group-hover:text-ink transition-colors text-lg"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
