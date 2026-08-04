import type { Metadata } from "next";
import Link from "next/link";
import PartnerApplyForm from "@/components/PartnerApplyForm";
import { site, ogImage } from "@/lib/site";

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
    "His Recoveries は男性ウェルネスの相談窓口。悩みを診断し、改善の順番を決めてから、あなたに合うプロ・施設を候補としてお伝えします。掲載料・初期費用・月額は0円。申込は1分で完了。",
  alternates: { canonical: `${site.url}/partner` },
  openGraph: {
    type: "website",
    url: `${site.url}/partner`,
    title: "提携パートナー募集 — His Recoveries",
    description: "意欲の高い男性のお客さまを、あなたへ。掲載料・初期費用・月額は0円。申込は1分。",
    images: [ogImage],
  },
};

// ── お金の向きについて ──────────────────────────────
// もとは全種別「掲載料・月額・成果報酬すべて0円」だった。
// これだと提携先への送客が収益にならず、事業として続かない。
// 事業者（サロン・ジム等）からは、利用があったときだけ手数料をいただく形にする。
//
// ただし料率は分野ごとに一律にする。相手ごとに変えない。
// サイト全体で「掲載の順番を報酬額で決めない」と約束している以上、
// 相手によって料率が違うと、その約束は守る意志の問題になる。
// 一律なら、金額で順番を動かす動機がそもそも発生しない。
//
// 医療機関は従来どおり0円（医療法・医療広告ガイドライン）。
// こちらが仕事を発注するプロの方は、従来どおりお支払いする側。

function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[12px] tracking-[0.28em] uppercase ${dark ? "text-[#70B0B0]" : "text-[#2F6F79]"}`}>{children}</div>
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
            ? "bg-[#F1F3F3] hover:bg-white text-[#2E4A66]"
            : "bg-[#2E4A66] hover:bg-[#24405C] text-[#F1F3F3]"
        }`}
      >
        提携の相談をする <span aria-hidden>→</span>
      </a>
      <p className={`mt-3 text-[12.5px] ${dark ? "text-[#8FA6B4]" : "text-[#8FA6B4]"}`}>申込は1分・掲載料と月額は0円</p>
    </div>
  );
}

const BEFORE_WORRIES = ["肌荒れが気になる", "薄毛が不安", "清潔感を上げたい"];

const PRO_CHIPS = ["メイク", "スタイリスト", "フォトグラファー", "美容師・バーバー", "トレーナー", "栄養士", "カウンセラー"];
const FACILITY_CHIPS = ["美容皮膚科", "AGA", "医療脱毛", "脱毛サロン", "眉毛サロン", "メンズエステ", "ジム"];

const BENEFITS = [
  { t: "意欲の高いお客さまと、出会える。", d: "やることも順番も決まった状態でお名前を候補としてお伝えします。選ぶのはお客さまご本人です。" },
  { t: "説明の手間が、減る。", d: "目的と優先順位を事前に整理してお渡しします。ゼロから説明する時間が減ります。" },
  { t: "掲載料と月額は、0円。", d: "初期費用もありません。施設・サロンの方は、お客さまが実際にご利用になったときだけ手数料をいただきます。料率は分野ごとに一律で、相手によって変えません。" },
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
    a: "掲載料・初期費用・月額は、どなたも0円です。そのうえで、サロン・ジムなどの施設の方は、お客さまが実際にご利用になったときだけ手数料をいただきます。料率は分野ごとに一律で、相手によって変えません（金額で紹介の順番が動かないようにするためです）。メイク・スタイリスト等のプロの方は受け取る側で、お仕事ごとに報酬をお支払いします。医療機関からは、掲載料も紹介料も一切いただきません。",
  },
  {
    q: "申し込めば、必ず掲載されますか？",
    a: "いいえ。4つを確かめたうえで決めています。編集部が実際に話を聞いていること（対面でもオンラインでも構いません）、総額とやめ方が先に確認できること、「合わない人」を先方ご自身が言えること、手数料が掲載の可否と順番に影響しないこと。この条件と現在の状況は「広告と収益について」に公開しています。確かめられていない段階では、お客さまをお送りしません。",
  },
  {
    q: "どんなお客さまが紹介されますか？",
    a: "診断と改善プランを終えて、目的と優先順位がはっきりした男性です。こちらから「ここへ行ってください」と指定はしません。候補としてお伝えし、選ぶのはお客さまご本人です。なお現時点では、まだ1人もお送りしていません。メディアと診断は公開していますが、ご紹介はこれから始めます。",
  },
  {
    q: "途中でやめられますか？",
    a: "はい。最低契約期間の縛りはありません。合わないと感じたら、いつでも掲載を止められます。",
  },
];

