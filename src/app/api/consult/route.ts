import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, dbUpdate, parseAttribution } from "@/lib/db";
import {
  isCategoryId, isOpenCategory, isAgeBand, isRelationId, isPanelAge,
  COMMENT_MAX, screen, initialStatus, needsReview, cleanAttrs,
} from "@/lib/ask/model";
import { isSellable, plan, clampTargeting, priceOf, DEFAULT_PLAN } from "@/lib/ask/plans";
import { isStepId } from "@/lib/ask/journey";
import { redact } from "@/lib/ask/redact";
import { makeConsultToken, isConsultToken } from "@/lib/ask/token";
import { spend } from "@/lib/ask/pass";
import { passCost } from "@/lib/ask/sensitive";
import { findCase, createCase, advance } from "@/lib/ask/cases-store";
import { readyToSell, whyNotReady, NOT_READY_USER } from "@/lib/ready";

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
  // ══════════════════════════════════════════════
  // 保存できない状態で、受け取らない
  // ══════════════════════════════════════════════
  // ここにデータベースの確認が無かった。
  // 設定が無いと dbInsertReturning は「成功した」と返すので、
  // 行が返ってこないまま先へ進み、どこかで落ちていた。
  // 画面には upstream の文字がそのまま出る（「internal error」）。
  //
  // 書いた人から見ると、300字書いたあとに意味の分からない
  // 1行が出て終わる。書いた時間が丸ごと無駄になる。
  //
  // 受け取れないなら、受け取る前に言う。
  if (!readyToSell()) {
    console.error("[consult] not ready", whyNotReady());
    return NextResponse.json(
      { error: NOT_READY_USER, blocked: true },
      { status: 503 },
    );
  }

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
  // 人数も金額も、プランから server 側で引き直す。画面の言い値は使わない。
  const panelSize = p.answers;

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
    price: priceOf(planId),
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
  // 保存の失敗を、そのまま画面に出さない。
  // upstream の文字（「internal error」など）は、読む人に何も伝えない。
  // 中身はログへ、画面には何が起きたかを書く。
  if (!ins.ok) {
    console.error("[consult] insert failed", ins.error);
    return NextResponse.json(
      { error: "相談を保存できませんでした。もう一度お試しください。" },
      { status: 500 },
    );
  }
  // 設定が揃っていても、行が返ってこないことはある。
  // その場合も、保存できたことにしない
  const saved = ins.rows[0];
  if (!saved?.id) {
    console.error("[consult] insert returned no row");
    return NextResponse.json(
      { error: "相談を保存できませんでした。もう一度お試しください。" },
      { status: 500 },
    );
  }

  // ── 5回パスを持っているなら、その場で1回使う ──
  //
  // 迷うたびに決済の画面を出さない。迷いは小さいので、そこで止まる。
  // 残りが無ければ使わない（使えたことにしない）。
  // 先に記録してあとで残りを見る、にはしない。0回なのに使える瞬間ができる。
  let caseTokenOut: string | null = null;
  let spent: { ok: boolean; remaining: number } | null = null;
  const passToken = typeof body.pass === "string" && isConsultToken(body.pass) ? body.pass : null;
  const newId = ins.rows[0]?.id ?? null;

  // ── 相手ごとのケースにぶら下げる ──
  //
  // 画面では前から「前回の続きから相談できます」と言っていた。
  // 言っているのに、相談は1件ずつ独立していた。ここでつなぐ。
  //
  // 鍵が来ていればそのケースへ。来ていなければ1つ作る。
  // 失敗しても相談そのものは止めない（つながらないだけで、相談は成立する）。
  if (newId) {
    try {
      const caseToken =
        typeof body.case === "string" && isConsultToken(body.case) ? body.case : null;
      let c = caseToken ? await findCase(caseToken) : null;
      if (!c) {
        c = await createCase({
          passToken,
          partnerLabel: typeof body.partner === "string" ? body.partner : null,
          userAgeBand: isAgeBand(body.askerAge) ? body.askerAge : null,
          partnerAgeBand: isAgeBand(body.otherAge) ? body.otherAge : null,
          datingApp: typeof body.app === "string" ? body.app.slice(0, 20) : null,
          stage: isStepId(body.step) ? body.step : null,
        });
      } else if (isStepId(body.step)) {
        await advance(c, { stage: body.step });
      }
      if (c) await dbUpdate("consultations", `id=eq.${newId}`, { case_id: c.id });
      caseTokenOut = c?.token ?? null;
    } catch {
      // つながらなかっただけ。相談は成立させる
    }
  }
  if (passToken) {
    // 言いにくい相談は2回分。カテゴリから決める（画面から回数を送らせない）。
    const r = await spend(passToken, newId, passCost(typeof body.category === "string" ? body.category : null));
    if (r.ok) {
      spent = { ok: true, remaining: r.remaining };
      // 1回ぶんを使ったので、支払い済みとして配りはじめる。
      await dbUpdate("consultations", `id=eq.${newId ?? ""}`, {
        status: needsReview(hasImage) ? "review" : "recruiting",
        paid_at: new Date().toISOString(),
      });
    }
  }

  // 回答依頼はここでは作らない。
  // 作るのは Webhook が支払いを確認したあと（api/stripe/webhook の onPaid）。

  return NextResponse.json({
    ok: true,
    token,
    plan: planId,
    yen: priceOf(planId),
    // パスを使えたか。使えていれば、決済の画面は出さない
    used: spent?.ok ?? false,
    remaining: spent?.remaining ?? null,
    // 相手ごとのケースの鍵。次の相談で渡すと、前回の続きになる
    case: caseTokenOut,
    redacted: [...new Set([...(rBody?.findings ?? []), ...(rA?.findings ?? []), ...(rB?.findings ?? [])].map((f) => f.label))],
  });
}
