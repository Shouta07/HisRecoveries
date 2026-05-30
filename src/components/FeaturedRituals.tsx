import Link from "next/link";
import AffiliateLink from "./AffiliateLink";
import SectionLabel from "./SectionLabel";
import type { ProductFrontmatter } from "@/lib/products";

type Props = {
  products: ProductFrontmatter[];
  numberLabel: string;
};

/**
 * Home Scene III — Featured Rituals.
 * Replaces the old "Featured Recovery Experience" event slot with the
 * actual affiliate exit, presented as an editorial pair (or single) of
 * cards. Each card is dressed as a typographic composition rather than
 * a product tile — keeping the Aman / Otonami register but making the
 * shelf discoverable above the fold.
 */
export default function FeaturedRituals({ products, numberLabel }: Props) {
  if (products.length === 0) return null;
  const featured = products.slice(0, 2);

  return (
    <section
      aria-labelledby="featured-rituals"
      className="bg-paper/40 border-b border-hair-line"
    >
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-32">
        <SectionLabel
          en="Featured Rituals"
          ja="今月の道具"
          number={numberLabel}
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
          {featured.map((p) => (
            <FeaturedRitualCard key={p.slug} product={p} />
          ))}
        </div>

        <div className="mt-12 sm:mt-14 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/shelf"
            className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
          >
            棚をすべて見る
            <span aria-hidden> →</span>
          </Link>
          <Link
            href="/disclosure"
            className="text-[11px] tracking-[0.06em] text-sub-gray hover:text-ink transition-colors"
          >
            広告・アフィリエイト方針
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedRitualCard({ product }: { product: ProductFrontmatter }) {
  const { links } = product;
  const primaryHref = links.asp || links.rakuten || links.amazon;
  const primaryProvider = links.asp ? "asp" : links.rakuten ? "rakuten" : "amazon";
  const primaryLabel =
    primaryProvider === "asp"
      ? product.ctaLabel ?? "詳しく見る"
      : primaryProvider === "rakuten"
        ? "楽天で見る"
        : "Amazon で見る";

  return (
    <article className="bg-paper border border-hair-line p-8 sm:p-10 flex flex-col card-lift">
      <div className="flex items-center justify-between">
        <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
          {product.productType}
        </p>
        <span className="text-[10px] tracking-[0.1em] text-sub-gray border border-hair-line px-1.5 py-0.5">
          広告
        </span>
      </div>

      {product.provider && (
        <p className="mt-5 text-[12px] tracking-[0.08em] text-gold-bright">
          {product.provider}
        </p>
      )}

      <h3 className="mt-2 font-mincho text-xl sm:text-2xl leading-[1.5] text-ink">
        {product.title}
      </h3>

      <p className="mt-5 font-mincho text-[14px] sm:text-[15px] leading-[2] text-ink/80">
        {product.excerpt}
      </p>

      {product.note && (
        <p className="mt-4 font-mincho text-[12px] leading-[1.95] text-sub-gray border-l border-hair-line pl-3">
          {product.note}
        </p>
      )}

      <div className="mt-auto pt-8">
        {product.priceLabel && (
          <p className="text-[11px] text-sub-gray tracking-[0.04em] mb-4">
            {product.priceLabel}
          </p>
        )}

        {primaryHref && (
          <AffiliateLink
            href={primaryHref}
            product={product.slug}
            provider={primaryProvider}
            territory={product.territory}
            className="btn-gold !py-3 !px-6 text-xs w-full justify-center"
          >
            {primaryLabel}
            <span aria-hidden>→</span>
          </AffiliateLink>
        )}
      </div>
    </article>
  );
}
