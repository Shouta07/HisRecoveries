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
      {/* Navy tag — like the ad's "美容初心者の男性へ" */}
      <div className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 text-[11px] tracking-[0.2em] uppercase mb-6">
        Featured Gathering
        {isOpen && (
          <>
            <span aria-hidden className="text-gold">·</span>
            <span className="text-gold-bright">受付中</span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
        {/* Left: copy */}
        <div className="order-2 lg:order-1">
          <h2
            id="featured-event"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.5] text-ink"
          >
            <Link
              href={`/events/${event.slug}`}
              className="hover:text-navy transition-colors"
            >
              {event.title}
            </Link>
          </h2>

          <p className="mt-6 font-mincho text-[1.0625rem] leading-[2.1] text-ink max-w-[34rem]">
            {event.excerpt}
          </p>

          {/* Feature chips like the ad's icon row */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink">
            <li className="inline-flex items-center gap-2">
              <Chip>{dateText}</Chip>
            </li>
            <li className="inline-flex items-center gap-2">
              <Chip>{timeText}</Chip>
            </li>
            {event.format && (
              <li className="inline-flex items-center gap-2">
                <Chip>{event.format}</Chip>
              </li>
            )}
          </ul>

          <dl className="mt-8 grid grid-cols-[5.5rem_1fr] gap-y-3 gap-x-4 text-sm border-t border-hair-line pt-6">
            <dt className="text-[10px] tracking-[0.3em] uppercase text-sub-gray">
              Where
            </dt>
            <dd className="text-ink">{event.location}</dd>
            {event.audience && (
              <>
                <dt className="text-[10px] tracking-[0.3em] uppercase text-sub-gray">
                  For
                </dt>
                <dd className="text-ink">{event.audience}</dd>
              </>
            )}
            {event.fee && (
              <>
                <dt className="text-[10px] tracking-[0.3em] uppercase text-sub-gray">
                  Fee
                </dt>
                <dd className="text-ink">{event.fee}</dd>
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
              className="inline-flex items-center gap-2 text-sm tracking-wider text-navy border-b border-navy/40 pb-1 hover:border-navy transition-colors"
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
          />
        </Link>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-3 py-1 bg-paper border border-hair-line text-xs tracking-wider">
      {children}
    </span>
  );
}
