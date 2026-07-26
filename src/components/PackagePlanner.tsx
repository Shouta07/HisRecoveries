"use client";

// ① 診断の入口 — 「サイトを道具にする」中核。
// 都道府県・年齢・やりたいこと（選択＋自由記述）を入れると、
//   ・あなた用のパッケージ（モジュールの組み合わせ・費用の目安）
//   ・その立地に合わせた日程プラン（事前 → 前日 → 当日 → 後日）
//   ・各ステップの読みもの（記事）
// をその場で組んで返す。相談・体験を経て、これをパーソナライズする建付け。
// 記事データは重いので server（page.tsx）で組み立て、props で受け取る。
import { useMemo, useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import {
  composePlan,
  formatYen,
  goals,
  planToText,
  prefecturesByRegion,
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

export default function PackagePlanner({ articles }: { articles: Record<string, DiagArticle[]> }) {
  const [pref, setPref] = useState("");
  const [age, setAge] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const regions = useMemo(() => prefecturesByRegion(), []);
  const ready = pref !== "" && age !== "" && (picked.length > 0 || text.trim().length > 0);

  const input: PlanInput = {
    prefectureId: pref,
    age: Number(age),
    goalKeys: picked,
    text,
  };
  // 入力が揃うまでは計算しない（初期表示のコストをゼロに）。
  const plan = useMemo(() => (done ? composePlan(input) : null), [done, pref, age, picked, text]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(key: string) {
    setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function reset() {
    setDone(false);
    setCopied(false);
  }

  async function copyPlan() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planToText(plan, input));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="diagnosis" className="relative z-10 scroll-mt-20 bg-[#f4f6f2]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#85AB8B]">30秒・無料・匿名</div>
            <h2 className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4] text-[#EDF1E8]" style={HEAD}>
              何から整える？ <span className="text-[#9ec4a3]">パッケージと、日程で。</span>
            </h2>
            <p className="mt-2 text-[12.5px] sm:text-[13.5px] text-[#C9D2C4] leading-[1.8]">
              お住まい・年齢・やりたいことを書くだけ。あなた用の構成と、その立地に合わせた日程プラン、各ステップの読みものを、すぐにお見せします。
            </p>
          </div>

          {!done || !plan ? (
            /* ══════════ 入力 ══════════ */
            <div className="px-6 sm:px-9 py-7 sm:py-8">
              {/* ①都道府県 ②年齢 */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-5">
                <div>
                  <label htmlFor="planner-pref" className="block text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2">
                    ① お住まい（都道府県）
                  </label>
                  <select
                    id="planner-pref"
                    value={pref}
                    onChange={(e) => setPref(e.target.value)}
                    className="w-full rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[14px] text-[#1f2a1d] focus:border-[#3d5638] focus:outline-none"
                  >
                    <option value="">選択してください</option>
                    {regions.map((r) => (
                      <optgroup key={r.region} label={r.region}>
                        {r.items.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="planner-age" className="block text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-2">
                    ② 年齢
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="planner-age"
                      type="number"
                      inputMode="numeric"
                      min={15}
                      max={99}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="34"
                      className="w-full sm:w-[7.5rem] rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[14px] text-[#1f2a1d] focus:border-[#3d5638] focus:outline-none"
                    />
                    <span className="text-[13px] text-[#6b7a66] shrink-0">歳</span>
                  </div>
                </div>
              </div>

              {/* ③やりたいこと */}
              <div className="mt-6">
                <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">③ やりたいこと（複数OK）</div>
                <div className="flex flex-wrap gap-2.5">
                  {goals.map((g) => {
                    const on = picked.includes(g.key);
                    return (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => toggle(g.key)}
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
                        {g.label}
                      </button>
                    );
                  })}
                </div>

                <label htmlFor="planner-text" className="block mt-5 text-[12px] font-semibold text-[#6b7a66] mb-2">
                  言葉で書いてもOK（外せない場面・期限など）
                </label>
                <textarea
                  id="planner-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  placeholder="例：3ヶ月後に結婚式で挨拶する。写真も撮り直したい。髪の生え際も気になってきた。"
                  className="w-full rounded-[0.9rem] border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[13.5px] leading-[1.9] text-[#1f2a1d] placeholder:text-[#b3bdb1] focus:border-[#3d5638] focus:outline-none resize-y"
                />
              </div>

              <button
                type="button"
                disabled={!ready}
                onClick={() => { setDone(true); setCopied(false); }}
                className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full text-white text-[14.5px] font-bold px-8 py-3.5 transition-colors disabled:cursor-not-allowed"
                style={{ backgroundColor: ready ? "#16241A" : "#9aa79a" }}
              >
                パッケージを組む <span aria-hidden>→</span>
              </button>
              <p className="mt-3 text-[11px] text-[#9aa79a]">※ 登録不要。誰にも知られず、まず知りたいだけでも大丈夫です。</p>
            </div>
          ) : (
            /* ══════════ 結果 ══════════ */
            <div className="px-6 sm:px-9 py-7 sm:py-8">
              <div className="flex items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-[#3d5638] mb-4">
                <span aria-hidden className="grid place-items-center w-5 h-5 rounded-full bg-[#16241A] text-[#EDF1E8]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                あなた用に、組みました
              </div>

              <h3 className="text-[1.15rem] sm:text-[1.4rem] font-[800] leading-[1.5] text-[#1f2a1d]" style={HEAD}>
                {plan.title}
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
                  開催：{plan.hub.city}
                </span>
                <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
                  {plan.shape === "two-day" ? "2日構成" : plan.shape === "stay-over" ? "1日完結（前泊推奨）" : "1日完結"}
                </span>
                <span className="rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 text-[11.5px] font-semibold">
                  費用の目安 {formatYen(plan.priceFrom)}〜
                </span>
                {plan.occasions.map((o) => (
                  <span key={o} className="rounded-full bg-[#16241A] text-[#EDF1E8] px-3 py-1 text-[11.5px] font-semibold">{o}</span>
                ))}
              </div>

              {/* 束ね方 */}
              {plan.synthesis && (
                <div className="mt-5 rounded-[1.1rem] bg-[#16241A] text-[#EDF1E8] px-5 py-4">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-1.5">束ね方</div>
                  <p className="text-[13px] leading-[1.9] font-medium">{plan.synthesis}</p>
                  <p className="mt-2 text-[12px] leading-[1.9] text-[#C9D2C4]">{plan.band.label}のあなたへ：{plan.band.emphasis}</p>
                </div>
              )}

              {/* ── 構成（含まれるもの・費用） ── */}
              <div className="mt-6">
                <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">この構成に含まれるもの</div>
                <ul className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] divide-y divide-[#1f2a1d]/8 overflow-hidden">
                  {plan.modules.map((m) => (
                    <li key={m.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]" style={HEAD}>
                            {m.name}
                            {m.medical && (
                              <span className="ml-2 align-middle rounded-full bg-[#e5f0ef] text-[#0f766e] px-2 py-0.5 text-[10px] font-bold">中立紹介</span>
                            )}
                            {m.online && (
                              <span className="ml-2 align-middle rounded-full bg-white border border-[#1f2a1d]/12 text-[#6b7a66] px-2 py-0.5 text-[10px] font-bold">オンライン</span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] text-[#3a423a] leading-[1.8]">{m.what}</p>
                          <p className="mt-0.5 text-[11px] text-[#9aa79a] leading-[1.7]">{m.why}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[12.5px] font-bold text-[#3d5638]">{m.price ? formatYen(m.price) : "無料"}</div>
                          {m.priceNote && <div className="mt-0.5 text-[10px] text-[#9aa79a] max-w-[9rem] leading-[1.5]">{m.priceNote}</div>}
                        </div>
                      </div>
                    </li>
                  ))}
                  <li className="px-4 py-3.5 bg-white flex items-center justify-between gap-3">
                    <span className="text-[12.5px] font-bold text-[#1f2a1d]">合計の目安</span>
                    <span className="text-[15px] font-[800] text-[#16241A]">{formatYen(plan.priceFrom)}〜</span>
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
                      <span aria-hidden className="absolute -left-[12px] top-0 grid place-items-center w-6 h-6 rounded-full bg-[#16241A] text-[#EDF1E8] text-[11px] font-bold font-mono">{i + 1}</span>
                      <div className="rounded-[1.1rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] overflow-hidden">
                        <div className="px-4 py-3.5 border-b border-[#1f2a1d]/8">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[14.5px] font-bold text-[#1f2a1d]" style={HEAD}>{d.label}</span>
                            <span className="text-[11px] font-semibold text-[#3d5638] shrink-0">{d.place}</span>
                          </div>
                          <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.8]">{d.caption}</p>
                        </div>
                        <ul className="divide-y divide-[#1f2a1d]/8 bg-white">
                          {d.slots.map((s, j) => (
                            <li key={`${d.key}-${j}`} className="flex items-start gap-3 px-4 py-3">
                              <span className="shrink-0 w-[3.4rem] font-mono text-[11.5px] font-bold text-[#3d5638] pt-0.5" aria-hidden={!s.time}>
                                {s.time ?? "・"}
                              </span>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-semibold text-[#1f2a1d] leading-[1.6]">
                                  {s.title}
                                  {s.dur && <span className="ml-2 text-[11px] font-normal text-[#9aa79a]">{s.dur}</span>}
                                </div>
                                <p className="mt-0.5 text-[11.5px] text-[#6b7a66] leading-[1.8]">{s.note}</p>
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
                          <div className="text-[12.5px] font-semibold text-[#1f2a1d]">{m.name}</div>
                          <p className="mt-0.5 text-[11.5px] text-[#6b7a66] leading-[1.8]">{m.why}</p>
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
                <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">この構成に沿った、読みもの</div>
                <div className="space-y-3">
                  {plan.areas.map((area) => {
                    const arts = (articles[area] ?? []).slice(0, 3);
                    if (!arts.length) return null;
                    return (
                      <div key={area} className="rounded-[1.1rem] border border-[#1f2a1d]/10 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#f6f8f4]">
                          <span className="text-[12.5px] font-bold text-[#1f2a1d]">{AREA_LABEL[area] ?? area}</span>
                          <Link href={`/areas/${area}`} className="text-[11px] font-semibold text-[#3d5638] hover:opacity-70 shrink-0 transition-opacity">領域を見る →</Link>
                        </div>
                        <ul className="divide-y divide-[#1f2a1d]/8 bg-white">
                          {arts.map((a) => (
                            <li key={a.slug}>
                              <Link href={`/areas/${area}/${a.slug}`} className="group flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#f6f8f4] transition-colors">
                                <span className="text-[12.5px] text-[#3a423a] group-hover:text-[#16241A] leading-[1.5] transition-colors">{a.title}</span>
                                <span aria-hidden className="text-[#85AB8B] shrink-0 text-[12px] group-hover:translate-x-0.5 transition-transform">読む →</span>
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
                  <li key={i} className="flex gap-2 text-[11.5px] text-[#6b7a66] leading-[1.8]">
                    <span aria-hidden className="text-[#9aa79a] shrink-0">※</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>

              {/* 接続＝パーソナライズへ */}
              <div className="mt-6 rounded-[1.2rem] bg-[#eef3ea] border border-[#85AB8B]/30 p-5">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#3d5638] mb-2">Next</div>
                <p className="text-[12.5px] text-[#3a423a] leading-[1.9]">
                  これは、入力から自動で組んだ<span className="font-semibold text-[#16241A]">下書き</span>です。
                  無料相談で、あなたの現在地と日程に合わせて<span className="font-semibold text-[#16241A]">専用のパッケージに設計し直し</span>、
                  合うプロ・施設へおつなぎします。売り込みはありません。
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

              <button type="button" onClick={reset} className="mt-4 text-[12px] font-semibold text-[#6b7a66] underline underline-offset-4 hover:text-[#3d5638] transition-colors">
                入力し直す
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
