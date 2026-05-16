import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import FeaturedArticle from "@/components/FeaturedArticle";
import EventsRail from "@/components/EventsRail";
import TerritoryBrowser from "@/components/TerritoryBrowser";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const restArticles = articles.slice(1, 5);
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
      {/* Hero — concise, direct */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-14 sm:pt-20 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="font-mincho text-sub-gray text-sm sm:text-base">
              {site.tagline}
            </p>
            <h1 className="mt-3 logo-type text-5xl sm:text-7xl text-ink leading-none">
              {site.name}
            </h1>
            <p className="mt-8 text-lg sm:text-xl leading-[1.85] text-ink max-w-[34rem]">
              男性のコンプレックスを、当事者の声で記録するメディアです。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Link
                href="/articles"
                className="text-sm text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                記録を読む →
              </Link>
              <Link
                href="/reflect"
                className="text-sm text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
              >
                いまの自分を整理する →
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <HeroMark />
          </div>
        </div>
      </section>

      {/* Territories — interactive browser, no page transition */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-24">
        <TerritoryBrowser territories={territories} articles={articles} />
      </section>

      {/* Events — horizontal scroll rail */}
      {upcomingEvents.length > 0 && (
        <section
          aria-labelledby="events"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-24"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h2 id="events" className="text-xl sm:text-2xl font-bold leading-[1.7]">
              静かな集まり
            </h2>
            <Link
              href="/events"
              className="text-sm text-navy hover:text-gold transition-colors"
            >
              すべて見る
            </Link>
          </div>
          <p className="text-[0.9375rem] text-sub-gray leading-[1.9] mb-6 max-w-[36rem]">
            少人数・半公開で行う、整える時間。横にスクロールして眺めてください。
          </p>
          <EventsRail events={upcomingEvents} />
        </section>
      )}

      {/* Featured article + recent records */}
      <section
        aria-labelledby="latest"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-24"
      >
        <div className="flex items-baseline justify-between mb-8">
          <h2 id="latest" className="text-xl sm:text-2xl font-bold leading-[1.7]">
            最近の記録
          </h2>
          <Link
            href="/articles"
            className="text-sm text-navy hover:text-gold transition-colors"
          >
            すべて見る
          </Link>
        </div>

        {featuredArticle ? (
          <div className="space-y-10">
            <FeaturedArticle article={featuredArticle} />
            {restArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 pt-2">
                {restArticles.map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="card" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-sub-gray leading-[2] max-w-reading">
            記事はまもなく公開されます。
          </p>
        )}
      </section>

      {/* Reflect + Letters */}
      <section
        aria-labelledby="reflect-letters"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-24"
      >
        <h2 id="reflect-letters" className="sr-only">
          記録を探す・書く
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Link
            href="/reflect"
            className="group bg-paper border border-hair-line p-7 sm:p-9 hover:border-gold transition-colors"
          >
            <h3 className="text-lg font-bold leading-[1.6] text-ink group-hover:text-navy transition-colors">
              いまの自分に近い記録を、探す
            </h3>
            <p className="mt-3 font-mincho text-sm text-sub-gray leading-[1.9]">
              5 つの問いに静かに答えると、近い記録が並びます。
              診断ではなく、絞り込みとして。
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-navy">
              はじめる →
            </span>
          </Link>
          <Link
            href="/letters"
            className="group bg-paper border border-hair-line p-7 sm:p-9 hover:border-gold transition-colors"
          >
            <h3 className="text-lg font-bold leading-[1.6] text-ink group-hover:text-navy transition-colors">
              静かなお便り
            </h3>
            <p className="mt-3 font-mincho text-sm text-sub-gray leading-[1.9]">
              書きたくなったら、ここに。
              返信は約束できませんが、必ず読みます。
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-navy">
              書く →
            </span>
          </Link>
        </div>
      </section>

      {/* Manifesto */}
      <section
        aria-labelledby="manifesto"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-24"
      >
        <div className="bg-paper border border-hair-line px-6 sm:px-12 lg:px-16 py-12 sm:py-14 max-w-reading">
          <h2 id="manifesto" className="text-xl sm:text-2xl font-bold leading-[1.7]">
            このサイトについて
          </h2>
          <div className="mt-6 text-[1.0625rem] leading-[2.1] text-ink space-y-5">
            <p>
              解決策を売る場所ではありません。
              治した話ではなく、まだ整えている途中の話。
              身体と自意識のあいだに残った景色を、低い声で記録しています。
            </p>
            <p>
              声を張らず、万人受けは目指しません。
              後ろから歩いてくる人の、半歩先にだけ届けばいい。
            </p>
          </div>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-2 text-sm text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
          >
            くわしく
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Subscribe band */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.5]">
              月に一度か二度、
              <br />
              ニュースレターでお送りします。
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-[2] text-white/80 max-w-[34rem]">
              新しく書いた記録と、まだ記事にしていない覚え書きを、お送りします。
              通知も煽りもありません。
            </p>
          </div>
          <div className="lg:justify-self-end">
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Substack で購読する
              <span aria-hidden>→</span>
            </a>
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
          <stop offset="0%" stopColor="#F7F0E2" />
          <stop offset="100%" stopColor="#E4D3A8" />
        </linearGradient>
        <radialGradient id="hero-warm" cx="70%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#F1DDA8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F7F0E2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="500" height="500" fill="url(#hero-bg)" />
      <rect width="500" height="500" fill="url(#hero-warm)" />
      <g transform="translate(250 250)" fill="none" stroke="#B08755">
        <circle r="200" strokeWidth="0.8" strokeOpacity="0.18" />
        <circle r="160" strokeWidth="0.7" strokeOpacity="0.28" />
        <circle r="120" strokeWidth="0.7" strokeOpacity="0.45" />
        <circle r="80" strokeWidth="0.6" strokeOpacity="0.6" />
        <circle r="40" strokeWidth="0.6" strokeOpacity="0.75" />
        <circle r="12" fill="#B08755" fillOpacity="0.5" stroke="none" />
      </g>
      <line x1="250" y1="50" x2="250" y2="450" stroke="#1B2A47" strokeWidth="0.5" strokeOpacity="0.18" />
      <line x1="0" y1="309" x2="500" y2="309" stroke="#B08755" strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="2" fill="#1B2A47" opacity="0.35" />
      <circle cx="410" cy="120" r="2" fill="#1B2A47" opacity="0.25" />
      <circle cx="90" cy="400" r="2.5" fill="#B08755" />
    </svg>
  );
}
