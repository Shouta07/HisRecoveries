"use client";

// 選択式の体験デザイナー。
// ① 目的を3択（直す / 自信をつける / 両方）→ ② 中身を選ぶ（単価は出さない）。
// 価格は「目安レンジ」（ギフト〜ハイエンド）で提示し、最終価格はヒアリングで確定。
import { useMemo, useState } from "react";
import BookingCTA from "@/components/BookingCTA";

type Goal = "fix" | "confidence" | "both";

const GOALS: { id: Goal; label: string }[] = [
  { id: "fix", label: "コンプレックスを直す" },
  { id: "confidence", label: "自信をつける" },
  { id: "both", label: "直して、自信をつける" },
];

type Option = { id: string; label: string; goals: Goal[]; required?: boolean };

const OPTIONS: Option[] = [
  { id: "counsel", label: "印象カウンセリング", goals: ["fix", "confidence"], required: true },
  // 直す（原因・ケア・医療連携）
  { id: "diagnosis", label: "現状の分析・見立て（原因）", goals: ["fix"] },
  { id: "skincare", label: "清潔感・スキンケアの型", goals: ["fix"] },
  { id: "medical", label: "医療連携の相談（中立・手数料ゼロ）", goals: ["fix"] },
  // 自信（見せ方・スタイリング）
  { id: "makeup", label: "メイク（施術＋再現レッスン）", goals: ["confidence"] },
  { id: "style", label: "服選び（スタイリスト同行）", goals: ["confidence"] },
  { id: "photo", label: "撮影（ビフォーアフター）", goals: ["confidence"] },
  { id: "color", label: "パーソナルカラー診断", goals: ["confidence"] },
  { id: "hair", label: "ヘアセット", goals: ["confidence"] },
  { id: "bone", label: "骨格診断", goals: ["confidence"] },
];

// 価格は目安レンジ（単価は出さない）。ギフト〜ハイエンドで“刺さる”設計。
const TIERS = [
  { name: "ギフト・お試し", price: "目安 ¥30,000〜", d: "単発の体験から。贈り物にも。" },
  { name: "スタンダード", price: "目安 ¥60,000〜", d: "複数を束ねて、しっかり整える。" },
  { name: "ハイエンド", price: "応相談（完全招待制）", d: "専属が、定着まで一気通貫で伴走。", anchor: true },
];

function visibleFor(goal: Goal) {
  return OPTIONS.filter((o) => goal === "both" || o.goals.includes(goal));
}
function requiredIds(goal: Goal) {
  return new Set(visibleFor(goal).filter((o) => o.required).map((o) => o.id));
}

export default function PackageBuilder() {
  const [goal, setGoal] = useState<Goal>("both");
  const [selected, setSelected] = useState<Set<string>>(() => requiredIds("both"));
  const [budget, setBudget] = useState<string>("");

  const visible = useMemo(() => visibleFor(goal), [goal]);

  function changeGoal(g: Goal) {
    setGoal(g);
    setSelected(requiredIds(g));
  }
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
      {/* ① 目的を選ぶ */}
      <div className="text-[12px] font-medium text-[#85AB8B] mb-3">① 目的を選ぶ</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {GOALS.map((g) => {
          const on = goal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => changeGoal(g.id)}
              aria-pressed={on}
              className={`rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
                on ? "bg-[#85AB8B] border-[#85AB8B] text-[#16241a]" : "bg-white/[0.04] border-white/15 text-[#EDF1E8] hover:border-white/30"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* ② 中身を選ぶ（単価は出さない） */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] font-medium text-[#85AB8B]">② 中身を選ぶ</div>
        <span className="text-[11px] text-[#9FB0A0]">予約・決済は窓口ひとつ</span>
      </div>
      <div className="space-y-2">
        {visible.map((o) => {
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
                <span className={`grid place-items-center w-4 h-4 rounded-[5px] border ${on ? "bg-[#85AB8B] border-[#85AB8B]" : "border-white/40"}`} aria-hidden>
                  {on && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16241a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-[13px] text-[#EDF1E8]">{o.label}</span>
              </span>
              {o.required && <span className="text-[11px] text-[#9FB0A0] shrink-0">含む</span>}
            </button>
          );
        })}
      </div>

      {/* 価格は目安レンジ（ギフト〜ハイエンド） */}
      <div className="mt-6">
        <div className="text-[12px] font-medium text-[#85AB8B] mb-3">価格の目安</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-xl border p-3.5 ${t.anchor ? "bg-[#85AB8B]/10 border-[#85AB8B]/40" : "bg-white/[0.04] border-white/10"}`}
            >
              <div className="text-[12.5px] font-bold text-[#EDF1E8]">{t.name}</div>
              <div className={`text-[12px] mt-0.5 ${t.anchor ? "text-[#85AB8B] font-semibold" : "text-[#9FB0A0]"}`}>{t.price}</div>
              <p className="text-[11px] text-[#9FB0A0] leading-[1.7] mt-1.5">{t.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* budget（任意・ヒアリングの参考） */}
      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="pb-budget" className="text-[12px] text-[#9FB0A0] shrink-0">ご予算の目安（任意）</label>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FB0A0] text-[13px]">¥</span>
          <input
            id="pb-budget"
            inputMode="numeric"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="ご相談で調整します"
            className="w-full rounded-lg bg-white/[0.06] border border-white/15 pl-7 pr-3 py-2 text-[13px] text-[#EDF1E8] placeholder:text-white/30 outline-none focus:border-[#85AB8B]/60"
          />
        </div>
      </div>

      <p className="mt-3 text-[11.5px] text-[#9FB0A0] leading-[1.8]">
        ※ 価格は目安です。選んだ内容とご予算に合わせて、ヒアリング後に最終価格をご提示します。
      </p>

      <div className="mt-5">
        <BookingCTA className="w-full text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-6 py-3.5 rounded-full transition-colors">
          この内容で相談する
        </BookingCTA>
      </div>
    </div>
  );
}
