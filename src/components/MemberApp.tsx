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

// dir: "up" = 範囲内で高いほどステータス高 / "down" = 低いほど高。short = レーダー軸の短縮名。
type Marker = { key: string; label: string; short: string; unit: string; low: number; high: number; dir: "up" | "down"; hint: string; cat: string };

const MARKERS: Marker[] = [
  { key: "testosterone", label: "テストステロン", short: "活力", unit: "ng/dL", low: 250, high: 1100, dir: "up", hint: "活力・意欲に関わるとされる。睡眠・運動・体重管理が土台。", cat: "vitality" },
  { key: "ferritin", label: "フェリチン（鉄）", short: "鉄", unit: "ng/mL", low: 30, high: 300, dir: "up", hint: "低いと疲れやすさに関わることがある。鉄を含む食事を意識。", cat: "iron" },
  { key: "zinc", label: "亜鉛", short: "亜鉛", unit: "µg/dL", low: 80, high: 130, dir: "up", hint: "肌・髪・味覚に関わるとされる。牡蠣・赤身肉・ナッツなど。", cat: "zinc" },
  { key: "vitaminD", label: "ビタミンD", short: "ビタD", unit: "ng/mL", low: 30, high: 50, dir: "up", hint: "日光と食事で。骨・気分との関連が語られる。", cat: "vitd" },
  { key: "hba1c", label: "HbA1c", short: "血糖", unit: "%", low: 4.6, high: 5.5, dir: "down", hint: "高めは食事・運動の見直しの目安。甘い飲料を減らす。", cat: "metabo" },
  { key: "ldl", label: "LDLコレステロール", short: "脂質", unit: "mg/dL", low: 0, high: 120, dir: "down", hint: "高めは食事・運動の見直しの目安。", cat: "metabo" },
];

// RPGステータス化：各マーカーを 0–100 の「ステータス値」に。診断ではなく可視化。
function markerScore(m: Marker, raw: string | undefined): number {
  if (raw === undefined || raw === "") return 0;
  const v = Number(raw);
  if (Number.isNaN(v)) return 0;
  const span = m.high - m.low || 1;
  const s = m.dir === "down" ? ((m.high - v) / span) * 100 : ((v - m.low) / span) * 100;
  return Math.max(0, Math.min(100, Math.round(s)));
}
function rankOf(score: number): string {
  return score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : score >= 45 ? "C" : score >= 30 ? "D" : "E";
}

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

// ── 体験の設計思想 ───────────────────────────────────────────────
// これは毎日開かせる習慣アプリではない。日々のセルフケアは記録させない。
// 中心にあるのは「回復を経て、どうなりたいか（＝行き先）」。
// その行き先へ向かって、通院・来店という現実の物語を進めていく。
// 煽らない・比べない・傷つけない。ゆっくりでいい。

// なりたい自分（行き先）の候補。自由入力も可。
const GOALS: string[] = [
  "自信を持って、人と会えるように",
  "写真で、自然に笑えるように",
  "清潔感で、第一印象を変えたい",
  "疲れて見える自分を、変えたい",
  "年齢に、負けたくない",
  "鏡を見るのが、嫌じゃなくなりたい",
];

// 章 = From Complex to Confidence の道のり。行き先へ近づく段階。
const CHAPTERS = [
  { n: 1, ja: "気づく", desc: "行き先を、見つける" },
  { n: 2, ja: "整える", desc: "はじめの一歩を、踏み出す" },
  { n: 3, ja: "続く", desc: "変化が、積み上がっていく" },
  { n: 4, ja: "自信", desc: "なりたい自分に、近づく" },
];

