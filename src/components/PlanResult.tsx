"use client";

// パッケージ編成の「結果」表示。
//
// 入力（PackagePlanner）とは別ページ（/plan）に置く。理由は2つ:
//   ・結果はスクロールが長く、LP に埋め込むと下の節が読まれない
//   ・URL に条件が乗るので、相談前に見返す・共有することができる
// はじめかたの5ステップも、この結果の下に置く（プランを見た直後に
// 「で、どう始めるのか」を出すのが、いちばん効く位置）。

import { useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import {
  formatYen,
  planToText,
  type Plan,
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
    <div className="px-6 sm:px-9 py-7 sm:py-8">
      <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-[#3d5638] mb-4">
        <span
          aria-hidden
          className="grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8]"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        あなた用に、組みました
      </div>

      <h3
        className="text-[1.15rem] sm:text-[1.4rem] font-[800] leading-[1.5] text-[#1f2a1d]"
        style={HEAD}
      >
        {plan.title}
      </h3>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
          開催：{plan.hub.city}
        </span>
        <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
          {plan.shape === "two-day"
            ? "2日構成"
            : plan.shape === "stay-over"
              ? "1日完結（前泊推奨）"
              : "1日完結"}
        </span>
        <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
          費用の目安 {formatYen(plan.priceFrom)}〜
        </span>
        {plan.occasions.map((o) => (
          <span
            key={o}
            className="rounded-full bg-[#16241A] text-[#EDF1E8] px-3 py-1 text-[11.5px] font-semibold"
          >
            {o}
          </span>
        ))}
        {plan.deadline && (
          <span className="rounded-full bg-[#3d5638] text-[#EDF1E8] px-3 py-1 text-[11.5px] font-bold">
            {plan.deadline.label}
          </span>
        )}
      </div>

      {/* 束ね方 */}
      {plan.synthesis && (
        <div className="mt-5 rounded-[1.1rem] bg-[#16241A] text-[#EDF1E8] px-5 py-4">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-1.5">
            束ね方
          </div>
          <p className="text-[13px] leading-[1.9] font-medium">
            {plan.synthesis}
          </p>
          <p className="mt-2 text-[12px] leading-[1.9] text-[#C9D2C4]">
            {plan.band.label}のあなたへ：{plan.band.emphasis}
          </p>
        </div>
      )}

      {/* ── その日からの逆算（日付を入れたときだけ） ── */}
      {plan.deadline && (
        <div className="mt-5 rounded-[1.1rem] border border-[#85AB8B]/40 bg-white overflow-hidden">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3.5 bg-[#eef3ea] border-b border-[#85AB8B]/25">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3d5638]">
              Countdown
            </span>
            <span
              className="text-[14.5px] font-bold text-[#16241A]"
              style={HEAD}
            >
              {plan.deadline.label}
            </span>
          </div>

          <ol className="divide-y divide-[#1f2a1d]/8">
            {plan.deadline.milestones.map((m, i) => (
              <li
                key={`${m.when}-${i}`}
                className="flex items-start gap-3 px-5 py-3"
              >
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8] font-mono text-[10px] font-bold"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-[#3d5638] leading-[1.6]">
                    {m.when}
                  </div>
                  <p className="text-[12.5px] text-[#3a423a] leading-[1.75]">
                    {m.what}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* 間に合わないものは、黙って混ぜずに先に言い切る */}
          {plan.deadline.warnings.length > 0 && (
            <div className="px-5 py-4 bg-[#fbf7ee] border-t border-[#d8c9a8]">
              <div className="text-[11px] font-bold tracking-[0.06em] text-[#8a6d3b] mb-2">
                その日には、間に合わないもの
              </div>
              <ul className="space-y-2">
                {plan.deadline.warnings.map((w) => (
                  <li
                    key={w}
                    className="text-[12px] text-[#6b5a37] leading-[1.85]"
                  >
                    ・{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── 構成（含まれるもの・費用） ── */}
      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">
          この構成に含まれるもの
        </div>
        <ul className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] divide-y divide-[#1f2a1d]/8 overflow-hidden">
          {plan.modules.map((m) => (
            <li key={m.id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]"
                    style={HEAD}
                  >
                    {m.name}
                    {m.medical && (
                      <span className="ml-2 align-middle rounded-full bg-[#e5f0ef] text-[#0f766e] px-2 py-0.5 text-[10px] font-bold">
                        中立紹介
                      </span>
                    )}
                    {m.online && (
                      <span className="ml-2 align-middle rounded-full bg-white border border-[#1f2a1d]/12 text-[#6b7a66] px-2 py-0.5 text-[10px] font-bold">
                        オンライン
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-[#3a423a] leading-[1.8]">
                    {m.what}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9aa79a] leading-[1.7]">
                    {m.why}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[12.5px] font-bold text-[#3d5638]">
                    {m.price ? formatYen(m.price) : "無料"}
                  </div>
                  {m.priceNote && (
                    <div className="mt-0.5 text-[10px] text-[#9aa79a] max-w-[9rem] leading-[1.5]">
                      {m.priceNote}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
          <li className="px-4 py-3.5 bg-white flex items-center justify-between gap-3">
            <span className="text-[12.5px] font-bold text-[#1f2a1d]">
              合計の目安
            </span>
            <span className="text-[15px] font-[800] text-[#16241A]">
              {formatYen(plan.priceFrom)}〜
            </span>
          </li>
        </ul>
      </div>

      {/* ── 日程プラン ── */}
      <div className="mt-7">
        <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">
          {plan.prefecture.name}から動く、日程プラン
        </div>
        <ol className="relative border-l-2 border-[#85AB8B]/35 ml-3 space-y-5">
          {plan.days.map((d, i) => (
            <li key={d.key} className="relative pl-6">
              <span
                aria-hidden
                className="absolute -left-[12px] top-0 grid place-items-center w-6 h-6 rounded-full bg-[#16241A] text-[#EDF1E8] text-[11px] font-bold font-mono"
              >
                {i + 1}
              </span>
              <div className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#1f2a1d]/8">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[14.5px] font-bold text-[#1f2a1d]"
                      style={HEAD}
                    >
                      {d.label}
                    </span>
                    <span className="text-[11px] font-semibold text-[#3d5638] shrink-0">
                      {d.place}
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.8]">
                    {d.caption}
                  </p>
                </div>
                <ul className="divide-y divide-[#1f2a1d]/8 bg-white">
                  {d.slots.map((s, j) => (
                    <li
                      key={`${d.key}-${j}`}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span
                        className="shrink-0 w-[3.4rem] font-mono text-[11.5px] font-bold text-[#3d5638] pt-0.5"
                        aria-hidden={!s.time}
                      >
                        {s.time ?? "・"}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-semibold text-[#1f2a1d] leading-[1.6]">
                          {s.title}
                          {s.dur && (
                            <span className="ml-2 text-[11px] font-normal text-[#9aa79a]">
                              {s.dur}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-[#6b7a66] leading-[1.8]">
                          {s.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── 年代からの提案 ── */}
      {plan.suggestions.length > 0 && (
        <div className="mt-6 rounded-[1.1rem] border border-[#1f2a1d]/10 bg-white p-5">
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2.5">
            {plan.band.label}で、よく足されるもの（任意）
          </div>
          <ul className="space-y-2.5">
            {plan.suggestions.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-[#1f2a1d]">
                    {m.name}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-[#6b7a66] leading-[1.8]">
                    {m.why}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] font-bold text-[#3d5638]">
                  {m.price ? `+${formatYen(m.price)}` : "無料"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 読みもの ── */}
      <div className="mt-7">
        <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">
          この構成に沿った、読みもの
        </div>
        <div className="space-y-3">
          {plan.areas.map((area) => {
            const arts = (articles[area] ?? []).slice(0, 3);
            if (!arts.length) return null;
            return (
              <div
                key={area}
                className="rounded-[1.1rem] border border-[#1f2a1d]/10 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#f6f8f4]">
                  <span className="text-[12.5px] font-bold text-[#1f2a1d]">
                    {AREA_LABEL[area] ?? area}
                  </span>
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
                        <span
                          aria-hidden
                          className="text-[#85AB8B] shrink-0 text-[12px] group-hover:translate-x-0.5 transition-transform"
                        >
                          読む →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 注記（正直に） ── */}
      <ul className="mt-6 space-y-1.5">
        {plan.notes.map((n, i) => (
          <li
            key={i}
            className="flex gap-2 text-[11.5px] text-[#6b7a66] leading-[1.8]"
          >
            <span aria-hidden className="text-[#9aa79a] shrink-0">
              ※
            </span>
            <span>{n}</span>
          </li>
        ))}
      </ul>

      {/* 接続＝パーソナライズへ */}
      <div className="mt-6 rounded-[1.2rem] bg-[#eef3ea] border border-[#85AB8B]/30 p-5">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3d5638] mb-2">
          Next
        </div>
        <p className="text-[12.5px] text-[#3a423a] leading-[1.9]">
          これは、入力から自動で組んだ
          <span className="font-semibold text-[#16241A]">下書き</span>です。
          無料相談で、あなたの現在地と日程に合わせて
          <span className="font-semibold text-[#16241A]">
            専用のパッケージに設計し直し
          </span>
          、 合うプロ・施設へおつなぎします。売り込みはありません。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[14px] font-bold px-7 py-3 transition-colors">
            この構成で、無料相談する <span aria-hidden>→</span>
          </ConsultLink>
          <button
            type="button"
            onClick={copyPlan}
            className="inline-flex items-center gap-2 rounded-full border border-[#16241A]/25 bg-white hover:bg-[#f6f8f4] text-[#16241A] text-[13px] font-bold px-5 py-3 transition-colors"
          >
            {copied ? "コピーしました" : "この内容をコピー"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-[#6b7a66] leading-[1.7]">
          コピーしておくと、相談のときにそのまま貼れます（実名は不要です）。
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 text-[12px] font-semibold text-[#6b7a66] underline underline-offset-4 hover:text-[#3d5638] transition-colors"
      >
        入力し直す
      </button>
    </div>
  );
}
