import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLANS, plan as getPlan, SUBJECTS, ENTRY_PLAN, DEFAULT_PLAN } from "@/lib/ask/plans";
import { DEMO, count } from "@/lib/ask/demo";
import { ALTERNATIVES, COMPARE, COMPARE_NOTE, COMPARE_SCOPE } from "@/lib/ask/compare";
import { STEPS as JOURNEY, isOpen as stepOpen } from "@/lib/ask/journey";
import { VERDICTS } from "@/lib/ask/model";
import { canCharge } from "@/lib/legal";
import { NAME, SUB, THESIS, THESIS_A, THESIS_A1, THESIS_A2, THESIS_B } from "@/lib/voice";
import { supply, shortMessage } from "@/lib/supply";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Tashikame from "@/components/brand/Tashikame";
import TashikameGuide from "@/components/brand/TashikameGuide";
import MenuButton from "@/components/brand/MenuButton";
import Flourish from "@/components/brand/Flourish";
import OnlineCount from "@/components/ask/OnlineCount";
import Slot from "@/components/brand/Slot";
import HeroBoard, { HeroNote } from "@/components/brand/HeroBoard";
import CaseRows from "@/components/brand/CaseRows";
import WhoReads from "@/components/brand/WhoReads";
import Yen from "@/components/brand/Yen";
import { LADDER } from "@/lib/responder/policy";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── 売っているもの ────────────────────────────────
// モテる方法ではない。
// 大事な相手とのチャンスを、自分の判断ミスで失わないこと。
//
// ── いちばん大きく直したところ ────────────────────
// 前の見本は、回答が肯定的なものばかりだった。
//   「いいと思います！」「好印象です！」「送って大丈夫です！」
// これを見た人が、お金を払う理由は無い。
// 全部が「いいと思います」なら、聞く必要が無かったことになる。
//
// いまの見本は、必ず何かが引っかかっている。
// そして、引っかかったところを直した文面と、なぜそう直したかまで見せる。
// これが、この製品にお金が発生する唯一の理由。
// 直したものをもう一度別の人に通す工程は売っていないので、見本にも出さない。
//
// ── ただし悪いところ探しのサービスにしない ────────────────
// 問題が無ければ「このままで問題なさそう」も、ちゃんと結果。
//
// ── 入口の言葉は「相談」 ──────────────────────────
// 「評価される」「診断される」は、押す前に身構える。
// 「ちょっと相談する」のほうが手が伸びる。
// ただし相談で止めない。何が返ってくるかを隣に必ず書く。
//
// ── 出さない数字 ──────────────────────────────────
// 「失敗確率72%」は出さない。根拠が無い。
// 出すのは「3人中2人」だけ。数えられるものしか出さない。
// 3人の反応を、女性全体のみんなの答えとして書かない。
//
// ── 何のサービスに見えるか ────────────────────────
// 「LINEを送る前に女性に聞くサービス」だけに見せない。
// 実際に売っているのは、恋愛の分岐点を選ぶ前に確かめられること。
//   どの自己紹介文にするか / いま返すか、待つか / そろそろ誘うか
//   電話するか / 今日送るか、明日にするか / 切り出すか、待つか
// だから1画面目の次は、Before/After ではなく分岐点の一覧にしてある。
// 先に「何のサービスか」を決めて、そのあとに「何が返るか」を見せる。
//
// ── 構成 ──────────────────────────────────────────
//   1 ファーストビュー   2 分岐点の一覧  3 相談前と相談後
//   4 こんな選択を       5 答える女性    6 なぜAIではないか
//   7 使い方             8 料金          9 ほかの選び方
//   10 安心・安全        11 FAQ          12 最後  13 両面
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: `${NAME} — ${THESIS_B}`,
  description: `${THESIS} ${SUB}`,
  alternates: { canonical: site.url },
};

const NAV = [
  ["#moments", "分岐点"],
  ["#before-after", "実例"],
  ["#price", "料金"],
  ["#faq", "よくある質問"],
  ["/join", "答える側になる"],
] as const;

const STEPS = [
  { n: "01", t: "送る前のものを出す", d: "送る前のLINE、または自己紹介文。そのまま貼るだけです。" },
  { n: "02", t: "条件に合う女性に届く", d: "年代や立場を選べます。確認が済んだ女性にだけ届きます。" },
  { n: "03", t: "一人ずつ返ってくる", d: "このままでOK / 少し気になる / 変えた方がいい と、そう思った理由。" },
  { n: "04", t: "直すか、そのまま出すか決める", d: "大丈夫そうならそのまま。気になる点が出たら、直してから。" },
];

