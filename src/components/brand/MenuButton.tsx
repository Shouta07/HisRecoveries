"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { OPERATOR } from "@/lib/voice";

// ヘッダーのメニュー。
//
// ── なぜ要るか ────────────────────────────────────
// フッターを外したので、特定商取引法の表記とプライバシーの行き先が
// 無くなる。この2つは、課金する以上どこかから必ず辿れないといけない。
// 下に長く並べる代わりに、ここへ畳んだ。
//
// ── 開いている間は、後ろを動かさない ──────────────
// 背景がスクロールすると、閉じたときに違う場所に戻る。
//
// ── Esc と、背景を押したら閉じる ──────────────────
// 閉じ方が1つしかないメニューは、閉じられないメニューになる。
//
// ── body の直下に出す ─────────────────────────────
// ヘッダーに backdrop-blur が掛かっている。backdrop-filter は
// position: fixed の基準（containing block）になるので、
// ヘッダーの中に置くと inset-0 がヘッダーの箱に閉じ込められ、
// メニューがヘッダーの高さに潰れる。実際そうなっていた。

const GROUPS: { h: string; items: readonly (readonly [string, string])[] }[] = [
  {
    h: "使う",
    items: [
      ["/ask", "確かめる"],
      ["/mine", "相談したこと"],
      ["/talk", "電話の練習（受付前）"],
    ] as const,
  },
  {
    h: "知る",
    items: [
      ["/answerers", "誰が読むのか"],
      ["/how", "仕組み"],
      ["/safety", "安心・安全"],
      ["/articles", "記事"],
    ] as const,
  },
  {
    h: "参加する",
    items: [
      ["/join", "答える側になる"],
      ["/about", "編集方針"],
      ["/updates", "更新記録"],
    ] as const,
  },
  {
    h: "決まりごと",
    items: [
      ["/legal", "特定商取引法に基づく表記"],
      ["/privacy", "プライバシー・免責事項"],
      ["/disclosure", "広告と収益について"],
    ] as const,
  },
];

export default function MenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        aria-expanded={open}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-soft text-slate transition-colors hover:bg-mist lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* 背景。読み上げには出さない（閉じる操作は右上の×と Esc） */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate/40"
          />
          <div className="absolute inset-x-0 top-0 max-h-full overflow-y-auto rounded-b-card bg-paper pb-8 shadow-card">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[15px] font-black text-slate">メニュー</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="メニューを閉じる"
                className="flex h-11 w-11 items-center justify-center rounded-soft text-slate transition-colors hover:bg-mist"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="サイト内" className="grid grid-cols-2 gap-x-5 gap-y-6 border-t border-line px-5 pt-5">
              {GROUPS.map((g) => (
                <div key={g.h}>
                  <p className="text-[11.5px] font-bold text-steel">{g.h}</p>
                  <ul className="mt-2.5 flex flex-col gap-0.5">
                    {g.items.map(([href, l]) => (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-[14px] leading-[1.5] text-slate transition-colors hover:text-brand"
                        >
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <p className="mt-7 border-t border-line px-5 pt-5 text-[11.5px] text-steel">
              © 2026 {OPERATOR}
            </p>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
