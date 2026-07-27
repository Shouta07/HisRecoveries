import { NextRequest, NextResponse } from "next/server";
import { dbInsert, parseAttribution } from "@/lib/db";

export const runtime = "edge";

const ALLOWED_EVENTS = new Set([
  "gathering_apply",
  "affiliate_click",
  "subscribe_click",
  "reflect_complete",
  "hero_cta_click",
  "assessment_start",
  "assessment_complete",
  "article_cta_click",
  "story_start",
  "story_submitted",
  "membership_subscribe_click",
  // Job（叶えたいこと）ファネル
  "occasion_cta_click",
  "job_select",
  "plan_submit",
  "plan_view",
  "plan_tab_view",
  "plan_consult_click",
  // 記事ファネル
  "article_roadmap_view",
  "article_task_done",
  "article_task_later",
  "article_next_click",
  "article_goal_set",
  "article_roadmap_cta",
]);

export async function POST(req: NextRequest) {
  let body: { event?: unknown; props?: unknown; path?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const event = typeof body.event === "string" ? body.event : null;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "unknown event" }, { status: 400 });
  }
  const props =
    typeof body.props === "object" && body.props !== null ? body.props : {};
  const path = typeof body.path === "string" ? body.path : null;
  const attribution = parseAttribution(req);

  const row = {
    event_name: event,
    props,
    path,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    utm_content: attribution.utm_content ?? null,
    utm_term: attribution.utm_term ?? null,
    referrer_host: attribution.referrer_host ?? null,
    landing_path: attribution.landing_path ?? null,
  };

  const { ok, error } = await dbInsert("events", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
