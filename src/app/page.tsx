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
      {/* Brand band — navy ribbon under the header */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-14 sm:py-20">
          <p className="text-[10px] tracking-[0.3em] text-gold uppercase">
            For Men, Quietly — 男性の身体と自意識のための記録
          </p>
          <h1 className="mt-5 text-3xl sm:text-5xl font-bold leading-[1.4] max-w-[34rem]">
            ここは、
            <br />
            <span className="font-mincho font-normal">
              「整える」
            </span>
            ための場所です。
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/85 leading-[2] max-w-[36rem]">
            多汗症・ニキビ・ワキガ・顔。
            <br className="hidden sm:block" />
            男性の身体と自意識に関わる、言葉にされにくい領域を、
            半歩先から低い声で記録します。
          </p>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-sm tracking-wider text-white border-b border-white/50 pb-1 hover:text-gold-bright hover:border-gold-bright transition-colors"
            >
              記録を読む
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm tracking-wider text-white border-b border-white/50 pb-1 hover:text-gold-bright hover:border-gold-bright transition-colors"
            >
              開催中のイベントを見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured event — full-bleed LP-style block */}
      {featuredEvent && <FeaturedEvent event={featuredEvent} />}

      {/* Manifesto — white card on cream */}
      <section
        aria-labelledby="manifesto"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28"
      >
        <div className="bg-paper border border-hair-line px-6 sm:px-12 lg:px-16 py-12 sm:py-16 max-w-reading">
          <p className="text-[10px] tracking-[0.3em] text-gold uppercase mb-6">
            I. Manifesto
          </p>
          <h2
            id="manifesto"
            className="text-2xl sm:text-3xl font-bold leading-[1.5]"
          >
            解決策ではなく、
            <span className="font-mincho font-normal">記録</span>
            を残します。
          </h2>
          <div className="mt-8 text-[1.0625rem] leading-[2.1] text-ink space-y-5">
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
            className="mt-10 inline-flex items-center gap-2 text-sm tracking-wider text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
          >
            このメディアについて
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Territories — icon-card grid */}
      <section
        aria-labelledby="territories"
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32"
      >
        <div className="mb-10 flex items-baseline justify-between">
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
            II. Territories — 扱う領域
          </p>
        </div>
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
                className="group bg-paper border border-hair-line p-6 sm:p-8 hover:border-gold transition-colors"
              >
                <p className="logo-type text-gold text-sm tracking-widest">
                  {numeral}.
                </p>
                <h3 className="mt-3 text-lg font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
                  {c.label}
                </h3>
                <p className="mt-2 text-xs text-sub-gray leading-[1.8] font-mincho">
                  {c.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-wider text-navy">
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
        className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32"
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
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32"
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

      {/* Signature & Subscribe band */}
      <section
        aria-labelledby="signature"
        className="mt-24 sm:mt-32 bg-cream-deep"
      >
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
              From the Writer
            </p>
            <h2 id="signature" className="sr-only">
              書き手より
            </h2>
            <p className="font-mincho text-ink text-[1.0625rem] leading-[2.1] max-w-[30rem]">
              書き手は、かつて当事者でした。今は、半歩だけ先にいます。
              振り返ると、まだそこに立っている、という程度の距離です。
            </p>
            <p className="logo-type text-lg text-navy mt-6 tracking-wider">
              —— Nagi
            </p>
          </div>

          <div className="bg-paper border border-hair-line p-8 sm:p-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
              Subscribe — ときどき、静かに届く
            </p>
            <p className="text-[0.9375rem] leading-[2] text-ink">
              月に一度か二度。新しく書いた記録と、まだ記事にしていない覚え書きを、
              ニュースレターに収めて送ります。
            </p>
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-7"
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
