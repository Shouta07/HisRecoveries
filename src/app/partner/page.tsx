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
    "His Recoveries は男性ウェルネスの相談窓口。悩みを診断し、改善の順番を決めてから、あなたに合うプロ・施設を候補としてお伝えします。掲載料・成果報酬・紹介料は一切いただきません。申込は1分で完了。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "意欲の高い男性のお客さまを、あなたへ。費用は一切かかりません。申込は1分。",
  },
};

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[12px] tracking-[0.28em] uppercase ${dark ? "text-[#C28863]" : "text-[#97613F]"}`}>{children}</div>
  );
}

// 文節を inline-block で包み、スマホでも改行を自然な区切り（、。）で起こすためのヘルパー。
// （global の word-break:keep-all + overflow-wrap:anywhere による中途半端な改行を防ぐ）
function W({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-block ${className}`}>{children}</span>;
}

// NEWT式・繰り返しCTA。全セクションで同じ文言＝迷ったらいつでも押せる。
function SectionCta({ dark = false }: { dark?: boolean }) {
  return (
    <div className="mt-12 text-center">
      <a
        href="#apply"
        className={`inline-flex items-center gap-2 rounded-full text-[15px] font-bold px-9 py-4 transition-colors ${
          dark
            ? "bg-[#F3F0EA] hover:bg-white text-[#1E2A38]"
            : "bg-[#1E2A38] hover:bg-[#22331f] text-[#F3F0EA]"
        }`}
      >
        無料で提携をはじめる <span aria-hidden>→</span>
      </a>
      <p className={`mt-3 text-[12.5px] ${dark ? "text-[#8E979E]" : "text-[#8a9686]"}`}>申込は1分・費用は一切かかりません</p>
    </div>
  );
}

const BEFORE_WORRIES = ["肌荒れが気になる", "薄毛が不安", "清潔感を上げたい"];

const PRO_CHIPS = ["メイク", "スタイリスト", "フォトグラファー", "美容師・バーバー", "トレーナー", "栄養士", "カウンセラー"];
const FACILITY_CHIPS = ["美容皮膚科", "AGA", "医療脱毛", "脱毛サロン", "眉毛サロン", "メンズエステ", "ジム"];

const BENEFITS = [
  { t: "意欲の高いお客さまと、出会える。", d: "やることも順番も決まった状態でお名前を候補としてお伝えします。選ぶのはお客さまご本人です。" },
  { t: "説明の手間が、減る。", d: "目的と優先順位を事前に整理してお渡しします。ゼロから説明する時間が減ります。" },
  { t: "費用は、一切かかりません。", d: "掲載料も月額も成果報酬もゼロ。紹介料を受け取らないから、中立でいられます。" },
  { t: "取材を、お願いすることも。", d: "現場の知見を記事にさせていただく場合があります（ご希望と合意のうえで）。" },
];

const STEPS = [
  { n: "01", t: "フォームから申込", d: "1分で完了。必須はお名前とメールだけです。" },
  { n: "02", t: "オンラインでお話", d: "2営業日以内にご連絡し、15分ほどお互いのことを確認します。" },
  { n: "03", t: "候補としての掲載を開始", d: "準備が整いしだい、お客さまへお渡しする候補にお名前が入ります。" },
];

const FAQ = [
  {
    q: "費用はかかりますか？",
    a: "一切かかりません。掲載料・初期費用・月額・成果報酬・紹介料、すべて0円です。プロの方はむしろ受け取る側で、お仕事ごとに報酬をお支払いします。パートナーからお金を受け取ると、お客さまに中立な助言ができなくなるため、この形にしています。運営はお客さまからいただく費用でまかなっています。",
  },
  {
    q: "どんなお客さまが紹介されますか？",
    a: "診断と改善プランを終えて、目的と優先順位がはっきりした男性です。こちらから「ここへ行ってください」と指定はしません。候補としてお伝えし、選ぶのはお客さまご本人です。",
  },
  {
    q: "途中でやめられますか？",
    a: "はい。最低契約期間の縛りはありません。合わないと感じたら、いつでも掲載を止められます。",
  },
];

