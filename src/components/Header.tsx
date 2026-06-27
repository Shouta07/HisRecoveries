"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  { href: "/#complexes", label: "悩み", ja: "6つの悩み" },
  { href: "/#interviews", label: "インタビュー", ja: "現場の声" },
  { href: "/#how", label: "進め方", ja: "Webアプリ×オフライン" },
  { href: "/articles", label: "記事", ja: "原因の解剖" },
];

const secondary = [
  { href: "/#complexes", label: "6つの悩み" },
  { href: "/#interviews", label: "インタビュー" },
  { href: "/articles", label: "記事 — Journal" },
  { href: "/qa", label: "Recovery Q&A" },
  { href: "/check", label: "Recovery Check" },
];

// Sections that exist in both languages, so the switch can land on the
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // The home ("/") ships its own glass navbar; /apply is a focused form page.
  if (pathname === "/" || pathname === "/apply") return null;

  return (
    <>
    <header className="w-full bg-white/90 backdrop-blur text-zinc-900 sticky top-0 z-50 border-b border-zinc-100">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 sm:px-10 py-4 sm:py-5">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-xl tracking-[0.04em] text-zinc-900 hover:text-[#0F766E] transition-colors"
        >
          {site.name}
        </Link>

        {/* Desktop nav (≥ md) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <nav aria-label="primary" className="text-sm">
            <ul className="flex items-center gap-6 lg:gap-8 text-zinc-600">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-2 hover:text-zinc-900 transition-colors"
                  >
                    <span className="text-[13.5px] font-medium tracking-[0.04em] whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            href="/check"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0F766E] text-white text-[13px] font-bold px-5 py-2.5 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            無料で相談
          </Link>
        </div>

        {/* Mobile menu toggle (< md) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden p-2 -mr-2 text-zinc-900 hover:text-[#0F766E] transition-colors"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>

      {/* Mobile fullscreen overlay (< md) */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden fixed inset-x-0 top-[60px] bottom-0 bg-white text-zinc-900 z-40 overflow-y-auto"
        >
          <nav
            aria-label="mobile primary"
            className="mx-auto max-w-[640px] px-6 py-10 pb-24"
          >
            <Link
              href="/check"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#0F766E] text-white text-[15px] font-bold px-6 py-4 mb-10"
            >
              無料で相談する <span aria-hidden>→</span>
            </Link>

            <ul className="space-y-7">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-zinc-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="mt-2 font-mincho text-[1.9rem] font-bold leading-[1.35] text-zinc-900 group-hover:text-[#0F766E] transition-colors">
                          {item.label}
                        </h2>
                        <p className="mt-1 text-[13px] tracking-[0.04em] text-zinc-500">
                          {item.ja}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-zinc-400 group-hover:text-[#0F766E] transition-colors text-xl shrink-0"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-12 pt-8 border-t border-zinc-200 space-y-4 text-[13px] text-zinc-500">
              {secondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block hover:text-zinc-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${site.email}`}
                className="block hover:text-zinc-900 transition-colors"
              >
                Contact — {site.email}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="4" y1="9" x2="22" y2="9" />
      <line x1="4" y1="17" x2="22" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="6" y1="6" x2="20" y2="20" />
      <line x1="20" y1="6" x2="6" y2="20" />
    </svg>
  );
}
