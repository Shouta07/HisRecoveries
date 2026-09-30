"use client";

import { useEffect, useRef, useState } from "react";
import type { Case } from "@/lib/ask/cases";
import { VERDICTS } from "@/lib/ask/model";

// 場面を、やりとりの形で見せる。
//
// ══════════════════════════════════════════════════
// なぜ動かすのか
// ══════════════════════════════════════════════════
// 表で並べると「機能の説明」になる。
// 実際に起きるのは、送る前に止まって、読んでもらって、
// 返ってきて、決める、という順番のある出来事。
//
// 順番に出すと、その順番そのものが伝わる。
// 読む人は、自分が同じことをする場面を頭に置ける。
//
// ══════════════════════════════════════════════════
// 止まって見える時間を作らない
// ══════════════════════════════════════════════════
// 1通ずつ出すあいだ、画面に何も無い時間があると、
// 読み込みに失敗したように見える。
// 出る前の場所は、あらかじめ高さを取っておく。
//
// ══════════════════════════════════════════════════
// 動きを切っている人には、全部出す
// ══════════════════════════════════════════════════
// prefers-reduced-motion のとき、順番に出すのをやめて
// 最初から全部見せる。待たせない。
//
// ══════════════════════════════════════════════════
// 実際のやりとりではない
// ══════════════════════════════════════════════════
// 画面の見本。実在の誰かのLINEではない。
// 見本だと分かる札を、必ず付ける（外から渡す）。

/** 1通ずつ出す間隔（ミリ秒） */
const STEP_MS = 900;
/** 「入力中」を見せる時間 */
const TYPING_MS = 700;

function tone(v: string): string {
  if (v === "as_is") return "bg-ok-tint text-ok-text";
  if (v === "change") return "bg-rose-tint text-rose-text";
  return "bg-mist text-steel";
}

export default function ChatCase({ c }: { c: Case }) {
  // 0 = まだ何も / 1 = 下書き / 2.. = 反応 / 最後 = 決めたこと
  const total = 1 + c.says.length + 1;
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(total);
      return;
    }

    const el = box.current;
    if (!el) return;

    let timers: number[] = [];
    const run = () => {
      for (let i = 1; i <= total; i++) {
        // 反応が出る前だけ「入力中」を挟む。
        // 下書きと、決めたことには挟まない（自分が書くものなので）
        const at = i * STEP_MS;
        if (i > 1 && i <= c.says.length + 1) {
          timers.push(window.setTimeout(() => setTyping(true), at - TYPING_MS));
        }
        timers.push(
          window.setTimeout(() => {
            setTyping(false);
            setShown(i);
          }, at),
        );
      }
    };

    // 画面に入ってから始める。上のほうで勝手に終わっていると、
    // たどり着いたときには何も動いていない
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "-10% 0px -20% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      for (const t of timers) window.clearTimeout(t);
      timers = [];
    };
  }, [total, c.says.length]);

  const seen = (n: number) => shown >= n;

  return (
    <div ref={box} className="rounded-card border border-line bg-paper p-4 shadow-card sm:p-5">
      <p className="text-[11.5px] font-bold text-steel">{c.scene}</p>
      <h3 className="mt-1 text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
        {c.decision}
      </h3>

      {/* やりとり。高さは最初から取っておく（出るたびに下が飛ばない） */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-card bg-sky px-3 py-4 sm:px-4">
        {/* 自分が送ろうとしている文面。右側 */}
        <div className={`flex justify-end transition-opacity duration-300 ${seen(1) ? "opacity-100" : "opacity-0"}`}>
          <div className="max-w-[82%]">
            <p className="mb-1 text-right text-[10.5px] font-bold text-steel">
              {c.draft.label}
            </p>
            <p className="rounded-card rounded-br-[4px] bg-brand px-3.5 py-2.5 text-[14px] font-bold leading-[1.7] text-paper">
              {c.draft.text}
            </p>
          </div>
        </div>

        {/* 読んだ人の反応。左側 */}
        {c.says.map((s, i) => {
          const n = 2 + i;
          const label = VERDICTS.find((v) => v.id === s.verdict)?.label ?? "";
          return (
            <div
              key={s.say}
              className={`flex justify-start transition-all duration-300 ${
                seen(n) ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              <div className="max-w-[86%]">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold text-steel">
                  <span>{s.age}歳</span>
                  <span className={`rounded-pill px-1.5 py-0.5 ${tone(s.verdict)}`}>
                    {label}
                  </span>
                </p>
                <p className="rounded-card rounded-bl-[4px] bg-paper px-3.5 py-2.5 text-[14px] leading-[1.75] text-slate shadow-card">
                  {s.say}
                </p>
              </div>
            </div>
          );
        })}

        {/* 入力中。次の反応が出る直前だけ */}
        <div className={`flex justify-start ${typing ? "" : "invisible"}`} aria-hidden>
          <span className="flex items-center gap-1 rounded-pill bg-paper px-3 py-2 shadow-card">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-steel/60"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* 見て、決めたこと */}
      <div
        className={`mt-3.5 flex items-start gap-2.5 border-t border-line pt-3.5 transition-opacity duration-300 ${
          seen(total) ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok-tint text-[11px] font-black text-ok-text"
        >
          ✓
        </span>
        <p className="min-w-0 text-[13.5px] font-bold leading-[1.7] text-slate">
          <span className="text-steel">見て、決めたこと</span>
          <br />
          {c.decided}
        </p>
      </div>
    </div>
  );
}
