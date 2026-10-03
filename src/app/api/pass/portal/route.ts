import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { portalUrl, stripeEnabled } from "@/lib/stripe";
import { site } from "@/lib/site";

// 解約・支払い方法の変更。
//
// ── 問い合わせないと解約できない形にしない ────────
// copy.ts の MANAGE_NOTE に「連絡は要りません」と書いてある。
// 書いてある以上、自分で解約できる口が要る。
// 書いてあるのに口が無いのが、いちばん悪い。
//
// Stripe の Customer Portal をそのまま使う。
// 解約・支払い方法の変更・領収書が、全部そこにある。
// 自前で作ると、解約だけ動線を細くする誘惑が働く。

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!dbAdminEnabled || !stripeEnabled) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let body: { userToken?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const userToken = typeof body.userToken === "string" ? body.userToken.trim() : "";
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(userToken)) {
    return NextResponse.json({ error: "鍵の形が違います" }, { status: 400 });
  }

  // 解約済みの人も開けるようにする（領収書を見に来ることがある）。
  // status で絞らないのは、そのため。
  const rows = await dbSelect<{ stripe_customer_id: string | null }>(
    `subscriptions?user_token=eq.${encodeURIComponent(userToken)}` +
      `&select=stripe_customer_id&order=updated_at.desc&limit=1`,
  );
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "お申し込みが見つかりませんでした" },
      { status: 404 },
    );
  }

  const base = site.url.replace(/\/$/, "");
  const url = await portalUrl(customerId, `${base}/mine`);
  if (!url) {
    return NextResponse.json(
      { error: "管理画面を開けませんでした" },
      { status: 502 },
    );
  }
  return NextResponse.json({ url });
}
