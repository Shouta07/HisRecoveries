"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STEPS } from "@/lib/ask/journey";

// 相手ごとの現在地。
//
// ══════════════════════════════════════════════════
// 人は伴走しない。文脈が伴走する
// ══════════════════════════════════════════════════
// 専属のコーチは置かない。置いたら人件費が売上に比例する。
// 代わりに「いまどこにいるか」をこちらが持っておく。
//
// ══════════════════════════════════════════════════
// 相手の情報は出さない
// ══════════════════════════════════════════════════
// 出すのは、本人が付けた呼び名と、出会ったところと、現在地だけ。
// 相手はこのサービスに同意していない第三者。

type Case = {
  token: string;
  partner_label: string | null;
  dating_app: string | null;
  current_stage: string | null;
  last_decision: string | null;
  updated_at: string;
};

export default function CaseTimeline() {
  const [cases, setCases] = useState<Case[] | null>(null);

  useEffect(() => {
    let live = true;
    let pass: string | null = null;
    try {
      pass = localStorage.getItem("hr_pass");
    } catch {
      // 使えない端末。ケースは出さない
    }
    if (!pass) {
      setCases([]);
      return;
    }
    void fetch(`/api/cases?pass=${encodeURIComponent(pass)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setCases(Array.isArray(j?.cases) ? j.cases : []))
      .catch(() => live && setCases([]));
    return () => {
      live = false;
    };
  }, []);

  if (!cases || cases.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-[15px] font-black text-slate">相手ごとの現在地</h2>
      <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
        前回の続きから相談できます。毎回ゼロから説明し直す必要はありません。
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {cases.map((c) => {
          const at = STEPS.findIndex((s) => s.id === c.current_stage);
          return (
            <li
              key={c.token}
              className="rounded-card border border-line bg-paper px-5 py-4 shadow-card"
            >
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-[14.5px] font-black text-slate">
                  {c.partner_label || "名前をつけていない相手"}
                </span>
                {c.dating_app && (
                  <span className="text-[12px] text-steel">{c.dating_app}</span>
                )}
              </div>

              {/* 段。いまどこかだけ分かればよい */}
              <ol className="mt-3 flex flex-col gap-1">
                {STEPS.map((s, i) => {
                  const done = at >= 0 && i < at;
                  const here = at === i;
                  return (
                    <li
                      key={s.id}
                      className={`flex items-center gap-2 text-[12.5px] leading-[1.6] ${
                        here ? "font-black text-brand-deep" : done ? "text-slate" : "text-steel"
                      }`}
                    >
                      <span aria-hidden className="w-3.5 shrink-0 text-center">
                        {done ? "✓" : here ? "→" : "・"}
                      </span>
                      <span className="min-w-0">{s.label}</span>
                      {here && <span className="text-[11px] text-brand">今ここ</span>}
                    </li>
                  );
                })}
              </ol>

              {c.last_decision && (
                <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-[1.75] text-steel">
                  前回決めたこと：
                  <span className="font-bold text-slate">{c.last_decision}</span>
                </p>
              )}

              <Link
                href={`/ask?case=${encodeURIComponent(c.token)}`}
                className="mt-3 inline-flex min-h-[44px] items-center text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
              >
                この続きから確かめる →
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
