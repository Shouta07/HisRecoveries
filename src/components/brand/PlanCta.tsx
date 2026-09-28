"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { PlanId } from "@/lib/ask/plans";

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
  className = "",
}: {
  plan: PlanId;
  /** どこから押されたか。hero / price / final / header など */
  from: string;
  children: ReactNode;
  category?: string;
  className?: string;
}) {
  const href = category
    ? `/ask?c=${encodeURIComponent(category)}&plan=${plan}`
    : `/ask?plan=${plan}`;

  return (
    <Link
      href={href}
      onClick={() => track("plan_viewed", { plan, from })}
      // 文字色は呼ぶ側が決める。面が青のときと白のときで逆になるので、
      // ここで既定を持つと、どちらかが必ず読めなくなる。
      className={`inline-flex min-h-[52px] items-center justify-center font-bold transition-shadow hover:shadow-card-hover ${className}`}
    >
      {children}
    </Link>
  );
}
