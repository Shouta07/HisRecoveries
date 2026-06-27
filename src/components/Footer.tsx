"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { complexes } from "@/lib/complexes";

const ACCENT = "#0F766E";

const READ = [
  { href: "/#interviews", label: "インタビュー" },
  { href: "/#complexes", label: "メカニズム" },
  { href: "/#how", label: "進め方" },
  { href: "/articles", label: "記事" },
];

export default function Footer() {
  const pathname = usePathname();
  // The home ("/") ships its own footer; /apply is a focused form page.
  if (pathname === "/" || pathname === "/apply") return null;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#F7F8F7] text-zinc-600 border-t border-zinc-200">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-16 sm:py-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <p className="logo-type text-2xl tracking-[0.04em] text-zinc-900">
              {site.name}
            </p>
            <p className="mt-4 text-[13px] text-zinc-500 leading-[1.9] max-w-[24rem]">
              男性のコンプレックスを、原因の特定から定着までを伴走して整える、
              少人数の改善プログラム。システムと、専属の伴走で。
            </p>
            <Link
              href="/check"
              className="mt-6 inline-flex items-center gap-2 rounded-full text-white text-[13px] font-bold px-5 py-2.5 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}
            >
              無料で相談する <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Complexes */}
          <nav aria-label="コンプレックス">
            <p className="text-[10.5px] tracking-[0.22em] uppercase font-bold mb-5" style={{ color: ACCENT }}>
              Complexes
            </p>
            <ul className="space-y-2.5 text-[13px]">
              {complexes.map((c) => (
                <li key={c.id}>
                  <Link
                    href="/#complexes"
                    className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <span
                      aria-hidden
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c.accent }}
                    />
                    {c.ja}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Read */}
          <nav aria-label="読みもの">
            <p className="text-[10.5px] tracking-[0.22em] uppercase font-bold mb-5" style={{ color: ACCENT }}>
              Read
            </p>
            <ul className="space-y-2.5 text-[13px]">
              {READ.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-zinc-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-400">
          <span>© {year} {site.name}</span>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-zinc-700 transition-colors">
            プライバシー・免責事項
          </Link>
        </div>
      </div>
    </footer>
  );
}
