import type { Metadata } from "next";
import Link from "next/link";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import { site } from "@/lib/site";

// ============================================================
// /partner — 提携先募集 LP（B2B・決裁者向け）v2「そぎ落とし版」
// デザイン思想: Stripe / Linear / Notion / NEWT
//  ・余白を大きく、文字は少なく、図解中心、1スクロール1メッセージ
//  ・重複を削る: メリット/質は Hero と図に畳み、独立セクションにしない
// 構成: ①Hero ②問題(1行) ③仕組み図(+質) ④導入フロー ⑤申込(FAQ内包)
// 料金は二段: 非医療=成果報酬 / 医療=成果連動でない定額（中立・法令配慮）
// ============================================================

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "提携パートナー募集 — 改善を決めた男性を、あなたのもとへ",
  description:
    "His Recoveries は男性ウェルネスの入口。AI診断と改善ロードマップで目的が明確になった、意欲の高い男性を最適な提携先へ送客します。掲載無料・初期費用無料・月額無料、固定費リスクなし。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "改善を決めた男性を、あなたのもとへ。掲載無料・固定費リスクなし。",
  },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] tracking-[0.28em] uppercase text-[#3d5638]">{children}</div>
  );
}

const STEPS = [
  { n: "01", t: "申込", d: "このページから。2営業日以内にご連絡します。" },
  { n: "02", t: "掲載", d: "エリア・カテゴリを確認し、提携先として掲載。初期費用は不要。" },
  { n: "03", t: "送客開始", d: "診断を終えた男性を、あなたのもとへ。" },
];

// FAQ は費用・質・エリアの3点だけ。費用は業種で二段。
const FAQ = [
  {
    q: "費用はいつ発生しますか？",
    a: "掲載・初期・月額はすべて無料です。非医療（脱毛サロン・眉毛・ジム等）は成果報酬のみ。医療（クリニック）は法令に配慮し、成果連動ではない定額の掲載料でご案内します。いずれも固定費リスクはありません。",
  },
  {
    q: "どんなユーザーが送客されますか？",
    a: "AI診断とロードマップを終え、目的が明確な男性です。意欲の低い層をむやみに流すことはしません。質を優先します。",
  },
  {
    q: "エリアの制限はありますか？",
    a: "エリア・カテゴリごとに提携数を絞っています。競合が飽和しないよう、掲載枠には限りがあります。",
  },
];

export default function PartnerPage() {
  return (
    <div className="bg-[#f6f8f4] text-[#1f2a1d]" style={{ fontFeatureSettings: '"palt" 1' }}>
      {/* ── 専用スリムトップバー（消費者向けHeaderは /partner で非表示） ── */}
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
      {/* 目的: 30秒で「送られる相手＝良質な男性患者」を理解させ、コスト警戒を先に解く。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #eef3ea 0%, #f6f8f4 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2.1rem] sm:text-[3.4rem] leading-[1.28] font-[800] text-[#16241A]" style={HEAD}>
            改善を決めた男性を、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">あなたのもとへ。</span>
          </h1>
          <p className="mt-7 mx-auto max-w-[32rem] text-[15px] sm:text-[17px] leading-[1.95] text-[#4b5b47]">
            診断とロードマップで目的が明確になった男性だけを、最適な一院へ。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[15px] font-semibold px-9 py-4 transition-colors">
              提携を申し込む
            </a>
            <a href="#how" className="w-full sm:w-auto rounded-full border border-[#1f2a1d]/15 hover:border-[#3d5638]/50 text-[#1f2a1d] text-[15px] font-semibold px-9 py-4 transition-colors">
              仕組みを見る
            </a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] tracking-[0.14em] text-[#6b7a66]">
            掲載無料　・　初期費用無料　・　月額無料　・　固定費リスクなし
          </p>
        </div>
      </section>

      {/* ============ ② 問題提起（1行） ============ */}
      {/* 目的: 自院を責めず「たどり着けていないだけ」と代弁。 */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-[1.7rem] sm:text-[2.5rem] leading-[1.4] font-[800] text-[#1f2a1d]" style={HEAD}>
            男性は、何から始めればいいか<br className="hidden sm:block" />分からない。
          </h2>
          <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.95] text-[#4b5b47]">
            だから調べて終わり、来院しない。需要は、あなたの一歩手前にある。
          </p>
        </div>
      </section>

      {/* ============ ③ 仕組み（図中心）＋ 送客の質を1行で ============ */}
      {/* 目的: HRが"迷い→来院"の変換装置だと構造で信頼させ、質を約束。 */}
      <section id="how" className="border-t border-[#1f2a1d]/8 bg-white scroll-mt-16">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              迷いを、来院に変える。
            </h2>
          </div>

          {/* フロー図: 男性 → HR(診断→ロードマップ) → 提携先 */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            <FlowNode
              tone="light"
              icon={<><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" /></>}
              title="変わりたい男性"
              sub="何から始めればいいか分からない"
            />
            <FlowArrow />
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
            <FlowNode
              tone="accent"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
              title="最適な提携先"
              sub="あなたのクリニック / サロン"
            />
          </div>

          {/* 送客の質（旧⑤セクションを1行に凝縮） */}
          <p className="mt-12 text-center text-[13.5px] sm:text-[15px] text-[#3d5638] font-semibold leading-[1.9]">
            送るのは、<span className="text-[#16241A]">改善意欲が高く・AI診断済み・目的が明確</span>な男性だけ。
          </p>
        </div>
      </section>

      {/* ============ ④ 導入フロー ============ */}
      {/* 目的: 始めるのは3手だけ、と軽さを伝える。 */}
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

      {/* ============ ⑤ 申込（FAQ内包） ============ */}
      {/* 目的: 希少性で背中を押しつつ、最後の不安3点だけ潰して静かに締める。 */}
      <section id="apply" className="border-t border-[#1f2a1d]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
              掲載枠には、<br className="sm:hidden" />限りがあります。
            </h2>
            <p className="mt-6 text-[14px] sm:text-[15px] leading-[1.95] text-[#4b5b47]">
              エリア・カテゴリごとに提携先を厳選しています。まずは、空き状況の確認から。
            </p>
          </div>

          {/* 最後の不安3点（FAQ） */}
          <div className="mb-10 divide-y divide-[#1f2a1d]/8 border-y border-[#1f2a1d]/8">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-[14px] font-bold text-[#1f2a1d] leading-[1.6]">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-[#3d5638] transition-transform group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-2.5 text-[12.5px] text-[#4b5b47] leading-[1.9] pr-8">{f.a}</p>
              </details>
            ))}
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
