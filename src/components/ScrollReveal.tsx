"use client";

import { useEffect } from "react";

// スクロールに合わせて現す仕掛け。
//
// ── 壊れない側に倒す ────────────────────────────
// 隠すのは、この JS が動いたときだけ（html に .hr-motion を付ける）。
// 既定の CSS は「見えている」なので、
//   ・JS が落ちた
//   ・prefers-reduced-motion: reduce
//   ・古い環境で IntersectionObserver が無い
// のどれでも、中身は最初から全部読める。
// 逆（既定で隠して JS で出す）にすると、JS が落ちた瞬間に白紙になる。
//
// ── 1回だけ ────────────────────────────────
// 一度出たものは、戻ってきても出し直さない。
// 上下に振るたびに再生されると、読み返すときに邪魔になる。
//
// ── 並びの遅延 ──────────────────────────────
// data-reveal-stagger を付けた親の子には、順番に遅れを入れる。
// 上から順に立ち上がるので、並びの「上から読む」向きと一致する。
// 遅れは最大 5 番目まで。10個ある並びで 10 段の遅れを付けると、
// 最後の1つが出るまで待つことになる。

const MAX_STAGGER = 5;

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    // 動きを望まない設定なら、何もしない（全部見えたまま）
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    // 並びの中の順番を、遅延として渡す
    document.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((parent) => {
      Array.from(parent.children).forEach((child, i) => {
        if (child instanceof HTMLElement && child.hasAttribute("data-reveal")) {
          child.style.setProperty("--i", String(Math.min(i, MAX_STAGGER)));
        }
      });
    });

    // ここで初めて「隠れた状態」に入る
    root.classList.add("hr-motion");

    // すでに画面に入っているものは、待たせずに出す。
    // 1画面目の中身が、読み込み直後に消えて見えるのを防ぐ。
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      // 少し手前で出し始める。画面の下端ぴったりだと、
      // 見えた瞬間に動き出すので、動いていること自体が目に付く。
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );

    for (const t of targets) io.observe(t);
    return () => io.disconnect();
  }, []);

  return null;
}