// ── ストーリー・クエスト ─────────────────────────────────────────
// 物語の本筋は「通院（提携クリニック）」と「来店（診断・施術・サロン）」。
// クエストを"クリア"すると章が上がる＝オフラインに行かないと物語が進まない。
type Quest = {
  id: string;
  kind: "相談" | "検査" | "診断" | "施術" | "メンテ";
  place: "オンライン可" | "通院" | "来店";
  title: string;
  desc: string;
  cta: { label: string; href: string };
};
const QUESTS: Quest[] = [
  { id: "q-consult", kind: "相談", place: "オンライン可", title: "まず、そっと相談する", desc: "何から始めるか、匿名で。ここが物語の入口。", cta: { label: "無料で相談する", href: "/apply" } },
  { id: "q-blood", kind: "検査", place: "通院", title: "血液検査を受けに行く", desc: "提携クリニックで、いまの自分を数値で知る。", cta: { label: "検査を予約する", href: "/apply" } },
  { id: "q-diagnosis", kind: "診断", place: "来店", title: "印象診断を受ける", desc: "第一印象を、プロが要素分解。次の一手が決まる。", cta: { label: "印象診断を予約", href: "/packages/first-impression" } },
  { id: "q-session", kind: "施術", place: "来店", title: "はじめての施術に行く", desc: "クリニック／サロンで、整えるを実行する日。", cta: { label: "パッケージを見る", href: "/packages/first-impression" } },
  { id: "q-maintain", kind: "メンテ", place: "通院", title: "メンテナンスに通う", desc: "変化を、続く力に。定期的に整えに行く。", cta: { label: "次回を相談する", href: "/apply" } },
];

type Milestone = { id: string; label: string; test: (s: JStat) => boolean };
const MILESTONES: Milestone[] = [
  { id: "goal", label: "行き先を決めた", test: (s) => s.goalSet },
  { id: "go1", label: "はじめての来訪", test: (s) => s.visits >= 1 },
  { id: "blood", label: "検査を受けた", test: (s) => s.didBlood },
  { id: "session", label: "はじめての施術", test: (s) => s.didSession },
  { id: "go3", label: "3つの物語を越えた", test: (s) => s.visits >= 3 },
  { id: "goal4", label: "行き先に、たどり着いた", test: (s) => s.visits >= QUESTS.length },
];

type JStat = { hasBlood: boolean; visits: number; didBlood: boolean; didSession: boolean; goalSet: boolean };
type Journey = { visits: string[]; goal: string }; // visits: 完了したquestのid, goal: なりたい自分

const LS_AUTH = "hr_member_demo_auth";
const LS_DATA = "hr_member_demo_bloods";
const LS_JOURNEY = "hr_member_demo_journey";

