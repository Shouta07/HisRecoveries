import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { isConsultToken } from "@/lib/ask/token";
import { phaseOf, isLive, type LiveCounts } from "@/lib/ask/live";

// 届くまでを、画面から聞きにくる先。
//
// ── 鍵を持っている人だけ ──────────────────────────
// 会員登録が無いので、相談の鍵がその人である証拠。
//
// ── 誰が読んだかは返さない ────────────────────────
// 返すのは人数だけ。回答者は匿名で引き受けている。
// 年代を返すのは、回答が届いたものだけ（結果に出るのと同じ範囲）。
//
// ── 止まったら、止まったと伝える ──────────────────
// live:false を返す。画面はそこで問い合わせをやめる。
// 返さないと、終わった相談を何時間も叩き続ける。

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PAID: string[] = ["recruiting", "collecting", "completed", "review"];

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  if (!isConsultToken(params.token)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json({ live: false, configured: false });
  }

  const rows = await dbSelect<{ id: string; panel_size: number; status: string }>(
    `consultations?token=eq.${encodeURIComponent(params.token)}&select=id,panel_size,status`,
  );
  const c = rows[0];
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

  const invites = await dbSelect<{ id: string; opened_at: string | null }>(
    `response_invites?consultation_id=eq.${c.id}&select=id,opened_at`,
  );

  // 届いた回答。年代とひとことだけ。誰かは分からない。
  const answers = await dbSelect<{
    id: string;
    display_age_band: string;
    comment: string;
    created_at: string;
  }>(
    `responses?consultation_id=eq.${c.id}&select=id,display_age_band,comment,created_at&order=created_at.asc`,
  );

  const counts: LiveCounts = {
    panel: c.panel_size,
    sent: invites.length,
    opened: invites.filter((i) => i.opened_at).length,
    answered: answers.length,
  };

  const paid = PAID.includes(c.status);
  const phase = phaseOf(counts, paid);

  return NextResponse.json(
    {
      live: isLive(phase),
      configured: true,
      phase,
      counts,
      status: c.status,
      answers: answers.map((a) => ({
        id: a.id,
        ageBand: a.display_age_band,
        comment: a.comment,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
