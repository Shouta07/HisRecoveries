import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { isOutcomeId, recordOutcome, NOTE_MAX } from "@/lib/ask/outcome";
import { redact } from "@/lib/ask/redact";

// 実行した結果を受け取る。
//
// ── 鍵だけで書く ──────────────────────────────────
// 会員登録が無いので、相談の鍵を知っていること自体が持ち主の証。
// 相談IDは受け取らない。受け取ると、他人の相談に書けてしまう。
//
// ── 二度書かない ──────────────────────────────────
// 二度押し・リロード・通信が切れての押し直しは、どれでも来る。
// 止めるのは schema.sql の record_outcome（行を押さえて確かめる）。
// ここで数えない。
//
// ── ひとことも伏せる ──────────────────────────────
// 相談の本文と同じように、名前・連絡先が混ざっていたら伏せる。
// 本人が書いたものでも、中身は相手の情報でありうる。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "いまこの環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }

  let body: { outcome?: unknown; note?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "読めませんでした" }, { status: 400 });
  }

  if (!isOutcomeId(body.outcome)) {
    return NextResponse.json({ error: "知らない結果です" }, { status: 400 });
  }

  const raw = typeof body.note === "string" ? body.note.trim().slice(0, NOTE_MAX) : "";
  // 名前・連絡先が混ざっていたら伏せる。相談の本文と同じ扱い。
  const note = raw ? redact(raw).text : null;

  const res = await recordOutcome(params.token, body.outcome, note);
  if (!res.ok) {
    return NextResponse.json({ error: res.why ?? "書けませんでした" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, why: res.why }, {
    headers: { "Cache-Control": "no-store" },
  });
}
