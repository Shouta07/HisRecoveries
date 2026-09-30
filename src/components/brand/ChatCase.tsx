"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Case } from "@/lib/ask/cases";
import { VERDICTS } from "@/lib/ask/model";

// 場面を、やりとりの形で見せる。
//
// ══════════════════════════════════════════════════
// なぜ動かすのか
// ══════════════════════════════════════════════════
// 表で並べると「機能の説明」になる。
// 実際に起きるのは、状況を書いて、読んでもらって、
// 返ってきて、直った文が来て、決める、という順番のある出来事。
//
// 順番に出すと、その順番そのものが伝わる。
//
// ══════════════════════════════════════════════════
// 1行の文面に、一言が返る絵にしない
// ══════════════════════════════════════════════════
// 前はこうだった。
//   「明日楽しみにしてる！お店は19時でどう？」
//   → 「自然でいいと思います」
//   → 「少し柔らかい言い方にすると、もっと好印象です」
//
// これは無料で誰にでも言えることで、
// 見た人が払う理由にならない。むしろ「この程度か」になる。
//
// 実際に来る相談には、そこに至るまでが付いている。
//   どこで知り合って、いま何往復目で、相手がどういう人で、
//   自分が何を気にしているか。
// そこまで渡すから、返ってくるものが変わる。
//
// なので出す順番を変えた。
//   状況（長文）→ 文面 → 反応3つ → そのまま送れる修正案 → 決めたこと
//
// ══════════════════════════════════════════════════
// 止まって見える時間を作らない
// ══════════════════════════════════════════════════
// 1つずつ出すあいだ、画面に何も無い時間があると、
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
// 見本だと分かる札は、この部品の外（page.tsx）で必ず付ける。

/** 1つずつ出す間隔（ミリ秒） */
const STEP_MS = 850;
/** 「入力中」を見せる時間 */
const TYPING_MS = 650;

type Step =
  | { kind: "context" }
  | { kind: "draft" }
  | { kind: "say"; i: number }
  | { kind: "fix" }
  | { kind: "decided" };

function tone(v: string): string {
  if (v === "as_is") return "bg-ok-tint text-ok-text";
  if (v === "change") return "bg-rose-tint text-rose-text";
  return "bg-mist text-steel";
}

export default function ChatCase({ c }: { c: Case }) {
  // 出す順番。背景と修正案は無い場面もあるので、ここで組み立てる
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [];
    if (c.context) out.push({ kind: "context" });
    out.push({ kind: "draft" });
    c.says.forEach((_, i) => out.push({ kind: "say", i }));
    if (c.fix) out.push({ kind: "fix" });
    out.push({ kind: "decided" });
    return out;
  }, [c]);

  const total = steps.length;
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

    const timers: number[] = [];
    const run = () => {
      steps.forEach((s, idx) => {
        const n = idx + 1;
        const at = n * STEP_MS;
        // 相手が書いているものの前だけ「入力中」を挟む。
        // 自分が書いたもの（状況・文面）と、自分が決めたことには挟まない
        if (s.kind === "say" || s.kind === "fix") {
          timers.push(window.setTimeout(() => setTyping(true), at - TYPING_MS));
        }
        timers.push(
          window.setTimeout(() => {
            setTyping(false);
            setShown(n);
          }, at),
        );
      });
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
    };
  }, [steps, total]);

  /** その段が出ているか。steps の何番目かで見る */
  const at = (k: Step["kind"], i?: number) => {
    const idx = steps.findIndex((s) =>
      s.kind === k && (k !== "say" || (s as { i: number }).i === i),
    );
    return idx >= 0 && shown >= idx + 1;
  };

  // 「入力中」を出す場所。最後の反応より下に置くと、
  // 修正案が出たあとも下に残って見える
  const typingVisible = typing && shown < total;

  return (
    <div ref={box} className="rounded-card border border-line bg-paper p-4 shadow-card sm:p-5">
      <p className="text-[11.5px] font-bold text-steel">{c.scene}</p>
      <h3 className="mt-1 text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
        {c.decision}
      </h3>

      {/* やりとり。高さは最初から取っておく（出るたびに下が飛ばない） */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-card bg-sky px-3 py-4 sm:px-4">
        {/* ══════════════════════════════════════════
            1. 状況。右側（自分が書いたもの）
            ══════════════════════════════════════════
            文面だけ切り出して見せない。
            ここまで渡すから、返ってくるものが変わる */}
        {c.context && (
          <div
            className={`flex justify-end transition-all duration-300 ${
              at("context") ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            <div className="max-w-[90%]">
              <p className="mb-1 text-right text-[10.5px] font-bold text-steel">相談したこと</p>
              <p className="rounded-card rounded-br-[4px] bg-brand-tint px-3.5 py-2.5 text-[12.5px] leading-[1.85] text-slate">
                {c.context}
              </p>
            </div>
          </div>
        )}

        {/* 2. 送ろうとしている文面。右側 */}
        <div
          className={`flex justify-end transition-all duration-300 ${
            at("draft") ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <div className="max-w-[82%]">
            <p className="mb-1 text-right text-[10.5px] font-bold text-steel">{c.draft.label}</p>
            <p className="rounded-card rounded-br-[4px] bg-brand px-3.5 py-2.5 text-[14px] font-bold leading-[1.7] text-paper">
              {c.draft.text}
            </p>
          </div>
        </div>

        {/* 3. 読んだ人の反応。左側 */}
        {c.says.map((s, i) => {
          const label = VERDICTS.find((v) => v.id === s.verdict)?.label ?? "";
          return (
            <div
              key={s.say}
              className={`flex justify-start transition-all duration-300 ${
                at("say", i) ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              <div className="max-w-[88%]">
                <p className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold text-steel">
                  <span>{s.age}歳</span>
                  <span className={`rounded-pill px-1.5 py-0.5 ${tone(s.verdict)}`}>{label}</span>
                </p>
                <p className="rounded-card rounded-bl-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.8] text-slate shadow-card">
                  {s.say}
                </p>
              </div>
            </div>
          );
        })}

        {/* ══════════════════════════════════════════
            4. そのまま送れる修正案。左側
            ══════════════════════════════════════════
            感想だけ返して終わると、次に何をすればいいか分からない。
            直した文そのものと、どこをなぜ変えたかまで返す。
            ここだけ枠を付けて、コピーして使うものだと分かるようにする */}
        {c.fix && (
          <div
            className={`flex justify-start transition-all duration-300 ${
              at("fix") ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            <div className="w-full max-w-[94%]">
              <p className="mb-1 text-[10.5px] font-bold text-steel">{c.fix.label}</p>
              <div className="rounded-card rounded-bl-[4px] border border-brand bg-paper shadow-card">
                <p className="px-3.5 py-3 text-[14px] font-bold leading-[1.8] text-slate">
                  {c.fix.text}
                </p>
                <ul className="flex flex-col gap-1.5 border-t border-line px-3.5 py-3">
                  {c.fix.why.map((w) => (
                    <li key={w} className="flex items-start gap-2 text-[11.5px] leading-[1.7]">
                      <span aria-hidden className="mt-[3px] shrink-0 text-[10px] font-black text-brand">
                        ✓
                      </span>
                      <span className="min-w-0 text-steel">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 入力中。次に相手が出す直前だけ */}
        <div className={`flex justify-start ${typingVisible ? "" : "invisible"}`} aria-hidden>
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
          at("decided") ? "opacity-100" : "opacity-0"
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
