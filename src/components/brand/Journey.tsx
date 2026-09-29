"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Slot from "@/components/brand/Slot";
import StepIcon from "@/components/brand/StepIcon";
import Reveal from "@/components/brand/Reveal";
import { STEPS, isOpen as stepOpen, type Step } from "@/lib/ask/journey";
import { CASES, type Case } from "@/lib/ask/cases";
import { plan as getPlan } from "@/lib/ask/plans";
import { VERDICTS } from "@/lib/ask/model";
import type { ImageKey } from "@/lib/images";
import { track } from "@/lib/analytics";

// 恋愛の道のりと、その場面。
//
// ══════════════════════════════════════════════════
// 節を2つに分けない
// ══════════════════════════════════════════════════
// 「今どの分岐点にいますか」と「こんな選択を、選ぶ前に」を
// 別の節にしていた。同じことを2回言っていて、
// しかも段を押すと別のページへ飛んでいた。
//
// 見たいのは「その段で、実際に何が返ってくるのか」。
// それを見るためにページを移らせると、そこで帰る。
//
// 段を押したら、その場で開く。中で見てから決めてもらう。
//
// ══════════════════════════════════════════════════
// 開いたものは、必ず閉じられること
// ══════════════════════════════════════════════════
// Esc、背景、×。3つとも効く。
// 開いているあいだは後ろを動かさない（閉じたとき元の場所に戻る）。
//
// body に出す。ヘッダーが backdrop-blur を持っているので、
// その中で fixed を使うとヘッダーの高さに閉じ込められる。
//
// ══════════════════════════════════════════════════
// 中身は作らない
// ══════════════════════════════════════════════════
// 出る文面も回答も cases.ts のもの。ここで書き足さない。
// 顔に職業を付けない（付けた時点で実在の回答者の名簿になる）。

/** 回答する側の顔。場面ごとに2人ずつ、重ならないように配る */
const FACES: ImageKey[][] = [
  ["w1", "w2"],
  ["w3", "w4"],
  ["w5", "w1"],
  ["w2", "w3"],
  ["w4", "w5"],
];

const TONE: Record<string, string> = {
  change: "bg-rose-fill text-paper",
  slight: "bg-brand-tint text-brand",
  as_is: "bg-mist text-steel",
};

