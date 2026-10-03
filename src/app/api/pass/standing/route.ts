import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { standing } from "@/lib/pass/usage";
import { seats, seatLine } from "@/lib/pass/seats";
import { INCLUDED, VOICE_OVER, HUMAN_OVER } from "@/lib/pass/entitle";

// 月額の、いまの状態。
//
// ── 隠さない ──────────────────────────────────────
// 残りがいくつかは、聞かれたら必ず返す。
// 残りを見えにくくするのは、使い切ったことに気づかせない売り方。
//
// ── 1か所で数える ────────────────────────────────
// 画面に出す残りと、使う直前の判定が、同じ standing() を見る。
// 別々に数えると、画面の残りと実際に使えるかがずれる。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "いまこの環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }
  const userToken = (req.nextUrl.searchParams.get("t") ?? "").trim();
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(userToken)) {
    return NextResponse.json({ error: "鍵の形が違います" }, { status: 400 });
  }

  const s = await standing(userToken);

  // 入っていない人には、いまの値段と枠を返す（申し込み画面がこれを使う）
  if (!s.active) {
    const seat = await seats();
    return NextResponse.json(
      { active: false, yen: seat.yen, beta: seat.beta, seatsLeft: seat.left, seatLine: seatLine(seat), included: INCLUDED },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      active: true,
      period: s.period,
      used: s.used,
      left: s.left,
      included: INCLUDED,
      // 上限に当たっている人には、そのときの言葉も返す。
      // 画面ごとに文言を書くと、切る言い方が混ざる。
      notice: s.left.humanOver ? HUMAN_OVER : s.left.voiceOver ? VOICE_OVER : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
