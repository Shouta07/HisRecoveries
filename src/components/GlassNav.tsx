"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const APPLY = "/apply";

const LINKS = [
  { href: "#complexes", label: "私たちについて" },
  { href: "#how", label: "進め方" },
  { href: "#how", label: "費用" },
];

/** Glass navbar + animated mobile drawer, ported from the Boomerang Hero design. */
export default function GlassNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Transparent glass over the hero; solid frosted bar once scrolling so
  // content passing under the fixed nav is hidden (no overlap).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5 transition-colors duration-300 ${
          scrolled
            ? "bg-[#f6f8f4]/90 backdrop-blur-md border-b border-[#1f2a1d]/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2 text-[#1f2a1d]">
          <Link
            href="/"
            className="logo-type text-lg sm:text-xl md:text-2xl font-semibold tracking-tight"
          >
            His Recoveries
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-1 bg-white/70 backdrop-blur-md rounded-full pl-6 pr-1 py-1 shadow-sm border border-white/60">
          {LINKS.map((l, i) => (
            <a
              key={i}
              href={l.href}
              className={`text-sm px-3 py-2 transition-colors ${
                i === 0
                  ? "font-semibold text-[#1f2a1d]"
                  : "font-medium text-[#4b5b47] hover:text-[#1f2a1d]"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Link
            href={APPLY}
            className="ml-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            参加を申し込む
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-[#2d3a2a]">
          <Link
            href={APPLY}
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
            参加を申し込む
          </Link>
          <a
            href="#interviews"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            インタビュー
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/60 text-[#1f2a1d] transition-all duration-300 hover:bg-white/90"
            aria-label="メニュー"
            aria-expanded={open}
          >
            <svg
              className={`w-5 h-5 absolute transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            ><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            <svg
              className={`w-5 h-5 absolute transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            ><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-20 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-[#1f2a1d]/40 backdrop-blur-sm" />
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-20 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div className="flex flex-col h-full pt-24 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {LINKS.map((l, i) => (
              <a
                key={i}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-2xl font-semibold text-[#1f2a1d] py-4 border-b border-[#1f2a1d]/10 transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
                style={{ transitionDelay: open ? `${150 + i * 70}ms` : "0ms" }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
            style={{ transitionDelay: open ? "400ms" : "0ms" }}
          >
            <a
              href="#interviews"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
              インタビュー
            </a>
            <Link
              href={APPLY}
              onClick={() => setOpen(false)}
              className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors text-center"
            >
              参加を申し込む
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
