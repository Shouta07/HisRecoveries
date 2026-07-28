"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// メディアが主、サービスが従。記事を先頭に置く。
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/areas", label: "記事" },
  { href: "/stages/mature", label: "年代から" },
  { href: "/why", label: "編集方針" },
];

/** Home navbar — inline items (no hamburger). Transparent over the hero,
 *  frosted bar once scrolled. */
export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#FAF8F4]/70 backdrop-blur-xl border-b border-[#1F1E1B]/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        <Link
          href="/"
          className={`logo-type text-base sm:text-xl tracking-tight font-semibold shrink-0 transition-colors ${
            "text-sumi"
          }`}
        >
          His Recoveries
        </Link>

        <ul className="flex items-center gap-5 sm:gap-7">
          {LINKS.map((l) => (
            <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
              <Link
                href={l.href}
                className={`text-[14.5px] sm:text-[15px] font-medium transition-colors whitespace-nowrap ${
                  "text-keshizumi hover:text-dou"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