function caseOf(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

/* ── 開いたときに出る中身 ───────────────────────── */

function CaseBlock({ c, row }: { c: Case; row: number }) {
  return (
    <article className="rounded-card border border-line bg-paper p-4 sm:p-5">
      <p className="text-[11.5px] font-bold text-steel">{c.scene}</p>
      <h4 className="mt-1 text-[16.5px] font-black leading-[1.45] text-slate">{c.decision}</h4>
      <p className="mt-2 text-[13px] leading-[1.8] text-steel">{c.what}</p>

      {c.says.length === 0 ? (
        <p className="mt-4 rounded-soft bg-mist px-4 py-3.5 text-[13px] leading-[1.85] text-steel">
          この場面はまだ受け付けていません。相手も実在の女性なので、
          時間の決め方と、その場を見る体制が用意できてから開きます。
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-card border border-line px-4 py-3.5">
            <p className="text-[11px] font-bold leading-none text-brand">{c.draft.label}</p>
            <p className="mt-2 text-[13.5px] font-bold leading-[1.65] text-slate">{c.draft.text}</p>
          </div>

          <ul className="mt-2.5 flex flex-col gap-2">
            {c.says.map((s, i) => {
              const v = VERDICTS.find((x) => x.id === s.verdict);
              return (
                <li key={s.age} className="rounded-card bg-mist px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Slot
                      name={FACES[row % FACES.length][i % 2]}
                      rounded="rounded-full"
                      className="h-7 w-7 shrink-0"
                    />
                    {/* 年代だけ。職業は付けない */}
                    <span className="text-[11px] font-bold text-steel">{s.age}歳</span>
                    <span
                      className={`ml-auto shrink-0 rounded-pill px-2 py-[3px] text-[10px] font-bold leading-none ${
                        TONE[s.verdict] ?? "bg-paper text-steel"
                      }`}
                    >
                      {v?.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-[1.7] text-slate">{s.say}</p>
                </li>
              );
            })}
          </ul>

          {/* 材料を見たあと、決めるのは本人 */}
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-3 text-[12.5px] leading-[1.7]">
            <span className="font-bold text-steel">見て、決めたこと</span>
            <span className="min-w-0 font-bold text-slate">{c.decided}</span>
          </p>
        </>
      )}
    </article>
  );
}

function Sheet({ step, onClose }: { step: Step; onClose: () => void }) {
  const open = stepOpen(step);
  const p = getPlan(step.plan);
  const cases = step.cases.map(caseOf).filter((c): c is Case => Boolean(c));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${step.label}の場面`}
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-slate/55"
      />

      <div className="motion-safe:animate-hr-rise relative flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-card bg-paper shadow-card-hover sm:rounded-card">
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
          >
            <StepIcon name={step.icon} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-black leading-[1.4] text-slate">{step.label}</p>
            <p className="mt-0.5 text-[12.5px] leading-[1.6] text-steel">{step.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-steel transition-colors hover:bg-mist"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[12.5px] font-bold text-steel">この段で迷うこと</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {step.choices.map((t) => (
              <li
                key={t}
                className="rounded-pill border border-line bg-mist px-2.5 py-1 text-[12px] font-bold text-slate"
              >
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[12.5px] font-bold text-steel">実際に返ってくるもの</p>
          <div className="mt-2 flex flex-col gap-2.5">
            {cases.map((c, i) => (
              <CaseBlock key={c.id} c={c} row={i} />
            ))}
          </div>

          <p className="mt-4 text-[11.5px] leading-[1.75] text-steel">
            ※ 写真はイメージ、文面と回答は画面の見本です。特定の利用者の体験談ではありません。
          </p>
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-black text-slate">{p.name}</span>
            <span className="text-[15px] font-black tabular-nums text-slate">
              ¥{p.yen.toLocaleString()}
            </span>
            {!open && (
              <span className="rounded-pill bg-mist px-2 py-1 text-[10px] font-bold leading-none text-steel">
                受付前
              </span>
            )}
          </div>
          {open ? (
            <Link
              href={`/ask?plan=${p.id}&c=${step.category}&step=${step.id}`}
              onClick={() => track("plan_viewed", { plan: p.id, from: `sheet_${step.id}` })}
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card"
            >
              この段を確かめる <span aria-hidden className="ml-1.5">→</span>
            </Link>
          ) : (
            <Link
              href="/talk"
              className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[15px] font-bold text-brand shadow-card"
            >
              順番待ちに入る <span aria-hidden className="ml-1.5">→</span>
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── 道のり ───────────────────────────────────── */

export default function Journey() {
  const [openId, setOpenId] = useState<string | null>(null);
  const step = STEPS.find((s) => s.id === openId) ?? null;
  const close = useCallback(() => setOpenId(null), []);

  return (
    <>
      <ol className="relative mt-10 flex flex-col gap-4 sm:gap-5">
        {/* 背骨。
            狭い画面で左右に振ると、カード1枚が 40% 幅になって読めない。
            390px では左に1本通し、640px から真ん中へ移して左右に振る。 */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-[13px] w-px bg-line sm:left-1/2 sm:-translate-x-1/2"
        />

        {STEPS.map((j, i) => {
          const open = stepOpen(j);
          const right = i % 2 === 1;
          const p = getPlan(j.plan);

          return (
            <Reveal key={j.id} delay={i * 45}>
              {/* 左右に振ると反対側が空く。1枚目以外を少し上へ引いて詰める */}
              <li className={`relative ${i > 0 ? "sm:-mt-[60px]" : ""}`}>
                <span
                  aria-hidden
                  className={`absolute left-[7px] top-7 h-3 w-3 rounded-full border-2 border-paper sm:left-1/2 sm:top-9 sm:-translate-x-1/2 ${
                    open ? "bg-brand" : "bg-steel"
                  }`}
                />
                <div className={`ml-8 sm:ml-0 sm:w-[46%] ${right ? "sm:ml-auto" : ""}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(j.id);
                      track("step_opened", { step: j.id });
                    }}
                    aria-haspopup="dialog"
                    className={`flex w-full flex-col items-stretch rounded-card border border-line p-4 text-left shadow-card transition-shadow hover:shadow-card-hover sm:p-5 ${
                      open ? "bg-paper" : "bg-mist"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black tabular-nums ${
                          open ? "bg-brand-tint text-brand-deep" : "bg-paper text-steel"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-[15.5px] font-black leading-[1.4] text-slate">
                        {j.label}
                      </span>
                      {open ? (
                        <span aria-hidden className="shrink-0 text-[15px] text-brand">
                          →
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-pill bg-paper px-2 py-1 text-[10px] font-bold leading-none text-steel">
                          受付前
                        </span>
                      )}
                    </span>

                    <span className="mt-3 flex items-start gap-3">
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
                      >
                        <StepIcon name={j.icon} />
                      </span>
                      <span className="min-w-0 flex-1 pt-0.5 text-[13px] font-normal leading-[1.7] text-steel">
                        {j.summary}
                      </span>
                    </span>

                    {/* そこで実際に迷う選択。この節の中身 */}
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {j.choices.map((t) => (
                        <span
                          key={t}
                          className="rounded-pill border border-line bg-mist px-2.5 py-1 text-[11.5px] font-bold text-slate"
                        >
                          {t}
                        </span>
                      ))}
                    </span>

                    <span className="mt-3.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-3 text-[12.5px]">
                      <span className="font-bold text-brand-deep">{p.name}</span>
                      <span className="font-bold tabular-nums text-slate">
                        ¥{p.yen.toLocaleString()}
                      </span>
                      <span className="font-bold text-brand">
                        {open ? "返ってくるものを見る →" : "どんな場面か見る →"}
                      </span>
                    </span>
                  </button>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>

      {step && <Sheet step={step} onClose={close} />}
    </>
  );
}
