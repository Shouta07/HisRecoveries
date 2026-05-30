"use client";

import { useRef, useState, useEffect } from "react";
import AffiliateLink from "./AffiliateLink";
import type { ProductFrontmatter } from "@/lib/products";

type Props = {
  products: ProductFrontmatter[];
};

/**
 * Aesop-style horizontal product showcase.
 *
 *  - Cards scroll horizontally with snap points (desktop arrow buttons +
 *    native swipe on mobile).
 *  - Each card stages the product on a tinted cream-deep panel with the
 *    title typeset as the editorial hero (we have no real product photos),
 *    then drops to a structured info block beneath.
 *  - Hover lifts the card and warms the panel; everything is keyboard +
 *    swipe accessible.
 */
export default function ProductShowcase({ products }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      const cardWidth = el.firstElementChild?.clientWidth ?? 1;
      const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
      const step = cardWidth + gap;
      const idx = Math.round(el.scrollLeft / step);
      setActive(idx);
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [products.length]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    el.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Arrow controls (desktop only) */}
      <button
        type="button"
        aria-label="前の商品"
        onClick={() => scrollByCards(-1)}
        disabled={!canPrev}
        className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-hair-line bg-cream/85 backdrop-blur text-ink hover:text-gold hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <Arrow direction="left" />
      </button>
      <button
        type="button"
        aria-label="次の商品"
        onClick={() => scrollByCards(1)}
        disabled={!canNext}
        className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-hair-line bg-cream/85 backdrop-blur text-ink hover:text-gold hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <Arrow direction="right" />
      </button>

      {/* Track */}
      <ul
        ref={trackRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 sm:-mx-10 px-6 sm:px-10"
      >
        {products.map((p, i) => (
          <li
            key={p.slug}
            className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[31.5%]"
            style={{ scrollSnapAlign: "start" }}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${products.length}`}
          >
            <ShowcaseCard product={p} />
          </li>
        ))}
      </ul>

      {/* Dots */}
      {products.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {products.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`block h-[3px] transition-all duration-300 ${
                i === active ? "w-8 bg-gold" : "w-4 bg-hair-line"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShowcaseCard({ product }: { product: ProductFrontmatter }) {
  const { links } = product;
  const primaryHref = links.asp || links.rakuten || links.amazon;
  const primaryProvider = links.asp
    ? "asp"
    : links.rakuten
      ? "rakuten"
      : "amazon";
  const primaryLabel =
    primaryProvider === "asp"
      ? product.ctaLabel ?? "詳しく見る"
      : primaryProvider === "rakuten"
        ? "楽天で見る"
        : "Amazon で見る";

  // First glyph of the title becomes the editorial hero on the staging panel.
  const initial = Array.from(product.title)[0] ?? "·";

  return (
    <article className="group flex flex-col h-full">
      {/* Staging panel — Aesop-style typographic hero */}
      <div className="relative aspect-[4/5] bg-cream-deep overflow-hidden card-lift">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-paper/70 via-cream-deep to-cream-deep transition-opacity duration-700 group-hover:opacity-90"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="font-mincho text-[12rem] sm:text-[14rem] leading-none text-gold/15 select-none transition-transform duration-[1200ms] group-hover:scale-105"
          >
            {initial}
          </span>
        </div>
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <p className="logo-type italic text-[11px] tracking-[0.25em] uppercase text-gold">
            {product.productType}
          </p>
          <span className="text-[10px] tracking-[0.1em] text-sub-gray border border-hair-line bg-cream/70 backdrop-blur px-1.5 py-0.5">
            広告
          </span>
        </div>
        {product.provider && (
          <p className="absolute bottom-5 left-5 right-5 logo-type italic text-[12px] tracking-[0.15em] text-ink/80">
            {product.provider}
          </p>
        )}
      </div>

      {/* Info block */}
      <div className="mt-6 flex flex-col grow">
        <h3 className="font-mincho text-lg sm:text-xl leading-[1.5] text-ink">
          {product.title}
        </h3>
        <p className="mt-3 font-mincho text-[13.5px] sm:text-[14px] leading-[2] text-ink/75">
          {product.excerpt}
        </p>

        <div className="mt-auto pt-6">
          {product.priceLabel && (
            <p className="text-[13px] tracking-[0.04em] text-ink mb-4">
              {product.priceLabel}
            </p>
          )}
          {primaryHref && (
            <AffiliateLink
              href={primaryHref}
              product={product.slug}
              provider={primaryProvider}
              territory={product.territory}
              className="block w-full text-center text-[13px] tracking-[0.12em] bg-ink text-cream hover:bg-gold py-3.5 px-5 transition-colors"
            >
              {primaryLabel}
            </AffiliateLink>
          )}
        </div>
      </div>
    </article>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <polyline points="10,3 5,8 10,13" />
      ) : (
        <polyline points="6,3 11,8 6,13" />
      )}
    </svg>
  );
}
