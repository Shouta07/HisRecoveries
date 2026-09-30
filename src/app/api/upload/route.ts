import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import {
  imagesEnabled, bucket, isAllowedType, extOf, pathFor,
  MAX_FILES, MAX_BYTES,
} from "@/lib/ask/images";

// 画像を置く場所を渡す。
//
// ── 中身はここを通さない ──────────────────────────
// 画像の本体は、この関数を通さない。
// 通すと、そのぶんだけ関数の制限（大きさ・時間）に引っかかる。
// 置き場所の署名URLだけ渡して、ブラウザから直接置いてもらう。
//
// ── 置き場所は、こちらが決める ────────────────────
// 道（path）を画面から受け取らない。
// 受け取ると、他人の相談のフォルダに置けてしまう。
// 相談の鍵から組み立てる。
//
// ── 開いていなければ、開いていないと言う ──────────
// 置き場所が非公開かどうかは、こちらでは確かめられない。
// だから、バケット名を入れた人が責任を持って開ける形にする
// （lib/ask/images.ts の IMAGES_BUCKET）。

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function POST(req: NextRequest) {
  if (!imagesEnabled || !dbAdminEnabled || !SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json(
      { error: "いま画像は受け取れません" },
      { status: 503 },
    );
  }

  let body: { token?: unknown; type?: unknown; bytes?: unknown; n?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "読めませんでした" }, { status: 400 });
  }

  if (!isConsultToken(body.token)) {
    return NextResponse.json({ error: "この相談は見つかりません" }, { status: 400 });
  }
  if (!isAllowedType(body.type)) {
    return NextResponse.json(
      { error: "この形式の画像は受け取れません" },
      { status: 400 },
    );
  }
  const bytes = Number(body.bytes);
  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_BYTES) {
    return NextResponse.json(
      { error: `1枚あたり ${Math.round(MAX_BYTES / 1024 / 1024)}MB までです` },
      { status: 400 },
    );
  }
  const n = Number(body.n);
  if (!Number.isInteger(n) || n < 1 || n > MAX_FILES) {
    return NextResponse.json(
      { error: `${MAX_FILES}枚までです` },
      { status: 400 },
    );
  }

  // 道はこちらで組み立てる。画面からは受け取らない
  const path = pathFor(body.token as string, n, extOf(body.type));

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket()}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 120 }),
    },
  );

  if (!res.ok) {
    console.error("[upload] sign failed", res.status, await res.text());
    return NextResponse.json(
      { error: "置き場所を用意できませんでした" },
      { status: 500 },
    );
  }

  const json = (await res.json()) as { url?: string; token?: string };
  if (!json.url) {
    return NextResponse.json({ error: "置き場所を用意できませんでした" }, { status: 500 });
  }

  return NextResponse.json(
    { url: `${SUPABASE_URL}/storage/v1${json.url}`, path },
    { headers: { "Cache-Control": "no-store" } },
  );
}
