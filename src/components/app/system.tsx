// His Recoveries Design System（/app）
//
// ここに無い見た目を画面側で直接書き始めたら、そこから崩れる。
// 画面ごとにclassNameを足していくのをやめるために、この1ファイルを先に置く。
//
// ════════════════════════════════════════════════════════════
// TOKENS
// ════════════════════════════════════════════════════════════
//
// COLOR（tailwind.config.ts で定義。ここは使い分けの規則）
//   ground      #FBF9F7  地。画面はこれで埋まる
//   surface     #FFFFFF  面。選択肢と経験談だけ。それ以外に使わない
//   charcoal    #2A2622  問い・見出し
//   bodytext    #5A534C  本文
//   faint       #8C8378  ラベル・日付・補足
//   hairline    #EAE4DE  線。区切りの第一手段
//   accent      #B2543C  1画面に1箇所。地の上で 4.67:1、白文字で 4.86:1
//   accent-tint #F4EAE6  選択中の面。塗りつぶさない
//
// TYPE
//   ask     26–28 / 1.5   問い。画面にひとつ
//   head    17   / 1.55   見出し
//   body    15   / 1.95   本文。日本語の可読性を最優先する
//   small   13.5 / 1.85   補助的な本文
//   label   11.5 / 0.12em ラベル。小さく、詰めない
//   note    12.5 / 1.8    脚注
//
// SPACE（縦のリズム。ここ以外の値を使わない）
//   4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
//   ブロック間 = 32、セクション間 = 48、画面の頭 = 24
//
// RADIUS   12（選択肢・経験談） / 8（ボタン・入力） / 999（チップ）
// BORDER   1px hairline。2px以上は使わない
// SHADOW   使わない。影で浮かせず、線と余白で分ける
// MOTION   180–260ms。fade / translateY 10px / line draw のみ
//          prefers-reduced-motion で全部止まる（motion-safe: を必ず付ける）
// TAP      44px 以上
//
// ════════════════════════════════════════════════════════════
// 守ること
// ════════════════════════════════════════════════════════════
//   ・すべてを角丸白カードに入れない。区切りは 余白 → 線 → カード の順で選ぶ
//   ・アクセントは1画面に1箇所。2箇所目が要るなら、設計が間違っている
//   ・進捗率・STEP n/m・スコアは、この中に部品として存在しない

import Link from "next/link";

/* ── 画面の器 ──────────────────────────────────────────── */

/** 画面。入ってきたときに一度だけ、静かに持ち上がる */
export function Screen({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-hr-rise pb-10">{children}</div>;
}

/* ── 文字 ────────────────────────────────────────────── */

/**
 * 問い。1画面にひとつだけ。
 * このプロダクトで最も大きい文字はここで、見出しでも数字でもない。
 */
export function Ask({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-[26px] font-bold leading-[1.5] tracking-[-0.01em] text-charcoal [text-wrap:balance] sm:text-[28px]">
      {children}
    </h1>
  );
}

export function Head({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[17px] font-bold leading-[1.55] text-charcoal">{children}</h2>
  );
}

/** ラベル。小さく、control されていること自体が伝わる程度に */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">{children}</p>
  );
}

export function Body({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] leading-[1.95] text-bodytext">{children}</p>;
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12.5px] leading-[1.8] text-faint">{children}</p>;
}

/* ── 線 ──────────────────────────────────────────────── */

/**
 * 区切りの第一手段。
 * カードで囲う前に、まずこれで足りないかを考える。
 */
export function Rule({ soft = false }: { soft?: boolean }) {
  return <hr className={`border-0 border-t border-hairline ${soft ? "opacity-60" : ""}`} />;
}

/* ── 押せるもの ────────────────────────────────────────── */

/**
 * 選択肢。カードを使ってよい数少ない場所のひとつ。
 * 押した先が分岐するので、面として独立している必要がある。
 */
export function Choice({
  children,
  on = false,
  onClick,
  href,
}: {
  children: React.ReactNode;
  on?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const cls = `flex min-h-[56px] w-full items-center rounded-[12px] border px-4 py-3.5 text-left text-[15px] leading-[1.7] transition-colors duration-200 ${
    on
      ? "border-accent bg-accent-tint text-charcoal"
      : // hover をアクセント色にしない。
        // タッチ端末では押したあと hover が残るので、選んでいないものが
        // 選ばれたように見える。選択の色は選択にだけ使う。
        "border-hairline bg-surface text-charcoal hover:border-faint/50"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cls}>
      {children}
    </button>
  );
}

/** 主たる操作。1画面に1つ。ここがアクセントを使う唯一の場所になることが多い */
export function Action({
  children,
  onClick,
  href,
  disabled = false,
  quiet = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  quiet?: boolean;
}) {
  const cls = `inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] px-5 text-[15px] font-bold transition-colors duration-200 ${
    quiet
      ? "border border-hairline text-bodytext hover:border-accent hover:text-accent"
      : "bg-accent text-white hover:bg-accent/90 disabled:bg-hairline disabled:text-faint"
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

/**
 * 控えめな導線。「→」で終わる一行。
 * ボタンにするほどではないが、押せることは分かってほしいもの。
 */
export function Quiet({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "inline-flex min-h-[44px] items-center gap-1.5 text-[13.5px] text-bodytext transition-colors duration-200 hover:text-accent";
  const inner = (
    <>
      {children}
      <span aria-hidden className="text-[12px]">
        →
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/** 絞り込み。Secondary にしか置かない（§20） */
export function Chip({
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
      className={`inline-flex min-h-[40px] items-center rounded-full border px-3.5 text-[13px] transition-colors duration-200 ${
        on ? "border-accent bg-accent-tint text-accent" : "border-hairline text-faint hover:text-bodytext"
      }`}
    >
      {children}
    </button>
  );
}

/** 読むだけの印。押せるものと見分けが付くよう、枠を持たせない */
export function Mark({ children }: { children: React.ReactNode }) {
  return <span className="text-[11.5px] tracking-[0.06em] text-faint">{children}</span>;
}

/* ── 空 ──────────────────────────────────────────────── */

/**
 * 空のとき（§35）。
 * 「ありません」で止めない。なぜ空で、何をすると埋まるかまで書く。
 * ここの文章はこのプロダクトの人格そのものなので、画面側で短縮しない。
 */
export function Empty({
  title,
  body,
  action,
  href,
}: {
  title: string;
  body: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="border-l border-hairline pl-4">
      <p className="text-[14.5px] leading-[1.8] text-charcoal">{title}</p>
      <p className="mt-2 text-[13.5px] leading-[1.9] text-faint">{body}</p>
      {action && href && (
        <div className="mt-1">
          <Quiet href={href}>{action}</Quiet>
        </div>
      )}
    </div>
  );
}

/** 端末の中を読み終えるまでの間。カードの形で待たせない */
export function Loading() {
  return (
    <div aria-hidden className="motion-safe:animate-hr-fade flex flex-col gap-3 pt-2">
      <span className="block h-3 w-1/3 rounded-full bg-hairline" />
      <span className="block h-3 w-4/5 rounded-full bg-hairline" />
      <span className="block h-3 w-2/3 rounded-full bg-hairline" />
    </div>
  );
}
