import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import {
  PRICE_LINE, PRICE_WHAT, MEET_LINE, UNLIMITED_LINE, WINDOW_LINE, REPLY_LINE,
} from "@/lib/service";
import { ASK_ITEMS, FREE_UNTIL, PAID_FROM } from "@/lib/flow";
import { STANCE } from "@/lib/been";
import { CITIES, cityBySlug } from "@/lib/cities";
import { storiesOfCity } from "@/lib/stories";
import { NOT_READY_JA } from "@/lib/contact";
import LineCta from "@/components/site/LineCta";
import Mark from "@/components/brand/Mark";

/* ══════════════════════════════════════════════════
   都市ごとの相談ページ
   ══════════════════════════════════════════════════

   ── いまは、1枚も出ない ─────────────────────────
   lib/cities.ts の CITIES が空なので、generateStaticParams が
   空を返す。ページは生成されず、sitemap にも載らない。

   それでいい。
   確認できているのは「15の国・地域に行ったことがある」まで。
   どの都市へいつ行ったかは、確認が取れていない。

   こちらで推測して書けば、行っていない都市のページが
   検索結果に並ぶ。読む人には区別がつかない。

   入れ物と判定を先に作って、運営者が埋めたぶんだけ出す。

   ── この面の仕事 ────────────────────────────────
   検索から来た人を、相談につなぐ。

   「バンコク 一人旅 不安」で来た人が知りたいのは、
   一般的な注意ではなく「この人に聞いて意味があるか」。

   だから順番を、そこに合わせる。
     1 この都市へ初めて一人で行く人へ
     2 いつ、どういう旅で行ったか   ← ここが信じる根拠
     3 そのとき自分が迷ったこと      ← 具体的だから信じられる
     4 相談できる例
     5 やりとりの見本（利用イメージ）
     6 答えるのは誰か
     7 料金と条件
     8 LINEで4つ送る

   実績も口コミも無い。代わりに置けるのは、具体性だけ。 */

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = cityBySlug(params.slug);
  if (!c) return {};
  const title = `初めての${c.name}一人旅。準備と旅先の疑問を相談できます`;
  const description =
    `${c.country}・${c.name}へ初めて一人で行く方へ。実際に行ったことのある人に、` +
    `出発前はGoogle Meetで、旅行中はLINEで相談できます。${PRICE_LINE}。`;
  return {
    title: { absolute: `${title} — ${NAME}` },
    description,
    alternates: { canonical: `${site.url}/cities/${c.slug}` },
    openGraph: {
      type: "article",
      url: `${site.url}/cities/${c.slug}`,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-[19px] font-black text-slate sm:text-[21px]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const c = cityBySlug(params.slug);
  if (!c) notFound();
  const stories = storiesOfCity(c.slug);

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          <Link href="/pricing" className="text-[13px] text-steel transition-colors hover:text-slate">
            料金
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <p className="text-[12px] font-black tracking-[0.08em] text-brand">{c.country}</p>
        <h1 className="mt-2 text-big font-black leading-[1.4]">
          初めての{c.name}一人旅。
          <br />
          準備と旅先の疑問を、相談できます。
        </h1>

        <p className="mt-5 max-w-[34em] text-[15px] leading-[1.95] text-steel">
          {c.name}へ、初めて一人で行く方へ。調べれば出てくることでも、自分の日程に当てはめると
          決めきれないことがあります。実際に行ったことのある人と、そこだけ一緒に整理できます。
        </p>

        {/* ── 2. いつ、どういう旅で行ったか ──────────────
            ここがこの面のいちばん大事なところ。
            「行ったことがある」だけでは、いつの話か分からない。
            cities.ts が、ここが空のものを公開前に止める */}
        <div className="mt-8 rounded-card border border-line bg-mist p-5">
          <p className="text-[12px] font-black tracking-[0.08em] text-steel">行ったときのこと</p>
          <dl className="mt-3 flex flex-col gap-2 text-[14.5px] leading-[1.8]">
            <div className="flex gap-3">
              <dt className="w-[6em] shrink-0 text-steel">いつ</dt>
              <dd className="min-w-0 font-bold">{c.visited?.when}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-[6em] shrink-0 text-steel">どんな旅</dt>
              <dd className="min-w-0 font-bold">{c.visited?.style}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-line pt-3 text-[12.5px] leading-[1.8] text-steel">
            そのときの話です。運賃・営業時間・入国の決まりは変わっているので、
            いまの公式の案内を一緒に確かめます。
          </p>
        </div>

        <Section title={`${c.name}で、自分が迷ったこと`}>
          <ul className="flex flex-col gap-2.5">
            {c.struggles.map((t) => (
              <li
                key={t}
                className="flex items-start gap-2.5 rounded-card border border-line bg-paper px-4 py-3.5"
              >
                <span aria-hidden className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-brand" />
                <span className="min-w-0 text-[14.5px] leading-[1.8]">{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="こんなことを相談できます">
          <ul className="flex flex-col gap-2">
            {c.asks.map((t) => (
              <li
                key={t}
                className="rounded-card rounded-bl-[4px] bg-mist px-4 py-3 text-[14.5px] leading-[1.75]"
              >
                {t}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 5. やりとりの見本 ────────────────────────
            「利用イメージ」と必ず書く。
            実際の利用者のやりとりに見せない */}
        {c.example && (
          <Section title="相談すると、こうなります">
            <p className="text-[12px] font-bold text-steel">利用イメージです</p>
            <div className="mt-4 flex max-w-[28em] flex-col gap-3">
              <p className="max-w-[88%] self-end rounded-card rounded-br-[4px] bg-brand px-4 py-3 text-[13.5px] leading-[1.8] text-paper">
                {c.example.q}
              </p>
              <p className="max-w-[88%] self-start rounded-card rounded-bl-[4px] border border-line bg-paper px-4 py-3 text-[13.5px] leading-[1.8]">
                {c.example.a}
              </p>
            </div>
            <p className="mt-5 max-w-[32em] text-[14px] font-bold leading-[1.85]">
              {c.example.organized}
            </p>
          </Section>
        )}

        {stories.length > 0 && (
          <Section title={`${c.name}で、実際にあったこと`}>
            <ul className="flex flex-col gap-2.5">
              {stories.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/stories/${s.slug}`}
                    className="block rounded-card border border-line bg-paper px-4 py-4 transition-colors hover:border-brand"
                  >
                    <span className="block text-[15px] font-black leading-[1.5]">{s.title}</span>
                    <span className="mt-1 block text-[13px] leading-[1.8] text-steel">
                      {s.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="答えるのは、ひとりです">
          <p className="max-w-[34em] text-[14.5px] leading-[1.9] text-steel">{STANCE}</p>
          <p className="mt-3 text-[13px] leading-[1.85] text-steel">
            <Link
              href="/about"
              className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px]"
            >
              何を確認していて、何を確認していないか
            </Link>
          </p>
        </Section>

        <Section title="料金">
          <div className="rounded-card border-2 border-brand bg-paper p-5">
            <p className="text-[22px] font-black tabular-nums leading-none">{PRICE_LINE}</p>
            <p className="mt-2 text-[14px] font-bold leading-[1.6]">{PRICE_WHAT}</p>
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13.5px] leading-[1.8] text-steel">
              <li>{MEET_LINE}</li>
              <li>{UNLIMITED_LINE}</li>
              <li>{WINDOW_LINE}</li>
              <li>{REPLY_LINE}</li>
            </ul>
          </div>
          <p className="mt-3 text-[13px] leading-[1.85] text-steel">
            緊急時の対応、予約や手配の代行は含みません。
            <Link
              href="/pricing"
              className="ml-1 font-bold text-brand underline decoration-brand/40 underline-offset-[4px]"
            >
              含むもの・含まないもの
            </Link>
          </p>
        </Section>

        {/* ── 8. LINEで4つ送る ──────────────────────── */}
        <section className="mt-12 rounded-card bg-brand p-6 text-paper sm:p-8">
          <h2 className="text-[20px] font-black leading-[1.5]">
            {c.name}の相談ができるか、
            <br />
            聞いてください。
          </h2>
          <ol className="mt-5 flex flex-col gap-1.5">
            {ASK_ITEMS.map((a, i) => (
              <li key={a.label} className="flex items-start gap-2 text-[13.5px] leading-[1.7]">
                <span aria-hidden className="font-black text-paper/70">{i + 1}</span>
                <span className="min-w-0 font-bold">{a.label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 max-w-[24em]">
            <LineCta
              where="city"
              label="LINEで対応できるか聞く"
              notReady={NOT_READY_JA}
              className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-paper px-8 text-[16px] font-bold text-brand-deep"
              notReadyClassName="rounded-card border border-dashed border-paper/50 px-4 py-3.5 text-[13.5px] leading-[1.8] text-paper/90"
            />
            <p className="mt-2.5 text-[12px] leading-[1.75] text-paper/90">
              {FREE_UNTIL}。{PAID_FROM}。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
