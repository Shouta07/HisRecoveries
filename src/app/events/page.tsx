import type { Metadata } from "next";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import {
  formatEventDate,
  getPastEvents,
  getUpcomingEvents,
} from "@/lib/events";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Quiet Gatherings — Recovery Experiences",
  description:
    "Quiet Gatherings は、His Recoveries が運営する少人数・半公開の体験事業（Recovery Experiences）。Male Conditioning のための整える時間そのものを共有する、夜のグルーミング体験を、煽らずにお知らせします。",
  alternates: { canonical: `${site.url}/events` },
  openGraph: {
    type: "website",
    url: `${site.url}/events`,
    title: `Events — ${site.name}`,
    description:
      "少人数・半公開で行うグルーミング体験 β版 ほか、His Recoveries が紹介する集まり。",
  },
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/events#collection`,
    name: `Events — ${site.name}`,
    description: "His Recoveries が紹介する、静かな集まり。",
    url: `${site.url}/events`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: upcoming.length,
      itemListElement: upcoming.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/events/${e.slug}`,
        name: e.title,
      })),
    },
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
    ],
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-20 max-w-reading">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Events — Quiet Gatherings
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]">
          静かな集まり
        </h1>
        <p className="mt-8 font-mincho text-sub-gray text-[0.9375rem] sm:text-base leading-[2] max-w-[34rem]">
          His Recoveries が紹介する、少人数・半公開のイベント。
          叫ばず、競わず、「自然に整える」観点で設計された場だけを並べます。
        </p>
      </header>

      {/* Upcoming */}
      <section aria-labelledby="upcoming" className="mb-28">
        <div className="flex items-baseline justify-between mb-10">
          <h2
            id="upcoming"
            className="text-[10px] tracking-[0.3em] uppercase text-sub-gray"
          >
            Upcoming — これから
          </h2>
          <span className="text-xs tracking-wider text-sub-gray/70">
            {upcoming.length} 件
          </span>
        </div>

        {upcoming.length === 0 ? (
          <p className="font-mincho text-sm text-sub-gray leading-[2] max-w-reading">
            予定されている集まりはまだありません。
            <br />
            最初の数回は、いま静かに準備されているところです。
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-16">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section aria-labelledby="past" className="mt-32">
          <h2
            id="past"
            className="text-[10px] tracking-[0.3em] uppercase text-sub-gray mb-10"
          >
            Past — これまで
          </h2>
          <ul className="opacity-70 max-w-reading">
            {past.map((e) => (
              <li
                key={e.slug}
                className="border-b border-hair-line py-8 last:border-b-0"
              >
                <Link
                  href={`/events/${e.slug}`}
                  className="group block sm:flex sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <h3 className="font-mincho text-lg leading-relaxed text-sub-gray group-hover:text-ink transition-colors">
                    {e.title}
                  </h3>
                  <time
                    dateTime={e.startsAt}
                    className="mt-1 sm:mt-0 block text-xs tracking-widest text-sub-gray shrink-0"
                  >
                    {formatEventDate(e.startsAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
