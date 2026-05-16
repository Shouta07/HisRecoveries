import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import {
  getAllTerritorySlugs,
  getTerritory,
} from "@/lib/territories";
import { getAllArticles } from "@/lib/articles";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllTerritorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const t = await getTerritory(params.slug);
  if (!t) return {};
  const url = `${site.url}/territories/${t.slug}`;
  return {
    title: `${t.title} — 地形図`,
    description: t.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${t.title} — 地形図`,
      description: t.intro,
      url,
    },
  };
}

export default async function TerritoryPage({
  params,
}: {
  params: Params;
}) {
  const t = await getTerritory(params.slug);
  if (!t) notFound();

  const url = `${site.url}/territories/${t.slug}`;

  // Related records: articles whose category is in this territory's categories
  const allArticles = getAllArticles();
  const relatedArticles = allArticles.filter((a) =>
    t.categories.includes(a.category)
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "地形図",
        item: `${site.url}/territories`,
      },
      { "@type": "ListItem", position: 3, name: t.title, item: url },
    ],
  };

  const exitMap: Record<typeof t.relatedExit, { href: string; label: string }> =
    {
      events: { href: "/events", label: "次の静かな集まり" },
      letters: { href: "/letters", label: "書きたくなったら、ここに" },
      subscribe: { href: "/subscribe", label: "ときどきの便り" },
      territory: { href: "/territories", label: "ほかの地形図を見る" },
    };
  const exit = exitMap[t.relatedExit];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-navy transition-colors uppercase"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link
                href="/territories"
                className="hover:text-navy transition-colors"
              >
                地形図
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
              {t.title}の地形図
            </h1>
            <p className="mt-6 font-mincho text-sub-gray text-base sm:text-lg leading-[2]">
              — {t.subtitle} —
            </p>
            <p className="mt-8 text-[1rem] leading-[2.1] text-ink max-w-[34rem]">
              {t.intro}
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <TerritoryArt slug={t.slug} aspectClass="aspect-[4/3]" />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        <div className="bg-paper border border-hair-line p-6 sm:p-10 lg:p-14 order-2 lg:order-1">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: t.contentHtml }}
          />

          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-10 border-t border-hair-line">
              <h2 className="text-base font-bold mb-4">この領域の記録</h2>
              <ul className="space-y-3">
                {relatedArticles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-sm text-navy border-b border-gold hover:text-gold transition-colors"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-hair-line text-sm">
            <Link
              href={exit.href}
              className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              → {exit.label}
            </Link>
          </div>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="bg-paper border border-hair-line p-5 sm:p-6 lg:sticky lg:top-8">
            <p className="text-xs text-sub-gray mb-3">このページの目次</p>
            <ol className="space-y-2 text-sm">
              <TocItem>I. The Landscape</TocItem>
              <TocItem>II. Variations</TocItem>
              <TocItem>III. The Map of Options</TocItem>
              <TocItem>IV. Before Choosing</TocItem>
              <TocItem>V. Quiet Observations</TocItem>
              <TocItem>VI. Quiet Gatherings</TocItem>
              <TocItem>VII. Related Records</TocItem>
            </ol>
          </div>
        </aside>
      </section>
    </article>
  );
}

function TocItem({ children }: { children: React.ReactNode }) {
  return <li className="text-ink/80">{children}</li>;
}
