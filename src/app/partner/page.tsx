import type { Metadata } from "next";
import Link from "next/link";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import { site } from "@/lib/site";

// ============================================================
// /partner — 提携パートナー募集 LP（B2B / Supply確保）
// ポジショニング（最重要）:
//   His Recoveries は「クリニック紹介サイト / ポータル / 比較 / アフィリエイト」ではない。
//   男性が"良くなりたい"と思ったとき最初に訪れる場所。悩みを診断し、
//   「あなたの場合は、この順番で整えると良い」と"順路"を設計してから、
//   必要なサービス（プロ・施設）へ接続する。＝ 紹介ではなく「設計」。
// 対象: HRが束ねる"あらゆるパートナー" = ①体験を届けるプロ ②提携する施設。
// デザイン: NEWT / Stripe / Linear / Notion（大きな余白・少ない文字・図解中心）。
// 料金は二段: プロ=業務委託報酬 / 非医療施設=成果報酬 / 医療施設=成果連動でない定額。
// ============================================================

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "提携パートナー募集 — 男性が最初に訪れる場所へ",
  description:
    "His Recoveries は比較サイトでも紹介ポータルでもありません。男性の悩みを診断し、整える順番を設計してから、最適なプロ・提携先へ接続します。集客も段取りもHRが担い、固定費リスクはありません。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "「紹介」ではなく「設計」。順番を設計してから、あなたへ接続する。",
  },
};

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[11px] tracking-[0.28em] uppercase ${dark ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>{children}</div>
  );
}

const BEFORE_WORRIES = ["肌荒れが気になる", "薄毛が不安", "清潔感を上げたい"];

// ① 体験を届けるプロ（チーム参画） ② 提携する施設（接続先）
const PRO_CHIPS = ["メイク", "スタイリスト", "フォトグラファー", "美容師・バーバー", "トレーナー", "栄養士", "カウンセラー"];
const FACILITY_CHIPS = ["美容皮膚科", "AGA", "医療脱毛", "脱毛サロン", "眉毛サロン", "メンズエステ", "ジム"];

const BENEFITS = [
  { t: "意欲の高い男性が、届く。", d: "やることも順番も決まった状態で。あなたは、来てくれた人にベストを尽くすだけ。" },
  { t: "集客も事務も、こちらで。", d: "予約・与信・段取りは引き受けます。あなたは、腕と施術に集中できます。" },
  { t: "固定費リスクは、ありません。", d: "掲載・初期・月額は無料。プロは業務委託の報酬、施設は成果が出てからだけ。" },
  { t: "取材で、発信も後押し。", d: "記事やインタビューで、あなたの強みを世に。中立設計だから、信頼も守られます。" },
];

const STEPS = [
  { n: "01", t: "申込", d: "このページから。2営業日以内にご連絡します。" },
  { n: "02", t: "参画・掲載", d: "プロはチームへ、施設は接続先として。初期費用は不要。" },
  { n: "03", t: "接続開始", d: "順番の決まった男性を、最適なタイミングであなたへ。" },
];

const FAQ = [
  {
    q: "費用や報酬はどうなりますか？",
    a: "掲載・初期・月額はすべて無料です。プロの方には業務委託としてお仕事の報酬をお支払い。提携施設は、非医療（脱毛・眉毛・ジム等）が成果報酬のみ、医療（クリニック）は法令に配慮し成果連動ではない定額でご案内します。固定費リスクはありません。",
  },
  {
    q: "どんな男性が接続されますか？",
    a: "AI診断とロードマップを終え、整える順番と目的が明確な男性です。冷やかしや、意欲の低い層をむやみに流すことはしません。質を優先します。",
  },
  {
    q: "エリアや募集枠に制限は？",
    a: "エリア・カテゴリごとに提携数を絞っています。競合が飽和しないよう、枠には限りがあります。まずは空き状況をご確認ください。",
  },
];

