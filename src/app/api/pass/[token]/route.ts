import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { balanceOf } from "@/lib/ask/pass";

// 残り回数を返す。
//
// ── 数えて出す ────────────────────────────────────
// 「残り」という列は持っていない。使った記録を数えて出す。
// 画面の数字は表示で、減らすのはサーバーだけ。
//
// ── 隠さない ──────────────────────────────────────
// 残りがいくつかは、聞かれたら必ず返す。
// 残りを見えにくくするのは、使い切ったことに気づかせない売り方。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "このパスは見つかりません" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いまこの環境はデータベースに接続されていません" }, { status: 503 });
  }
  const b = await balanceOf(params.token);
  if (!b) return NextResponse.json({ error: "このパスは見つかりません" }, { status: 404 });
  return NextResponse.json(b, { headers: { "Cache-Control": "no-store" } });
}
