import { NextRequest, NextResponse } from "next/server";
import { dbUpdate, dbAdminEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "submitted",
  "reviewing",
  "audit",
  "committee",
  "certified",
  "declined",
  "revoked",
];

type Body = {
  status?: string;
  notes?: string;
  public_blurb?: string;
  certified_at?: string; // YYYY-MM-DD
  certified_year?: number;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!dbAdminEnabled)
    return NextResponse.json(
      { error: "admin db not configured" },
      { status: 500 }
    );
  if (!/^[0-9a-f-]{36}$/i.test(params.id))
    return NextResponse.json({ error: "invalid id" }, { status: 400 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status))
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    patch.status = body.status;
    if (body.status === "certified") {
      const today = new Date();
      patch.certified_at = today.toISOString().slice(0, 10);
      patch.certified_year = today.getFullYear();
    }
  }
  if (typeof body.notes === "string") {
    patch.notes = body.notes.slice(0, 8000);
  }
  if (typeof body.public_blurb === "string") {
    patch.public_blurb = body.public_blurb.slice(0, 600);
  }
  if (typeof body.certified_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.certified_at)) {
    patch.certified_at = body.certified_at;
    patch.certified_year = parseInt(body.certified_at.slice(0, 4), 10);
  }
  if (typeof body.certified_year === "number") {
    patch.certified_year = body.certified_year;
  }
  if (Object.keys(patch).length === 0)
    return NextResponse.json(
      { error: "no fields to update" },
      { status: 400 }
    );

  const result = await dbUpdate("certified_applications", params.id, patch);
  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
