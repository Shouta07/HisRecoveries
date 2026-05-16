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
      className="bg-navy text-white overflow-hidden"
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-0">
        {/* Left: copy */}
        <div className="px-6 sm:px-10 py-12 sm:py-16 lg:py-20 lg:pr-12 order-2 lg:order-1">
          <div className="flex items-center gap-3 flex-wrap mb-6">
            {isOpen && (
              <span className="inline-flex items-center gap-1.5 border border-gold text-gold px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
                受付中 — Now Booking
              </span>
            )}
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/65">
              Featured Gathering
            </p>
          </div>

          <h2
            id="featured-event"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.4]"
          >
            <Link
              href={`/events/${event.slug}`}
              className="hover:text-gold-bright transition-colors"
            >
              {event.title}
            </Link>
          </h2>

          <p className="mt-6 font-mincho text-[1.0625rem] leading-[2] text-white/90 max-w-[34rem]">
            {event.excerpt}
          </p>

          <dl className="mt-10 grid grid-cols-[6rem_1fr] gap-y-3 gap-x-4 text-sm border-t border-white/15 pt-6">
            <dt className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Date
            </dt>
            <dd>
              {dateText}
              <span className="block text-xs text-white/65 mt-0.5">
                {timeText}
              </span>
            </dd>
            <dt className="text-[10px] tracking-[0.3em] uppercase text-gold">
              Where
            </dt>
            <dd>{event.location}</dd>
            {event.audience && (
              <>
                <dt className="text-[10px] tracking-[0.3em] uppercase text-gold">
                  For
                </dt>
                <dd>{event.audience}</dd>
              </>
            )}
            {event.format && (
              <>
                <dt className="text-[10px] tracking-[0.3em] uppercase text-gold">
                  Format
                </dt>
                <dd>{event.format}</dd>
              </>
            )}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
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
                β 参加応募はこちら
                <span aria-hidden>→</span>
              </a>
            )}
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-2 text-sm tracking-wider text-white border-b border-white/40 pb-1 hover:text-gold-bright hover:border-gold-bright transition-colors"
            >
              詳細を読む
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Right: cover */}
        <Link
          href={`/events/${event.slug}`}
          className="block order-1 lg:order-2 group"
          aria-hidden
          tabIndex={-1}
        >
          <CoverImage
            src={event.cover}
            alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
            eyebrow={`A Quiet Gathering · ${dateText}`}
            title={event.title}
            meta={event.location}
            aspectRatio="4/3"
            size="lg"
            priority
            className="!border-0"
          />
        </Link>
      </div>
    </section>
  );
}
