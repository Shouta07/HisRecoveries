"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchButton from "@/components/search/SearchButton";
import { track } from "@/lib/analytics";

// 記事が先頭。そのうえで、診断への導線を1つだけ常設する。
//
// ── 地の色に合わせて出し分ける ────────────────────
// ヒーローが全面写真だったころは、未スクロール時に透明＋白文字でよかった。
// いま lg 以上ではヒーローが左右分割になり、ナビの左半分は白練の地になる。
// 透明のままだとロゴが白地に白文字で消えるので、
// lg 以上では最初から明るい地として描く。
// 狭い画面はいまも写真が上に来るので、透明のままでよい。
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/#index", label: "記事" },
  { href: "/#about", label: "編集方針", desktopOnly: true },
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
          : "bg-transparent lg:border-b lg:border-[#1B2024]/10 lg:bg-[#FAFBFB]/70 lg:backdrop-blur-xl"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        {/* ロゴの下に肩書きを1行。何のサイトかを、ロゴの位置で言い切る。 */}
        <Link href="/" className="shrink-0 leading-none">
          <span
            className={`logo-type block text-base font-bold tracking-tight transition-colors sm:text-xl ${
              scrolled ? "text-sumi" : "text-shironeri lg:text-sumi"
            }`}
          >
            His Recoveries
          </span>
          <span
            className={`mt-1.5 block text-[10px] tracking-[0.12em] transition-colors sm:text-[11px] ${
              scrolled ? "text-ainezu" : "text-shironeri/70 lg:text-ainezu"
            }`}
          >
            男の改善は、順番で決まる
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <ul className="flex items-center gap-5 sm:gap-7">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
                <Link
                  href={l.href}
                  className={`text-[14.5px] sm:text-[15px] font-normal transition-colors whitespace-nowrap ${
                    scrolled
                      ? "text-keshizumi hover:text-asagi"
                      : "text-shironeri/85 hover:text-shironeri lg:text-keshizumi lg:hover:text-asagi"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/check"
            onClick={() => track("check_open", { from: "home-nav" })}
            className={`whitespace-nowrap border px-3 py-1.5 text-[13px] font-bold transition-colors sm:text-[13.5px] ${
              scrolled
                ? "border-asagi text-asagi hover:bg-asagi hover:text-shironeri"
                : "border-shironeri/60 text-shironeri hover:bg-shironeri hover:text-sumi lg:border-asagi lg:text-asagi lg:hover:bg-asagi lg:hover:text-shironeri"
            }`}
          >
            現在地を測る
          </Link>
          <SearchButton tone={scrolled ? "dark" : "light"} />
        </div>
      </div>
    </nav>
  );
}
