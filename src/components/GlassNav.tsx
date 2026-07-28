"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// メディアが主、サービスが従。記事を先頭に置く。
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/#index", label: "記事" },
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
          ? "bg-[#FAF8F4]/70 backdrop-blur-xl border-b border-[#1F1E1B]/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        {/* ロゴの下に肩書きを1行。何のサイトかを、ロゴの位置で言い切る。 */}
        <Link href="/" className="shrink-0 leading-none">
          <span
            className={`logo-type block text-base font-semibold tracking-tight transition-colors sm:text-xl ${
              scrolled ? "text-sumi" : "text-kinari"
            }`}
          >
            His Recoveries
          </span>
          <span
            className={`mt-1.5 block text-[10px] tracking-[0.12em] transition-colors sm:text-[11px] ${
              scrolled ? "text-ainezu" : "text-kinari/70"
            }`}
          >
            男性ウェルネスメディア
          </span>
        </Link>

        <ul className="flex items-center gap-5 sm:gap-7">
          {LINKS.map((l) => (
            <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
              <Link
                href={l.href}
                className={`text-[14.5px] sm:text-[15px] font-medium transition-colors whitespace-nowrap ${
                  scrolled ? "text-keshizumi hover:text-dou" : "text-kinari/85 hover:text-kinari"
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
