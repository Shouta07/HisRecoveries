import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import EventCard from "@/components/EventCard";
import FeaturedEvent from "@/components/FeaturedEvent";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

export default function HomePage() {
  const latest = getAllArticles().slice(0, 4);
  const upcomingEvents = getUpcomingEvents();
  const featuredEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1);
  const territories = getAllTerritories();

  return (
    <>
      {/* Hero — plain intro */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-24">
        <p className="font-mincho text-sub-gray text-sm sm:text-base">
          {site.tagline}
        </p>
        <h1 className="mt-3 logo-type text-5xl sm:text-7xl text-ink leading-none">
          {site.name}
        </h1>
        <p className="mt-10 text-base sm:text-lg leading-[2] text-ink max-w-[36rem]">
          多汗症、ニキビ、ワキガ、顔。
          <br className="hidden sm:block" />
          言葉にされにくい男性の身体と自意識について、
          半歩先を歩いた人間が、低い声で書きます。
        </p>
      </section>

      {/* Featured event */}
      {featuredEvent && (
        <div className="pb-20 sm:pb-28">
          <FeaturedEvent event={featuredEvent} />
        </div>
      )}

      {/* Manifesto */}
      <section
        aria-labelledby="manifesto"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="bg-paper border border-hair-line px-6 sm:px-12 lg:px-16 py-12 sm:py-16 max-w-reading">
          <h2 id="manifesto" className="text-xl sm:text-2xl font-bold leading-[1.7]">
            このサイトについて
          </h2>
          <div className="mt-7 text-[1.0625rem] leading-[2.1] text-ink space-y-5">
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
            className="mt-8 inline-flex items-center gap-2 text-sm text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
          >
            くわしく
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Territories — 6 quiet maps */}
      <section
        aria-labelledby="territories"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="flex items-baseline justify-between mb-8">
          <h2
            id="territories"
            className="text-xl sm:text-2xl font-bold leading-[1.7]"
          >
            地形図を読む
          </h2>
          <Link
            href="/territories"
            className="text-sm text-navy hover:text-gold transition-colors"
          >
            すべて見る
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {territories.map((t) => (
            <Link
              key={t.slug}
              href={`/territories/${t.slug}`}
              className="group bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors"
            >
              <h3 className="text-lg font-bold leading-[1.6] text-ink group-hover:text-navy transition-colors">
                {t.title}
              </h3>
              <p className="mt-2 font-mincho text-[13px] text-sub-gray leading-[1.9]">
                {t.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Reflect + Letters — twin entry points */}
      <section
        aria-labelledby="reflect-letters"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <h2 id="reflect-letters" className="sr-only">
          整理する・書く
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <Link
            href="/reflect"
            className="group bg-paper border border-hair-line p-7 sm:p-9 hover:border-gold transition-colors"
          >
            <h3 className="text-lg font-bold leading-[1.6] text-ink group-hover:text-navy transition-colors">
              いまの自分を、整理する
            </h3>
            <p className="mt-3 font-mincho text-sm text-sub-gray leading-[1.9]">
              5 つの問いに静かに答えるだけ。
              診断ではなく、観察として、自分の場所を言葉にしてみる。
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

      {/* Recent records */}
      <section
        aria-labelledby="latest"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="flex items-baseline justify-between mb-10">
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
        {latest.length === 0 ? (
          <p className="text-sm text-sub-gray leading-[2] max-w-reading">
            記事はまもなく公開されます。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
            {latest.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="card" />
            ))}
          </div>
        )}
      </section>

      {/* More gatherings */}
      {otherEvents.length > 0 && (
        <section
          aria-labelledby="more-gatherings"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
        >
          <div className="flex items-baseline justify-between mb-10">
            <h2
              id="more-gatherings"
              className="text-xl sm:text-2xl font-bold leading-[1.7]"
            >
              ほかのイベント
            </h2>
            <Link
              href="/events"
              className="text-sm text-navy hover:text-gold transition-colors"
            >
              すべて見る
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
            {otherEvents.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}

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
