import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, PRICE_YEN, BILLING_ENABLED } from "@/lib/ask/model";
import {
  Eyebrow, AttributeChip, ReactionCard, ResultDistribution, Hairline,
  type Reaction,
} from "@/components/brand/kit";
import { HumanCard, FlowStep, type Human } from "@/components/brand/market";
import LiveMarket from "@/components/brand/LiveMarket";
import Reveal from "@/components/brand/Reveal";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── 何に見せるか ──────────────────────────────────
// 「誰かに相談できるサイト」ではなく、
// 「人の視点が流通するマーケットプレイス」に見せる。
//
// そのために、回答結果だけでなく回答者そのものを主役にする。
// 聞く側と答える側を対等に置く（CTAも2本出す）。
//
// ── 無い実績を作らない ────────────────────────────
// いま回答者は0人、相談も0件、課金もしていない。
// 「128 ANSWERS」「HELPFUL 94%」「3 / 5 responses」を
// それらしく置くと、偽るのはデザインではなく市場の厚みになる。
// 「答える人がいるから聞く価値がある」という前提そのものが嘘になる。
//
// だから
//   ・流れている件数は LiveMarket が実データから出す（0件なら0件）
//   ・見本のカードには必ず「見本」と書く
//   ・金額は課金していない間、予定としてしか出さない
//
// ── 構成 ──────────────────────────────────────────
//   1 Hero             2 Live Marketplace   3 AI vs Human
//   4 How It Works     5 Human Cards        6 Reaction Report
//   7 Answer & Earn    8 Trust              9 CTA
// ══════════════════════════════════════════════════════════════

// 流れている相談は実データから出す。静的に焼くと、いつまでも空のままになる。
export const revalidate = 60;

export const metadata: Metadata = {
  title: "His Recoveries — AIに聞く前に、人に聞く。",
  description:
    "人の視点が流通するマーケットプレイス。相手に近い属性の人から、リアルな反応を集められます。聞く側としても、答える側としても参加できます。",
  alternates: { canonical: site.url },
};

/* 見本。実在の回答者ではないので、置く場所には必ずその旨を書く */
const SAMPLE_HUMANS: Human[] = [
  {
    age: "24",
    gender: "Woman",
    area: "Tokyo",
    attrs: ["app_user"],
    specialties: ["message", "date"],
    answered: 0,
    latest: "私は全然あり。",
  },
  {
    age: "27",
    gender: "Woman",
    area: "Osaka",
    attrs: ["single"],
    specialties: ["photo"],
    answered: 0,
    latest: "少し重いかも。",
  },
  {
    age: "26",
    gender: "Man",
    area: "Tokyo",
    attrs: ["app_user"],
    specialties: ["signal"],
    answered: 0,
    latest: "次の誘い方は自然だと思う。",
  },
];

