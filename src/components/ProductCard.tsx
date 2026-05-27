import AffiliateLink from "./AffiliateLink";
import { ProductFrontmatter } from "@/lib/products";

type Props = { product: ProductFrontmatter };

/**
 * A single product on the shelf. Shows a clear 広告 label (ステマ規制対応),
 * an honest one-line note, and one button per registered ASP.
 */
export default function ProductCard({ product }: Props) {
  const { links } = product;
  return (
    <article className="bg-paper border border-hair-line p-6 sm:p-7 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-sub-gray tracking-[0.08em]">
          {product.productType}
        </p>
        <span className="text-[10px] tracking-[0.1em] text-sub-gray border border-hair-line px-1.5 py-0.5">
          広告
        </span>
      </div>

      <h3 className="mt-3 text-base sm:text-lg font-bold leading-[1.55] text-ink">
        {product.title}
      </h3>

      <p className="mt-3 text-sm leading-[1.9] text-ink/80">
        {product.excerpt}
      </p>

      {product.note && (
        <p className="mt-3 font-mincho text-[13px] leading-[1.95] text-sub-gray border-l-2 border-hair-line pl-3">
          {product.note}
        </p>
      )}

      <div className="mt-auto pt-5">
        {product.priceRange && (
          <p className="text-[11px] text-sub-gray tracking-[0.04em] mb-3">
            参考価格 {product.priceRange}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {links.amazon && (
            <AffiliateLink
              href={links.amazon}
              product={product.slug}
              provider="amazon"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-navy border border-navy/30 hover:border-navy hover:bg-navy hover:text-white px-3 py-2 transition-colors"
            >
              Amazon
            </AffiliateLink>
          )}
          {links.rakuten && (
            <AffiliateLink
              href={links.rakuten}
              product={product.slug}
              provider="rakuten"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-navy border border-navy/30 hover:border-navy hover:bg-navy hover:text-white px-3 py-2 transition-colors"
            >
              楽天
            </AffiliateLink>
          )}
          {links.asp && (
            <AffiliateLink
              href={links.asp}
              product={product.slug}
              provider="asp"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-navy border border-navy/30 hover:border-navy hover:bg-navy hover:text-white px-3 py-2 transition-colors"
            >
              公式・その他
            </AffiliateLink>
          )}
        </div>
      </div>
    </article>
  );
}
