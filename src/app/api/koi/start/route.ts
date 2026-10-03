import { NextResponse } from "next/server";
import { makeTalkerToken } from "@/lib/ask/token";
import { koiEnabled } from "@/lib/koi/gate";

// 話す人の鍵を発行する。
//
// ══════════════════════════════════════════════════
// 鍵を作るだけ。行は作らない
// ══════════════════════════════════════════════════
// 会員登録が無いので、鍵を知っていることが本人の証拠。
// 鍵そのものには、まだ何も結びついていない。
//
// 相手の話が始まって初めて relationship_cases に行ができ、
// そこへこの鍵が pass_token として入る。
//
// 先に空の行を作ると、開いただけで帰った人のぶんが積もる。
//
// ══════════════════════════════════════════════════
// こちらで作る
// ══════════════════════════════════════════════════
// ブラウザでも作れるが、短い鍵や使い回しを選べてしまう。
// 乱数の質をこちらで持つ。

export const runtime = "edge";

export async function POST() {
  if (!koiEnabled) {
    return NextResponse.json({ error: "いま恋亀と話せません。" }, { status: 503 });
  }
  return NextResponse.json({ talker: makeTalkerToken() });
}
