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
      className="marquee overflow-hidden border-y border-hair-line py-3 select-none"
      aria-hidden
    >
      <div className="marquee-track whitespace-nowrap">
        {doubled.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center text-[12px] tracking-[0.08em] text-sub-gray px-6"
          >
            <span className="text-gold mr-2">#</span>
            {it}
            <span className="ml-6 inline-block w-1 h-1 rounded-full bg-hair-line" />
          </span>
        ))}
      </div>
    </div>
  );
}