const FAQ = [
  {
    q: "AIに聞くのと何が違いますか？",
    a: "AIが出すのは「たぶんこう思われます」です。ここで返ってくるのは、実在の女性が実際にどう思ったかです。予想ではなく、本当の反応です。",
  },
  {
    q: "3人がそう言えば、女性みんながそう思うということですか？",
    a: "違います。読んだ人がそう感じた、というだけです。だから意見が分かれたところも、そのまま出します。女性みんなの答えではありません。",
  },
  {
    q: "悪いところを無理に探されませんか？",
    a: "探しません。問題が無ければ「このままで大丈夫そう」と返ってきます。それも答えです。悪いところ探しになると、本当に直すべきところが埋もれます。",
  },
  {
    q: "相手に知られませんか？",
    a: "知られません。匿名で使えて、相手の名前・写真・連絡先は保存していません。答えてくれた女性とあなたが直接つながる仕組みも、作っていません。",
  },
  {
    q: "どのくらいで返ってきますか？",
    a: "条件に合う女性が何人いるかによります。実際のところが分かるまでは、何分とは言いません。いま何人に届いて何人が見ているかは、画面で分かるようにしてあります。",
  },
  {
    q: "集まらなかったら？",
    a: "集まらなかった分はお返しします。条件を広げてもう少し待つか、全額返してもらうかを選べます。こちらで勝手に決めません。",
  },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Block({
  children,
  tint = false,
  dark = false,
  id,
}: {
  children: React.ReactNode;
  tint?: boolean;
  /**
   * 暗い面。
   *
   * 白と淡い青だけで最後まで進むと、どの節も同じ強さに見えて、
   * ページ全体の印象が薄くなる。1か所だけ黒い面を置いて、
   * 読んでいる途中に「ここが芯」と分かる場所を作る。
   */
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${dark ? "bg-slate" : tint ? "bg-mist" : "bg-paper"}`}
    >
      <Wrap className="py-12 sm:py-16 lg:py-20">{children}</Wrap>
    </section>
  );
}

/** 英字の小見出し。日本語の見出しの上に、小さく添えるだけ */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold tracking-[0.14em] text-steel">{children}</p>;
}

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    // 全部スクロールで読むページなので、節の頭で1回だけ動かす。
    // 派手にしない。上に10px、それだけ（Reveal が持っている）。
    // 動きを止めている人には出したまま何もしない。
    <Reveal>
      <h2
        className={`flex items-center gap-2 text-[24px] font-black leading-[1.35] tracking-[-0.02em] sm:text-[28px] ${
          dark ? "text-paper" : "text-slate"
        }`}
      >
        <span>{children}</span>
        <Flourish className={dark ? "text-brand-tint" : "text-brand"} />
      </h2>
    </Reveal>
  );
}

/** 年齢だけで表す。顔は置かない */
function Who({ age, size = 36 }: { age: number; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-tint font-black tabular-nums text-brand-deep"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.33) }}
    >
      {age}
    </span>
  );
}

/** 値段が上がる理由。段の意味を1行で */
const LADDER_WHY: Record<string, string> = {
  review: "見てもらう",
  reaction: "反応を見る",
  mockchat: "会話を試す",
  session: "一人について決める",
  mockdate: "本番を再現する",
};

const TONE: Record<string, string> = {
  as_is: "bg-ok-tint text-ok-text",
  slight: "bg-mist text-steel",
  change: "bg-rose-tint text-rose-text",
};

function label(v: string) {
  return VERDICTS.find((x) => x.id === v)?.label ?? v;
}

export default async function HomePage() {
  const paid = canCharge();
  const entry = getPlan(ENTRY_PLAN);
  const main = getPlan(DEFAULT_PLAN);
  const sup = await supply(main.answers);
  const open = paid && sup.open;

  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Tashikame size={46} />
            <span className="min-w-0 truncate text-[19px] font-black tracking-[0.02em] text-slate">
              {NAME}
            </span>
          </Link>
          <nav aria-label="サイト" className="flex shrink-0 items-center gap-5">
            <ul className="hidden items-center gap-6 lg:flex">
              {NAV.map(([href, l]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-[13.5px] font-bold text-steel transition-colors hover:text-brand"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <PlanCta
              plan={DEFAULT_PLAN}
              from="header"
              className="min-h-[42px] rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
            >
              確かめる
            </PlanCta>
            {/* フッターを外したので、ほかの面への行き先はここに畳んである。
                特商法の表記とプライバシーも、ここから辿れる */}
            <MenuButton />
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      {/* 写真を小さく置かない。
          この製品を買う人は「いま手が止まっている人」なので、
          その人が自分を見つけられる絵を、最初に大きく出す。
          文字は写真に重ねず、左に置く（顔が隠れると何の絵か分からない）。 */}
      <section className="relative overflow-hidden bg-sky">
        {/* 相談する男性と、読んで返す女性を1枚に入れる。
            片方だけだと、誰が誰に何をしてもらえるのかが伝わらない。 */}
        <HeroBoard />

        <Wrap className="relative pb-10 pt-3 sm:pb-16 sm:pt-8 lg:pt-8">
          <div className="lg:max-w-[34em]">

            {/* 言いたいことは1つ。
                写真の上の「このLINE、今送っていい？」は、その人の頭の中。
                こちらはそれへの答え。大きさで主従をはっきりさせる。 */}
            <h1 className="text-mega font-black leading-[1.15] text-slate">
              迷ったら、
              <br />
              <span className="relative inline-block">
                女性に聞けばいい。
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 -z-10 h-[0.42em] w-full rounded-[2px] bg-brand/25"
                />
              </span>
            </h1>

            {/* 見出しの下は、考え方を置く。
                「失敗する前に」を立てると、買う理由が不安だけになる。
                売っているのは、選ぶ前に確かめられること。 */}
            <p className="mt-3.5 hidden text-[19px] font-black leading-[1.55] text-slate sm:block">
              {THESIS_A}
              <br />
              {THESIS_B}
            </p>

            {/* ここが「LINEの添削屋ではない」を決める行。
                扱う場面を、恋愛が進む順に並べる。
                写真と服装は入れない。画像を受け取る口がまだ無い。 */}
            <p className="mt-3 max-w-[26em] text-[15px] leading-[1.8] text-steel sm:mt-4 sm:text-[16px]">
              自己紹介文、LINE、誘い方、デートの前後、次の一手。
              <wbr />
              大事な選択の前に、実在の女性{main.answers}人のリアルな反応を。
            </p>

            {/* いくらなのかを、スクロールさせずに出す。
                値段が下にあると、それだけで帰られる。 */}
            <ul className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13.5px] font-bold text-slate">
              {/* 丸バッジを1行に畳んだ。誰向けかは残したまま、縦を1行ぶん空ける */}
              <li className="text-brand">男性向け</li>
              <li aria-hidden className="text-line">|</li>
              <li><Yen yen={entry.yen} />から</li>
              <li aria-hidden className="text-line">|</li>
              <li>月額なし</li>
              <li aria-hidden className="text-line">|</li>
              <li>匿名</li>
            </ul>

            {/* 押す場所も、スクロールさせない */}
            <div data-hero-cta className="mt-5 max-w-[24em]">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="hero"
                className="min-h-[60px] w-full rounded-pill bg-brand px-9 text-[17px] !text-paper shadow-card"
              >
                今の選択を確かめる <span aria-hidden className="ml-2">&rarr;</span>
              </PlanCta>
            </div>

            {/* 押す前に引っかかるところを、4つだけ先に消す。
                文字を並べるより、絵があるほうが読まずに入る。 */}
            <ul className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { t: "実在女性が回答", d: "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M21 20v-1a4 4 0 0 0-3-3.9" },
                { t: "匿名OK", d: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4" },
                { t: "都度払い", d: "M3 7h18v12H3z M3 11h18" },
                sup.canPromiseSpeed
                  ? { t: "最短数分", d: "M13 2 4 14h7l-1 8 9-12h-7z" }
                  : { t: "追加料金なし", d: "M12 3v18 M8.5 7.5h5.2a2.6 2.6 0 0 1 0 5.2H9.6a2.6 2.6 0 0 0 0 5.2h5.9" },
              ].map((x) => (
                <li key={x.t} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-[22px] w-[22px] text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={x.d} />
                    </svg>
                  </span>
                  <span className="text-[11px] font-bold leading-[1.4] text-slate sm:text-[12.5px]">
                    {x.t}
                  </span>
                </li>
              ))}
            </ul>

            {/* 何を見てもらえるか。押すとその場面から始まる */}
            <ul className="mt-5 flex flex-wrap gap-2">
              {SUBJECTS.map((sub) => {
                const usable = sub.id !== "call";
                const icon =
                  sub.id === "photo"
                    ? "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h4"
                    : sub.id === "message"
                      ? "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z"
                      : "M16 19a4 4 0 0 0-8 0 M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6";
                const inner = (
                  <>
                    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    {sub.label}
                  </>
                );
                return (
                  <li key={sub.id}>
                    {usable ? (
                      <PlanCta
                        plan={DEFAULT_PLAN}
                        from={`hero_${sub.id}`}
                        category={sub.id === "photo" ? "photo" : "message"}
                        className="min-h-[44px] gap-2 rounded-pill border border-line bg-paper px-4 text-[13.5px] !text-slate shadow-card"
                      >
                        {inner}
                      </PlanCta>
                    ) : (
                      <Link
                        href="/talk"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border border-line bg-paper px-4 text-[13.5px] font-bold text-steel shadow-card"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-5">
              <HeroNote />
            </div>

            {!open && (
              <p className="mt-5 rounded-card border border-line bg-paper px-5 py-4 text-[13px] leading-[1.85] text-slate shadow-card">
                {!paid
                  ? "いまお支払いを受け付けていません。特定商取引法に基づく表記が整い次第、始めます。"
                  : shortMessage(sup, main.answers)}
              </p>
            )}


          </div>
        </Wrap>

      </section>

      {/* ══ 2. 今どの分岐点にいるか ══ */}
      {/* ここがこの製品の中身。
          「悩みの一覧」ではなく「そこで実際に迷う選択」を出す。
          状態を並べると相談窓口の一覧になり、困ったときにだけ開くものになる。
          選択を並べると、次の一手を決める前に開くものになる。
          問いは lib/ask/journey.ts の choices。受け取れない問いはビルドで弾く。 */}
      <Block id="moments">
        <H>今、どの分岐点にいますか。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          恋愛は、一度の大勝負ではありません。
          この小さな選択が積み重なって、状況が変わっていきます。
          どれも、選ぶ前に確かめられます。
        </p>

        <ol className="mt-8 flex flex-col gap-2.5">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.id} delay={i * 45}>
              <li>
                {stepOpen(j) ? (
                  <PlanCta
                    plan={j.plan}
                    from={`step_${j.id}`}
                    category={j.category}
                    step={j.id}
                    className="!flex w-full !items-start gap-4 rounded-card border border-line bg-paper p-5 text-left shadow-card"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-black tabular-nums text-brand-deep"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-black leading-[1.5] text-slate">
                        {j.label}
                      </span>
                      <span className="mt-1.5 block text-[13.5px] font-normal leading-[1.8] text-steel">
                        {j.pain}
                      </span>
                      {/* そこで実際に迷う選択。これがこの節の中身 */}
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {j.choices.map((t) => (
                          <span
                            key={t}
                            className="rounded-pill border border-line bg-mist px-2.5 py-1 text-[12px] font-bold text-slate"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                      {/* この段で何を買うのか。段だけ見せて商品を隠さない */}
                      <span className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px]">
                        <span className="font-bold text-brand-deep">{getPlan(j.plan).name}</span>
                        <span className="font-bold tabular-nums text-slate">
                          ¥{getPlan(j.plan).yen.toLocaleString()}
                        </span>
                        {j.next && !getPlan(j.next).available && (
                          <span className="font-normal text-steel">
                            / {getPlan(j.next).name}は受付前
                          </span>
                        )}
                      </span>
                    </span>
                    <span aria-hidden className="mt-1 shrink-0 text-[15px] text-brand">
                      →
                    </span>
                  </PlanCta>
                ) : (
                  <div className="flex items-start gap-4 rounded-card border border-line bg-mist p-5">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-[12px] font-black tabular-nums text-steel"
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[16px] font-black leading-[1.5] text-slate">
                        {j.label}
                        <span className="rounded-pill bg-paper px-2.5 py-1 text-[10.5px] font-bold text-steel">
                          受付前
                        </span>
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-[1.8] text-steel">{j.pain}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {j.choices.map((t) => (
                          <li
                            key={t}
                            className="rounded-pill border border-line bg-paper px-2.5 py-1 text-[12px] font-bold text-steel"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[12.5px] leading-[1.8] text-steel">
                        ここは<span className="font-bold text-slate">{getPlan(j.plan).name}</span>
                        で受け付けます。相手も実在の人なので、時間を決めた受け入れ方が用意できてから開きます。
                      </p>
                      <Link
                        href="/talk"
                        className="mt-3 inline-flex min-h-[40px] items-center text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
                      >
                        順番待ちに入る
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            </Reveal>
          ))}
        </ol>

        {/* 一度で終わらせない。次の分岐点が来たときに、また開くもの。
            ここは機能の説明ではなく、続けて使える理由として書く。 */}
        <div className="mt-8 rounded-card border border-line bg-paper px-5 py-5 shadow-card">
          <p className="text-[14.5px] font-black leading-[1.6] text-slate">
            次の分岐点が来たら、前回の続きから。
          </p>
          <p className="mt-2.5 text-[13.5px] leading-[1.9] text-steel">
            相手のことも、これまでの流れも、毎回ゼロから説明し直す必要はありません。
            前に確かめたことは残っているので、次は「今回どうするか」だけを書けば済みます。
          </p>
          <p className="mt-2.5 text-[12.5px] leading-[1.85] text-steel">
            残すのは、あなたが書いたことと、返ってきた反応だけです。
            相手の実名も、連絡先も、メッセージの全文も保存しません。
          </p>
        </div>
      </Block>

      {/* ══ 3. 相談前と、相談後 ══ */}
      {/* 押す場所のすぐ下に置く。買う前に、何が起きるのかを1回で見せる。
          ここより下に同じものを置かない（2回出ると、どちらも弱くなる） */}
      <Block id="before-after">
        <H>相談前と、相談後。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          自分では気づかなかったところが、送る前に出てきます。
          大丈夫そうなら「このままで大丈夫そう」と返ってきます。無理に探しません。
        </p>

        {/* 渡された案を、そのままの形で。
            写真は2枚とも同じ撮影のもの（hero = 考えている、heroTall = 決まった）。
            人を合成したり、表情を作ったりはしていない。 */}
        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
          {/* ── 相談前 ── */}
          <Reveal className="h-full">
          <div className="h-full overflow-hidden rounded-card border border-line bg-mist shadow-card">
            <div className="relative">
              <Slot name="hero" rounded="" position="center 22%" className="h-[190px] w-full" />
              <span className="absolute left-4 top-4 rounded-soft bg-slate/85 px-3.5 py-1.5 text-[13px] font-black text-paper">
                相談前
              </span>
              {/* 手が止まっているときの、頭の中 */}
              <span className="absolute bottom-4 right-4 max-w-[62%] rounded-card rounded-br-[4px] bg-paper/95 px-3.5 py-2 text-[12.5px] font-bold leading-[1.6] text-slate shadow-card">
                これで送っていいのかな…
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-end gap-2.5">
                <p className="min-w-0 flex-1 rounded-card rounded-br-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-slate">
                  {DEMO.before}
                </p>
                <span
                  aria-hidden
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-steel/35 text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                  </svg>
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {["重くないかな…？", "この言い方で大丈夫…？", "変に思われないかな…？"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] text-steel">
                    <span
                      aria-hidden
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-steel/25 text-paper"
                    >
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          </Reveal>

          <p
            aria-hidden
            className="justify-self-center self-center text-[26px] font-black text-brand lg:text-[30px]"
          >
            <span className="lg:hidden">&darr;</span>
            <span className="hidden lg:inline">&rarr;</span>
          </p>

          {/* ── 相談後 ── */}
          <Reveal className="h-full" delay={140}>
          <div className="h-full overflow-hidden rounded-card border border-brand bg-brand-tint shadow-card">
            <div className="relative">
              <Slot name="heroTall" rounded="" position="center 24%" className="h-[190px] w-full" />
              <span className="absolute left-4 top-4 rounded-soft bg-brand px-3.5 py-1.5 text-[13px] font-black text-paper">
                相談後
              </span>
              <span className="absolute bottom-4 right-4 max-w-[62%] rounded-card rounded-br-[4px] bg-paper/95 px-3.5 py-2 text-[12.5px] font-bold leading-[1.6] text-brand-deep shadow-card">
                反応を確かめたうえで、送れる
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-end gap-2.5">
                <p className="min-w-0 flex-1 rounded-card rounded-br-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] font-bold leading-[1.7] text-slate">
                  {DEMO.after}
                </p>
                <span
                  aria-hidden
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                  </svg>
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {[
                  "自然な言い方が分かった",
                  "女性の反応を確かめられた",
                  "迷わずに送れる",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] font-bold text-slate">
                    <span
                      aria-hidden
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand text-paper"
                    >
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </Reveal>
        </div>

        {/* 何をもとに直したのか。数は demo.ts の中で数え直している */}
        <div className="mt-5 rounded-card border border-line bg-paper px-5 py-4 shadow-card">
          <ul className="flex flex-wrap items-center gap-2">
            {(["change", "slight", "as_is"] as const)
              .map((v) => ({ v, n: count(DEMO, v) }))
              .filter((x) => x.n > 0)
              .map((x) => (
                <li
                  key={x.v}
                  className={`rounded-pill px-3 py-1.5 text-[12px] font-bold ${TONE[x.v]}`}
                >
                  {label(x.v)} {x.n}人
                </li>
              ))}
          </ul>
          <p className="mt-3 text-[13.5px] font-bold leading-[1.7] text-slate">
            共通して気になったこと：{DEMO.common}
          </p>
          {DEMO.split && (
            <p className="mt-1.5 text-[12.5px] leading-[1.7] text-steel">{DEMO.split}</p>
          )}
          {/* 入っているのは、直し方と修正文まで。2巡目は売っていないので見本にも出さない */}
          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[12px] font-bold text-steel">なぜ、そう直したか</p>
            <p className="mt-1.5 text-[13px] leading-[1.8] text-slate">{DEMO.why}</p>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-[1.75] text-steel">
          ※ 写真はイメージ、文面と回答は画面の見本です。実際の相談ではありません。
        </p>
      </Block>

      {/* 返ってくるもの。節を分けず、Before/After の下に短く置く */}
      <section className="bg-paper">
        <Wrap className="pb-14 sm:pb-16">
          <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["何人がどう答えたか", "実際の人数だけ"],
              ["みんなが気にしたところ", "何人も触れていたら、そこ"],
              ["意見が分かれたところ", "人によって受け取り方が違う"],
              ["書かれた言葉そのまま", "まとめだけで終わらせない"],
            ].map(([t, d]) => (
              <li
                key={t}
                className="rounded-card border border-line bg-paper px-5 py-4 shadow-card"
              >
                <p className="text-[13.5px] font-black leading-[1.5]">{t}</p>
                <p className="mt-1.5 text-[12px] leading-[1.7] text-steel">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[34em] text-[13px] leading-[1.9] text-steel">
            「失敗する確率」みたいな数字は出しません。数えようがないからです。
            出すのは「3人中2人」のような実数だけ。読んだ人がそう感じた、という話であって、
            女性みんなの答えではありません。
          </p>

          {/* ここから料金の節まで、スマホで5画面ぶん押す場所が無かった。
              見本を読み終えた直後がいちばん近いので、ここに1つ置く。 */}
          <div className="mt-9 max-w-[24em]">
            <PlanCta
              plan={DEFAULT_PLAN}
              from="after_demo"
              className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
            >
              自分のも見てもらう <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
            <p className="mt-3 text-[12.5px] text-steel">
              ¥{entry.yen.toLocaleString()}から / 1回ごと / 匿名
            </p>
          </div>
        </Wrap>
      </section>

      {/* ══ 4. こんな選択を、選ぶ前に ══ */}
      {/* 説明を足すより、送る文面と返ってきた言葉を横に並べるほうが早い。
          頭に置くのは場面名ではなく、そこで迷っている選択。
          受け付けていない場面（服装・会話）は出さない。押しても行き止まりになる。 */}
      <Block tint>
        <Eyebrow>MEN&apos;S EXAMPLE</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">
          こんな選択を、
          <br className="sm:hidden" />
          選ぶ前に。
        </h2>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          自己紹介文、LINE、誘い方、デートのあと、切り出すとき。
          どれも実在の女性が読んで、実際にどう受け取ったかを返します。
          そのうえで決めるのは、あなたです。
        </p>

        <div className="mt-7">
          <CaseRows />
        </div>

        <div className="mt-7 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="cases"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            自分の場面で確かめる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 写真はイメージ、文面と回答は画面の見本です。特定の利用者の体験談ではありません。
        </p>
      </Block>

      {/* ══ 3.5 実在の女性が回答します ══ */}
      <Block>
        <Eyebrow>WOMEN&apos;S EXAMPLE</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">
          実在の女性が
          <br className="sm:hidden" />
          回答してくれます。
        </h2>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          20代〜30代の、さまざまな恋愛経験を持つ実在の女性が、率直な意見をお伝えします。
        </p>

        <ul className="mt-7 grid gap-3 rounded-card border border-rose bg-rose-tint p-5 sm:grid-cols-3">
          {[
            { t: "20〜30代", d: "マッチングアプリ経験あり" },
            { t: "さまざまな恋愛観", d: "正直な意見" },
            { t: "本人確認済み", d: "安心して相談できる" },
          ].map((x) => (
            <li key={x.t} className="text-center">
              <p className="text-[14px] font-black text-slate">{x.t}</p>
              <p className="mt-1 text-[12px] leading-[1.7] text-steel">{x.d}</p>
            </li>
          ))}
        </ul>

        {/* 回答する側のイメージ。
            名前も職業も居住地も付けない。付けた時点で
            「この人が読みます」になり、登録が0人だと事実でなくなる。
            付けてあるのは、実際に選べる条件だけ。 */}
        {/* スマホで2列に積むと3行になり、それだけで1画面を超える。
            横に流して1行に収める。 */}
        <ul className="-mx-5 mt-6 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {(
            [
              { img: "w1", chips: ["マッチングアプリ経験あり", "カジュアルな恋愛経験"] },
              { img: "w2", chips: ["マッチングアプリ経験あり", "年上男性との交際経験"] },
              { img: "w3", chips: ["恋愛経験あり", "真剣な恋愛志向"] },
              { img: "w4", chips: ["マッチングアプリ経験あり", "年上男性が好き"] },
              { img: "w5", chips: ["恋愛経験あり", "落ち着いた関係が好き"] },
            ] as const
          ).map((w, i) => (
            <Reveal key={w.img} delay={i * 45}>
              <li className="flex h-full w-[150px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-line bg-paper shadow-card sm:w-auto">
                <Slot name={w.img} rounded="" className="aspect-square w-full" />
                <div className="flex flex-1 flex-col gap-1.5 p-3.5">
                  {w.chips.map((c) => (
                    <span
                      key={c}
                      className="w-fit rounded-pill bg-rose-tint px-2.5 py-1 text-[11px] leading-[1.5] text-rose-text"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <p className="mt-4 text-[12px] leading-[1.8] text-steel">
          ※ 写真はイメージです。上に出ているのは、あなたが選べる条件です。
          実際に登録している方は{" "}
          <Link href="/answerers" className="font-bold text-brand underline decoration-line underline-offset-4">
            誰が読むのか
          </Link>{" "}
          に出ます。
        </p>

        <div className="mt-6">
          <WhoReads compact />
        </div>

        <p className="mt-6 max-w-[34em] text-[14.5px] leading-[1.85] text-steel">
          恋愛の専門家ではありません。正解を教えてくれる人でもありません。
          一人の女性として、実際にどう思ったかを書いてくれる人です。
        </p>

        <div className="mt-5">
          <OnlineCount />
        </div>

        <div className="mt-6 flex flex-col items-start gap-4 rounded-card border border-line bg-paper p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-bold leading-[1.75] text-slate">
            あなたの悩みに合わせて
            <br />
            実在の女性から回答が届きます。
          </p>
          <PlanCta
            plan={DEFAULT_PLAN}
            from="women_cta"
            className="min-h-[52px] shrink-0 rounded-pill bg-brand px-7 text-[15px] !text-paper shadow-card"
          >
            今の選択を確かめる <span aria-hidden className="ml-2">→</span>
          </PlanCta>
        </div>
      </Block>

      {/* ══ 6. なぜAIではないか ══ */}
      {/* ここだけ黒い面にしている。淡い色ばかりだと、どの節も
          同じ強さに見えて、ページ全体の印象が薄くなる。 */}
      <Block dark>
        <H dark>AIではなく、実在の女性である理由。</H>
        <div className="mt-8 grid items-stretch gap-3.5 lg:grid-cols-[1fr_auto_1.1fr]">
          <div className="rounded-card border border-line bg-paper p-5 shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-soft bg-mist text-[13px] font-black text-steel">
                AI
              </span>
              <p className="text-[14.5px] font-bold text-slate">AIに聞くと</p>
            </div>
            <p className="mt-5 text-[15.5px] leading-[1.85] text-steel">
              「丁寧で好印象だと思います。相手に配慮が伝わる自然な文面です。」
            </p>
            <p className="mt-5 text-right">
              <span className="rounded-pill bg-mist px-2.5 py-1 text-[11px] font-bold text-steel">
                予測
              </span>
            </p>
          </div>

          <p aria-hidden className="justify-self-center self-center text-[22px] text-steel-dark">
            →
          </p>

          <div className="rounded-card border border-brand bg-paper p-5 shadow-card">
            <p className="text-[14.5px] font-black text-brand">実在の女性{main.answers}人</p>
            <ul className="mt-5 flex flex-col gap-3">
              {DEMO.says.slice(0, 3).map((s) => (
                <li key={s.age} className="flex items-start gap-3">
                  <Who age={s.age} size={30} />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold text-slate">{s.age}歳・女性</span>
                    <span className="block text-[14px] leading-[1.7] text-steel">{s.say}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-right">
              <span className="rounded-pill bg-brand px-2.5 py-1 text-[11px] font-bold text-paper">
                実際の反応
              </span>
            </p>
          </div>
        </div>

        <p className="mt-9 text-[21px] font-black leading-[1.6] text-paper sm:text-[25px]">
          AIは予測する。
          <br />
          女性は、実際に受け取る。
        </p>
        <span aria-hidden className="mt-2.5 block h-1 w-[150px] rounded-pill bg-brand sm:w-[180px]" />
        <p className="mt-7 max-w-[32em] text-[15px] leading-[1.85] text-steel-dark">
          まずAIに聞いていい。文面を作るのも、考えをまとめるのもAIのほうが得意です。
          それでも最後に残る「実際どう思われるか」だけ、人に聞きます。
          AIはこちらの裏側で、返ってきた答えをまとめるのに使っています。
        </p>

        {/* 敵対させない。AIで選択肢を作り、その選択肢を人で確かめる。
            この順番で使うのがいちばん安いし、いちばん速い。 */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            {
              who: "AIがやること",
              tone: "dim" as const,
              list: ["文面を考える", "選択肢を作る", "状況を整理する"],
            },
            {
              who: "タシカメがやること",
              tone: "on" as const,
              list: [
                "その選択肢を実在の女性が読む",
                "実際にどう受け取ったかを返す",
                "なぜそう感じたかを書く",
              ],
            },
          ].map((x) => (
            <div
              key={x.who}
              className={`rounded-card p-5 ${
                x.tone === "on" ? "bg-brand text-paper" : "border border-line-dark bg-slate"
              }`}
            >
              <p
                className={`text-[13px] font-black ${
                  x.tone === "on" ? "text-paper" : "text-steel-dark"
                }`}
              >
                {x.who}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {x.list.map((t) => (
                  <li
                    key={t}
                    className={`text-[13.5px] leading-[1.7] ${
                      x.tone === "on" ? "text-paper" : "text-steel-dark"
                    }`}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13.5px] leading-[1.85] text-steel-dark">
          どちらが上という話ではありません。AIで選択肢を作って、
          その選択肢を人で確かめる。この順番がいちばん速いと思っています。
        </p>
      </Block>

      {/* ══ 7. 使い方 ══ */}
      {/* カードを4枚積むと、スマホで4画面分になる。
          1行ずつの帯にして、1画面に収める。 */}
      <Block tint id="how">
        {/* 手順を案内する節。マークを出す場所として、いちばん素直 */}
        <div className="mb-4 flex items-center gap-3">
          <Tashikame size={52} />
          <p className="text-[13px] font-bold leading-[1.6] text-steel">
            送る前に、ひと手間だけ。
          </p>
        </div>
        <H>やることは、4つ。</H>
        <ol className="mt-7 overflow-hidden rounded-card border border-line bg-paper shadow-card">
          {STEPS.map((st, i) => (
            <li
              key={st.n}
              className={`flex items-start gap-4 p-4 sm:p-5 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11.5px] font-black tabular-nums text-brand-deep"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-black leading-[1.5]">{st.t}</span>
                <span className="mt-1 block text-[12.5px] leading-[1.75] text-steel">{st.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </Block>

      {/* ══ 8. 料金 ══ */}
      {/* 値段の差は、聞く人数ではなく「本番にどれだけ近いか」。
          見てもらう → 反応を見る → 会話を試す → 一人について決める → 本番を再現する。
          値段より先に、何が返ってくるかを出す。 */}
      <Block id="price">
        <H>必要なところだけ、1回ごと。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          月額はありません。値段が上がるのは人数が増えるからではなく、
          本番に近いところまでやるからです。
        </p>

        <ul className="mt-8 flex flex-col gap-3.5">
          {PLANS.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={i * 60}>
                <div
                  className={`flex h-full flex-col rounded-card border bg-paper p-5 shadow-card sm:p-6 ${
                    p.featured ? "border-2 border-brand" : "border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tabular-nums text-steel">
                      {LADDER_WHY[p.id]}
                    </span>
                    {!p.available && (
                      <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
                        受付前
                      </span>
                    )}
                  </div>

                  {/* 値段より先に、何をするものかを出す */}
                  <p className="mt-2 text-[18px] font-black leading-[1.5] text-slate sm:text-[20px]">
                    {p.tagline}
                  </p>
                  <p className="mt-2.5 text-[13.5px] leading-[1.8] text-steel">{p.value}</p>

                  <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
                    {p.includes.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                        <span
                          aria-hidden
                          className="mt-[3px] shrink-0 text-[11px] font-black text-brand"
                        >
                          ✓
                        </span>
                        <span className="min-w-0 text-steel">{x}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-[15px] font-black text-slate">
                      {p.name}
                      <span className="ml-2.5 text-[22px]">
                        <Yen yen={p.yen} from={p.from} />
                      </span>
                    </p>
                    {p.available ? (
                      <PlanCta
                        plan={p.id}
                        from="price"
                        className="min-h-[48px] shrink-0 rounded-pill bg-brand px-6 text-[14.5px] !text-paper shadow-card"
                      >
                        この内容で確かめる <span aria-hidden className="ml-1.5">&rarr;</span>
                      </PlanCta>
                    ) : (
                      <Link
                        href="/talk"
                        className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-pill border border-line bg-paper px-6 text-[14px] font-bold text-steel"
                      >
                        順番待ちに入る <span aria-hidden className="ml-1.5">&rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[12.5px] leading-[1.85] text-steel">
          税込。いま受け付けているのは「{main.name}」だけです。ほかの4つは、
          その場で会話する・動画を受け取るための手順が用意できてから開きます。
          募集を始める前ならキャンセルできます。人数が集まらなかった場合は、
          集まらなかった分をご返金します。
          <Link
            href="/legal"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            特定商取引法に基づく表記
          </Link>
        </p>
      </Block>

      {/* ══ 9.5 ほかの選び方との違い ══ */}
      {/* 比較広告は景表法の対象。実証・正確な引用・公正な比較の3つが要る。
          他社の金額は書かない（出典が無い）。事実に反することも書かない
          （AIは無料で使えるものが多い）。中身と判定は lib/ask/compare.ts。 */}
      <Block tint>
        <H>ほかの選び方と、どう違うか。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          {COMPARE_SCOPE}
          送る前・会う前のひと手間だけを引き受けるのが、この製品です。
        </p>

        {/* 列が6つあるので、スマホでは必ず切れる。切れていることを書く */}
        <p className="mt-6 flex items-center gap-1.5 text-[11.5px] text-steel lg:hidden">
          <span aria-hidden>↔</span> 表は横にスクロールできます
        </p>

        <div className="mt-3 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0 lg:mt-7">
          <table className="w-full min-w-[880px] border-collapse overflow-hidden rounded-card border border-line bg-paper shadow-card">
            <thead>
              <tr>
                <th scope="col" className="w-[6.5em] bg-paper px-3 py-3" />
                {ALTERNATIVES.map((a) => (
                  <th
                    key={a.id}
                    scope="col"
                    className={`px-3 py-3 text-[13px] font-black leading-[1.4] ${
                      a.us ? "bg-brand text-paper" : "bg-mist text-steel"
                    }`}
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <th
                    scope="row"
                    className="px-3 py-3 text-left align-top text-[12px] font-bold leading-[1.6] text-steel"
                  >
                    {r.label}
                  </th>
                  {ALTERNATIVES.map((a) => (
                    <td
                      key={a.id}
                      className={`px-3 py-3 align-top text-[12px] leading-[1.7] ${
                        a.us ? "bg-brand-tint font-bold text-brand-deep" : "text-steel"
                      }`}
                    >
                      {r.cells[a.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[12px] leading-[1.85] text-steel">{COMPARE_NOTE}</p>

        <div className="mt-7 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="compare"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            今の選択を確かめる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>
      </Block>

      {/* ══ 10. 安心・安全 ══ */}
      <Block>
        <H>安心・安全のために。</H>
        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {[
            "匿名で使えます。名前もメールアドレスも要りません",
            "相手の名前・連絡先は保存しません",
            "送る前に、個人情報は自動で伏せます",
            "答えてくれた女性と直接つながる仕組みはありません",
            "年齢と立場を確認した女性だけが見ます",
            "18歳未満に関する相談はお受けしていません",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-2.5 rounded-soft bg-mist px-3.5 py-3 text-[13px] leading-[1.75] text-steel"
            >
              <span aria-hidden className="mt-[3px] text-[13px] font-black text-ok-text">
                ✓
              </span>
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/safety"
          className="mt-7 inline-flex min-h-[44px] items-center text-[13.5px] font-bold text-brand underline decoration-line underline-offset-4"
        >
          できないことも含めて、詳しく
        </Link>
      </Block>

      {/* ══ 11. よくある質問 ══ */}
      {/* 6つ全部開いていると、それだけで3画面分になる。
          見出しだけ並べて、読みたいものだけ開く。 */}
      <Block tint id="faq">
        <H>よくある質問。</H>
        <div className="mt-7 overflow-hidden rounded-card border border-line bg-paper shadow-card">
          {FAQ.map((f, i) => (
            <details key={f.q} className={`group ${i > 0 ? "border-t border-line" : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-[14.5px] font-bold leading-[1.6] text-slate sm:p-5">
                {f.q}
                <span
                  aria-hidden
                  className="shrink-0 text-[18px] leading-none text-steel transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-4 pb-5 text-[13.5px] leading-[1.9] text-steel sm:px-5">{f.a}</p>
            </details>
          ))}
        </div>
      </Block>

      {/* ══ 12. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-20 pt-6 sm:pb-24">
          <div className="relative overflow-hidden rounded-card bg-brand p-8 text-paper shadow-card sm:p-14">
            {/* いちばん最後に、もう一度出す。背景は抜いてあるので青の上に乗る */}
            {/* 右下に置く。右上だと見出しに被る（「話す前に。」が読めなくなる）。
                下は文字が終わっていて、いちばん空いている。 */}
            <Tashikame
              size={104}
              className="pointer-events-none absolute -bottom-3 -right-3 sm:!h-[168px] sm:!w-[168px]"
            />
            {/* 最後は、考え方で締める。
                「選び間違いで終わらせないために」は、怖さで押していた。
                残したいのは、自分で選べたという感触のほう。 */}
            {/* 2行とも15字前後あるので、text-huge だと390pxで語の途中で折れる。
                1段下げたうえ、狭い画面では1行目をもう一度折る */}
            <p className="relative text-big font-black leading-[1.5]">
              {THESIS_A1}
              <br className="sm:hidden" />
              {THESIS_A2}
              <br />
              {THESIS_B}
            </p>
            <p className="relative mt-5 max-w-[26em] text-[16px] leading-[1.85]">
              Aならこう感じた、Bならこう感じた。そこまでがこちらの仕事です。
              どちらにするかは、あなたが決めてください。
            </p>
            <div className="mt-9">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="final"
                className="min-h-[60px] w-full rounded-pill bg-paper px-9 text-[16.5px] !text-brand-deep sm:w-auto"
              >
                今の選択を確かめる <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] font-bold text-paper">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実在女性が回答</li>
              <li>
                {entry.name} <Yen yen={entry.yen} /> から
              </li>
            </ul>
          </div>
        </Wrap>
      </section>

      {/* スクロールを先導するタシカメ。進み具合と、押す場所を兼ねる */}
      <TashikameGuide />

      {/* ══ 13. 両面 ══ */}
      {/* この製品は、買う人だけでは成り立たない。
          読む人がいてはじめて商品になる。
          フッターを外したときに、答える側への入口がトップから消えていた。
          売り買いの両方を、同じ大きさで並べて置き直す。

          件数や人数は書かない。まだ実績が無いので、書けば作り話になる。
          書けるのは、それぞれが何をして、いくらになるかまで。 */}
      <Block tint>
        <H>使う人と、答える人。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          どちらかが多すぎても成り立ちません。読む人がいて、はじめて商品になります。
        </p>

        <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
          <div className="flex h-full flex-col rounded-card border border-brand bg-paper p-6 shadow-card">
            <p className="text-[11.5px] font-bold tracking-[0.1em] text-brand">MEN</p>
            <p className="mt-2.5 text-[18px] font-black leading-[1.5] text-slate">
              送る前のものを、読んでもらう
            </p>
            <p className="mt-3 text-[13.5px] leading-[1.85] text-steel">
              LINEの文面、自己紹介文、誘い方。実在の女性{main.answers}人の反応が返ります。
            </p>
            <p className="mt-4 text-[20px] font-black text-slate">
              <Yen yen={main.yen} />
              <span className="ml-1.5 text-[12.5px] font-bold text-steel">から / 1回ごと</span>
            </p>
            <div className="mt-5 flex-1" />
            <PlanCta
              plan={DEFAULT_PLAN}
              from="two_sided"
              className="min-h-[50px] rounded-pill bg-brand px-5 text-[14.5px] !text-paper shadow-card"
            >
              確かめる <span aria-hidden className="ml-1.5">&rarr;</span>
            </PlanCta>
          </div>

          <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-card">
            <p className="text-[11.5px] font-bold tracking-[0.1em] text-steel">WOMEN</p>
            <p className="mt-2.5 text-[18px] font-black leading-[1.5] text-slate">
              自分の感覚が、そのまま価値になる
            </p>
            <p className="mt-3 text-[13.5px] leading-[1.85] text-steel">
              読んで、どう感じたかを書くだけ。資格は要りません。顔を出す必要もありません。
            </p>
            <p className="mt-4 text-[20px] font-black text-slate">
              <Yen yen={LADDER[0].yen} />
              <span className="mx-1 text-[14px] font-bold text-steel">〜</span>
              <Yen yen={LADDER[LADDER.length - 1].yen} />
              <span className="ml-1.5 text-[12.5px] font-bold text-steel">/ 1件</span>
            </p>
            <div className="mt-5 flex-1" />
            <Link
              href="/join"
              className="inline-flex min-h-[50px] items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14.5px] font-bold text-brand shadow-card transition-shadow hover:shadow-card-hover"
            >
              答える側になる <span aria-hidden className="ml-1.5">&rarr;</span>
            </Link>
          </div>
        </div>
      </Block>
    </div>
  );
}
