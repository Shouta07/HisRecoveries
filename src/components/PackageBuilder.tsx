"use client";

// 選択式の体験ビルダー（第一印象パッケージ用）。
// - 内容を選ぶと目安合計が変動
// - 目的別プリセット（結婚式前 / 駆け込み / ギフト / フル）
// - 予算を入れると「予算内で最優先のおすすめ」を提案
// 専門家への予約・決済は窓口ひとつ。最終価格はヒアリングで提示する前提。
import { useMemo, useState } from "react";
import BookingCTA from "@/components/BookingCTA";

type Option = {
  id: string;
  label: string;
  /** 目安価格（円）。0 は基本料に含む */
  price: number;
  /** 予算内おすすめの優先度（小さいほど優先） */
  priority: number;
  required?: boolean;
};

const OPTIONS: Option[] = [
  { id: "counsel", label: "印象カウンセリング", price: 0, priority: 0, required: true },
  { id: "makeup", label: "メイク（施術＋再現レッスン）", price: 12000, priority: 1 },
  { id: "style", label: "服選び（スタイリスト同行）", price: 15000, priority: 2 },
  { id: "photo", label: "撮影（ビフォーアフター）", price: 10000, priority: 3 },
  { id: "color", label: "パーソナルカラー診断", price: 8000, priority: 4 },
  { id: "hair", label: "ヘアセット", price: 6000, priority: 5 },
  { id: "bone", label: "骨格診断", price: 8000, priority: 6 },
];

const PRESETS: { id: string; label: string; ids: string[] }[] = [
  { id: "wedding", label: "結婚式前", ids: ["counsel", "color", "makeup", "style", "photo", "hair"] },
  { id: "rush", label: "駆け込み（1日）", ids: ["counsel", "makeup", "hair"] },
  { id: "gift", label: "ギフト", ids: ["counsel", "makeup", "style", "photo"] },
  { id: "full", label: "フル", ids: OPTIONS.map((o) => o.id) },
];

const yen = (n: number) => `¥${n.toLocaleString("en-US")}`;
const required = new Set(OPTIONS.filter((o) => o.required).map((o) => o.id));

export default function PackageBuilder() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(required));
  const [budget, setBudget] = useState<string>("");

  const total = useMemo(
    () => OPTIONS.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.price, 0),
    [selected]
  );
  const budgetNum = budget ? parseInt(budget.replace(/[^\d]/g, ""), 10) || 0 : 0;
  const overBudget = budgetNum > 0 && total > budgetNum;

  // 予算内で、優先度の高い順に入るだけ入れた「おすすめ」
  const suggested = useMemo(() => {
    if (!budgetNum) return null;
    const ids = new Set(required);
    let sum = 0;
    for (const o of [...OPTIONS].filter((o) => !o.required).sort((a, b) => a.priority - b.priority)) {
      if (sum + o.price <= budgetNum) {
        ids.add(o.id);
        sum += o.price;
      }
    }
    return { ids, sum };
  }, [budgetNum]);

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
      <div className="text-[12px] font-medium text-[#85AB8B]">内容を選ぶ（パーソナライズ）</div>
      <p className="text-[11px] text-[#9FB0A0] mt-1 mb-4">専門家への予約・決済は、窓口ひとつで。</p>

      {/* 目的別プリセット */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(new Set(p.ids))}
            className="text-[11.5px] text-[#D7DED2] bg-white/[0.05] border border-white/15 hover:border-[#85AB8B]/60 rounded-full px-3 py-1 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

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

      {/* budget */}
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

      {/* 予算内おすすめ */}
      {budgetNum > 0 && suggested && (
        <button
          type="button"
          onClick={() => setSelected(new Set(suggested.ids))}
          className="mt-2 w-full text-left rounded-lg bg-[#85AB8B]/10 border border-[#85AB8B]/30 px-3 py-2 text-[11.5px] text-[#D7DED2] hover:bg-[#85AB8B]/20 transition-colors"
        >
          予算内のおすすめ（{yen(suggested.sum)}）にする — 優先度の高い順に組み合わせます ›
        </button>
      )}

      {/* total */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
        <span className="text-[12px] text-[#9FB0A0]">目安合計</span>
        <span className="text-[1.5rem] font-bold text-[#EDF1E8] leading-none">{yen(total)}</span>
      </div>
      {overBudget ? (
        <p className="mt-2 text-[11.5px] text-[#E9B7A8]">
          ご予算を上回っています。「予算内のおすすめ」か、ヒアリングで優先順位をつけて調整します。
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
