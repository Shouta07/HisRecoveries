"use client";

// ⚠️ プロトタイプ（デモ）。実サービスではありません。
// - ログインはデモ（任意のID/パスワードで入れる）。本物の認証ではない。
// - 入力データはこの端末内（localStorage）のみに保存。外部に一切送信しない。
// - 医療行為ではない。数値の解釈・診断は医師が行う。提案は一般的な生活のヒント。
// 本番化には、セキュアなバックエンド・暗号化・要配慮個人情報の同意フロー等が別途必要
// （docs/MEMBER_PLATFORM_SPEC.md 参照）。

import { useEffect, useState } from "react";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  fontFeatureSettings: '"palt" 1',
};

type Marker = { key: string; label: string; unit: string; low: number; high: number; hint: string; cat: string };

const MARKERS: Marker[] = [
  { key: "testosterone", label: "テストステロン", unit: "ng/dL", low: 250, high: 1100, hint: "活力・意欲に関わるとされる。睡眠・運動・体重管理が土台。", cat: "vitality" },
  { key: "ferritin", label: "フェリチン（鉄）", unit: "ng/mL", low: 30, high: 300, hint: "低いと疲れやすさに関わることがある。鉄を含む食事を意識。", cat: "iron" },
  { key: "zinc", label: "亜鉛", unit: "µg/dL", low: 80, high: 130, hint: "肌・髪・味覚に関わるとされる。牡蠣・赤身肉・ナッツなど。", cat: "zinc" },
  { key: "vitaminD", label: "ビタミンD", unit: "ng/mL", low: 30, high: 50, hint: "日光と食事で。骨・気分との関連が語られる。", cat: "vitd" },
  { key: "hba1c", label: "HbA1c", unit: "%", low: 4.6, high: 5.5, hint: "高めは食事・運動の見直しの目安。甘い飲料を減らす。", cat: "metabo" },
  { key: "ldl", label: "LDLコレステロール", unit: "mg/dL", low: 0, high: 120, hint: "高めは食事・運動の見直しの目安。", cat: "metabo" },
];

type Product = { name: string; cat: string; price: string; note: string };
const PRODUCTS: Product[] = [
  { name: "亜鉛＋マルチミネラル", cat: "zinc", price: "¥2,480", note: "肌・髪・味覚が気になる方へ" },
  { name: "鉄分（ヘム鉄）サプリ", cat: "iron", price: "¥1,980", note: "疲れやすさが気になる方へ" },
  { name: "ビタミンD3", cat: "vitd", price: "¥1,280", note: "屋内で過ごす時間が長い方へ" },
  { name: "ホエイプロテイン", cat: "vitality", price: "¥3,980", note: "運動・体づくりの土台に" },
  { name: "睡眠サポート（テアニン）", cat: "general", price: "¥2,180", note: "夜の切り替えに" },
  { name: "メンズスキンケア 3点セット", cat: "general", price: "¥4,400", note: "洗顔・化粧水・保湿の基本" },
  { name: "眉スタイリングキット", cat: "general", price: "¥2,900", note: "印象づくりの手軽な一歩" },
  { name: "低GI 置き換え食", cat: "metabo", price: "¥3,200", note: "食事の見直しに" },
];

const LS_AUTH = "hr_member_demo_auth";
const LS_DATA = "hr_member_demo_bloods";

