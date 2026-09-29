import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled, dbUpdate } from "@/lib/db";
import { isConsultToken, isResponderToken } from "@/lib/ask/token";
import { findByToken } from "@/lib/call/store";

// 終わったあとの振り返りを受け取る。
//
// ── 相手の評価にしない ────────────────────────────
// 点数は「役に立ったか」だけ。人柄を採点する欄は作らない。
// 採点される仕事にすると、答える側が言いにくいことを言わなくなる。
//
// ── 相手のことを書かせない ────────────────────────
// 書いてもらうのは「自分が次にやること」。
// 相手の実名も連絡先も、この口からは入らないようにする。

export const runtime = "edge";
export const dynamic = "force-dynamic";

/** 自由記入の長さ。長い作文を求めない */
const NOTE_MAX = 400;

function str(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  const t = x.trim().slice(0, max);
  return t || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "この通話は見つかりません" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いまこの環境はデータベースに接続されていません" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const row = await findByToken(params.token);
  if (!row) return NextResponse.json({ error: "この通話は見つかりません" }, { status: 404 });
  if (row.status !== "completed") {
    return NextResponse.json({ error: "この通話はまだ終わっていません" }, { status: 409 });
  }

  // 答える側か、相談した側か。
  const asResponder = isResponderToken(body.responder);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (asResponder) {
    patch.responder_note = str(body.note, NOTE_MAX);
  } else {
    const n = Number(body.rating);
    if (Number.isFinite(n)) {
      if (n < 1 || n > 5) {
        return NextResponse.json({ error: "点数が範囲の外です" }, { status: 400 });
      }
      patch.asker_rating = Math.round(n);
    }
    if (typeof body.again === "boolean") patch.asker_again = body.again;
    patch.asker_note = str(body.note, NOTE_MAX);
  }

  const res = await dbUpdate(
    "call_sessions",
    `token=eq.${encodeURIComponent(params.token)}`,
    patch,
  );
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
