import Link from "next/link";
import CoverImage from "./CoverImage";
import {
  EventFrontmatter,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";

type Props = { event: EventFrontmatter };

export default function FeaturedEvent({ event }: Props) {
  const dateText = formatEventDate(event.startsAt);
  const timeText = formatEventTimeRange(event.startsAt, event.endsAt);
  const isOpen = event.status === "open";

  return (
    <section
      aria-labelledby="featured-event"
      className="mx-auto max-w-[1200px] px-6 sm:px-10"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-8 leading-[1.7]">
        受付中のイベント
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        <div className="order-2 lg:order-1">
          <h3
            id="featured-event"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.5] text-ink"
          >
            <Link
              href={`/events/${event.slug}`}
              className="hover:text-navy transition-colors"
            >
              {event.title}
            </Link>
          </h3>

          <p className="mt-5 font-mincho text-[1.0625rem] leading-[2.1] text-ink max-w-[34rem]">
            {event.excerpt}
          </p>

          <dl className="mt-8 grid grid-cols-[5rem_1fr] gap-y-3 gap-x-4 text-sm border-t border-hair-line pt-6">
            <dt className="text-xs text-sub-gray">日時</dt>
            <dd className="text-ink">
              {dateText}
              <span className="block text-xs text-sub-gray mt-0.5">
                {timeText}
              </span>
            </dd>
            <dt className="text-xs text-sub-gray">場所</dt>
            <dd className="text-ink">{event.location}</dd>
            {event.audience && (
              <>
                <dt className="text-xs text-sub-gray">対象</dt>
                <dd className="text-ink">{event.audience}</dd>
              </>
            )}
            {event.format && (
              <>
                <dt className="text-xs text-sub-gray">形式</dt>
                <dd className="text-ink">{event.format}</dd>
              </>
            )}
            {event.fee && (
              <>
                <dt className="text-xs text-sub-gray">参加費</dt>
                <dd className="text-ink">{event.fee}</dd>
              </>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {isOpen && event.applyUrl && (
              <a
                href={event.applyUrl}
                target={
                  event.applyUrl.startsWith("http") ? "_blank" : undefined
                }
                rel={
                  event.applyUrl.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="btn-gold"
              >
                応募する
                <span aria-hidden>→</span>
              </a>
            )}
            <Link
              href={`/events/${event.slug}`}
              className="text-sm text-navy border-b border-navy/40 pb-1 hover:border-navy transition-colors"
            >
              くわしく見る
            </Link>
          </div>
        </div>

        <Link
          href={`/events/${event.slug}`}
          className="block order-1 lg:order-2 group"
          aria-hidden
          tabIndex={-1}
        >
          <CoverImage
            src={event.cover}
            alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
            eyebrow={dateText}
            title={event.title}
            meta={event.location}
            aspectRatio="4/3"
            size="lg"
            priority
          />
        </Link>
      </div>
    </section>
  );
}
