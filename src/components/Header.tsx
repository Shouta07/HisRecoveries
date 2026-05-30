"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  { href: "/shelf", label: "整える道具", ja: "Shelf" },
  { href: "/articles", label: "記録", ja: "Journal" },
  { href: "/subscribe", label: "購読する", ja: "Subscribe" },
];

const secondary = [
  { href: "/recoveries", label: "Three Recoveries — 回復の物語" },
  { href: "/territories", label: "Chapters — 悩みの章" },
  { href: "/stories", label: "Stories — 回復の記録" },
  { href: "/about", label: "Philosophy — このサイトについて" },
  { href: "/manifesto", label: "Manifesto — 男性の回復について" },
  { href: "/founder", label: "Founder's Note — なぜ始めたか" },
  { href: "/concierge", label: "Recovery Concierge — 1 対 1 の対話" },
  { href: "/events", label: "Experiences — 静かな集まり" },
  { href: "/reflect", label: "Reflect — 整理する" },
  { href: "/disclosure", label: "広告・アフィリエイト方針" },
];

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

  return (
    <header className="w-full bg-paper/95 backdrop-blur text-cream sticky top-0 z-50 border-b border-gold/25 shadow-[0_1px_0_rgba(184,145,105,0.08)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-5 sm:py-6">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-xl text-cream hover:text-gold-bright transition-colors"
        >
          {site.name}
        </Link>

        {/* Desktop nav (≥ md) */}
        <nav aria-label="primary" className="hidden md:block text-sm">
          <ul className="flex items-center gap-6 lg:gap-8 text-cream">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-2 hover:text-gold-bright transition-colors"
                >
                  <span className="font-mincho text-[14px] tracking-[0.12em] whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu toggle (< md) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden p-2 -mr-2 text-cream hover:text-gold-bright transition-colors"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile fullscreen overlay (< md) */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden fixed inset-x-0 top-[68px] bottom-0 bg-navy text-cream z-40 overflow-y-auto"
        >
          <nav
            aria-label="mobile primary"
            className="mx-auto max-w-[640px] px-6 py-12 pb-24"
          >
            <ul className="space-y-8">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold-bright">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="mt-2 font-mincho text-[2rem] font-medium leading-[1.35] text-cream group-hover:text-gold-bright transition-colors">
                          {item.label}
                        </h2>
                        <p className="mt-1 text-[13px] tracking-[0.08em] text-cream/65">
                          {item.ja}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-cream/55 group-hover:text-gold-bright transition-colors text-xl shrink-0"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-14 pt-10 border-t border-cream/15 space-y-4 text-[13px] text-cream/70">
              {secondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block hover:text-gold-bright transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${site.email}`}
                className="block hover:text-gold-bright transition-colors"
              >
                Contact — {site.email}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
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
