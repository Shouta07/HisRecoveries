import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import WhatsNew from "@/components/WhatsNew";
import EventsRail from "@/components/EventsRail";
import TerritoryBrowser from "@/components/TerritoryBrowser";
import SectionLabel from "@/components/SectionLabel";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  const moreArticles = articles.slice(4, 7);
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
      {/* Hero — editorial cover */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="font-mincho text-sub-gray text-sm sm:text-base">
              {site.tagline}
            </p>
            <h1 className="mt-4 logo-type text-6xl sm:text-8xl text-ink leading-[0.95]">
              {site.name}
            </h1>
            <p className="mt-10 font-mincho text-xl sm:text-2xl leading-[1.85] text-ink max-w-[32rem]">
              男性のコンプレックスを、
              <br className="hidden sm:inline" />
              当事者の声で記録するメディア。
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
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

      {/* WHAT'S NEW — featured + sidebar */}
      {featuredArticle && (
        <section
          aria-labelledby="whats-new"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 mb-10 sm:mb-14">
            <SectionLabel en="What's New" ja="最近の記録" />
            <div className="flex items-end justify-end">
              <Link
                href="/articles"
                className="text-sm text-navy hover:text-gold transition-colors"
              >
                すべて見る →
              </Link>
            </div>
          </div>
          <WhatsNew featured={featuredArticle} rest={sidebarArticles} />
        </section>
      )}

      {/* FEATURE — territory browser */}
      <section
        aria-labelledby="feature"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="mb-10 sm:mb-14">
          <SectionLabel en="Feature" ja="地形図" />
          <p className="mt-4 sm:ml-12 text-[0.9375rem] text-sub-gray leading-[1.9] max-w-[36rem]">
            気になる領域を選ぶと、関連する記録が下に並びます。
          </p>
        </div>
        <TerritoryBrowser
          territories={territories}
          articles={articles}
        />
      </section>

      {/* SCHEDULE — events rail */}
      {upcomingEvents.length > 0 && (
        <section
          aria-labelledby="schedule"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 mb-10 sm:mb-14">
            <SectionLabel en="Schedule" ja="静かな集まり" />
            <div className="flex items-end justify-end">
              <Link
                href="/events"
                className="text-sm text-navy hover:text-gold transition-colors"
              >
                すべて見る →
              </Link>
            </div>
          </div>
          <p className="text-[0.9375rem] text-sub-gray leading-[1.9] mb-6 max-w-[36rem]">
            少人数・半公開で行う、整える時間。
          </p>
          <EventsRail events={upcomingEvents} />
        </section>
      )}

      {/* PICK UP — more records in a 3-card row */}
      {moreArticles.length > 0 && (
        <section
          aria-labelledby="pickup"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
        >
          <div className="mb-10 sm:mb-14">
            <SectionLabel en="Pick Up" ja="ほかの記録" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {moreArticles.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="card" />
            ))}
          </div>
        </section>
      )}

      {/* RELATED CONTENTS — reflect + letters + about */}
      <section
        aria-labelledby="related"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="mb-10 sm:mb-14">
          <SectionLabel en="Related" ja="ほかの入口" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Link
            href="/reflect"
            className="group bg-paper border border-hair-line p-7 hover:border-gold transition-colors"
          >
            <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
              Reflect
            </p>
            <h3 className="mt-3 font-mincho text-lg font-medium leading-[1.6] text-ink group-hover:text-navy transition-colors">
              いまの自分に近い記録を、探す
            </h3>
            <p className="mt-3 text-sm text-sub-gray leading-[1.9]">
              5 つの問いに静かに答えると、近い記録が並びます。
            </p>
          </Link>
          <Link
            href="/letters"
            className="group bg-paper border border-hair-line p-7 hover:border-gold transition-colors"
          >
            <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
              Letters
            </p>
            <h3 className="mt-3 font-mincho text-lg font-medium leading-[1.6] text-ink group-hover:text-navy transition-colors">
              静かなお便り
            </h3>
            <p className="mt-3 text-sm text-sub-gray leading-[1.9]">
              書きたくなったら、ここに。返信は約束できませんが、必ず読みます。
            </p>
          </Link>
          <Link
            href="/about"
            className="group bg-paper border border-hair-line p-7 hover:border-gold transition-colors"
          >
            <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
              About
            </p>
            <h3 className="mt-3 font-mincho text-lg font-medium leading-[1.6] text-ink group-hover:text-navy transition-colors">
              このサイトについて
            </h3>
            <p className="mt-3 text-sm text-sub-gray leading-[1.9]">
              解決策ではなく、整えている途中の話を残しておく場所。
            </p>
          </Link>
        </div>
      </section>

      {/* Subscribe — refined */}
      <section
        aria-labelledby="subscribe-cta"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-24 sm:pb-32"
      >
        <div className="border-t border-hair-line pt-14 sm:pt-20 grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
          <SectionLabel en="Subscribe" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
            <div>
              <h2
                id="subscribe-cta"
                className="font-mincho text-2xl sm:text-4xl font-medium leading-[1.45] text-ink"
              >
                月に一度か二度、
                <br />
                ニュースレターでお送りします。
              </h2>
              <p className="mt-6 text-[0.9375rem] leading-[2] text-ink/75 max-w-[34rem]">
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
