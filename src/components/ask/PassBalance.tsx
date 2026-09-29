"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 残り回数。
//
// ══════════════════════════════════════════════════
// 隠さない
// ══════════════════════════════════════════════════
// 残りが見えにくいのは、使い切ったことに気づかせない売り方。
// いちばん上に、いちばん大きく出す。
//
// ══════════════════════════════════════════════════
// 煽らない
// ══════════════════════════════════════════════════
// 目的は「まだ使える」と思い出してもらうこと。
// 期限も、カウントダウンも、赤い数字も出さない。
//
// ══════════════════════════════════════════════════
// 数字はサーバーから
// ══════════════════════════════════════════════════
// 端末に持っている鍵で聞きにいく。
// ここで数えない（数え方が画面ごとにずれる）。

type Balance = { remaining: number; total: number; used: number };

export default function PassBalance() {
  const [b, setB] = useState<Balance | null>(null);
  const [state, setState] = useState<"loading" | "none" | "ok">("loading");

  useEffect(() => {
    let live = true;
    let token: string | null = null;
    try {
      token = localStorage.getItem("hr_pass");
    } catch {
      // 使えない端末。持っていないものとして出す
    }
    if (!token) {
      setState("none");
      return;
    }
    void fetch(`/api/pass/${token}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!live) return;
        if (j && typeof j.remaining === "number") {
          setB({ remaining: j.remaining, total: j.total, used: j.used });
          setState("ok");
        } else {
          setState("none");
        }
      })
      .catch(() => live && setState("none"));
    return () => {
      live = false;
    };
  }, []);

  // 持っていない人には出さない。
  // 「0回」と出すと、買わされている感じになる。
  if (state !== "ok" || !b) return null;

  const left = b.remaining;

  return (
    <div className="rounded-card border border-brand bg-brand-tint px-5 py-5">
      {left > 0 ? (
        <>
          <p className="text-[13px] font-bold text-brand-deep">確かめる</p>
          <p className="mt-1 text-[30px] font-black leading-none tabular-nums text-brand-deep">
            あと{left}回
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.75] text-steel">
            {b.total}回のうち{b.used}回を使いました。期限はありません。
          </p>
          <Link
            href="/ask"
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card"
          >
            ＋ 新しく確かめる
          </Link>
        </>
      ) : (
        <>
          <p className="text-[15px] font-black leading-[1.6] text-brand-deep">
            {b.total}回すべて使いました。
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.85] text-steel">
            また迷った時のために、5回分を足しておけます。
            自動では買いません。
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[15px] font-bold text-brand shadow-card"
          >
            5回追加する
          </Link>
        </>
      )}
    </div>
  );
}
