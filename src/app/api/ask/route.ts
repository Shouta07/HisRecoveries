import { NextRequest, NextResponse } from "next/server";
import { dbInsert, hashEmail, parseAttribution } from "@/lib/db";

export const runtime = "edge";

const ALLOWED_TERRITORIES = new Set([
  "sweat-odor",
  "skin-acne",
  "hair-loss",
  "beard-body-hair",
  "face-impression",
  "mind-awareness",
]);

const ALLOWED_FEELINGS = new Set([
  "mirror",
  "photo",
  "cleanliness",
  "before-meeting",
  "aging",
  "tired",
]);

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const question = str(body.question, 800);
  if (!question || question.length < 8) {
    return NextResponse.json(
      { error: "問いを 8 文字以上で書いてください" },
      { status: 400 }
    );
  }

  const email = str(body.email, 200);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "返信のためのメールアドレスが必要です" },
      { status: 400 }
    );
  }

  const context = str(body.context, 400);
  const ageRange = str(body.ageRange, 40);
  const rawTerritory = str(body.territory, 60);
  const territory =
    rawTerritory && ALLOWED_TERRITORIES.has(rawTerritory) ? rawTerritory : null;
  const rawFeeling = str(body.feeling, 60);
  const feeling =
    rawFeeling && ALLOWED_FEELINGS.has(rawFeeling) ? rawFeeling : null;

  const consentReply = body.consentReply !== false; // default true
  const consentPublish = body.consentPublish === true; // default false

  const attribution = parseAttribution(req);

  const row = {
    email,
    email_hash: await hashEmail(email),
    question,
    context,
    age_range: ageRange,
    territory,
    feeling,
    consent_reply: consentReply,
    consent_publish: consentPublish,
    status: "submitted",
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
  };

  const { ok, error } = await dbInsert("asks", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