export default function MemberApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"osusume" | "all">("osusume");

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(LS_AUTH) === "1");
      const d = localStorage.getItem(LS_DATA);
      if (d) setVals(JSON.parse(d));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !pw.trim()) return;
    localStorage.setItem(LS_AUTH, "1");
    setAuthed(true);
  }
  function logout() {
    localStorage.removeItem(LS_AUTH);
    setAuthed(false);
  }
  function saveVals(next: Record<string, string>) {
    setVals(next);
    try { localStorage.setItem(LS_DATA, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function statusOf(m: Marker): "low" | "high" | "ok" | "none" {
    const raw = vals[m.key];
    if (raw === undefined || raw === "") return "none";
    const n = Number(raw);
    if (Number.isNaN(n)) return "none";
    if (n < m.low) return "low";
    if (n > m.high) return "high";
    return "ok";
  }

  // 入力に基づく、範囲外マーカー → 行動提案 & おすすめ商品カテゴリ
  const flagged = MARKERS.filter((m) => statusOf(m) === "low" || statusOf(m) === "high");
  const recCats = new Set<string>(flagged.map((m) => m.cat));
  recCats.add("general");
  const recommended = PRODUCTS.filter((p) => recCats.has(p.cat));

  if (!ready) return null;

  const banner = (
    <div className="rounded-[1rem] border border-[#b8860b]/30 bg-[#fff8e6] px-4 py-3 text-[12px] text-[#7a5b00] leading-[1.8]">
      <strong className="font-bold">プロトタイプ（デモ）です。</strong>
      入力データはこの端末内にのみ保存され、外部に送信されません。本機能は医療行為ではなく、数値の解釈・診断は医師が行います。提案は一般的な生活のヒントです。
    </div>
  );

  // ── ログイン画面 ──
  if (!authed) {
    return (
      <div className="mx-auto max-w-[420px] px-6 py-16">
        <div className="mb-6">{banner}</div>
        <h1 className="text-[1.7rem] text-[#1f2a1d] mb-2" style={HEAD}>会員ログイン <span className="text-[#85AB8B] text-[13px] font-mono align-middle">β</span></h1>
        <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-6">
          あなたの状態を記録し、それに基づく提案を受け取れる会員ページ（試作）。<br />
          <span className="text-[#6b7a66]">デモのため、任意のIDとパスワードでログインできます。</span>
        </p>
        <form onSubmit={login} className="space-y-4">
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="ID（任意）" className="w-full rounded-2xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#3d5638]" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="パスワード（任意）" className="w-full rounded-2xl border border-[#1f2a1d]/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#3d5638]" />
          <button type="submit" className="w-full rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[15px] font-semibold py-3.5 transition-colors">ログイン</button>
        </form>
      </div>
    );
  }

  // ── ダッシュボード ──
  return (
    <div className="mx-auto max-w-[980px] px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[1.5rem] text-[#1f2a1d]" style={HEAD}>マイページ <span className="text-[#85AB8B] text-[12px] font-mono align-middle">β</span></h1>
        <button onClick={logout} className="text-[12px] text-[#6b7a66] hover:text-[#1f2a1d] underline underline-offset-2">ログアウト</button>
      </div>
      <div className="mb-8">{banner}</div>

      {/* ① 血液データ入力 */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
          <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />血液検査データを入れる
        </h2>
        <p className="text-[12px] text-[#6b7a66] mb-4">検査結果の数値を入力すると、下に一般的な生活のヒントとおすすめが出ます（診断ではありません）。</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MARKERS.map((m) => {
            const st = statusOf(m);
            const color = st === "low" ? "#b4763c" : st === "high" ? "#b4453c" : st === "ok" ? "#3d5638" : "#9aa79a";
            const badge = st === "low" ? "低め" : st === "high" ? "高め" : st === "ok" ? "範囲内" : "";
            return (
              <div key={m.key} className="rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold text-[#1f2a1d]">{m.label}</span>
                  {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: color + "1a" }}>{badge}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input inputMode="decimal" value={vals[m.key] ?? ""} onChange={(e) => saveVals({ ...vals, [m.key]: e.target.value })} placeholder="—" className="w-full rounded-lg border border-[#1f2a1d]/15 bg-white px-3 py-2 text-[14px] outline-none focus:border-[#3d5638]" />
                  <span className="text-[11px] text-[#9aa79a] whitespace-nowrap">{m.unit}</span>
                </div>
                <p className="mt-1 text-[10px] text-[#9aa79a]">目安 {m.low || 0}–{m.high}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ② 行動提案 */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
          <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />あなたへの、行動のヒント
        </h2>
        {flagged.length === 0 ? (
          <div className="rounded-[1.1rem] border border-dashed border-[#1f2a1d]/15 bg-white/50 p-6 text-[13px] text-[#6b7a66] leading-[1.9]">
            数値を入力すると、範囲より低め・高めの項目について、一般的な生活のヒントが表示されます。
          </div>
        ) : (
          <div className="space-y-3">
            {flagged.map((m) => (
              <div key={m.key} className="rounded-[1.1rem] bg-[#16241a] text-[#EDF1E8] p-5">
                <div className="text-[13px] font-bold text-[#85AB8B] mb-1">{m.label}が{statusOf(m) === "low" ? "低め" : "高め"}の可能性</div>
                <p className="text-[12.5px] text-[#C9D2C4] leading-[1.9]">{m.hint}</p>
                <p className="mt-1.5 text-[11px] text-[#9FB0A0]">※ 数値の意味・対処は医師にご確認ください。これは診断ではありません。</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ③ ECマーケットプレイス */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d]" style={HEAD}>
            <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />マーケットプレイス
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
        <p className="mt-4 text-[11px] text-[#9aa79a] leading-[1.8]">
          ※ 商品は例です。実際の決済は行いません。将来的に、状態に合った中立なおすすめを、提携ストアと連携して並べる構想です。
        </p>
      </section>
    </div>
  );
}
