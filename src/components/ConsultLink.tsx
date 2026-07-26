"use client";

// 無料相談リンク。相談の入口は「匿名Web相談の予約」= /reserve に集約。
// （/reserve が TimeRex 埋め込み or LINE/フォームのフォールバックを出し分ける）
//
// event を渡すと、クリックを計測する。どの画面・どのJobから相談に来たかを
// 見分けたい箇所（結果ページなど）でだけ指定すればよい。
import Link from "next/link";
import { track, type ConversionEvent } from "@/lib/analytics";

export default function ConsultLink({
  className = "",
  children,
  event,
  eventProps,
}: {
  className?: string;
  children: React.ReactNode;
  event?: ConversionEvent;
  eventProps?: Record<string, string | number | boolean | undefined>;
}) {
  return (
    <Link
      href="/reserve"
      className={className}
      onClick={event ? () => track(event, eventProps) : undefined}
    >
      {children}
    </Link>
  );
}
