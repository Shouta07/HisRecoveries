import type { Metadata } from "next";
import Link from "next/link";
import {
  formatEventDate,
  formatEventTimeRange,
  getPastEvents,
  getUpcomingEvents,
} from "@/lib/events";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "His Recoveries が紹介する、少人数・半公開の集まり。「自然に整える」観点で設計された場を、静かにお知らせします。",
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
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-16">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Events — Quiet Gatherings
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          静かな集まり
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          His Recoveries が紹介する、少人数・半公開のイベント。
          叫ばず、競わず、「自然に整える」観点で設計された場だけを並べます。
        </p>
      </header>

      {/* Upcoming */}
      <section aria-labelledby="upcoming" className="mb-24">
        <h2
          id="upcoming"
          className="font-mincho text-sm tracking-widest text-sub-gray border-b border-hair-line pb-4 mb-8"
        >
          UPCOMING — これから
        </h2>

        {upcoming.length === 0 ? (
          <p className="font-mincho text-sm text-sub-gray leading-[2]">
            予定されている集まりはまだありません。
            <br />
            最初の数回は、いま静かに準備されているところです。
          </p>
        ) : (
          <ul>
            {upcoming.map((e) => (
              <li
                key={e.slug}
                className="border-b border-hair-line py-10 last:border-b-0"
              >
                <Link
                  href={`/events/${e.slug}`}
                  className="group block"
                >
                  <div className="text-xs tracking-widest text-sub-gray">
                    <time dateTime={e.startsAt}>
                      {formatEventDate(e.startsAt)}
                    </time>
                    <span className="mx-2">·</span>
                    <span>{formatEventTimeRange(e.startsAt, e.endsAt)}</span>
                  </div>
                  <h3 className="mt-3 font-mincho text-xl sm:text-2xl leading-relaxed text-ink group-hover:text-quiet-brass transition-colors">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm leading-loose text-sub-gray">
                    {e.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-sub-gray/80 tracking-wider">
                    {e.location}
                    {e.format && (
                      <>
                        <span className="mx-2">·</span>
                        {e.format}
                      </>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section aria-labelledby="past">
          <h2
            id="past"
            className="font-mincho text-sm tracking-widest text-sub-gray border-b border-hair-line pb-4 mb-8"
          >
            PAST — これまで
          </h2>
          <ul className="opacity-70">
            {past.map((e) => (
              <li
                key={e.slug}
                className="border-b border-hair-line py-8 last:border-b-0"
              >
                <Link href={`/events/${e.slug}`} className="group block">
                  <div className="text-xs tracking-widest text-sub-gray">
                    <time dateTime={e.startsAt}>
                      {formatEventDate(e.startsAt)}
                    </time>
                  </div>
                  <h3 className="mt-2 font-mincho text-lg leading-relaxed text-sub-gray group-hover:text-ink transition-colors">
                    {e.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
