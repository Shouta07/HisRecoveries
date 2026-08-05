import { NextRequest, NextResponse } from "next/server";
import { dbInsert, parseAttribution } from "@/lib/db";
import { QUESTIONS, CONSENT_VERSION, isTicket } from "@/lib/interview";

export const runtime = "edge";

// 取材の受け口。
//
// ── 同意がなければ受け取らない ────────────────────
// 健康・身体のことを含むので、これは要配慮個人情報にあたる。
// 同意なしで届いたものは保存せず、400で返す。
// 「あとで同意を確認する」形にしない。保存した時点で取得になる。
//
// ── 何を保存しないか ────────────────────────────
// 名前も連絡先も受け取らない。IPも保存しない。
// 受付番号だけを鍵にして、本人が取り消せるようにする。
// 本人を特定せずに、本人の権利だけ残す。

/** 1つの回答の長さの上限。長文を切るためではなく、貼り付け事故を止めるため */
const MAX = 4000;

function pickString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // 同意がすべての前提。ここを通らないものは、1文字も保存しない。
  if (body.consent !== true) {
    return NextResponse.json({ error: "consent required" }, { status: 400 });
  }
  const version = pickString(body.consentVersion);
  if (version !== CONSENT_VERSION) {
    // 古い画面から送られてきたもの。いまの約束で同意したことにはできない。
    return NextResponse.json({ error: "consent version mismatch" }, { status: 409 });
  }

  const ticket = pickString(body.ticket);
  if (!ticket || !isTicket(ticket)) {
    return NextResponse.json({ error: "bad ticket" }, { status: 400 });
  }

  const answers: Record<string, string | null> = {};
  let filled = 0;
  for (const q of QUESTIONS) {
    const v = pickString(body[q.id]);
    answers[q.id] = v ? v.slice(0, MAX) : null;
    if (v) filled += 1;
  }
  if (filled === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const attribution = parseAttribution(req);

  const row = {
    ticket,
    consent_version: version,
    // 設問ごとに列を作らず、まとめて入れる。
    // 設問を足すたびにテーブルを変えることになるのを避ける。
    answers,
    answered_count: filled,
    utm_source: attribution.utm_source ?? null,
    utm_medium: attribution.utm_medium ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
    referrer_host: attribution.referrer_host ?? null,
    landing_path: attribution.landing_path ?? null,
  };

  const { ok, error } = await dbInsert("interviews", row);
  if (!ok) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true, ticket });
}
