"use client";

import Link from "next/link";
import TrackedCTA from "./TrackedCTA";
import { site } from "@/lib/site";

type EventLite = {
  slug: string;
  title: string;
  dateText: string;
  applyUrl?: string;
};

type Props = {
  articleSlug: string;
  event?: EventLite | null;
};

/**
 * End-of-article conversion block. Leads readers who finished a record
 * toward the two conversion goals: a Quiet Gathering (if one is open)
 * and the newsletter. Both CTAs are tracked with article context.
 */
export default function ArticleConversion({ articleSlug, event }: Props) {
  return (
    <section className="mt-24 border-t border-hair-line pt-12">
      {event && event.applyUrl && (
        <div className="bg-paper border border-hair-line p-6 sm:p-8 mb-8">
          <p className="logo-type text-[10px] tracking-[0.4em] uppercase text-gold">
            Quiet Gatherings
          </p>
          <h2 className="mt-3 font-mincho text-xl sm:text-2xl font-medium leading-[1.5] text-ink">
            {event.title}
          </h2>
          <p className="mt-3 text-[13px] text-sub-gray tracking-[0.04em]">
            {event.dateText}
          </p>
          <p className="mt-4 text-sm leading-[1.95] text-ink/80 max-w-[34rem]">
            読むだけでなく、整える時間そのものに立ち会う場所があります。
            少人数・半公開で行っています。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <TrackedCTA
              href={event.applyUrl}
              event="gathering_apply"
              eventProps={{
                event_slug: event.slug,
                location: "article_end",
                from_article: articleSlug,
              }}
              className="btn-gold !py-3 !px-6 text-xs"
            >
              応募する
              <span aria-hidden>→</span>
            </TrackedCTA>
            <Link
              href={`/events/${event.slug}`}
              className="text-sm text-navy border-b border-navy/40 pb-1 hover:border-navy transition-colors"
            >
              くわしく見る
            </Link>
          </div>
        </div>
      )}

      <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-4">
        A Quiet Delivery
      </p>
      <p className="font-mincho text-[0.9375rem] leading-[2] text-ink max-w-[28rem]">
        この記録に時間を使ってくれてありがとうございました。
        次のものが書けたとき、静かに知らせます。
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <TrackedCTA
          href={site.social.substack}
          event="subscribe_click"
          eventProps={{ location: "article_end", from_article: articleSlug }}
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          ニュースレターを購読
        </TrackedCTA>
        <Link
          href="/articles"
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          他の記録を読む
        </Link>
        <a
          href={`mailto:${site.email}`}
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          連絡する
        </a>
      </div>
    </section>
  );
}
