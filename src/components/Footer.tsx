"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/privacy", label: "プライバシー・免責事項" },
];

export default function Footer() {
  const pathname = usePathname();
  // The home ("/") ships its own footer; /apply and /partner are focused pages
  // that carry their own footer.
  if (pathname === "/" || pathname === "/apply" || pathname === "/partner") return null;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f4f6f2] text-zinc-600 border-t border-zinc-200">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <Link href="/" className="logo-type text-xl tracking-[0.04em] text-zinc-900">
          {site.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-zinc-900 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="text-[12px] text-zinc-400">© {year} {site.name}</span>
      </div>
    </footer>
  );
}
