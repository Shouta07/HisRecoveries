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

  const subject = pickString(body.subject)?.slice(0, 200) ?? null;
  const text = pickString(body.body)?.slice(0, 5000) ?? null;
  const penname = pickString(body.penname)?.slice(0, 80) ?? null;
  const email = pickString(body.email);
  const consent = body.consent === true;
  const wishes = Array.isArray(body.wishes)
    ? body.wishes.filter((v): v is string => typeof v === "string").join(",")
    : null;

  if (!text || text.trim().length < 20) {
    return NextResponse.json({ error: "too short" }, { status: 400 });
  }

  const attribution = parseAttribution(req);

  // Schema-compatible: category column reused for "subject" tag,
  // body column carries text + light metadata for future analysis.
  const composedBody = [
    text,
    subject ? `\n[件名] ${subject}` : "",
    wishes ? `\n[希望] ${wishes}` : "",
    penname ? `\n[ペンネーム] ${penname}` : "",
    `\n[掲載同意] ${consent ? "yes" : "no"}`,
  ]
    .filter(Boolean)
    .join("");

  const row = {
    category: subject,
    body: composedBody,
    has_email: Boolean(email),
    email_hash: email ? await hashEmail(email) : null,
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
  };

  const { ok, error } = await dbInsert("letters", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
