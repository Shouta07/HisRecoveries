type Props = { items: string[] };

/**
 * A slow horizontal marquee of small tag/keyword chips.
 * Pauses on hover. Doubles the content for seamless loop.
 */
export default function TagMarquee({ items }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div
      className="marquee overflow-hidden border-y border-hair-line py-5 sm:py-6 select-none bg-paper/40"
      aria-hidden
    >
      <div className="marquee-track whitespace-nowrap">
        {doubled.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center text-[12px] tracking-[0.18em] text-sub-gray px-10 sm:px-12"
          >
            <span className="text-gold mr-3">·</span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
