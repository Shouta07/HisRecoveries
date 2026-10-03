import { NextResponse } from "next/server";
import { koiEnabled, whyKoiDisabled } from "@/lib/koi/gate";
import { sessionConfig, MAX_MINUTES_PER_CALL } from "@/lib/koi/session";

// 恋亀と話し始めるための、使い捨ての鍵を作る。
//
// ══════════════════════════════════════════════════
// 本物の鍵を、ブラウザに渡さない
// ══════════════════════════════════════════════════
// REALTIME_API_KEY は本物で、漏れると他人が自由に使える。
// 請求はこちらに来る。
//
// ブラウザへ渡すのは、OpenAI が返す使い捨ての鍵だけ。
// 短い間しか効かないので、拾われても被害が小さい。
//
// ══════════════════════════════════════════════════
// 人格と道具は、こちらが決める
// ══════════════════════════════════════════════════
// ブラウザから instructions や tools を受け取らない。
// 受け取ると、人格を書き換えた恋亀を喋らせられる。
//
// このルートは、本文を一切読まない。
//
// ══════════════════════════════════════════════════
// 終わりのない通話を作らない
// ══════════════════════════════════════════════════
// つなぎっぱなしにされると、そのぶん課金が走る。
// 1回の上限（session.ts）を一緒に返して、画面側が切る。
// 画面側だけに任せないよう、使い捨ての鍵自体も短命にする。

export const runtime = "edge";

/** 使い捨ての鍵をもらう口。変わったときに差し替えられるようにしておく */
const ENDPOINT =
  process.env.REALTIME_SESSION_URL ?? "https://api.openai.com/v1/realtime/sessions";

/* 音声をつなぐ口。ブラウザがここへ SDP を送る。
   口の名前を画面側に直書きすると、変わったときに
   サーバーと画面の2か所を直すことになる。ここから渡す。 */
const CONNECT =
  process.env.REALTIME_CONNECT_URL ?? "https://api.openai.com/v1/realtime";

export async function POST() {
  if (!koiEnabled) {
    // 鍵が無いのに「つなげます」と返さない。
    console.error("[koi] not enabled:", whyKoiDisabled());
    return NextResponse.json(
      { error: "いま恋亀と話せません。準備が終わるまでお待ちください。" },
      { status: 503 },
    );
  }

  const c = sessionConfig();

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REALTIME_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: c.model,
        voice: c.voice,
        instructions: c.instructions,
        tools: c.tools,
        // 道具を呼ぶかどうかは、恋亀に決めさせる。
        // こちらから強制すると、話していないのに行ができる。
        tool_choice: "auto",
      }),
    });
  } catch (e) {
    console.error("[koi] session fetch failed", e);
    return NextResponse.json(
      { error: "つなげませんでした。少し時間をおいてお試しください。" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    // 向こうの返事をそのまま画面に出さない（鍵や内部の事情が混ざる）
    const body = await res.text().catch(() => "");
    console.error("[koi] session rejected", res.status, body.slice(0, 300));
    return NextResponse.json(
      { error: "つなげませんでした。少し時間をおいてお試しください。" },
      { status: 502 },
    );
  }

  const j = (await res.json().catch(() => null)) as
    | { client_secret?: { value?: string; expires_at?: number } }
    | null;

  const secret = j?.client_secret?.value;
  if (!secret) {
    console.error("[koi] session had no client_secret");
    return NextResponse.json(
      { error: "つなげませんでした。少し時間をおいてお試しください。" },
      { status: 502 },
    );
  }

  /* 返すのは、使い捨ての鍵と、つなぎ先と、切る時刻だけ。
     人格も道具も返さない（ブラウザが持つ必要がない）。 */
  return NextResponse.json({
    secret,
    connectUrl: CONNECT,
    model: c.model,
    expiresAt: j?.client_secret?.expires_at ?? null,
    maxMinutes: MAX_MINUTES_PER_CALL,
    promptVersion: c.promptVersion,
  });
}
