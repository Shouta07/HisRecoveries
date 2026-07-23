import type { Metadata } from "next";
import Link from "next/link";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import { site } from "@/lib/site";

// ============================================================
// /partner — 提携先募集 LP（B2B・決裁者向け）
// デザイン思想: Stripe / Linear / Notion / NEWT
//  ・余白を大きく、文字は少なく、図解中心、1スクロール1メッセージ
//  ・広告臭さを消し、静かな高級ブランドのトーンで
// 目的: 冷たいアウトリーチで開いた30秒で「掲載したい」と思わせる
// ============================================================

// 見出し用（サイト全体ゴシックのため var(--font-shippori) = Noto Sans JP）
const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "提携パートナー募集 — 改善を決めた男性を、あなたのもとへ",
  description:
    "His Recoveries は男性ウェルネスの入口。AI診断と改善ロードマップで目的が明確になった、意欲の高い男性を最適な提携先へ送客します。掲載無料・初期費用無料・月額無料・成果報酬のみ。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "改善を決めた男性を、あなたのもとへ。掲載無料・成果報酬のみ。",
  },
};

// 小さな行ラベル（Liner/Stripe 風の mono eyebrow）
function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[11px] tracking-[0.28em] uppercase ${dark ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>
      {children}
    </div>
  );
}

// メリット4枚のアイコン（線画・Linear風）
const MERIT_ICONS: Record<string, React.ReactNode> = {
  掲載無料: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 9h16" />
      <path d="M8 14h5" />
    </>
  ),
  初期費用無料: (
    <>
      <path d="M12 3v18" />
      <path d="M16.5 7.5c-.8-1.2-2.4-2-4.5-2-2.8 0-4.5 1.3-4.5 3.2 0 4.5 9 2 9 6.4 0 2-1.9 3.4-4.9 3.4-2.3 0-4-.9-4.8-2.2" />
    </>
  ),
  月額無料: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
      <path d="M9 15.5l2 2 4-4" />
    </>
  ),
  成果報酬のみ: (
    <>
      <path d="M3 17l5-5 4 3 8-8" />
      <path d="M17 4h4v4" />
    </>
  ),
};

const MERITS = [
  { t: "掲載無料", d: "掲載そのものに費用はかかりません。" },
  { t: "初期費用無料", d: "導入にあたっての初期投資は不要です。" },
  { t: "月額無料", d: "固定の月額・掲載料はいただきません。" },
  { t: "成果報酬のみ", d: "実際に来院・成約が生まれたときだけ。" },
];

const PATIENTS = [
  { t: "改善意欲が高い", d: "「変わりたい」と決めた人だけが、次に進みます。冷やかしは通りません。" },
  { t: "AI診断済み", d: "肌・髪・印象を診断で可視化。現在地を理解した状態でつなぎます。" },
  { t: "目的が明確", d: "何を、なぜ、どの順で。ロードマップで迷いが解けています。" },
];

const STEPS = [
  { n: "01", t: "申込", d: "このページのフォームから。2営業日以内にご連絡します。" },
  { n: "02", t: "掲載", d: "エリア・カテゴリを確認し、提携先として掲載。初期費用は不要。" },
  { n: "03", t: "送客開始", d: "診断を終えた男性を、あなたのもとへ。成果が出たときだけ費用。" },
];

const FAQ = [
  { q: "費用はいつ発生しますか？", a: "掲載・初期・月額はすべて無料です。実際に来院や成約が生まれたときの成果報酬のみ。固定費リスクはありません。" },
  { q: "契約や解約の条件は？", a: "最低契約期間の縛りは設けていません。合わないと感じたら、いつでも掲載を停止できます。条件は書面で明示します。" },
  { q: "どんなユーザーが送客されますか？", a: "AI診断とロードマップを終え、目的が明確な男性です。意欲の低い層をむやみに流すことはしません。質を優先します。" },
  { q: "エリアの制限はありますか？", a: "エリア・カテゴリごとに提携数を絞っています。競合が飽和しないよう、掲載枠には限りがあります。" },
  { q: "掲載の条件は？", a: "男性を丁寧に扱える体制があること。過度な売り込みをしないこと。詳細は申し込み後にご案内します。" },
];