export default function PartnerPage() {
  return (
    <div className="bg-[#f6f8f4] text-[#1f2a1d]" style={{ fontFeatureSettings: '"palt" 1' }}>
      {/* ── 専用スリムトップバー ── */}
      <div className="sticky top-0 z-50 border-b border-[#1f2a1d]/8 bg-[#f6f8f4]/85 backdrop-blur">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 sm:px-8 py-3.5">
          <Link href="/" className="logo-type text-[17px] font-semibold tracking-[0.04em] text-[#16241A]">His Recoveries</Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:block font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#6b7a66]">For Partners</span>
            <a href="#apply" className="rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[12.5px] font-semibold px-4 py-2 transition-colors">提携を申し込む</a>
          </div>
        </div>
      </div>

      {/* ============ ① Hero ============ */}
      {/* 目的: 「ポータルではない＝最初に訪れる場所」を一撃で。プロにも施設にも刺さる入口に。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #eef3ea 0%, #f6f8f4 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2rem] sm:text-[3.3rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
            男性が「変わりたい」と思って、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">最初に訪れる場所へ。</span>
          </h1>
          <p className="mt-7 mx-auto max-w-[34rem] text-[15px] sm:text-[16.5px] leading-[1.95] text-[#4b5b47]">
            比較サイトでも、紹介ポータルでもありません。悩みを診断し、<br className="hidden sm:block" />
            <span className="font-semibold text-[#1f2a1d]">整える順番を設計してから</span>、最適なあなたへ接続します。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[15px] font-semibold px-9 py-4 transition-colors">提携を申し込む</a>
            <a href="#design" className="w-full sm:w-auto rounded-full border border-[#1f2a1d]/15 hover:border-[#3d5638]/50 text-[#1f2a1d] text-[15px] font-semibold px-9 py-4 transition-colors">仕組みを見る</a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] tracking-[0.14em] text-[#6b7a66]">
            集客はHRが　・　目的の明確な男性だけ　・　固定費リスクなし
          </p>
        </div>
      </section>

      {/* ============ ②「紹介」ではなく「設計」— Before → HR → 接続 ============ */}
      {/* 目的: ポータル/比較/アフィリとの決別を図で示す。届くのは"次が決まった男性"だと納得させる。 */}
      <section id="design" className="border-t border-[#1f2a1d]/8 bg-white scroll-mt-16">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Not a Portal — 紹介ではなく、設計</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              選択肢を、並べない。<br className="sm:hidden" />
              <span className="text-[#3d5638]">順番を、設計する。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[32rem] text-[15px] leading-[1.95] text-[#4b5b47]">
              ポータルや比較は、候補を並べるだけ。私たちは一人ひとりに「この順で整えると良い」を描いてから、必要なサービスへ接続します。
            </p>
          </div>

          {/* Before → HR → 接続 の3ノード */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            {/* Before */}
            <div className="flex-1 rounded-[1.5rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] p-6 sm:p-7 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#9aa79a]">Before</div>
              <div className="mt-3 text-[14px] font-bold text-[#1f2a1d]" style={HEAD}>バラバラの悩み</div>
              <div className="mt-3 space-y-1.5">
                {BEFORE_WORRIES.map((w) => (
                  <div key={w} className="rounded-lg bg-white border border-[#1f2a1d]/8 px-3 py-1.5 text-[12px] text-[#4b5b47]">「{w}」</div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[#9aa79a] leading-[1.6]">何から始めればいいか、分からない。</p>
            </div>
            <FlowArrow />
            {/* His Recoveries */}
            <div className="flex-1 rounded-[1.5rem] bg-[#16241A] text-[#EDF1E8] p-6 sm:p-7 flex flex-col justify-center">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#85AB8B]">His Recoveries</div>
              <div className="mt-3 text-[15px] font-bold leading-[1.5]" style={HEAD}>
                「あなたの場合は、<br />この順番で整えると良い」
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[11px] font-semibold text-[#C9D2C4]">AI印象診断</span>
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[11px] font-semibold text-[#C9D2C4]">改善ロードマップ</span>
              </div>
            </div>
            <FlowArrow />
            {/* 接続 = あなた */}
            <div className="flex-1 rounded-[1.5rem] border border-[#85AB8B]/40 bg-[#eef3ea] p-6 sm:p-7 flex flex-col justify-center text-center">
              <span aria-hidden className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-white border border-[#1f2a1d]/8 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h6M13 12h6M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>
              </span>
              <div className="text-[14.5px] font-bold text-[#1f2a1d]" style={HEAD}>必要なサービスへ接続</div>
              <p className="mt-1.5 text-[11.5px] text-[#4b5b47] leading-[1.65]">正しい順で、正しいタイミングで。<br />＝ あなた（プロ・施設）</p>
            </div>
          </div>

          <p className="mt-12 text-center text-[13.5px] sm:text-[15px] text-[#3d5638] font-semibold leading-[1.9]">
            だからあなたに届くのは、<span className="text-[#16241A]">やることが決まった、意欲の高い男性</span>。
          </p>
        </div>
      </section>

      {/* ============ ③ 募集パートナー（2系統） ============ */}
      {/* 目的: HRが束ねる"あらゆるパートナー"それぞれに「自分ごと」を作る。 */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Who We Work With — 募集パートナー</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              男を「整える」プロ、すべてと。
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-4">
            {/* A 体験を届けるプロ */}
            <TrackCard
              tag="Team — チーム参画"
              title="体験を届けるプロ"
              desc="集客・予約・与信・段取りは、すべてHRが。あなたは、腕だけ。単価は安定し、取材でブランディングも。お仕事として報酬をお支払いします。"
              chips={PRO_CHIPS}
              money="業務委託の報酬"
              icon={<><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.2" r="2.2" /><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M15 19.5c0-2 1.1-3.5 2.9-3.7" /></>}
            />
            {/* B 提携する施設 */}
            <TrackCard
              tag="Clinic & Studio — 接続先"
              title="提携する施設"
              desc="順番の決まった男性を、最適なタイミングで接続。掲載無料・固定費リスクなし。非医療は成果報酬、医療は法令に配慮した成果連動でない定額で。"
              chips={FACILITY_CHIPS}
              money="成果報酬 / 医療は定額"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
            />
          </div>
        </div>
      </section>

      {/* ============ ④ なぜHRと組むか ============ */}
      {/* 目的: プロ・施設どちらの決裁者にも効く共通の"組む理由"を4点で。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-[#16241A] text-[#EDF1E8]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow dark>Why Join — 組むと、何がいいか</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#EDF1E8]" style={HEAD}>
              あなたは、<span className="text-[#9ec4a3]">腕だけでいい。</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[1.95] text-[#C9D2C4]">
              面倒なことは、こちらで引き受けます。あなたの得意に、集中してください。
            </p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={b.t} className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6 sm:p-7">
                <div className="font-mono text-[11px] text-[#85AB8B]">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-[16px] font-bold text-[#EDF1E8] leading-[1.5]" style={HEAD}>{b.t}</div>
                <p className="mt-2.5 text-[12.5px] text-[#C9D2C4] leading-[1.9]">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑤ 導入フロー ============ */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Getting Started</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              3ステップで、接続が始まる。
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

      {/* ============ ⑥ 費用（NEWT型: 固定費ゼロを主役に） ============ */}
      {/* 目的: 決裁の最大障壁＝コスト不安を「はじめやすく・続けやすい」で先に溶かす。
          手数料の話は控えめに、"動くのは成果が出てから"を静かに伝える。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Pricing — 費用について</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              はじめる費用は、<span className="text-[#3d5638]">かかりません。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[30rem] text-[15px] leading-[1.95] text-[#4b5b47]">
              初期費用・月額・掲載料はいただきません。動くのは、成果が出てから。だから、はじめやすく、続けやすい。
            </p>
          </div>

          {/* 3つの ¥0 タイル */}
          <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-4 max-w-[680px] mx-auto">
            {["初期費用", "月額", "掲載料"].map((k) => (
              <div key={k} className="rounded-[1.4rem] border border-[#1f2a1d]/8 bg-[#f6f8f4] px-3 py-7 sm:py-9 text-center">
                <div className="text-[2.4rem] sm:text-[3.2rem] font-[800] text-[#16241A] leading-none" style={HEAD}>¥0</div>
                <div className="mt-3 text-[12px] sm:text-[13px] font-semibold text-[#6b7a66]">{k}</div>
              </div>
            ))}
          </div>

          {/* その先＝成果が出てからの費用（3ケースを静かに） */}
          <div className="mt-8 max-w-[680px] mx-auto rounded-[1.4rem] border border-[#1f2a1d]/8 overflow-hidden">
            <div className="px-5 sm:px-7 py-3.5 bg-[#16241A] text-[#EDF1E8] font-mono text-[10.5px] tracking-[0.2em] uppercase">
              成果が出てから、はじめて
            </div>
            {[
              { k: "体験を届けるプロ", v: "報酬を受け取る（業務委託）", note: "お仕事としてお支払いします" },
              { k: "提携施設・非医療", v: "成果報酬のみ", note: "来院・成約が生まれたときだけ" },
              { k: "提携施設・医療", v: "成果連動ではない定額", note: "医療広告の法令に配慮した設計" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 bg-white border-t border-[#1f2a1d]/8 first:border-t-0">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-bold text-[#1f2a1d]">{row.k}</div>
                  <div className="text-[11px] text-[#9aa79a] leading-[1.5] mt-0.5">{row.note}</div>
                </div>
                <div className="shrink-0 text-[12.5px] sm:text-[13.5px] font-bold text-[#3d5638] text-right">{row.v}</div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[13.5px] sm:text-[15px] text-[#16241A] font-bold" style={HEAD}>
            リスクは、成果が出るまでゼロ。
          </p>
        </div>
      </section>

      {/* ============ ⑦ 申込（FAQ内包） ============ */}
      <section id="apply" className="border-t border-[#1f2a1d]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
              まずは、<br className="sm:hidden" />話を聞かせてください。
            </h2>
            <p className="mt-6 text-[14px] sm:text-[15px] leading-[1.95] text-[#4b5b47]">
              エリア・カテゴリを絞っているので、あなたが埋もれることはありません。合うかどうかも含めて、気軽にご相談ください。
            </p>
          </div>

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
            His Recoveries は医療機関ではなく、施術・診療を行いません。医療が関わる接続は、医療広告に関する法令・ガイドラインを遵守した形でのみ行います。
          </p>
        </div>
      </section>

      {/* ── フッター ── */}
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

// ── 募集パートナーの2系統カード ──
function TrackCard({ tag, title, desc, chips, money, icon }: { tag: string; title: string; desc: string; chips: string[]; money: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-[#1f2a1d]/8 bg-white p-7 sm:p-8 flex flex-col">
      <span aria-hidden className="grid place-items-center w-12 h-12 rounded-full bg-[#eef3ea] mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B]">{tag}</div>
      <div className="mt-2 text-[1.3rem] font-[800] text-[#16241A]" style={HEAD}>{title}</div>
      <p className="mt-3 text-[13px] text-[#4b5b47] leading-[1.9]">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="rounded-full bg-[#f6f8f4] border border-[#1f2a1d]/8 px-3 py-1.5 text-[12px] font-semibold text-[#3d5638]">{c}</span>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-[#1f2a1d]/8 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#9aa79a]">Fee</span>
        <span className="text-[12.5px] font-bold text-[#16241A]">{money}</span>
      </div>
    </div>
  );
}

// ── フロー矢印（横=→ / 縦=↓） ──
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-[#9ec4a3] shrink-0" aria-hidden>
      <svg className="hidden sm:block" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      <svg className="sm:hidden my-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </div>
  );
}
