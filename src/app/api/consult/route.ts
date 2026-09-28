import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, dbAdminEnabled, parseAttribution } from "@/lib/db";
import {
  isCategoryId, isAgeBand, isRelationId, isPanelAge, isPanelSize,
  PANEL_SIZES_OPEN, COMMENT_MAX, screen, initialStatus, cleanAttrs,
} from "@/lib/ask/model";
import { redact } from "@/lib/ask/redact";
import { makeConsultToken, makeReplyToken } from "@/lib/ask/token";

// 相談を受け取る。
//
// ── 保存する前に伏せる ────────────────────────────
// 伏せ字は保存の後ではなく前にかける。後だと、原文がいったん
// こちらのデータベースに入ることになる。入れたものは漏れる。
//
// ── 原文を残さない ────────────────────────────────
// 「原文も確認できるように」は、伏せた意味を消す。
// 残すのは伏せた後の文だけ。何を伏せたかは種類だけ記録する。
//
// ── 扱わない相談は、ここで止める ──────────────────
// 止めたら理由を返す。黙って捨てると、本人は送れたと思ったまま待つ。

export const runtime = "edge";

const BODY_MIN = 10;
const BODY_MAX = 2000;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

type Row = { id: string; token: string };

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!isCategoryId(body.category)) {
    return NextResponse.json({ error: "カテゴリを選んでください" }, { status: 400 });
  }

  const isAb = body.isAb === true;
  const text = str(body.body, BODY_MAX);
  const a = str(body.optionA, COMMENT_MAX);
  const b = str(body.optionB, COMMENT_MAX);

  if (isAb) {
    if (!a || !b) {
      return NextResponse.json({ error: "A と B の両方を書いてください" }, { status: 400 });
    }
  } else if (!text || text.length < BODY_MIN) {
    return NextResponse.json(
      { error: `聞きたいことを ${BODY_MIN} 文字以上で書いてください` },
      { status: 400 },
    );
  }

  // 扱わない内容。伏せ字より先に見る。
  const whole = [text, a, b].filter(Boolean).join("\n");
  const s = screen(whole);
  if (!s.ok) {
    return NextResponse.json({ error: s.why, blocked: true }, { status: 422 });
  }

  // 伏せる。ここから先、原文は使わない。
  const rBody = text ? redact(text) : null;
  const rA = a ? redact(a) : null;
  const rB = b ? redact(b) : null;
  const kinds = [
    ...new Set([...(rBody?.findings ?? []), ...(rA?.findings ?? []), ...(rB?.findings ?? [])].map((f) => f.kind)),
  ];

  const panelSize = isPanelSize(body.panelSize) ? body.panelSize : 3;
  if (!PANEL_SIZES_OPEN.includes(panelSize)) {
    return NextResponse.json(
      { error: "いまはその人数を募集していません" },
      { status: 400 },
    );
  }

  const token = makeConsultToken();
  const attribution = parseAttribution(req);
  const hasImage = false; // 画像は次の段階。いまは文字だけ受ける

  const row = {
    token,
    category: body.category,
    body: rBody?.text ?? "",
    option_a: rA?.text ?? null,
    option_b: rB?.text ?? null,
    is_ab: isAb,
    asker_age_band: isAgeBand(body.askerAge) ? body.askerAge : null,
    other_age_band: isAgeBand(body.otherAge) ? body.otherAge : null,
    relation: isRelationId(body.relation) ? body.relation : null,
    panel_age: isPanelAge(body.panelAge) ? body.panelAge : "any",
    // 画面に出していない属性が送られてきても通さない。
    // 選べないものが保存されると、条件に合う回答者がいないまま止まる。
    panel_attrs: cleanAttrs(body.panelAttrs),
    panel_size: panelSize,
    status: initialStatus(hasImage),
    redacted_kinds: kinds,
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
    landing_path: attribution.landing_path ?? null,
  };

  const ins = await dbInsertReturning<Row>("consultations", row);
  if (!ins.ok) return NextResponse.json({ error: ins.error }, { status: 500 });

  // 回答依頼を先に作っておく。
  // 誰に割り当てるか（responder_id）は運営が決めるので、ここでは鍵だけ用意する。
  // 相談だけ入って依頼が0件、という状態を作らないために同じ処理の中でやる。
  const id = ins.rows[0]?.id;
  if (id && dbAdminEnabled) {
    const invites = Array.from({ length: panelSize }, () => ({
      consultation_id: id,
      token: makeReplyToken(),
    }));
    await dbInsertReturning("response_invites", invites as unknown as Record<string, unknown>);
  }

  return NextResponse.json({
    ok: true,
    token,
    redacted: [...new Set([...(rBody?.findings ?? []), ...(rA?.findings ?? []), ...(rB?.findings ?? [])].map((f) => f.label))],
  });
}
