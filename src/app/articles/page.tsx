import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { complexByCategory } from "@/lib/complexes";
import { categories, categoryLabel, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Presence Journal — すべての記録",
  description:
    "His Recoveries に蓄積された、男性のコンプレックスに関する当事者の記録。多汗症、ワキガ、ニキビ・ニキビ跡、顔の印象、薄毛・AGA、髭・体毛、そして自意識についての一人称・過去形のエッセイ。Male Conditioning のための Presence Journal。",
  alternates: { canonical: `${site.url}/articles` },
  openGraph: {
    title: `Presence Journal — ${site.name}`,
    description:
      "男性のコンプレックスを、当事者の声で記録する Presence Journal。",
  },
};

export default function ArticlesPage() {
  const articles = getAllArticles();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/articles#collection`,
    name: `Articles — ${site.name}`,
    description: "His Recoveries のすべての記録。",
    url: `${site.url}/articles`,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: articles.length,
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/articles/${a.slug}`,
        name: a.title,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${site.url}/articles`,
      },
    ],
  };

  return (
    <div className="bg-[#FAF6F0] text-zinc-900">
      <div className="mx-auto max-w-[1180px] px-6 sm:px-10 pb-20 pt-14 sm:pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <header className="mb-10 max-w-[40rem]">
          <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
            Read deeper
          </p>
          <h1 className="mt-3 text-[2.2rem] sm:text-[3.2rem] font-extrabold leading-[1.25] tracking-[-0.01em] text-zinc-900">
            なぜ起きる？を、もっと深く。
          </h1>
          <p className="mt-5 text-[15px] text-zinc-500 leading-[1.95]">
            医学・行動科学のレイヤーから悩みの仕組みを分解する記事を、
            新しいものから順に並べています。
          </p>
        </header>

        <nav aria-label="categories" className="mb-10">
          <ul className="flex flex-wrap gap-2.5 text-[13px] font-medium">
            <li>
              <Link
                href="/articles"
                className="inline-flex rounded-full bg-zinc-900 text-white px-4 py-1.5"
              >
                すべて
              </Link>
            </li>
            {Object.entries(categories).map(([slug, c]) => (
              <li key={slug}>
                <Link
                  href={`/articles/category/${slug}`}
                  className="inline-flex rounded-full bg-white text-zinc-600 px-4 py-1.5 shadow-sm hover:text-zinc-900 transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {articles.length === 0 ? (
          <p className="text-[14px] text-zinc-500 leading-[2]">
            記事はまもなく公開されます。最初の数本は、いま静かに書かれているところです。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => {
              const c = complexByCategory(a.category);
              const accent = c?.accent ?? "#71717a";
              const soft = c?.accentSoft ?? "#f4f4f5";
              return (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-2.5 text-[12px] font-bold">
                    <span
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: soft, color: accent }}
                    >
                      {c?.ja ?? categoryLabel(a.category)}
                    </span>
                    <span className="text-zinc-400">{a.readingMinutes} 分</span>
                  </div>
                  <h2 className="mt-4 text-[1.2rem] sm:text-[1.3rem] font-bold leading-[1.5] text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="mt-3 text-[13px] text-zinc-500 leading-[1.9] line-clamp-3 flex-1">
                      {a.excerpt}
                    </p>
                  )}
                  <span
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold group-hover:gap-2.5 transition-all"
                    style={{ color: accent }}
                  >
                    読んでみる <span aria-hidden>→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
