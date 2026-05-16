import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-hair-line bg-off-white">
      <div className="mx-auto max-w-reading px-6 py-16 text-sm text-sub-gray">
        <div className="logo-type mb-8 text-lg text-ink">{site.name}</div>

        <nav aria-label="footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            <li>
              <Link href="/about" className="hover:text-ink transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/articles" className="hover:text-ink transition-colors">
                Articles
              </Link>
            </li>
            <li>
              <Link href="/subscribe" className="hover:text-ink transition-colors">
                Subscribe
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ink transition-colors">
                Privacy
              </Link>
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

        <div className="mt-12 flex flex-col gap-2 text-xs text-sub-gray/80">
          <div>© {year} {site.name}</div>
          <div className="text-[10px]">
            <Link href="/legal" className="hover:text-ink transition-colors">
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
