import { NextRequest, NextResponse } from "next/server";
import { dbInsert, hashEmail, parseAttribution } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const category = pickString(body.category);
  const before = pickString(body.before)?.slice(0, 5000) ?? null;
  const did = pickString(body.did)?.slice(0, 5000) ?? null;
  const changed = pickString(body.changed)?.slice(0, 5000) ?? null;
  const consent = pickString(body.consent);
  const email = pickString(body.email);

  const attribution = parseAttribution(req);

  const row = {
    category,
    before_text: before,
    did_text: did,
    changed_text: changed,
    consent,
    has_email: Boolean(email),
    email_hash: email ? await hashEmail(email) : null,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_content: attribution.utm_content ?? null,
    referrer_host: attribution.referrer_host ?? null,
    landing_path: attribution.landing_path ?? null,
  };

  const { ok, error } = await dbInsert("stories", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
