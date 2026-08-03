"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

// 診断への導線。置く場所によって出方を変えるので、形を3つ持たせる。
//
//   block  … 記事を読み終えた直後に置く、いちばん強い形
//   inline … 本文の途中に差す一行
//   nav    … ヘッダーの常設ボタン
//
// from を必ず渡すこと。どの面から診断に来ているかが分からないと、
// 「投稿を増やすべきか、導線を直すべきか」の判断ができない。

type Props = { from: string; variant?: "block" | "inline" | "nav"; className?: string };

export default function CheckCta({ from, variant = "block", className = "" }: Props) {
  const go = () => track("check_open", { from });

  if (variant === "nav") {
    return (
      <Link
        href="/check"
        onClick={go}
        className={`whitespace-nowrap border border-asagi px-3 py-1.5 text-[13px] font-bold text-asagi transition-colors hover:bg-asagi hover:text-shironeri sm:text-[13.5px] ${className}`}
      >
        現在地を測る
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <p className={`border-y border-shironezu py-4 text-[14px] leading-[1.95] text-keshizumi ${className}`}>
        自分の場合はどこからか、まだ決まっていない場合は
        <Link
          href="/check"
          onClick={go}
          className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
        >
          35問の診断
        </Link>
        で順番を出せます。3分・登録不要。
      </p>
    );
  }

  // 小見出しは置き場所で変える。トップに「読み終えたあとに」と出しても、
  // まだ何も読んでいないので意味が通らない。
  const eyebrow = from.startsWith("article") ? "読み終えたあとに" : "まず、現在地から";

  return (
    <div className={`border border-shironezu bg-hakuji px-5 py-7 sm:px-7 sm:py-8 ${className}`}>
      <p className="text-[13px] text-asagi">{eyebrow}</p>
      <p
        className="mt-2.5 text-[19px] leading-[1.6] sm:text-[22px]"
        style={{
          fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
          fontFeatureSettings: '"palt" 1',
          fontWeight: 700,
        }}
      >
        で、自分はどこから始めるのか。
      </p>
      <p className="mt-3 text-[14.5px] leading-[1.95] text-keshizumi">
        35問に答えると、いまの状態と、手をつける順番が出ます。
        いまはやらなくていいことも出します。3分・登録不要・無料。
      </p>
      <Link
        href="/check"
        onClick={go}
        className="mt-5 inline-block border border-asagi bg-asagi px-6 py-3 text-[15px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi"
      >
        現在地を測る
      </Link>
    </div>
  );
}
