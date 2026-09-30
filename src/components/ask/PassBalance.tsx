"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { expiryLabel } from "@/lib/ask/pass";
import { plan as getPlan, isPlanId, type PlanId } from "@/lib/ask/plans";

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
// カウントダウンも、赤い数字も出さない。
//
// 期限は出す。出さないほうが煽らないように見えるが、
// 画面に出ていない期限で消えるのがいちばん悪い。
// 「あと12日」ではなく日付で書く（pass.ts の expiryLabel）。
//
// ══════════════════════════════════════════════════
// 財布にしない
// ══════════════════════════════════════════════════
// 残高・チャージ・ウォレットの見た目にしない。
// 持っているのは金額ではなく、確かめられる回数。
//
// ══════════════════════════════════════════════════
// 数字はサーバーから
// ══════════════════════════════════════════════════
// 端末に持っている鍵で聞きにいく。
// ここで数えない（数え方が画面ごとにずれる）。

type Balance = {
  remaining: number;
  total: number;
  used: number;
  plan: string;
  expiresAt: string | null;
  expired: boolean;
};

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
          setB({
            remaining: j.remaining,
            total: j.total,
            used: j.used,
            plan: String(j.plan ?? ""),
            expiresAt: j.expiresAt ?? null,
            expired: Boolean(j.expired),
          });
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
  // 声のパスか、文章のパスか。持っているものの名前を出す。
  // 「あと4回」だけだと、何が4回なのか分からない。
  const p = isPlanId(b.plan) ? getPlan(b.plan) : null;
  const what = p?.callMinutes ? `声で確かめる（1回 ${p.callMinutes}分）` : "確かめる";
  const until = expiryLabel({
    token: "",
    plan: (p?.id ?? "review") as PlanId,
    total: b.total,
    used: b.used,
    remaining: b.remaining,
    expiresAt: b.expiresAt,
    expired: b.expired,
  });

  // 期限が切れている。残りがあっても使えない。
  // 数は出したまま伏せない（何回ぶん切れたかが分かるように）。
  if (b.expired) {
    return (
      <div className="rounded-card border border-line bg-mist px-5 py-5">
        <p className="text-[15px] font-black leading-[1.6] text-slate">
          {until}
        </p>
        <p className="mt-2 text-[12.5px] leading-[1.85] text-steel">
          {left > 0 ? `使わなかった${left}回分があります。` : ""}
          また確かめたいときは、その都度お申し込みいただけます。
        </p>
        <Link
          href="/plans"
          className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[15px] font-bold text-brand shadow-card"
        >
          料金を見る
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-brand bg-brand-tint px-5 py-5">
      {left > 0 ? (
        <>
          <p className="text-[13px] font-bold text-brand-deep">{what}</p>
          <p className="mt-1 text-[30px] font-black leading-none tabular-nums text-brand-deep">
            あと{left}回
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.75] text-steel">
            {b.total}回のうち{b.used}回を使いました。
            {until ? `${until}ご利用いただけます。` : "期限はありません。"}
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
            自動では買いません。次に迷ったときに、その都度お申し込みください。
          </p>
          <Link
            href="/plans"
            className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[15px] font-bold text-brand shadow-card"
          >
料金を見る
          </Link>
        </>
      )}
    </div>
  );
}
