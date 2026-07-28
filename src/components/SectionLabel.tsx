type Props = {
  en: string;
  ja?: string;
  number?: string; // 章番号やインデックス。e.g. "I", "01", "Chapter II"
  className?: string;
};

/**
 * Editorial chapter heading used to open each section.
 *  - small italic Cormorant eyebrow ("Presence Journal")
 *  - optional chapter index
 *  - large mincho title in Japanese
 *  - a thin gold rule below for cinematic separation
 *
 * Tone: magazine chapter opening, not navigation label.
 */
export default function SectionLabel({ en, ja, number, className = "" }: Props) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-4">
        {number && (
          <span className="logo-type italic text-[13.5px] tracking-[0.2em] text-gold">
            {number}
          </span>
        )}
        <p className="logo-type italic text-[12px] sm:text-[13.5px] tracking-[0.4em] uppercase text-gold">
          {en}
        </p>
      </div>
      {ja && (
        <h2 className="mt-3 font-mincho text-3xl sm:text-4xl lg:text-[2.75rem] font-medium leading-[1.35] tracking-[0.02em] text-ink">
          {ja}
        </h2>
      )}
      <span
        aria-hidden
        className="mt-5 block w-12 h-px bg-gold/60"
      />
    </div>
  );
}
