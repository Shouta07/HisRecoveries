"use client";

// ① 診断の入口 — 「サイトを道具にする」中核。NEWTの検索ボックスに相当。
// 匿名・タップだけで、選んだ悩みを HR の「整える順番」に並べ替えて即返す。
// 返ってくる価値＝仮の順路マップ → 無料相談への心理的距離を縮める。
import { useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

type Worry = { key: string; label: string; area: string; why: string };

// 表示順＝HR の「整える順番」（土台の清潔感 → 個別 → 内側）。結果はこの順に並ぶ。
const WORRIES: Worry[] = [
  { key: "impression", label: "清潔感・第一印象", area: "impression", why: "すべての土台。ここが整うと、他の努力も効きはじめます。" },
  { key: "hair", label: "薄毛・髪", area: "hair", why: "進行性のため、早く現在地を知るほど選べる幅が広がります。" },
  { key: "skin", label: "肌・ニキビ", area: "skin", why: "炎症・乾燥・摩擦から。跡は新しいものと分けて考えます。" },
  { key: "face", label: "老け見え・疲れ顔", area: "face", why: "睡眠・むくみ・表情から。今日から動かせる部分が多い。" },
  { key: "bodyhair", label: "ヒゲ・体毛", area: "body-hair", why: "整える・減らす・そのまま。目的から手段を選びます。" },
  { key: "mind", label: "睡眠・気分・習慣", area: "mind", why: "内側が整うと、同じ見た目でも生き生きして見えます。" },
];

export default function QuickDiagnosis() {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // 選んだ悩みを「整える順番」（WORRIES の並び）にソートして返す。
  const roadmap = WORRIES.filter((w) => picked.includes(w.key));

  return (
    <section id="diagnosis" className="relative z-10 scroll-mt-20 bg-[#f4f6f2]">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#85AB8B]">30秒・無料・匿名</div>
            <h2 className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4]" style={HEAD}>
              何から整える？ <span className="text-[#9ec4a3]">順番を、その場で。</span>
            </h2>
            <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-[#C9D2C4] leading-[1.8]">
              気になるものを選ぶだけ。あなたに合わせた「整える順番」を、すぐにお見せします。
            </p>
          </div>

          {!done ? (
            <div className="px-6 sm:px-9 py-7 sm:py-8">
              <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">気になるものを選ぶ（複数OK）</div>
              <div className="flex flex-wrap gap-2.5">
                {WORRIES.map((w) => {
                  const on = picked.includes(w.key);
                  return (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => toggle(w.key)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] sm:text-[13.5px] font-semibold transition-colors ${
                        on
                          ? "bg-[#16241A] border-[#16241A] text-[#EDF1E8]"
                          : "bg-white border-[#1f2a1d]/15 text-[#3a423a] hover:border-[#3d5638]/50"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`grid place-items-center w-4 h-4 rounded-full border ${on ? "border-[#9ec4a3] bg-[#9ec4a3]" : "border-[#1f2a1d]/25"}`}
                      >
                        {on && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16241A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        )}
                      </span>
                      {w.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={picked.length === 0}
                onClick={() => setDone(true)}
                className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full text-white text-[14.5px] font-bold px-8 py-3.5 transition-colors disabled:cursor-not-allowed"
                style={{ backgroundColor: picked.length ? "#16241A" : "#9aa79a" }}
              >
                整える順番を見る <span aria-hidden>→</span>
              </button>
              <p className="mt-3 text-[11px] text-[#9aa79a]">※ 登録不要。誰にも知られず、まず知りたいだけでも大丈夫です。</p>
            </div>
          ) : (
            <div className="px-6 sm:px-9 py-7 sm:py-8">
              <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-[#3d5638] mb-4">
                <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                あなたの場合、この順番で整えるのがおすすめです
              </div>

              <ol className="relative border-l-2 border-[#85AB8B]/35 ml-3 space-y-4">
                {roadmap.map((w, i) => (
                  <li key={w.key} className="relative pl-6">
                    <span aria-hidden className="absolute -left-[11px] top-0 grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8] text-[10px] font-bold font-mono">{i + 1}</span>
                    <Link href={`/areas/${w.area}`} className="group block rounded-[1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] hover:border-[#3d5638]/40 px-4 py-3 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px] font-bold text-[#1f2a1d] group-hover:text-[#3d5638] transition-colors" style={HEAD}>{w.label}</span>
                        <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                      <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.7]">{w.why}</p>
                    </Link>
                  </li>
                ))}
              </ol>

              {/* 接続へ */}
              <div className="mt-6 rounded-[1.2rem] bg-[#eef3ea] border border-[#85AB8B]/30 p-5">
                <p className="text-[12.5px] text-[#3a423a] leading-[1.85]">
                  この順番に沿って、<span className="font-semibold text-[#16241A]">あなたに合うプロ・施設へおつなぎ</span>します。
                  詳しい進め方と費用は、無料の相談で。売り込みはありません。
                </p>
                <ConsultLink className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[14px] font-bold px-7 py-3 transition-colors">
                  この順番で、無料相談する <span aria-hidden>→</span>
                </ConsultLink>
              </div>

              <button type="button" onClick={() => { setDone(false); setPicked([]); }} className="mt-4 text-[12px] font-semibold text-[#6b7a66] underline underline-offset-4 hover:text-[#3d5638] transition-colors">
                選び直す
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