export default function MemberApp() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"osusume" | "all">("osusume");
  const [journey, setJourney] = useState<Journey>({ visits: [], goal: "" });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");

  useEffect(() => {
    try {
      setAuthed(localStorage.getItem(LS_AUTH) === "1");
      const d = localStorage.getItem(LS_DATA);
      if (d) setVals(JSON.parse(d));
      const j = localStorage.getItem(LS_JOURNEY);
      if (j) { const p = JSON.parse(j); setJourney({ visits: p.visits ?? [], goal: p.goal ?? "" }); }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  function saveJourney(next: Journey) {
    setJourney(next);
    try { localStorage.setItem(LS_JOURNEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  function setGoal(goal: string) {
    saveJourney({ ...journey, goal });
    setEditingGoal(false);
  }
  function toggleVisit(qid: string) {
    const v = journey.visits.includes(qid) ? journey.visits.filter((x) => x !== qid) : [...journey.visits, qid];
    saveJourney({ ...journey, visits: v });
  }

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

  // ── 物語の集計（行き先へ、どこまで来たか）──
  const hasBlood = Object.values(vals).some((v) => v !== undefined && v !== "");
  const visits = journey.visits;
  const didKind = (k: Quest["kind"]) => QUESTS.some((q) => q.kind === k && visits.includes(q.id));
  const stat: JStat = {
    hasBlood, visits: visits.length, didBlood: didKind("検査"),
    didSession: didKind("施術"), goalSet: journey.goal.trim().length > 0,
  };
  // 章は「オフラインに行くこと」で進む。行かなければ物語は先へ進まない。
  let chIdx = 0; // 気づく
  if (didKind("相談") || didKind("検査")) chIdx = 1; // 整える
  if (didKind("施術")) chIdx = 2; // 続く
  if (didKind("メンテ")) chIdx = 3; // 自信
  const chapter = CHAPTERS[chIdx];
  const storyProgress = visits.length / QUESTS.length;
  const nextQuest = QUESTS.find((q) => !visits.includes(q.id));

  // ── ステータス（レーダーチャート＝RPGのキャラシート）──
  const RC = { cx: 120, cy: 106, R: 80 };
  const radar = MARKERS.map((m, i) => {
    const ang = (-90 + i * 60) * (Math.PI / 180);
    return { m, i, ang, sc: markerScore(m, vals[m.key]) };
  });
  const overall = hasBlood ? Math.round(radar.reduce((n, a) => n + a.sc, 0) / radar.length) : 0;
  const polyPts = radar
    .map((a) => { const r = (RC.R * a.sc) / 100; return `${(RC.cx + r * Math.cos(a.ang)).toFixed(1)},${(RC.cy + r * Math.sin(a.ang)).toFixed(1)}`; })
    .join(" ");
  const ringPts = (pct: number) =>
    MARKERS.map((_, i) => { const ang = (-90 + i * 60) * (Math.PI / 180); const r = (RC.R * pct) / 100; return `${(RC.cx + r * Math.cos(ang)).toFixed(1)},${(RC.cy + r * Math.sin(ang)).toFixed(1)}`; })
      .join(" ");

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

      {/* ⓪ なりたい自分（行き先）＋ 物語の道のり */}
      <section className="mb-12">
        {/* 行き先（North Star） */}
        <div className="relative overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#16241a] via-[#1b2c1f] to-[#0f1a12] text-[#EDF1E8] p-7 sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-[#85AB8B]/10 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] tracking-[0.22em] text-[#85AB8B] font-semibold mb-3">YOUR DESTINATION ・ なりたい自分</div>
            {stat.goalSet && !editingGoal ? (
              <div>
                <p className="text-[1.5rem] sm:text-[1.9rem] leading-[1.5] text-[#F3F6EF]" style={HEAD}>「{journey.goal}」</p>
                <button onClick={() => { setGoalDraft(journey.goal); setEditingGoal(true); }} className="mt-3 text-[12px] text-[#9FB0A0] hover:text-[#EDF1E8] underline underline-offset-2">行き先を変える</button>
              </div>
            ) : (
              <div>
                <p className="text-[15px] text-[#C9D2C4] leading-[1.9] mb-5">回復の先で、あなたはどうなりたいですか。<br className="hidden sm:block" />ひとつ選んでください。いつでも変えられます。</p>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {GOALS.map((g) => (
                    <button key={g} onClick={() => setGoal(g)} className="text-left text-[13px] rounded-full border border-[#ffffff]/15 hover:border-[#85AB8B] hover:bg-[#85AB8B]/10 px-4 py-2 transition-colors">
                      {g}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-[560px]">
                  <input
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    placeholder="自分の言葉で書く…"
                    className="flex-1 rounded-full bg-[#0f1a12] border border-[#ffffff]/15 px-4 py-2.5 text-[14px] text-[#EDF1E8] placeholder:text-[#6f7d6c] outline-none focus:border-[#85AB8B]"
                  />
                  <button onClick={() => goalDraft.trim() && setGoal(goalDraft.trim())} className="rounded-full bg-[#EDF1E8] text-[#16241a] text-[13px] font-bold px-5 py-2.5 hover:bg-white transition-colors">これにする</button>
                </div>
              </div>
            )}

            {/* 行き先へ、どこまで来たか */}
            {stat.goalSet && !editingGoal && (
              <div className="mt-7 pt-6 border-t border-[#ffffff]/10">
                <div className="flex items-end justify-between gap-4 mb-2.5">
                  <div>
                    <div className="text-[11px] text-[#9FB0A0]">いまは</div>
                    <div className="text-[1.15rem]" style={HEAD}>第{chapter.n}章　{chapter.ja}<span className="text-[12.5px] text-[#9FB0A0] font-normal ml-2">— {chapter.desc}</span></div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[1.6rem] leading-none" style={HEAD}>{visits.length}</span>
                    <span className="text-[12px] text-[#9FB0A0]">/{QUESTS.length}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[#0f1a12] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#85AB8B] to-[#A9CBAE] transition-all duration-500" style={{ width: `${Math.round(storyProgress * 100)}%` }} />
                </div>
                <p className="mt-2.5 text-[11px] text-[#9FB0A0] leading-[1.8]">物語は、通院・来店という現実の一歩で前に進みます。毎日ここを開く必要はありません。行き先に近づいたと感じたときに、また。</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {MILESTONES.map((m) => {
                    const got = m.test(stat);
                    return (
                      <span key={m.id} className={`text-[11px] px-2.5 py-1 rounded-full border ${got ? "border-[#85AB8B]/50 bg-[#85AB8B]/15 text-[#EDF1E8]" : "border-[#ffffff]/10 text-[#6f7d6c]"}`}>
                        {got ? "◆" : "◇"} {m.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 次の一歩（＝次に行く場所）。行き先を決めた人だけに出す。 */}
        {stat.goalSet && !editingGoal && (
          <>
            {nextQuest ? (
              <div className="mt-5 rounded-[1.3rem] border border-[#3d5638]/20 bg-[#f5f8f2] p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] tracking-[0.16em] text-[#3d5638] font-bold">次の一歩</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3d5638] text-white">{nextQuest.place}</span>
                  <span className="text-[10px] text-[#6b7a66]">{nextQuest.kind}</span>
                </div>
                <h3 className="text-[1.2rem] text-[#1f2a1d] mb-1.5" style={HEAD}>{nextQuest.title}</h3>
                <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-5">{nextQuest.desc}</p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <a href={nextQuest.cta.href} className="flex-1 text-center rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[14px] font-semibold py-3 transition-colors">{nextQuest.cta.label}</a>
                  <button onClick={() => toggleVisit(nextQuest.id)} className="rounded-full border border-[#3d5638]/40 text-[#3d5638] hover:bg-[#eef3ea] text-[13px] font-semibold px-5 py-3 transition-colors">行ってきた（デモ）</button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.3rem] border border-[#3d5638]/20 bg-[#f5f8f2] p-7 text-center">
                <div className="text-[1.2rem] text-[#1f2a1d] mb-1.5" style={HEAD}>「{journey.goal}」へ、歩ききりました。</div>
                <p className="text-[13px] text-[#4b5b47] leading-[1.9]">ここまでよく来ました。ここからは、あなたのペースでメンテナンスを。<br />新しい行き先ができたら、いつでも書き換えてください。</p>
              </div>
            )}

            {/* 道のり（行き先までの地図） */}
            <div className="mt-6">
              <h3 className="text-[13px] font-bold text-[#1f2a1d] mb-3">行き先までの、道のり</h3>
              <ol className="relative border-l-2 border-[#1f2a1d]/10 ml-2 space-y-3.5">
                {QUESTS.map((q) => {
                  const done = visits.includes(q.id);
                  const current = nextQuest?.id === q.id;
                  return (
                    <li key={q.id} className="ml-4 pl-1">
                      <span aria-hidden className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${done ? "bg-[#3d5638] border-[#3d5638]" : current ? "bg-white border-[#3d5638] ring-4 ring-[#3d5638]/10" : "bg-[#eef1ea] border-[#1f2a1d]/15"}`} />
                      <div className={`flex flex-wrap items-center gap-2 ${done || current ? "" : "opacity-55"}`}>
                        <span className={`text-[13px] ${done ? "text-[#3d5638] font-semibold" : current ? "text-[#1f2a1d] font-bold" : "text-[#6b7a66]"}`}>{q.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#1f2a1d]/12 text-[#6b7a66]">{q.place}</span>
                        {done && <span className="text-[11px] text-[#3d5638]">✓ 越えた</span>}
                        {current && <span className="text-[11px] text-[#b4763c]">← いまここ</span>}
                      </div>
                    </li>
                  );
                })}
                <li className="ml-4 pl-1">
                  <span aria-hidden className={`absolute -left-[11px] w-5 h-5 rounded-full grid place-items-center text-[10px] ${storyProgress >= 1 ? "bg-[#3d5638] text-white" : "bg-[#eef1ea] text-[#9aa79a] border-2 border-[#1f2a1d]/15"}`}>★</span>
                  <div className="text-[13px] font-bold text-[#1f2a1d]">なりたい自分「{journey.goal}」</div>
                </li>
              </ol>
            </div>
          </>
        )}
      </section>

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

      {/* ①' ステータス（レーダーチャート＝RPGのキャラシート） */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2.5 text-[1.15rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
          <span aria-hidden className="w-1 h-5 rounded-full bg-[#85AB8B]" />あなたのステータス
        </h2>
        <p className="text-[12px] text-[#6b7a66] mb-4">検査値を、6つのステータスとして可視化。検査に行くたびに更新され、育っていきます（診断ではありません）。</p>
        <div className="rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-8 grid md:grid-cols-[240px_1fr] gap-6 items-center">
          {/* レーダー */}
          <div className="relative mx-auto">
            <svg viewBox="0 0 240 205" width="240" height="205" style={{ overflow: "visible" }} aria-label="ステータスのレーダーチャート">
              {[25, 50, 75, 100].map((p) => (
                <polygon key={p} points={ringPts(p)} fill="none" stroke="#2c3f2f" strokeWidth="1" />
              ))}
              {radar.map((a) => (
                <line key={a.i} x1={RC.cx} y1={RC.cy} x2={RC.cx + RC.R * Math.cos(a.ang)} y2={RC.cy + RC.R * Math.sin(a.ang)} stroke="#2c3f2f" strokeWidth="1" />
              ))}
              {hasBlood && <polygon points={polyPts} fill="#85AB8B" fillOpacity="0.32" stroke="#A9CBAE" strokeWidth="2" />}
              {hasBlood && radar.map((a) => {
                const r = (RC.R * a.sc) / 100;
                return <circle key={a.i} cx={RC.cx + r * Math.cos(a.ang)} cy={RC.cy + r * Math.sin(a.ang)} r="2.5" fill="#EDF1E8" />;
              })}
              {radar.map((a) => {
                const lr = RC.R + 15;
                const x = RC.cx + lr * Math.cos(a.ang);
                const y = RC.cy + lr * Math.sin(a.ang);
                return (
                  <text key={a.i} x={x} y={y} dy="3" textAnchor="middle" fontSize="10" fill="#9FB0A0">{a.m.short}</text>
                );
              })}
            </svg>
          </div>
          {/* オーバーオール＆ステータス一覧 */}
          <div>
            <div className="flex items-end gap-3 mb-4">
              <div>
                <div className="text-[11px] tracking-[0.15em] text-[#85AB8B] font-semibold">CONDITION</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[2.6rem] leading-none" style={HEAD}>{overall}</span>
                  <span className="text-[13px] text-[#9FB0A0]">/100</span>
                  {hasBlood && <span className="text-[1.4rem] font-black text-[#A9CBAE] ml-1" style={HEAD}>ランク {rankOf(overall)}</span>}
                </div>
              </div>
            </div>
            {!hasBlood && <p className="text-[12px] text-[#9FB0A0] mb-4">上の欄に検査値を入力すると、ステータスが表示されます。</p>}
            <div className="space-y-2">
              {radar.map((a) => (
                <div key={a.i} className="flex items-center gap-3">
                  <span className="w-12 text-[11px] text-[#C9D2C4] shrink-0">{a.m.short}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#0f1a12] overflow-hidden">
                    <div className="h-full rounded-full bg-[#85AB8B] transition-all" style={{ width: `${a.sc}%` }} />
                  </div>
                  <span className="w-8 text-right text-[11px] font-mono text-[#EDF1E8]">{a.sc}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-[#9FB0A0] leading-[1.8]">
              ※ ゲーム的な可視化です。数値の意味・対処は医師が判断します。<span className="text-[#A9CBAE]">検査（通院）に行くと、ステータスが更新されます。</span>
            </p>
          </div>
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
