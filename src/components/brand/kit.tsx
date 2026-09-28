// ブランドの部品。
//
// ── アプリ本体でも使い回す前提で作る ────────────────
// トップに置くための飾りではない。結果画面・A/B・属性選択は、
// 実際のプロダクトで使うものと同じ部品にする。
// ここを別々に作ると、広告の見た目と中身が食い違う。
//
// ════════════════════════════════════════════════
// 色の規則（破ると、見えない文字ができる）
// ════════════════════════════════════════════════
//   bone  #F2F0EC  地
//   void  #0A0A0A  反転面・大見出し
//   ash   #6E6A63  本文（地の上で 4.77:1）
//   lime  #CCFF00  アクセント1色
//
//   ライムは地の上で 1.04:1 しかない。
//   ・明るい地の上 → 面として塗り、上は黒文字（16.9:1）
//   ・黒の上      → 文字に使ってよい（17.8:1）
//   ライムを明るい地の文字色にしない。
//
// ════════════════════════════════════════════════
// 文字
// ════════════════════════════════════════════════
//   mega/huge/big  見出し。画面幅で伸びる
//   stat           数字。数字そのものを絵として扱う
//   本文は 15–17px。見出しとの差を大きく取る
//
//   英字の小見出しは uppercase + tracking を広げる。
//   日本語に意味が通らない英語を主役にしない（装飾として添えるだけ）。

import Link from "next/link";
import type { ReactNode } from "react";

/* ── ラベル ─────────────────────────────────── */

