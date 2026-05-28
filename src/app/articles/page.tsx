import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { categories, site } from "@/lib/site";

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
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <header className="mb-16">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Articles — All Records
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          すべての記録
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[32rem]">
          過去の事実、今の状態、自意識の残り方を、
          新しいものから順に並べています。
        </p>
      </header>

      <nav aria-label="categories" className="mb-12">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-sub-gray">
          <li>
            <Link href="/articles" className="text-ink underline-offset-4">
              すべて
            </Link>
          </li>
          {Object.entries(categories).map(([slug, c]) => (
            <li key={slug}>
              <Link
                href={`/articles/category/${slug}`}
                className="hover:text-ink transition-colors"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {articles.length === 0 ? (
        <p className="font-mincho text-sm text-sub-gray leading-[2]">
          記事はまもなく公開されます。
          <br />
          最初の数本は、いま静かに書かれているところです。
        </p>
      ) : (
        <div>
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
