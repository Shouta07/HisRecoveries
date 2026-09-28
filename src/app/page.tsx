import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES } from "@/lib/ask/model";
import {
  Eyebrow, AttributeChip, ReactionCard, ResultDistribution, Stat, Hairline,
  type Reaction,
} from "@/components/brand/kit";
import Reveal from "@/components/brand/Reveal";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── 何に見せるか ──────────────────────────────────
// 恋愛相談サイトに見せない。AIサービスにも見せない。
// 「人間の反応を測るプロダクト」に見せる。
//
// Editorial（大胆なタイポグラフィ）
//   × Dating App（触りたくなるUI）
//   × Human Research Lab（属性・分布・A/B）
//
// ── ここに出す数字は、全部つくりもの ────────────────
// 実績がまだ無いので、出せる実数は1つも無い。
// だから数字を出す場所には、必ず「見本」と書く。
// 「94% HELPFUL」を実績のように置いた瞬間、このサイトは嘘になる。
//
// ── ライムの扱い ──────────────────────────────────
// 明るい地の上では面としてだけ使う（文字にすると 1.04:1 で読めない）。
// 黒の面の上でだけ、文字色に使う。
//
// ── 構成 ──────────────────────────────────────────
//   1 Hero            2 AI vs HUMAN     3 Reaction Report
//   4 Who You Ask     5 A/B TEST        6 How It Works
//   7 Private         8 CTA
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "His Recoveries — AIに聞く前に、人に聞く。",
  description:
    "そのLINE、その写真、その誘い方。相手に近い人たちのリアルな反応を、匿名で確かめられます。AIは予測する。His Recoveries は、人間の反応を測る。",
  alternates: { canonical: site.url },
};

