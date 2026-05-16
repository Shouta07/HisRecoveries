import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import WhatsNew from "@/components/WhatsNew";
import TerritoryBrowser from "@/components/TerritoryBrowser";
import FeaturedGathering from "@/components/FeaturedGathering";
import SectionLabel from "@/components/SectionLabel";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
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
      {/* ───────────────────────────────────────────────
         SCENE 1 — Identity
         Goal: in 5 seconds, the visitor understands what
         Quiet Grooming and His Recoveries are.
         ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-32 pb-24 sm:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-14 lg:gap-24 items-center">
          <div>
            <p className="font-mincho text-sub-gray text-sm sm:text-base">
              {site.tagline}
            </p>
            <h1 className="mt-5 logo-type text-6xl sm:text-8xl text-ink leading-[0.95]">
              {site.name}
            </h1>
            <p className="mt-12 font-mincho text-2xl sm:text-4xl leading-[1.55] text-ink max-w-[32rem]">
              Quiet Grooming.
              <br />
              <span className="text-ink/80 text-xl sm:text-2xl">
                叫ばない、整える。
              </span>
            </p>
            <p className="mt-8 text-base sm:text-lg leading-[2] text-ink/75 max-w-[34rem]">
              男性のコンプレックスのための、夜の図書館。
            </p>

            {/* Single primary CTA — clarity over choice */}
            {featuredArticle && (
              <Link
                href={`/articles/${featuredArticle.slug}`}
                className="mt-12 inline-flex items-center gap-3 text-base text-navy border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                今月の記録から読む
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
          <div className="hidden lg:block">
            <HeroMark />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────
         SCENE 2 — Read
         Goal: deliver the strongest editorial moment.
         Latest record as a magazine cover.
         ─────────────────────────────────────────────── */}
      {featuredArticle && (
        <section
          aria-labelledby="whats-new"
          className="bg-paper border-t border-hair-line"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-28">
            <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 mb-12 sm:mb-16">
              <SectionLabel en="Read" ja="最近の記録" />
              <div className="flex items-end justify-end">
                <Link
                  href="/articles"
                  className="text-sm text-navy hover:text-gold transition-colors"
                >
                  すべての記録 →
                </Link>
              </div>
            </div>
            <WhatsNew featured={featuredArticle} rest={sidebarArticles} />
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────
         SCENE 3 — Explore
         Goal: let the visitor find their territory.
         Interactive browser, in-place expansion.
         ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="feature"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-28"
      >
        <div className="mb-12 sm:mb-16">
          <SectionLabel en="Explore" ja="地形図" />
          <p className="mt-5 sm:ml-12 text-[0.9375rem] text-sub-gray leading-[2] max-w-[36rem]">
            気になる領域を選ぶと、関連する記録が下に並びます。
            遷移はしません。同じページの上で広がります。
          </p>
        </div>
        <TerritoryBrowser
          territories={territories}
          articles={articles}
        />
      </section>

      {/* ───────────────────────────────────────────────
         SCENE 4 — Gather  ✦ Conversion focus
         Goal: convert the right reader to a Quiet Gathering.
         Full-bleed cream-deep band, hero treatment.
         ─────────────────────────────────────────────── */}
      {featuredEvent && <FeaturedGathering event={featuredEvent} />}

      {/* ───────────────────────────────────────────────
         SCENE 5 — Belong
         Goal: build relationship through subscription
         and offer auxiliary tools (Reflect, Letters).
         ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="belong"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-28"
      >
        <div className="mb-12 sm:mb-16">
          <SectionLabel en="Belong" ja="つながる" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16">
          {/* Primary: Subscribe */}
          <div className="border-r-0 lg:border-r border-hair-line lg:pr-12">
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

          {/* Secondary: Reflect + Letters as small entries */}
          <div className="space-y-6">
            <Link
              href="/reflect"
              className="group block border-l-2 border-hair-line hover:border-gold pl-5 transition-colors"
            >
              <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
                Reflect
              </p>
              <h4 className="mt-2 font-mincho text-lg font-medium leading-[1.5] text-ink group-hover:text-navy transition-colors">
                いまの自分に近い記録を探す
              </h4>
              <p className="mt-2 text-[13px] leading-[1.9] text-sub-gray">
                5 つの問いに静かに答えると、近い記録が並びます。
              </p>
            </Link>

            <Link
              href="/letters"
              className="group block border-l-2 border-hair-line hover:border-gold pl-5 transition-colors"
            >
              <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
                Letters
              </p>
              <h4 className="mt-2 font-mincho text-lg font-medium leading-[1.5] text-ink group-hover:text-navy transition-colors">
                静かなお便り
              </h4>
              <p className="mt-2 text-[13px] leading-[1.9] text-sub-gray">
                書きたくなったら、ここに。返信は約束しませんが、必ず読みます。
              </p>
            </Link>

            <Link
              href="/about"
              className="group block border-l-2 border-hair-line hover:border-gold pl-5 transition-colors"
            >
              <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
                About
              </p>
              <h4 className="mt-2 font-mincho text-lg font-medium leading-[1.5] text-ink group-hover:text-navy transition-colors">
                このサイトについて
              </h4>
              <p className="mt-2 text-[13px] leading-[1.9] text-sub-gray">
                解決策ではなく、整えている途中の話を残しておく場所。
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroMark() {
  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full max-w-[440px] mx-auto"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF6EB" />
          <stop offset="100%" stopColor="#E8D7AE" />
        </linearGradient>
        <radialGradient id="hero-warm" cx="70%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#F2DDAA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FAF6EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(#hero-bg)" />
      <rect width="500" height="500" fill="url(#hero-warm)" />
      <g transform="translate(250 250)" fill="none" stroke="#A17A4A">
        <circle r="200" strokeWidth="0.8" strokeOpacity="0.18" />
        <circle r="160" strokeWidth="0.7" strokeOpacity="0.28" />
        <circle r="120" strokeWidth="0.7" strokeOpacity="0.45" />
        <circle r="80" strokeWidth="0.6" strokeOpacity="0.6" />
        <circle r="40" strokeWidth="0.6" strokeOpacity="0.75" />
        <circle r="12" fill="#A17A4A" fillOpacity="0.5" stroke="none" />
      </g>
      <line x1="250" y1="50" x2="250" y2="450" stroke="#1B2A47" strokeWidth="0.5" strokeOpacity="0.18" />
      <line x1="0" y1="309" x2="500" y2="309" stroke="#A17A4A" strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="2" fill="#1B2A47" opacity="0.35" />
      <circle cx="410" cy="120" r="2" fill="#1B2A47" opacity="0.25" />
      <circle cx="90" cy="400" r="2.5" fill="#A17A4A" />
    </svg>
  );
}
