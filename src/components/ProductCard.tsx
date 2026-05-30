import AffiliateLink from "./AffiliateLink";
import { ProductFrontmatter } from "@/lib/products";

type Props = { product: ProductFrontmatter };

const btn =
  "inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-ink border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream px-3 py-2 transition-colors";

/**
 * A single entry on the shelf. Renders differently by kind:
 *  - product  → reference price + Amazon / 楽天 / その他 buttons
 *  - service  → provider + highlights + a single prominent CTA
 * Always shows a 広告 label for ステマ規制対応.
 */
export default function ProductCard({ product }: Props) {
  const { links, kind } = product;
  const primaryHref = links.asp || links.amazon || links.rakuten;

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

      {product.provider && (
        <p className="mt-3 text-[11px] text-gold tracking-[0.06em]">
          {product.provider}
        </p>
      )}

      <h3 className="mt-1.5 text-base sm:text-lg font-bold leading-[1.55] text-ink">
        {product.title}
      </h3>

      <p className="mt-3 text-sm leading-[1.9] text-ink/80">
        {product.excerpt}
      </p>

      {product.highlights && product.highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {product.highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[13px] leading-[1.7] text-ink/80"
            >
              <span aria-hidden className="text-gold mt-0.5">
                —
              </span>
              {h}
            </li>
          ))}
        </ul>
      )}

      {product.note && (
        <p className="mt-3 font-mincho text-[13px] leading-[1.95] text-sub-gray border-l-2 border-hair-line pl-3">
          {product.note}
        </p>
      )}

      <div className="mt-auto pt-5">
        {product.priceLabel && (
          <p className="text-[11px] text-sub-gray tracking-[0.04em] mb-3">
            {product.priceLabel}
          </p>
        )}

        {kind === "service" ? (
          primaryHref && (
            <AffiliateLink
              href={primaryHref}
              product={product.slug}
              provider={links.asp ? "asp" : links.amazon ? "amazon" : "rakuten"}
              territory={product.territory}
              className="btn-gold !py-3 !px-6 text-xs w-full justify-center"
            >
              {product.ctaLabel ?? "詳しく見る"}
              <span aria-hidden>→</span>
            </AffiliateLink>
          )
        ) : (
          <div className="flex flex-wrap gap-2">
            {links.amazon && (
              <AffiliateLink
                href={links.amazon}
                product={product.slug}
                provider="amazon"
                territory={product.territory}
                className={btn}
              >
                Amazon
              </AffiliateLink>
            )}
            {links.rakuten && (
              <AffiliateLink
                href={links.rakuten}
                product={product.slug}
                provider="rakuten"
                territory={product.territory}
                className={btn}
              >
                楽天
              </AffiliateLink>
            )}
            {links.asp && (
              <AffiliateLink
                href={links.asp}
                product={product.slug}
                provider="asp"
                territory={product.territory}
                className={btn}
              >
                公式・その他
              </AffiliateLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
