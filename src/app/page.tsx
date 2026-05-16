import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import EventCard from "@/components/EventCard";
import FeaturedEvent from "@/components/FeaturedEvent";
import { getUpcomingEvents } from "@/lib/events";
import { categories, site } from "@/lib/site";

export default function HomePage() {
  const latest = getAllArticles().slice(0, 4);
  const upcomingEvents = getUpcomingEvents();
  const featuredEvent = upcomingEvents[0];
  const otherEvents = upcomingEvents.slice(1);

  return (
    <>
      {/* Hero — cream background, dark bold headline (like the LP) */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-14 sm:pt-20 pb-20 sm:pb-24">
        <div className="inline-flex items-center bg-navy text-white px-4 py-2 text-[11px] tracking-[0.2em] uppercase mb-8">
          For Men, Quietly — 男性の身体と自意識の記録
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.5] text-ink max-w-[36rem]">
          解決ではなく、
          <br />
          <span className="font-mincho font-normal">記録</span>を残します。
        </h1>

        <p className="mt-8 text-base sm:text-lg leading-[2] text-ink max-w-[40rem]">
          多汗症・ニキビ・ワキガ・顔。
          <br className="hidden sm:block" />
          男性の身体と自意識に関わる、言葉にされにくい領域を、
          半歩先から低い声で記録します。
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm tracking-wider text-navy border-b border-gold pb-1 hover:text-gold transition-colors"
          >
            記録を読む
            <span aria-hidden>→</span>
          </Link>
          {featuredEvent && (
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm tracking-wider text-navy border-b border-gold pb-1 hover:text-gold transition-colors"
            >
              開催中のイベントを見る
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </section>

      {/* Featured event on cream — first concrete thing */}
      {featuredEvent && (
        <div className="pb-20 sm:pb-28">
          <FeaturedEvent event={featuredEvent} />
        </div>
      )}

      {/* Manifesto — white card on cream */}
      <section
        aria-labelledby="manifesto"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="bg-paper border border-hair-line px-6 sm:px-12 lg:px-16 py-12 sm:py-16 max-w-reading">
          <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-5">
            I. Manifesto
          </p>
          <h2
            id="manifesto"
            className="text-2xl sm:text-3xl font-bold leading-[1.55] text-ink"
          >
            解決策ではなく、
            <span className="font-mincho font-normal">記録</span>
            を残します。
          </h2>
          <div className="mt-7 text-[1.0625rem] leading-[2.1] text-ink space-y-5">
            <p>
              治した話ではなく、まだ整えている途中の話。
              完了した過去としてではなく、続いている現在として、
              身体と自意識のあいだに残った景色を、低い声で記録しています。
            </p>
            <p className="font-mincho text-sub-gray">
              声を張りません。万人受けは目指しません。
              ただ、後ろから歩いてくる人の、半歩先にだけ届けばいい。
            </p>
          </div>
          <Link
            href="/about"
            className="mt-9 inline-flex items-center gap-2 text-sm tracking-wider text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
          >
            このメディアについて
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Territories */}
      <section
        aria-labelledby="territories"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-8">
          II. Territories — 扱う領域
        </p>
        <h2 id="territories" className="sr-only">
          扱う領域
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { slug: "hyperhidrosis", numeral: "I" },
            { slug: "acne", numeral: "II" },
            { slug: "bromhidrosis", numeral: "III" },
            { slug: "face", numeral: "IV" },
          ].map(({ slug, numeral }) => {
            const c = categories[slug as keyof typeof categories];
            return (
              <Link
                key={slug}
                href={`/articles/category/${slug}`}
                className="group bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors"
              >
                <p className="logo-type text-gold text-sm tracking-widest">
                  {numeral}.
                </p>
                <h3 className="mt-3 text-lg font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
                  {c.label}
                </h3>
                <p className="mt-2 text-[13px] text-sub-gray leading-[1.85] font-mincho">
                  {c.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-wider text-navy">
                  読む <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent records */}
      <section
        aria-labelledby="latest"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 sm:pb-28"
      >
        <div className="flex items-baseline justify-between mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
            III. Recent Records — 最近の記録
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs tracking-wider text-navy hover:text-gold transition-colors"
          >
            すべて見る <span aria-hidden>→</span>
          </Link>
        </div>
        <h2 id="latest" className="sr-only">
          最近の記録
        </h2>
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
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
              IV. More Gatherings
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs tracking-wider text-navy hover:text-gold transition-colors"
            >
              すべて見る <span aria-hidden>→</span>
            </Link>
          </div>
          <h2 id="more-gatherings" className="sr-only">
            ほかの集まり
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
            {otherEvents.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom navy band — Subscribe CTA, the only navy block on home */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold-bright mb-4">
              Subscribe — ときどき、静かに届く
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.5]">
              月に一度か二度、
              <br />
              静かに届くニュースレター。
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-[2] text-white/80 max-w-[34rem]">
              新しく書いた記録と、まだ記事にしていない覚え書きを、お送りします。
              通知も、ボタンも、煽りもありません。
            </p>
          </div>
          <div className="flex flex-col sm:items-start lg:items-end gap-4">
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Substack で購読する
              <span aria-hidden>→</span>
            </a>
            <p className="logo-type text-xs tracking-[0.3em] text-gold-bright uppercase">
              —— Nagi
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
