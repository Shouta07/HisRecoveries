import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import WhatsNew from "@/components/WhatsNew";
import ArticleCard from "@/components/ArticleCard";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import ProductCard from "@/components/ProductCard";
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
  const popularSlugs = new Set(popularArticles.map((a) => a.slug));
  const journalPool = articles.filter((a) => !popularSlugs.has(a.slug));
  const featuredArticle = journalPool[0] ?? articles[0];
  const sidebarArticles = journalPool.slice(1, 4);
  const products = getAllProducts();
  const shelfPreview = products.slice(0, 3);

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         Two CTAs only: Subscribe (fans) and Shelf (CVR).
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-36 pb-20 sm:pb-28 text-center">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-7 logo-type text-5xl sm:text-7xl lg:text-8xl text-ink leading-[0.95]">
          {site.name}
        </h1>
        <div className="mt-10 flex justify-center">
          <span aria-hidden className="block w-16 h-px bg-gold draw-in" />
        </div>
        <p className="mt-10 font-mincho text-[1.7rem] sm:text-4xl lg:text-[3rem] leading-[1.45] text-ink tracking-[0.03em]">
          {site.promise}
        </p>

        <div className="mt-14 sm:mt-16 max-w-[34rem] mx-auto">
          <p className="font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
            汗・におい・肌・髪・髭・自意識。
            <br className="hidden sm:inline" />
            男性が言葉にしにくいことを、
            <br className="hidden sm:inline" />
            当事者の視点で書く読みものです。
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
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
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
                <SectionLabel
                  en="Most Read"
                  ja="よく読まれている記事"
                  number={chapterRomans[0]}
                />
                <p
                  id="most-read"
                  className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem] lg:pb-2"
                >
                  はじめての方は、ここから。
                  <br className="hidden sm:inline" />
                  検索から辿り着いた読者がよく読んでいる記録です。
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {popularArticles.map((a) => (
                  <li key={a.slug}>
                    <ArticleCard article={a} variant="card" />
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex justify-end">
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
         SCENE III — Presence Journal (trust)
         ───────────────────────────────────────── */}
      {featuredArticle && (
        <Reveal>
          <section
            aria-labelledby="presence-journal"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
              <SectionLabel
                en="Presence Journal"
                ja="記録（読みもの）"
                number={chapterRomans[1]}
              />
              <p className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem] lg:pb-2">
                身体と自意識について、当事者として書いたエッセイ。
                <br className="hidden sm:inline" />
                急かしません。ゆっくり読んでください。
              </p>
            </div>
            <WhatsNew featured={featuredArticle} rest={sidebarArticles} />
            <div className="mt-12 sm:mt-16 flex justify-end">
              <Link
                href="/articles"
                className="text-sm tracking-[0.1em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                すべての記録を見る →
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE IV — Conditioning Rituals (more CVR)
         ───────────────────────────────────────── */}
      {shelfPreview.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="rituals"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-20 sm:pb-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
              <SectionLabel
                en="Conditioning Rituals"
                ja="整える道具の棚"
                number={chapterRomans[2]}
              />
              <p
                id="rituals"
                className="font-mincho text-[15px] sm:text-base leading-[2] text-ink/80 max-w-[34rem] lg:pb-2"
              >
                当事者として実際に選択肢に置いてきた整える道具。
                <br className="hidden sm:inline" />
                効くとは言わず、層として並べます。
                <span className="block mt-2 text-[12px] text-sub-gray">
                  ※ 広告（アフィリエイト）を含みます。
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shelfPreview.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 justify-end">
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
         SCENE V — Belonging (fan capture)
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="belonging"
          className="border-t border-hair-line bg-paper/40"
        >
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-24 sm:py-32 text-center">
            <SectionLabel
              en="Belonging"
              ja="ニュースレターを受け取る"
              number={chapterRomans[3]}
              className="!text-center [&>div]:!justify-center [&>span]:!mx-auto"
            />
            <p
              id="belonging"
              className="mt-10 font-mincho text-xl sm:text-2xl lg:text-3xl leading-[1.7] text-ink max-w-[32rem] mx-auto"
            >
              月に一度か二度、
              <br className="sm:hidden" />
              新しい記録と覚え書きが届きます。
            </p>
            <p className="mt-6 text-[13px] sm:text-sm leading-[2] text-sub-gray max-w-[30rem] mx-auto">
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
                className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
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
