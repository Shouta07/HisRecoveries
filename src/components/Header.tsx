"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import SearchButton from "@/components/search/SearchButton";
import CheckCta from "@/components/check/CheckCta";
import { site } from "@/lib/site";

// 下層ページのヘッダー。トップの GlassNav と同じ見え方に揃える
// （ロゴ＋肩書き1行、記事が先頭）。メディアが主、サービスが従。
const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/#index", label: "記事" },
  { href: "/#about", label: "編集方針", desktopOnly: true },
];

export default function Header() {
  const pathname = usePathname();

  // The home ("/") ships its own glass navbar; /apply and /partner are focused
  // pages that carry their own top bar.
  if (pathname === "/" || pathname === "/apply" || pathname === "/partner") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-shironezu bg-hakuji/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-3.5 sm:px-8 sm:py-4 lg:px-12">
        <Link href="/" aria-label={`${site.name} ホーム`} className="shrink-0 leading-none">
          <span className="logo-type block text-base font-bold tracking-tight text-sumi transition-colors hover:text-asagi sm:text-xl">
            {site.name}
          </span>
          {/* 肩書きを「メディア」から変えた。読んで終わる場所だと
              こちらから宣言していたので、期待値がそこで止まっていた。 */}
          <span className="mt-1.5 block text-[10px] tracking-[0.12em] text-ainezu sm:text-[11px]">
            男の改善は、順番で決まる
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <ul className="flex items-center gap-5 sm:gap-7">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
                <Link
                  href={l.href}
                  className="whitespace-nowrap text-[14.5px] font-normal text-keshizumi transition-colors hover:text-asagi sm:text-[15px]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <CheckCta from="header" variant="nav" />
          <SearchButton />
        </div>
      </div>
    </header>
  );
}
