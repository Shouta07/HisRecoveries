import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="w-full border-b border-hair-line bg-off-white">
      <div className="mx-auto flex max-w-reading items-center justify-between px-6 py-7 sm:py-10">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-2xl text-ink hover:text-quiet-brass transition-colors"
        >
          {site.name}
        </Link>
        <nav aria-label="primary" className="text-sm text-sub-gray">
          <ul className="flex items-center gap-3 sm:gap-6">
            <li>
              <Link
                href="/articles"
                className="inline-block py-2 hover:text-ink transition-colors"
              >
                記事
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="inline-block py-2 hover:text-ink transition-colors"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="inline-block py-2 hover:text-ink transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/subscribe"
                className="inline-block py-2 hover:text-ink transition-colors"
              >
                Subscribe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
