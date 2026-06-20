// Visual badge that makes the editorial neutrality of His Recoveries
// physically visible on a page. Use on services / partners / experts /
// recovery pages where a visitor might suspect commercial bias.

type Props = {
  variant?: "default" | "subtle";
};

export default function NeutralBadge({ variant = "default" }: Props) {
  if (variant === "subtle") {
    return (
      <p className="text-[11px] tracking-[0.08em] text-sub-gray leading-[1.85]">
        紹介手数料・広告費を受け取らない、中立の編集。
      </p>
    );
  }
  return (
    <div
      role="note"
      className="inline-flex flex-wrap items-baseline gap-3 border border-hair-line bg-paper px-4 py-2.5 text-[12px] text-ink"
    >
      <span className="logo-type italic tracking-[0.18em] uppercase text-gold">
        Neutral
      </span>
      <span className="leading-[1.7]">
        紹介手数料・広告費を受け取りません。掲載は買えません。
      </span>
    </div>
  );
}
