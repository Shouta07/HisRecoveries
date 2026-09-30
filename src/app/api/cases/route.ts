import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { casesOfPass } from "@/lib/ask/cases-store";

// 相手ごとのケースを返す。
//
// ── 持ち主の鍵でしか引けない ──────────────────────
// パスの鍵を知っている人だけ。会員登録が無いので、ここが唯一の証。
// 鍵はURLのクエリで来るが、ログには残さない。
//
// ── 相手の情報は返さない ──────────────────────────
// 呼び名・出会ったところ・現在地・前回決めたことだけ。
// 相手はこのサービスに同意していない第三者。

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pass = req.nextUrl.searchParams.get("pass") ?? "";
  if (!isConsultToken(pass)) {
    return NextResponse.json({ cases: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ cases: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const rows = await casesOfPass(pass);
  return NextResponse.json(
    {
      cases: rows.map((c) => ({
        token: c.token,
        partner_label: c.partner_label,
        dating_app: c.dating_app,
        current_stage: c.current_stage,
        last_decision: c.last_decision,
        updated_at: c.updated_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
