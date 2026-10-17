import { NextRequest, NextResponse } from "next/server";
import { answer, resultOf } from "@/lib/scene/store";

export const runtime = "edge";

/* 答えを受け取って、そのまま分布を返す。
 *
 * ── 選んでから見せる ────────────────────────────
 * 分布だけを取る口（GET）は置かない。
 * 置くと、選ぶ前に見られる。見てから選ばれると、
 * 集まった答えが「前の人の答え」になる。
 *
 * ── 画面から来るものを、信じない ────────────────
 * 場面・選択肢・性別・印の形は、全部 store.ts が確かめる。
 * ここは受け渡しだけ。 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const r = await answer({
    sceneId: body.sceneId,
    choiceId: body.choiceId,
    gender: body.gender,
    voter: body.voter,
  });
  if (!r.ok) {
    return NextResponse.json({ error: r.why ?? "受け取れませんでした" }, { status: 400 });
  }

  /* 見る人から見た異性・同性に分ける。
     男性が男性の答えを「異性の反応」として読まないように。 */
  const viewer = body.gender === "female" ? "female" : "male";
  const result = await resultOf(String(body.sceneId), viewer);
  return NextResponse.json({ result, note: r.why ?? null });
}