export default function PartnerPage() {
  return (
    <div className="bg-[#f6f8f4] text-[#1f2a1d]" style={{ fontFeatureSettings: '"palt" 1' }}>
      {/* ── 専用のスリムなトップバー（消費者向けHeaderは /partner で非表示） ── */}
      <div className="sticky top-0 z-50 border-b border-[#1f2a1d]/8 bg-[#f6f8f4]/85 backdrop-blur">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 sm:px-8 py-3.5">
          <Link href="/" className="logo-type text-[17px] font-semibold tracking-[0.04em] text-[#16241A]">
            His Recoveries
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:block font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#6b7a66]">For Partners</span>
            <a href="#apply" className="rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[12.5px] font-semibold px-4 py-2 transition-colors">
              提携を申し込む
            </a>
          </div>
        </div>
      </div>

      {/* ============ ① Hero ============ */}
      {/* 目的: 30秒で「送りたい相手＝良質な男性患者」を一撃で理解させる。
          心理: 決裁者は"手間・コスト・リスク"を無意識に警戒 → 先に「無料・成果報酬のみ」で警戒を解く。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #eef3ea 0%, #f6f8f4 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2.1rem] sm:text-[3.4rem] leading-[1.28] font-[800] text-[#16241A]" style={HEAD}>
            改善を決めた男性を、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">あなたのもとへ。</span>
          </h1>
          <p className="mt-7 mx-auto max-w-[34rem] text-[15px] sm:text-[17px] leading-[1.95] text-[#4b5b47]">
            His Recoveries は、男性ウェルネスの入口。<br className="hidden sm:block" />
            診断とロードマップで目的が明確になった人だけを、最適な一院へ。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[15px] font-semibold px-9 py-4 transition-colors">
              提携を申し込む
            </a>
            <a href="#merits" className="w-full sm:w-auto rounded-full border border-[#1f2a1d]/15 hover:border-[#3d5638]/50 text-[#1f2a1d] text-[15px] font-semibold px-9 py-4 transition-colors">
              掲載条件を見る
            </a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] tracking-[0.14em] text-[#6b7a66]">
            掲載無料　・　初期費用無料　・　月額無料　・　成果報酬のみ
          </p>
        </div>
      </section>

      {/* ============ ② 問題提起 ============ */}
      {/* 目的: 「あなたの潜在患者は、たどり着けていないだけ」と気づかせる。
          心理: 自院の集客課題を、HRが言語化してくれる安心感。責めない。 */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[820px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <Eyebrow>The Problem</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
            男性は、何から<br className="sm:hidden" />始めればいいか<br className="hidden sm:block" />
            分からない。
          </h2>
          <p className="mt-7 mx-auto max-w-[30rem] text-[15px] sm:text-[16px] leading-[2] text-[#4b5b47]">
            だから、調べて終わる。来院しない。<br />
            需要はあるのに、あなたの一歩手前でつまずいている。
          </p>
        </div>
      </section>

      {/* ============ ③ 仕組み（図中心） ============ */}
      {/* 目的: HRが"迷い→来院"の変換装置だと図で理解させる。
          心理: 送客の質が担保される仕組みを、言葉でなく構造で信頼させる。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              迷いを、来院に変える。
            </h2>
            <p className="mt-6 mx-auto max-w-[30rem] text-[15px] leading-[1.95] text-[#4b5b47]">
              私たちは施設を持ちません。需要を束ね、改善の順路を設計し、最適な提携先へおつなぎします。
            </p>
          </div>

          {/* フロー図: 男性 → HR(診断→ロードマップ) → 提携先 */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            {/* Node 1 */}
            <FlowNode
              tone="light"
              icon={<><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" /></>}
              title="変わりたい男性"
              sub="何から始めればいいか分からない"
            />
            <FlowArrow />
            {/* Node 2 — HR（中核） */}
            <div className="flex-1 rounded-[1.5rem] bg-[#16241A] text-[#EDF1E8] p-6 sm:p-7 flex flex-col justify-center">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#85AB8B]">His Recoveries</div>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.08] px-3.5 py-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[#85AB8B] text-[#16241A] text-[11px] font-bold shrink-0">1</span>
                  <span className="text-[13.5px] font-semibold">AI印象診断</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.08] px-3.5 py-2.5">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[#85AB8B] text-[#16241A] text-[11px] font-bold shrink-0">2</span>
                  <span className="text-[13.5px] font-semibold">改善ロードマップ</span>
                </div>
              </div>
            </div>
            <FlowArrow />
            {/* Node 3 */}
            <FlowNode
              tone="accent"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
              title="最適な提携先"
              sub="あなたのクリニック / サロン"
            />
          </div>

          {/* ブランドの等式 */}
          <div className="mt-14 flex items-center justify-center gap-3 sm:gap-5 text-center">
            {["Supply", "Intelligence", "Design"].map((w, i) => (
              <div key={w} className="flex items-center gap-3 sm:gap-5">
                <span className="text-[13px] sm:text-[15px] font-semibold text-[#3d5638] tracking-[0.02em]">{w}</span>
                {i < 2 && <span className="text-[#9aa79a]">×</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] text-[#6b7a66]">供給を束ね、知性で設計し、体験を整える。</p>
        </div>
      </section>

      {/* ============ ④ 提携メリット ============ */}
      {/* 目的: リスクゼロを4枚で。決裁の最大障壁＝コストを先に消す。
          心理: 「試して損がない」→ 稟議を通しやすい。 */}
      <section id="merits" className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Why Partner</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              リスクは、ゼロ。
            </h2>
            <p className="mt-6 text-[15px] leading-[1.95] text-[#4b5b47]">
              固定費はいただきません。成果が出たときだけ、費用が生まれます。
            </p>
          </div>
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {MERITS.map((m) => (
              <div key={m.t} className="rounded-[1.4rem] border border-[#1f2a1d]/8 bg-white px-5 py-7 sm:py-8 text-center">
                <span aria-hidden className="mx-auto grid place-items-center w-12 h-12 rounded-full bg-[#eef3ea] mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {MERIT_ICONS[m.t]}
                  </svg>
                </span>
                <div className="text-[15px] sm:text-[16px] font-bold text-[#16241A]" style={HEAD}>{m.t}</div>
                <p className="mt-2 text-[11.5px] sm:text-[12.5px] text-[#6b7a66] leading-[1.7]">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑤ 紹介されるユーザー ============ */}
      {/* 目的: 送客の"質"を約束。量ではなく質で決裁者を動かす。
          心理: 冷やかしを掴まされる不安を、事前診断で払拭。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-[#16241A] text-[#EDF1E8]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow dark>The Patients</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#EDF1E8]" style={HEAD}>
              送るのは、<span className="text-[#9ec4a3]">決めた男性</span>だけ。
            </h2>
            <p className="mt-6 text-[15px] leading-[1.95] text-[#C9D2C4]">
              数で押しません。次の一歩を探している人を、丁寧に。
            </p>
          </div>
          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {PATIENTS.map((p, i) => (
              <div key={p.t} className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6 sm:p-7">
                <div className="font-mono text-[11px] text-[#85AB8B]">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-[16px] font-bold text-[#EDF1E8]" style={HEAD}>{p.t}</div>
                <p className="mt-2.5 text-[12.5px] text-[#C9D2C4] leading-[1.85]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑥ 導入フロー ============ */}
      {/* 目的: 始めるのは3手だけ、と軽さを伝える。
          心理: 導入の"面倒くささ"の予感を消す。 */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Getting Started</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              3ステップで、送客が始まる。
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[1.4rem] border border-[#1f2a1d]/8 bg-white p-6 sm:p-7">
                <div className="text-[2.2rem] font-[800] text-[#dbe4d6] leading-none" style={HEAD}>{s.n}</div>
                <div className="mt-4 text-[16px] font-bold text-[#16241A]" style={HEAD}>{s.t}</div>
                <p className="mt-2 text-[12.5px] text-[#6b7a66] leading-[1.85]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑦ FAQ ============ */}
      {/* 目的: 決裁前の最後の不安（費用・契約・質・エリア・条件）を潰す。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-white">
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-12">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.3rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              よくあるご質問
            </h2>
          </div>
          <div className="divide-y divide-[#1f2a1d]/8 border-y border-[#1f2a1d]/8">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-[14.5px] sm:text-[15px] font-bold text-[#1f2a1d] leading-[1.6]">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-[#3d5638] transition-transform group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-3 text-[13px] sm:text-[13.5px] text-[#4b5b47] leading-[1.95] pr-8">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑧ CTA / 申し込み ============ */}
      {/* 目的: 希少性（枠に限り）で決断を後押ししつつ、静かに締める。 */}
      <section id="apply" className="border-t border-[#1f2a1d]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
              掲載枠には、<br className="sm:hidden" />限りがあります。
            </h2>
            <p className="mt-6 text-[14px] sm:text-[15px] leading-[1.95] text-[#4b5b47]">
              エリア・カテゴリごとに提携先を厳選しています。<br className="hidden sm:block" />
              まずは、空き状況の確認から。
            </p>
          </div>
          <PartnerApplyForm />
          <p className="mt-8 text-[11px] text-[#8a9686] leading-[1.85] text-center">
            His Recoveries は医療機関ではなく、施術・診療を行いません。医療が関わる送客は、医療広告に関する法令・ガイドラインを遵守した形でのみ行います。
          </p>
        </div>
      </section>

      {/* ── フッター（簡易・B2B） ── */}
      <footer className="border-t border-[#1f2a1d]/8 bg-[#eef1ea]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="logo-type text-[17px] font-semibold text-[#16241A]">His Recoveries</Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#4b5b47]">
            <Link href="/" className="hover:text-[#16241A] transition-colors">ホーム</Link>
            <Link href="/areas" className="hover:text-[#16241A] transition-colors">記事</Link>
            <Link href="/privacy" className="hover:text-[#16241A] transition-colors">プライバシー・免責事項</Link>
          </nav>
          <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries</span>
        </div>
      </footer>
    </div>
  );
}

// ── フロー図のノード ──
function FlowNode({ tone, icon, title, sub }: { tone: "light" | "accent"; icon: React.ReactNode; title: string; sub: string }) {
  const accent = tone === "accent";
  return (
    <div className={`flex-1 rounded-[1.5rem] border p-6 sm:p-7 flex flex-col justify-center text-center ${accent ? "border-[#85AB8B]/40 bg-[#eef3ea]" : "border-[#1f2a1d]/10 bg-[#f6f8f4]"}`}>
      <span aria-hidden className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-white border border-[#1f2a1d]/8 mb-4">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <div className="text-[14.5px] font-bold text-[#1f2a1d]" style={HEAD}>{title}</div>
      <p className="mt-1.5 text-[11.5px] text-[#6b7a66] leading-[1.65]">{sub}</p>
    </div>
  );
}

// ── フロー図の矢印（横=→ / 縦=↓） ──
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-[#9ec4a3] shrink-0" aria-hidden>
      <svg className="hidden sm:block" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      <svg className="sm:hidden my-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </div>
  );
}
