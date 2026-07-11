"use client";

// ⚠️ プロトタイプ（デモ）。実サービスではありません。
// 設計思想：顧客は一切の入力をしない。血液値・目標・来訪履歴などは
// すべて Accord（HR/VDのコーディネーション基盤）から自動で連携され、
// 会員は「整えられていく自分」を受け取って眺めるだけ。ここは読み取り専用ビュー。
// - ログインはデモ（任意のID/パスワードで入れる）。本物の認証ではない。
// - 表示データはデモ用のモック（Accord連携の再現）。外部送信なし。
// - 医療行為ではない。数値の解釈・診断は医師が行う。提案は一般的な生活のヒント。
// 本番化には、セキュアなバックエンド・暗号化・要配慮個人情報の同意フロー等が別途必要
// （docs/MEMBER_PLATFORM_SPEC.md 参照）。

import { useState } from "react";
import {
  type Bloods, type Marker, type Kind,
  MARKERS, markerScore, rankOf, overallOfBloods, FEED_ACTIVE, FEED_EMPTY,
} from "@/lib/accord";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  fontFeatureSettings: '"palt" 1',
};

function statusOf(m: Marker, v: Bloods): "low" | "high" | "ok" | "none" {
  const raw = v[m.key];
  if (raw === undefined || raw === "") return "none";
  const n = Number(raw);
  if (Number.isNaN(n)) return "none";
  if (n < m.low) return "low";
  if (n > m.high) return "high";
  return "ok";
}

type Product = { name: string; cat: string; price: string; note: string };
const PRODUCTS: Product[] = [
  { name: "亜鉛＋マルチミネラル", cat: "zinc", price: "¥2,480", note: "肌・髪・味覚が気になる方へ" },
  { name: "鉄分（ヘム鉄）サプリ", cat: "iron", price: "¥1,980", note: "疲れやすさが気になる方へ" },
  { name: "ビタミンD3", cat: "vitd", price: "¥1,280", note: "屋内で過ごす時間が長い方へ" },
  { name: "ホエイプロテイン", cat: "vitality", price: "¥3,980", note: "運動・体づくりの土台に" },
  { name: "睡眠サポート（テアニン）", cat: "general", price: "¥2,180", note: "夜の切り替えに" },
  { name: "メンズスキンケア 3点セット", cat: "general", price: "¥4,400", note: "洗顔・化粧水・保湿の基本" },
];

// 章 = From Complex to Confidence の道のり。行き先へ近づく段階。
const CHAPTERS = [
  { n: 1, ja: "気づく", desc: "行き先を、見つける" },
  { n: 2, ja: "整える", desc: "はじめの一歩を、踏み出す" },
  { n: 3, ja: "続く", desc: "変化が、積み上がっていく" },
  { n: 4, ja: "自信", desc: "なりたい自分に、近づく" },
];

type Session = { name: string; demo?: boolean } | null;