const SAMPLE_REACTIONS: Reaction[] = [
  {
    age: 25,
    attrs: ["Woman", "App User", "Tokyo"],
    verdict: "Good",
    positive: true,
    comment: "このくらいなら嬉しい。ただ、最後の1行はいらないかも。",
  },
  {
    age: 27,
    attrs: ["Woman", "Osaka"],
    verdict: "Hmm",
    comment: "前半はいいけど、次の約束まで一気に入れると少し重い。",
  },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 sm:px-10 ${className}`}>{children}</div>
  );
}

export default function HomePage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — AIに聞く前に、人に聞く。`,
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
  };

  return (
    <div data-brand className="min-h-screen bg-bone text-void">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* ── ヘッダー ── */}
      <header className="border-b border-rule">
        <Wrap className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="text-[15px] font-black uppercase tracking-[0.1em]">
            His Recoveries
          </Link>
          <nav aria-label="サイト" className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/join"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-ash transition-colors hover:text-void"
            >
              回答する
            </Link>
            <Link
              href="/ask"
              className="inline-flex min-h-[44px] items-center bg-void px-5 text-[12px] font-bold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-lime hover:text-void"
            >
              人に聞く
            </Link>
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. HERO ══ */}
      <section className="border-b border-rule">
        <Wrap className="grid gap-12 pb-16 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pb-24 lg:pt-20">
          <div>
            <Eyebrow>Human perspective marketplace</Eyebrow>
            {/* text-mega（最大132px）は画面いっぱいのときの寸法。
                ここは右にカードを置く半分の幅なので、7文字が1行に入らず
                1440px で4行に割れていた。この列の幅に合わせて詰める。 */}
            <h1
              className="mt-6 font-black leading-[0.95] tracking-[-0.04em] text-void"
              style={{ fontSize: "clamp(40px, 5.8vw, 84px)" }}
            >
              AIに聞く前に、
              <br />
              人に聞く。
            </h1>
            <p className="mt-8 max-w-[24em] text-[17px] font-medium leading-[1.9] text-ash sm:text-[19px]">
              相手に近い人の、リアルな反応を集めよう。
            </p>

            {/* 聞く側と答える側を対等に置く */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask"
                className="inline-flex min-h-[62px] flex-1 items-center justify-center bg-void px-6 text-center text-[14px] font-bold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-lime hover:text-void"
              >
                人に聞いてみる
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-[62px] flex-1 items-center justify-center border border-void px-6 text-center text-[14px] font-bold uppercase tracking-[0.12em] text-void transition-colors hover:bg-void hover:text-bone"
              >
                回答者として参加する
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.id !== "other")
                .slice(0, 6)
                .map((c) => (
                  <li key={c.id}>
                    <Link href={`/ask?c=${c.id}`}>
                      <AttributeChip>{c.label}</AttributeChip>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* 回答者のカード。整列しすぎると名簿に見えるので少し傾ける。
              スマホでは重ねない（幅が足りず、下が上を隠す） */}
          <div className="relative flex flex-col gap-4 lg:block lg:min-h-[800px]">
            {SAMPLE_HUMANS.map((h, i) => (
              <div
                key={i}
                className={[
                  "w-full lg:absolute lg:max-w-[300px]",
                  i === 0 ? "lg:left-0 lg:top-0" : "",
                  // 端だけ重ねる。深く重ねると、下のカードの中身が隠れて
                  // 「回答数」も「一言」も読めなくなる（実際に隠れていた）。
                  i === 1 ? "lg:right-0 lg:top-[268px]" : "",
                  i === 2 ? "lg:left-[4%] lg:top-[536px]" : "",
                ].join(" ")}
              >
                <Reveal delay={i * 130}>
                  <HumanCard h={h} tilt={i === 1 ? 1.6 : -1.6} float={i === 1 ? "slow" : "normal"} />
                </Reveal>
              </div>
            ))}
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ash lg:absolute lg:bottom-0 lg:right-0">
              ※ 画面の見本。実在の回答者ではありません
            </p>
          </div>
        </Wrap>
      </section>

      {/* ══ 2. LIVE MARKETPLACE ══ */}
      <section className="bg-void text-bone">
        <Wrap className="py-20 sm:py-24">
          <LiveMarket tone="dark" />
        </Wrap>
      </section>

      {/* ══ 3. AI vs HUMAN ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Don&rsquo;t simulate people. Ask them.</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-void">
              AIは答えを出す。
              <br />
              人間は、割れる。
            </h2>
            <p className="mt-7 max-w-[26em] text-[16px] leading-[1.95] text-ash sm:text-[17px]">
              その割れ方こそが、知りたいことになる。
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="h-full border border-rule p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-3">
                  <Eyebrow>AI</Eyebrow>
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ash">
                    One answer
                  </span>
                </div>
                <p className="mt-6 text-[19px] font-medium leading-[1.85] sm:text-[21px]">
                  「一般的には、好意的に受け取られる可能性があります。」
                </p>
                <p className="mt-8 border-t border-rule pt-5 text-[13px] leading-[1.85] text-ash">
                  もっともらしく、外れてもいない。
                  でも、あなたが送る相手のことは何ひとつ知らないまま書かれています。
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="h-full border-2 border-void p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-3">
                  <Eyebrow>Humans</Eyebrow>
                  <span className="bg-lime px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-void">
                    5 reactions
                  </span>
                </div>
                <ul className="mt-6 flex flex-col gap-4">
                  {[
                    "私は嬉しい。",
                    "ちょっと重い。",
                    "好きなら全然あり。",
                    "最後の一文はいらない。",
                    "私は返信したい。",
                  ].map((t, i) => (
                    <li
                      key={t}
                      className="text-[18px] font-medium leading-[1.6] sm:text-[20px]"
                      style={{ paddingLeft: `${(i % 3) * 14}px` }}
                    >
                      「{t}」
                    </li>
                  ))}
                </ul>
                <p className="mt-8 border-t border-rule pt-5 text-[13px] leading-[1.85] text-ash">
                  全員が同じことを言うわけではありません。
                  ばらつくこと自体が、あなたの知りたい情報です。
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <p className="mt-16 text-big font-black">
              AIは予測する。
              <br />
              人は、反応する。
            </p>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-ash">
              Powered by AI. Answered by humans.
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 4. HOW IT WORKS ══ */}
      <section id="how" className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-6 text-huge font-black text-void">5つ。</h2>
          </Reveal>

          <ol className="mt-14 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n: "01", en: "Ask", ja: "質問を投稿する。", d: "カテゴリを選んで書くだけ。30秒。" },
              { n: "02", en: "Choose", ja: "誰に聞きたいか選ぶ。", d: "年代と、近い条件を指定する。" },
              { n: "03", en: "Match", ja: "条件に合う人へ届く。", d: "当てはまる回答者にだけ配られます。" },
              { n: "04", en: "React", ja: "実在する人が答える。", d: "回答者どうしも、出すまで他は見えない。" },
              { n: "05", en: "Decide", ja: "自分で決める。", d: "送る。変える。待つ。やめる。" },
            ].map((s, i) => (
              <li key={s.n} className="bg-bone p-6">
                <Reveal delay={i * 70}>
                  <span className="block text-[40px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums text-ash">
                    {s.n}
                  </span>
                  <span className="mt-5 block text-[11px] font-bold uppercase tracking-[0.2em] text-ash">
                    {s.en}
                  </span>
                  <p className="mt-2.5 text-[16px] font-bold leading-[1.55]">{s.ja}</p>
                  <p className="mt-3 text-[13px] leading-[1.85] text-ash">{s.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal>
            <p className="mt-10 max-w-[30em] text-[15px] leading-[1.95] text-ash">
              His Recoveries が答えを決めるわけではありません。
              集まった反応を並べるところまでが、こちらの仕事です。
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 5. HUMAN CARDS ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Who you ask matters</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-void">
              誰に聞くかで、
              <br />
              答えは変わる。
            </h2>
            <p className="mt-8 max-w-[28em] text-[16px] leading-[1.95] text-ash sm:text-[17px]">
              「誰か女性に聞いた」と「気になっている相手に近い5人に聞いた」は、
              同じ回答数でも、受け取り方がまるで違います。
              年代・地域・立場・得意な話題まで見てから聞けます。
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_HUMANS.map((h, i) => (
              <Reveal key={i} delay={i * 90}>
                <HumanCard h={h} tilt={i === 1 ? 0.7 : -0.7} className="h-full" />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-ash">
              ※ 画面の見本。実在の回答者ではありません
            </p>
            <div className="mt-8">
              <Link
                href="/answerers"
                className="inline-flex min-h-[52px] items-center border border-void px-7 text-[13px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-void hover:text-bone"
              >
                いま登録している回答者を見る
              </Link>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 6. REACTION REPORT ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Human reaction report</Eyebrow>
            <h2 className="mt-6 max-w-[16em] text-huge font-black text-void">
              多数決と、
              <br />
              一人ひとりの言葉。
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <Reveal>
              <div className="border border-void p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-5">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.16em]">
                    25–29 / Women / 5 responses
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ash">
                    見本
                  </span>
                </div>

                <div className="mt-8">
                  <ResultDistribution
                    total={5}
                    slices={[
                      { label: "Would reply", n: 4, positive: true },
                      { label: "Would not", n: 1 },
                    ]}
                  />
                </div>

                <div className="mt-9 border-t border-rule pt-6">
                  <Eyebrow>共通していた反応</Eyebrow>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {["文章自体は自然", "次回の約束まで一気に入れると少し重い"].map((t) => (
                      <li key={t} className="text-[15.5px] font-medium leading-[1.8]">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="flex flex-col gap-4">
                {SAMPLE_REACTIONS.map((r, i) => (
                  <ReactionCard key={i} r={r} tilt={i === 1 ? 0.8 : -0.8} className="max-w-none" />
                ))}

                {/* 割れていることを、悪いことにしない */}
                <div className="mt-6 border-t-2 border-void pt-7">
                  <p className="text-[40px] font-black leading-[0.9] tracking-[-0.04em] tabular-nums sm:text-[52px]">
                    60<span className="text-[0.42em] align-super">%</span>
                    <span className="mx-3 text-ash">/</span>
                    40<span className="text-[0.42em] align-super">%</span>
                  </p>
                  <p className="mt-4 text-[18px] font-bold leading-[1.6]">意見が割れました。</p>
                  <p className="mt-3 max-w-[28em] text-[14.5px] leading-[1.9] text-ash">
                    この違いから、相手によって受け取り方が変わることが分かります。
                    唯一の正解を出すサービスではありません。
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {/* ══ 7. ANSWER & EARN ══ */}
      <section className="bg-void text-bone">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow tone="lime">Your perspective has value.</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-bone">
              答える側にも、
              <br />
              返ってくる。
            </h2>
            <p className="mt-8 max-w-[28em] text-[16px] leading-[1.95] text-ash-soft sm:text-[17px]">
              専門家である必要はありません。
              あなたの年齢、経験、立場、感覚そのものに価値があります。
            </p>
          </Reveal>

          {/* 何が誰に流れているかを、言葉ではなくUIで見せる */}
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                label: "Ask",
                value: BILLING_ENABLED ? `¥${PRICE_YEN[5].toLocaleString()}` : "質問",
                note: "聞きたいことを出す",
              },
              { n: "02", label: "Match", value: "5", note: "条件に合う人へ配られる" },
              { n: "03", label: "React", value: "5", note: "実在する人が答える" },
              { n: "04", label: "Reward", value: "?", note: "回答1件ごとにお渡しします" },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <FlowStep n={s.n} label={s.label} value={s.value} note={s.note} tone="dark" />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 border border-rule-dark p-6 sm:p-8">
              <Eyebrow tone="light">料金と謝礼について</Eyebrow>
              <p className="mt-5 max-w-[34em] text-[15px] leading-[1.95] text-ash-soft">
                いまは請求していません。特定商取引法に基づく表記（事業者の氏名・所在地・
                電話番号・価格）が揃っていないためです。揃うまでは無料で、
                回答者への謝礼の金額と方法も、登録後に個別にご相談しています。
                決まっていないものを、決まったように書かないことにしています。
              </p>
              <p className="mt-5 text-[13px] leading-[1.85] text-ash-soft">
                予定している料金：3人 ¥{PRICE_YEN[3].toLocaleString()} ／ 5人 ¥
                {PRICE_YEN[5].toLocaleString()} ／ 10人 ¥{PRICE_YEN[10].toLocaleString()}
                （属性を指定する場合は上乗せ）
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10">
              <Link
                href="/join"
                className="inline-flex min-h-[58px] items-center justify-center bg-lime px-9 text-[14px] font-bold uppercase tracking-[0.12em] text-void transition-opacity hover:opacity-85"
              >
                回答者として参加する
              </Link>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 8. TRUST ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Trust</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-big font-black text-void">
              名前も連絡先も、
              <br />
              どちらにも渡らない。
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-12 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["年齢の確認", "運営が確かめた人にだけ、確認済みの印を付けます"],
                ["回答の確認", "配る前に、こちらで中身を見ています"],
                ["自動で伏せる", "電話番号・ID・住所は、送る前に伏せます"],
                ["扱わない相談", "同意のない行為・晒し・18歳未満は受け付けません"],
              ].map(([t, d]) => (
                <li key={t} className="bg-bone p-6">
                  <p className="text-[15px] font-bold">{t}</p>
                  <p className="mt-2.5 text-[13px] leading-[1.85] text-ash">{d}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <p className="mt-8 max-w-[34em] text-[13.5px] leading-[1.9] text-ash">
              回答者は、こちらが招待・確認した人だけです。いまは人数が少ないため、
              3人と5人だけ受け付けています。画像の中の文字と顔は機械では消せないので、
              画像の受け付けは、安全に扱える形が整うまで止めています。
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 9. CTA ══ */}
      <section className="bg-lime text-void">
        <Wrap className="py-24 sm:py-32">
          <Reveal>
            <Eyebrow>Real people. Real reactions.</Eyebrow>
            <p className="mt-7 text-mega font-black">
              そのLINE、
              <br />
              本当に送る？
            </p>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask"
                className="inline-flex min-h-[64px] items-center justify-center bg-void px-9 text-center text-[14px] font-bold uppercase tracking-[0.12em] text-bone transition-opacity hover:opacity-85"
              >
                人に聞いてみる
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-[64px] items-center justify-center border-2 border-void px-9 text-center text-[14px] font-bold uppercase tracking-[0.12em] text-void transition-colors hover:bg-void hover:text-lime"
              >
                回答者として参加する
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] font-bold uppercase tracking-[0.12em]">
              匿名 / 登録なしで聞ける / ベータ中につき無料
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ── フッター ── */}
      <footer className="bg-void text-bone">
        <Wrap className="py-16">
          <div className="grid gap-px border border-rule-dark bg-rule-dark sm:grid-cols-2">
            {[
              { href: "/ask", en: "Ask", ja: "人に聞く", d: "相手に近い人たちのリアルな反応を。" },
              { href: "/join", en: "Answer", ja: "回答する", d: "あなたの感覚が、誰かの判断材料になる。" },
            ].map((x) => (
              <Link key={x.href} href={x.href} className="group block bg-void p-7 sm:p-9">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-ash-soft">
                  {x.en}
                </span>
                <span className="mt-4 block text-[26px] font-black leading-[1.2] transition-colors group-hover:text-lime sm:text-[32px]">
                  {x.ja}
                </span>
                <span className="mt-3 block text-[13.5px] leading-[1.85] text-ash-soft">{x.d}</span>
              </Link>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            {[
              {
                h: "マーケットプレイス",
                items: [
                  ["/answerers", "回答者を見る"],
                  ["/articles", "記事をさがす"],
                ] as const,
              },
              {
                h: "His Recoveries",
                items: [
                  ["/about", "編集方針"],
                  ["/updates", "更新記録"],
                ] as const,
              },
              {
                h: "決まりごと",
                items: [
                  ["/disclosure", "広告と収益について"],
                  ["/privacy", "プライバシー・免責事項"],
                ] as const,
              },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-ash-soft">
                  {col.h}
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-[13.5px]">
                  {col.items.map(([href, label]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="-my-1 block py-1 text-bone/75 transition-colors hover:text-lime"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Hairline tone="dark" />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <Link href="/" className="text-[17px] font-black uppercase tracking-[0.08em]">
                His Recoveries
              </Link>
              <p className="text-[11.5px] text-ash-soft">
                © 2026 His Recoveries — Powered by AI. Answered by humans.
              </p>
            </div>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
