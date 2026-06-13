import Image from "next/image";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import TagMarquee from "@/components/TagMarquee";
import { getAllFeelings } from "@/lib/feelings";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV"];

export default function HomePage() {
  const feelings = getAllFeelings();
  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         Cinematic background, type only. One statement.
         ───────────────────────────────────────── */}
      <section className="relative min-h-[86vh] flex flex-col items-center justify-center text-center px-6 sm:px-10 bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cityscape-dawn.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/70"
        />

        <div className="relative">
          <p className="logo-type italic text-[12.5px] sm:text-[13px] tracking-[0.5em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            {site.tagline}
          </p>
          <h1 className="mt-6 logo-type text-[2.8rem] sm:text-7xl lg:text-[6.5rem] text-cream leading-[1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.name}
          </h1>
          <div className="mt-8 flex justify-center">
            <span aria-hidden className="block w-14 sm:w-20 h-px bg-gold-bright draw-in" />
          </div>
          <p className="mt-7 font-mincho text-[1.15rem] sm:text-[1.65rem] lg:text-[2.25rem] leading-[1.4] text-cream tracking-[0.04em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.promise}
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-cream/60">
            Scroll
          </span>
          <span
            aria-hidden
            className="block w-px h-10 bg-gradient-to-b from-gold-bright to-transparent soft-float"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────
         SCENE II — Concept (cinematic scroll reveal)
         Continues the Hero's dark mood. Sentences fade in
         one at a time as the user scrolls down from the Hero.
         ───────────────────────────────────────── */}
      <section aria-label="Concept" className="bg-navy text-cream">
        <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-32 sm:py-56">
          <div className="space-y-14 sm:space-y-24 font-mincho">
            <Reveal>
              <p className="text-[1.55rem] sm:text-[2.4rem] lg:text-[2.85rem] leading-[1.7] tracking-[0.04em] text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                誰にも言えない悩みを抱える男性は、
                <br className="hidden sm:inline" />
                たいてい、ひとりで検索している。
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="text-[1.55rem] sm:text-[2.4rem] lg:text-[2.85rem] leading-[1.7] tracking-[0.04em] text-cream/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                His Recoveries は、
                <br className="hidden sm:inline" />
                その検索の先にある場所です。
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Concern vocabulary — SEO/GEO-grabbable words the persona searches,
         mixed with the emotional phrases that say "you are seen here."
         Sits between the Concept statement and the Recovery Check so the
         visitor lands their own search terms before being offered the tool. */}
      <TagMarquee
        items={[
          "多汗症",
          "ワキガ",
          "ニキビ跡",
          "薄毛・AGA",
          "加齢臭",
          "男性の自意識",
          "清潔感が欲しい",
          "鏡を見るのが怖い",
          "温泉に誘われたくない",
          "集合写真が好きになれない",
          "婚活写真が苦手",
          "派手にはなりたくない",
          "老けて見えると言われた",
          "美容皮膚科に行けない",
        ]}
      />

      {/* ─────────────────────────────────────────
         SCENE III — Recovery Hub (emotional entry)
         "あなたは今、どこにいますか？" The visitor selects by FEELING,
         not symptom. Each leads to a feeling page that translates the
         feeling into possible causes.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="recovery-hub"
          className="bg-cream-deep border-t border-hair-line"
        >
          <div className="mx-auto max-w-[860px] px-6 sm:px-10 py-20 sm:py-32">
            <div className="mb-12 sm:mb-16">
              <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
                Recovery Hub
              </p>
              <h2
                id="recovery-hub"
                className="mt-5 font-mincho text-2xl sm:text-[2.2rem] text-ink leading-[1.45]"
              >
                あなたは今、どこにいますか？
              </h2>
              <p className="mt-5 font-mincho text-[13.5px] sm:text-sm text-sub-gray max-w-[30rem] leading-[2]">
                症状ではなく、いまの気持ちから。近いものを選ぶと、
                その奥にある原因を、一緒に読みほどきます。
              </p>
            </div>

            <ul className="border-t border-hair-line">
              {feelings.map((f) => (
                <li key={f.slug} className="border-b border-hair-line">
                  <Link
                    href={`/feelings/${f.slug}`}
                    className="group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 hover:px-2 transition-all"
                  >
                    <span
                      aria-hidden
                      className="shrink-0 w-5 h-5 border border-sub-gray/50 group-hover:border-gold group-hover:bg-gold/10 transition-colors"
                    />
                    <span className="flex-1 font-mincho text-[1.05rem] sm:text-[1.3rem] text-ink leading-[1.5] group-hover:text-gold transition-colors">
                      {f.statement}
                    </span>
                    <span
                      aria-hidden
                      className="text-sub-gray group-hover:text-gold group-hover:translate-x-1 transition-all text-lg shrink-0"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VII — お品書き (the three things)
         The entire toC offering, stated plainly. Recovery Check is the
         primary free action — it is how we collect the first-party data
         on what men actually worry about.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="menu"
          className="mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-32"
        >
          <div className="mb-12 sm:mb-16">
            <SectionLabel
              en="What We Offer"
              ja="His Recoveries にあるもの"
              number={chapterRomans[0]}
            />
            <p
              id="menu"
              className="mt-6 font-mincho text-[14px] sm:text-[15px] text-sub-gray leading-[2] max-w-[34rem]"
            >
              多くを並べません。いまのあなたに必要なのは、たぶん、この三つだけです。
            </p>
          </div>

          {/* Primary — Recovery Check */}
          <div className="bg-paper border border-hair-line p-7 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="font-mincho text-2xl sm:text-3xl text-ink leading-[1.4]">
                    Recovery Check
                  </h3>
                  <span className="logo-type italic text-[12px] tracking-[0.2em] uppercase text-gold">
                    無料
                  </span>
                </div>
                <p className="mt-2 font-mincho text-[15px] text-ink/85 leading-[1.9]">
                  今の状態を、理解する。
                </p>
                <p className="mt-5 font-mincho text-[13.5px] text-sub-gray leading-[2.05] max-w-[34rem]">
                  30 問の自己観察に静かに答えると、編集者が読んで、24 時間以内に
                  「あなたの状態の地形図」を手紙で返します。診断ではなく、
                  自分の言葉を、もう一度、自分自身に渡すための時間です。
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] tracking-[0.05em] text-sub-gray max-w-[26rem]">
                  <li>— 30 問・15〜25 分</li>
                  <li>— 編集者が人で返信</li>
                  <li>— 完全無料</li>
                  <li>— 商品の販売なし</li>
                </ul>
              </div>
              <div className="lg:text-right">
                <TrackedCTA
                  href="/check"
                  event="hero_cta_click"
                  eventProps={{ target: "check", location: "home_menu" }}
                  className="btn-gold justify-center w-full lg:w-auto"
                >
                  Recovery Check を始める
                  <span aria-hidden>→</span>
                </TrackedCTA>
              </div>
            </div>
          </div>

          {/* Secondary — Stories (free) + Letter (paid) */}
          <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Link
              href="/stories"
              className="group block bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-mincho text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                  Recovery Stories
                </h3>
                <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  無料
                </span>
              </div>
              <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
                同じ悩みを持つ人の、回復の記録を読む。匿名の一通が、次に悩む誰かの助けになります。
              </p>
              <span className="mt-5 inline-flex text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                記録を読む <span aria-hidden> →</span>
              </span>
            </Link>

            <Link
              href="/membership"
              className="group block bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-mincho text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                  Recoveries Letter
                </h3>
                <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  月 500 円
                </span>
              </div>
              <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
                週に一度、日曜日に届く手紙。男性の身体と自意識について、広告のない場所で。
              </p>
              <span className="mt-5 inline-flex text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                手紙について <span aria-hidden> →</span>
              </span>
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE IX — Recoveries Letter (the place, not a product)
         Frame the Substack as a place to belong, not a paid subscription.
         Price stays discoverable but is not the headline.
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-labelledby="letter" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/room-morning.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-80"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85"
          />
          <div className="relative mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-40 text-center text-cream">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Recoveries Letter
            </p>
            <p
              id="letter"
              className="mt-7 sm:mt-10 font-mincho text-[1.6rem] sm:text-[2.2rem] lg:text-[2.85rem] leading-[1.55] max-w-[36rem] mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]"
            >
              毎週日曜日。
              <br />
              男性の身体と自意識について。
              <br />
              広告のない場所で。
            </p>
            <p className="mt-7 sm:mt-9 font-mincho text-[14.5px] sm:text-[15.5px] leading-[2.05] text-cream/85 max-w-[30rem] mx-auto">
              公開記事には書けなかった、半歩先からの覚え書きを、
              <br className="hidden sm:inline" />
              週に一度、Substack でお送りします。
            </p>

            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <TrackedCTA
                href={`${site.social.substack}/subscribe`}
                event="membership_subscribe_click"
                eventProps={{ location: "home_letter" }}
                className="btn-gold justify-center"
              >
                日曜日の手紙を受け取る
                <span aria-hidden>→</span>
              </TrackedCTA>
              <TrackedCTA
                href={site.social.substack}
                event="subscribe_click"
                eventProps={{ location: "home_letter", target: "preview" }}
                className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
              >
                過去の手紙を読む
              </TrackedCTA>
            </div>

            <p className="mt-9 text-[12px] tracking-[0.08em] text-cream/55 leading-[1.95] max-w-[30rem] mx-auto">
              無料で読める便りと、月 ¥500 の Recoveries Letter から選べます。
              <br className="hidden sm:inline" />
              通知も催促もありません。読まない日曜日は、読まないでください。
            </p>
          </div>
        </section>
      </Reveal>
    </>
  );
}
