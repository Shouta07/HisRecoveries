import { NextRequest, NextResponse } from "next/server";
import {
  listStorageFiles,
  deleteStorageFile,
  articlePrefix,
  storageEnabled,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!storageEnabled) {
    return NextResponse.json(
      { error: "Supabase Storage env not configured" },
      { status: 500 }
    );
  }
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }
  const prefix = articlePrefix(slug);
  const result = await listStorageFiles(prefix);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "list failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, files: result.files ?? [] });
}

export async function DELETE(req: NextRequest) {
  if (!storageEnabled) {
    return NextResponse.json(
      { error: "Supabase Storage env not configured" },
      { status: 500 }
    );
  }
  let body: { path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.path || !body.path.startsWith("articles/")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }
  const result = await deleteStorageFile(body.path);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "delete failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
