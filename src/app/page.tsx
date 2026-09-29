import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { topPlans, plan as getPlan, SUBJECTS, ENTRY_PLAN, DEFAULT_PLAN } from "@/lib/ask/plans";
import { DEMO, count } from "@/lib/ask/demo";
import { STEPS as JOURNEY } from "@/lib/ask/journey";
import { VERDICTS } from "@/lib/ask/model";
import { canCharge } from "@/lib/legal";
import { NAME, OPERATOR, ONE_LINER, SUB } from "@/lib/voice";
import { supply, shortMessage } from "@/lib/supply";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Tashikame from "@/components/brand/Tashikame";
import Flourish from "@/components/brand/Flourish";
import OnlineCount from "@/components/ask/OnlineCount";
import Slot from "@/components/brand/Slot";

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
// そして直して、もう一度通して、消えたところまで見せる。
// これが、この製品にお金が発生する唯一の理由。
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
// 出すのは「5人中3人」だけ。数えられるものしか出さない。
// 5人の反応を、女性全体のみんなの答えとして書かない。
//
// ── 構成（12） ────────────────────────────────────
//   1 ファーストビュー   2 こんな瞬間   3 3つの対象
//   4 Before / After     5 反応のまとめ  6 なぜAIではないか
//   7 使い方             8 料金          9 答える女性
//   10 安心・安全        11 FAQ          12 最後
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: `${NAME} — 送る前に、会う前に、話す前に。`,
  description: `${SUB} 写真・メッセージ・電話を、送る前・会う前・話す前に確認できます。`,
  alternates: { canonical: site.url },
};

const NAV = [
  ["#moments", "こんなとき"],
  ["#before-after", "実例"],
  ["#price", "料金"],
  ["#faq", "よくある質問"],
  ["/join", "答える側になる"],
] as const;

