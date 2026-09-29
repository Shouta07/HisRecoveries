"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { PlanId, OptionId } from "@/lib/ask/plans";

// プランを持って相談へ入る導線。
//
// ── 押した瞬間を取る ──────────────────────────────
// 検証したいのは1点だけ。
// 「ChatGPT が無料で使えるのに、それでも払って人に聞くか」。
// そのためには、どのプランを見て、どこから押したかが要る。
// PV は取らない。
//
// ── 金額は運ばない ────────────────────────────────
// URL に載せるのはプランIDだけ。金額を載せると書き換えられる。

export default function PlanCta({
  plan,
  from,
  children,
  category,
  step,
  options,
  assist = false,
  className = "",
}: {
  plan: PlanId;
  /** どこから押されたか。hero / price / final / header など */
  from: string;
  children: ReactNode;
  category?: string;
  /** 恋愛のどの段階から入ったか */
  step?: string;
  /** 最初から付けておくオプション。金額は運ばない（IDだけ） */
  options?: OptionId[];
  /** 質問を書く画面で「一緒に整理する」を開いた状態から始める */
  assist?: boolean;
  className?: string;
}) {
  const q = new URLSearchParams({ plan });
  if (category) q.set("c", category);
  if (step) q.set("step", step);
  if (assist) q.set("assist", "1");
  // オプションは複数付くので、同じ名前で並べる。
  // 金額は載せない。載せると書き換えられる。
  for (const o of options ?? []) q.append("opt", o);
  const href = `/ask?${q.toString()}`;

  return (
    <Link
      href={href}
      onClick={() => track(step ? "step_picked" : "plan_viewed", { plan, from, ...(step ? { step } : {}) })}
      // 文字色は呼ぶ側が決める。面が青のときと白のときで逆になるので、
      // ここで既定を持つと、どちらかが必ず読めなくなる。
      className={`inline-flex min-h-[52px] items-center justify-center font-bold transition-shadow hover:shadow-card-hover ${className}`}
    >
      {children}
    </Link>
  );
}
