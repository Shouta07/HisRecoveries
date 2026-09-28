import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, PRICE_YEN, BILLING_ENABLED } from "@/lib/ask/model";
import { AttributeChip, ReactionCard, ResultDistribution, type Reaction } from "@/components/brand/kit";
import { HumanCard, type Human } from "@/components/brand/market";
import LiveMarket from "@/components/brand/LiveMarket";
import Reveal from "@/components/brand/Reveal";
import Tashikame from "@/components/brand/Tashikame";
import Says from "@/components/brand/Says";
import Ticker from "@/components/brand/Ticker";
import { INVITE } from "@/lib/tashikame";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── B2Bに見えていたのを直す ──────────────────────
// 直前の版は、角が全部 0px、ラベルが英字の大文字、
// 見出しが 80〜132px、黒い面が5つ、影なしの細い罫線。
// これは広告代理店やSaaSの見た目で、消費者向けのC2Cには硬すぎた。
//
// 変えたこと
//   角丸      0px → カード16px / ボタンはピル
//   ラベル    英字の大文字 → 日本語
//   見出し    最大132px → 最大52px
//   黒い面    5つ → 0（アクセントはライムのカード1枚）
//   影        無し → やわらかい影（濃くしない。濃いと管理画面に戻る）
//   タシカメ  1箇所 → 各所。声で案内させる
//
// ── 変えていないこと ──────────────────────────────
// 実績を作らない。流れている件数は実データ（0件なら0件）。
// 見本には「見本」と書く。金額には「いまは無料」を添える。
// ══════════════════════════════════════════════════════════════

export const revalidate = 60;

export const metadata: Metadata = {
  title: "His Recoveries — そのLINE、送る前に5人に聞く。",
  description:
    "相手に近い実在の人から、リアルな反応をもらう。匿名・登録不要・ベータ期間中無料。人の本音を、タシカメる。",
  alternates: { canonical: site.url },
};

const SAMPLE_HUMANS: Human[] = [
  { age: "25", gender: "女性", area: "東京", attrs: ["app_user"], specialties: ["message", "date"], answered: 0 },
  { age: "27", gender: "女性", area: "関西", attrs: ["single"], specialties: ["photo"], answered: 0 },
  { age: "26", gender: "男性", area: "東京", attrs: ["app_user"], specialties: ["signal"], answered: 0 },
];

