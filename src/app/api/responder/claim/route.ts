import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isResponderToken } from "@/lib/ask/token";
import { claim } from "@/lib/responder/queue";

// 案件を取る。
//
// ── 取れなかった理由を、そのまま返す ──────────────
// 「もう取られています」と「まだ確認が済んでいません」では、
// 次にやることが違う。まとめて「エラー」にしない。
//
// ── 取る判断はここでしない ────────────────────────
// 空いているか読んでから書くと、同時に来たときに両方取れる。
// 判断は Postgres 側（claim_invite）。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "いまこの環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const invite = body.invite;
  if (!isResponderToken(token)) {
    return NextResponse.json({ error: "この鍵では取れません" }, { status: 400 });
  }
  if (typeof invite !== "string" || !invite) {
    return NextResponse.json({ error: "依頼が指定されていません" }, { status: 400 });
  }

  const r = await claim(token, invite);
  if (!r.ok) {
    // 取り合いに負けただけ。エラーではなく、そう伝える。
    return NextResponse.json({ error: r.why ?? "取れませんでした" }, { status: 409 });
  }
  return NextResponse.json({ ok: true, reply: r.replyToken });
}
