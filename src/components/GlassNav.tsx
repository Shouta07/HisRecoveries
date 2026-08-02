"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchButton from "@/components/search/SearchButton";

// メディアが主、サービスが従。記事を先頭に置く。
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/#results", label: "記事" },
  { href: "/#about", label: "編集方針" },
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
          ? "bg-[#FAFBFB]/70 backdrop-blur-xl border-b border-[#1B2024]/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        {/* ロゴの下に肩書きを1行。何のサイトかを、ロゴの位置で言い切る。 */}
        <Link href="/" className="shrink-0 leading-none">
          <span
            className={`logo-type block text-base font-bold tracking-tight transition-colors sm:text-xl ${
              scrolled ? "text-sumi" : "text-shironeri"
            }`}
          >
            His Recoveries
          </span>
          <span
            className={`mt-1.5 block text-[10px] tracking-[0.12em] transition-colors sm:text-[11px] ${
              scrolled ? "text-ainezu" : "text-shironeri/70"
            }`}
          >
            男性ウェルネスメディア
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <ul className="flex items-center gap-5 sm:gap-7">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
                <Link
                  href={l.href}
                  className={`text-[14.5px] sm:text-[15px] font-normal transition-colors whitespace-nowrap ${
                    scrolled ? "text-keshizumi hover:text-asagi" : "text-shironeri/85 hover:text-shironeri"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <SearchButton tone={scrolled ? "dark" : "light"} />
        </div>
      </div>
    </nav>
  );
}
