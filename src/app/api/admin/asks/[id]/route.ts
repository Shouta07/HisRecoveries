import { NextRequest, NextResponse } from "next/server";
import { dbUpdate, dbAdminEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "submitted",
  "reviewing",
  "replied",
  "published",
  "archived",
];

type Body = { status?: string; notes?: string; qa_slug?: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "admin db not configured" },
      { status: 500 }
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes.slice(0, 4000);
  }
  if (typeof body.qa_slug === "string") {
    patch.qa_slug = body.qa_slug.slice(0, 120) || null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const result = await dbUpdate("asks", params.id, patch);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
