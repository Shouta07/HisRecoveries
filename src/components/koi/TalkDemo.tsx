"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_TALK, DEMO_EP, DEMO_ASK } from "@/lib/koi/demo";

/* 恋亀との会話を、そのまま見せる。
 *
 * ── 説明より先に ────────────────────────────────
 * 「話すだけで整理されます」と書いても伝わらない。
 * やりとりを見せて、そのあとに、できたものを出す。
 *
 * ── 順番に出す ──────────────────────────────────
 * 全部いきなり出すと、ただの画面写真になる。
 * 1往復ずつ出すと、話が進んでいることが伝わる。
 *
 * 出る前の場所は高さを取っておく（下が飛ばない）。
 * 動きを切っている人には最初から全部出す。
 */

const STEP_MS = 900;

export default function TalkDemo() {
  const box = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(0);
  // 会話のあと、できたものと、人に聞く提案
  const total = DEMO_TALK.length + 2;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setShown(total);
      return;
    }
    const timers: number[] = [];
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0]?.isIntersecting) return;
        io.disconnect();
        for (let i = 1; i <= total; i++) {
          timers.push(window.setTimeout(() => setShown(i), STEP_MS * i));
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [total]);

  const at = (n: number) =>
    `transition-all duration-300 ${
      shown >= n ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
    }`;

  return (
    <div ref={box} className="flex flex-col gap-3">
      {/* やりとり */}
      <ul className="flex flex-col gap-2.5 rounded-card bg-sky px-3 py-4 sm:px-4">
        {DEMO_TALK.map((t, i) => (
          <li
            key={t.say}
            className={`flex ${t.who === "me" ? "justify-end" : "justify-start"} ${at(i + 1)}`}
          >
            <div className="flex max-w-[86%] items-end gap-2">
              {t.who === "koi" && (
                <span
                  aria-hidden
                  className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[15px] shadow-card"
                >
                  🐢
                </span>
              )}
              <p
                className={`rounded-card px-3.5 py-2.5 text-[13.5px] leading-[1.75] ${
                  t.who === "me"
                    ? "rounded-br-[4px] bg-brand font-bold text-paper"
                    : "rounded-bl-[4px] bg-paper text-slate shadow-card"
                }`}
              >
                {t.say}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* 話した結果できたもの。入力していないのに埋まっている、が見せたいこと */}
      <div
        className={`rounded-card border border-line bg-paper p-4 shadow-card ${at(
          DEMO_TALK.length + 1,
        )}`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-black text-slate">
            {DEMO_EP.person}
            <span className="ml-2 text-[11.5px] font-bold text-steel">{DEMO_EP.app}</span>
          </p>
          <p className="text-[11.5px] font-black text-brand">EP.0{DEMO_EP.number}</p>
        </div>
        <p className="mt-0.5 text-[12.5px] font-bold text-steel">{DEMO_EP.title}</p>

        <ul className="mt-3 flex flex-col gap-2">
          {DEMO_EP.rows.map((r) => (
            <li key={r.label} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
              <span aria-hidden className="shrink-0">
                {r.mark}
              </span>
              <span className="min-w-0">
                <span className="font-bold text-slate">{r.label}</span>
                <span className="text-steel">　{r.body}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-start gap-2 border-t border-line pt-3">
          <span aria-hidden className="shrink-0 text-[13px]">
            🎯
          </span>
          <p className="min-w-0 text-[13.5px] font-bold leading-[1.6] text-slate">
            <span className="text-steel">NEXT</span>
            <br />
            {DEMO_EP.next}
          </p>
        </div>
      </div>

      {/* 人に聞ける、が最後に来る。押し売りにしない */}
      <div className={`flex items-start gap-2 ${at(total)}`}>
        <span
          aria-hidden
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-[15px] shadow-card"
        >
          🐢
        </span>
        <p className="min-w-0 rounded-card rounded-bl-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.75] text-slate shadow-card">
          {DEMO_ASK}
        </p>
      </div>
    </div>
  );
}
