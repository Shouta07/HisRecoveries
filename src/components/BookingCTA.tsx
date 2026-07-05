"use client";

// A CTA button that opens the booking/contact form *in place* as a modal,
// so submission completes within the site (no page navigation). Renders via
// a portal to <body> to stay above the fixed nav / boomerang video.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ApplyForm from "@/components/ApplyForm";
import { site } from "@/lib/site";

export default function BookingCTA({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-[#0e150d]/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* dialog */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="予約登録フォーム"
              className="relative z-[1] w-full max-w-[560px] my-6 sm:my-8 rounded-[1.6rem] bg-[#f7f8f5] shadow-[0_40px_90px_-30px_rgba(14,21,13,0.7)]"
            >
              {/* header */}
              <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-4 border-b border-[#1f2a1d]/10">
                <div>
                  <p className="text-[11px] tracking-[0.2em] text-[#3d5638] font-semibold">
                    CONTACT · 完全匿名 · 完全守秘
                  </p>
                  <h2 className="text-[1.3rem] font-bold text-[#1f2a1d] mt-1.5">
                    無料で、相談する。
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="閉じる"
                  className="shrink-0 grid place-items-center w-9 h-9 rounded-full text-[#4b5b47] hover:bg-[#1f2a1d]/8 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* body (scrolls if tall) */}
              <div className="px-6 sm:px-8 py-6 max-h-[72vh] overflow-y-auto">
                <p className="text-[14px] text-[#4b5b47] leading-[1.95] mb-7">
                  コンプレックスから自信への変化を、一緒に設計します。まずは対話から。すべて
                  <strong className="font-bold text-[#1f2a1d]">完全匿名・完全守秘義務</strong>
                  のもとで扱います。ご予約登録には、秘密保持への同意が必要です。
                </p>

                <ApplyForm />

                <div className="mt-7 flex items-start gap-2.5 text-[12.5px] text-[#4b5b47] leading-[1.9]">
                  <span aria-hidden className="text-[#85AB8B] mt-px">→</span>
                  <p>
                    送信いただいた内容は{" "}
                    <a
                      href={`mailto:${site.email}`}
                      className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
                    >
                      {site.email}
                    </a>{" "}
                    宛に届きます。3営業日目処で返信いたします。
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
