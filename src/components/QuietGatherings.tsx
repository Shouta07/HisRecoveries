import Link from "next/link";
import CoverImage from "./CoverImage";
import SectionLabel from "./SectionLabel";
import TrackedCTA from "./TrackedCTA";
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
      className="mx-auto max-w-[1100px] px-6 sm:px-10 py-10 sm:py-14"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div id="quiet-gatherings" className="flex items-center gap-5">
          <SectionLabel en="Quiet Gatherings" ja="体験事業 — 少人数・半公開で行う、整える時間" />
        </div>
        <Link
          href="/events"
          className="text-xs sm:text-sm text-ink hover:text-gold transition-colors"
        >
          すべての集まり →
        </Link>
      </div>

      <div className="mt-6 sm:mt-8">
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
    <article className="grid grid-cols-1 sm:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr_auto] gap-5 sm:gap-7 lg:gap-10 items-center bg-paper border border-hair-line p-4 sm:p-5">
      <Link
        href={`/events/${event.slug}`}
        className="block group"
        aria-hidden
        tabIndex={-1}
      >
        <div className="cover-zoom">
          <CoverImage
            src={event.cover}
            alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
            eyebrow={dateText}
            title={event.title}
            meta={event.location}
            aspectRatio="16/10"
            size="md"
          />
        </div>
      </Link>

      <div className="min-w-0">
        <p className="text-[12px] text-sub-gray tracking-[0.08em]">
          {dateText}
          <span className="mx-1.5">·</span>
          {timeText}
          {isOpen && (
            <>
              <span className="mx-1.5">·</span>
              <span className="text-gold">受付中</span>
            </>
          )}
        </p>
        <h3 className="mt-2 text-lg sm:text-xl font-bold leading-[1.55] text-ink">
          <Link
            href={`/events/${event.slug}`}
            className="hover:text-ink transition-colors"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 text-[13.5px] text-sub-gray tracking-[0.04em]">
          {event.location}
          {event.format && (
            <>
              <span className="mx-1.5">·</span>
              {event.format}
            </>
          )}
        </p>
      </div>

      <div className="lg:justify-self-end">
        {isOpen && event.applyUrl ? (
          <TrackedCTA
            href={event.applyUrl}
            event="gathering_apply"
            eventProps={{ event_slug: event.slug, location: "home" }}
            className="btn-gold !py-3 !px-6 text-xs"
          >
            応募する
            <span aria-hidden>→</span>
          </TrackedCTA>
        ) : (
          <Link
            href={`/events/${event.slug}`}
            className="text-sm text-ink border-b border-navy/40 pb-1 hover:border-navy transition-colors"
          >
            くわしく見る →
          </Link>
        )}
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
      className="group block card-lift"
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
        <p className="text-[12px] text-sub-gray tracking-[0.06em]">
          {dateText}
          {isOpen && (
            <>
              <span className="mx-1.5">·</span>
              <span className="text-gold">受付中</span>
            </>
          )}
        </p>
        <h3 className="mt-2 text-[15px] sm:text-base font-bold leading-[1.65] text-ink group-hover:text-ink transition-colors line-clamp-3">
          {event.title}
        </h3>
        <p className="mt-2 text-[12px] text-sub-gray tracking-[0.04em]">
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
