import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isResponderToken } from "@/lib/ask/token";
import { fileReport, isReasonId, NOTE_MAX } from "@/lib/safety/report";

// 通報を受ける。
//
// ── 出せなくしない ────────────────────────────────
// ここが落ちても、押した人には「受け取れませんでした」と返す。
// 黙って握りつぶさない。
//
// ── 誰が出したかは、鍵で分かる ────────────────────
// 会員登録が無いので、回答者の鍵がそのまま持ち主の証。
// 回答者IDを画面から送らせない。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: {
    responder?: unknown;
    consultation?: unknown;
    call?: unknown;
    reason?: unknown;
    note?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "読めませんでした" }, { status: 400 });
  }

  if (!isResponderToken(body.responder)) {
    return NextResponse.json({ error: "この鍵では出せません" }, { status: 400 });
  }
  if (!isReasonId(body.reason)) {
    return NextResponse.json({ error: "知らない理由です" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "いまこの環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }

  const res = await fileReport({
    responderToken: body.responder as string,
    consultationId: typeof body.consultation === "string" ? body.consultation : null,
    callSessionId: typeof body.call === "string" ? body.call : null,
    reason: body.reason,
    note: typeof body.note === "string" ? body.note.slice(0, NOTE_MAX) : null,
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.why ?? "受け取れませんでした" }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
