import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SectionLabel from "@/components/SectionLabel";
import { getAllProducts } from "@/lib/products";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditioning Rituals — 整える道具",
  description:
    "Conditioning Rituals。整えるために使ってきた道具を、領域ごとに並べた正直な棚。メンズスキンケア、メンズ脱毛、AGA オンライン診療、多汗症ケア、ニキビケアなど、当事者が選択肢として並べる「広告」を含むセレクション。",
  alternates: { canonical: `${site.url}/shelf` },
  openGraph: {
    title: `Conditioning Rituals — ${site.name}`,
    description:
      "Male Conditioning のための、正直な棚。整える道具の選択肢を、煽らずに並べます。",
  },
};

export default function ShelfPage() {
  const products = getAllProducts();
  const territories = getAllTerritories();

  // Group products by territory, preserving territory order
  const grouped = territories
    .map((t) => ({
      territory: t,
      items: products.filter((p) => p.territory === t.slug),
    }))
    .filter((g) => g.items.length > 0);

  const ungrouped = products.filter(
    (p) => !territories.some((t) => t.slug === p.territory)
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-14 sm:pt-20 pb-24">
      <header className="text-center mb-12 sm:mb-16">
        <p className="font-mincho text-sub-gray text-xs sm:text-sm tracking-[0.3em]">
          整える道具
        </p>
        <h1 className="mt-4 logo-type text-4xl sm:text-6xl text-navy leading-[1]">
          The Shelf
        </h1>
        <p className="mt-7 text-sm sm:text-[0.9375rem] leading-[2] text-sub-gray max-w-[34rem] mx-auto">
          整えるために使ってきた道具を、領域ごとに並べています。
          効いたものも、合わなかったことも、できるだけ正直に。
        </p>
        <p className="mt-5 text-[12px] text-sub-gray leading-[1.9]">
          ※ 当ページのリンクには広告（アフィリエイト）を含みます。
          詳しくは{" "}
          <Link
            href="/disclosure"
            className="text-navy border-b border-gold hover:text-gold transition-colors"
          >
            広告・アフィリエイト方針
          </Link>
          。
        </p>
      </header>

      {products.length === 0 ? (
        <div className="bg-paper border border-hair-line p-8 sm:p-12 text-center">
          <p className="text-sm text-sub-gray leading-[2]">
            棚はまもなく公開されます。
            <br />
            正直に並べられる道具から、順番に。
          </p>
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-20">
          {grouped.map((g) => (
            <section key={g.territory.slug} aria-label={g.territory.title}>
              <SectionLabel en="For" ja={g.territory.title} />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {g.items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          ))}

          {ungrouped.length > 0 && (
            <section aria-label="その他">
              <SectionLabel en="Other" ja="その他" />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ungrouped.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
