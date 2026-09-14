// v2 の共通部品。
//
// 各画面を個別のLPとして作らないための土台。
// ここに無い見た目を画面側で直接書き始めたら、そこから崩れる。
//
// 規則（設計書の「部品の規則」と同じもの）
//   角丸  14px カード / 10px ボタン / 999px チップ
//   影    FAB だけ。カードは1pxの線で分ける
//   tap   44px 以上
//   動き  180ms ease-out。prefers-reduced-motion で止まる

import Link from "next/link";

export function Card({
  children,
  selected = false,
  as = "div",
  href,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  selected?: boolean;
  as?: "div" | "button" | "link";
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const base = `block w-full rounded-[14px] border bg-surface px-4 py-3.5 text-left transition-colors duration-[180ms] ${
    selected ? "border-coral bg-coral-soft" : "border-hairline"
  } ${className}`;

  if (as === "link" && href) {
    return (
      <Link href={href} className={`${base} hover:border-coral`}>
        {children}
      </Link>
    );
  }
  if (as === "button") {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={`${base} min-h-[44px] hover:border-coral`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function Btn({
  children,
  onClick,
  href,
  variant = "solid",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "solid" | "ghost";
  disabled?: boolean;
}) {
  const cls = `inline-flex min-h-[44px] w-full items-center justify-center rounded-[10px] px-5 text-[15px] font-bold transition-colors duration-[180ms] ${
    variant === "solid"
      ? "bg-coral text-white hover:opacity-90 disabled:bg-hairline disabled:text-faint"
      : "border border-coral text-coral hover:bg-coral-soft"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

/** 押せるチップ。縦32pxだが上下の余白で44pxを確保する */
export function Pill({
  children,
  on = false,
  onClick,
}: {
  children: React.ReactNode;
  on?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-[44px] items-center rounded-full border px-3.5 text-[13.5px] transition-colors duration-[180ms] ${
        on
          ? "border-coral bg-coral text-white"
          : "border-hairline bg-surface text-bodytext hover:border-coral hover:text-coral"
      }`}
    >
      {children}
    </button>
  );
}

/** 読むだけのラベル。押せるものと見分けが付くよう、枠を細くする */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-hairline bg-surface px-2.5 py-0.5 text-[11.5px] text-faint">
      {children}
    </span>
  );
}

export function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="font-display text-[17px] font-bold leading-[1.55] text-charcoal">{children}</h2>
      {note && <span className="shrink-0 text-[12px] text-faint">{note}</span>}
    </div>
  );
}

/**
 * 空のとき。
 * 「まだありません」で止めず、なぜ空で、いつ埋まるかまで書く。
 * 空の理由が分かると、壊れているのか作っている途中かが分かる。
 */
export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-hairline bg-surface px-4 py-6">
      <p className="text-[14.5px] font-bold text-charcoal">{title}</p>
      <p className="mt-2 text-[13.5px] leading-[1.85] text-faint">{body}</p>
    </div>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="block h-3 rounded-full bg-hairline"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
