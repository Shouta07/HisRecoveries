import Link from "next/link";
import CoverImage from "./CoverImage";
import {
  EventFrontmatter,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";

type Props = { events: EventFrontmatter[] };

export default function EventsRail({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="relative">
      {/* Horizontal scrolling rail. Bleeds to the screen edge for visual rhythm */}
      <div
        className="overflow-x-auto -mx-6 sm:-mx-10 px-6 sm:px-10 pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        <ul className="flex gap-5 sm:gap-6">
          {events.map((e) => {
            const dateText = formatEventDate(e.startsAt);
            const timeText = formatEventTimeRange(e.startsAt, e.endsAt);
            const isOpen = e.status === "open";
            return (
              <li
                key={e.slug}
                className="snap-start shrink-0 w-[86%] sm:w-[420px] lg:w-[460px]"
              >
                <Link
                  href={`/events/${e.slug}`}
                  className="group block bg-paper border border-hair-line hover:border-gold transition-colors"
                >
                  <CoverImage
                    src={e.cover}
                    alt={e.coverAlt ?? `${e.title}（イベントカバー）`}
                    eyebrow={dateText}
                    title={e.title}
                    meta={e.location}
                    aspectRatio="4/3"
                    size="md"
                  />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-sub-gray">
                      {isOpen && (
                        <span className="inline-flex items-center gap-1.5 text-gold">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
                          受付中
                        </span>
                      )}
                      <span>{dateText}</span>
                      <span>{timeText}</span>
                    </div>
                    <h3 className="mt-3 text-lg sm:text-xl font-bold leading-[1.55] text-ink group-hover:text-ink transition-colors">
                      {e.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.85] text-sub-gray line-clamp-2">
                      {e.excerpt}
                    </p>
                    <p className="mt-3 text-xs tracking-wider text-sub-gray/80">
                      {e.location}
                      {e.format && (
                        <>
                          <span className="mx-2">·</span>
                          {e.format}
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Fade hint on the right edge — suggests there is more */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-cream to-transparent hidden sm:block"
      />
    </div>
  );
}
