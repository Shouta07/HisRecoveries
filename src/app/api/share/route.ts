import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbInsertReturning, dbAdminEnabled } from "@/lib/db";
import { isConsultToken, makeShareToken } from "@/lib/ask/token";

// A/B の結果を共有できるようにする。
//
// ── 相談の鍵は絶対に渡さない ──────────────────────
// c... は持ち主の鍵。共有したら、本文も次の操作も全部渡すことになる。
// 共有用に s... を別に作る。開けるのは割れ方とひとことだけ。
//
// ── A/B のときだけ ────────────────────────────────
// 「このLINE、送っていい？」は晒せない。本文が本人のものだから。
// 「この2枚、5人中4人がB」は晒せる。
// 晒せないものに共有ボタンを出すと、押した人が後悔する。
//
// ── 作るのは1つだけ ──────────────────────────────
// 押すたびに増やさない。増やすと、取り消しても別の鍵が生き残る。

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いま作れません" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = body.token;
  if (!isConsultToken(token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }

  const cs = await dbSelect<{ id: string; is_ab: boolean; status: string }>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id,is_ab,status`,
  );
  const c = cs[0];
  if (!c) return NextResponse.json({ error: "この相談は見つかりません" }, { status: 404 });

  // A/B 以外は共有しない。本文が本人のものなので、出せない。
  if (!c.is_ab) {
    return NextResponse.json(
      { error: "この相談は共有できません（AとBの比較だけ共有できます）" },
      { status: 400 },
    );
  }
  if (c.status !== "completed" && c.status !== "collecting") {
    return NextResponse.json({ error: "まだ結果がそろっていません" }, { status: 409 });
  }

  // すでにあれば、それを返す。押すたびに増やさない。
  const has = await dbSelect<{ token: string; revoked_at: string | null }>(
    `shares?consultation_id=eq.${c.id}&select=token,revoked_at&limit=1`,
  );
  if (has[0] && !has[0].revoked_at) {
    return NextResponse.json({ ok: true, token: has[0].token });
  }

  const share = makeShareToken();
  const ins = await dbInsertReturning("shares", { consultation_id: c.id, token: share });
  if (!ins.ok) return NextResponse.json({ error: ins.error }, { status: 500 });

  return NextResponse.json({ ok: true, token: share });
}
