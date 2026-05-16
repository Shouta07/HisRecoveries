import Link from "next/link";
import CoverImage from "./CoverImage";
import SectionLabel from "./SectionLabel";
import {
  EventFrontmatter,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";

type Props = { events: EventFrontmatter[] };

/**
 * Quiet Gatherings — the experience business, placed directly under
 * the hero as the primary lineup. Single event renders horizontally
 * (cover + info side by side); multiple events render as a grid.
 */
export default function QuietGatherings({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section
      aria-labelledby="quiet-gatherings"
      className="mx-auto max-w-[1100px] px-6 sm:px-10 py-14 sm:py-20"
    >
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div id="quiet-gatherings">
          <SectionLabel en="Quiet Gatherings" ja="体験事業" />
          <p className="mt-3 text-[13px] sm:text-sm text-sub-gray leading-[1.95] max-w-[36rem]">
            少人数・半公開で行う、整える時間。
          </p>
        </div>
        <Link
          href="/events"
          className="text-xs sm:text-sm text-navy hover:text-gold transition-colors"
        >
          すべての集まり →
        </Link>
      </div>

      <div className="mt-9 sm:mt-12">
        {events.length === 1 ? (
          <Single event={events[0]} />
        ) : (
          <Grid events={events} />
        )}
      </div>
    </section>
  );
}

function Single({ event }: { event: EventFrontmatter }) {
  const dateText = formatEventDate(event.startsAt);
  const timeText = formatEventTimeRange(event.startsAt, event.endsAt);
  const isOpen = event.status === "open";

  return (
    <article className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-center bg-paper border border-hair-line">
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

      <div className="px-6 sm:px-10 lg:pl-0 lg:pr-10 pb-9 lg:py-10">
        {isOpen && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-gold tracking-[0.08em] mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
            受付中
          </span>
        )}

        <h3 className="font-mincho text-2xl sm:text-3xl font-medium leading-[1.45] text-ink">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-navy transition-colors"
          >
            {event.title}
          </Link>
        </h3>

        <p className="mt-5 text-sm sm:text-[0.9375rem] leading-[2] text-ink/80 max-w-[34rem]">
          {event.excerpt}
        </p>

        <dl className="mt-7 grid grid-cols-[4.5rem_1fr] gap-y-2.5 gap-x-4 text-sm border-t border-hair-line pt-5">
          <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">日時</dt>
          <dd className="text-ink">
            {dateText}
            <span className="block text-[11px] text-sub-gray mt-0.5">
              {timeText}
            </span>
          </dd>
          <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">場所</dt>
          <dd className="text-ink">{event.location}</dd>
          {event.format && (
            <>
              <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">形式</dt>
              <dd className="text-ink">{event.format}</dd>
            </>
          )}
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          {isOpen && event.applyUrl && (
            <a
              href={event.applyUrl}
              target={event.applyUrl.startsWith("http") ? "_blank" : undefined}
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
    </article>
  );
}

function Grid({ events }: { events: EventFrontmatter[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {events.map((e) => (
        <li key={e.slug}>
          <CardEvent event={e} />
        </li>
      ))}
    </ul>
  );
}

function CardEvent({ event }: { event: EventFrontmatter }) {
  const dateText = formatEventDate(event.startsAt);
  const isOpen = event.status === "open";
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block"
      aria-label={event.title}
    >
      <CoverImage
        src={event.cover}
        alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
        eyebrow={dateText}
        title={event.title}
        meta={event.location}
        aspectRatio="16/10"
        size="md"
      />
      <div className="mt-4">
        <p className="text-[11px] text-sub-gray tracking-[0.06em]">
          {dateText}
          {isOpen && (
            <>
              <span className="mx-1.5">·</span>
              <span className="text-gold">受付中</span>
            </>
          )}
        </p>
        <h3 className="mt-2 text-[15px] sm:text-base font-bold leading-[1.65] text-ink group-hover:text-navy transition-colors line-clamp-3">
          {event.title}
        </h3>
        <p className="mt-2 text-[11px] text-sub-gray tracking-[0.04em]">
          {event.location}
          {event.format && (
            <>
              <span className="mx-1.5">·</span>
              {event.format}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
