"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";

const LINKS: { href: string; label: string; desktopOnly?: boolean }[] = [
  { href: "/areas", label: "記事" },
  { href: "/why", label: "想い" },
  { href: "/#occasions", label: "Service" },
];

export default function Header() {
  const pathname = usePathname();

  // The home ("/") ships its own glass navbar; /apply and /partner are focused
  // pages that carry their own top bar.
  if (pathname === "/" || pathname === "/apply" || pathname === "/partner") return null;

  return (
    <header className="w-full bg-white/90 backdrop-blur text-zinc-900 sticky top-0 z-50 border-b border-zinc-100">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-base sm:text-xl tracking-[0.04em] font-semibold text-zinc-900 hover:text-[#3d5638] transition-colors shrink-0"
        >
          {site.name}
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <ul className="flex items-center gap-3 sm:gap-6">
            {LINKS.map((l) => (
              <li key={l.href} className={l.desktopOnly ? "hidden md:block" : ""}>
                <Link
                  href={l.href}
                  className="text-[12px] sm:text-[13.5px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ConsultLink className="shrink-0 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-5 py-2 sm:py-2.5 transition-colors whitespace-nowrap">
            相談する（無料）
          </ConsultLink>
        </div>
      </div>
    </header>
  );
}