const STEPS = [
  { n: "01", t: "送る前のものを出す", d: "写真1枚か、メッセージ1件。そのまま貼るだけです。" },
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
    q: "5人がそう言えば、女性みんながそう思うということですか？",
    a: "違います。その5人がそう感じた、というだけです。だから意見が分かれたところも、そのまま出します。女性みんなの答えではありません。",
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
  id,
}: {
  children: React.ReactNode;
  tint?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${tint ? "bg-mist" : "bg-paper"}`}>
      <Wrap className="py-14 sm:py-20">{children}</Wrap>
    </section>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[23px] font-black leading-[1.4] text-slate sm:text-[27px]">
      <span>{children}</span>
      <Flourish className="text-brand" />
    </h2>
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
  const tops = topPlans();
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
            <Tashikame size={34} />
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
              相談する
            </PlanCta>
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      {/* 写真を小さく置かない。
          この製品を買う人は「いま手が止まっている人」なので、
          その人が自分を見つけられる絵を、最初に大きく出す。
          文字は写真に重ねず、左に置く（顔が隠れると何の絵か分からない）。 */}
      <section className="relative overflow-hidden bg-sky">
        {/* 写真。広い画面でだけ、右半分に敷く。
            狭い画面で文字の裏に敷くと、写真が霞んで文字も読みにくい。
            どちらも中途半端になるので、下に独立した帯として置く。 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block"
        >
          <Slot name="hero" rounded="" className="h-full w-full" />
          {/* 文字側へ向かってだけ、地の色に溶かす */}
          <span className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-sky to-transparent" />
        </div>

        <Wrap className="relative pb-12 pt-11 sm:pb-16 sm:pt-14">
          <div className="lg:max-w-[34em]">
            <p className="inline-flex items-center gap-2 rounded-pill border border-brand/40 bg-paper px-4 py-2 text-[12.5px] font-bold text-brand shadow-card">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 19a4 4 0 0 0-8 0 M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
              </svg>
              男性の方へ
            </p>

            <h1 className="mt-5 text-mega font-black leading-[1.22] text-slate">
              大事な相手だから、
              <br />
              失敗する前に
              <br />
              <span className="relative inline-block">
                相談する。
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 left-0 -z-10 h-[0.42em] w-full rounded-[2px] bg-brand/25"
                />
              </span>
            </h1>

            <p className="mt-6 max-w-[24em] text-[15px] leading-[1.9] text-steel sm:text-[16.5px]">
              写真・メッセージ・会話。
              <br />
              迷った瞬間に、実在女性の反応をもとに次の一手を考えられます。
            </p>

            {/* 何を見てもらえるか。押すとその場面から始まる */}
            <ul className="mt-6 flex flex-wrap gap-2">
              {SUBJECTS.map((sub) => {
                const usable = sub.id !== "call";
                const icon =
                  sub.id === "photo"
                    ? "M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6"
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

            {!open && (
              <p className="mt-6 rounded-card border border-line bg-paper px-5 py-4 text-[13px] leading-[1.85] text-slate shadow-card">
                {!paid
                  ? "いまお支払いを受け付けていません。特定商取引法に基づく表記が整い次第、始めます。"
                  : shortMessage(sup, main.answers)}
              </p>
            )}

            <div className="mt-7 max-w-[24em]">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="hero"
                className="min-h-[60px] w-full rounded-pill bg-brand px-9 text-[17px] !text-paper shadow-card"
              >
                今すぐ相談する <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-bold text-steel">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実在女性が回答</li>
              {sup.canPromiseSpeed && <li>最短数分</li>}
            </ul>
            <p className="mt-2.5 text-[12px] text-steel">
              {entry.name} ¥{entry.yen.toLocaleString()} から
            </p>

            {/* 送る前のやりとり。顔は置かず、言葉だけ */}
            <div className="relative z-10 mt-8 w-full max-w-[22em] rounded-card border border-line bg-paper p-4 shadow-card">
              <p className="w-fit rounded-card rounded-bl-[4px] bg-mist px-4 py-2.5 text-[13.5px] leading-[1.65] text-slate">
                来週の土曜、
                <br />
                ご飯どうですか？
              </p>
              <p className="mt-1 text-right text-[10.5px] text-steel">19:24</p>
              <p className="ml-auto mt-2 flex w-fit items-center gap-2.5 rounded-card rounded-br-[4px] bg-brand-tint px-4 py-2.5 text-[13.5px] leading-[1.65] text-slate">
                このまま送っていいかな…？
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                  </svg>
                </span>
              </p>
            </div>
          </div>
        </Wrap>

        {/* 狭い画面では、文字の裏ではなく、独立した帯として見せる */}
        <Slot
          name="hero"
          rounded=""
          className="mt-2 h-[340px] w-full sm:h-[420px] lg:hidden"
        />
      </section>

      {/* ══ 2. 今どこで悩んでいますか ══ */}
      <Block id="moments">
        <H>今、どこで悩んでいますか。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
          いまどのあたりですか。どこにいるかで、聞きたいことは変わります。
        </p>

        <ol className="mt-8 flex flex-col gap-2.5">
          {JOURNEY.map((j, i) => (
            <Reveal key={j.id} delay={i * 45}>
              <li>
                {j.open ? (
                  <PlanCta
                    plan={DEFAULT_PLAN}
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
                      <span className="mt-2.5 flex flex-wrap gap-1.5">
                        {j.items.map((t) => (
                          <span
                            key={t}
                            className="rounded-pill bg-mist px-2.5 py-1 text-[11.5px] font-normal text-steel"
                          >
                            {t}
                          </span>
                        ))}
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

        <p className="mt-7 max-w-[34em] text-[14px] leading-[1.9] text-steel">
          一度使ったあとは、前回の続きとして相談できます。
          毎回ゼロから状況を説明する必要はありません。
        </p>
      </Block>

      {/* ══ 3. 3つの対象 ══ */}
      <Block tint>
        <H>見てもらえるのは、この3つ。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
          どこで迷っていても、出すものはこの3つのどれかです。
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {SUBJECTS.map((s, i) => {
            const usable = s.id !== "call";
            return (
              <Reveal key={s.id} delay={i * 60}>
                <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-card">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-steel">
                    {s.label.toUpperCase()}
                  </span>
                  <p className="mt-2.5 text-[19px] font-black leading-[1.5] text-slate">{s.lead}</p>
                  <p className="mt-3.5 text-[13.5px] leading-[1.85] text-steel">{s.body}</p>
                  <div className="mt-6 flex-1" />
                  {usable ? (
                    <PlanCta
                      plan={DEFAULT_PLAN}
                      from={`subject_${s.id}`}
                      category={s.id === "photo" ? "photo" : "message"}
                      className="min-h-[50px] rounded-pill bg-brand px-5 text-[14.5px] !text-paper shadow-card"
                    >
                      {s.label}を見てもらう <span aria-hidden className="ml-1.5">→</span>
                    </PlanCta>
                  ) : (
                    <Link
                      href="/talk"
                      className="inline-flex min-h-[50px] items-center justify-center rounded-pill border border-line bg-paper px-5 text-[14px] font-bold text-slate"
                    >
                      受付前・順番待ちに入る
                    </Link>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Block>

      {/* ══ 4. Before / After ══ */}
      <Block id="before-after">
        <H>直す前と、直したあと。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.95] text-steel">
          自分では気づかなかったところが、送る前に出てきます。
          大丈夫そうなら「このままで大丈夫そう」と返ってきます。無理に探しません。
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="rounded-card border border-rose bg-paper p-6 shadow-card">
            <p className="text-[11px] font-bold tracking-[0.14em] text-rose-text">BEFORE</p>
            <p className="mt-3 rounded-card rounded-tl-[4px] bg-mist px-4 py-3.5 text-[16px] leading-[1.7]">
              {DEMO.before}
            </p>
            <ul className="mt-5 flex flex-col gap-3">
              {DEMO.says.map((s) => (
                <li key={s.age} className="flex items-start gap-2.5">
                  <Who age={s.age} size={30} />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate">{s.age}歳</span>
                      <span
                        className={`rounded-pill px-2 py-0.5 text-[10px] font-bold ${TONE[s.verdict]}`}
                      >
                        {label(s.verdict)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.7] text-steel">{s.say}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-soft bg-rose-tint px-4 py-3">
              <p className="text-[11px] font-bold text-rose-text">共通して気になったこと</p>
              <p className="mt-1 text-[13.5px] font-bold leading-[1.7]">{DEMO.common}</p>
            </div>
            {DEMO.split && (
              <p className="mt-3 text-[12px] leading-[1.7] text-steel">{DEMO.split}</p>
            )}
          </div>

          <p aria-hidden className="justify-self-center text-[24px] text-steel lg:rotate-0">
            →
          </p>

          <div className="rounded-card border border-ok bg-paper p-6 shadow-card">
            <p className="text-[11px] font-bold tracking-[0.14em] text-ok-text">AFTER</p>
            <p className="mt-3 rounded-card rounded-tl-[4px] bg-ok-tint px-4 py-3.5 text-[16px] leading-[1.7]">
              {DEMO.after}
            </p>
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[11.5px] font-bold text-steel">別の女性{DEMO.retest.of}人に、もう一度見てもらった</p>
              <p className="mt-2.5 text-[34px] font-black tabular-nums leading-none text-ok-text">
                {DEMO.retest.n}
                <span className="text-steel"> / {DEMO.retest.of}</span>
              </p>
              <p className="mt-2 text-[14px] leading-[1.7]">{DEMO.retest.say}</p>
            </div>
            <p className="mt-5 text-[12px] leading-[1.75] text-steel">
              ※ 画面の見本です。実際の回答ではありません。
            </p>
          </div>
        </div>
      </Block>

      {/* ══ 5. 反応のまとめ方 ══ */}
      <Block tint>
        <H>点数はつきません。</H>
        <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "何人がどう答えたか", d: "このままでOK / 少し気になる / 変えた方がいい。実際の人数だけを出します。" },
            { t: "みんなが気にしたところ", d: "何人も同じところに触れていたら、そこが直したほうがいいところです。" },
            { t: "意見が分かれたところ", d: "割れることもあります。人によって受け取り方が違う、ということです。" },
            { t: "書かれた言葉そのまま", d: "まとめだけで終わらせません。書いてもらった文を、そのまま出します。" },
          ].map((x) => (
            <div key={x.t} className="rounded-card border border-line bg-paper p-5 shadow-card">
              <p className="text-[14.5px] font-black leading-[1.5]">{x.t}</p>
              <p className="mt-2.5 text-[12.5px] leading-[1.8] text-steel">{x.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-7 max-w-[34em] text-[14px] leading-[1.9] text-steel">
          「失敗する確率」みたいな数字は出しません。数えようがないからです。
          出すのは「5人中3人」だけ。その5人がそう感じた、という話であって、女性みんなの答えではありません。
        </p>
      </Block>

      {/* ══ 6. なぜAIではないか ══ */}
      <Block>
        <H>AIではなく、実在の女性である理由。</H>
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

          <p aria-hidden className="justify-self-center self-center text-[22px] text-steel">
            →
          </p>

          <div className="rounded-card border border-brand bg-paper p-5 shadow-card">
            <p className="text-[14.5px] font-black text-brand">実在の女性5人</p>
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

        <p className="mt-9 text-[21px] font-black leading-[1.6] text-slate sm:text-[25px]">
          AIは予測する。
          <br />
          女性は、実際に受け取る。
        </p>
        <span aria-hidden className="mt-2.5 block h-1 w-[150px] rounded-pill bg-brand sm:w-[180px]" />
        <p className="mt-7 max-w-[32em] text-[15px] leading-[1.95] text-steel">
          まずAIに聞いていい。文面を作るのも、考えをまとめるのもAIのほうが得意です。
          それでも最後に残る「実際どう思われるか」だけ、人に聞きます。
          AIはこちらの裏側で、返ってきた答えをまとめるのに使っています。
        </p>
      </Block>

      {/* ══ 7. 使い方 ══ */}
      <Block tint id="how">
        <H>やることは、4つ。</H>
        <ol className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-card border border-line bg-paper p-5 shadow-card">
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-tint text-[13px] font-black tabular-nums text-brand-deep"
              >
                {s.n}
              </span>
              <p className="mt-3 text-[15.5px] font-black leading-[1.5]">{s.t}</p>
              <p className="mt-2 text-[12.5px] leading-[1.8] text-steel">{s.d}</p>
            </li>
          ))}
        </ol>
      </Block>

      {/* ══ 8. 料金 ══ */}
      <Block id="price">
        <H>必要なときだけ、1回ごと。</H>
        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.95] text-steel">
          月額はありません。入会金もありません。ここぞという場面の前にだけ使うものです。
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {tops.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <div
                className={`flex h-full flex-col rounded-card border bg-paper p-6 shadow-card ${
                  p.featured ? "border-rose" : "border-line"
                }`}
              >
                {p.featured ? (
                  <span className="mb-3 inline-flex w-fit rounded-pill bg-rose-fill px-3 py-1 text-[11px] font-bold text-paper">
                    いちばん使われています
                  </span>
                ) : (
                  <span aria-hidden className="mb-3 block h-[25px]" />
                )}
                <p className="text-[17px] font-black text-slate">{p.name}</p>
                <p
                  className={`mt-2.5 text-[32px] font-black leading-none tabular-nums ${
                    p.featured ? "text-rose-text" : "text-slate"
                  }`}
                >
                  ¥{p.yen.toLocaleString()}
                  {p.from && <span className="ml-1 text-[16px] text-steel">〜</span>}
                </p>
                <p className="mt-3.5 text-[13.5px] leading-[1.8] text-steel">{p.tagline}</p>

                <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
                  {p.includes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                      <span aria-hidden className="mt-[2px] shrink-0 text-[11px] font-black text-brand">
                        ✓
                      </span>
                      <span className="min-w-0 text-steel">{x}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex-1" />
                <PlanCta
                  plan={p.id}
                  from="price"
                  className={`min-h-[52px] rounded-pill px-5 text-[15px] shadow-card ${
                    p.featured ? "bg-rose-fill !text-paper" : "border border-brand bg-paper !text-brand"
                  }`}
                >
                  これで相談する <span aria-hidden className="ml-1.5">→</span>
                </PlanCta>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 rounded-card border border-line bg-mist px-5 py-4">
          <p className="text-[13.5px] font-bold">
            {getPlan("call").name}
            <span className="ml-2 rounded-pill bg-paper px-2 py-0.5 text-[10.5px] font-bold text-steel">
              受付前
            </span>
          </p>
          <p className="text-[13.5px] text-steel">
            ¥{getPlan("call").yen.toLocaleString()}〜 ·{" "}
            <Link href="/talk" className="font-bold text-brand underline decoration-line underline-offset-4">
              順番待ちに入る
            </Link>
          </p>
        </div>

        <p className="mt-5 text-[12.5px] leading-[1.9] text-steel">
          税込。募集を始める前ならキャンセルできます。人数が集まらなかった場合は、集まらなかった分をご返金します。
          <Link
            href="/legal"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            特定商取引法に基づく表記
          </Link>
        </p>
      </Block>

      {/* ══ 9. 答える女性 ══ */}
      <Block tint>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <H>答えるのは、恋愛の専門家ではありません。</H>
            <p className="mt-5 max-w-[32em] text-[15px] leading-[1.95] text-steel">
              正解を教えてくれる人でもありません。一人の女性として、
              実際にどう思ったかを書いてくれる人です。
            </p>
            <p className="mt-4 max-w-[32em] text-[15px] leading-[1.95] text-steel">
              ただし、登録すれば誰でも読めるわけではありません。
              年齢と立場を確認して、通った人にだけお願いしています。
              年代・恋愛観・いまの立場を選んで、気になる相手に近い人に見てもらえます。
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/answerers"
                className="inline-flex min-h-[50px] items-center justify-center rounded-pill border border-line bg-paper px-6 text-[14px] font-bold text-slate shadow-card transition-shadow hover:shadow-card-hover"
              >
                誰が読むのか
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-[50px] items-center justify-center rounded-pill bg-slate px-6 text-[14px] font-bold text-paper transition-opacity hover:opacity-90"
              >
                答えてくれる女性へ
              </Link>
            </div>
          </div>
          <OnlineCount />
        </div>
      </Block>

      {/* ══ 10. 安心・安全 ══ */}
      <Block>
        <H>安心・安全のために。</H>
        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {[
            "匿名で使えます。名前もメールアドレスも要りません",
            "相手の名前・写真・連絡先は保存しません",
            "送る前に、個人情報は自動で伏せます",
            "答えてくれた女性と直接つながる仕組みはありません",
            "年齢と立場を確認した女性だけが見ます",
            "18歳未満に関する相談はお受けしていません",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3.5 text-[13.5px] leading-[1.8] text-steel"
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
      <Block tint id="faq">
        <H>よくある質問。</H>
        <dl className="mt-8 grid gap-3 lg:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-card border border-line bg-paper p-5 shadow-card">
              <dt className="text-[15px] font-black leading-[1.6]">{f.q}</dt>
              <dd className="mt-2.5 text-[13.5px] leading-[1.85] text-steel">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Block>

      {/* ══ 12. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-20 pt-6 sm:pb-24">
          <div className="rounded-card bg-brand p-8 text-paper shadow-card sm:p-14">
            <p className="text-huge font-black">送る前に、会う前に、話す前に。</p>
            <p className="mt-5 max-w-[26em] text-[16px] leading-[1.85]">
              大事な相手なのに、選び間違いで終わらせないために。
            </p>
            <div className="mt-9">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="final"
                className="min-h-[60px] w-full rounded-pill bg-paper px-9 text-[16.5px] !text-brand-deep sm:w-auto"
              >
                今の悩みを相談する <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] font-bold text-paper">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実在女性が回答</li>
              <li>
                {entry.name} ¥{entry.yen.toLocaleString()} から
              </li>
            </ul>
          </div>
        </Wrap>
      </section>

      {/* ── フッター ── */}
      <footer className="border-t border-line bg-mist">
        <Wrap className="py-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {[
              {
                h: "使う",
                items: [
                  ["/ask", "相談する"],
                  ["/talk", "電話の練習"],
                  ["/mine", "相談したこと"],
                ] as const,
              },
              {
                h: "知る",
                items: [
                  ["/how", "仕組み"],
                  ["/safety", "安心・安全"],
                  ["/answerers", "誰が読むのか"],
                  ["/articles", "記事"],
                ] as const,
              },
              {
                h: "参加する",
                items: [
                  ["/join", "答える側になる"],
                  ["/about", "編集方針"],
                  ["/updates", "更新記録"],
                ] as const,
              },
              {
                h: "決まりごと",
                items: [
                  ["/legal", "特定商取引法に基づく表記"],
                  ["/privacy", "プライバシー・免責事項"],
                  ["/disclosure", "広告と収益について"],
                ] as const,
              },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-[12.5px] font-bold text-steel">{col.h}</p>
                <ul className="mt-3.5 flex flex-col gap-2 text-[13.5px]">
                  {col.items.map(([href, l]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="-my-1 block py-1 text-slate/80 transition-colors hover:text-brand"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Tashikame size={28} />
              <span className="text-[15px] font-black text-slate">{NAME}</span>
            </Link>
            <p className="text-[12px] text-steel">© 2026 {OPERATOR}</p>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
