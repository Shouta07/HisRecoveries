import Link from "next/link";
import CoverImage from "./CoverImage";
import {
  EventFrontmatter,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";

type Props = {
  event: EventFrontmatter;
  size?: "sm" | "md" | "lg";
};

export default function EventCard({ event, size = "md" }: Props) {
  const dateText = formatEventDate(event.startsAt);
  const timeText = formatEventTimeRange(event.startsAt, event.endsAt);
  const isOpen = event.status === "open";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block"
      aria-label={`${event.title} — ${dateText}`}
    >
      <CoverImage
        src={event.cover}
        alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
        eyebrow={dateText}
        title={event.title}
        meta={event.location}
        aspectRatio={size === "lg" ? "4/3" : "16/10"}
        size={size}
      />
      <div className="mt-5 sm:mt-6">
        <div className="flex items-center gap-3 flex-wrap text-xs text-sub-gray">
          {isOpen && (
            <span className="inline-flex items-center gap-1.5 text-gold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" />
              受付中
            </span>
          )}
          <span>{dateText}</span>
          <span>{timeText}</span>
        </div>
        <h3 className="mt-3 text-xl sm:text-2xl font-bold leading-[1.55] text-ink group-hover:text-navy transition-colors">
          {event.title}
        </h3>
        <p className="mt-3 text-sm leading-loose text-sub-gray line-clamp-2">
          {event.excerpt}
        </p>
        <p className="mt-3 text-xs tracking-wider text-sub-gray/80">
          {event.location}
          {event.format && (
            <>
              <span className="mx-2">·</span>
              {event.format}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
