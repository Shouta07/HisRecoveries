import { NextRequest, NextResponse } from "next/server";
import { koiEnabled } from "@/lib/koi/gate";
import { isTalkerToken } from "@/lib/ask/token";
import { mask } from "@/lib/koi/mask";
import { readTalkUpdate } from "@/lib/talk/shape";
import { cardOf } from "@/lib/koi/card";
import { buildStructurePrompt, STRUCTURE_MODEL, STRUCTURE_URL } from "@/lib/koi/structure";
import { ownedBy, addEpisode } from "@/lib/koi/store";
import { dbAdminEnabled } from "@/lib/db";

// 話し終わったあと、会話を1枚のカードにする。
//
// ══════════════════════════════════════════════════
// ここが、入口と出口のあいだ
// ══════════════════════════════════════════════════
// 入口   声 → 文字起こし（/api/koi/session → ブラウザ）
// ここ   文字起こし → 構造 → カード
// 出口   カード（画面）と、EP（記録）
//
// ══════════════════════════════════════════════════
// 伏せ字は、こちらでもかける
// ══════════════════════════════════════════════════
// 画面側でもかけているが、ブラウザは書き換えられる。
// 外（OpenAI）へ出す前に、こちらでもう一度かける。
//
// かけ忘れると、相手の連絡先や勤務先が、そのまま外へ出る。
// 取り返しがつかない種類の漏れ方なので、二重にする。
//
// ══════════════════════════════════════════════════
// 作り話は、受け取る側で捨てる
// ══════════════════════════════════════════════════
// 引用の無い事実、確からしさの足りない推測、
// 相手の気持ちを当てる書き方は、readTalkUpdate が捨てる。
// 捨てたものは黙って消さず、数だけ返す。

export const runtime = "edge";

/** 1回ぶんの文字起こしの上限。長いと料金も時間も伸びる */
const TRANSCRIPT_MAX = 12000;

type Line = { who: string; say: string };

export async function POST(req: NextRequest) {
  if (!koiEnabled) {
    return NextResponse.json({ error: "いま恋亀と話せません。" }, { status: 503 });
  }

  let body: { talker?: unknown; personId?: unknown; who?: unknown; lines?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const talker = body.talker;
  if (!isTalkerToken(talker)) {
    return NextResponse.json({ error: "この会話は見つかりません" }, { status: 400 });
  }

  const lines = Array.isArray(body.lines) ? (body.lines as Line[]) : [];
  if (lines.length < 2) {
    // 2往復に満たないものは、整理しても何も出ない。呼ばない。
    return NextResponse.json({ error: "まだ整理できるほど話していません" }, { status: 400 });
  }

  /* 外へ出す前に、こちらで伏せ字をかける。
     画面側のものは信じない。 */
  const text = lines
    .map((l) => `${l.who === "koi" ? "恋亀" : "本人"}: ${String(l.say ?? "")}`)
    .join("\n")
    .slice(0, TRANSCRIPT_MAX);
  const safe = mask(text);

  let res: Response;
  try {
    res = await fetch(STRUCTURE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REALTIME_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: STRUCTURE_MODEL,
        // JSONだけを返させる。前置きが付くと、受け取る側が落ちる
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildStructurePrompt() },
          { role: "user", content: safe.text },
        ],
      }),
    });
  } catch (e) {
    console.error("[koi] structure fetch failed", e);
    return NextResponse.json({ error: "いま整理できませんでした。" }, { status: 502 });
  }

  if (!res.ok) {
    const b = await res.text().catch(() => "");
    console.error("[koi] structure rejected", res.status, b.slice(0, 300));
    return NextResponse.json({ error: "いま整理できませんでした。" }, { status: 502 });
  }

  const j = (await res.json().catch(() => null)) as
    | { choices?: { message?: { content?: string } }[] }
    | null;
  const raw = j?.choices?.[0]?.message?.content;
  if (!raw) {
    console.error("[koi] structure had no content");
    return NextResponse.json({ error: "いま整理できませんでした。" }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("[koi] structure was not json");
    return NextResponse.json({ error: "いま整理できませんでした。" }, { status: 502 });
  }

  /* 受け取る側で捨てる。
     引用の無い事実、確からしさの足りない推測、
     相手の気持ちを当てる書き方は、ここで落ちる。 */
  const read = readTalkUpdate(parsed);
  if (!read.ok) {
    return NextResponse.json({ error: "今回は、残せるものがありませんでした" }, { status: 200 });
  }

  const personId = typeof body.personId === "string" ? body.personId : "";
  const who = typeof body.who === "string" && body.who.trim() ? body.who.trim().slice(0, 20) : "この人";

  // 相手が分かっているなら、いまの段階も見てカードに出す
  let stage: string | null = null;
  if (personId && dbAdminEnabled) {
    const c = await ownedBy(talker as string, personId);
    stage = c?.current_stage ?? null;
  }

  const card = cardOf(read.value, { who, stage });

  /* 記録に残す。
     相手が分かっていて、保存先があるときだけ。
     分からないまま書くと、他人の記録に混ざる。 */
  let saved: number | null = null;
  if (personId && dbAdminEnabled) {
    const r = await addEpisode(talker as string, personId, {
      title: card.line || who,
      summary: read.value.summary || null,
      nextAction: read.value.nextAction || null,
    });
    saved = r?.number ?? null;
  }

  return NextResponse.json({
    card,
    // 捨てたものは黙って消さない。数だけ返す
    dropped: read.dropped.length,
    // 伏せ字をかけたものがあれば、本人に伝える
    masked: safe.found,
    episodeNumber: saved,
  });
}
