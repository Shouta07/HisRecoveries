import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { findByToken, settle, publicView } from "@/lib/call/store";

// いまの状態を返す。
//
// ── 時計はサーバーのものを渡す ────────────────────
// 残り時間も「いま」も、ここで出した値を返す。
// 画面は自分の時計で数えず、受け取った now との差で数える。
//
// ── 読むたびに片付ける ────────────────────────────
// 時間を過ぎていたら、ここで終わらせる。
// 定期実行の仕組みが無くても、誰かが開けば必ず切れる。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(
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
  return NextResponse.json(publicView(settled, now), {
    headers: { "Cache-Control": "no-store" },
  });
}
