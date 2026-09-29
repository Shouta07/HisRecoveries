import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken, isResponderToken } from "@/lib/ask/token";
import { findByToken, settle, markJoined, publicView } from "@/lib/call/store";
import { canJoin, canEnter, isOver } from "@/lib/call/session";
import { createToken, callEnabled, whyCallDisabled } from "@/lib/call/room";

// 入室券を出す。
//
// ══════════════════════════════════════════════════
// ここだけが券を出す
// ══════════════════════════════════════════════════
// 部屋のURLと券は、この経路でしか出さない。
// 状態を返す GET には入れない（開きっぱなしの画面に残り続ける）。
//
// ══════════════════════════════════════════════════
// 券は、終わる時刻を越えない
// ══════════════════════════════════════════════════
// 寿命は残り時間そのもの。越える券を出すと、
// 画面を閉じて開き直すだけで時間が延びる。
// 過ぎていれば、そもそも出さない。
//
// ══════════════════════════════════════════════════
// 答える人は、自分の鍵を持っている人だけ
// ══════════════════════════════════════════════════
// 相談の鍵を知っているだけでは、答える側としては入れない。
// 知られたときに、誰でも女性側として入れる形にしない。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "この通話は見つかりません" }, { status: 400 });
  }
  if (!callEnabled) {
    return NextResponse.json(
      { error: whyCallDisabled() ?? "いま通話を受け付けていません", blocked: true },
      { status: 503 },
    );
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いまこの環境はデータベースに接続されていません" }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // 本文なしは、相談した人からの入室として扱う
  }

  const row0 = await findByToken(params.token);
  if (!row0) return NextResponse.json({ error: "この通話は見つかりません" }, { status: 404 });

  const now = new Date();
  const row = await settle(row0, now);

  // 答える側は、自分の鍵を出せた人だけ。
  const asResponder = isResponderToken(body.responder);
  const side: "asker" | "responder" = asResponder ? "responder" : "asker";
  if (asResponder && !row.responder_id) {
    return NextResponse.json({ error: "この通話はまだ担当が決まっていません" }, { status: 409 });
  }

  if (!canJoin(row.status)) {
    return NextResponse.json(
      { error: "いまは入室できません", status: row.status },
      { status: 409 },
    );
  }
  if (isOver(row.ends_at, now)) {
    return NextResponse.json({ error: "この通話はもう終わっています" }, { status: 409 });
  }
  // まだ始まっていないものは、予約時刻の少し前から入れる。
  if (!row.started_at && !canEnter(row.scheduled_at, now)) {
    return NextResponse.json(
      { error: "まだ入室できません", scheduledAt: row.scheduled_at },
      { status: 409 },
    );
  }
  if (!row.room_name || !row.room_url) {
    return NextResponse.json({ error: "通話の部屋がまだありません" }, { status: 409 });
  }

  // 入ったことを記録する。両方そろっていれば、ここで時間が始まる。
  const joined = await markJoined(row, side, now);

  let ticket: { token: string; seconds: number };
  try {
    ticket = await createToken({
      room: joined.room_name!,
      side,
      endsAt: joined.ends_at,
      now,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 502 });
  }

  return NextResponse.json(
    {
      ...publicView(joined, now),
      roomUrl: joined.room_url,
      token: ticket.token,
      // 券の寿命。画面はこれより長く居座れない
      seconds: ticket.seconds,
      side,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
