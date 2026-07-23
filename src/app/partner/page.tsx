import type { Metadata } from "next";
import Link from "next/link";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import { site } from "@/lib/site";

// ============================================================
// /partner — 提携パートナー募集 LP（B2B / Supply確保）
// v3「応募がどんどん進む」版:
//  ・内部語を排除（接続→ご紹介 / 与信→事前ヒアリング / 二重否定→平易に）
//  ・否定から入らない（「ポータルではない」より先に「何をしてくれるか」）
//  ・NEWT式に、各セクション末に同じCTAを繰り返す（迷ったら押せる）
//  ・申込は「1分・入力2項目だけ必須」を明示して心理的ハードルを下げる
// デザイン: NEWT / Stripe / Linear / Notion（大きな余白・少ない文字・図解中心）
// ============================================================

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "提携パートナー募集 — 意欲の高い男性のお客さまを、あなたへ",
  description:
    "His Recoveries は男性ウェルネスの相談窓口。悩みを診断し、改善の順番を決めてから、あなたに合うプロ・施設へご紹介します。初期費用・掲載料は無料。申込は1分で完了。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "意欲の高い男性のお客さまを、あなたへ。初期費用・掲載料は無料、申込は1分。",
  },
};

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[11px] tracking-[0.28em] uppercase ${dark ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>{children}</div>
  );
}

// NEWT式・繰り返しCTA。全セクションで同じ文言＝迷ったらいつでも押せる。
function SectionCta({ dark = false }: { dark?: boolean }) {
  return (
    <div className="mt-12 text-center">
      <a
        href="#apply"
        className={`inline-flex items-center gap-2 rounded-full text-[15px] font-bold px-9 py-4 transition-colors ${
          dark
            ? "bg-[#EDF1E8] hover:bg-white text-[#16241A]"
            : "bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8]"
        }`}
      >
        無料で提携をはじめる <span aria-hidden>→</span>
      </a>
      <p className={`mt-3 text-[11.5px] ${dark ? "text-[#9FB0A0]" : "text-[#8a9686]"}`}>申込は1分・掲載は無料です</p>
    </div>
  );
}

const BEFORE_WORRIES = ["肌荒れが気になる", "薄毛が不安", "清潔感を上げたい"];

const PRO_CHIPS = ["メイク", "スタイリスト", "フォトグラファー", "美容師・バーバー", "トレーナー", "栄養士", "カウンセラー"];
const FACILITY_CHIPS = ["美容皮膚科", "AGA", "医療脱毛", "脱毛サロン", "眉毛サロン", "メンズエステ", "ジム"];

const BENEFITS = [
  { t: "意欲の高いお客さまが、届く。", d: "やることも順番も決まった状態でご紹介。あなたは、来てくれた人にベストを尽くすだけ。" },
  { t: "集客も事務も、こちらで。", d: "予約の段取りや事前のヒアリングは引き受けます。あなたは、本業に集中できます。" },
  { t: "費用は、かかりません。", d: "掲載・初期・月額はすべて無料。はじめても、損はありません。" },
  { t: "取材で、あなたの発信も。", d: "記事やインタビューで、あなたの強みやこだわりを世に届けます。" },
];

const STEPS = [
  { n: "01", t: "フォームから申込", d: "1分で完了。必須はお名前とメールだけです。" },
  { n: "02", t: "オンラインでお話", d: "2営業日以内にご連絡し、15分ほどお互いのことを確認します。" },
  { n: "03", t: "掲載・ご紹介スタート", d: "準備が整いしだい、お客さまのご紹介が始まります。" },
];

