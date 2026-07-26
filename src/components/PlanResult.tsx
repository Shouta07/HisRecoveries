"use client";

// パッケージ編成の「結果」表示。
//
// 設計の前提：この画面は読み物ではなく、判断のための道具。
// 旧版は一本のスクロールに全部を並べて 9.4 画面ぶんあり、
// 「で、いくら？」「いつ行くの？」に答えるまでが遠かった。
//
// 直したのは4点：
//   ① 要点（費用・通う日数・残り日数）を先頭のサマリーに集約
//   ② 構成／日程／読みもの をタブに分け、一度に1つだけ見せる
//   ③ 日程は「時刻・名前・所要」の1行に圧縮。各枠の説明文は構成タブと
//      同じ内容だったので載せない（重複を消しただけで、情報は減っていない）
//   ④ CTA を下端に常時出す。スクロール位置に関係なく相談へ行ける
//
// 「間に合わないもの」だけはタブに隠さない。ここは畳まない。

import { useRef, useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import {
  formatYen,
  planToText,
  type Plan,
  type PlanDay,
  type PlanInput,
} from "@/lib/planner";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export type DiagArticle = { slug: string; title: string };

const AREA_LABEL: Record<string, string> = {
  impression: "清潔感・第一印象",
  hair: "薄毛・髪",
  skin: "肌・ニキビ",
  face: "老け見え・疲れ顔",
  "body-hair": "ヒゲ・体毛",
  mind: "睡眠・気分・習慣",
};

type Tab = "build" | "schedule" | "read";

const TABS: { key: Tab; label: string }[] = [
  { key: "build", label: "構成と費用" },
  { key: "schedule", label: "日程" },
  { key: "read", label: "読みもの" },
];

function dayTotal(d: PlanDay): string | null {
  const mins = d.slots.reduce((s, x) => s + (x.minutes ?? 0), 0);
  if (!mins) return null;
  return mins > 60 ? `計 ${Math.floor(mins / 60)}時間${mins % 60 ? `${mins % 60}分` : ""}` : `計 ${mins}分`;
}

export default function PlanResult({
  plan,
  input,
  articles,
  onReset,
}: {
  plan: Plan;
  input: PlanInput;
  articles: Record<string, DiagArticle[]>;
  /** 入力し直す（戻り先は呼び出し側が決める） */
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>("build");
  const tabsRef = useRef<HTMLDivElement>(null);

  // タブを切り替えたら、タブ列を画面上端に寄せる。そうしないと
  // 下の内容だけが入れ替わって、切り替わったことに気づけない。
  function selectTab(next: Tab) {
    setTab(next);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [openWhy, setOpenWhy] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(planToText(plan, input));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="pb-8">
      {/* ══════════ サマリー — 要点だけを、最初の1画面に ══════════ */}
      <div className="px-5 sm:px-9 pt-7 sm:pt-8">
        <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-[#3d5638] mb-3">
          <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          あなた用に、組みました
        </div>

        <h2 className="text-[1.05rem] sm:text-[1.3rem] font-[800] leading-[1.5] text-[#1f2a1d]" style={HEAD}>
          {plan.title}
        </h2>

        {/* 数字を3つだけ、大きく。ここで「いくら・何日・あと何日」が終わる */}
        <dl className="mt-4 grid grid-cols-3 rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] divide-x divide-[#1f2a1d]/10 overflow-hidden">
          <div className="px-2 py-3.5 text-center">
            <dt className="text-[10px] font-bold tracking-[0.06em] text-[#9aa79a]">費用の目安</dt>
            <dd className="mt-1 text-[13.5px] sm:text-[16px] font-bold text-[#16241A]" style={HEAD}>
              {formatYen(plan.priceFrom)}〜
            </dd>
          </div>
          <div className="px-2 py-3.5 text-center">
            <dt className="text-[10px] font-bold tracking-[0.06em] text-[#9aa79a]">通う日数</dt>
            <dd className="mt-1 text-[13.5px] sm:text-[16px] font-bold text-[#16241A]" style={HEAD}>
              {plan.shape === "two-day" ? "2日" : "1日"}
            </dd>
          </div>
          <div className="px-2 py-3.5 text-center">
            <dt className="text-[10px] font-bold tracking-[0.06em] text-[#9aa79a]">
              {plan.deadline ? "その日まで" : "開催地"}
            </dt>
            <dd className="mt-1 text-[13.5px] sm:text-[16px] font-bold text-[#16241A]" style={HEAD}>
              {plan.deadline ? `あと${plan.deadline.days}日` : plan.hub.city}
            </dd>
          </div>
        </dl>

        {/* 束ね方は畳んでおく。読みたい人だけ開ける */}
        {plan.synthesis && (
          <div className="mt-3 rounded-[1rem] bg-[#16241A] overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenWhy((v) => !v)}
              aria-expanded={openWhy}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-[12.5px] font-bold text-[#EDF1E8]">なぜ、この順番なのか</span>
              <span aria-hidden className={`text-[#9ec4a3] text-[13px] transition-transform ${openWhy ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {openWhy && (
              <div className="px-4 pb-4">
                <p className="text-[12.5px] leading-[1.95] text-[#D7DED2]">{plan.synthesis}</p>
                <p className="mt-2 text-[11.5px] leading-[1.9] text-[#9FB0A0]">
                  {plan.band.label}のあなたへ：{plan.band.emphasis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 間に合わないもの — ここは畳まない。売上より、当日に裏切らないことを優先する */}
        {plan.deadline && plan.deadline.warnings.length > 0 && (
          <div className="mt-3 rounded-[1.1rem] bg-[#fbf7ee] border border-[#d8c9a8] px-4 py-3.5">
            <div className="text-[11.5px] font-bold text-[#8a6d3b] mb-1.5">その日には、間に合わないもの</div>
            <ul className="space-y-1.5">
              {plan.deadline.warnings.map((w) => (
                <li key={w} className="text-[11.5px] text-[#6b5a37] leading-[1.85]">
                  ・{w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ══════════ タブ ══════════ */}
      <div ref={tabsRef} className="mt-6 px-5 sm:px-9 scroll-mt-20">
        <div role="tablist" aria-label="プランの内訳" className="grid grid-cols-3 rounded-full bg-[#eef1ea] p-1">
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => selectTab(t.key)}
                className={`rounded-full py-2.5 text-[12.5px] font-bold transition-colors ${
                  on ? "bg-[#16241A] text-[#EDF1E8]" : "text-[#4b5b47] hover:text-[#16241A]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 sm:px-9 pt-5">
        {/* ────────── ① 構成と費用 ────────── */}
        {tab === "build" && (
          <div>
            <ul className="rounded-[1.1rem] border border-[#1f2a1d]/10 divide-y divide-[#1f2a1d]/8 overflow-hidden bg-white">
              {plan.modules.map((m) => {
                const open = openModule === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setOpenModule(open ? null : m.id)}
                      aria-expanded={open}
                      className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-[#f6f8f4] transition-colors"
                    >
                      <span className="min-w-0 text-[13px] font-semibold text-[#1f2a1d] leading-[1.55]">
                        {m.name}
                        {m.medical && (
                          <span className="ml-1.5 align-middle rounded-full bg-[#e5f0ef] text-[#0f766e] px-1.5 py-0.5 text-[9.5px] font-bold">
                            中立紹介
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 flex items-center gap-1.5">
                        <span className="text-[12.5px] font-bold text-[#3d5638]">{m.price ? formatYen(m.price) : "無料"}</span>
                        <span aria-hidden className={`text-[#9aa79a] text-[11px] transition-transform ${open ? "rotate-180" : ""}`}>
                          ▾
                        </span>
                      </span>
                    </button>
                    {open && (
                      <div className="px-4 pb-3.5 bg-[#f6f8f4]">
                        <p className="text-[12px] text-[#3a423a] leading-[1.85]">{m.what}</p>
                        <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.75]">{m.why}</p>
                        {m.priceNote && <p className="mt-1 text-[11px] text-[#9aa79a] leading-[1.6]">{m.priceNote}</p>}
                      </div>
                    )}
                  </li>
                );
              })}
              <li className="px-4 py-3.5 bg-[#f6f8f4] flex items-center justify-between gap-3">
                <span className="text-[12.5px] font-bold text-[#1f2a1d]">合計の目安</span>
                <span className="text-[1.05rem] font-bold text-[#16241A]" style={HEAD}>
                  {formatYen(plan.priceFrom)}〜
                </span>
              </li>
            </ul>
            <p className="mt-2.5 text-[11px] text-[#9aa79a] leading-[1.7]">
              各項目をタップすると、内容が開きます。価格・所要はすべて目安です。
            </p>

            {plan.suggestions.length > 0 && (
              <div className="mt-4 rounded-[1.1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3.5">
                <div className="text-[11.5px] font-bold text-[#9aa79a] mb-2">
                  {plan.band.label}で、よく足されるもの（任意）
                </div>
                <ul className="space-y-1.5">
                  {plan.suggestions.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3">
                      <span className="text-[12px] text-[#3a423a] leading-[1.6]">{m.name}</span>
                      <span className="shrink-0 text-[12px] font-bold text-[#3d5638]">
                        {m.price ? `+${formatYen(m.price)}` : "無料"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ────────── ② 日程 ────────── */}
        {tab === "schedule" && (
          <div>
            {/* 全体の流れを、まず1行で */}
            <ol className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
              {plan.days.map((d, i) => (
                <li key={d.key} className="flex items-center gap-1.5 shrink-0">
                  <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1.5 text-[11.5px] font-bold">{d.label}</span>
                  {i < plan.days.length - 1 && (
                    <span aria-hidden className="text-[#85AB8B] text-[11px]">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>

            {/* 逆算の節目（締切があるときだけ） */}
            {plan.deadline && (
              <ol className="mb-4 rounded-[1.1rem] border border-[#85AB8B]/40 bg-[#eef3ea] divide-y divide-[#85AB8B]/25 overflow-hidden">
                {plan.deadline.milestones.map((m, i) => (
                  <li key={`${m.when}-${i}`} className="flex items-baseline gap-3 px-4 py-2.5">
                    <span className="shrink-0 w-[7.5rem] text-[11px] font-bold text-[#3d5638] leading-[1.6]">{m.when}</span>
                    <span className="text-[12px] text-[#3a423a] leading-[1.7]">{m.what}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* 各日 = 1行1スロット。枠ごとの説明は構成タブと同じ内容なので載せない */}
            <div className="space-y-3">
              {plan.days.map((d) => {
                const total = dayTotal(d);
                return (
                  <div key={d.key} className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-white overflow-hidden">
                    <div className="flex items-baseline justify-between gap-3 px-4 py-2.5 bg-[#16241A] text-[#EDF1E8]">
                      <span className="text-[12.5px] font-bold">
                        {d.label}
                        <span className="ml-2 text-[11px] font-normal text-[#9FB0A0]">{d.place}</span>
                      </span>
                      {total && <span className="shrink-0 text-[11px] text-[#9ec4a3] font-semibold">{total}</span>}
                    </div>
                    <ul className="divide-y divide-[#1f2a1d]/8">
                      {d.slots.map((s, i) => (
                        <li key={`${d.key}-${i}`} className="flex items-baseline gap-3 px-4 py-2.5">
                          <span className="shrink-0 w-[3.2rem] font-mono text-[11.5px] font-bold text-[#3d5638] tabular-nums">
                            {s.time ?? "—"}
                          </span>
                          <span className="min-w-0 flex-1 text-[12.5px] text-[#1f2a1d] leading-[1.6]">
                            {s.title}
                            {s.medical && (
                              <span className="ml-1.5 align-middle rounded-full bg-[#e5f0ef] text-[#0f766e] px-1.5 py-0.5 text-[9.5px] font-bold">
                                中立紹介
                              </span>
                            )}
                            {s.online && (
                              <span className="ml-1.5 align-middle rounded-full bg-[#f1f4ef] text-[#6b7a66] px-1.5 py-0.5 text-[9.5px] font-bold">
                                オンライン
                              </span>
                            )}
                          </span>
                          {s.dur && <span className="shrink-0 text-[11px] text-[#9aa79a] tabular-nums">{s.dur}</span>}
                        </li>
                      ))}
                    </ul>
                    <p className="px-4 py-2.5 bg-[#f6f8f4] text-[11px] text-[#6b7a66] leading-[1.7]">{d.caption}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────── ③ 読みもの ────────── */}
        {tab === "read" && (
          <div className="space-y-3">
            {plan.areas.map((area) => {
              const arts = (articles[area] ?? []).slice(0, 2);
              if (!arts.length) return null;
              return (
                <div key={area} className="rounded-[1.1rem] border border-[#1f2a1d]/10 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#f6f8f4]">
                    <span className="text-[12.5px] font-bold text-[#1f2a1d]">{AREA_LABEL[area] ?? area}</span>
                    <Link
                      href={`/areas/${area}`}
                      className="text-[11px] font-semibold text-[#3d5638] hover:opacity-70 shrink-0 transition-opacity"
                    >
                      領域を見る →
                    </Link>
                  </div>
                  <ul className="divide-y divide-[#1f2a1d]/8 bg-white">
                    {arts.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/areas/${area}/${a.slug}`}
                          className="group flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#f6f8f4] transition-colors"
                        >
                          <span className="text-[12.5px] text-[#3a423a] group-hover:text-[#16241A] leading-[1.5] transition-colors">
                            {a.title}
                          </span>
                          <span aria-hidden className="text-[#85AB8B] shrink-0 text-[12px]">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════ 注記（畳む。ただし消さない） ══════════ */}
      <div className="px-5 sm:px-9 mt-6">
        <button
          type="button"
          onClick={() => setOpenNotes((v) => !v)}
          aria-expanded={openNotes}
          className="w-full flex items-center justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3 text-left"
        >
          <span className="text-[12px] font-bold text-[#4b5b47]">お伝えしておくこと（{plan.notes.length}件）</span>
          <span aria-hidden className={`text-[#9aa79a] text-[11px] transition-transform ${openNotes ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
        {openNotes && (
          <ul className="mt-2 space-y-1.5 px-1">
            {plan.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-[11.5px] text-[#6b7a66] leading-[1.8]">
                <span aria-hidden className="text-[#9aa79a] shrink-0">
                  ※
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={copyPlan}
            className="text-[12px] font-semibold text-[#3d5638] underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {copied ? "コピーしました" : "この内容をコピー"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-semibold text-[#6b7a66] underline underline-offset-4 hover:text-[#3d5638] transition-colors"
          >
            入力し直す
          </button>
        </div>
      </div>

      {/* ══════════ 追従CTA — どこを見ていても、相談へ行ける ══════════ */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-none">
        <div className="pointer-events-auto mx-auto flex max-w-[560px] items-center gap-3 rounded-full bg-[#16241A] pl-5 pr-2 py-2 shadow-[0_18px_44px_-14px_rgba(20,32,26,0.75)]">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] text-[#9FB0A0] leading-[1.4]">この構成の目安</div>
            <div className="text-[13.5px] font-bold text-[#EDF1E8] leading-[1.4]" style={HEAD}>
              {formatYen(plan.priceFrom)}〜
            </div>
          </div>
          <ConsultLink className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[13px] font-bold px-5 py-2.5 transition-colors">
            無料相談 <span aria-hidden>→</span>
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}
