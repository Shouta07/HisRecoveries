"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";

const LINKS = [
  { href: "/#how", label: "進め方" },
  { href: "/#packages", label: "体験" },
  { href: "/#mechanism", label: "メカニズム", desktopOnly: true },
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
          ? "bg-[#f6f8f4]/70 backdrop-blur-xl border-b border-[#1f2a1d]/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        <Link
          href="/"
          className="logo-type text-base sm:text-xl tracking-tight font-semibold text-[#1f2a1d] shrink-0"
        >
          His Recoveries
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <ul className="flex items-center gap-3 sm:gap-6">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
                <Link
                  href={l.href}
                  className="text-[12px] sm:text-[13.5px] font-medium text-[#3d5638] hover:text-[#1f2a1d] transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <BookingCTA className="shrink-0 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-5 py-2 sm:py-2.5 transition-colors whitespace-nowrap">
            予約登録
          </BookingCTA>
        </div>
      </div>
    </nav>
  );
}