export default function PartnerPage() {
  return (
    <div className="bg-[#FAF8F4] text-[#1F1E1B]" style={{ fontFeatureSettings: '"palt" 1' }}>
      {/* ── 専用スリムトップバー ── */}
      <div className="sticky top-0 z-50 border-b border-[#1F1E1B]/8 bg-[#FAF8F4]/85 backdrop-blur">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 sm:px-8 py-3.5">
          <Link href="/" className="logo-type text-[17px] font-semibold tracking-[0.04em] text-[#1E2A38]">His Recoveries</Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:block font-mono text-[11px] tracking-[0.24em] uppercase text-[#5E6A70]">For Partners</span>
            <a href="#apply" className="rounded-full bg-[#1E2A38] hover:bg-[#22331f] text-[#F3F0EA] text-[14px] font-semibold px-4 py-2 transition-colors">無料で提携をはじめる</a>
          </div>
        </div>
      </div>

      {/* ============ ① Hero ============ */}
      {/* 目的: 30秒で「何をしてくれるか＝意欲の高い男性客が費用ゼロで届く」を平易に。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #EDE9E0 0%, #FAF8F4 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2.1rem] sm:text-[3.4rem] leading-[1.3] font-[800] text-[#1E2A38]" style={HEAD}>
            <W>意欲の高い</W><W>男性のお客さまを、</W><W className="text-[#97613F]">あなたへ。</W>
          </h1>
          <p className="mt-7 mx-auto max-w-[33rem] text-[15px] sm:text-[16.5px] leading-[1.95] text-[#45443E]">
            <W>His Recoveries は、</W><W>男性ウェルネスの相談窓口。</W>
            <W>悩みを診断し、</W><W>改善の順番を決めてから、</W>
            <W>その人に合うプロ・施設を</W><W>候補としてお伝えします。</W>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#1E2A38] hover:bg-[#22331f] text-[#F3F0EA] text-[15px] font-semibold px-9 py-4 transition-colors">
              無料で提携をはじめる
            </a>
            <a href="#how" className="w-full sm:w-auto rounded-full border border-[#1F1E1B]/15 hover:border-[#97613F]/50 text-[#1F1E1B] text-[15px] font-semibold px-9 py-4 transition-colors">
              仕組みを見る
            </a>
          </div>
          <p className="mt-8 font-mono text-[12.5px] tracking-[0.14em] text-[#5E6A70]">
            費用は一切なし　・　紹介料も受け取りません　・　申込は1分
          </p>
          {/* 冷リンクで開いた相手への実在性の証明（メディアを見れば本気度が分かる） */}
          <Link href="/areas" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#97613F] underline underline-offset-4 decoration-[#C28863]/50 hover:opacity-70 transition-opacity">
            男性向けの専門記事を50本以上発信中 — メディアを見る <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ============ ② 問題 → あなたへの機会 ============ */}
      <section className="border-t border-[#1F1E1B]/8">
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-[1.7rem] sm:text-[2.5rem] leading-[1.4] font-[800] text-[#1F1E1B]" style={HEAD}>
            <W>男性は、</W><W>何から始めればいいか</W><W>分からない。</W>
          </h2>
          <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.95] text-[#45443E]">
            <W>だから調べて終わり、</W><W>お店に来ない。</W>
            <W>その男性の迷いを私たちがほどいて、</W><W>あなたを候補としてお伝えします。</W>
          </p>
        </div>
      </section>

      {/* ============ ③ 仕組み（図中心） ============ */}
      <section id="how" className="border-t border-[#1F1E1B]/8 bg-white scroll-mt-16">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>How It Works — 仕組み</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1F1E1B]" style={HEAD}>
              迷いをほどいてから、<br className="sm:hidden" /><span className="text-[#97613F]">ご紹介する。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[32rem] text-[15px] leading-[1.95] text-[#45443E]">
              比較サイトのように候補を並べるのではなく、一人ひとりの「やる順番」を決めてから、必要なところへだけお送りします。
            </p>
          </div>

          {/* Before → HR → あなた の3ノード */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            {/* Before */}
            <div className="flex-1 rounded-[1.5rem] border border-[#1F1E1B]/10 bg-[#FAF8F4] p-6 sm:p-7 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#5E6A70]">Before</div>
              <div className="mt-3 text-[15px] font-bold text-[#1F1E1B]" style={HEAD}>迷っている男性</div>
              <div className="mt-3 space-y-1.5">
                {BEFORE_WORRIES.map((w) => (
                  <div key={w} className="rounded-lg bg-white border border-[#1F1E1B]/8 px-3 py-1.5 text-[13.5px] text-[#45443E]">「{w}」</div>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-[#5E6A70] leading-[1.6]">何から始めればいいか、分からない。</p>
            </div>
            <FlowArrow />
            {/* His Recoveries */}
            <div className="flex-1 rounded-[1.5rem] bg-[#1E2A38] text-[#F3F0EA] p-6 sm:p-7 flex flex-col justify-center">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#C28863]">His Recoveries</div>
              <div className="mt-3 text-[15px] font-bold leading-[1.5]" style={HEAD}>
                「あなたの場合は、<br />この順番で整えると良い」
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[12px] font-semibold text-[#C6CAD0]">AI印象診断</span>
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[12px] font-semibold text-[#C6CAD0]">改善プラン</span>
              </div>
            </div>
            <FlowArrow />
            {/* あなた */}
            <div className="flex-1 rounded-[1.5rem] border border-[#C28863]/40 bg-[#EDE9E0] p-6 sm:p-7 flex flex-col justify-center text-center">
              <span aria-hidden className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-white border border-[#1F1E1B]/8 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#97613F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></svg>
              </span>
              <div className="text-[15.5px] font-bold text-[#1F1E1B]" style={HEAD}>あなたへ、ご紹介</div>
              <p className="mt-1.5 text-[12.5px] text-[#45443E] leading-[1.65]">順番が来た人を、<br />ベストなタイミングで。</p>
            </div>
          </div>

          <p className="mt-12 text-center text-[15px] sm:text-[15px] text-[#97613F] font-semibold leading-[1.9]">
            <W>だから届くのは、</W><W className="text-[#1E2A38]">やることが決まった、</W><W className="text-[#1E2A38]">意欲の高い男性</W><W>だけ。</W>
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ④ 募集パートナー（2系統） ============ */}
      <section className="border-t border-[#1F1E1B]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Who We Work With — 募集パートナー</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1F1E1B]" style={HEAD}>
              男を「整える」プロ、すべてと。
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-2 gap-4">
            <TrackCard
              tag="Team — 一緒に体験をつくる"
              title="体験を届けるプロ"
              desc="目的と優先順位を整理してからお引き合わせします。あなたは腕をふるうだけ。お仕事ごとに報酬をお支払いします。"
              chips={PRO_CHIPS}
              money="お仕事ごとに報酬をお支払い"
              icon={<><circle cx="9" cy="8" r="3" /><circle cx="16.5" cy="9.2" r="2.2" /><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M15 19.5c0-2 1.1-3.5 2.9-3.7" /></>}
            />
            <TrackCard
              tag="Clinic & Studio — 候補としてお伝えする"
              title="提携する施設"
              desc="目的のはっきりした男性に、候補としてお名前をお伝えします。選ぶのはお客さまご本人です。掲載料・成果報酬・紹介料は、一切いただきません。"
              chips={FACILITY_CHIPS}
              money="費用は一切かかりません"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
            />
          </div>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑤ 組むと何がいいか ============ */}
      <section className="border-t border-[#1F1E1B]/8 bg-[#1E2A38] text-[#F3F0EA]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow dark>Why Join — 組むと、何がいいか</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#F3F0EA]" style={HEAD}>
              あなたは、<span className="text-[#C28863]">本業だけでいい。</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[1.95] text-[#C6CAD0]">
              面倒なことは、こちらで引き受けます。あなたの得意に、集中してください。
            </p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={b.t} className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6 sm:p-7">
                <div className="font-mono text-[12px] text-[#C28863]">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-[16px] font-bold text-[#F3F0EA] leading-[1.5]" style={HEAD}>{b.t}</div>
                <p className="mt-2.5 text-[14px] text-[#C6CAD0] leading-[1.9]">{b.d}</p>
              </div>
            ))}
          </div>

          <SectionCta dark />
        </div>
      </section>

      {/* ============ ⑥ 費用（種別ごとに独立カード。自分の欄だけで完結） ============ */}
      {/* 法令配慮: 医療は成果連動なし・自由診療限定を明示。全種別共通で無料なのは
          初期費用と掲載料のみ（「月額無料」の一律表記は医療の定額と矛盾するため使わない）。 */}
      <section className="border-t border-[#1F1E1B]/8 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Pricing — 費用について</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1F1E1B]" style={HEAD}>
              費用は、<span className="text-[#97613F]">一切いただきません。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[34rem] text-[15px] leading-[1.95] text-[#45443E]">
              掲載料も、月額も、成果報酬も、紹介料もありません。
              お金を受け取ると、お客さまに「ここが合います」と中立に言えなくなるからです。
              私たちはお客さまからいただく費用だけで運営しています。
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
                flow: "支払いなし",
                big: "費用は、かかりません。",
                lines: ["掲載料・月額・成果報酬、すべて0円です。", "お客さまが来ても、こちらは何も受け取りません。"],
              },
              {
                who: "医療機関（自由診療）",
                flow: "支払いなし",
                big: "費用は、かかりません。",
                lines: ["掲載料・月額・紹介料、すべて0円です。", "患者さまのご紹介に連動した報酬は、一切受け取りません（医療法・医療広告ガイドラインに配慮）。"],
              },
            ].map((c) => (
              <div key={c.who} className="rounded-[1.5rem] border border-[#1F1E1B]/8 bg-[#FAF8F4] p-6 sm:p-7 flex flex-col">
                <div className="text-[15px] font-bold text-[#1F1E1B]">{c.who}</div>
                <span className="mt-2 self-start rounded-full bg-[#1E2A38] text-[#F3F0EA] px-3 py-1 text-[11px] font-bold tracking-[0.04em]">あなたは {c.flow}</span>
                <div className="mt-4 text-[1.15rem] font-[800] text-[#1E2A38] leading-[1.4]" style={HEAD}>{c.big}</div>
                <div className="mt-3 space-y-1.5">
                  {c.lines.map((l) => (
                    <p key={l} className="text-[13.5px] text-[#45443E] leading-[1.8]">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[13.5px] text-[#5E6A70] leading-[1.8]">
            共通：費用は一切かかりません。最低契約期間の縛りはなく、いつでも停止できます。条件は書面で明示します。
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑦ 導入フロー ============ */}
      <section className="border-t border-[#1F1E1B]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Getting Started — はじめかた</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1F1E1B]" style={HEAD}>
              3ステップで、始まる。
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[1.4rem] border border-[#1F1E1B]/8 bg-white p-6 sm:p-7">
                <div className="text-[2.2rem] font-[800] text-[#DAD6CD] leading-none" style={HEAD}>{s.n}</div>
                <div className="mt-4 text-[16px] font-bold text-[#1E2A38]" style={HEAD}>{s.t}</div>
                <p className="mt-2 text-[14px] text-[#5E6A70] leading-[1.85]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑧ 申込（FAQ内包） ============ */}
      <section id="apply" className="border-t border-[#1F1E1B]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply — 申込</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#1E2A38]" style={HEAD}>
              まずは、<br className="sm:hidden" />話を聞かせてください。
            </h2>
            <p className="mt-6 text-[15px] sm:text-[15px] leading-[1.95] text-[#45443E]">
              入力は1分、必須はお名前とメールだけ。合うかどうかの確認からで大丈夫です。
            </p>
          </div>

          {/* 最後の不安3点（FAQ） */}
          <div className="mb-10 divide-y divide-[#1F1E1B]/8 border-y border-[#1F1E1B]/8">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-[15px] font-bold text-[#1F1E1B] leading-[1.6]">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-[#97613F] transition-transform group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-2.5 text-[14px] text-[#45443E] leading-[1.9] pr-8">{f.a}</p>
              </details>
            ))}
          </div>

          <PartnerApplyForm />
          <p className="mt-8 text-[12px] text-[#8a9686] leading-[1.85] text-center">
            His Recoveries は医療機関ではなく、施術・診療を行いません。医療機関のご紹介は、医療広告に関する法令・ガイドラインを遵守した形でのみ行います。
          </p>
        </div>
      </section>

      {/* ── フッター（B2B: 運営会社を明示。冷リンクの信頼性はここで決まる） ── */}
      <footer className="border-t border-[#1F1E1B]/8 bg-[#EAE6DC]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-10 pb-4">
          <div className="rounded-[1.4rem] bg-white/70 border border-[#1F1E1B]/8 p-6 sm:p-7">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#C28863] mb-4">Company — 運営会社</div>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[14.5px]">
              {[
                ["社名", `${site.company.name}（${site.company.nameEn}）`],
                ["事業内容", "男性ウェルネスサービス「His Recoveries」の企画・運営"],
                ["所在地", `${site.company.postalCode} ${site.company.address}`],
                ["お問い合わせ", site.company.email],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="shrink-0 w-[5.5em] text-[#5E6A70] font-semibold">{k}</dt>
                  <dd className="text-[#45443E] leading-[1.7]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pb-10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="logo-type text-[17px] font-semibold text-[#1E2A38]">His Recoveries</Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[14.5px] text-[#45443E]">
            <Link href="/" className="hover:text-[#1E2A38] transition-colors">ホーム</Link>
            <Link href="/areas" className="hover:text-[#1E2A38] transition-colors">記事</Link>
            <Link href="/privacy" className="hover:text-[#1E2A38] transition-colors">プライバシー・免責事項</Link>
          </nav>
          <span className="text-[13.5px] text-[#5E6A70]">© 2026 His Recoveries</span>
        </div>
      </footer>
    </div>
  );
}

// ── 募集パートナーの2系統カード ──
function TrackCard({ tag, title, desc, chips, money, icon }: { tag: string; title: string; desc: string; chips: string[]; money: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-[#1F1E1B]/8 bg-white p-7 sm:p-8 flex flex-col">
      <span aria-hidden className="grid place-items-center w-12 h-12 rounded-full bg-[#EDE9E0] mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#97613F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C28863]">{tag}</div>
      <div className="mt-2 text-[1.3rem] font-[800] text-[#1E2A38]" style={HEAD}>{title}</div>
      <p className="mt-3 text-[14.5px] text-[#45443E] leading-[1.9]">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="rounded-full bg-[#FAF8F4] border border-[#1F1E1B]/8 px-3 py-1.5 text-[13.5px] font-semibold text-[#97613F]">{c}</span>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-[#1F1E1B]/8 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#5E6A70]">Fee</span>
        <span className="text-[14px] font-bold text-[#1E2A38]">{money}</span>
      </div>
    </div>
  );
}

// ── フロー矢印（横=→ / 縦=↓） ──
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-[#C28863] shrink-0" aria-hidden>
      <svg className="hidden sm:block" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      <svg className="sm:hidden my-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </div>
  );
}
