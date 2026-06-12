import { NextRequest, NextResponse } from "next/server";
import { dbInsert, hashEmail, parseAttribution } from "@/lib/db";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let body: {
    email?: string;
    name?: string;
    responses?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "メールアドレスが必要です" },
      { status: 400 }
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 80) : null;

  const responses = body.responses ?? {};
  if (typeof responses !== "object" || responses === null) {
    return NextResponse.json({ error: "invalid responses" }, { status: 400 });
  }

  const attribution = parseAttribution(req);

  // The raw email is stored separately under a short-lived contact field so
  // the editor can reply, while the hash + responses become the long-term
  // anonymized record for the Recovery Data layer.
  const row = {
    email,
    name,
    email_hash: await hashEmail(email),
    responses,
    status: "submitted",
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
  };

  const { ok, error } = await dbInsert("checks", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
