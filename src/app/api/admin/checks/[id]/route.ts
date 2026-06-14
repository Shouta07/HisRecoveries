import { NextRequest, NextResponse } from "next/server";
import { dbUpdate, dbAdminEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["submitted", "reviewing", "replied", "archived"];

type Body = {
  status?: string;
  notes?: string;
  story_slug?: string | null;
  /** "now" → server stamps current time; null → clear */
  follow_up_at?: "now" | string | null;
};

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
  if (body.story_slug !== undefined) {
    patch.story_slug =
      typeof body.story_slug === "string"
        ? body.story_slug.slice(0, 120) || null
        : null;
  }
  if (body.follow_up_at !== undefined) {
    if (body.follow_up_at === null) {
      patch.follow_up_at = null;
    } else if (body.follow_up_at === "now") {
      patch.follow_up_at = new Date().toISOString();
    } else if (typeof body.follow_up_at === "string") {
      // accept ISO8601; reject anything else.
      const d = new Date(body.follow_up_at);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "invalid follow_up_at" }, { status: 400 });
      }
      patch.follow_up_at = d.toISOString();
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 400 });
  }

  const result = await dbUpdate("checks", params.id, patch);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
