import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { CATEGORIES, PRICE_YEN, BILLING_ENABLED } from "@/lib/ask/model";
import {
  Eyebrow, AttributeChip, ReactionCard, ResultDistribution, Hairline,
  type Reaction,
} from "@/components/brand/kit";
import { HumanCard, type Human } from "@/components/brand/market";
import LiveMarket from "@/components/brand/LiveMarket";
import Reveal from "@/components/brand/Reveal";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── 6ブロックに絞った ────────────────────────────
//   1 Hero              2 Human Reaction Demo
//   3 C2Cの仕組み        4 Who You Ask Matters
//   5 Ask / Respond      6 Final CTA
//
// 9ブロックあったものを削った。落としたのは、
// 運営の事情・回答者が少ない理由・画像を受け付けていない技術的な理由・
// 免責の細かいところ・AI思想の長文。
//
// 消してはいない。/safety に移した。
// C2C で相手が見えない以上、「何をしないか」は探せば必ず出てくる場所に要る。
// ただし、製品が何なのかを理解する前に言い訳を読ませない。
//
// ── 無い実績を作らない ────────────────────────────
// いま回答者は0人、相談も0件、課金もしていない。
// 「128 ANSWERS」「3 / 5 responses」をそれらしく置くと、
// 偽るのはデザインではなく市場の厚みになる。
//   ・流れている件数は LiveMarket が実データから出す（0件なら0件）
//   ・見本には必ず「見本」と書く
//   ・金額には「無料」を必ず添える
// ══════════════════════════════════════════════════════════════

// 流れている相談は実データから出す。静的に焼くと、いつまでも空のままになる。
export const revalidate = 60;

export const metadata: Metadata = {
  title: "His Recoveries — そのLINE、送る前に5人に聞く。",
  description:
    "相手に近い実在の人から、リアルな反応をもらう。匿名・登録不要・ベータ期間中無料。人の視点が流通するC2Cプラットフォームです。",
  alternates: { canonical: site.url },
};

/* 見本。実在の回答者ではないので、置く場所には必ずその旨を書く */
const SAMPLE_HUMANS: Human[] = [
  { age: "25", gender: "Woman", area: "東京", attrs: ["app_user"], specialties: ["message", "date"], answered: 0 },
  { age: "27", gender: "Woman", area: "関西", attrs: ["single"], specialties: ["photo"], answered: 0 },
  { age: "26", gender: "Man", area: "東京", attrs: ["app_user"], specialties: ["signal"], answered: 0 },
];

