"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

// ページ末尾のCTA（§18）。
//
// 「はじめる」で終えない。何が起きるか分からないボタンは押されない。
// ここまで読んだ人に必要なのは、決意ではなく、やることの小ささ。

export default function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[720px] px-6 py-24 sm:px-10 sm:py-32">
      <h2
        className="font-display font-bold leading-[1.45] tracking-[-0.015em] text-charcoal"
        style={{ fontSize: "clamp(28px, 7.6vw, 48px)" }}
      >
        今日会ったことを、
        <br />
        忘れる前に。
      </h2>
      <p className="mt-6 max-w-[24em] text-[16px] leading-[2.05] text-bodytext">
        長い日記はいりません。まずは、その日の感覚だけ。
      </p>
      <div className="mt-9">
        <Link
          href="/app/new"
          onClick={() => track("final_cta_click")}
          className="inline-flex min-h-[54px] items-center justify-center rounded-[8px] bg-accent px-8 text-[15.5px] font-bold text-white transition-colors duration-200 hover:bg-accent/90"
        >
          30秒で残してみる
        </Link>
      </div>
      <p className="mt-5 text-[12.5px] leading-[1.85] text-faint">
        登録もログインも要りません。記録はあなたの端末の中だけに残ります。
      </p>
    </section>
  );
}