export default function PartnerPage() {
  return (
    <div className="bg-[#FAFBFB] text-[#1B2024]" style={{ fontFeatureSettings: '"palt" 1' }}>
      {/* ── 専用スリムトップバー ── */}
      <div className="sticky top-0 z-50 border-b border-[#1B2024]/8 bg-[#FAFBFB]/85 backdrop-blur">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 sm:px-8 py-3.5">
          <Link href="/" className="logo-type text-[17px] font-bold tracking-[0.04em] text-[#2E4A66]">His Recoveries</Link>
          <div className="flex items-center gap-5">
            <span className="hidden sm:block font-mono text-[11px] tracking-[0.24em] uppercase text-[#5E6E76]">For Partners</span>
            <a href="#apply" className="rounded-full bg-[#2E4A66] hover:bg-[#24405C] text-[#F1F3F3] text-[14px] font-bold px-4 py-2 transition-colors">提携の相談をする</a>
          </div>
        </div>
      </div>

      {/* ============ ① Hero ============ */}
      {/* 目的: 30秒で「何をしてくれるか＝意欲の高い男性客が費用ゼロで届く」を平易に。 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, #E2EAEA 0%, #FAFBFB 60%)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 text-center">
          <Eyebrow>For Partners — 提携パートナー募集</Eyebrow>
          <h1 className="mt-6 text-[2.1rem] sm:text-[3.4rem] leading-[1.3] font-[800] text-[#2E4A66]" style={HEAD}>
            <W>意欲の高い</W><W>男性のお客さまを、</W><W className="text-[#2F6F79]">あなたへ。</W>
          </h1>
          <p className="mt-7 mx-auto max-w-[33rem] text-[15px] sm:text-[16.5px] leading-[1.95] text-[#414A50]">
            <W>His Recoveries は、</W><W>男性ウェルネスの相談窓口。</W>
            <W>悩みを診断し、</W><W>改善の順番を決めてから、</W>
            <W>その人に合うプロ・施設を</W><W>候補としてお伝えします。</W>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#apply" className="w-full sm:w-auto rounded-full bg-[#2E4A66] hover:bg-[#24405C] text-[#F1F3F3] text-[15px] font-bold px-9 py-4 transition-colors">
              提携の相談をする
            </a>
            <a href="#how" className="w-full sm:w-auto rounded-full border border-[#1B2024]/15 hover:border-[#2F6F79]/50 text-[#1B2024] text-[15px] font-bold px-9 py-4 transition-colors">
              仕組みを見る
            </a>
          </div>
          <p className="mt-8 font-mono text-[12.5px] tracking-[0.14em] text-[#5E6E76]">
            掲載料・初期費用・月額は0円　・　申込は1分
          </p>
          {/* 現在地を、いちばん上に出す。
              もとは料金の節（6画面ぶん下）にだけ書いてあり、
              そこまでの面はすでに動いている事業のように読めた。
              0件であることは、読む前に分かるほうがいい。 */}
          <p className="mx-auto mt-5 max-w-[30rem] rounded-[1rem] border border-[#1B2024]/10 bg-white/70 px-5 py-3.5 text-[13.5px] leading-[1.85] text-[#414A50]">
            <span className="font-bold text-[#1B2024]">いまの状態：提携先は0件、お送りしたお客さまも0人です。</span>
            <br />
            メディアは公開していますが、ご紹介の実績はこれからです。1件目としてお話しできる方を探しています。
          </p>
          {/* 冷リンクで開いた相手への実在性の証明（メディアを見れば本気度が分かる） */}
          <Link href="/#index" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#2F6F79] underline underline-offset-4 decoration-[#70B0B0]/50 hover:opacity-70 transition-opacity">
            男性向けの専門記事を50本以上発信中 — メディアを見る <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ============ ② 問題 → あなたへの機会 ============ */}
      <section className="border-t border-[#1B2024]/8">
        <div className="max-w-[760px] mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-[1.7rem] sm:text-[2.5rem] leading-[1.4] font-[800] text-[#1B2024]" style={HEAD}>
            <W>男性は、</W><W>何から始めればいいか</W><W>分からない。</W>
          </h2>
          <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.95] text-[#414A50]">
            <W>だから調べて終わり、</W><W>お店に来ない。</W>
            <W>その男性の迷いを私たちがほどいて、</W><W>あなたを候補としてお伝えします。</W>
          </p>
        </div>
      </section>

      {/* ============ ③ 仕組み（図中心） ============ */}
      <section id="how" className="border-t border-[#1B2024]/8 bg-white scroll-mt-16">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>How It Works — 仕組み</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1B2024]" style={HEAD}>
              迷いをほどいてから、<br className="sm:hidden" /><span className="text-[#2F6F79]">ご紹介する。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[32rem] text-[15px] leading-[1.95] text-[#414A50]">
              比較サイトのように候補を並べるのではなく、一人ひとりの「やる順番」を決めてから、必要なところへだけお送りします。
            </p>
          </div>

          {/* Before → HR → あなた の3ノード */}
          <div className="mt-14 flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-3">
            {/* Before */}
            <div className="flex-1 rounded-[1.5rem] border border-[#1B2024]/10 bg-[#FAFBFB] p-6 sm:p-7 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#5E6E76]">Before</div>
              <div className="mt-3 text-[15px] font-bold text-[#1B2024]" style={HEAD}>迷っている男性</div>
              <div className="mt-3 space-y-1.5">
                {BEFORE_WORRIES.map((w) => (
                  <div key={w} className="rounded-lg bg-white border border-[#1B2024]/8 px-3 py-1.5 text-[13.5px] text-[#414A50]">「{w}」</div>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-[#5E6E76] leading-[1.6]">何から始めればいいか、分からない。</p>
            </div>
            <FlowArrow />
            {/* His Recoveries */}
            <div className="flex-1 rounded-[1.5rem] bg-[#2E4A66] text-[#F1F3F3] p-6 sm:p-7 flex flex-col justify-center">
              <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#70B0B0]">His Recoveries</div>
              <div className="mt-3 text-[15px] font-bold leading-[1.5]" style={HEAD}>
                「あなたの場合は、<br />この順番で整えると良い」
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[12px] font-bold text-[#C3D3D6]">5問の診断</span>
                <span className="rounded-full bg-white/[0.1] px-2.5 py-1 text-[12px] font-bold text-[#C3D3D6]">改善プラン</span>
              </div>
            </div>
            <FlowArrow />
            {/* あなた */}
            <div className="flex-1 rounded-[1.5rem] border border-[#70B0B0]/40 bg-[#E2EAEA] p-6 sm:p-7 flex flex-col justify-center text-center">
              <span aria-hidden className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-white border border-[#1B2024]/8 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2F6F79" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></svg>
              </span>
              <div className="text-[15.5px] font-bold text-[#1B2024]" style={HEAD}>あなたへ、ご紹介</div>
              <p className="mt-1.5 text-[12.5px] text-[#414A50] leading-[1.65]">順番が来た人を、<br />ベストなタイミングで。</p>
            </div>
          </div>

          <p className="mt-12 text-center text-[15px] sm:text-[15px] text-[#2F6F79] font-bold leading-[1.9]">
            <W>だからお届けするのは、</W><W className="text-[#2E4A66]">やることが決まった、</W><W className="text-[#2E4A66]">意欲の高い男性</W><W>だけです。</W>
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ④ 募集パートナー（2系統） ============ */}
      <section className="border-t border-[#1B2024]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Who We Work With — 募集パートナー</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1B2024]" style={HEAD}>
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
              desc="目的のはっきりした男性に、候補としてお名前をお伝えします。選ぶのはお客さまご本人です。掲載料と月額は0円。実際にご利用があったときだけ、手数料をいただきます。"
              chips={FACILITY_CHIPS}
              money="掲載料0円／利用があったときだけ"
              icon={<><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /><path d="M4 20h16" /></>}
            />
          </div>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑤ 組むと何がいいか ============ */}
      <section className="border-t border-[#1B2024]/8 bg-[#2E4A66] text-[#F1F3F3]">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow dark>Why Join — 組むと、何がいいか</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#F1F3F3]" style={HEAD}>
              あなたは、<span className="text-[#70B0B0]">本業だけでいい。</span>
            </h2>
            <p className="mt-6 text-[15px] leading-[1.95] text-[#C3D3D6]">
              面倒なことは、こちらで引き受けます。あなたの得意に、集中してください。
            </p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={b.t} className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6 sm:p-7">
                <div className="font-mono text-[12px] text-[#70B0B0]">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-3 text-[16px] font-bold text-[#F1F3F3] leading-[1.5]" style={HEAD}>{b.t}</div>
                <p className="mt-2.5 text-[14px] text-[#C3D3D6] leading-[1.9]">{b.d}</p>
              </div>
            ))}
          </div>

          <SectionCta dark />
        </div>
      </section>

      {/* ============ ⑥ 費用（種別ごとに独立カード。自分の欄だけで完結） ============ */}
      {/* 法令配慮: 医療は成果連動なし・自由診療限定を明示。全種別共通で無料なのは
          初期費用と掲載料のみ（「月額無料」の一律表記は医療の定額と矛盾するため使わない）。 */}
      <section className="border-t border-[#1B2024]/8 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Pricing — 費用について</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1B2024]" style={HEAD}>
              掲載料と月額は、<span className="text-[#2F6F79]">0円です。</span>
            </h2>
            <p className="mt-6 mx-auto max-w-[34rem] text-[15px] leading-[1.95] text-[#414A50]">
              初期費用もありません。施設・サロンの方だけ、お客さまが実際にご利用になったときに手数料をいただきます。
              料率は分野ごとに一律で、相手によって変えません。
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
                flow: "利用があったときだけ",
                big: "掲載料と月額は、0円。",
                lines: [
                  "初期費用もありません。",
                  "お客さまが実際にご利用になったときだけ、手数料をいただきます。",
                  "料率は分野ごとに一律です。金額で紹介の順番は変わりません。",
                ],
              },
              {
                who: "医療機関（自由診療）",
                flow: "ご紹介では0円",
                big: "ご紹介の対価は、いただきません。",
                lines: [
                  "掲載料・月額・紹介料、すべて0円です。",
                  "患者さまのご紹介に連動した報酬は、一切受け取りません（医療法・医療広告ガイドラインに配慮）。",
                  "自院の発信を整える制作のご依頼は、別のお取引として承ります。",
                ],
              },
            ].map((c) => (
              <div key={c.who} className="rounded-[1.5rem] border border-[#1B2024]/8 bg-[#FAFBFB] p-6 sm:p-7 flex flex-col">
                <div className="text-[15px] font-bold text-[#1B2024]">{c.who}</div>
                <span className="mt-2 self-start rounded-full bg-[#2E4A66] text-[#F1F3F3] px-3 py-1 text-[11px] font-bold tracking-[0.04em]">あなたは {c.flow}</span>
                <div className="mt-4 text-[1.15rem] font-[800] text-[#2E4A66] leading-[1.4]" style={HEAD}>{c.big}</div>
                <div className="mt-3 space-y-1.5">
                  {c.lines.map((l) => (
                    <p key={l} className="text-[13.5px] text-[#414A50] leading-[1.8]">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[13.5px] text-[#5E6E76] leading-[1.8]">
            共通：掲載料・初期費用・月額は0円。最低契約期間の縛りはなく、いつでも停止できます。
            手数料をいただく場合の料率も、始める前に書面でお伝えします。
          </p>
          {/* 提携先が0件であることを、募集の面でも隠さない。
              隠して集めると、1件目の相手に「他にもいる」と思わせたことになる。 */}
          <p className="mt-4 text-center text-[13.5px] text-[#5E6E76] leading-[1.8]">
            なお、上の4条件を確かめられた提携先は、現時点で0件です。まだ1件もお客さまをお送りしていません。
            条件と現在の状況は
            <Link
              href="/disclosure"
              className="mx-1 font-bold text-[#2F6F79] underline decoration-[#70B0B0]/50 underline-offset-4 hover:opacity-70 transition-opacity"
            >
              広告と収益について
            </Link>
            に公開しています。
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑥-2 医療機関の方へ：制作の受託 ============
          お金の取り方を分けて書く。
          ご紹介の対価はいただかない（ここは今後も変えない）。
          自院の発信を整える制作は、患者数と連動しないので別の取引になる。

          いちばん大事なのは3段落目。
          受託した医療機関を編集面で扱えば、受け取っている制作費は
          実質的にご紹介の対価と同じものになる。だから扱わない。
          この線は約束ではなく、記事に名前が出たらビルドが落ちる形で
          持っている（lib/medicalClients.ts）。 */}
      <section className="border-t border-[#1B2024]/8">
        <div className="mx-auto max-w-[760px] px-6 py-20 sm:px-8 sm:py-28">
          <Eyebrow>For Clinics — 医療機関の方へ</Eyebrow>
          <h2
            className="mt-6 text-[1.7rem] font-[800] leading-[1.35] text-[#1B2024] sm:text-[2.2rem]"
            style={HEAD}
          >
            ご紹介では、いただきません。
            <br />
            <span className="text-[#2F6F79]">制作は、別のお取引です。</span>
          </h2>
          <div className="mt-7 space-y-5 text-[15px] leading-[1.95] text-[#414A50] sm:text-[16px]">
            <p>
              患者さまのご紹介に連動した報酬は、これからも受け取りません。
              受け取った時点で、その記事は法令上の医療広告になり、
              比べるための記事として書けなくなるからです。
            </p>
            <p>
              一方で、医療機関ご自身の発信——自院サイトの記事、患者さま向けの説明資料、
              検索とAI検索で正しく読まれる形の整備——のご依頼は、別のお取引として承っています。
              運営元のバイタリティデザインが受託し、
              <span className="font-bold text-[#1B2024]">
                料金は制作物に対するもので、患者さまの人数とは連動しません。
              </span>
              だから、ご紹介の対価にはあたりません。
            </p>
            <p>
              そのうえで、ひとつ決めていることがあります。
              <span className="font-bold text-[#1B2024]">
                制作を受託した医療機関を、His Recoveries の記事で扱うことはしません。
              </span>
              扱えば、いただいている制作費は、結局ご紹介の対価と同じものになります。
              この線は編集部の心がけではなく、記事に受託先の名前が出たら公開できない仕組みとして持っています。
            </p>
          </div>
          <p className="mt-8 text-[14px] leading-[1.9] text-[#5E6E76]">
            現時点で、制作を受託している医療機関は0件です。ご依頼は下のフォームからお知らせください。
          </p>

          <SectionCta />
        </div>
      </section>

      {/* ============ ⑦ 導入フロー ============ */}
      <section className="border-t border-[#1B2024]/8">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center">
            <Eyebrow>Getting Started — はじめかた</Eyebrow>
            <h2 className="mt-6 text-[1.7rem] sm:text-[2.5rem] leading-[1.35] font-[800] text-[#1B2024]" style={HEAD}>
              3ステップで、始まる。
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[1.4rem] border border-[#1B2024]/8 bg-white p-6 sm:p-7">
                <div className="text-[2.2rem] font-[800] text-[#D6DCDC] leading-none" style={HEAD}>{s.n}</div>
                <div className="mt-4 text-[16px] font-bold text-[#2E4A66]" style={HEAD}>{s.t}</div>
                <p className="mt-2 text-[14px] text-[#5E6E76] leading-[1.85]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ⑧ 申込（FAQ内包） ============ */}
      <section id="apply" className="border-t border-[#1B2024]/8 scroll-mt-16">
        <div className="max-w-[640px] mx-auto px-6 sm:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <Eyebrow>Apply — 申込</Eyebrow>
            <h2 className="mt-6 text-[1.8rem] sm:text-[2.4rem] leading-[1.3] font-[800] text-[#2E4A66]" style={HEAD}>
              まずは、<br className="sm:hidden" />話を聞かせてください。
            </h2>
            <p className="mt-6 text-[15px] sm:text-[15px] leading-[1.95] text-[#414A50]">
              入力は1分、必須はお名前とメールだけ。合うかどうかの確認からで大丈夫です。
            </p>
          </div>

          {/* 最後の不安3点（FAQ） */}
          <div className="mb-10 divide-y divide-[#1B2024]/8 border-y border-[#1B2024]/8">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                  <span className="text-[15px] font-bold text-[#1B2024] leading-[1.6]">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-[#2F6F79] transition-transform group-open:rotate-45">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-2.5 text-[14px] text-[#414A50] leading-[1.9] pr-8">{f.a}</p>
              </details>
            ))}
          </div>

          <PartnerApplyForm />
          <p className="mt-8 text-[12px] text-[#8FA6B4] leading-[1.85] text-center">
            His Recoveries は医療機関ではなく、施術・診療を行いません。医療機関のご紹介は、医療広告に関する法令・ガイドラインを遵守した形でのみ行います。
          </p>
        </div>
      </section>

      {/* ── フッター（B2B: 運営会社を明示。冷リンクの信頼性はここで決まる） ── */}
      <footer className="border-t border-[#1B2024]/8 bg-[#E6EAEA]">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-10 pb-4">
          <div className="rounded-[1.4rem] bg-white/70 border border-[#1B2024]/8 p-6 sm:p-7">
            <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[#70B0B0] mb-4">Company — 運営会社</div>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-[14.5px]">
              {[
                ["社名", `${site.company.name}（${site.company.nameEn}）`],
                ["事業内容", "男性ウェルネスサービス「His Recoveries」の企画・運営"],
                ["所在地", `${site.company.postalCode} ${site.company.address}`],
                ["お問い合わせ", site.company.email],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="shrink-0 w-[5.5em] text-[#5E6E76] font-bold">{k}</dt>
                  <dd className="text-[#414A50] leading-[1.7]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pb-10 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="logo-type text-[17px] font-bold text-[#2E4A66]">His Recoveries</Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[14.5px] text-[#414A50]">
            <Link href="/" className="hover:text-[#2E4A66] transition-colors">ホーム</Link>
            <Link href="/#index" className="hover:text-[#2E4A66] transition-colors">記事</Link>
            <Link href="/privacy" className="hover:text-[#2E4A66] transition-colors">プライバシー・免責事項</Link>
          </nav>
          <span className="text-[13.5px] text-[#5E6E76]">© 2026 His Recoveries</span>
        </div>
      </footer>
    </div>
  );
}

// ── 募集パートナーの2系統カード ──
function TrackCard({ tag, title, desc, chips, money, icon }: { tag: string; title: string; desc: string; chips: string[]; money: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.6rem] border border-[#1B2024]/8 bg-white p-7 sm:p-8 flex flex-col">
      <span aria-hidden className="grid place-items-center w-12 h-12 rounded-full bg-[#E2EAEA] mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F6F79" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#70B0B0]">{tag}</div>
      <div className="mt-2 text-[1.3rem] font-[800] text-[#2E4A66]" style={HEAD}>{title}</div>
      <p className="mt-3 text-[14.5px] text-[#414A50] leading-[1.9]">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span key={c} className="rounded-full bg-[#FAFBFB] border border-[#1B2024]/8 px-3 py-1.5 text-[13.5px] font-bold text-[#2F6F79]">{c}</span>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-[#1B2024]/8 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[#5E6E76]">Fee</span>
        <span className="text-[14px] font-bold text-[#2E4A66]">{money}</span>
      </div>
    </div>
  );
}

// ── フロー矢印（横=→ / 縦=↓） ──
function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-[#70B0B0] shrink-0" aria-hidden>
      <svg className="hidden sm:block" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      <svg className="sm:hidden my-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
    </div>
  );
}
