"use client";

import { useEffect, useRef, useState } from "react";

// スクロールで現れる。
//
// ── 既定は「見えている」──────────────────────────
// JS が動かなかったとき opacity:0 のまま残ると、ページが白紙になる。
// 隠すのは、隠したあと確実に戻せると分かってからにする。
//
// ── 速くスクロールしても、必ず出す ────────────────
// IntersectionObserver は「交差しているかどうかが変わったとき」にだけ通知する。
// 画面の下から上へ1フレームで通り過ぎた要素は、
// 交差しない → 交差しない で状態が変わらず、通知が一度も来ない。
// スマホのフリックでは普通に起きる。
// 実測で、下半分の17ブロックが opacity:0 のまま残った。
//
// なので観測をIOだけに頼らない。スクロールのたびに位置を見る。
// rAF で1フレームに1回へ束ね、出たら監視をやめる。
// 「出す」判定は1つだけ:
//   要素の上端が、画面の下端より上に来たか。
// 通り過ぎた場合も top は負になるので、同じ条件で拾える。
//
// ── 派手にしない ──────────────────────────────
// 目的は「すごく見せること」ではなく、
// 人の反応が1枚ずつ集まってくる感覚を出すこと。上に10px、それだけ。

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** ms。並べて出すときに少しずつずらす */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // 置かれた時点で既に見えている／通り過ぎているものは、待たない。
    // 待つと、リロード直後に画面の上半分が消えたままになる。
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    setArmed(true);

    let done = false;
    let frame = 0;
    let timer = 0;

    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };

    const reveal = () => {
      if (done) return;
      done = true;
      stop();
      timer = window.setTimeout(() => setShown(true), delay);
    };

    const check = () => {
      frame = 0;
      // 画面の下端より少しだけ内側に入ったら出す。
      // 通り過ぎた要素は top が負になるので、同じ条件で拾える。
      if (el.getBoundingClientRect().top < window.innerHeight * 0.96) reveal();
    };

    function onScroll() {
      if (frame || done) return;
      frame = requestAnimationFrame(check);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check();

    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, [delay]);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(10px)" : "none",
        transition: armed
          ? "opacity 600ms ease-out, transform 600ms cubic-bezier(0.22,0.61,0.36,1)"
          : undefined,
      }}
    >
      {children}
    </div>
  );
}
