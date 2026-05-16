import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import TerritoryBrowser from "@/components/TerritoryBrowser";
import QuietGatherings from "@/components/QuietGatherings";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TagMarquee from "@/components/TagMarquee";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const articles = getAllArticles();
  const recentArticles = articles.slice(0, 8);
  const upcomingEvents = getUpcomingEvents();
  const territories = getAllTerritories().map((t) => ({
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    intro: t.intro,
    categories: t.categories,
  }));

  return (
    <>
      {/* ─────────────────────────────────────────
         Hero — tightened, with draw-in gold rule
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center">
        <p className="font-mincho text-sub-gray text-xs sm:text-sm tracking-[0.3em]">
          {site.tagline}
        </p>
        <h1 className="mt-3 logo-type text-5xl sm:text-7xl text-navy leading-[0.95]">
          {site.name}
        </h1>
        <div className="mt-5 flex justify-center">
          <span aria-hidden className="block w-24 h-px bg-gold draw-in" />
        </div>
        <p className="mt-5 font-mincho text-lg sm:text-2xl leading-[1.55] text-ink">
          Quiet Grooming.
          <span className="ml-2 text-ink/80 text-sm sm:text-base">
            — 叫ばない、整える。
          </span>
        </p>
        <p className="mt-3 text-[13px] sm:text-sm leading-[1.95] text-sub-gray max-w-[34rem] mx-auto">
          言葉にされにくい男性の身体と自意識のための、
          記録 と 整理 と 集まり の場所。
        </p>
      </section>

      {/* Marquee of category tags — quiet horizontal motion */}
      <TagMarquee
        items={[
          "多汗症",
          "ワキガ",
          "ニキビ",
          "肌の質感",
          "顔の印象",
          "薄毛・AGA",
          "髭・体毛",
          "心と自意識",
          "半歩先",
          "整える",
          "Quiet Grooming",
        ]}
      />

      {/* ─────────────────────────────────────────
         QUIET GATHERINGS — directly under hero
         ───────────────────────────────────────── */}
      <Reveal>
        <QuietGatherings events={upcomingEvents} />
      </Reveal>

      {/* ─────────────────────────────────────────
         CONCERNS — SBC「悩みから探す」style
         ───────────────────────────────────────── */}
      <section
        aria-labelledby="concerns"
        className="bg-paper border-y border-hair-line"
      >
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <Reveal>
            <SectionLabel en="Concerns" ja="悩みから探す" />
            <p className="mt-5 text-[13px] sm:text-sm text-sub-gray leading-[2] max-w-[36rem]">
              気になる領域を選ぶと、関連する記録が下に並びます。
              ページ遷移はしません。
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-10 sm:mt-14">
              <TerritoryBrowser
                territories={territories}
                articles={articles}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────
         WHAT'S NEW — TENTIAL 4-column grid
         16:10 cover + gothic bold title + date + # tag
         ───────────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <section
          aria-labelledby="whats-new"
          className="mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-28"
        >
          <Reveal>
            <SectionLabel en="What's New" ja="新着の記録" />
          </Reveal>

          <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-y-14">
            {recentArticles.map((a, i) => (
              <Reveal key={a.slug} delay={i * 60}>
                <ArticleCard article={a} variant="card" />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 sm:mt-16 flex justify-end">
              <Link
                href="/articles"
                className="inline-flex items-center gap-3 px-7 py-3 text-sm tracking-[0.12em] text-navy border border-navy hover:bg-navy hover:text-white transition-colors"
              >
                もっと見る
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ─────────────────────────────────────────
         BELONG — compact subscribe row + inline links
         ───────────────────────────────────────── */}
      <section
        aria-labelledby="belong"
        className="mx-auto max-w-[1100px] px-6 sm:px-10 py-10 sm:py-14"
      >
        <Reveal>
          <SectionLabel
            en="Belong"
            ja="つながる — 月に一度か二度、ニュースレターで届く記録"
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-6 sm:mt-8 bg-paper border border-hair-line p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[13px] sm:text-sm text-ink/80 leading-[1.85] max-w-[34rem]">
            新しく書いた記録と、まだ記事にしていない覚え書きを、月に数本。
            通知も煽りもありません。
          </p>
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold !py-3 !px-6 text-xs shrink-0"
          >
            Substack で購読
            <span aria-hidden>→</span>
          </a>
          </div>
        </Reveal>

        <p className="mt-5 text-[12px] text-sub-gray tracking-[0.04em]">
          <Link
            href="/reflect"
            className="hover:text-navy transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            Reflect — いまの自分に近い記録を探す
          </Link>
          <span className="mx-3 text-hair-line">/</span>
          <Link
            href="/letters"
            className="hover:text-navy transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            Letters — 静かなお便り
          </Link>
          <span className="mx-3 text-hair-line">/</span>
          <Link
            href="/about"
            className="hover:text-navy transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            About — このサイトについて
          </Link>
        </p>
      </section>
    </>
  );
}
