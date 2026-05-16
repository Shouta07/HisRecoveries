import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import TerritoryBrowser from "@/components/TerritoryBrowser";
import FeaturedGathering from "@/components/FeaturedGathering";
import SectionLabel from "@/components/SectionLabel";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const articles = getAllArticles();
  const recentArticles = articles.slice(0, 8);
  const upcomingEvents = getUpcomingEvents();
  const featuredEvent = upcomingEvents[0];
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
         Hero — TENTIAL "Journal" style: centered
         small eyebrow + large mincho title +
         single line of mission copy
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-32 pb-16 sm:pb-24 text-center">
        <p className="font-mincho text-sub-gray text-xs sm:text-sm tracking-[0.3em]">
          {site.tagline}
        </p>
        <h1 className="mt-6 logo-type text-6xl sm:text-8xl text-navy leading-[0.95]">
          {site.name}
        </h1>
        <p className="mt-10 font-mincho text-xl sm:text-3xl leading-[1.55] text-ink">
          Quiet Grooming.
          <br />
          <span className="text-ink/80 text-base sm:text-xl">
            叫ばない、整える。
          </span>
        </p>
        <p className="mt-7 text-sm sm:text-[0.9375rem] leading-[2] text-sub-gray max-w-[34rem] mx-auto">
          言葉にされにくい男性の身体と自意識のための、
          記録 と 整理 と 集まり の場所。
        </p>
      </section>

      {/* ─────────────────────────────────────────
         CONCERNS — SBC「悩みから探す」style
         icon grid → in-place article reveal
         ───────────────────────────────────────── */}
      <section
        aria-labelledby="concerns"
        className="bg-paper border-y border-hair-line"
      >
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-16 sm:py-24">
          <SectionLabel en="Concerns" ja="悩みから探す" />
          <p className="mt-5 text-[13px] sm:text-sm text-sub-gray leading-[2] max-w-[36rem]">
            気になる領域を選ぶと、関連する記録が下に並びます。
            ページ遷移はしません。
          </p>
          <div className="mt-10 sm:mt-14">
            <TerritoryBrowser
              territories={territories}
              articles={articles}
            />
          </div>
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
          <SectionLabel en="What's New" ja="新着の記録" />

          <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-y-14">
            {recentArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="card" />
            ))}
          </div>

          <div className="mt-12 sm:mt-16 flex justify-end">
            <Link
              href="/articles"
              className="inline-flex items-center gap-3 px-7 py-3 text-sm tracking-[0.12em] text-navy border border-navy hover:bg-navy hover:text-white transition-colors"
            >
              もっと見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────
         SCHEDULE — Conversion focus
         ───────────────────────────────────────── */}
      {featuredEvent && (
        <div className="border-t border-hair-line">
          <FeaturedGathering event={featuredEvent} />
        </div>
      )}

      {/* ─────────────────────────────────────────
         BELONG — Subscribe + auxiliary
         ───────────────────────────────────────── */}
      <section
        aria-labelledby="belong"
        className="mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-28"
      >
        <SectionLabel en="Belong" ja="つながる" />

        <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16">
          <div className="lg:border-r border-hair-line lg:pr-12">
            <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
              Subscribe
            </p>
            <h3
              id="belong"
              className="mt-3 font-mincho text-2xl sm:text-3xl font-medium leading-[1.5] text-ink"
            >
              月に一度か二度、
              <br />
              ニュースレターで届く記録。
            </h3>
            <p className="mt-6 text-[0.9375rem] leading-[2] text-ink/75 max-w-[28rem]">
              新しく書いた記録と、まだ記事にしていない覚え書きを、お送りします。
              通知も煽りもありません。
            </p>
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-9"
            >
              Substack で購読する
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="space-y-6">
            {[
              {
                label: "Reflect",
                title: "いまの自分に近い記録を探す",
                desc: "5 つの問いに静かに答えると、近い記録が並びます。",
                href: "/reflect",
              },
              {
                label: "Letters",
                title: "静かなお便り",
                desc: "書きたくなったら、ここに。返信は約束しませんが、必ず読みます。",
                href: "/letters",
              },
              {
                label: "About",
                title: "このサイトについて",
                desc: "解決策ではなく、整えている途中の話を残しておく場所。",
                href: "/about",
              },
            ].map((it) => (
              <Link
                key={it.label}
                href={it.href}
                className="group block border-l-2 border-hair-line hover:border-gold pl-5 transition-colors"
              >
                <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
                  {it.label}
                </p>
                <h4 className="mt-2 font-mincho text-lg font-medium leading-[1.5] text-ink group-hover:text-navy transition-colors">
                  {it.title}
                </h4>
                <p className="mt-2 text-[13px] leading-[1.9] text-sub-gray">
                  {it.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
