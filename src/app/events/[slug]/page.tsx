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
    <article className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero cover — Aesop-style, full-width on mobile */}
      <header className="mx-auto max-w-[1200px] px-0 sm:px-10 pt-6 sm:pt-16">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="px-6 sm:px-0 mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-ink transition-colors uppercase"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link
                href="/events"
                className="hover:text-ink transition-colors uppercase"
              >
                Events
              </Link>
            </li>
          </ol>
        </nav>

        <CoverImage
          src={ev.cover}
          alt={ev.coverAlt ?? `${ev.title}（イベントカバー）`}
          eyebrow={`A Quiet Gathering · ${formatEventDate(ev.startsAt)}`}
          title={ev.title}
          meta={ev.location}
          aspectRatio="21/9"
          size="lg"
          priority
        />

        <div className="mt-12 px-6 sm:px-0 max-w-reading mx-auto sm:mx-0">
          <p className="text-[10px] tracking-[0.3em] uppercase text-sub-gray">
            A Quiet Gathering
          </p>
          <h1 className="mt-5 font-mincho text-3xl sm:text-[2.75rem] text-ink leading-[1.45]">
            {ev.title}
          </h1>
          <p className="mt-6 font-mincho text-sub-gray text-[1rem] leading-[2.1]">
            {ev.excerpt}
          </p>
        </div>
      </header>

      {/* Details panel */}
      <section
        aria-label="event details"
        className="mx-auto max-w-reading px-6 sm:px-10 mt-16 border-y border-hair-line py-8"
      >
        <dl className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-y-5 sm:gap-y-4 gap-x-6 text-sm">
          <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Date
          </dt>
          <dd className="font-mincho text-ink">
            <div>{formatEventDate(ev.startsAt)}</div>
            <div className="text-sub-gray text-xs mt-1">
              {formatEventTimeRange(ev.startsAt, ev.endsAt)}
            </div>
          </dd>

          <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Where
          </dt>
          <dd className="font-mincho text-ink">{ev.location}</dd>

          {ev.audience && (
            <>
              <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
                For
              </dt>
              <dd className="font-mincho text-ink">{ev.audience}</dd>
            </>
          )}

          {ev.format && (
            <>
              <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
                Format
              </dt>
              <dd className="font-mincho text-ink">{ev.format}</dd>
            </>
          )}

          {ev.capacity && (
            <>
              <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
                Size
              </dt>
              <dd className="font-mincho text-ink">{ev.capacity}</dd>
            </>
          )}

          {ev.fee && (
            <>
              <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
                Fee
              </dt>
              <dd className="font-mincho text-ink">{ev.fee}</dd>
            </>
          )}

          {statusLabel && (
            <>
              <dt className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
                Status
              </dt>
              <dd className="font-mincho text-ink">{statusLabel}</dd>
            </>
          )}
        </dl>
      </section>

      <div className="mx-auto max-w-reading px-6 sm:px-10 mt-16">
        <div
          className="article-body font-mincho"
          dangerouslySetInnerHTML={{ __html: ev.contentHtml }}
        />

        {ev.status === "open" && ev.applyUrl && (
          <section
            aria-label="apply"
            className="mt-20 border-t border-hair-line pt-12"
          >
            <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-6">
              Apply — 応募
            </p>
            <p className="font-mincho text-[0.9375rem] leading-[2] text-ink max-w-[32rem] mb-8">
              まずは簡単な応募フォームから、現在の悩みと参加目的をお知らせください。
              内容を確認の上、こちらから詳細をご案内します。
            </p>
            <a
              href={ev.applyUrl}
              target={ev.applyUrl.startsWith("http") ? "_blank" : undefined}
              rel={
                ev.applyUrl.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className="inline-flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-ink border-b border-ink pb-1 hover:text-quiet-brass hover:border-quiet-brass transition-colors"
            >
              β 参加応募はこちら
              <span aria-hidden>→</span>
            </a>
          </section>
        )}

        <footer className="mt-24 border-t border-hair-line pt-12 text-sm text-sub-gray">
          <p className="logo-type text-base text-ink tracking-wider">
            —— {site.author}
          </p>
          <p className="mt-4 font-mincho leading-[2]">
            ご質問は{" "}
            <a
              href={`mailto:${site.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.email}
            </a>
            、他の集まりは{" "}
            <Link
              href="/events"
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              Events
            </Link>
            。
          </p>
          <p className="mt-6 text-xs text-sub-gray/70 leading-[1.8]">
            ※ 本サービスは効果を保証するものではありません。個人差があります。
            <br />
            開催日時の確定情報は {formatEventDateTime(ev.startsAt)} です。
          </p>
        </footer>
      </div>
    </article>
  );
}
