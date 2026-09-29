import type { Metadata } from "next";
import { NAME } from "@/lib/voice";
import Link from "next/link";
import { site } from "@/lib/site";
import { Eyebrow, ReactionCard, Hairline } from "@/components/brand/kit";
import Reveal from "@/components/brand/Reveal";
import { Suspense } from "react";
import JoinForm from "@/components/ask/JoinForm";

// 回答する側の入口。
//
// ── 副業募集にしない ──────────────────────────────
// 「スキマ時間で」「簡単ワーク」の言葉を使わない。
// ここで渡すのは仕事ではなく、
// 「あなたの感覚が、誰かの判断材料になる」という話。
//
// ── 専門家でなくていい、を先に言う ────────────────
// 恋愛に詳しい人を集めたいわけではない。
// 普通に生活している人が、普通に感じたことに価値がある。
// そこを最初に書かないと、いちばん来てほしい人が「自分は違う」と帰る。
//
// ── 不安を後ろに回さない ──────────────────────────
// 「相手から連絡は来るのか」「名前は出るのか」「やめられるのか」。
// この3つを、フォームより前に書く。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "回答する — タシカメ" },
  description:
    "あなたの感覚が、誰かの判断材料になる。匿名で、1件1〜2分。専門家でなくて構いません。",
  alternates: { canonical: `${site.url}/join` },
};

export default function JoinPage() {
  return (
    <div data-brand className="min-h-screen bg-paper pb-28 text-slate sm:pb-0">
      {/* ヘッダー */}
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Link href="/" className="text-[14px] font-black">
            His Recoveries
          </Link>
          <Link
            href="/ask"
            className="text-[11.5px] font-bold text-steel transition-colors hover:text-slate"
          >
            聞く側はこちら
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="border-b border-line">
        <div className="mx-auto grid w-full max-w-[900px] gap-12 px-6 pb-16 pt-12 sm:px-10 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>あなたの感覚に、価値があります</Eyebrow>
            <h1 className="mt-6 text-big font-black text-slate">
              あなたの感覚が、
              <br />
              誰かの判断材料になる。
            </h1>
            <p className="mt-8 max-w-[26em] text-[16px] leading-[2] text-steel sm:text-[17px]">
              「このLINE、どう感じる？」に、思ったことを書く。それだけです。
              専門家である必要はありません。
              あなたの経験、感覚、立場そのものに価値があります。
            </p>
            <div className="mt-9">
              <Link
                href="#form"
                className="inline-flex min-h-[56px] items-center justify-center rounded-pill bg-brand px-9 text-[15.5px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover"
              >
                登録する
              </Link>
            </div>
          </div>

          <div className="lg:pt-8">
            <Reveal>
              <ReactionCard
                className="max-w-none"
                tilt={-1.5}
                float="slow"
                r={{
                  age: 26,
                  attrs: ["Woman", "App User"],
                  verdict: "Good",
                  positive: true,
                  comment: "私はこのくらいならむしろ嬉しい。",
                  helpful: 94,
                }}
              />
            </Reveal>
            <p className="mt-4 text-[10px] font-bold text-steel">
              ※ 画面の見本。相談した人にはこう見えます
            </p>
          </div>
        </div>
      </section>

      {/* ── 何をするのか ── */}
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-24">
          <Reveal>
            <Eyebrow>やること</Eyebrow>
            <h2 className="mt-6 text-big font-black text-slate">1件、1〜2分。</h2>
          </Reveal>
          <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
            {[
              { n: "01", t: "メールが届く", d: "新しい相談があるときだけ届きます。答えられないときは、そのままで構いません。" },
              { n: "02", t: "読んで、選ぶ", d: "「かなり良い」から「やめた方がいい」まで。他の人の回答は見えません。" },
              { n: "03", t: "理由を書く", d: "思ったことをそのまま。丁寧に整えなくて大丈夫です。" },
            ].map((s, i) => (
              <li key={s.n} className="bg-paper p-6 sm:p-7">
                <Reveal delay={i * 80}>
                  <span className="block text-[40px] font-black leading-[0.85] tracking-[-0.04em] tabular-nums text-steel">
                    {s.n}
                  </span>
                  <p className="mt-5 text-[17px] font-bold leading-[1.55]">{s.t}</p>
                  <p className="mt-3 text-[13.5px] leading-[1.85] text-steel">{s.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 不安を先に潰す ── */}
      <section className="bg-slate text-paper">
        <div className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-24">
          <Reveal>
            <Eyebrow tone="onDark">登録の前に</Eyebrow>
            <h2 className="mt-6 text-big font-black text-paper">
              先に、はっきりさせておきます。
            </h2>
          </Reveal>

          <dl className="mt-12 flex flex-col gap-8">
            {[
              ["相手から連絡は来ますか", "来ません。相談した人があなたに連絡する方法を、そもそも作っていません。"],
              ["名前は出ますか", "出ません。相談した人に見えるのは、あなたの年代と、選んだ属性だけです。"],
              ["やめられますか", "いつでも。届いたメールに「やめます」とだけ返してください。理由は聞きません。"],
              ["答えないとどうなりますか", "何も起きません。ノルマも、期限も、評価もありません。"],
              ["謝礼はありますか", "1件ごとにお渡しします。いまはベータ中のため、金額と方法は登録後に個別にご相談します。"],
              ["どんな相談が来ますか", "LINEの文面、写真、デートの誘い方など。同意のない行為・晒し・18歳未満に関するものは、届く前にこちらで止めています。"],
            ].map(([q, a], i) => (
              <Reveal key={q} delay={i * 60}>
                <div className="border-t border-line-dark pt-6">
                  <dt className="text-[17px] font-bold leading-[1.6]">{q}</dt>
                  <dd className="mt-3 max-w-[34em] text-[15px] leading-[1.95] text-steel-dark">{a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── フォーム ── */}
      <section id="form" className="scroll-mt-4">
        <div className="mx-auto w-full max-w-[720px] px-6 py-16 sm:px-10 sm:py-24">
          <Reveal>
            <Eyebrow>登録</Eyebrow>
            <h2 className="mt-6 text-big font-black text-slate">登録する。</h2>
            <p className="mt-6 max-w-[28em] text-[15px] leading-[1.95] text-steel">
              聞くのは4つだけです。確認が終わるまで、相談は届きません。
            </p>
          </Reveal>

          <div className="mt-12">
            {/* JoinForm は ?ref= を読む。
                読む側を Suspense で包まないと、この面が事前生成できない。 */}
            <Suspense fallback={<div className="h-[520px]" />}>
              <JoinForm />
            </Suspense>
          </div>

          <div className="mt-14">
            <Hairline />
            <p className="mt-7 max-w-[32em] text-[12.5px] leading-[1.9] text-steel">
              いただいた情報は、相談の依頼をお送りすることと、
              条件に合う方をお探しすることにだけ使います。第三者には提供しません。
              扱いの全般は{" "}
              <Link href="/privacy" className="underline decoration-line underline-offset-4 hover:text-slate">
                プライバシー・免責事項
              </Link>{" "}
              に書いています。
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-3 px-6 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:px-10">
          <div className="flex items-baseline gap-6">
            <Link href="/" className="text-[15px] font-black">
              {NAME}
            </Link>
            <Link href="/safety" className="text-[12px] text-steel transition-colors hover:text-slate">
              安全とできないこと
            </Link>
          </div>
          <p className="text-[11.5px] text-steel">
            © 2026 His Recoveries — AIは予測する。人間は反応する。
          </p>
        </div>
      </footer>
    </div>
  );
}
