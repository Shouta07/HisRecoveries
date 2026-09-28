import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { cleanReasons } from "@/lib/ask/why";

// 「なぜ人にも聞きましたか」を受け取る。
//
// ── 相談の鍵を持っている人だけ ────────────────────
// このサービスに会員登録は無い。鍵がその人である証拠。
// 鍵を知らないと、他人の相談に理由を付けられない。
//
// ── 知らない選択肢は落とす ────────────────────────
// 画面に無いものを送られても保存しない。
// 集計が壊れるうえ、自由記述の抜け道になる。

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json({ error: "保存先が設定されていません" }, { status: 503 });
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

  const reasons = cleanReasons(body.reasons);
  if (reasons.length === 0) {
    return NextResponse.json({ error: "選ばれていません" }, { status: 400 });
  }

  const rows = await dbSelect<{ id: string }>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id`,
  );
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "この相談は見つかりません" }, { status: 404 });

  await dbUpdate("consultations", c.id, { ask_reasons: reasons });
  return NextResponse.json({ ok: true });
}
