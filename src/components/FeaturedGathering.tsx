import Link from "next/link";
import CoverImage from "./CoverImage";
import {
  EventFrontmatter,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";

type Props = { event: EventFrontmatter };

/**
 * Dedicated, conversion-focused section for the next Quiet Gathering.
 * This is the revenue core of the business — treated with hero-like weight.
 */
export default function FeaturedGathering({ event }: Props) {
  const dateText = formatEventDate(event.startsAt);
  const timeText = formatEventTimeRange(event.startsAt, event.endsAt);
  const isOpen = event.status === "open";

  return (
    <div className="bg-cream-deep">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-28">
        <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 mb-10 sm:mb-14">
          <div className="flex items-start gap-4 sm:gap-6">
            <p
              className="logo-type text-[10px] sm:text-xs tracking-[0.5em] uppercase text-gold shrink-0 sm:pt-2"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              The Next Gathering
            </p>
            <h2 className="font-mincho text-2xl sm:text-4xl font-medium leading-[1.45] text-ink">
              次の集まり
            </h2>
          </div>
          <div className="flex items-start justify-end">
            <Link
              href="/events"
              className="text-sm text-navy hover:text-gold transition-colors"
            >
              すべての集まり →
            </Link>
          </div>
        </div>

        <p className="text-[0.9375rem] text-sub-gray leading-[2] mb-10 max-w-[36rem]">
          少人数・半公開で行う、整える時間。Quiet Gatherings は、
          このメディアの中核に位置する体験事業です。
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          <Link
            href={`/events/${event.slug}`}
            className="block group"
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
            />
          </Link>

          <div>
            {isOpen && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gold mb-4">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
                受付中
              </span>
            )}

            <h3 className="font-mincho text-3xl sm:text-4xl font-medium leading-[1.45] text-ink">
              <Link
                href={`/events/${event.slug}`}
                className="hover:text-navy transition-colors"
              >
                {event.title}
              </Link>
            </h3>

            <p className="mt-6 text-[1rem] leading-[2.05] text-ink max-w-[34rem]">
              {event.excerpt}
            </p>

            <dl className="mt-9 grid grid-cols-[5rem_1fr] gap-y-3 gap-x-4 text-sm border-t border-hair-line pt-6">
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
            </dl>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
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
        </div>
      </div>
    </div>
  );
}
