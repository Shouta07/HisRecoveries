import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import TagMarquee from "@/components/TagMarquee";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV"];

export default function HomePage() {
  const articles = getAllArticles();
  const popularArticles = (() => {
    const flagged = articles.filter((a) => a.popular);
    return (flagged.length > 0 ? flagged : articles).slice(0, 3);
  })();

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         Full-viewport, type only. One statement.
         ───────────────────────────────────────── */}
      <section className="relative min-h-[86vh] flex flex-col items-center justify-center text-center px-6 sm:px-10">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-6 logo-type text-[2.8rem] sm:text-7xl lg:text-[6.5rem] text-ink leading-[1]">
          {site.name}
        </h1>
        <div className="mt-8 flex justify-center">
          <span aria-hidden className="block w-14 sm:w-20 h-px bg-gold draw-in" />
        </div>
        <p className="mt-8 font-mincho text-[1.5rem] sm:text-4xl lg:text-[3.25rem] leading-[1.4] text-ink tracking-[0.04em]">
          {site.promise}
        </p>
        <p className="mt-8 font-mincho text-[13.5px] sm:text-[15px] text-ink/70 leading-[2] max-w-[30rem]">
          男性が言葉にしにくいことを、
          <br className="hidden sm:inline" />
          当事者の視点で記録する場所。
        </p>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-sub-gray">
            Scroll
          </span>
          <span
            aria-hidden
            className="block w-px h-10 bg-gradient-to-b from-gold to-transparent soft-float"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────
         SCENE II — Concept (scroll-revealed statement)
         Sentence by sentence, staggered fade-in.
         ───────────────────────────────────────── */}
      <section
        aria-label="Concept"
        className="mx-auto max-w-[860px] px-6 sm:px-10 py-28 sm:py-48"
      >
        <div className="space-y-10 sm:space-y-16 font-mincho text-ink">
          <Reveal>
            <p className="text-[1.35rem] sm:text-[2rem] leading-[1.85] tracking-[0.04em]">
              男性は、誰にも言えない悩みを、
              <br className="hidden sm:inline" />
              ひとりで検索している。
            </p>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-[1.35rem] sm:text-[2rem] leading-[1.85] tracking-[0.04em]">
              汗、におい、肌、髪、髭、そして自意識。
            </p>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-[1.35rem] sm:text-[2rem] leading-[1.85] tracking-[0.04em] text-ink/80">
              His Recoveries は、その沈黙を、
              <br className="hidden sm:inline" />
              恥ではなく、理解へ変えるための場所です。
            </p>
          </Reveal>
          <Reveal delay={360}>
            <p className="text-[15px] sm:text-base leading-[2.1] text-sub-gray max-w-[34rem]">
              解決策を売らず、励まさず、煽らない。
              ただ、半歩先を歩いた当事者の記録を、静かに置いておく。
              それだけで距離が縮まる、という経験を残したい。
            </p>
          </Reveal>
        </div>
      </section>

      {/* Quiet horizontal current — brand vocabulary divider */}
      <TagMarquee
        items={[
          "Male Conditioning",
          "Recover Your Presence",
          "Quiet Grooming",
          "Social Recovery",
          "Quiet Masculinity",
          "汗とにおい",
          "肌と跡",
          "顔の印象",
          "髪と自意識",
          "髭と体毛",
          "心と余白",
        ]}
      />

      {/* ─────────────────────────────────────────
         SCENE V — Most Read
         ───────────────────────────────────────── */}
      {popularArticles.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="most-read"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-32"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-14 items-end mb-8 sm:mb-16">
              <SectionLabel
                en="Most Read"
                ja="よく読まれている記事"
                number={chapterRomans[0]}
              />
              <p
                id="most-read"
                className="font-mincho text-[14px] sm:text-base text-ink/80 leading-[1.95] max-w-[34rem] lg:pb-2"
              >
                はじめての方は、ここから。
                <br className="hidden sm:inline" />
                検索から辿り着いた読者が、よく読んでいる記録です。
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-10">
              {popularArticles.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} variant="card" />
                </li>
              ))}
            </ul>

            <div className="mt-8 sm:mt-12 flex justify-end">
              <Link
                href="/articles"
                className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                すべての記録を見る
                <span aria-hidden> →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE VI — Philosophy moment (cinematic)
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-label="A Philosophy" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/cityscape-dawn.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-90"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"
          />
          <div className="relative mx-auto max-w-[1000px] px-6 sm:px-10 py-24 sm:py-48 lg:py-56 text-center text-cream">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
              A Philosophy
            </p>
            <p className="mt-7 sm:mt-10 font-mincho text-[1.5rem] sm:text-3xl lg:text-[2.5rem] leading-[1.55] tracking-[0.05em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
              男性は、強くなるのではなく、
              <br />
              整うのだ。
            </p>
            <p className="mt-7 sm:mt-10 font-mincho italic text-[13px] sm:text-sm tracking-[0.15em] text-cream/75">
              Men are not meant to become stronger.
              <br />
              They are meant to become more aligned.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VII — Recovery Check
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="recovery-check"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-center">
            <div>
              <SectionLabel
                en="Recovery Check"
                ja="自分の状態を、編集者と整理する"
                number={chapterRomans[1]}
              />
              <p
                id="recovery-check"
                className="mt-6 sm:mt-8 font-mincho text-[14px] sm:text-base text-ink/85 leading-[2] max-w-[32rem]"
              >
                30 問の自己観察に静かに答えると、編集者が読んで、
                <br className="hidden sm:inline" />
                24 時間以内に「あなたの状態の地形図」を返します。
              </p>
              <p className="mt-5 font-mincho text-[13.5px] text-sub-gray leading-[2] max-w-[32rem]">
                診断ではなく、治療を売ることもせず、
                <br className="hidden sm:inline" />
                ただ、自分の言葉を、もう一度、自分自身に渡すための時間です。
              </p>
              <ul className="mt-5 sm:mt-7 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] tracking-[0.06em] text-sub-gray max-w-[28rem]">
                <li>— 30 問・所要 15〜25 分</li>
                <li>— 編集者が人で返信</li>
                <li>— β 期間中 無料</li>
                <li>— 商品の販売なし</li>
              </ul>

              <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <TrackedCTA
                  href="/check"
                  event="hero_cta_click"
                  eventProps={{ target: "check", location: "home" }}
                  className="btn-gold justify-center"
                >
                  Recovery Check を始める
                  <span aria-hidden>→</span>
                </TrackedCTA>
                <TrackedCTA
                  href="/assessment"
                  event="assessment_start"
                  eventProps={{ location: "home_secondary" }}
                  className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3 text-center"
                >
                  まず 5 問の Mirror で
                </TrackedCTA>
              </div>
            </div>

            <div className="bg-paper border border-hair-line p-6 sm:p-10">
              <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                4 Sections · 30 Questions
              </p>
              <ol className="mt-6 space-y-4 font-mincho text-[14.5px] sm:text-[15px] text-ink/85 leading-[2]">
                <li>
                  <span className="text-gold mr-3">I.</span>
                  いまの自分の温度を観察する
                </li>
                <li>
                  <span className="text-gold mr-3">II.</span>
                  悩みが、日常のどこに触れているか
                </li>
                <li>
                  <span className="text-gold mr-3">III.</span>
                  通過してきたこと・試してきたこと
                </li>
                <li>
                  <span className="text-gold mr-3">IV.</span>
                  半年先の輪郭を、置いてみる
                </li>
              </ol>
              <p className="mt-7 text-[11px] text-sub-gray tracking-[0.06em] leading-[1.9]">
                編集者が読み、24 時間以内に PDF レポートを返します。
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE IX — Belonging (cinematic close)
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-labelledby="belonging" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/room-morning.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-85"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80"
          />
          <div className="relative mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-40 text-center text-cream">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
              Belonging · ニュースレターを受け取る
            </p>
            <p
              id="belonging"
              className="mt-7 sm:mt-10 font-mincho text-[1.35rem] sm:text-2xl lg:text-3xl leading-[1.65] max-w-[32rem] mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
            >
              月に一度か二度、
              <br className="sm:hidden" />
              新しい記録と覚え書きが届きます。
            </p>
            <p className="mt-5 sm:mt-6 text-[13px] sm:text-sm leading-[1.95] text-cream/70 max-w-[30rem] mx-auto">
              通知も煽りもありません。読まない月は読まないでください。
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <TrackedCTA
                href={site.social.substack}
                event="subscribe_click"
                eventProps={{ location: "home_belonging" }}
                className="btn-gold justify-center"
              >
                Substack で購読する
                <span aria-hidden>→</span>
              </TrackedCTA>
              <TrackedCTA
                href={site.social.threads}
                event="subscribe_click"
                eventProps={{ location: "home_belonging", channel: "threads" }}
                className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5"
              >
                Threads でフォロー
              </TrackedCTA>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