const DEMO: Reaction[] = [
  { age: 25, attrs: ["女性", "アプリ経験あり"], verdict: "送っていい", positive: true, comment: "私は普通に嬉しい。" },
  { age: 27, attrs: ["女性", "恋人なし"], verdict: "うーん", comment: "最後の一文だけ少し重いかも。" },
  { age: 29, attrs: ["女性", "アプリ経験あり"], verdict: "送っていい", positive: true, comment: "好意がある相手なら全然あり。" },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1100px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Head({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div>
      <h2 className="text-big font-black text-void">{children}</h2>
      {note && <p className="mt-3 max-w-[30em] text-[15px] leading-[1.9] text-ash">{note}</p>}
    </div>
  );
}

export default function HomePage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — そのLINE、送る前に5人に聞く。`,
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
  };

  return (
    <div data-brand className="min-h-screen bg-bone text-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 border-b border-rule bg-bone/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Tashikame size={30} />
            <span className="whitespace-nowrap text-[15.5px] font-black tracking-[0.01em]">
              His Recoveries
            </span>
          </Link>
          <nav aria-label="サイト" className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/join"
              className="hidden whitespace-nowrap text-[13.5px] font-bold text-ash transition-colors hover:text-void sm:inline"
            >
              答える人になる
            </Link>
            <Link
              href="/ask"
              className="inline-flex min-h-[42px] shrink-0 items-center whitespace-nowrap rounded-pill bg-lime px-5 text-[13.5px] font-bold text-void shadow-card transition-shadow hover:shadow-card-hover"
            >
              聞いてみる
            </Link>
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. HERO ══ */}
      <section>
        <Wrap className="grid gap-10 pb-12 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-16">
          <div>
            <p className="flex items-center gap-2">
              <Tashikame size={26} />
              <span className="text-[13.5px] font-bold text-ash">{INVITE.ask.text}</span>
            </p>

            <h1 className="mt-5 text-mega font-black text-void">
              そのLINE、
              <br />
              送る前に5人に聞く。
            </h1>

            {/* 説明を2行に詰める。読ませるより、先に押させる。 */}
            <p className="mt-5 text-[17px] font-bold leading-[1.75] text-ash sm:text-[19px]">
              AIは、一般論。
              <br />
              ほしいのは、本音。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ask"
                className="inline-flex min-h-[58px] items-center justify-center rounded-pill bg-lime px-9 text-[16.5px] font-bold text-void shadow-card transition-shadow hover:shadow-card-hover"
              >
                30秒で聞いてみる
              </Link>
              <Link
                href="/join"
                className="inline-flex min-h-[56px] items-center justify-center rounded-pill border border-rule bg-card px-9 text-[16px] font-bold text-void shadow-card transition-shadow hover:shadow-card-hover"
              >
                答える人になる
              </Link>
            </div>

            {/* 数字を絵として出す。説明より速い */}
            <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
              {[
                ["30秒", "で聞ける"],
                ["5人", "が答える"],
                [BILLING_ENABLED ? "¥890" : "¥0", BILLING_ENABLED ? "5人に聞く" : "ベータ中は無料"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="text-[30px] font-black leading-none tracking-[-0.03em] tabular-nums sm:text-[36px]">
                    {n}
                  </dt>
                  <dd className="mt-1.5 text-[12.5px] text-ash">{label}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-[12.5px] text-ash">匿名 · 登録不要 · 答えるのは実在の人</p>
          </div>

          {/* 聞く → 届く → 返る。1枚のカードに */}
          <Reveal>
            <div className="overflow-hidden rounded-card border border-rule bg-card shadow-card">
              <div className="border-b border-rule p-5">
                <p className="text-[12.5px] font-bold text-ash">1. 聞く</p>
                <p className="mt-2.5 text-[16px] font-bold leading-[1.6]">
                  「このLINE、今日送っていい？」
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {["25〜29歳", "女性", "アプリ経験あり", "5人"].map((t) => (
                    <li key={t} className="rounded-pill bg-bone-soft px-2.5 py-1 text-[11.5px] text-ash">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 border-b border-rule bg-bone-soft p-5">
                <Tashikame size={40} mood="going" />
                <div>
                  <p className="text-[12.5px] font-bold text-ash">2. 届く</p>
                  <p className="mt-1 text-[14px] leading-[1.75] text-ash">
                    条件に合う人にだけ配られます。
                  </p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-[12.5px] font-bold text-ash">3. 返る</p>
                <div className="mt-4">
                  <ResultDistribution
                    total={5}
                    slices={[
                      { label: "送っていい", n: 4, positive: true },
                      { label: "ちょっと待った", n: 1 },
                    ]}
                  />
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] text-ash">※ 画面の見本</p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 質問の例が流れる帯 ══
          説明を3行読ませるより、「このLINE、重い？」が流れているほうが速い。
          ここに並ぶのは聞けることの例で、誰かが実際に聞いた相談ではない。 */}
      <section className="border-t border-rule bg-bone-soft py-8 sm:py-10">
        <Wrap className="mb-4">
          <p className="text-[13px] font-bold text-ash">たとえば、こんなこと。</p>
        </Wrap>
        <Ticker />
      </section>

      {/* ══ 2. カテゴリから ══ */}
      <section className="border-t border-rule bg-bone-soft">
        <Wrap className="py-12 sm:py-16">
          <Head>何を、タシカメる？</Head>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ask?c=${c.id}`}
                  className="flex h-full flex-col rounded-card border border-rule bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <span className="text-[15px] font-bold leading-[1.5]">{c.label}</span>
                  <span className="mt-2 text-[12.5px] leading-[1.75] text-ash">{c.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      {/* ══ 3. タシカメ ══ */}
      <section className="border-t border-rule">
        <Wrap className="py-14 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <div className="flex items-end gap-4">
                <Tashikame size={104} mood="report" />
                <Tashikame size={68} mood="thinking" className="mb-1" />
                <Tashikame size={52} mood="idle" />
              </div>
              <p className="mt-5 text-[13px] font-bold text-ash">タシカメ / TASHIKAME</p>
            </Reveal>

            <Reveal delay={110}>
              <Head>人の本音を、タシカメる。</Head>
              <div className="mt-5 flex max-w-[28em] flex-col gap-4 text-[15.5px] leading-[1.95] text-ash">
                <p>
                  タシカメは、答えを出しません。
                  あなたの代わりにいろんな人へ聞いて、リアルな反応を集めてきます。
                </p>
                <p>
                  <strong className="font-bold text-void">
                    正解じゃない。人の反応を、集めてくる。
                  </strong>
                </p>
              </div>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {/* ══ 4. どう返ってくるか ══ */}
      <section className="border-t border-rule bg-bone-soft">
        <Wrap className="py-14 sm:py-20">
          <Head note="何人がどう言ったか。そして、なぜそう思ったか。">
            数字と、理由。両方くる。
          </Head>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO.map((r, i) => (
              <Reveal key={i} delay={i * 80}>
                <ReactionCard r={r} className="h-full max-w-none" />
              </Reveal>
            ))}
          </div>
          <p className="mt-4 text-[11.5px] text-ash">※ 画面の見本。実際の回答ではありません</p>

          <Reveal>
            <div className="mt-8 rounded-card border border-rule bg-card p-5 shadow-card sm:p-7">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <p className="text-[30px] font-black leading-none tracking-[-0.03em] tabular-nums sm:text-[40px]">
                  60<span className="text-[0.45em] align-super">%</span>
                  <span className="mx-2 text-ash">/</span>
                  40<span className="text-[0.45em] align-super">%</span>
                </p>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-bold leading-[1.6]">割れることも、答えのうち。</p>
                  <p className="mt-2 max-w-[28em] text-[14px] leading-[1.85] text-ash">
                    相手によって受け取り方が変わる、ということが分かります。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 5. いま流れているもの（実データ）══ */}
      <section className="border-t border-rule">
        <Wrap className="py-12 sm:py-16">
          <LiveMarket tone="light" />
        </Wrap>
      </section>

      {/* ══ 6. 誰に聞くか ══ */}
      <section className="border-t border-rule bg-bone-soft">
        <Wrap className="py-14 sm:py-20">
          <Head note="誰の意見か分からない掲示板とは違います。名前は出ないまま、どういう人かは分かります。">
            誰に聞くかで、変わる。
          </Head>

          <Reveal delay={80}>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["25〜29歳", "女性", "マッチングアプリ経験あり", "いまは恋人がいない", "5人"].map(
                (t, i) => (
                  <li key={t}>
                    <AttributeChip on={i < 3}>{t}</AttributeChip>
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_HUMANS.map((h, i) => (
              <Reveal key={i} delay={i * 80}>
                <HumanCard h={h} className="h-full" />
              </Reveal>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[11.5px] text-ash">※ 画面の見本。実在の回答者ではありません</p>
            <Link
              href="/answerers"
              className="inline-flex min-h-[46px] items-center rounded-pill border border-rule bg-card px-6 text-[13.5px] font-bold shadow-card transition-shadow hover:shadow-card-hover"
            >
              いる人を見る
            </Link>
          </div>
        </Wrap>
      </section>

      {/* ══ 7. 聞く / 答える ══ */}
      <section className="border-t border-rule">
        <Wrap className="py-14 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col rounded-card border border-rule bg-card p-6 shadow-card sm:p-8">
                <p className="text-[13px] font-bold text-ash">聞く人</p>
                <p className="mt-4 text-[22px] font-black leading-[1.45]">
                  迷った瞬間に、
                  <br />
                  相手に近い人へ。
                </p>
                <p className="mt-4 text-[14.5px] leading-[1.9] text-ash">
                  送る前に。選ぶ前に。誘う前に。30秒で聞けます。
                </p>

                <dl className="mt-6 flex flex-col gap-1.5">
                  {[
                    ["3人に聞く", PRICE_YEN[3]],
                    ["5人に聞く", PRICE_YEN[5]],
                    ["10人に聞く", PRICE_YEN[10]],
                  ].map(([label, yen]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between gap-3 rounded-soft bg-bone-soft px-3.5 py-2.5"
                    >
                      <dt className="text-[13.5px] text-ash">{label}</dt>
                      <dd className="text-[13.5px] font-bold tabular-nums">
                        ¥{Number(yen).toLocaleString()}
                        {!BILLING_ENABLED && (
                          <span className="ml-2 rounded-pill bg-lime px-2 py-0.5 text-[11px] font-bold text-void">
                            いまは無料
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex-1" />
                <Link
                  href="/ask"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-pill bg-lime px-8 text-[15.5px] font-bold text-void shadow-card transition-shadow hover:shadow-card-hover"
                >
                  聞いてみる
                </Link>
              </div>
            </Reveal>

            <Reveal delay={110}>
              <div className="flex h-full flex-col rounded-card border border-rule bg-card p-6 shadow-card sm:p-8">
                <p className="text-[13px] font-bold text-ash">答える人</p>
                <p className="mt-4 text-[22px] font-black leading-[1.45]">
                  あなたの感覚が、
                  <br />
                  誰かの判断材料になる。
                </p>
                <p className="mt-4 text-[14.5px] leading-[1.9] text-ash">
                  専門家じゃなくていい。年齢、経験、価値観、立場そのものに価値があります。
                  1件1〜2分です。
                </p>

                <div className="mt-6">
                  <Says text={INVITE.join.text} mood={INVITE.join.mood} size={44} />
                </div>

                <div className="mt-6 flex-1" />
                <Link
                  href="/join"
                  className="inline-flex min-h-[54px] items-center justify-center rounded-pill bg-void px-8 text-[15.5px] font-bold text-bone transition-opacity hover:opacity-90"
                >
                  答える人になる
                </Link>
              </div>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {/* ══ 8. 安全（短く）══ */}
      <section className="border-t border-rule bg-bone-soft">
        <Wrap className="py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-2 text-[13px] text-ash">
              {[
                "匿名",
                "個人情報は非公開",
                "回答者の属性を確認",
                "18歳未満に関する相談は不可",
                "晒し・特定は不可",
              ].map((t) => (
                <li key={t} className="rounded-pill bg-card px-3 py-1.5 shadow-card">
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/safety"
              className="inline-flex min-h-[44px] shrink-0 items-center text-[13.5px] font-bold text-ash underline decoration-rule underline-offset-4 transition-colors hover:text-void"
            >
              詳しく
            </Link>
          </div>
        </Wrap>
      </section>

      {/* ══ 9. 最後 ══ */}
      <section className="border-t border-rule">
        <Wrap className="py-16 sm:py-24">
          <div className="rounded-card bg-lime p-8 text-void shadow-card sm:p-14">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2.5">
                  <Tashikame size={34} tone="lime" />
                  <span className="text-[13.5px] font-bold">{INVITE.ask.text}</span>
                </p>
                <p className="mt-5 text-huge font-black">
                  相談じゃない。
                  <br />
                  確かめる。
                </p>
                <p className="mt-4 max-w-[22em] text-[16px] font-bold leading-[1.85]">
                  送る前に。選ぶ前に。誘う前に。
                </p>
              </div>
              <Link
                href="/ask"
                className="inline-flex min-h-[60px] shrink-0 items-center justify-center rounded-pill bg-void px-10 text-[16.5px] font-bold text-bone transition-opacity hover:opacity-85"
              >
                30秒で聞いてみる
              </Link>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ── フッター ── */}
      <footer className="border-t border-rule bg-bone-soft">
        <Wrap className="py-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {[
              {
                h: "使う",
                items: [
                  ["/ask", "聞いてみる"],
                  ["/join", "答える人になる"],
                  ["/answerers", "いる人を見る"],
                ] as const,
              },
              {
                h: "知る",
                items: [
                  ["/safety", "安全とできないこと"],
                  ["/articles", "記事をさがす"],
                  ["/app", "出会ったあとの記録"],
                ] as const,
              },
              {
                h: "運営",
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
                <p className="text-[12.5px] font-bold text-ash">{col.h}</p>
                <ul className="mt-3.5 flex flex-col gap-2 text-[13.5px]">
                  {col.items.map(([href, label]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="-my-1 block py-1 text-void/75 transition-colors hover:text-void"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-7 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Tashikame size={26} />
              <span className="text-[15px] font-black">His Recoveries</span>
            </Link>
            <p className="text-[12px] text-ash">© 2026 His Recoveries — 人の本音を、タシカメる。</p>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
