import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import {
  formatEventDate,
  formatEventDateTime,
  formatEventTimeRange,
  getAllEventSlugs,
  getEvent,
} from "@/lib/events";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const ev = await getEvent(params.slug);
  if (!ev) return {};
  const url = `${site.url}/events/${ev.slug}`;
  return {
    title: ev.title,
    description: ev.excerpt,
    keywords: ev.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: ev.title,
      description: ev.excerpt,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: ev.title,
      description: ev.excerpt,
    },
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const ev = await getEvent(params.slug);
  if (!ev) notFound();

  const url = `${site.url}/events/${ev.slug}`;
  const ogImage = `${url}/opengraph-image`;
  const isOpen = ev.status === "open";

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${url}#event`,
    name: ev.title,
    description: ev.excerpt,
    startDate: ev.startsAt,
    endDate: ev.endsAt ?? ev.startsAt,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: site.language,
    location: {
      "@type": "Place",
      name: ev.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: ev.locationCity ?? "Tokyo",
        addressCountry: "JP",
      },
    },
    image: [ev.cover ?? ogImage],
    organizer: {
      "@type": "Organization",
      "@id": `${site.url}/#publisher`,
      name: site.name,
      url: site.url,
    },
    isAccessibleForFree: false,
    keywords: (ev.keywords ?? []).join(", "),
    audience: ev.audience
      ? { "@type": "Audience", audienceType: ev.audience }
      : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: `${site.url}/events`,
      },
      { "@type": "ListItem", position: 3, name: ev.title, item: url },
    ],
  };

  const statusLabel =
    ev.status === "open"
      ? "受付中"
      : ev.status === "closed"
        ? "募集終了"
        : ev.status === "completed"
          ? "終了"
          : "";

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero on cream — like the LP */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-10 sm:pt-14 pb-16">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-navy transition-colors uppercase"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link
                href="/events"
                className="hover:text-navy transition-colors uppercase"
              >
                Events
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-start">
          {/* Left: copy */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center bg-navy text-white px-4 py-2 text-[11px] tracking-[0.2em] uppercase mb-6">
              A Quiet Gathering
              {isOpen && (
                <>
                  <span aria-hidden className="mx-2 text-gold-bright">·</span>
                  <span className="text-gold-bright">受付中</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.5] text-ink">
              {ev.title}
            </h1>

            <p className="mt-6 font-mincho text-[1.0625rem] leading-[2.1] text-ink max-w-[34rem]">
              {ev.excerpt}
            </p>

            {/* Feature chips */}
            <ul className="mt-8 flex flex-wrap items-center gap-2 text-sm text-ink">
              <Chip>
                <Icon name="calendar" /> {formatEventDate(ev.startsAt)}
              </Chip>
              <Chip>
                <Icon name="clock" /> {formatEventTimeRange(ev.startsAt, ev.endsAt)}
              </Chip>
              {ev.format && (
                <Chip>
                  <Icon name="users" /> {ev.format}
                </Chip>
              )}
              {ev.audience && (
                <Chip>
                  <Icon name="book" /> {ev.audience}
                </Chip>
              )}
            </ul>

            {isOpen && ev.applyUrl && (
              <div className="mt-10">
                <a
                  href={ev.applyUrl}
                  target={
                    ev.applyUrl.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    ev.applyUrl.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="btn-gold"
                >
                  β 参加応募はこちら
                  <span aria-hidden>→</span>
                </a>
              </div>
            )}
          </div>

          {/* Right: cover */}
          <div className="order-1 lg:order-2">
            <CoverImage
              src={ev.cover}
              alt={ev.coverAlt ?? `${ev.title}（イベントカバー）`}
              eyebrow={`A Quiet Gathering · ${formatEventDate(ev.startsAt)}`}
              title={ev.title}
              meta={ev.location}
              aspectRatio="4/3"
              size="lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Body section: white card body + right sticky details */}
      <section className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div className="bg-paper border border-hair-line p-6 sm:p-10 lg:p-14 order-2 lg:order-1">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: ev.contentHtml }}
          />

          <footer className="mt-16 pt-10 border-t border-hair-line text-sm text-sub-gray">
            <p className="logo-type text-base text-navy tracking-wider">
              —— {site.author}
            </p>
            <p className="mt-4 leading-[2]">
              ご質問は{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-navy border-b border-gold hover:text-gold transition-colors"
              >
                {site.email}
              </a>
              、他の集まりは{" "}
              <Link
                href="/events"
                className="text-navy border-b border-gold hover:text-gold transition-colors"
              >
                Events
              </Link>
              。
            </p>
            <p className="mt-6 text-xs text-sub-gray leading-[1.8]">
              ※ 本サービスは効果を保証するものではありません。個人差があります。
              <br />
              開催日時の確定情報は {formatEventDateTime(ev.startsAt)} です。
            </p>
          </footer>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="bg-paper border border-hair-line p-6 sm:p-7 lg:sticky lg:top-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
              Event Details
            </p>
            <dl className="grid grid-cols-[5rem_1fr] gap-y-4 gap-x-3 text-sm">
              <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                Date
              </dt>
              <dd className="text-ink">
                <div className="font-bold">{formatEventDate(ev.startsAt)}</div>
                <div className="text-xs text-sub-gray mt-0.5">
                  {formatEventTimeRange(ev.startsAt, ev.endsAt)}
                </div>
              </dd>
              <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                Where
              </dt>
              <dd className="text-ink">{ev.location}</dd>
              {ev.audience && (
                <>
                  <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                    For
                  </dt>
                  <dd className="text-ink">{ev.audience}</dd>
                </>
              )}
              {ev.format && (
                <>
                  <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                    Format
                  </dt>
                  <dd className="text-ink">{ev.format}</dd>
                </>
              )}
              {ev.capacity && (
                <>
                  <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                    Size
                  </dt>
                  <dd className="text-ink">{ev.capacity}</dd>
                </>
              )}
              {ev.fee && (
                <>
                  <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                    Fee
                  </dt>
                  <dd className="text-ink">{ev.fee}</dd>
                </>
              )}
              {statusLabel && (
                <>
                  <dt className="text-[10px] tracking-[0.2em] text-sub-gray uppercase">
                    Status
                  </dt>
                  <dd className="text-ink">{statusLabel}</dd>
                </>
              )}
            </dl>

            {isOpen && ev.applyUrl && (
              <a
                href={ev.applyUrl}
                target={
                  ev.applyUrl.startsWith("http") ? "_blank" : undefined
                }
                rel={
                  ev.applyUrl.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="btn-gold mt-7 w-full justify-center"
              >
                β 参加応募
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
        </aside>
      </section>

      {/* Bottom navy band — reinforced CTA */}
      {isOpen && ev.applyUrl && (
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-14 sm:py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold-bright mb-3">
                β 版参加者募集中
              </p>
              <p className="text-lg sm:text-xl font-bold">
                少人数で実施しています。
                <br className="sm:hidden" />
                応募内容を確認の上、こちらから詳細をご案内します。
              </p>
            </div>
            <a
              href={ev.applyUrl}
              target={ev.applyUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                ev.applyUrl.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="btn-gold whitespace-nowrap"
            >
              β 参加応募はこちら
              <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      )}
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-paper border border-hair-line text-xs tracking-wider">
      {children}
    </span>
  );
}

function Icon({ name }: { name: "calendar" | "clock" | "users" | "book" }) {
  const common = {
    width: 14,
    height: 14,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...common}>
        <rect x="3" y="5" width="18" height="16" rx="1.5" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden {...common}>
        <circle cx="9" cy="9" r="3.2" />
        <path d="M2 20c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" />
        <circle cx="17" cy="9" r="2.6" />
        <path d="M22 20c0-2.8-2.5-4.5-5.5-4.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...common}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 4v13" />
    </svg>
  );
}
