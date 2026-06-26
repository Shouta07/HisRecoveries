"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const CORPORATE_ROUTES = ["/about"];

export default function Footer() {
  const pathname = usePathname();
  if (CORPORATE_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 sm:mt-32 bg-cream-deep text-ink border-t border-hair-line">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="logo-type text-2xl text-ink">{site.name}</p>
            <p className="mt-1 font-mincho text-xs text-sub-gray">
              {site.tagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-sub-gray">
            <span>© {year} {site.name}</span>
            <span aria-hidden>·</span>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              プライバシー・免責事項
            </Link>
            <span aria-hidden>·</span>
            <Link href="/about" className="hover:text-ink transition-colors">
              運営会社
            </Link>
            <span aria-hidden>·</span>
            <Link href="/network" className="hover:text-ink transition-colors">
              事業者の方へ
            </Link>
            <span aria-hidden>·</span>
            <Link href="/en" className="hover:text-ink transition-colors">
              English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
