import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { isResponderToken } from "@/lib/ask/token";

// 回答者が、自分の状態を切り替える。
//
// ── 鍵はURLの中だけ ──────────────────────────────
// 会員登録は無い。p... を持っている人＝本人。
// だから鍵は本文で受け取り、ログには残さない。
//
// ── ONのまま放置させない ──────────────────────────
// ONにしたら、切れる時刻も一緒に入れる。
// 入れないと、寝ている人に配り続けることになる。

export const runtime = "edge";

/** ONにしたとき、何時間で自動的にOFFに戻るか */
const HOURS = 4;

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "いま受け付けられません" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = body.token;
  if (!isResponderToken(token)) {
    return NextResponse.json({ error: "このリンクは正しくありません" }, { status: 400 });
  }
  if (typeof body.available !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const rows = await dbSelect<{ id: string; verified_age: boolean; active: boolean }>(
    `responders?token=eq.${encodeURIComponent(token as string)}&select=id,verified_age,active`,
  );
  const r = rows[0];
  if (!r) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  if (!r.active) {
    return NextResponse.json({ error: "いまお休み中の設定になっています" }, { status: 409 });
  }
  // 年齢の確認が済んでいない人を、答えられる状態にしない。
  if (body.available && !r.verified_age) {
    return NextResponse.json(
      { error: "年齢の確認が済むまで、受け取りを開始できません" },
      { status: 409 },
    );
  }

  const until = body.available
    ? new Date(Date.now() + HOURS * 3600 * 1000).toISOString()
    : null;

  await dbUpdate("responders", r.id, {
    available: body.available,
    available_until: until,
  });

  return NextResponse.json({ ok: true, available: body.available, until });
}
