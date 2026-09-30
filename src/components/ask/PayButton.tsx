"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { plan as getPlan, isSellable, DEFAULT_PLAN, type PlanId } from "@/lib/ask/plans";
import Yen from "@/components/brand/Yen";
import PurchaseTerms from "@/components/ask/PurchaseTerms";

// 支払いへ進む。
//
// ── 相談を作ったあとに、ここへ落ちてくる ──────────
// 通常は相談を出した流れでそのまま Stripe へ飛ぶ。
// 飛べなかったとき（法令の表記が未完成・決済の設定が無い・通信が切れた）
// と、途中でやめて戻ってきたときの受け皿がここ。
//
// ── 理由を隠さない ────────────────────────────────
// 「エラーが発生しました」では、待てばよいのか諦めるのかが分からない。
// API が返した理由をそのまま出す。
//
// ── 押す直前に、何が返ってくるかを書く ────────────
// 商品名と金額だけを出して押させない。
// 押す人が最後に見る画面はここなので、
// 何人が読むのか、何が返ってくるのか、揃わなかったらどうなるのかを
// この枠の中で完結させる。別のページに飛ばさない。

export default function PayButton({
  token,
  planId,
  canceled = false,
}: {
  token: string;
  planId?: string | null;
  canceled?: boolean;
}) {
  const id: PlanId = isSellable(planId) ? planId : DEFAULT_PLAN;
  const p = getPlan(id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe の画面から戻ってきた（＝払わずに閉じた）。
  // ここが多いなら、止まっているのは商品ではなく決済画面の手前。
  // 1回の来訪で1回だけ送る（戻るを何度も押されても増やさない）。
  useEffect(() => {
    if (!canceled) return;
    const key = `hr_canceled_${id}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    track("checkout_abandoned", { plan: id });
  }, [canceled, id]);

  async function go() {
    if (busy) return;
    setBusy(true);
    setError(null);
    track("checkout_started", { plan: id });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, plan: id }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && typeof json.url === "string") {
        window.location.assign(json.url);
        return;
      }
      track("checkout_blocked", { plan: id, why: String(json.error ?? res.status) });
      setError(json.error ?? "いまお支払いを開始できません");
      setBusy(false);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-card border border-brand bg-paper p-6 shadow-card">
      {canceled && (
        <p className="mb-4 rounded-soft bg-mist px-3.5 py-2.5 text-[13px] leading-[1.8] text-steel">
          お支払いは完了していません。内容はそのまま残してあります。
        </p>
      )}

      <p className="text-[12px] font-bold text-steel">お支払い内容</p>
      <div className="mt-2.5 flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-[15.5px] font-black leading-[1.5]">{p.name}</p>
        <p className="shrink-0 text-[28px] font-black tabular-nums leading-none">
          <Yen yen={p.yen} />
        </p>
      </div>

      {/* 押す直前に、返ってくるものを出す。別のページに戻らせない */}
      <div className="mt-5 rounded-soft bg-mist px-4 py-4">
        <p className="text-[12px] font-bold text-steel">
          {p.talk
            ? "この相談で受け取るもの"
            : `実在の女性${p.answers}人が読んで、返ってくるもの`}
        </p>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {p.includes.map((x) => (
            <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.7]">
              <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                ✓
              </span>
              <span className="min-w-0 text-slate">{x}</span>
            </li>
          ))}
        </ul>
        {!p.talk && (
          <p className="mt-3 border-t border-line pt-3 text-[12px] leading-[1.8] text-steel">
            {p.answers}人そろわなかったときは、足りない分をお返しします。
            全額返してもらうことも選べます。
          </p>
        )}
      </div>

      {/* 何を買うのか（回数・期限・キャンセル・相手）は、ここで出しきる。
          Stripe の画面には商品名と金額しか出ない */}
      <PurchaseTerms plan={p} />

      {error && (
        <p className="mt-4 rounded-soft border border-slate px-4 py-3 text-[13.5px] leading-[1.85]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="mt-5 inline-flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-7 text-[15.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover disabled:bg-mist disabled:text-steel disabled:shadow-none"
      >
        {busy ? "進んでいます…" : `¥${p.yen.toLocaleString()} を支払って相談する`}
      </button>

      <p className="mt-4 text-[12px] leading-[1.85] text-steel">
        カード情報は Stripe が扱います。お支払いのあとに、回答者への募集を始めます。
      </p>
    </div>
  );
}
