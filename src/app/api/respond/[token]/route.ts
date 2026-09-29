import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbInsertReturning, dbUpdate, dbAdminEnabled } from "@/lib/db";
import { isVerdict, isPick, isSecond, COMMENT_MIN, COMMENT_MAX } from "@/lib/ask/model";
import { redact } from "@/lib/ask/redact";
import { isPlanId } from "@/lib/ask/plans";
import { credit, rateFor, balanceOf, type Tier } from "@/lib/responder/balance";
import { isReplyToken } from "@/lib/ask/token";

// 回答を受け取る。
//
// ── 1つの鍵で1回だけ ──────────────────────────────
// 同じ人が何度も答えると、5人に聞いたはずが1人の意見になる。
// 鍵と回答を 1 対 1 にする（responses.invite_id は unique）。
//
// ── 回答も伏せる ──────────────────────────────────
// 回答者が相談者に連絡先を書く場合がある。そのまま渡さない。
//
// ── 揃ったら自分で閉じる ──────────────────────────
// 規定数に達したら status を completed にして、待っている人を待たせない。

export const runtime = "edge";

type Invite = {
  id: string;
  consultation_id: string;
  responder_id: string | null;
  answered_at: string | null;
  responders: { display_age_band: string; tier: string | null } | null;
};

type Consult = {
  id: string;
  is_ab: boolean;
  panel_size: number;
  status: string;
  category: string;
  product_type: string | null;
};

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!isReplyToken(token)) {
    return NextResponse.json({ error: "このリンクは正しくありません" }, { status: 400 });
  }
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "この環境はデータベースに接続されていません" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const invites = await dbSelect<Invite>(
    `response_invites?token=eq.${encodeURIComponent(token)}&select=id,consultation_id,responder_id,answered_at,responders(display_age_band,tier)`,
  );
  const invite = invites[0];
  if (!invite) {
    return NextResponse.json({ error: "このリンクは見つかりませんでした" }, { status: 404 });
  }
  if (invite.answered_at) {
    return NextResponse.json({ error: "この相談には、もう回答済みです" }, { status: 409 });
  }

  const cs = await dbSelect<Consult>(
    `consultations?id=eq.${invite.consultation_id}&select=id,is_ab,panel_size,status,category,product_type`,
  );
  const c = cs[0];
  if (!c) return NextResponse.json({ error: "相談が見つかりません" }, { status: 404 });
  if (c.status === "completed" || c.status === "cancelled") {
    return NextResponse.json({ error: "この相談は締め切られています" }, { status: 409 });
  }

  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (comment.length < COMMENT_MIN) {
    return NextResponse.json(
      { error: `理由を ${COMMENT_MIN} 文字以上で書いてください` },
      { status: 400 },
    );
  }

  // A/B かどうかで、聞いている選択肢が違う。
  // 片方しか無い状態で保存すると、結果画面で数えられなくなる。
  const verdict = isVerdict(body.verdict) ? body.verdict : null;
  const pick = isPick(body.pick) ? body.pick : null;
  if (c.is_ab && !pick) {
    return NextResponse.json({ error: "A か B を選んでください" }, { status: 400 });
  }
  if (!c.is_ab && !verdict) {
    return NextResponse.json({ error: "評価を選んでください" }, { status: 400 });
  }

  const ins = await dbInsertReturning<{ id: string }>("responses", {
    consultation_id: c.id,
    invite_id: invite.id,
    display_age_band: invite.responders?.display_age_band ?? "any",
    verdict,
    pick,
    second: isSecond(body.second) ? body.second : null,
    comment: redact(comment.slice(0, COMMENT_MAX)).text,
    // どう変われば自然か。任意。
    // ここも伏せ字を通す（相手の名前が混ざることがある）。
    fix:
      typeof body.fix === "string" && body.fix.trim()
        ? redact(body.fix.trim().slice(0, COMMENT_MAX)).text
        : null,
  });
  if (!ins.ok) return NextResponse.json({ error: ins.error }, { status: 500 });

  await dbUpdate("response_invites", invite.id, { answered_at: new Date().toISOString() });

  // 報酬を、その場で確定させる。
  //
  // 「あとで運営から連絡します」にしない。答えた手応えが残らない。
  // 確認を通った時点で残高に入れ、いくら入ったかをこの返事で返す。
  // 銀行への振り込みは、まとまってからまとめて行う（balance.ts）。
  //
  // 予算の残りが足りなければ払わない。黙って0円にはせず、
  // 画面には額を出さない（入っていない報酬を見せない）。
  let paidYen = 0;
  let todayYen = 0;
  let todayCount = 0;
  const responseId = ins.rows?.[0]?.id;
  const responderId = invite.responder_id;

  if (responseId && responderId && isPlanId(c.product_type)) {
    const tier = (invite.responders?.tier ?? "bronze") as Tier;
    const r = await credit({
      responderId,
      yen: rateFor({ tier }),
      responseId,
      consultationId: c.id,
      planId: c.product_type,
    });
    paidYen = r.paid;
    const b = await balanceOf(responderId);
    todayYen = b.todayYen;
    todayCount = b.todayCount;
  }

  // 何件集まったかを数え直して、揃っていれば閉じる。
  const done = await dbSelect<{ id: string }>(
    `responses?consultation_id=eq.${c.id}&select=id`,
  );
  const n = done.length;
  if (n >= c.panel_size) {
    await dbUpdate("consultations", c.id, {
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  } else if (c.status === "recruiting") {
    await dbUpdate("consultations", c.id, { status: "collecting" });
  }

  return NextResponse.json({ ok: true, answered: n, of: c.panel_size, paidYen, todayYen, todayCount });
}