const DEMO: Reaction[] = [
  { age: 25, attrs: ["Woman", "App User"], verdict: "Send it", positive: true, comment: "私は普通に嬉しい。" },
  { age: 27, attrs: ["Woman", "Single"], verdict: "Hmm", comment: "最後の一文だけ少し重いかも。" },
  { age: 29, attrs: ["Woman", "App User"], verdict: "Send it", positive: true, comment: "好意がある相手なら全然あり。" },
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
    name: `${site.name} — そのLINE、送る前に5人に聞く。`,
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
  };

  return (
    <div data-brand className="min-h-screen bg-bone text-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

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
              回答者について
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

      {/* ══ 1. HERO ══
          5秒で何のサービスか分かること。
          相談 → 届く → 返る を、言葉ではなくUIで置く。 */}
      <section className="border-b border-rule">
        <Wrap className="grid gap-12 pb-16 pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:pb-24 lg:pt-20">
          <div>
            <Eyebrow>You ask. Real people respond. You decide.</Eyebrow>
            <h1
              className="mt-6 font-black leading-[0.98] tracking-[-0.04em] text-void"
              style={{ fontSize: "clamp(38px, 5.4vw, 80px)" }}
            >
              そのLINE、
              <br />
              送る前に5人に聞く。
            </h1>
            <p className="mt-8 max-w-[24em] text-[17px] font-medium leading-[1.9] text-ash sm:text-[19px]">
              相手に近い実在の人から、リアルな反応をもらう。
            </p>

            <div className="mt-10">
              <Link
                href="/ask"
                className="inline-flex min-h-[64px] w-full items-center justify-center bg-void px-10 text-[15px] font-bold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-lime hover:text-void sm:w-auto"
              >
                人に聞いてみる
              </Link>
            </div>

            <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-bold uppercase tracking-[0.12em] text-ash">
              <li>匿名</li>
              <li aria-hidden>·</li>
              <li>登録不要</li>
              <li aria-hidden>·</li>
              <li>実在する回答者</li>
              {!BILLING_ENABLED && (
                <>
                  <li aria-hidden>·</li>
                  <li>ベータ期間中無料</li>
                </>
              )}
            </ul>

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

          {/* 相談 → 届く → 返る。そのまま縦に置く */}
          <Reveal>
            <div className="border border-void">
              <div className="border-b border-rule p-5">
                <Eyebrow>01 — 聞く</Eyebrow>
                <p className="mt-3 text-[16px] font-bold leading-[1.6]">
                  「このLINE、今日送っていい？」
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-1.5">
                  {["25–29", "女性", "アプリ経験あり", "5人"].map((t) => (
                    <li
                      key={t}
                      className="border border-rule px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ash"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-b border-rule bg-void p-5 text-bone">
                <Eyebrow tone="lime">02 — 届く</Eyebrow>
                <p className="mt-3 text-[14px] leading-[1.8] text-ash-soft">
                  条件に合う回答者にだけ配られます。
                  回答者どうしも、出すまで他の回答は見えません。
                </p>
              </div>

              <div className="p-5">
                <Eyebrow>03 — 返る</Eyebrow>
                <div className="mt-4">
                  <ResultDistribution
                    total={5}
                    slices={[
                      { label: "Send it", n: 4, positive: true },
                      { label: "Not yet", n: 1 },
                    ]}
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ash">
              ※ 画面の見本
            </p>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 2. HUMAN REACTION DEMO ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Human reaction report</Eyebrow>
            <h2 className="mt-6 max-w-[16em] text-huge font-black text-void">
              多数決と、
              <br />
              一人ひとりの理由。
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO.map((r, i) => (
              <Reveal key={i} delay={i * 90}>
                <ReactionCard r={r} tilt={i === 1 ? 0.8 : -0.8} className="h-full max-w-none" />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-ash">
              ※ 画面の見本。実際の回答ではありません
            </p>
          </Reveal>

          <Reveal>
            <div className="mt-14 border-t-2 border-void pt-10">
              <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-14">
                <p className="text-[44px] font-black leading-[0.9] tracking-[-0.04em] tabular-nums sm:text-[64px]">
                  60<span className="text-[0.42em] align-super">%</span>
                  <span className="mx-3 text-ash">/</span>
                  40<span className="text-[0.42em] align-super">%</span>
                </p>
                <div>
                  <p className="text-[20px] font-bold leading-[1.6] sm:text-[24px]">
                    割れることも、答えのうち。
                  </p>
                  <p className="mt-3 max-w-[30em] text-[15px] leading-[1.9] text-ash">
                    相手によって受け取り方が変わる、ということが分かります。
                    唯一の正解を出す場所ではありません。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 3. C2Cの仕組み ══ */}
      <section className="bg-void text-bone">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow tone="lime">The marketplace</Eyebrow>
            <h2 className="mt-6 text-huge font-black text-bone">人が、人に答える。</h2>
          </Reveal>

          <div className="mt-14 grid gap-px border border-rule-dark bg-rule-dark lg:grid-cols-3">
            {[
              { en: "Asker", ja: "聞きたいことを送る。", d: "誰に聞きたいかも、自分で選びます。" },
              {
                en: "His Recoveries",
                ja: "条件に合う人へ安全に届ける。",
                d: "個人情報は送る前に伏せます。扱えない相談はここで止まります。",
                mid: true,
              },
              {
                en: "Responders",
                ja: "実在する人が、自分の感覚で答える。",
                d: "専門家である必要はありません。立場と経験そのものに価値があります。",
              },
            ].map((x, i) => (
              <div key={x.en} className="bg-void p-7 sm:p-8">
                <Reveal delay={i * 100}>
                  <Eyebrow tone={x.mid ? "lime" : "light"}>{x.en}</Eyebrow>
                  <p className="mt-5 text-[19px] font-bold leading-[1.55] sm:text-[21px]">{x.ja}</p>
                  <p className="mt-4 text-[13.5px] leading-[1.9] text-ash-soft">{x.d}</p>
                </Reveal>
              </div>
            ))}
          </div>

          <Reveal>
            <p className="mt-12 max-w-[26em] text-big font-black text-bone">
              答えを決めるのは、
              <br />
              <span className="text-lime">あなたです。</span>
            </p>
          </Reveal>

          {/* AIとの違いは短く。長い思想の話はここに置かない */}
          <Reveal>
            <div className="mt-16 border-t border-rule-dark pt-10">
              <Eyebrow tone="light">AIの予測じゃない。実際の人の反応。</Eyebrow>
              <p className="mt-5 max-w-[32em] text-[15.5px] leading-[1.95] text-ash-soft">
                AIに聞けば、一般論は返ってきます。でも「25歳前後の女性が実際どう感じるか」は、
                実在する25歳前後の女性に聞くしかありません。
                AIはその手間を下げるために、裏側だけで使っています。
              </p>
            </div>
          </Reveal>
        </Wrap>
      </section>

      {/* ══ いま流れているもの（実データ）══ */}
      <section className="border-b border-rule">
        <Wrap className="py-16 sm:py-20">
          <LiveMarket tone="light" />
        </Wrap>
      </section>

      {/* ══ 4. WHO YOU ASK MATTERS ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Who you ask matters</Eyebrow>
            <h2 className="mt-6 max-w-[14em] text-huge font-black text-void">
              誰に聞くかが、
              <br />
              答えを変える。
            </h2>
            <p className="mt-8 max-w-[28em] text-[16px] leading-[1.95] text-ash sm:text-[17px]">
              誰の意見か分からない掲示板ではありません。
              個人は特定できないまま、どういう人が言ったのかは分かります。
            </p>
          </Reveal>

          <Reveal delay={90}>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {["25–29", "女性", "マッチングアプリ経験あり", "いまは恋人がいない", "5人"].map(
                (t, i) => (
                  <li key={t}>
                    <AttributeChip on={i < 3}>{t}</AttributeChip>
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_HUMANS.map((h, i) => (
              <Reveal key={i} delay={i * 90}>
                <HumanCard h={h} tilt={i === 1 ? 0.6 : -0.6} className="h-full" />
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

      {/* ══ 5. ASK / RESPOND ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-20 sm:py-28">
          <div className="grid gap-px border border-void bg-rule sm:grid-cols-2">
            <div className="bg-bone p-8 sm:p-10">
              <Reveal>
                <Eyebrow>Ask</Eyebrow>
                <p className="mt-6 text-big font-black">
                  迷った瞬間に、
                  <br />
                  相手に近い人へ聞く。
                </p>
                <p className="mt-6 max-w-[22em] text-[15px] leading-[1.95] text-ash">
                  LINEを送る前。写真を選ぶ前。デートに誘う前。30秒で聞けます。
                </p>
                <div className="mt-8">
                  <Link
                    href="/ask"
                    className="inline-flex min-h-[56px] w-full items-center justify-center bg-void px-8 text-[14px] font-bold uppercase tracking-[0.12em] text-bone transition-colors hover:bg-lime hover:text-void"
                  >
                    質問する
                  </Link>
                </div>

                {/* 課金は将来。いまは無料だと必ず添える */}
                <dl className="mt-8 divide-y divide-rule border-y border-rule">
                  {[
                    ["3人", PRICE_YEN[3]],
                    ["5人", PRICE_YEN[5]],
                    ["10人", PRICE_YEN[10]],
                  ].map(([label, yen]) => (
                    <div
                      key={String(label)}
                      className="flex items-baseline justify-between gap-3 py-2.5"
                    >
                      <dt className="text-[13.5px] text-ash">{label}に聞く</dt>
                      <dd className="text-[13.5px] font-bold tabular-nums">
                        ¥{Number(yen).toLocaleString()}
                        {!BILLING_ENABLED && (
                          <span className="ml-2.5 bg-lime px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-void">
                            無料
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[12px] leading-[1.8] text-ash">
                  いまは請求していません。詳しくは{" "}
                  <Link href="/safety" className="underline decoration-rule underline-offset-4 hover:text-void">
                    安全とできないこと
                  </Link>
                  。
                </p>
              </Reveal>
            </div>

            <div className="bg-void p-8 text-bone sm:p-10">
              <Reveal delay={120}>
                <Eyebrow tone="lime">Respond</Eyebrow>
                <p className="mt-6 text-big font-black text-bone">
                  あなたの感覚が、
                  <br />
                  誰かの判断材料になる。
                </p>
                <p className="mt-6 max-w-[22em] text-[15px] leading-[1.95] text-ash-soft">
                  専門家じゃなくていい。あなたの年齢、経験、価値観、立場そのものに
                  価値があります。1件1〜2分です。
                </p>
                <div className="mt-8">
                  <Link
                    href="/join"
                    className="inline-flex min-h-[56px] w-full items-center justify-center bg-lime px-8 text-[14px] font-bold uppercase tracking-[0.12em] text-void transition-opacity hover:opacity-85"
                  >
                    回答者について
                  </Link>
                </div>
                <p className="mt-6 text-[12.5px] leading-[1.85] text-ash-soft">
                  ご登録のあと、こちらで確認してから相談が届きます。
                  ノルマも期限もありません。
                </p>
              </Reveal>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ Safety は短く。詳細は /safety ══ */}
      <section className="border-b border-rule">
        <Wrap className="py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Eyebrow>Private by design</Eyebrow>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-ash">
                {[
                  "匿名",
                  "個人情報は非公開",
                  "回答者の属性を確認",
                  "18歳未満に関する相談は不可",
                  "非同意・晒し・特定は不可",
                ].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <Link
              href="/safety"
              className="inline-flex min-h-[48px] shrink-0 items-center border border-void px-6 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-void hover:text-bone"
            >
              詳しく
            </Link>
          </div>
        </Wrap>
      </section>

      {/* ══ 6. FINAL CTA ══ */}
      <section className="bg-lime text-void">
        <Wrap className="py-24 sm:py-32">
          <Reveal>
            <Eyebrow>Real people. Real reactions.</Eyebrow>
            <h2 className="mt-7 max-w-[14em] text-mega font-black text-void">
              相談じゃない。
              <br />
              確かめる。
            </h2>
            <p className="mt-9 max-w-[24em] text-[17px] font-medium leading-[1.9] sm:text-[19px]">
              LINEを送る前。写真を選ぶ前。デートに誘う前。関係を進める前。
              迷った瞬間に、相手側の人たちへ聞く。
            </p>
            <div className="mt-11">
              <Link
                href="/ask"
                className="inline-flex min-h-[64px] w-full items-center justify-center bg-void px-12 text-[15px] font-bold uppercase tracking-[0.12em] text-bone transition-opacity hover:opacity-85 sm:w-auto"
              >
                人に聞いてみる
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] font-bold uppercase tracking-[0.12em]">
              匿名 / 登録不要 / 実在する回答者 / ベータ期間中無料
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
              {
                href: "/join",
                en: "Respond",
                ja: "回答者について",
                d: "あなたの感覚が、誰かの判断材料になる。",
              },
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
                  ["/safety", "安全とできないこと"],
                ] as const,
              },
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
                © 2026 His Recoveries — Real people. Real reactions. Real perspectives.
              </p>
            </div>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
