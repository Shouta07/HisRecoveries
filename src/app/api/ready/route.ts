import { NextResponse } from "next/server";
import { missingToSell, readyToSell } from "@/lib/ready";

// いま売れる状態かどうかを返す。
//
// ── なぜ要るか ────────────────────────────────────
// 本番で止まったとき、何が足りないのかを見る方法が無かった。
// 画面には upstream の文字（「internal error」）が出るだけで、
// 鍵が無いのか、表が無いのか、特商法なのかが分からない。
//
// ── 鍵の中身は返さない ────────────────────────────
// 返すのは「足りないものの名前」だけ。
// 値は返さない。ログにも出さない。
//
// ── 検索に載せない ────────────────────────────────
// 運営が見るためのもの。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ready: readyToSell(), missing: missingToSell() },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
