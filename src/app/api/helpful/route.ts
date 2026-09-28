import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";

// 「役に立った」を記録する。
//
// ── これが helpful率の唯一の出どころ ────────────────
// C2C で相手が見えない以上、回答者の信用はここにしか作れない。
// 逆に言えば、ここが押されるまで helpful率は名乗れない。
// だから初期値は null（未評価）で、0% とは書かない。
//
// ── 押せるのは、その相談の持ち主だけ ────────────────
// 相談の鍵（結果URLに入っている）を知っている人だけが押せる。
// 誰でも押せると、回答者の信用が外から作れてしまう。
//
// ── 相談ごとに閉じる ──────────────────────────────
// 渡された回答IDが、その相談のものかどうかを必ず確かめる。
// 確かめないと、鍵を1つ持っているだけで他人の相談の評価を書き換えられる。

export const runtime = "edge";

type Row = { id: string; consultation_id: string };

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "この環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = body.token;
  const responseId = body.responseId;
  const helpful = body.helpful;

  if (!isConsultToken(token)) {
    return NextResponse.json({ error: "このリンクは正しくありません" }, { status: 400 });
  }
  if (typeof responseId !== "string" || !responseId) {
    return NextResponse.json({ error: "回答が指定されていません" }, { status: 400 });
  }
  if (typeof helpful !== "boolean") {
    return NextResponse.json({ error: "helpful は true か false です" }, { status: 400 });
  }

  const cs = await dbSelect<{ id: string }>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id`,
  );
  const c = cs[0];
  if (!c) return NextResponse.json({ error: "相談が見つかりません" }, { status: 404 });

  // その回答が、この相談のものか。ここを飛ばすと他人の相談を触れる。
  const rs = await dbSelect<Row>(
    `responses?id=eq.${encodeURIComponent(responseId)}&select=id,consultation_id`,
  );
  const r = rs[0];
  if (!r || r.consultation_id !== c.id) {
    return NextResponse.json({ error: "この相談の回答ではありません" }, { status: 403 });
  }

  const up = await dbUpdate("responses", r.id, { helpful });
  if (!up.ok) return NextResponse.json({ error: up.error }, { status: 500 });

  return NextResponse.json({ ok: true, helpful });
}
