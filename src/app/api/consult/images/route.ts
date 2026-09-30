import { NextRequest, NextResponse } from "next/server";
import { dbInsert, dbAdminEnabled } from "@/lib/db";
import { dbSelect } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { imagesEnabled, MAX_FILES, isAllowedType, pathFor, extOf } from "@/lib/ask/images";

// 置き終えた画像を、相談に結びつける。
//
// ── 置いた本人しか結びつけられない ────────────────
// 相談の鍵を持っている人だけ。
// 道（path）は受け取らず、鍵と順番から組み立て直す。
// 受け取ると、他人の相談の画像を自分の相談に付けられる。
//
// ── 二度押しても増やさない ────────────────────────
// 同じ道の行は1つだけ（schema.sql の unique index）。

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Row = { id: string };

export async function POST(req: NextRequest) {
  if (!imagesEnabled || !dbAdminEnabled) {
    return NextResponse.json({ error: "いま画像は受け取れません" }, { status: 503 });
  }

  let body: { token?: unknown; files?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "読めませんでした" }, { status: 400 });
  }

  const token = body.token;
  if (!isConsultToken(token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }
  if (!Array.isArray(body.files) || body.files.length === 0) {
    return NextResponse.json({ error: "画像がありません" }, { status: 400 });
  }
  if (body.files.length > MAX_FILES) {
    return NextResponse.json({ error: `${MAX_FILES}枚までです` }, { status: 400 });
  }

  const cs = await dbSelect<Row>(
    `consultations?token=eq.${encodeURIComponent(token as string)}&select=id&limit=1`,
  );
  const c = cs[0];
  if (!c) return NextResponse.json({ error: "この相談は見つかりません" }, { status: 404 });

  const rows: Record<string, unknown>[] = [];
  let n = 0;
  for (const f of body.files as { type?: unknown; bytes?: unknown }[]) {
    n += 1;
    if (!isAllowedType(f?.type)) continue;
    // 道はこちらで組み立てる。画面からは受け取らない
    rows.push({
      consultation_id: c.id,
      path: pathFor(token as string, n, extOf(f.type as string)),
      ord: n,
      content_type: f.type as string,
      bytes: Number(f?.bytes) || null,
    });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "受け取れる画像がありません" }, { status: 400 });
  }

  const ins = await dbInsert("consultation_images", rows as unknown as Record<string, unknown>);
  if (!ins.ok) {
    console.error("[consult/images] insert failed", ins.error);
    return NextResponse.json({ error: "画像を結びつけられませんでした" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, n: rows.length });
}
