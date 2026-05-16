type Props = {
  en: string;
  ja?: string;
  className?: string;
};

/**
 * Editorial section header in the TENTIAL pattern:
 *   **Body Troubles** | 体の不調に関する悩み
 *
 * Bold sans-serif English on the left, thin vertical hair-line
 * separator, small navy Japanese label on the right.
 */
export default function SectionLabel({ en, ja, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <h2 className="text-2xl sm:text-[1.75rem] font-bold tracking-[0.04em] text-navy leading-none">
        {en}
      </h2>
      {ja && (
        <>
          <span
            aria-hidden
            className="block w-px h-7 bg-hair-line shrink-0"
          />
          <p className="text-xs sm:text-sm text-sub-gray tracking-[0.08em]">
            {ja}
          </p>
        </>
      )}
    </div>
  );
}
