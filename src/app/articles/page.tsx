import type { Metadata } from "next";
import ArticleResults from "@/components/ArticleResults";
import ArticleList from "@/components/ArticleList";
import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

// 全記事の索引。
//
// もとはトップのいちばん下（/#index）にあった。
// トップが /app の入口になったので、面ごとここへ移した。
//
// 移さずに消すことはできなかった。#index を指していたものが7箇所あり、
// そのうち1つは検索シートの遷移先で、消すとサイト内検索が
// どこにも着地しなくなる（/?q=…#index → 存在しないアンカー）。
//
// 記事も、絞り込みの仕組みも、1つも減らしていない。
// 変わったのはURLだけで、/#index を指していたものは全部ここへ向け直した。

export const metadata: Metadata = {
  title: "記事をさがす — His Recoveries",
  description: `男性の美容・健康・関係についての記事 全${clusters.length}本。分野・状況・年代からさがせます。`,
  alternates: { canonical: `${site.url}/articles` },
};

export default function ArticlesPage() {
  // トップから外した索引の構造化データは、この面が引き継ぐ。
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/articles#collection`,
    url: `${site.url}/articles`,
    name: "記事をさがす",
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    about: complexes.map((c) => ({ "@type": "Thing", name: c.ja })),
    mainEntity: {
      "@type": "ItemList",
      name: "記事の索引",
      numberOfItems: clusters.length,
      itemListElement: clusters.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <div className="bg-shironeri pb-24 text-sumi">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <ArticleResults list={<ArticleList />} />
    </div>
  );
}
