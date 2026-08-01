"use client";

// 記事を読むときの補助。デスクトップ用。
//
// 記事ページは 680px の1カラムで、1512px の画面だと左右に 400px ずつ余る。
// これは組みとしては正しい（1行の文字数を増やすと読みにくくなる）が、
// 余った場所を何にも使っていなかった。読者は長い記事の途中で
// 「あとどれくらいか」「いま何の話か」が分からなくなる。
//
//  ・上端の進捗バー … あとどれくらいかを、読みながら分かるようにする
//  ・左の追従目次 …… いま何節目かを示し、行き来できるようにする
//
// どちらも狭い画面では出さない。スマホでは本文の前に目次があり、
// 進捗バーは画面を削るだけになるため。

import { useEffect, useState } from "react";

/** 上端に細い進捗バー。記事の本文が対象 */
export function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = document.querySelector("article");
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      if (total <= 0) return setP(0);
      setP(Math.min(1, Math.max(0, -r.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed left-0 right-0 top-0 z-[55] hidden h-[2px] bg-transparent lg:block"
    >
      <div
        className="h-full bg-dou transition-[width] duration-150"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}

/** 左の余白に置く追従目次。いま読んでいる節に印を付ける */
export function StickyToc({ items }: { items: { id: string; h: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((x): x is HTMLElement => Boolean(x));
    if (els.length === 0) return;

    // 画面の上から3割の位置を「いま読んでいる場所」とみなす
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav aria-label="目次" className="sticky top-24 hidden xl:block">
      <p className="text-[12px] text-ainezu">目次</p>
      <ol className="mt-4 space-y-3 border-l border-shironezu">
        {items.map((i, n) => {
          const on = i.id === active;
          return (
            <li key={i.id} className={`-ml-px border-l-2 pl-4 ${on ? "border-dou" : "border-transparent"}`}>
              <a
                href={`#${i.id}`}
                aria-current={on ? "true" : undefined}
                className={`flex gap-2.5 text-[13px] leading-[1.7] transition-colors ${
                  on ? "text-sumi" : "text-ainezu hover:text-dou"
                }`}
              >
                <span className="shrink-0 tabular-nums text-[11px] pt-[3px]">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <span>{i.h}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
