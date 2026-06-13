import { NextRequest, NextResponse } from "next/server";
import { dbInsert, hashEmail, parseAttribution } from "@/lib/db";

export const runtime = "edge";

type Body = {
  name?: string;
  email?: string;
  format?: "online" | "in_person";
  preferences?: string[];
  check?: "yes" | "no" | "maybe";
  topic?: string;
  budget?: string;
  extra?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "メールアドレスをご入力ください" }, { status: 400 });
  }
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!name) {
    return NextResponse.json({ error: "お名前をご入力ください" }, { status: 400 });
  }
  const topic = (body.topic ?? "").trim().slice(0, 800);
  if (!topic) {
    return NextResponse.json(
      { error: "いま話したいことを書いてください" },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.preferences) || body.preferences.length === 0) {
    return NextResponse.json(
      { error: "希望の時間帯を一つ以上選んでください" },
      { status: 400 }
    );
  }

  const attribution = parseAttribution(req);

  const row = {
    email,
    name,
    email_hash: await hashEmail(email),
    format: body.format ?? "online",
    preferences: body.preferences,
    check_taken: body.check ?? "no",
    topic,
    budget: body.budget ?? "undecided",
    extra: (body.extra ?? "").trim().slice(0, 600) || null,
    status: "submitted",
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
  };

  const { ok, error } = await dbInsert("guide_requests", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
