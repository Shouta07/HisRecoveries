import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, dbAdminEnabled, parseAttribution } from "@/lib/db";

// 「話す」の順番待ち。
//
// ── まだ売れないものの、需要だけ先に測る ──────────
// 1対1で話す商品は、相手も実在の人なので、
// 時間を決めた受け入れ方と、その場を見る体制が要る。
// それが用意できるまで売らない。
//
// ただし「要る人がどれだけいるか」は先に知りたい。
// 順番待ちだけ受ける。お金は受け取らない。
//
// ── 連絡先以外は持たない ──────────────────────────
// 何に迷っているかは、ここでは聞かない。
// 買えないものの入口で、悩みまで預からせない。

export const runtime = "edge";

const MAX = 200;

function looksLikeEmail(x: unknown): x is string {
  return typeof x === "string" && x.length <= MAX && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(x.trim());
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!looksLikeEmail(body.email)) {
    return NextResponse.json({ error: "メールアドレスを確認してください" }, { status: 400 });
  }

  if (!dbAdminEnabled) {
    // 保存先が無いのに「登録しました」と返さない。
    return NextResponse.json(
      { error: "いまお預かりできません。少し時間をおいてお試しください。" },
      { status: 503 },
    );
  }

  const a = parseAttribution(req);
  const ins = await dbInsertReturning("talk_waitlist", {
    email: body.email.trim().toLowerCase(),
    utm_source: a.utm_source ?? null,
    referrer_host: a.referrer_host ?? null,
  });
  // 同じ人が二度押しても、登録済みとして扱う（一意制約に当たるだけ）
  if (!ins.ok && !/duplicate|unique/i.test(ins.error ?? "")) {
    return NextResponse.json({ error: "登録できませんでした" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
