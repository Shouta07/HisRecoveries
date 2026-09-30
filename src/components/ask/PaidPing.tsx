"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { plan as getPlan, isPlanId } from "@/lib/ask/plans";

// 支払いが済んだことを、1回だけ数える。
//
// ── なぜ要るか ────────────────────────────────────
// purchase_paid は一覧には載っていたのに、どこからも送られていなかった。
// 決済完了率の分子が永久に0で、広告の媒体にも成果が1件も渡らない。
// 媒体は受け取った成果で配信を寄せるので、渡さないと最適化が回らない。
//
// ── 確定は Webhook 側 ─────────────────────────────
// ここは「利用者が完了まで来た」の意味しかない。
// 売上の数字は payments（Stripe が確定させたもの）だけを見る。
//
// ── 1相談につき1回 ────────────────────────────────
// この画面は回答を見に何度も開かれる。開くたびに送ると、
// 決済完了数が実際の何倍にもなる。相談ごとに印を残して止める。
//
// ── あとから何を見たいか ──────────────────────────
// plan だけだと、1回売りとパスの選ばれ方が比べられない。
// 家族（文章／声）・買い方（単発／パス）・回数も一緒に送る。
//   単発とパスのどちらが選ばれているか
//   文章と声で、その比率が違うか
//   パスを買った人が、実際に何回使ったか
// 金額は plans.ts から引く。画面から渡された数字は使わない。

export default function PaidPing({
  token,
  plan,
  yen,
}: {
  token: string;
  plan: string;
  /** 税込の円。サーバが入れた金額をそのまま渡す */
  yen: number;
}) {
  useEffect(() => {
    const key = `hr_paid_${token}`;
    try {
      if (localStorage.getItem(key) === "1") return;
      localStorage.setItem(key, "1");
    } catch {
      // 保存できない環境では送らない。
      // 二重に数えるより、数えないほうが判断を誤らせない。
      return;
    }
    const p = isPlanId(plan) ? getPlan(plan) : null;
    track("purchase_paid", {
      plan,
      value: yen,
      currency: "JPY",
      // 文章か声か
      family: p?.family ?? "unknown",
      // 単発か、まとめ買いか
      purchase_type: p?.uses ? "pass" : "single",
      // 何回ぶん付いたか
      credits: p?.uses ?? 1,
    });
  }, [token, plan, yen]);

  return null;
}
