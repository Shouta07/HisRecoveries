"use client";

// 選択式の体験ビルダー（第一印象パッケージ用）。項目を選ぶと目安合計が変動。
// 最終価格はパーソナルなヒアリングに基づき提示する前提（目安のみ表示）。
import { useMemo, useState } from "react";
import BookingCTA from "@/components/BookingCTA";

type Option = {
  id: string;
  label: string;
  /** 目安価格（円）。0 は基本料に含む */
  price: number;
  required?: boolean;
};

const OPTIONS: Option[] = [
  { id: "counsel", label: "印象カウンセリング", price: 0, required: true },
  { id: "color", label: "パーソナルカラー診断", price: 8000 },
  { id: "bone", label: "骨格診断", price: 8000 },
  { id: "makeup", label: "メイク（施術＋再現レッスン）", price: 12000 },
  { id: "style", label: "服選び（スタイリスト同行）", price: 15000 },
  { id: "hair", label: "ヘアセット", price: 6000 },
  { id: "photo", label: "撮影（ビフォーアフター）", price: 10000 },
];

const yen = (n: number) => `¥${n.toLocaleString("en-US")}`;

export default function PackageBuilder() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(OPTIONS.filter((o) => o.required).map((o) => o.id))
  );
  const [budget, setBudget] = useState<string>("");

  const total = useMemo(
    () => OPTIONS.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.price, 0),
    [selected]
  );
  const budgetNum = budget ? parseInt(budget.replace(/[^\d]/g, ""), 10) || 0 : 0;
  const overBudget = budgetNum > 0 && total > budgetNum;

  function toggle(o: Option) {
    if (o.required) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(o.id) ? next.delete(o.id) : next.add(o.id);
      return next;
    });
  }

  return (
    <div className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6">
      <div className="text-[12px] font-medium text-[#85AB8B] mb-4">内容を選ぶ（パーソナライズ）</div>

      <div className="space-y-2">
        {OPTIONS.map((o) => {
          const on = selected.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o)}
              aria-pressed={on}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                on ? "bg-[#85AB8B]/15 border-[#85AB8B]/40" : "bg-white/[0.03] border-white/10 hover:border-white/25"
              } ${o.required ? "cursor-default" : "cursor-pointer"}`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid place-items-center w-4 h-4 rounded-[5px] border ${
                    on ? "bg-[#85AB8B] border-[#85AB8B]" : "border-white/40"
                  }`}
                  aria-hidden
                >
                  {on && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16241a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-[13px] text-[#EDF1E8]">{o.label}</span>
              </span>
              <span className="text-[11.5px] text-[#9FB0A0] shrink-0">
                {o.price === 0 ? "基本に含む" : `+${yen(o.price)}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* budget (optional) */}
      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="pb-budget" className="text-[12px] text-[#9FB0A0] shrink-0">ご予算（任意）</label>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FB0A0] text-[13px]">¥</span>
          <input
            id="pb-budget"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="30,000"
            className="w-full rounded-lg bg-white/[0.06] border border-white/15 pl-7 pr-3 py-2 text-[13px] text-[#EDF1E8] placeholder:text-white/30 outline-none focus:border-[#85AB8B]/60"
          />
        </div>
      </div>

      {/* total */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
        <span className="text-[12px] text-[#9FB0A0]">目安合計</span>
        <span className="text-[1.5rem] font-bold text-[#EDF1E8] leading-none">{yen(total)}</span>
      </div>
      {overBudget ? (
        <p className="mt-2 text-[11.5px] text-[#E9B7A8]">
          ご予算を上回っています。ヒアリングで、優先順位をつけて調整します。
        </p>
      ) : (
        <p className="mt-2 text-[11.5px] text-[#9FB0A0]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。
        </p>
      )}

      <div className="mt-5">
        <BookingCTA className="w-full text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-6 py-3.5 rounded-full transition-colors">
          この内容で相談する
        </BookingCTA>
      </div>
    </div>
  );
}
