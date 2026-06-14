"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";

const nav = [
  { href: "/check", label: "Recovery Check", ja: "今の状態を理解する" },
  { href: "/stories", label: "Recovery Stories", ja: "回復の記録を読む" },
  { href: "/membership", label: "Recoveries Letter", ja: "週に一度の手紙" },
];

const secondary = [
  { href: "/territories", label: "原因を読む — なぜ起こるのか" },
  { href: "/articles", label: "記録 — Journal" },
];

// Sections that exist in both languages, so the switch can land on the
// same page in the other language instead of bouncing to the home.
const MIRRORED = ["/territories", "/feelings", "/stories"];

function mirroredOrHome(path: string): boolean {
  return path === "/" || MIRRORED.some((p) => path === p || path.startsWith(`${p}/`));
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  // Counterpart URLs for the JP / EN switch.
  const jpPath = isEn ? pathname.replace(/^\/en(?=\/|$)/, "") || "/" : pathname;
  const jpHref = mirroredOrHome(jpPath) ? jpPath : "/";
  const enHref = (() => {
    if (isEn) return pathname;
    if (pathname === "/") return "/en";
    return mirroredOrHome(pathname) ? `/en${pathname}` : "/en";
  })();

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
    <header className="w-full bg-cream/95 backdrop-blur text-ink sticky top-0 z-50 border-b border-hair-line">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 sm:px-10 py-5 sm:py-6">
        <Link
          href="/"
          aria-label={`${site.name} ホーム`}
          className="logo-type text-lg sm:text-xl text-ink hover:text-gold transition-colors"
        >
          {site.name}
        </Link>

        {/* Desktop nav (≥ md) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <nav aria-label="primary" className="text-sm">
            <ul className="flex items-center gap-6 lg:gap-8 text-ink/85">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-block py-2 hover:text-gold transition-colors"
                  >
                    <span className="font-mincho text-[14px] tracking-[0.12em] whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LangSwitch isEn={isEn} jpHref={jpHref} enHref={enHref} />
        </div>

        {/* Mobile menu toggle (< md) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden p-2 -mr-2 text-ink hover:text-gold transition-colors"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile fullscreen overlay (< md) */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden fixed inset-x-0 top-[68px] bottom-0 bg-cream text-ink z-40 overflow-y-auto"
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
                        <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="mt-2 font-mincho text-[2rem] font-medium leading-[1.35] text-ink group-hover:text-gold transition-colors">
                          {item.label}
                        </h2>
                        <p className="mt-1 text-[13px] tracking-[0.08em] text-sub-gray">
                          {item.ja}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-sub-gray group-hover:text-gold transition-colors text-xl shrink-0"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-14 pt-10 border-t border-hair-line space-y-4 text-[13px] text-sub-gray">
              {secondary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block hover:text-gold transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`mailto:${site.email}`}
                className="block hover:text-gold transition-colors"
              >
                Contact — {site.email}
              </a>
            </div>

            <div className="mt-10 pt-8 border-t border-hair-line">
              <p className="text-[10px] tracking-[0.3em] uppercase text-sub-gray mb-3">
                Language
              </p>
              <LangSwitch
                isEn={isEn}
                jpHref={jpHref}
                enHref={enHref}
                onNavigate={() => setOpen(false)}
                size="lg"
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LangSwitch({
  isEn,
  jpHref,
  enHref,
  onNavigate,
  size = "sm",
}: {
  isEn: boolean;
  jpHref: string;
  enHref: string;
  onNavigate?: () => void;
  size?: "sm" | "lg";
}) {
  const text = size === "lg" ? "text-[15px]" : "text-[11px]";
  const active = "text-ink";
  const idle = "text-sub-gray/60 hover:text-gold transition-colors";
  return (
    <div
      aria-label="言語 / Language"
      className={`flex items-center gap-2 tracking-[0.18em] ${text}`}
    >
      <Link
        href={jpHref}
        onClick={onNavigate}
        aria-current={!isEn ? "true" : undefined}
        className={!isEn ? active : idle}
      >
        JP
      </Link>
      <span aria-hidden className="text-hair-line">
        /
      </span>
      <Link
        href={enHref}
        onClick={onNavigate}
        aria-current={isEn ? "true" : undefined}
        className={isEn ? active : idle}
      >
        EN
      </Link>
    </div>
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
