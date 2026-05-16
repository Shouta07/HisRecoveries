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

function StatusBadge({ status }: { status: EventFrontmatter["status"] }) {
  const label =
    status === "open"
      ? "受付中"
      : status === "closed"
        ? "募集終了"
        : status === "completed"
          ? "終了"
          : "";
  if (!label) return null;
  const tone =
    status === "open"
      ? "text-quiet-brass border-quiet-brass/60"
      : "text-sub-gray border-hair-line";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${tone} px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          status === "open" ? "bg-quiet-brass" : "bg-sub-gray"
        }`}
      />
      {label}
    </span>
  );
}

export default function EventCard({ event, size = "md" }: Props) {
  const dateText = formatEventDate(event.startsAt);
  const timeText = formatEventTimeRange(event.startsAt, event.endsAt);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block"
      aria-label={`${event.title} — ${dateText}`}
    >
      <CoverImage
        src={event.cover}
        alt={event.coverAlt ?? `${event.title}（イベントカバー）`}
        eyebrow={`A Gathering · ${dateText}`}
        title={event.title}
        meta={event.location}
        aspectRatio={size === "lg" ? "4/3" : "16/10"}
        size={size}
      />
      <div className="mt-5 sm:mt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={event.status} />
          <p className="text-[10px] tracking-[0.3em] uppercase text-sub-gray">
            {dateText} · {timeText}
          </p>
        </div>
        <h3 className="mt-3 font-mincho text-xl sm:text-2xl leading-[1.55] text-ink group-hover:text-quiet-brass transition-colors">
          {event.title}
        </h3>
        <p className="mt-3 text-sm leading-loose text-sub-gray line-clamp-2">
          {event.excerpt}
        </p>
        <p className="mt-4 text-xs tracking-wider text-sub-gray/80">
          {event.location}
          {event.format && (
            <>
              <span className="mx-2">·</span>
              {event.format}
            </>
          )}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm text-ink border-b border-hair-line group-hover:border-ink transition-colors pb-0.5">
          詳細を読む
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