/** 英字の小見出し。装飾。意味は日本語側で必ず担保する */
export function Eyebrow({
  children,
  tone = "dark",
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "lime";
}) {
  const c = tone === "light" ? "text-ash-soft" : tone === "lime" ? "text-lime" : "text-ash";
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${c}`}>{children}</p>
  );
}

/** 属性チップ。「誰に聞くか」がこの製品の価値なので、いちばん目立つ小部品にする */
export function AttributeChip({
  children,
  on = false,
  tone = "dark",
  onClick,
}: {
  children: ReactNode;
  on?: boolean;
  tone?: "dark" | "light";
  onClick?: () => void;
}) {
  const base =
    "inline-flex min-h-[44px] items-center px-4 text-[12.5px] font-bold uppercase tracking-[0.12em] transition-colors duration-200";
  const look = on
    ? "bg-lime text-void"
    : tone === "light"
      ? "border border-rule-dark text-bone hover:border-lime hover:text-lime"
      : "border border-void text-void hover:bg-void hover:text-bone";

  if (!onClick) return <span className={`${base} ${look}`}>{children}</span>;
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`${base} ${look}`}>
      {children}
    </button>
  );
}

/* ── 回答カード ─────────────────────────────────
   この製品の象徴。出すのは属性と反応だけで、個人は出さない。 */

export type Reaction = {
  age: number | string;
  /** 属性のラベル。3つまで。増やすとカードが名簿に見える */
  attrs: string[];
  /** 反応。GOOD / NOT FOR ME など短く */
  verdict: string;
  /** 前向きな反応か。面の色が変わる */
  positive?: boolean;
  comment: string;
  /** 役に立ったと言われた割合。無いときは出さない */
  helpful?: number;
};

export function ReactionCard({
  r,
  tone = "light",
  tilt = 0,
  float,
  className = "",
}: {
  r: Reaction;
  /** light = 明るい地に置く白いカード / dark = 黒地に置くカード */
  tone?: "light" | "dark";
  /** 少しだけ傾ける。整列しすぎると資料に見える */
  tilt?: number;
  float?: "slow" | "normal";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <article
      style={{ "--tilt": `${tilt}deg`, transform: `rotate(${tilt}deg)` } as React.CSSProperties}
      className={`w-full max-w-[290px] border p-4 ${
        dark ? "border-rule-dark bg-void text-bone" : "border-void bg-bone text-void"
      } ${
        float === "slow"
          ? "motion-safe:animate-float-slow"
          : float
            ? "motion-safe:animate-float"
            : ""
      } ${className}`}
    >
      {/* 年齢を大きく出す。誰かではなく、どういう人かが一目で分かる */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[40px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums">
          {r.age}
        </span>
        <span
          className={`px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] ${
            r.positive ? "bg-lime text-void" : dark ? "bg-bone text-void" : "bg-void text-bone"
          }`}
        >
          {r.verdict}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {r.attrs.slice(0, 3).map((a) => (
          <li
            key={a}
            className={`px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.12em] ${
              dark ? "border border-rule-dark text-ash-soft" : "border border-rule text-ash"
            }`}
          >
            {a}
          </li>
        ))}
      </ul>

      <p className="mt-3.5 text-[14px] font-medium leading-[1.75]">「{r.comment}」</p>

      {typeof r.helpful === "number" && (
        <p
          className={`mt-3.5 border-t pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] ${
            dark ? "border-rule-dark text-ash-soft" : "border-rule text-ash"
          }`}
        >
          Helpful {r.helpful}%
        </p>
      )}
    </article>
  );
}

/* ── 回答の分布 ─────────────────────────────────
   管理画面のグラフにしない。数字とタイポグラフィと1本のバーで見せる。
   割れている状態も、良くないこととして見せない。 */

export type Slice = { label: string; n: number; positive?: boolean };

export function ResultDistribution({
  slices,
  total,
  tone = "light",
}: {
  slices: Slice[];
  total: number;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const shown = slices.filter((s) => s.n > 0);

  return (
    <div>
      {/* 1本のバーに全部を積む。円グラフにしない */}
      <div className={`flex h-3 w-full overflow-hidden ${dark ? "bg-rule-dark" : "bg-rule"}`}>
        {shown.map((s) => (
          <span
            key={s.label}
            className={`block origin-left motion-safe:animate-bar-grow ${
              s.positive ? "bg-lime" : dark ? "bg-bone" : "bg-void"
            }`}
            style={{ width: `${(s.n / Math.max(1, total)) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-5">
        {shown.map((s) => (
          <li key={s.label} className="flex items-baseline gap-4">
            <span
              className={`text-[44px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums sm:text-[56px] ${
                s.positive ? (dark ? "text-lime" : "text-void") : dark ? "text-bone" : "text-ash"
              }`}
            >
              {Math.round((s.n / Math.max(1, total)) * 100)}
              <span className="text-[0.44em] align-super">%</span>
            </span>
            <span className="min-w-0">
              <span
                className={`block text-[12px] font-bold uppercase tracking-[0.16em] ${
                  dark ? "text-bone" : "text-void"
                }`}
              >
                {s.label}
              </span>
              <span className={`block text-[12.5px] ${dark ? "text-ash-soft" : "text-ash"}`}>
                {s.n}人 / {total}人
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 大きな数字 ─────────────────────────────── */

export function Stat({
  value,
  unit,
  label,
  tone = "light",
}: {
  value: string | number;
  unit?: string;
  label: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div>
      <p
        className={`text-stat font-black tabular-nums ${dark ? "text-lime" : "text-void"}`}
      >
        {value}
        {unit && <span className="text-[0.38em] align-super">{unit}</span>}
      </p>
      <p
        className={`mt-2 text-[11px] font-bold uppercase tracking-[0.2em] ${
          dark ? "text-ash-soft" : "text-ash"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

/* ── 入力の部品 ─────────────────────────────────
   投稿フォームも同じ世界観にする。
   広告は尖っているのに、入力画面だけ別のサービスに見える、をなくす。 */

/** 画面にひとつだけ置く問い */
export function BigAsk({ children }: { children: ReactNode }) {
  return <h1 className="text-big font-black text-void">{children}</h1>;
}

/** 入力欄の上に置く小さなラベル */
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ash">{children}</p>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] leading-[1.85] text-ash">{children}</p>;
}

/** 選択肢。押せるものだけ面として独立させる */
export function Choice({
  children,
  on = false,
  onClick,
}: {
  children: ReactNode;
  on?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`flex min-h-[60px] w-full items-center border px-5 py-4 text-left text-[15.5px] transition-colors duration-200 ${
        on
          ? "border-void bg-lime text-void"
          : "border-rule bg-transparent text-void hover:border-void"
      }`}
    >
      {children}
    </button>
  );
}

/** 主たる操作。1画面に1つ */
export function Action({
  children,
  onClick,
  href,
  disabled = false,
  quiet = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  quiet?: boolean;
}) {
  const cls = `inline-flex min-h-[58px] w-full items-center justify-center px-6 text-[14px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 ${
    quiet
      ? "border border-void text-void hover:bg-void hover:text-bone"
      : "bg-void text-bone hover:bg-lime hover:text-void disabled:bg-rule disabled:text-ash"
  }`;
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
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

/** 自由入力。枠を細く、文字を大きく */
export const inputClass =
  "w-full border border-rule bg-transparent px-4 py-3.5 text-[16px] leading-[1.9] text-void outline-none transition-colors duration-200 placeholder:text-ash-soft focus:border-void";

/** 進み具合。数字にしない。線が伸びるだけ */
export function Progress({ step, of }: { step: number; of: number }) {
  return (
    <div className="h-[2px] w-full bg-rule">
      <div
        className="h-[2px] bg-void transition-[width] duration-300 ease-out"
        style={{ width: `${(step / of) * 100}%` }}
      />
    </div>
  );
}

/* ── 区切り ─────────────────────────────────── */

export function Hairline({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span
      aria-hidden
      className={`block h-px w-full ${tone === "dark" ? "bg-rule-dark" : "bg-rule"}`}
    />
  );
}
