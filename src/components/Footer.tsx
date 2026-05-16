import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-hair-line bg-off-white">
      <div className="mx-auto max-w-reading px-6 py-20 text-sm text-sub-gray">
        {/* Parting line */}
        <p className="font-mincho text-sub-gray text-[0.9375rem] leading-[2.1] max-w-[26rem]">
          後ろから来る人の、
          <br />
          半歩先にだけ届けばいい。
        </p>

        <p className="logo-type mt-8 text-2xl text-ink tracking-wider">
          {site.name}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          — {site.tagline} —
        </p>

        <nav aria-label="footer" className="mt-12">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            <li>
              <Link href="/about" className="hover:text-ink transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="hover:text-ink transition-colors"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="hover:text-ink transition-colors"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/subscribe"
                className="hover:text-ink transition-colors"
              >
                Subscribe
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-ink transition-colors"
              >
                Privacy
              </Link>
            </li>
            <li>
              <a
                href="/feed.xml"
                className="hover:text-ink transition-colors"
              >
                Feed
              </a>
            </li>
          </ul>
        </nav>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <li>
            <a
              href={site.social.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Threads
            </a>
          </li>
          <li>
            <a
              href={site.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              X
            </a>
          </li>
          <li>
            <a
              href={site.social.note}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              note
            </a>
          </li>
          <li>
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Substack
            </a>
          </li>
        </ul>

        <div className="mt-16 pt-8 border-t border-hair-line flex flex-col gap-2 text-xs text-sub-gray/80">
          <p className="logo-type text-[10px] tracking-[0.3em] text-sub-gray uppercase">
            Observed — not proclaimed.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3">
            <span>© {year} {site.name}</span>
            <span aria-hidden>·</span>
            <Link href="/legal" className="hover:text-ink transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