const FAQ = [
  {
    q: "費用はかかりますか？",
    a: "初期費用・掲載料は、どなたも無料です。そのあとは種類で異なります。プロの方は支払いなし（お仕事ごとに報酬を受け取る側です）。サロン・ジムはご成約が生まれたときだけの成果報酬。医療機関（自由診療）は月額定額のみで、ご紹介に連動した紹介料は一切受け取りません。",
  },
  {
    q: "どんなお客さまが紹介されますか？",
    a: "診断と改善プランを終えて、目的がはっきりした男性です。冷やかしや、意欲の低い方をむやみにお送りすることはありません。",
  },
  {
    q: "途中でやめられますか？",
    a: "はい。最低契約期間の縛りはありません。合わないと感じたら、いつでも掲載を止められます。",
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
            <a href="#apply" className="rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[12.5px] font-semibold px-4 py-2 transition-colors">無料で提携をはじめる</a>
          </div>
        </div>
      </div>

      {/* ============ ① Hero ============ */}
      {/* 目的: 30秒で「何をしてくれるか＝意欲の高い男性客が費用ゼロで届く」を平易に。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #eef3ea 0%, #f6f8f4 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2.1rem] sm:text-[3.4rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
            意欲の高い男性のお客さまを、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">あなたへ。</span>
          </h1>
          <p className="mt-7 mx-auto max-w-[33rem] text-[15px] sm:text-[16.5px] leading-[1.95] text-[#4b5b47]">
            His Recoveries は、男性ウェルネスの相談窓口。悩みを診断し、改善の順番を決めてから、その人に合うプロ・施設へご紹介します。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[15px] font-semibold px-9 py-4 transition-colors">
              無料で提携をはじめる
            </a>
            <a href="#how" className="w-full sm:w-auto rounded-full border border-[#1f2a1d]/15 hover:border-[#3d5638]/50 text-[#1f2a1d] text-[15px] font-semibold px-9 py-4 transition-colors">
              仕組みを見る
            </a>
          </div>
          <p className="mt-8 font-mono text-[11.5px] tracking-[0.14em] text-[#6b7a66]">
            掲載無料　・　初期費用無料　・　申込は1分
          </p>
          {/* 冷リンクで開いた相手への実在性の証明（メディアを見れば本気度が分かる） */}
          <Link href="/areas" className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d5638] underline underline-offset-4 decoration-[#85AB8B]/50 hover:opacity-70 transition-opacity">
            男性向けの専門記事を50本以上発信中 — メディアを見る <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ============ ② 問題 → あなたへの機会 ============ */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-[1.7rem] sm:text-[2.5rem] leading-[1.4] font-[800] text-[#1f2a1d]" style={HEAD}>
            男性は、何から始めればいいか<br className="hidden sm:block" />分からない。
          </h2>
          <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.95] text-[#4b5b47]">
            だから調べて終わり、お店に来ない。<br className="hidden sm:block" />
            その男性の迷いを私たちがほどいて、あなたにご紹介します。
          </p>
        </div>
      </section>

      {/* ============ ③ 仕組み（図中心） ============ */}
      <section id="how" className="border-t border-[#1f2a1d]/8 bg-white scroll-mt-16">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>How It Works — 仕組み</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              迷いをほどいてから、<br className="sm:hidden" /><span className="text-[#3d5638]">ご紹介する。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[32rem] text-[15px] leading-[1.95] text-[#4b5b47]">
              比較サイトのように候補を並べるのではなく、一人ひとりの「やる順番」を決めてから、必要なところへだけお送りします。
            </p>
          </div>

          {/* Before → HR → あなた の3ノード */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            {/* Before */}
            <div className="flex-1 rounded-[1.5rem] border border-[#1f2a1d]/10 bg-[#f6f8f4] p-6 sm:p-7 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#9aa79a]">Before</div>
              <div className="mt-3 text-[14px] font-bold text-[#1f2a1d]" style={HEAD}>迷っている男性</div>
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
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[11px] font-semibold text-[#C9D2C4]">改善プラン</span>
              </div>
            </div>
            <FlowArrow />
            {/* あなた */}
            <div className="flex-1 rounded-[1.5rem] border border-[#85AB8B]/40 bg-[#eef3ea] p-6 sm:p-7 flex flex-col justify-center text-center">
              <span aria-hidden className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-white border border-[#1f2a1d]/8 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></svg>
              </span>
              <div className="text-[14.5px] font-bold text-[#1f2a1d]" style={HEAD}>あなたへ、ご紹介</div>
              <p className="mt-1.5 text-[11.5px] text-[#4b5b47] leading-[1.65]">順番が来た人を、<br />ベストなタイミングで。</p>
            </div>
          </div>

          <p className="mt-12 text-center text-[13.5px] sm:text-[15px] text-[#3d5638] font-semibold leading-[1.9]">
            だから届くのは、<span className="text-[#16241A]">やることが決まった、意欲の高い男性</span>だけ。
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ④ 募集パートナー（2系統） ============ */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Who We Work With — 募集パートナー</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              男を「整える」プロ、すべてと。
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-4">
            <TrackCard
              tag="Team — 一緒に体験をつくる"
              title="体験を届けるプロ"
              desc="集客・予約・段取りは、すべてこちらで。あなたは腕をふるうだけ。お仕事ごとに報酬をお支払いし、取材記事であなたの発信も後押しします。"
              chips={PRO_CHIPS}
              money="お仕事ごとに報酬をお支払い"
              icon={<><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.2" r="2.2" /><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M15 19.5c0-2 1.1-3.5 2.9-3.7" /></>}
            />
            <TrackCard
              tag="Clinic & Studio — お客さまをご紹介"
              title="提携する施設"
              desc="目的のはっきりした男性を、ベストなタイミングでご紹介。掲載は無料です。サロン・ジムは成果報酬のみ、医療機関は法令に配慮した月額定額で。"
              chips={FACILITY_CHIPS}
              money="成果報酬のみ（医療機関は月額定額）"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
            />
          </div>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑤ 組むと何がいいか ============ */}
      <section className="border-t border-[#1f2a1d]/8 bg-[#16241A] text-[#EDF1E8]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow dark>Why Join — 組むと、何がいいか</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#EDF1E8]" style={HEAD}>
              あなたは、<span className="text-[#9ec4a3]">本業だけでいい。</span>
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

          <SectionCta dark />
        </div>
      </section>

      {/* ============ ⑥ 費用（種別ごとに独立カード。自分の欄だけで完結） ============ */}
      {/* 法令配慮: 医療は成果連動なし・自由診療限定を明示。全種別共通で無料なのは
          初期費用と掲載料のみ（「月額無料」の一律表記は医療の定額と矛盾するため使わない）。 */}
      <section className="border-t border-[#1f2a1d]/8 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Pricing — 費用について</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              初期費用・掲載料は、<span className="text-[#3d5638]">どなたも無料。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[30rem] text-[15px] leading-[1.95] text-[#4b5b47]">
              そのあとの費用は、パートナーの種類で異なります。あなたの欄だけ、ご覧ください。
            </p>
          </div>

          {/* 種別ごとの料金カード（お金の向きを明示） */}
          <div className="mt-14 grid md:grid-cols-3 gap-4 max-w-[960px] mx-auto">
            {[
              {
                who: "体験を届けるプロ",
                flow: "受け取る",
                big: "支払いは、ありません。",
                lines: ["むしろ受け取る側です。", "お仕事ごとに、報酬をお支払いします。"],
              },
              {
                who: "サロン・ジムなどの施設",
                flow: "成果のときだけ支払う",
                big: "月額0円。成果報酬だけ。",
                lines: ["ご成約が生まれたときだけ、事前に合意した料率でお支払い。", "お客さまが来なければ、費用はかかりません。"],
              },
              {
                who: "医療機関（自由診療）",
                flow: "定額のみ支払う",
                big: "月額定額だけ。",
                lines: ["患者さまのご紹介に連動した成果報酬・紹介料は、一切受け取りません（医療法・医療広告ガイドラインに配慮）。", "対象は自由診療の医療機関です。"],
              },
            ].map((c) => (
              <div key={c.who} className="rounded-[1.5rem] border border-[#1f2a1d]/8 bg-[#f6f8f4] p-6 sm:p-7 flex flex-col">
                <div className="text-[13.5px] font-bold text-[#1f2a1d]">{c.who}</div>
                <span className="mt-2 self-start rounded-full bg-[#16241A] text-[#EDF1E8] px-3 py-1 text-[10.5px] font-bold tracking-[0.04em]">あなたは {c.flow}</span>
                <div className="mt-4 text-[1.15rem] font-[800] text-[#16241A] leading-[1.4]" style={HEAD}>{c.big}</div>
                <div className="mt-3 space-y-1.5">
                  {c.lines.map((l) => (
                    <p key={l} className="text-[12px] text-[#4b5b47] leading-[1.8]">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[12px] text-[#6b7a66] leading-[1.8]">
            共通：初期費用・掲載料は無料。最低契約期間の縛りはなく、いつでも停止できます。条件は契約前に書面で明示します。
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑦ 導入フロー ============ */}
      <section className="border-t border-[#1f2a1d]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Getting Started — はじめかた</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1f2a1d]" style={HEAD}>
              3ステップで、始まる。
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

      {/* ============ ⑧ 申込（FAQ内包） ============ */}
      <section id="apply" className="border-t border-[#1f2a1d]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply — 申込</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#16241A]" style={HEAD}>
              まずは、<br className="sm:hidden" />話を聞かせてください。
            </h2>
            <p className="mt-6 text-[14px] sm:text-[15px] leading-[1.95] text-[#4b5b47]">
              入力は1分、必須はお名前とメールだけ。合うかどうかの確認からで大丈夫です。
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
            His Recoveries は医療機関ではなく、施術・診療を行いません。医療機関のご紹介は、医療広告に関する法令・ガイドラインを遵守した形でのみ行います。
          </p>
        </div>
      </section>

      {/* ── フッター（B2B: 運営会社を明示。冷リンクの信頼性はここで決まる） ── */}
      <footer className="border-t border-[#1f2a1d]/8 bg-[#eef1ea]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-10 pb-4">
          <div className="rounded-[1.4rem] bg-white/70 border border-[#1f2a1d]/8 p-6 sm:p-7">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#85AB8B] mb-4">Company — 運営会社</div>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
              {[
                ["社名", `${site.company.name}（${site.company.nameEn}）`],
                ["事業内容", "男性ウェルネスサービス「His Recoveries」の企画・運営"],
                ["所在地", `${site.company.postalCode} ${site.company.address}`],
                ["お問い合わせ", site.company.email],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="shrink-0 w-[5.5em] text-[#9aa79a] font-semibold">{k}</dt>
                  <dd className="text-[#3a423a] leading-[1.7]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pb-10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
