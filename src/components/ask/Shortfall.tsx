"use client";

import { useState } from "react";
import { choices, type Choice } from "@/lib/ask/shortfall";
import type { PlanId } from "@/lib/ask/plans";
import { track } from "@/lib/analytics";

// 人数が集まらなかったとき、相談した人に選んでもらう。
//
// ── こちらから出す ────────────────────────────────
// 問い合わせを待たない。一定の時間が過ぎたら、この3つを出す。
// 待たせたまま黙っているのが、いちばん信用を失う。
//
// ── 全額返金を隠さない ────────────────────────────
// 3つとも同じ大きさで並べる。返金を小さく置かない。

export default function Shortfall({
  token,
  planId,
  got,
  want,
}: {
  token: string;
  planId: PlanId;
  got: number;
  want: number;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list: Choice[] = choices(planId, got, want);

  async function pick(c: Choice) {
    if (busy) return;
    setBusy(c.id);
    setError(null);
    try {
      const r = await fetch("/api/consult/shortfall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, choice: c.id }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? "受け付けられませんでした");
        setBusy(null);
        return;
      }
      track("shortfall_picked", { choice: c.id, got, of: want });
      setDone(
        c.id === "widen"
          ? "条件を広げて、もう一度お声がけします。"
          : `¥${Number(j.refunded ?? 0).toLocaleString()} をお返しします。カード会社の処理に数日かかります。`,
      );
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setBusy(null);
    }
  }

  if (done) {
    return (
      <div className="mt-8 rounded-card border border-ok bg-ok-tint p-5">
        <p className="text-[14.5px] leading-[1.9] text-slate">{done}</p>
      </div>
    );
  }

  return (
    <section className="mt-8 rounded-card border border-brand bg-paper p-6 shadow-card">
      <p className="text-[16px] font-black">
        {got}人まで届きましたが、{want}人には届きませんでした。
      </p>
      <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">
        条件に合う方が、いま少ないようです。どうするか選んでください。
        待たせたままにはしません。
      </p>

      <ul className="mt-5 flex flex-col gap-2.5">
        {list.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => pick(c)}
              disabled={busy !== null}
              className="flex w-full flex-col rounded-card border border-line bg-paper p-4 text-left shadow-card transition-shadow hover:shadow-card-hover disabled:opacity-60"
            >
              <span className="text-[15px] font-bold">
                {busy === c.id ? "受け付けています…" : c.label}
              </span>
              <span className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">{c.note}</span>
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-4 rounded-soft border border-slate px-4 py-3 text-[13.5px] leading-[1.85]">
          {error}
        </p>
      )}
    </section>
  );
}
