import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import TagMarquee from "@/components/TagMarquee";
import { getAllConcerns } from "@/lib/concerns";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV"];

export default function HomePage() {
  const articles = getAllArticles();
  // Most-read picks: filter by frontmatter `popular: true` first, fall back to
  // recency-ordered head when no curation has happened yet.
  const popularArticles = (() => {
    const flagged = articles.filter((a) => a.popular);
    return (flagged.length > 0 ? flagged : articles).slice(0, 3);
  })();
  // Concerns on the home — 6 most-recently-opened tickets as the
  // primary entry surface (the "ticket-style" pivot per ops brief).
  const homeConcerns = getAllConcerns().slice(0, 6);

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-14 sm:pt-36 pb-14 sm:pb-28 text-center">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-5 sm:mt-7 logo-type text-[2.6rem] sm:text-7xl lg:text-8xl text-ink leading-[1]">
          {site.name}
        </h1>
        <div className="mt-7 sm:mt-10 flex justify-center">
          <span aria-hidden className="block w-12 sm:w-16 h-px bg-gold draw-in" />
        </div>
        <p className="mt-7 sm:mt-10 font-mincho text-[1.4rem] sm:text-4xl lg:text-[3rem] leading-[1.45] text-ink tracking-[0.03em]">
          {site.promise}
        </p>

        <div className="mt-9 sm:mt-16 max-w-[34rem] mx-auto">
          <p className="font-mincho text-[14px] sm:text-base text-ink/85 leading-[1.95]">
            汗・におい・肌・髪・髭・自意識。
            <br className="hidden sm:inline" />
            男性が言葉にしにくいことを、
            <br className="hidden sm:inline" />
            当事者の視点で書く読みものです。
          </p>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <TrackedCTA
              href={site.social.substack}
              event="subscribe_click"
              eventProps={{ location: "hero" }}
              className="btn-gold justify-center"
            >
              Substack で読む
              <span aria-hidden>→</span>
            </TrackedCTA>
            <TrackedCTA
              href="/concerns"
              event="hero_cta_click"
              eventProps={{ target: "concerns" }}
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
            >
              悩み票を見る
            </TrackedCTA>
          </div>
        </div>
      </section>

      {/* Quiet horizontal current — brand vocabulary
          + the 6 chapters drifting slowly */}
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
         SCENE II — Philosophy moment (cinematic)
         A single quiet dark break: the one dark
         section on a bright site (Aesop pattern).
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-label="A Philosophy" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/cityscape-dawn.png"
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-center opacity-90"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70"
          />
          <div className="relative mx-auto max-w-[1000px] px-6 sm:px-10 py-20 sm:py-44 lg:py-52 text-center text-cream">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
              A Philosophy
            </p>
            <p className="mt-7 sm:mt-10 font-mincho text-[1.45rem] sm:text-3xl lg:text-[2.4rem] leading-[1.55] tracking-[0.05em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
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
         SCENE III — Concerns（悩み票・primary entry）
         The new primary entry surface. Each card is a
         felt-language concern that aggregates voices,
         records, options and shelf items in one place.
         ───────────────────────────────────────── */}
      {homeConcerns.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="home-concerns"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-14 sm:pt-32 pb-14 sm:pb-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-14 items-end mb-8 sm:mb-14">
              <SectionLabel
                en="Concerns"
                ja="悩み票"
                number={chapterRomans[0]}
              />
              <p
                id="home-concerns"
                className="font-mincho text-[14px] sm:text-[15px] text-ink/80 leading-[1.95] max-w-[34rem] lg:pb-2"
              >
                His Recoveries は、悩みごとに「場所」を持っています。
                <br className="hidden sm:inline" />
                そこには、当事者の声と、記録と、選択肢の地形図があります。
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {homeConcerns.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/concerns/${c.slug}`}
                    className="group block h-full bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors card-lift"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="logo-type italic text-[12px] tracking-[0.25em] text-gold">
                        #{c.ticketId}
                      </span>
                      <span className="text-[10px] tracking-[0.1em] text-sub-gray uppercase">
                        {c.status}
                      </span>
                    </div>
                    <h3 className="mt-5 font-mincho text-base sm:text-lg text-ink leading-[1.55] group-hover:text-gold transition-colors">
                      {c.title}
                    </h3>
                    {c.excerpt && (
                      <p className="mt-4 font-mincho text-[13px] sm:text-[13.5px] text-ink/75 leading-[2] line-clamp-3">
                        {c.excerpt}
                      </p>
                    )}
                    <p className="mt-5 text-[11px] tracking-[0.06em] text-sub-gray">
                      {c.articles.length} 件の記録
                      {c.voices.length > 0 && (
                        <span> · {c.voices.length} の声</span>
                      )}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 sm:mt-12 flex justify-end">
              <Link
                href="/concerns"
                className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                すべての悩み票を見る
                <span aria-hidden> →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE IV — Most Read (SEO/GEO traffic surface)
         The journal entry point on home. Reading these
         is where affiliate conversions originate.
         ───────────────────────────────────────── */}
      {popularArticles.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="most-read"
            className="bg-paper/40 border-y border-hair-line"
          >
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-14 items-end mb-8 sm:mb-16">
                <SectionLabel
                  en="Most Read"
                  ja="よく読まれている記事"
                  number={chapterRomans[1]}
                />
                <p
                  id="most-read"
                  className="font-mincho text-[14px] sm:text-base text-ink/80 leading-[1.95] max-w-[34rem] lg:pb-2"
                >
                  はじめての方は、ここから。
                  <br className="hidden sm:inline" />
                  検索から辿り着いた読者がよく読んでいる記録です。
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
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE V — Recovery Check
         The flagship Layer 2 product. 30 questions, a
         24h reply from a human editor. Sets the brand
         apart from quiz-style "AI diagnostics".
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="recovery-check"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-32 pb-16 sm:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-center">
            <div>
              <SectionLabel
                en="Recovery Check"
                ja="自分の状態を、編集者と整理する"
                number={chapterRomans[2]}
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
         SCENE VI — Belonging (fan capture, cinematic)
         Closing dark moment with the morning-room image.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="belonging"
          className="relative bg-navy"
        >
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
