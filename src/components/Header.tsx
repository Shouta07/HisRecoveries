import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="w-full bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-5 sm:py-6">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-xl text-white hover:text-gold-bright transition-colors"
        >
          {site.name}
        </Link>
        <nav aria-label="primary" className="text-sm">
          <ul className="flex items-center gap-3 sm:gap-6 text-white/85">
            <li>
              <Link
                href="/territories"
                className="inline-block py-2 hover:text-white transition-colors"
              >
                地形図
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="inline-block py-2 hover:text-white transition-colors"
              >
                記事
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="inline-block py-2 hover:text-white transition-colors"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="/reflect"
                className="hidden sm:inline-block py-2 hover:text-white transition-colors"
              >
                Reflect
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="inline-block py-2 hover:text-white transition-colors"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
