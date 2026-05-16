import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="w-full border-b border-hair-line bg-off-white">
      <div className="mx-auto flex max-w-reading items-center justify-between px-6 py-8 sm:py-10">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-xl sm:text-2xl text-ink"
        >
          {site.name}
        </Link>
        <nav aria-label="primary" className="text-sm text-sub-gray">
          <ul className="flex items-center gap-5 sm:gap-7">
            <li>
              <Link href="/articles" className="hover:text-ink transition-colors">
                記事
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-ink transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-ink transition-colors">
                Subscribe
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
