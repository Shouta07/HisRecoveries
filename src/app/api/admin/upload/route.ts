import { NextRequest, NextResponse } from "next/server";
import {
  uploadToStorage,
  articleObjectPath,
  storageEnabled,
} from "@/lib/storage";

// Use the Node runtime: we read multipart bodies on the server and
// proxy the bytes to Supabase Storage.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // ~4MB to stay safely under Vercel limits

export async function POST(req: NextRequest) {
  if (!storageEnabled) {
    return NextResponse.json(
      { error: "Supabase Storage env not configured" },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  const slug = form.get("slug");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "no slug" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_BYTES / 1024 / 1024}MB). For longer videos use YouTube and paste the URL into the article.` },
      { status: 413 }
    );
  }

  const objectPath = articleObjectPath(slug, file.name);
  const buf = Buffer.from(await file.arrayBuffer());
  const result = await uploadToStorage(
    objectPath,
    buf,
    file.type || "application/octet-stream"
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    url: result.url,
    path: objectPath,
    name: file.name,
    size: file.size,
    contentType: file.type,
  });
}
