import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import FounderTimeline from "@/components/FounderTimeline";
import { site } from "@/lib/site";

const url = `${site.url}/recoveries`;

export const metadata: Metadata = {
  title: "Three Recoveries — His Recoveries の三幕",
  description:
    "His Recoveries はなぜ複数形か。Body / Practice / Self ── 男性の回復を三つの幕として並べた、ブランドの中心の物語。多汗症のボトックス、ワキガ手術、ニキビ跡の通院、それから残った自意識。処置の時代、所作の時代、余白の時代。",
  keywords: [
    "His Recoveries",
    "Male Conditioning",
    "男性の回復",
    "Three Recoveries",
    "Recover Your Presence",
    "回復",
    "整える",
    "多汗症",
    "ワキガ",
    "ニキビ跡",
  ],
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    title: `Three Recoveries — ${site.name}`,
    description:
      "Body / Practice / Self。男性の回復を三幕として並べた、ブランドの物語。",
    url,
  },
};

export default function RecoveriesPage() {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: "Three Recoveries — His Recoveries の三幕",
    description:
      "Body / Practice / Self ── 男性の回復を三つの幕として並べた、ブランドの中心の物語。",
    inLanguage: site.language,
    author: { "@id": `${site.url}/#publisher` },
    publisher: { "@id": `${site.url}/#publisher` },
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Three Recoveries", item: url },
    ],
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ─────────────────────────────────────────
         Overture
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-20 sm:pt-32 pb-20 sm:pb-28 text-center">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          Three Recoveries
        </p>
        <h1 className="mt-7 font-mincho text-4xl sm:text-6xl lg:text-7xl text-ink leading-[1.15]">
          三つの回復について
        </h1>
        <div className="mt-10 flex justify-center">
          <span aria-hidden className="block w-16 h-px bg-gold draw-in" />
        </div>
        <p className="mt-10 font-mincho text-lg sm:text-xl text-ink leading-[2] max-w-[34rem] mx-auto">
          His Recoveries は、複数形のブランドです。
          <br className="hidden sm:inline" />
          回復は一回では終わらない、という意味です。
        </p>
        <p className="mt-10 font-mincho text-[15px] sm:text-base text-ink/75 leading-[2.05] max-w-[32rem] mx-auto">
          身体の処置で終わる回復が、第一幕。
          <br className="hidden sm:inline" />
          所作で整え続ける回復が、第二幕。
          <br className="hidden sm:inline" />
          他者と並び直す回復が、第三幕。
        </p>
      </section>

      {/* ─────────────────────────────────────────
         ACT I — Body
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="act-body"
          className="bg-paper/40 border-y border-hair-line"
        >
          <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-24 sm:py-32">
            <header className="mb-12 sm:mb-16">
              <div className="flex items-baseline gap-5">
                <span className="logo-type italic text-2xl sm:text-3xl text-gold">
                  I
                </span>
                <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
                  Recovery of the Body
                </p>
              </div>
              <h2
                id="act-body"
                className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]"
              >
                身体の回復
                <span className="block mt-3 text-[18px] sm:text-xl text-ink/70">
                  ── 距離の年から、処置の決断まで
                </span>
              </h2>
            </header>

            <div className="font-mincho text-[15px] sm:text-[1.0625rem] leading-[2.15] text-ink/90 space-y-7 max-w-[34rem]">
              <p>
                身体に問題があるとき、その問題は、いつも他人より少し先に自分が気づきます。
                教室の机に滲んだ汗、夏服の袖の重さ、距離を取られているのか、
                それとも気のせいなのかを、毎日何度も計算した時期がありました。
              </p>
              <p>
                どこかで決断します。
                外用薬を試し、ボトックスを始め、皮膚科に通い、最終的に手術台に上がる。
                それぞれの選択は、孤独で、長く、安くはありません。
                ただ、それでも、終わりはあります。
              </p>
              <p className="pl-5 border-l-2 border-gold/40 text-ink">
                身体の回復は、医療が終わらせてくれる回復です。
                <br />
                これが、His Recoveries の第一幕です。
              </p>
              <p>
                記録の中の多くは、この第一幕の時間を、過去形で書いています。
                乗り越えた、と言わずに、通過した、と書きます。
                その距離感が、第二幕への入口を残してくれるからです。
              </p>
            </div>

            <div className="mt-12 sm:mt-14 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/territories"
                className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                6 つの領域（章）を見る →
              </Link>
              <Link
                href="/articles"
                className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                Presence Journal の記録を読む →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         Interlude — Timeline
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="interlude-timeline"
          className="mx-auto max-w-[1000px] px-6 sm:px-10 py-24 sm:py-32"
        >
          <header className="mb-12 sm:mb-16">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              Interlude
            </p>
            <h2
              id="interlude-timeline"
              className="mt-5 font-mincho text-2xl sm:text-3xl text-ink leading-[1.45]"
            >
              通過した時間
            </h2>
            <p className="mt-5 font-mincho text-[14px] sm:text-[15px] text-ink/70 leading-[2] max-w-[32rem]">
              His Recoveries の運営者が、ブランドを始める前に過ごした年。
              第一幕から第二幕へ移っていく、十数年の輪郭です。
            </p>
          </header>

          <FounderTimeline />

          <p className="mt-14 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95] max-w-[32rem]">
            実名・実年齢・顔は意図的に非公開で運営しています。
            理由は{" "}
            <Link
              href="/founder"
              className="border-b border-gold hover:text-gold transition-colors"
            >
              Founder&apos;s Note
            </Link>
            に。
          </p>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         ACT II — Practice
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-labelledby="act-practice" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/cityscape-dawn.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-55"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-navy-deep/65 via-navy-deep/80 to-navy-deep/95"
          />
          <div className="relative mx-auto max-w-[1000px] px-6 sm:px-10 py-28 sm:py-40 text-white">
            <header className="mb-12 sm:mb-16">
              <div className="flex items-baseline gap-5">
                <span className="logo-type italic text-2xl sm:text-3xl text-gold-bright">
                  II
                </span>
                <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
                  Recovery of Practice
                </p>
              </div>
              <h2
                id="act-practice"
                className="mt-5 font-mincho text-3xl sm:text-5xl leading-[1.3]"
              >
                所作の回復
                <span className="block mt-3 text-[18px] sm:text-xl text-white/75">
                  ── 処置のあと、所作で整える時代
                </span>
              </h2>
            </header>

            <div className="font-mincho text-[15px] sm:text-[1.0625rem] leading-[2.15] text-white/90 space-y-7 max-w-[34rem]">
              <p>
                身体の処置を終えても、夜の三十分が重いままだった、という人がいます。
                自意識は、傷より長く残るからです。
                <br />
                その残ったぶんを、日々の動作で整えていくのが、第二幕です。
              </p>
              <p>
                湯から上がり、一杯の水を飲み、部屋着に袖を通す。
                一つひとつの動作を決めておくと、
                自分の輪郭が、その日のうちに静かに引き直されていきます。
              </p>
              <p className="pl-5 border-l-2 border-gold-bright/60 text-white">
                所作の回復は、ブランドが提案できる回復です。
                <br />
                His Recoveries の Shelf は、この幕のための道具を並べた棚です。
              </p>
              <p>
                効くとは言いません。
                ただ、それに袖を通すあいだ、自分との約束を一つ守れる ──
                その距離感を、棚として並べています。
              </p>
            </div>

            <div className="mt-12 sm:mt-14 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/shelf"
                className="text-white border-b border-gold-bright pb-0.5 hover:text-gold-bright transition-colors"
              >
                The Shelf を見る →
              </Link>
              <Link
                href="/articles/the-architecture-of-night"
                className="text-white border-b border-gold-bright pb-0.5 hover:text-gold-bright transition-colors"
              >
                夜の所作の記録を読む →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         ACT III — Self
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="act-self"
          className="bg-paper/40 border-y border-hair-line"
        >
          <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-24 sm:py-32">
            <header className="mb-12 sm:mb-16">
              <div className="flex items-baseline gap-5">
                <span className="logo-type italic text-2xl sm:text-3xl text-gold">
                  III
                </span>
                <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
                  Recovery of the Self
                </p>
              </div>
              <h2
                id="act-self"
                className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]"
              >
                自己の回復
                <span className="block mt-3 text-[18px] sm:text-xl text-ink/70">
                  ── 並び直すこと、書いて返ること、便りを受け取ること
                </span>
              </h2>
            </header>

            <div className="font-mincho text-[15px] sm:text-[1.0625rem] leading-[2.15] text-ink/90 space-y-7 max-w-[34rem]">
              <p>
                第三幕は、ずっと未完です。
                身体が整い、所作が決まったあとも、
                他者の視線に過敏な癖や、夜の長さは、長く残ります。
              </p>
              <p>
                その残りを、誰かと並び直すことで、少しずつ薄めていく。
                書くこと、読むこと、便りを送ること、誰かの記録を受け取ること。
                <br />
                それらが、第三幕の所作です。
              </p>
              <p className="pl-5 border-l-2 border-gold/40 text-ink">
                自己の回復は、決して完了しません。
                <br />
                His Recoveries は、その未完を、未完のまま並べておくための場所です。
              </p>
              <p>
                ここに集まる読者は、答えではなく、距離を探しています。
                処方せず、励まさず、ただ書いて、ただ読んで、ときどき、便りを送る。
                その地味な営みが、たぶん、回復の第三幕です。
              </p>
            </div>

            <div className="mt-12 sm:mt-14 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/stories"
                className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                Recovery Stories を読む →
              </Link>
              <Link
                href="/subscribe"
                className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                便りを受け取る →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         Coda
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="coda"
          className="mx-auto max-w-[900px] px-6 sm:px-10 py-24 sm:py-32 text-center"
        >
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            Coda
          </p>
          <p
            id="coda"
            className="mt-8 font-mincho text-2xl sm:text-3xl lg:text-4xl text-ink leading-[1.55] max-w-[30rem] mx-auto"
          >
            回復は、強くなることではありません。
            <br className="hidden sm:inline" />
            戻り方を、いくつ持てるかです。
          </p>
          <p className="mt-10 font-mincho italic text-[13px] sm:text-sm tracking-[0.15em] text-sub-gray">
            Recovery is not about becoming stronger.
            <br />
            It is about the number of ways you have to come back.
          </p>

          <div className="mt-14 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link href="/assessment" className="btn-gold justify-center">
              回復を始める <span aria-hidden>→</span>
            </Link>
            <Link
              href="/shelf"
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
            >
              整える道具を見る
            </Link>
          </div>

          <div className="mt-16 pt-10 border-t border-hair-line flex items-center justify-center gap-4">
            <span aria-hidden className="block w-12 h-px bg-gold" />
            <span className="logo-type tracking-[0.2em] text-sm text-ink">
              {site.name}
            </span>
            <span aria-hidden className="block w-12 h-px bg-gold" />
          </div>
        </section>
      </Reveal>
    </article>
  );
}