/* 見本に使う反応。実在の回答ではないので、置く場所には必ずその旨を書く */
const SAMPLE: Reaction[] = [
  {
    age: 25,
    attrs: ["Woman", "App User", "Tokyo"],
    verdict: "Good",
    positive: true,
    comment: "私は全然あり。むしろこれくらい来てほしい。",
    helpful: 94,
  },
  {
    age: 27,
    attrs: ["Woman", "App User"],
    verdict: "Hmm",
    comment: "前半はいいけど、最後の2行は少し長いかも。",
    helpful: 88,
  },
  {
    age: 24,
    attrs: ["Woman", "Single"],
    verdict: "Good",
    positive: true,
    comment: "次も会いたい相手なら、普通に嬉しいと思う。",
    helpful: 91,
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
          <nav aria-label="サイト" className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/articles"
              className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-ash transition-colors hover:text-void sm:inline"
            >
              Read
            </Link>
            <Link
              href="/join"
              className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-ash transition-colors hover:text-void sm:inline"
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
        <Wrap className="grid gap-14 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-20">
          <div>
            <Eyebrow>Don&rsquo;t guess. Ask.</Eyebrow>
            <h1 className="mt-6 text-mega font-black text-void">
              AIに聞く前に、
              <br />
              人に聞く。
            </h1>
            <p className="mt-8 max-w-[24em] text-[17px] font-medium leading-[1.9] text-ash sm:text-[19px]">
              このLINE、この写真、この誘い方。
              <br />
              相手に近い人たちの、リアルな反応を確かめよう。
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/ask"
                className="inline-flex min-h-[62px] items-center justify-center bg-void px-10 text-[15px] font-bold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-lime hover:text-void"
              >
                人に聞いてみる
              </Link>
              <Link
                href="#how"
                className="inline-flex min-h-[44px] items-center text-[13px] font-bold uppercase tracking-[0.16em] text-ash underline decoration-rule underline-offset-[6px] transition-colors hover:text-void"
              >
                How it works
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

          {/* 回答カード。
              広い画面では浮かせて重ねる。整列しすぎると資料に見えるので少し傾ける。
              スマホでは重ねない。幅が足りず、下のカードが上のカードを隠してしまう。
              「動いて見えること」より「読めること」を優先する。 */}
          <div className="relative flex flex-col gap-4 lg:block lg:min-h-[540px]">
            <div className="w-full lg:absolute lg:left-0 lg:top-0 lg:max-w-[300px]">
              <Reveal delay={0}>
                <ReactionCard r={SAMPLE[0]} tilt={-2} float="normal" className="max-w-none lg:max-w-[300px]" />
              </Reveal>
            </div>
            <div className="w-full lg:absolute lg:right-0 lg:top-[150px] lg:max-w-[290px]">
              <Reveal delay={140}>
                <ReactionCard r={SAMPLE[1]} tilt={1.6} float="slow" className="max-w-none lg:max-w-[290px]" />
              </Reveal>
            </div>
            <div className="w-full lg:absolute lg:bottom-6 lg:left-[7%] lg:max-w-[295px]">
              <Reveal delay={280}>
                <ReactionCard r={SAMPLE[2]} tilt={-1.2} float="normal" className="max-w-none lg:max-w-[295px]" />
              </Reveal>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ash lg:absolute lg:bottom-0 lg:right-0">
              ※ 画面の見本
            </p>
          </div>
        </Wrap>
      </section>

      {/* ══ 2. AI vs HUMAN ══ */}
      <section className="bg-void text-bone">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow tone="lime">One AI answer. Many human reactions.</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-bone">
              AIは答えを出す。
              <br />
              人間は、違う。
            </h2>
            <p className="mt-7 max-w-[26em] text-[16px] leading-[1.95] text-ash-soft sm:text-[17px]">
              その違いこそが、知りたいことになる。
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="border border-rule-dark p-6 sm:p-8">
                <Eyebrow tone="light">AI</Eyebrow>
                <p className="mt-6 text-[19px] font-medium leading-[1.85] sm:text-[21px]">
                  「一般的には、好意的に受け取られる可能性があります。」
                </p>
                <p className="mt-8 border-t border-rule-dark pt-5 text-[13px] leading-[1.85] text-ash-soft">
                  もっともらしく、外れてもいない。でも、あなたが送る相手のことは
                  何ひとつ知らないまま書かれています。
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="border border-lime p-6 sm:p-8">
                <Eyebrow tone="lime">Real people</Eyebrow>
                <ul className="mt-6 flex flex-col gap-4">
                  {[
                    "私は嬉しい",
                    "ちょっと重い",
                    "相手による",
                    "私は返信しないかも",
                    "むしろ具体的に誘ってほしい",
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
                <p className="mt-8 border-t border-rule-dark pt-5 text-[13px] leading-[1.85] text-ash-soft">
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
              <span className="text-lime">人間は反応する。</span>
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 3. HUMAN REACTION REPORT ══ */}
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
                  <span className="text-[12px] font-bold uppercase tracking-[0.16em]">
                    25–29 / Women / 5 people
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ash">
                    見本
                  </span>
                </div>

                <div className="mt-8">
                  <ResultDistribution
                    total={5}
                    slices={[
                      { label: "Send it", n: 4, positive: true },
                      { label: "Not for me", n: 1 },
                    ]}
                  />
                </div>

                <div className="mt-9 border-t border-rule pt-6">
                  <Eyebrow>共通していた反応</Eyebrow>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {[
                      "文章自体は自然",
                      "次回の約束まで一気に入れると少し重い",
                    ].map((t) => (
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
                {SAMPLE.map((r, i) => (
                  <ReactionCard key={i} r={r} tilt={i === 1 ? 1 : -0.8} className="max-w-none" />
                ))}
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ash">
                  ※ 画面の見本。実際の回答ではありません
                </p>
              </div>
            </Reveal>
          </div>

          {/* ばらつきを良くないことにしない */}
          <Reveal>
            <div className="mt-16 border-t border-void pt-10">
              <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-14">
                <p className="text-[40px] font-black leading-[0.9] tracking-[-0.04em] tabular-nums sm:text-[64px]">
                  60<span className="text-[0.44em] align-super">%</span>
                  <span className="mx-3 text-ash">/</span>
                  40<span className="text-[0.44em] align-super">%</span>
                </p>
                <div>
                  <p className="text-[19px] font-bold leading-[1.6] sm:text-[22px]">
                    意見が割れました。
                  </p>
                  <p className="mt-3 max-w-[30em] text-[15px] leading-[1.9] text-ash">
                    この違いから、相手によって受け取り方が変わることが分かります。
                    His Recoveries は、唯一の正解を出すサービスではありません。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 4. WHO YOU ASK MATTERS ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Who you ask matters</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-void">誰に聞くかで、
              <br />
              答えは変わる。
            </h2>
            <p className="mt-8 max-w-[28em] text-[16px] leading-[1.95] text-ash sm:text-[17px]">
              「誰か女性に聞いた」と「気になっている相手に近い5人に聞いた」は、
              同じ回答数でも、受け取り方がまるで違います。
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-12 flex flex-wrap gap-2.5">
              {[
                ["25–29", true],
                ["Women", true],
                ["Dating app user", true],
                ["Single", false],
                ["Tokyo", false],
                ["5 people", true],
              ].map(([label, on]) => (
                <li key={String(label)}>
                  <AttributeChip on={Boolean(on)}>{label}</AttributeChip>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-14 grid gap-10 border-t border-rule pt-12 sm:grid-cols-3">
              <Stat value="25–29" label="Age band" />
              <Stat value={5} unit="" label="People" />
              <Stat value="2" unit="" label="Conditions" />
            </div>
            <p className="mt-6 text-[14px] leading-[1.9] text-ash">
              いま選べる条件は「マッチングアプリ経験あり」「いまは恋人がいない」の2つだけです。
              回答してくれる人が増えるごとに増やします。
              選べるのに集まらない状態を作らないためです。
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 5. A/B TEST ══ */}
      <section className="bg-void text-bone">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow tone="lime">Which one?</Eyebrow>
            <h2 className="mt-6 text-huge font-black text-bone">
              2つで迷ったら、
              <br />
              <span className="text-lime">聞いて決める。</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {[
              { l: "A", n: 3, w: false },
              { l: "B", n: 7, w: true },
            ].map((x) => (
              <Reveal key={x.l} delay={x.l === "B" ? 120 : 0}>
                <div
                  className={`flex h-full flex-col justify-between border p-6 sm:p-8 ${
                    x.w ? "border-lime" : "border-rule-dark"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[72px] font-black leading-[0.8] tracking-[-0.05em] sm:text-[96px]">
                      {x.l}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] ${
                        x.w ? "bg-lime text-void" : "border border-rule-dark text-ash-soft"
                      }`}
                    >
                      Profile {x.l}
                    </span>
                  </div>
                  <div className="mt-10">
                    <span
                      className={`block text-[52px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums sm:text-[68px] ${
                        x.w ? "text-lime" : "text-ash-soft"
                      }`}
                    >
                      {x.n * 10}
                      <span className="text-[0.4em] align-super">%</span>
                    </span>
                    <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-ash-soft">
                      {x.n} / 10 people
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-12 border-t border-rule-dark pt-10">
              <Eyebrow tone="lime">Why?</Eyebrow>
              <ul className="mt-6 flex flex-col gap-4">
                {["Bの方が自然", "Aは少しキメすぎ", "Bの方が会ってみたい"].map((t, i) => (
                  <li
                    key={t}
                    className="text-[19px] font-medium leading-[1.6] sm:text-[22px]"
                    style={{ paddingLeft: `${i * 18}px` }}
                  >
                    「{t}」
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-ash-soft">
                ※ 画面の見本
              </p>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 6. HOW IT WORKS ══ */}
      <section id="how" className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-6 text-huge font-black text-void">4ステップ。</h2>
          </Reveal>

          <ol className="mt-14 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", en: "Ask", ja: "聞きたいことを送る。", d: "カテゴリを選んで書くだけ。30秒。" },
              { n: "02", en: "Choose", ja: "誰に聞くか選ぶ。", d: "年代と、近い条件を指定する。" },
              { n: "03", en: "React", ja: "実在する人が答える。", d: "回答者どうしも、出すまで他は見えない。" },
              { n: "04", en: "Decide", ja: "結果を見て、自分で決める。", d: "送る。変える。待つ。やめる。" },
            ].map((s, i) => (
              <li key={s.n} className="bg-bone p-6 sm:p-7">
                <Reveal delay={i * 90}>
                  <span className="block text-[46px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums text-ash">
                    {s.n}
                  </span>
                  <span className="mt-5 block text-[11px] font-bold uppercase tracking-[0.2em] text-ash">
                    {s.en}
                  </span>
                  <p className="mt-2.5 text-[17px] font-bold leading-[1.55]">{s.ja}</p>
                  <p className="mt-3 text-[13.5px] leading-[1.85] text-ash">{s.d}</p>
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

      {/* ══ 7. PRIVATE BY DESIGN ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Private by design</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-big font-black text-void">
              名前も連絡先も、
              <br />
              どちらにも渡らない。
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <ul className="mt-12 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["匿名", "相談者も回答者も、名前を出しません"],
                ["自動で伏せる", "電話番号・ID・住所は、送る前に伏せます"],
                ["登録なし", "アカウントを作らずに使えます"],
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
              回答しているのは、こちらが招待した女性メンバーです。いまは人数が少ないため、
              3人と5人だけ受け付けています。画像の中の文字と顔は機械では消せないので、
              画像の受け付けは、安全に扱える形が整うまで止めています。
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 8. CTA ══ */}
      <section className="bg-lime text-void">
        <Wrap className="py-24 sm:py-32">
          <Reveal>
            <Eyebrow>Real people. Real reactions.</Eyebrow>
            <p className="mt-7 text-mega font-black">
              そのLINE、
              <br />
              本当に送る？
            </p>
            <p className="mt-9 max-w-[24em] text-[17px] font-medium leading-[1.9] sm:text-[19px]">
              一人で考えるより、聞いたほうが早い。30秒で聞けます。
            </p>
            <div className="mt-11">
              <Link
                href="/ask"
                className="inline-flex min-h-[64px] items-center justify-center bg-void px-12 text-[15px] font-bold uppercase tracking-[0.14em] text-bone transition-opacity hover:opacity-85"
              >
                人に聞いてみる
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] font-bold uppercase tracking-[0.14em]">
              匿名 / 登録なし / ベータ中につき無料
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ── フッター ──
          以前はここに33本のリンクが並んでいた（分野6・状況9・読みもの7・運営8＋）。
          トップの最後で読む人に、33の行き先は多すぎる。
          いちばん押してほしいもの（聞く／答える）が、同じ大きさで埋もれていた。

          8本に絞った。外したものは消えていない。
          記事20ルートには従来どおりのフッター（components/Footer.tsx）が出るので、
          分野・状況・調査・プランへの内部リンクはサイト内に残っている。
          ここから外したのは露出であって、リンクそのものではない。 */}
      <footer className="bg-void text-bone">
        <Wrap className="py-16">
          {/* 押してほしい2つを、先に大きく置く */}
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
                h: "読みもの",
                items: [
                  ["/articles", "記事をさがす"],
                  ["/app", "出会ったあとの記録"],
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
                © 2026 His Recoveries — AIは予測する。人間は反応する。
              </p>
            </div>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
