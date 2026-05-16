type Props = {
  en: string;
  ja?: string;
  className?: string;
};

/**
 * Editorial section label inspired by Japanese magazine layouts.
 * On desktop: vertical Cormorant English text + horizontal Japanese title.
 * On mobile: stacked horizontally to remain readable.
 */
export default function SectionLabel({ en, ja, className = "" }: Props) {
  return (
    <div className={`flex sm:items-start gap-4 sm:gap-6 ${className}`}>
      <p
        className="logo-type text-[10px] sm:text-xs tracking-[0.5em] uppercase text-gold shrink-0 sm:pt-2"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {en}
      </p>
      {ja && (
        <h2 className="font-mincho text-2xl sm:text-3xl lg:text-4xl font-medium leading-[1.45] text-ink">
          {ja}
        </h2>
      )}
    </div>
  );
}
