"use client";

import Link from "next/link";
import { useState } from "react";
import { plan as getPlan, priceOf, DEFAULT_PLAN, type PlanId } from "@/lib/ask/plans";
import { track } from "@/lib/analytics";

// 結果のあとに、次を出す。
//
// ── 押し売りにしない ──────────────────────────────
// 4つ並べて、そのうち1つは「このままいく」。
// 何も買わずに閉じるのが、いちばん上に来る選択肢であること。
// 買う側の3つは、選んだあとに初めて金額が出る。
//
// ── 出せないものは、出せないと書く ────────────────
// 1対1で話す商品は、まだ受け入れ手順がない。
// 「近日公開」とだけ書いて押させない。押せない形にする。

type Choice = {
  id: string;
  label: string;
  note: string;
  plan?: PlanId;
  href?: string;
};

// 次に出すのは、いまの場面の次に来るものだけ。
// 「ほかの商品を見る」にしない。恋愛の進み方に沿わせる。
//   見てもらった → マッチした → 会話を試す → 会う日が決まった → 本番を再現する
//                              → この相手について決める
const CHOICES: Choice[] = [
  {
    id: "go",
    label: "このままいく",
    note: "反応は見た。あとは自分で決める。",
  },
  {
    id: "again",
    label: "別のものも見てもらう",
    note: "直した文面や、ほかの場面のもの。",
    plan: DEFAULT_PLAN,
  },
  {
    id: "chat",
    label: "会話が続かない",
    note: "本番の前に、一度だけ女性相手にやりとりしてみる。",
    plan: "mockchat",
  },
  {
    id: "decide",
    label: "この相手について決めたい",
    note: "一般論ではなく、目の前の一人をどうするか。",
    plan: "session",
  },
];

export default function NextStep({ token }: { token: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = CHOICES.find((c) => c.id === picked);
  const p = choice?.plan ? getPlan(choice.plan) : null;

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="text-big font-black">次、どうする？</h2>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {CHOICES.map((c) => {
          const cp = c.plan ? getPlan(c.plan) : null;
          const on = picked === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setPicked(on ? null : c.id);
                  if (!on) track("next_step_picked", { step: c.id });
                }}
                className={`flex min-h-[88px] w-full flex-col justify-center rounded-card border p-5 text-left transition-shadow ${
                  on
                    ? "border-brand bg-brand-tint shadow-card"
                    : "border-line bg-paper shadow-card hover:shadow-card-hover"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-[15.5px] font-bold">{c.label}</span>
                  {cp && !cp.available && (
                    <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                      受付前
                    </span>
                  )}
                </span>
                <span className="mt-1.5 text-[12.5px] leading-[1.7] text-steel">{c.note}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* 選んだあとに、初めて金額を出す */}
      {choice && (
        <div className="motion-safe:animate-hr-rise mt-5 rounded-card border border-line bg-mist p-5">
          {!p ? (
            <p className="text-[14.5px] leading-[1.9] text-steel">
              それがいちばんいいと思います。決めるのはあなたです。
              またいつでも聞けます。
            </p>
          ) : !p.available ? (
            <>
              <p className="text-[14.5px] leading-[1.9] text-steel">
                {p.name}は、まだ受け付けていません。
                相手も実在の人なので、時間を決めた受け入れ方と、
                その場を見る体制が用意できてから開きます。
              </p>
              <Link
                href="/how"
                className="mt-3 inline-flex min-h-[44px] items-center text-[13.5px] font-bold text-brand underline decoration-line underline-offset-4"
              >
                仕組みを見る
              </Link>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[15.5px] font-black">{p.name}</p>
                <p className="text-[24px] font-black tabular-nums leading-none">
                  ¥{priceOf(p.id).toLocaleString()}
                  {p.from && <span className="ml-1 text-[13px] text-steel">〜</span>}
                </p>
              </div>
              <ul className="mt-4 flex flex-col gap-1.5">
                {p.includes.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.75]">
                    <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                      ✓
                    </span>
                    <span className="min-w-0 text-steel">{x}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/ask?plan=${p.id}&from=${encodeURIComponent(token)}`}
                onClick={() => track("plan_viewed", { plan: p.id, from: "next_step" })}
                className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
              >
                これで進む
              </Link>
            </>
          )}
        </div>
      )}
    </section>
  );
}
