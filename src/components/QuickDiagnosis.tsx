"use client";

// ① 診断の入口 — 「サイトを道具にする」中核。
// 単なる順番の羅列ではなく、選んだ悩みを HR の「整える順番」に並べ、
// 各ステップに「どう進めるか（アクション）」と「そのステップの記事」を添えて
// 実用的なロードマップとして返す。相談・体験を経て、これをパーソナライズする建付け。
// 記事データは重いので server（page.tsx）で組み立て、props で受け取る。
import { useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export type DiagArticle = { slug: string; title: string };

type Worry = { key: string; label: string; area: string; action: string; why: string };

// 表示順＝HR の「整える順番」（土台の清潔感 → 個別 → 内側）。結果はこの順に並ぶ。
const WORRIES: Worry[] = [
  { key: "impression", label: "清潔感・第一印象", area: "impression", action: "土台づくり。清潔感を要素に分けて、効く順に整える。", why: "ここが整うと、他の努力も効きはじめます。" },
  { key: "hair", label: "薄毛・髪", area: "hair", action: "まず現在地を知る。セルフチェックし、必要なら医療で診断を。", why: "進行性のため、早く知るほど選べる幅が広がります。" },
  { key: "skin", label: "肌・ニキビ", area: "skin", action: "原因を分ける。炎症・乾燥・摩擦でケアを変える。", why: "跡は、新しいものと分けて考えます。" },
  { key: "face", label: "老け見え・疲れ顔", area: "face", action: "今日から動かす。睡眠・むくみ・表情から。", why: "変えやすい要素が多く、手応えが早い。" },
  { key: "bodyhair", label: "ヒゲ・体毛", area: "body-hair", action: "方針を決める。整える／減らす／そのままを、目的から。", why: "正解はひとつではありません。目的から選びます。" },
  { key: "mind", label: "睡眠・気分・習慣", area: "mind", action: "内側を整える。睡眠を一定に、習慣は仕組みで。", why: "内側が整うと、同じ見た目でも生き生きして見えます。" },
];

export default function QuickDiagnosis({ articles }: { articles: Record<string, DiagArticle[]> }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  // 選んだ悩みを「整える順番」（WORRIES の並び）にソートして返す。
  const roadmap = WORRIES.filter((w) => picked.includes(w.key));

  // 複数選択時の「束ね方」— 即効の土台(清潔感)→現在地把握(薄毛)→継続ケア→内側、
  // という HR の考え方で、選ばれた組み合わせから一文を合成する（設計してもらえた感）。
  const has = (k: string) => picked.includes(k);
  const careList = [
    has("skin") && "肌",
    has("face") && "顔まわり",
    has("bodyhair") && "ヒゲ・体毛",
  ].filter(Boolean) as string[];
  const synthParts: string[] = [];
  if (has("impression")) synthParts.push("まず清潔感で「今すぐ」の印象を底上げ");
  if (has("hair")) synthParts.push("薄毛は並行して現在地の把握から（早いほど選べる幅が広い）");
  if (careList.length) synthParts.push(`${careList.join("・")}は原因を分けて一つずつ`);
  if (has("mind")) synthParts.push("睡眠・習慣は土台として並行で");
  const synthesis = picked.length >= 2 ? synthParts.join("、") + "。" : null;

  return (
    <section id="diagnosis" className="relative z-10 scroll-mt-20 bg-[#f4f6f2]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#85AB8B]">30秒・無料・匿名</div>
            <h2 className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4] text-[#EDF1E8]" style={HEAD}>
              何から整える？ <span className="text-[#9ec4a3]">順番と、読みものを。</span>
            </h2>
            <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-[#C9D2C4] leading-[1.8]">
              気になるものを選ぶだけ。整える順番と、各ステップの記事・進め方のロードマップを、すぐにお見せします。
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
                ロードマップを見る <span aria-hidden>→</span>
              </button>
              <p className="mt-3 text-[11px] text-[#9aa79a]">※ 登録不要。誰にも知られず、まず知りたいだけでも大丈夫です。</p>
            </div>
          ) : (
            <div className="px-6 sm:px-9 py-7 sm:py-8">
              <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-[#3d5638] mb-5">
                <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                あなたの、整える順番のロードマップ
              </div>

              {/* 束ね方 — 複数選択を一つの戦略にまとめる一文 */}
              {synthesis && (
                <div className="mb-5 rounded-[1.1rem] bg-[#16241A] text-[#EDF1E8] px-5 py-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-1.5">束ね方</div>
                  <p className="text-[13px] leading-[1.9] font-medium">{synthesis}</p>
                </div>
              )}

              <ol className="relative border-l-2 border-[#85AB8B]/35 ml-3 space-y-5">
                {roadmap.map((w, i) => {
                  const arts = (articles[w.area] ?? []).slice(0, 3);
                  return (
                    <li key={w.key} className="relative pl-6">
                      <span aria-hidden className="absolute -left-[12px] top-0 grid place-items-center w-6 h-6 rounded-full bg-[#16241A] text-[#EDF1E8] text-[11px] font-bold font-mono">{i + 1}</span>
                      <div className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] overflow-hidden">
                        {/* ステップの見出し＋やること */}
                        <div className="px-4 py-3.5 border-b border-[#1f2a1d]/8">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14.5px] font-bold text-[#1f2a1d]" style={HEAD}>{w.label}</span>
                            <Link href={`/areas/${w.area}`} className="text-[11px] font-semibold text-[#3d5638] hover:opacity-70 shrink-0 transition-opacity">領域を見る →</Link>
                          </div>
                          <p className="mt-1 text-[12px] font-semibold text-[#3d5638] leading-[1.7]">{w.action}</p>
                          <p className="mt-0.5 text-[11px] text-[#9aa79a] leading-[1.6]">{w.why}</p>
                        </div>
                        {/* そのステップの読みもの */}
                        {arts.length > 0 && (
                          <ul className="divide-y divide-[#1f2a1d]/8 bg-white">
                            {arts.map((a) => (
                              <li key={a.slug}>
                                <Link href={`/areas/${w.area}/${a.slug}`} className="group flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#f6f8f4] transition-colors">
                                  <span className="text-[12.5px] text-[#3a423a] group-hover:text-[#16241A] leading-[1.5] transition-colors">{a.title}</span>
                                  <span aria-hidden className="text-[#85AB8B] shrink-0 text-[12px] group-hover:translate-x-0.5 transition-transform">読む →</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* 接続＝パーソナライズへ */}
              <div className="mt-6 rounded-[1.2rem] bg-[#eef3ea] border border-[#85AB8B]/30 p-5">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3d5638] mb-2">Next</div>
                <p className="text-[12.5px] text-[#3a423a] leading-[1.9]">
                  これは、よくある順路の<span className="font-semibold text-[#16241A]">下書き</span>です。
                  無料相談で、あなたの現在地に合わせて<span className="font-semibold text-[#16241A]">専用のロードマップに設計し直し</span>、
                  合うプロ・施設へおつなぎします（体験を経て、さらにパーソナライズ）。売り込みはありません。
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
