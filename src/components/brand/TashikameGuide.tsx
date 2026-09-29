"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Tashikame from "@/components/brand/Tashikame";
import { track } from "@/lib/analytics";
import { DEFAULT_PLAN } from "@/lib/ask/plans";

// スクロールを先導するタシカメ。
//
// ── 何のために出すか ──────────────────────────────
// このページは全部スクロールで読む。長いので、
//   ① いま全体のどのあたりか
//   ② 押す場所はどこか
// の2つが、途中で分からなくなる。
// 下タブを外したので、②は特に効く。
//
// 輪が進み具合、中の亀が押す場所。1つで両方を持つ。
//
// ── 最初の押す場所を過ぎてから出す ────────────────
// ヒーローにボタンがあるうちに出すと、同じものが2つ並ぶ。
// 通り過ぎてから現れて、上に戻ったらまた引っ込む。
//
// ── 動きを止めている人には動かさない ──────────────
// prefers-reduced-motion のときは、跳ねも揺れもしない。
// ただし進み具合と押す場所は残す（機能まで消さない）。
//
// ── 読み上げには出さない ──────────────────────────
// 進み具合は飾り。押す場所はヘッダーにも同じものがあるので、
// ここは補助として扱う。

const R = 21;
const C = 2 * Math.PI * R;

export default function TashikameGuide() {
  const [shown, setShown] = useState(false);
  const [p, setP] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const run = () => {
      frame.current = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setP(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);

      // 最初のボタンを通り過ぎたか。
      // ボタンが見つからないときは、1画面ぶん進んだかで代用する。
      const cta = document.querySelector<HTMLElement>("[data-hero-cta]");
      const passed = cta
        ? cta.getBoundingClientRect().bottom < 0
        : y > window.innerHeight * 0.9;
      setShown(passed);
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(run);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    run();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      aria-hidden={!shown}
      className={`fixed bottom-5 right-4 z-40 transition-all duration-300 sm:bottom-7 sm:right-6 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Link
        href={`/ask?plan=${DEFAULT_PLAN}`}
        onClick={() => track("plan_viewed", { plan: DEFAULT_PLAN, from: "guide" })}
        aria-label="相談する"
        tabIndex={shown ? undefined : -1}
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-paper shadow-card-hover transition-transform hover:scale-105 sm:h-[68px] sm:w-[68px]"
      >
        {/* 進み具合。輪が右回りに満ちていく */}
        <svg
          aria-hidden
          viewBox="0 0 48 48"
          className="absolute inset-0 h-full w-full -rotate-90"
          fill="none"
        >
          <circle cx="24" cy="24" r={R} stroke="#E4E9F0" strokeWidth="3" />
          <circle
            cx="24"
            cy="24"
            r={R}
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - p)}
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
        </svg>
        <Tashikame size={36} className="tashikame-bob relative sm:!h-[42px] sm:!w-[42px]" />
      </Link>
    </div>
  );
}
