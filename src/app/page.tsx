import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import TagMarquee from "@/components/TagMarquee";
import ProductShowcase from "@/components/ProductShowcase";
import { getAllProducts } from "@/lib/products";
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
  const products = getAllProducts();
  // Showcase carousel — scroll-snap horizontal. Up to 6 to keep
  // pagination meaningful as the catalog grows.
  const shelfPreview = products.slice(0, 6);

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         Two CTAs only: Subscribe (fans) and Shelf (CVR).
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
              href="/shelf"
              event="hero_cta_click"
              eventProps={{ target: "shelf" }}
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
            >
              整える道具を見る
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
         SCENE I½ — Philosophy moment (cinematic)
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
         SCENE II — Most Read (SEO/GEO traffic surface)
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
                  number={chapterRomans[0]}
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
         SCENE III — Male Recovery Assessment
         5-question quick check. Acts as the second
         conversion lever (assessment_complete →
         intent capture → newsletter / shelf).
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="assessment"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-32 pb-16 sm:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-center">
            <div>
              <SectionLabel
                en="Recovery Assessment"
                ja="男性の回復診断"
                number={chapterRomans[1]}
              />
              <p
                id="assessment"
                className="mt-6 sm:mt-8 font-mincho text-[14px] sm:text-base text-ink/85 leading-[1.95] max-w-[32rem]"
              >
                いまの自分の状態を、5 つの問いで整理する。
                <br className="hidden sm:inline" />
                診断ではなく、あなたの言葉をあなた自身に渡すための時間です。
              </p>
              <ul className="mt-5 sm:mt-7 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] tracking-[0.06em] text-sub-gray max-w-[28rem]">
                <li>— 髪／肌／汗</li>
                <li>— 匂い／ヒゲ</li>
                <li>— 体型／自信</li>
                <li>— 所要 約 3 分</li>
              </ul>

              <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <TrackedCTA
                  href="/assessment"
                  event="assessment_start"
                  eventProps={{ location: "home" }}
                  className="btn-gold justify-center"
                >
                  診断を始める
                  <span aria-hidden>→</span>
                </TrackedCTA>
                <p className="text-[12px] tracking-[0.06em] text-sub-gray">
                  回答はブラウザ内に保存されます
                </p>
              </div>
            </div>

            <div className="bg-paper border border-hair-line p-6 sm:p-10">
              <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                5 Questions
              </p>
              <ol className="mt-6 space-y-4 font-mincho text-[14.5px] sm:text-[15px] text-ink/85 leading-[2]">
                <li>
                  <span className="text-gold mr-3">01</span>
                  いま、いちばん気になっているのは？
                </li>
                <li>
                  <span className="text-gold mr-3">02</span>
                  日常への影響は、どれくらい？
                </li>
                <li>
                  <span className="text-gold mr-3">03</span>
                  これまで、何を試してきた？
                </li>
                <li>
                  <span className="text-gold mr-3">04</span>
                  整えたい先は、どんな状態？
                </li>
                <li>
                  <span className="text-gold mr-3">05</span>
                  受け取り方を選ぶ（任意）
                </li>
              </ol>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE IV — Conditioning Rituals Showcase
         Aesop-style horizontal carousel: large
         editorial cards with snap scroll.
         ───────────────────────────────────────── */}
      {shelfPreview.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="rituals"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-14 sm:pt-28 pb-14 sm:pb-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-14 items-end mb-8 sm:mb-16">
              <SectionLabel
                en="Conditioning Rituals"
                ja="整える道具の棚"
                number={chapterRomans[2]}
              />
              <p
                id="rituals"
                className="font-mincho text-[14px] sm:text-base leading-[1.95] text-ink/80 max-w-[34rem] lg:pb-2"
              >
                当事者として実際に選択肢に置いてきた整える道具。
                <br className="hidden sm:inline" />
                効くとは言わず、層として並べます。
                <span className="block mt-2 text-[12px] text-sub-gray">
                  ※ 広告（アフィリエイト）を含みます。
                </span>
              </p>
            </div>

            <ProductShowcase products={shelfPreview} />

            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 justify-end">
              <Link
                href="/disclosure"
                className="text-[11px] tracking-[0.06em] text-sub-gray hover:text-ink transition-colors"
              >
                広告・アフィリエイト方針
              </Link>
              <Link
                href="/shelf"
                className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                棚をすべて見る
                <span aria-hidden> →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE V — Belonging (fan capture, cinematic)
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