export default function MemberApp({ session, lineEnabled }: { session: Session; lineEnabled: boolean }) {
  const [tab, setTab] = useState<"osusume" | "all">("osusume");
  const [scenario, setScenario] = useState<"active" | "empty">("active");

  const authed = !!session;

  const banner = (
    <div className="rounded-[1rem] border border-[#b8860b]/30 bg-[#fff8e6] px-4 py-3 text-[12px] text-[#7a5b00] leading-[1.8]">
      <strong className="font-bold">プロトタイプ（デモ）です。</strong>
      あなたは何も入力しません。相談・検査・施術の記録や数値は、すべて Accord（HRのコーディネーション基盤）から自動で連携されます。本機能は医療行為ではなく、数値の解釈・診断は医師が行います。
    </div>
  );

  // ── ログイン画面（LINE ログイン）──
  if (!authed) {
    return (
      <div className="mx-auto max-w-[420px] px-6 py-16">
        <div className="mb-6">{banner}</div>
        <h1 className="text-[1.7rem] text-[#1f2a1d] mb-2" style={HEAD}>会員ログイン <span className="text-[#85AB8B] text-[13px] font-mono align-middle">β</span></h1>
        <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-7">
          あなたの物語が、そのまま映し出されるページ（試作）。入力は要りません。<br />
          <span className="text-[#6b7a66]">LINE でログインすると、これからのご連絡も LINE でお届けします。</span>
        </p>
        <a
          href="/api/member/line/login"
          className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white text-[15px] font-bold py-3.5 transition-colors"
        >
          <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.69 2 10.23c0 4.07 3.55 7.48 8.35 8.13.32.07.77.21.88.49.1.25.07.64.03.9l-.14.85c-.04.25-.2.98.86.54 1.06-.45 5.7-3.36 7.78-5.75C21.3 13.77 22 12.09 22 10.23 22 5.69 17.52 2 12 2z"/></svg>
          LINE でログイン
        </a>
        {!lineEnabled && (
          <p className="mt-3 text-[11px] text-[#9aa79a] leading-[1.8]">
            ※ デモ環境では LINE チャネル未接続のため、ボタンを押すと擬似ログインで会員ページを体験できます。本番では実際の LINE ログインになります。
          </p>
        )}
      </div>
    );
  }

  const displayName = session?.name ?? "会員";

  // ── Accord フィードの読み取り（顧客は何も入力しない）──
  const feed = scenario === "active" ? FEED_ACTIVE : FEED_EMPTY;
  const goal = feed.goal;
  const goalSet = goal.trim().length > 0;
  const doneVisits = feed.visits.filter((v) => v.status === "done");
  const nextVisit = feed.visits.find((v) => v.status === "scheduled");
  const bloodVisits = doneVisits.filter((v) => v.bloods); // 時系列（古い→新しい）
  const latest = bloodVisits.length > 0 ? bloodVisits[bloodVisits.length - 1] : undefined;
  const prev = bloodVisits.length > 1 ? bloodVisits[bloodVisits.length - 2] : undefined;
  const latestBloods: Bloods = latest?.bloods ?? {};
  const hasBlood = !!latest;

  const didKind = (k: Kind) => doneVisits.some((v) => v.kind === k);
  let chIdx = 0;
  if (didKind("相談") || didKind("検査")) chIdx = 1;
  if (didKind("施術")) chIdx = 2;
  if (didKind("メンテ")) chIdx = 3;
  const chapter = CHAPTERS[chIdx];
  const storyProgress = feed.visits.length > 0 ? doneVisits.length / feed.visits.length : 0;

  // 行動のヒント & EC（最新の検査値から。すべて Accord 由来）
  const flagged = MARKERS.filter((m) => statusOf(m, latestBloods) === "low" || statusOf(m, latestBloods) === "high");
  const recCats = new Set<string>(flagged.map((m) => m.cat));
  recCats.add("general");
  const recommended = PRODUCTS.filter((p) => recCats.has(p.cat));

  // レーダー
  const RC = { cx: 120, cy: 106, R: 80 };
  const radar = MARKERS.map((m, i) => {
    const ang = (-90 + i * 60) * (Math.PI / 180);
    const sc = markerScore(m, latestBloods[m.key]);
    const p = prev ? markerScore(m, prev.bloods![m.key]) : null;
    return { m, i, ang, sc, prev: p, delta: p === null ? null : sc - p };
  });
  const overall = hasBlood ? Math.round(radar.reduce((n, a) => n + a.sc, 0) / radar.length) : 0;
  const prevOverall = prev ? overallOfBloods(prev.bloods!) : null;
  const overallDelta = prevOverall === null ? null : overall - prevOverall;
  const ptFor = (sc: number, ang: number) => { const r = (RC.R * sc) / 100; return `${(RC.cx + r * Math.cos(ang)).toFixed(1)},${(RC.cy + r * Math.sin(ang)).toFixed(1)}`; };
  const polyPts = radar.map((a) => ptFor(a.sc, a.ang)).join(" ");
  const prevPolyPts = prev ? radar.map((a) => ptFor(a.prev ?? 0, a.ang)).join(" ") : "";
  const ringPts = (pct: number) =>
    MARKERS.map((_, i) => { const ang = (-90 + i * 60) * (Math.PI / 180); const r = (RC.R * pct) / 100; return `${(RC.cx + r * Math.cos(ang)).toFixed(1)},${(RC.cy + r * Math.sin(ang)).toFixed(1)}`; }).join(" ");

  const MILESTONES: { label: string; got: boolean }[] = [
    { label: "行き先を決めた", got: goalSet },
    { label: "はじめての来訪", got: doneVisits.length >= 1 },
    { label: "検査を受けた", got: didKind("検査") },
    { label: "はじめての施術", got: didKind("施術") },
    { label: "3つの物語を越えた", got: doneVisits.length >= 3 },
  ];

  // ── ダッシュボード ──
  return (
    <div className="mx-auto max-w-[980px] px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.5rem] text-[#1f2a1d]" style={HEAD}>マイページ <span className="text-[#85AB8B] text-[12px] font-mono align-middle">β</span></h1>
          <p className="text-[12px] text-[#6b7a66] mt-0.5">{displayName} さん{session?.demo && <span className="ml-1 text-[10px] text-[#9aa79a]">（デモ）</span>}</p>
        </div>
        <a href="/api/member/line/logout" className="text-[12px] text-[#6b7a66] hover:text-[#1f2a1d] underline underline-offset-2">ログアウト</a>
      </div>
      <div className="mb-6">{banner}</div>

      {/* Accord連携の表示 */}
      <div className="mb-8 flex items-center gap-2 text-[11px] text-[#6b7a66]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef3ea] text-[#3d5638] font-semibold px-2.5 py-1">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#3d5638]" />Accord 連携
        </span>
        {goalSet ? <span>最終更新 {feed.updatedAt} ・ {feed.coordinator}</span> : <span>まだ連携データはありません</span>}
      </div>

      {!goalSet ? (
        // 相談前（Accordにまだ何もない）
        <section className="mb-12 rounded-[1.6rem] bg-gradient-to-br from-[#16241a] to-[#0f1a12] text-[#EDF1E8] p-8 sm:p-10 text-center">
          <div className="text-[11px] tracking-[0.22em] text-[#85AB8B] font-semibold mb-3">YOUR STORY STARTS HERE</div>
          <h2 className="text-[1.5rem] leading-[1.6] mb-3" style={HEAD}>物語は、相談から始まります。</h2>
          <p className="text-[13px] text-[#C9D2C4] leading-[1.9] mb-6 max-w-[460px] mx-auto">
            一度お話しすれば、あとは私たちが整えます。検査の予約も、結果も、次の一歩も、すべてここに自動で流れてきます。あなたは、何も入力しません。
          </p>
          <a href="/apply" className="inline-block rounded-full bg-[#EDF1E8] text-[#16241a] text-[14px] font-bold px-7 py-3 hover:bg-white transition-colors">まず、そっと相談する</a>
        </section>
      ) : (
        <>
          {/* ⓪ なりたい自分（Accordが把握している行き先） */}
          <section className="mb-6">
            <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#16241a] via-[#1b2c1f] to-[#0f1a12] text-[#EDF1E8] p-7 sm:p-10">
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-[#85AB8B]/10 blur-3xl" />
              <div className="relative">
                <div className="text-[11px] tracking-[0.22em] text-[#85AB8B] font-semibold mb-3">YOUR DESTINATION ・ なりたい自分</div>
                <p className="text-[1.5rem] sm:text-[1.9rem] leading-[1.5] text-[#F3F6EF]" style={HEAD}>「{goal}」</p>

                <div className="mt-7 pt-6 border-t border-[#ffffff]/10">
                  <div className="flex items-end justify-between gap-4 mb-2.5">
                    <div>
                      <div className="text-[11px] text-[#9FB0A0]">いまは</div>
                      <div className="text-[1.15rem]" style={HEAD}>第{chapter.n}章　{chapter.ja}<span className="text-[12.5px] text-[#9FB0A0] font-normal ml-2">— {chapter.desc}</span></div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[1.6rem] leading-none" style={HEAD}>{doneVisits.length}</span>
                      <span className="text-[12px] text-[#9FB0A0]">/{feed.visits.length}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#0f1a12] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#85AB8B] to-[#A9CBAE] transition-all duration-500" style={{ width: `${Math.round(storyProgress * 100)}%` }} />
                  </div>
                  <p className="mt-2.5 text-[11px] text-[#9FB0A0] leading-[1.8]">物語は、通院・来店という現実の一歩で前に進みます。予約も記録も、私たちが整えます。あなたは、来るだけ。</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {MILESTONES.map((m) => (
                      <span key={m.label} className={`text-[11px] px-2.5 py-1 rounded-full border ${m.got ? "border-[#85AB8B]/50 bg-[#85AB8B]/15 text-[#EDF1E8]" : "border-[#ffffff]/10 text-[#6f7d6c]"}`}>
                        {m.got ? "◆" : "◇"} {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 次の予定（Accordが調整済み） */}
          {nextVisit && (
            <section className="mb-10 rounded-[1.3rem] border border-[#3d5638]/20 bg-[#f5f8f2] p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <span className="text-[10px] tracking-[0.16em] text-[#3d5638] font-bold">次の予定</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3d5638] text-white">{nextVisit.place}</span>
                <span className="text-[10px] text-[#6b7a66]">{nextVisit.kind}</span>
                <span className="text-[11px] text-[#3d5638] font-semibold ml-auto">{nextVisit.date}</span>
              </div>
              <h3 className="text-[1.2rem] text-[#1f2a1d] mb-1.5" style={HEAD}>{nextVisit.title}<span className="text-[12px] text-[#6b7a66] font-normal ml-2">@ {nextVisit.by}</span></h3>
              {nextVisit.note && <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-2">{nextVisit.note}</p>}
              <p className="text-[12px] text-[#3d5638] leading-[1.8] mb-5">「{goal}」へ向かう、次の一歩です。日程はこちらで調整済み。当日、来ていただくだけです。</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a href="/apply" className="flex-1 text-center rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[14px] font-semibold py-3 transition-colors">予定を確認・変更する</a>
              </div>
            </section>
          )}

          {/* ステータス（レーダー＝RPGのキャラシート。Accordの検査値から） */}
          {hasBlood && (
            <section className="mb-10">
              <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
                <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />あなたのステータス
              </h2>
              <p className="text-[12px] text-[#6b7a66] mb-4">クリニックの検査値を、6つのステータスとして可視化。検査に行くたび Accord が更新し、育っていきます（診断ではありません）。</p>
              <div className="rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-8 grid md:grid-cols-[240px_1fr] gap-6 items-center">
                <div className="relative mx-auto">
                  <svg viewBox="0 0 240 205" width="240" height="205" style={{ overflow: "visible" }} aria-label="ステータスのレーダーチャート">
                    {[25, 50, 75, 100].map((p) => (<polygon key={p} points={ringPts(p)} fill="none" stroke="#2c3f2f" strokeWidth="1" />))}
                    {radar.map((a) => (<line key={a.i} x1={RC.cx} y1={RC.cy} x2={RC.cx + RC.R * Math.cos(a.ang)} y2={RC.cy + RC.R * Math.sin(a.ang)} stroke="#2c3f2f" strokeWidth="1" />))}
                    {prev && <polygon points={prevPolyPts} fill="none" stroke="#6f7d6c" strokeWidth="1.5" strokeDasharray="3 3" />}
                    <polygon points={polyPts} fill="#85AB8B" fillOpacity="0.32" stroke="#A9CBAE" strokeWidth="2" />
                    {radar.map((a) => { const r = (RC.R * a.sc) / 100; return <circle key={a.i} cx={RC.cx + r * Math.cos(a.ang)} cy={RC.cy + r * Math.sin(a.ang)} r="2.5" fill="#EDF1E8" />; })}
                    {radar.map((a) => { const lr = RC.R + 15; const x = RC.cx + lr * Math.cos(a.ang); const y = RC.cy + lr * Math.sin(a.ang); return <text key={a.i} x={x} y={y} dy="3" textAnchor="middle" fontSize="10" fill="#9FB0A0">{a.m.short}</text>; })}
                  </svg>
                  {prev && (
                    <div className="flex items-center justify-center gap-4 -mt-1 text-[10px] text-[#9FB0A0]">
                      <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-[#A9CBAE]" />今回（{latest!.date}）</span>
                      <span className="flex items-center gap-1.5"><span className="w-4 h-0 border-t-2 border-dashed border-[#6f7d6c]" />前回（{prev.date}）</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-end gap-3 mb-4">
                    <div>
                      <div className="text-[11px] tracking-[0.15em] text-[#85AB8B] font-semibold">CONDITION</div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-[2.6rem] leading-none" style={HEAD}>{overall}</span>
                        <span className="text-[13px] text-[#9FB0A0]">/100</span>
                        <span className="text-[1.4rem] font-black text-[#A9CBAE] ml-1" style={HEAD}>ランク {rankOf(overall)}</span>
                        {overallDelta !== null && overallDelta !== 0 && (
                          <span className={`text-[13px] font-bold ml-1 ${overallDelta > 0 ? "text-[#A9CBAE]" : "text-[#d3a08f]"}`}>前回比 {overallDelta > 0 ? "▲+" : "▼"}{overallDelta > 0 ? overallDelta : Math.abs(overallDelta)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {radar.map((a) => (
                      <div key={a.i} className="flex items-center gap-3">
                        <span className="w-12 text-[11px] text-[#C9D2C4] shrink-0">{a.m.short}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#0f1a12] overflow-hidden">
                          <div className="h-full rounded-full bg-[#85AB8B] transition-all duration-500" style={{ width: `${a.sc}%` }} />
                        </div>
                        {a.delta !== null && a.delta !== 0 ? (
                          <span className={`w-9 text-right text-[10px] font-mono ${a.delta > 0 ? "text-[#A9CBAE]" : "text-[#d3a08f]"}`}>{a.delta > 0 ? "+" : ""}{a.delta}</span>
                        ) : (<span className="w-9 text-right text-[10px] font-mono text-[#6f7d6c]">±0</span>)}
                        <span className="w-8 text-right text-[11px] font-mono text-[#EDF1E8]">{a.sc}</span>
                      </div>
                    ))}
                  </div>
                  {bloodVisits.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-[#ffffff]/10">
                      <div className="text-[12px] text-[#C9D2C4] mb-3">検査ごとの推移（{bloodVisits.length}回）</div>
                      <div className="flex items-end gap-2 overflow-x-auto pb-1">
                        {bloodVisits.map((s, i) => {
                          const ov = overallOfBloods(s.bloods!);
                          return (
                            <div key={i} className="flex flex-col items-center gap-1 shrink-0" style={{ width: 48 }}>
                              <div className="w-full h-16 rounded-md bg-[#0f1a12] flex items-end overflow-hidden">
                                <div className="w-full rounded-md bg-gradient-to-t from-[#3d5638] to-[#85AB8B]" style={{ height: `${Math.max(6, ov)}%` }} />
                              </div>
                              <span className="text-[11px] font-bold text-[#EDF1E8]">{ov}</span>
                              <span className="text-[9px] text-[#6f7d6c] tabular-nums">{s.date.slice(5)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-[11px] text-[#9FB0A0] leading-[1.8]">※ ゲーム的な可視化です。数値の意味・対処は医師が判断します。<span className="text-[#A9CBAE]">検査（通院）のたびに、レーダーが外へ広がっていきます。</span></p>
                </div>
              </div>
            </section>
          )}

          {/* これまでの道のり（Accordの来訪記録） */}
          <section className="mb-10">
            <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
              <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />これまでの道のり
            </h2>
            <ol className="relative border-l-2 border-[#1f2a1d]/10 ml-2 space-y-5">
              {feed.visits.map((v) => {
                const done = v.status === "done";
                return (
                  <li key={v.id} className="ml-5 pl-1">
                    <span aria-hidden className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${done ? "bg-[#3d5638] border-[#3d5638]" : "bg-white border-[#3d5638] ring-4 ring-[#3d5638]/10"}`} />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-[#6b7a66] tabular-nums">{v.date}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#1f2a1d]/12 text-[#6b7a66]">{v.place}</span>
                      <span className="text-[10px] text-[#9aa79a]">{v.kind}</span>
                      {!done && <span className="text-[10px] font-bold text-[#b4763c]">予定</span>}
                    </div>
                    <div className={`text-[14px] font-bold mt-0.5 ${done ? "text-[#1f2a1d]" : "text-[#3d5638]"}`}>{v.title}<span className="text-[11px] text-[#6b7a66] font-normal ml-2">{v.by}</span></div>
                    {v.note && <p className="mt-1 text-[12px] text-[#4b5b47] leading-[1.8]">{v.note}</p>}
                    {v.bloods && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#3d5638] bg-[#eef3ea] rounded-full px-2.5 py-1">
                        <span aria-hidden>▲</span>検査結果を反映（CONDITION {overallOfBloods(v.bloods)}）
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* 行動のヒント（最新の検査値から） */}
          {flagged.length > 0 && (
            <section className="mb-10">
              <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
                <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />いまの、暮らしのヒント
              </h2>
              <div className="space-y-3">
                {flagged.map((m) => (
                  <div key={m.key} className="rounded-[1.1rem] bg-[#16241a] text-[#EDF1E8] p-5">
                    <div className="text-[13px] font-bold text-[#85AB8B] mb-1">{m.label}が{statusOf(m, latestBloods) === "low" ? "低め" : "高め"}の可能性</div>
                    <p className="text-[12.5px] text-[#C9D2C4] leading-[1.9]">{m.hint}</p>
                    <p className="mt-1.5 text-[11px] text-[#9FB0A0]">※ 数値の意味・対処は医師にご確認ください。これは診断ではありません。</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ECマーケットプレイス（最新の検査値に沿って自動で） */}
          {hasBlood && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d]" style={HEAD}>
                  <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />あなたに合わせた品
                </h2>
                <div className="flex gap-1 text-[12px]">
                  <button onClick={() => setTab("osusume")} className={`px-3 py-1 rounded-full font-semibold ${tab === "osusume" ? "bg-[#1f2a1d] text-white" : "text-[#6b7a66]"}`}>あなたへ</button>
                  <button onClick={() => setTab("all")} className={`px-3 py-1 rounded-full font-semibold ${tab === "all" ? "bg-[#1f2a1d] text-white" : "text-[#6b7a66]"}`}>すべて</button>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(tab === "osusume" ? recommended : PRODUCTS).map((p) => (
                  <div key={p.name} className="rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4 flex flex-col">
                    <div aria-hidden className="h-20 rounded-lg mb-3" style={{ background: "linear-gradient(150deg,#eef3ea,#d9e4d6)" }} />
                    <div className="text-[12.5px] font-bold text-[#1f2a1d] leading-[1.4]">{p.name}</div>
                    <div className="text-[11px] text-[#6b7a66] mt-0.5 flex-1">{p.note}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#3d5638]">{p.price}</span>
                      <span className="text-[10px] text-[#9aa79a]">提携ストア</span>
                    </div>
                    <button className="mt-2 w-full rounded-full bg-[#eef3ea] text-[#3d5638] text-[11px] font-semibold py-2 cursor-not-allowed" title="デモのため購入はできません">詳しく見る（デモ）</button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-[#9aa79a] leading-[1.8]">※ 検査結果に沿って、中立に自動で並びます。実際の決済は行いません。</p>
            </section>
          )}
        </>
      )}

      {/* デモ表示の切替（※実サービスには存在しない。顧客は入力しない） */}
      <section className="mt-14 rounded-[1rem] border border-dashed border-[#1f2a1d]/15 bg-[#f7f8f5] p-4">
        <div className="text-[11px] font-bold text-[#6b7a66] mb-2">※ デモ表示の切替（Accord連携の再現用。実際の会員には表示されません）</div>
        <div className="flex gap-2">
          <button onClick={() => setScenario("active")} className={`text-[12px] rounded-full px-4 py-1.5 font-semibold ${scenario === "active" ? "bg-[#1f2a1d] text-white" : "bg-white border border-[#1f2a1d]/15 text-[#4b5b47]"}`}>進行中の会員</button>
          <button onClick={() => setScenario("empty")} className={`text-[12px] rounded-full px-4 py-1.5 font-semibold ${scenario === "empty" ? "bg-[#1f2a1d] text-white" : "bg-white border border-[#1f2a1d]/15 text-[#4b5b47]"}`}>相談前（データなし）</button>
        </div>
      </section>
    </div>
  );
}
