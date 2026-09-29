import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, parseAttribution } from "@/lib/db";
import {
  isCategoryId, isOpenCategory, isAgeBand, isRelationId, isPanelAge,
  COMMENT_MAX, screen, initialStatus, needsReview, cleanAttrs,
} from "@/lib/ask/model";
import {
  isSellable, plan, clampTargeting, cleanOptions, priceOf, answersFor, DEFAULT_PLAN,
} from "@/lib/ask/plans";
import { isStepId } from "@/lib/ask/journey";
import { redact } from "@/lib/ask/redact";
import { makeConsultToken } from "@/lib/ask/token";

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
//
// ── ここでは回答依頼を作らない ────────────────────
// 有料にした。人数と金額はプランが決め、配るのは支払いが
// 確認できてから（api/stripe/webhook）。
// ここで依頼を作ると、払っていない相談が回答者に届く。
//
// ── 人数も条件も、画面の言い値で保存しない ────────
// 人数はプランの answers。条件はプランで許されている範囲に丸める。
// 丸めないと、安いプランを選んで高いプランの機能が使える。

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
  // 受付を止めたカテゴリは、画面に出ていなくてもここで止める。
  // 止めないと、古いリンクや手で叩いた POST から、
  // 画像が無いと答えようのない相談が有料で入ってくる。
  if (!isOpenCategory(body.category)) {
    return NextResponse.json(
      { error: "いまこの種類の相談は受け付けていません", blocked: true },
      { status: 422 },
    );
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

  // 人数と金額はプランが決める。画面から金額は受け取らない。
  const planId = isSellable(body.plan) ? body.plan : DEFAULT_PLAN;
  const p = plan(planId);
  // オプションもここで絞る。受け付けていないものは落とす。
  // 金額と人数は、プランとオプションから server 側で引き直す。
  const options = cleanOptions(body.options);
  const panelSize = answersFor(planId, options);

  // そのプランで指定してよい範囲に丸める。
  const want = clampTargeting(
    planId,
    isPanelAge(body.panelAge) ? body.panelAge : "any",
    cleanAttrs(body.panelAttrs),
  );

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
    panel_age: want.panelAge,
    // 画面に出していない属性が送られてきても通さない。
    // 選べないものが保存されると、条件に合う回答者がいないまま止まる。
    panel_attrs: want.attrs,
    panel_size: panelSize,
    product_type: planId,
    options,
    price: priceOf(planId, options),
    status: initialStatus(),
    needs_review: needsReview(hasImage),
    // 任意の1問。答えなかったら null のまま。
    // 「ChatGPTが無料で使えるのに、それでも払うか」を見るのに要る。
    asked_ai: typeof body.askedAi === "boolean" ? body.askedAi : null,
    // 恋愛のどの段階の相談か。
    // 相手の情報ではないので保存してよい。どの段階で人に聞かれるのかが分かる。
    journey_step: isStepId(body.step) ? body.step : null,
    redacted_kinds: kinds,
    utm_source: attribution.utm_source ?? null,
    referrer_host: attribution.referrer_host ?? null,
    landing_path: attribution.landing_path ?? null,
  };

  const ins = await dbInsertReturning<Row>("consultations", row);
  if (!ins.ok) return NextResponse.json({ error: ins.error }, { status: 500 });

  // 回答依頼はここでは作らない。
  // 作るのは Webhook が支払いを確認したあと（api/stripe/webhook の onPaid）。

  return NextResponse.json({
    ok: true,
    token,
    plan: planId,
    options,
    yen: priceOf(planId, options),
    redacted: [...new Set([...(rBody?.findings ?? []), ...(rA?.findings ?? []), ...(rB?.findings ?? [])].map((f) => f.label))],
  });
}
