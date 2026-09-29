import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { findByToken, settle, finish, publicView } from "@/lib/call/store";

// 通話を終わらせる。
//
// 押して終わったときに呼ぶ。時間で切れる場合は settle が同じことをする。
// どちらから来ても、部屋を消して completed にする。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "この通話は見つかりません" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いまこの環境はデータベースに接続されていません" }, { status: 503 });
  }

  const row = await findByToken(params.token);
  if (!row) return NextResponse.json({ error: "この通話は見つかりません" }, { status: 404 });

  const now = new Date();
  const settled = await settle(row, now);
  if (settled.status === "completed" || settled.status === "no_show") {
    return NextResponse.json(publicView(settled, now));
  }
  const done = await finish(settled, now);
  return NextResponse.json(publicView(done, now), {
    headers: { "Cache-Control": "no-store" },
  });
}
