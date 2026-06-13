import { NextRequest, NextResponse } from "next/server";
import { dbInsert, parseAttribution } from "@/lib/db";

export const runtime = "edge";

type Body = {
  orgName?: string;
  orgType?: "clinic" | "salon" | "gym" | "specialist";
  repName?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  location?: string;
  services?: string;
  philosophy?: string;
  principles?: {
    understanding?: boolean;
    no_hard_sell?: boolean;
    improvement_data?: boolean;
    education?: boolean;
    long_term?: boolean;
  };
  hasNps?: "yes" | "no" | "maybe";
  hasEducation?: "yes" | "no" | "maybe";
  hasLongterm?: "yes" | "no" | "maybe";
};

const VALID_TYPES = ["clinic", "salon", "gym", "specialist"];

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const orgName = (body.orgName ?? "").trim().slice(0, 200);
  if (!orgName)
    return NextResponse.json({ error: "組織名は必須です" }, { status: 400 });
  if (!VALID_TYPES.includes(body.orgType ?? ""))
    return NextResponse.json({ error: "invalid org_type" }, { status: 400 });
  const repName = (body.repName ?? "").trim().slice(0, 80);
  if (!repName)
    return NextResponse.json(
      { error: "ご担当者名は必須です" },
      { status: 400 }
    );
  const email = (body.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json(
      { error: "メールアドレスをご入力ください" },
      { status: 400 }
    );

  const services = (body.services ?? "").trim().slice(0, 1500);
  const philosophy = (body.philosophy ?? "").trim().slice(0, 1500);
  if (!services || !philosophy)
    return NextResponse.json(
      { error: "サービスと立場の両方をご記入ください" },
      { status: 400 }
    );

  const principles = body.principles ?? {};
  const allChecked =
    principles.understanding === true &&
    principles.no_hard_sell === true &&
    principles.improvement_data === true &&
    principles.education === true &&
    principles.long_term === true;
  if (!allChecked)
    return NextResponse.json(
      { error: "5 つの原則すべてのチェックが必要です" },
      { status: 400 }
    );

  const attribution = parseAttribution(req);

  const row = {
    org_name: orgName,
    org_type: body.orgType,
    rep_name: repName,
    email,
    phone: (body.phone ?? "").trim().slice(0, 40) || null,
    website_url: (body.websiteUrl ?? "").trim().slice(0, 400) || null,
    location: (body.location ?? "").trim().slice(0, 80) || null,
    services_description: services,
    philosophy,
    principles_checked: principles,
    has_nps_data: body.hasNps ?? "no",
    has_education: body.hasEducation ?? "no",
    has_longterm_plan: body.hasLongterm ?? "no",
    status: "submitted",
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
  };

  const { ok, error } = await dbInsert("certified_applications", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
