import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, dbSelect, dbAdminEnabled, parseAttribution } from "@/lib/db";
import { makeResponderToken, makeReferralCode, isReferralCode } from "@/lib/ask/token";
import {
  RESPONDER_AGES, isResponderAge, cleanResponderAttrs, isArea, isCategoryId,
  isJobBand, isTone,
} from "@/lib/ask/model";

// 回答者の登録。
//
// ── 登録した時点では配らない ──────────────────────
// active を false で入れる。
// 誰が答えているか分からないまま相談を配ると、
// 相談者が受け取るのは「誰の意見か分からない何か」になる。
// 運営が1件ずつ見てから有効にする。
//
// ── 連絡先は依頼を送るためだけ ────────────────────
// 相談者には渡らない。渡す経路も作っていない。
// responders の email は、こちらから依頼を送るためだけにある。
//
// ── 相談者の情報は一切受け取らない ────────────────
// ここは回答する側の入口。相談の内容とは別の口にする。

export const runtime = "edge";

const NOTE_MAX = 300;

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

// 形だけ見る。存在するかどうかは確かめない（確かめる手段が無い）。
// 通らなかったものを黙って捨てると、本人は登録できたと思ったまま待つ。
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json(
      { error: "確認いただいた内容にチェックを入れてください" },
      { status: 400 },
    );
  }

  const age = body.age;
  if (!isResponderAge(age)) {
    return NextResponse.json(
      { error: `年代を選んでください（${RESPONDER_AGES[0].label}〜）` },
      { status: 400 },
    );
  }

  const email = str(body.email, 200);
  if (!email || !EMAIL.test(email)) {
    return NextResponse.json(
      { error: "依頼をお送りするメールアドレスを入れてください" },
      { status: 400 },
    );
  }

  if (!dbAdminEnabled) {
    // 保存できないのに「登録しました」とは言わない。
    console.log("[db:noop] insert into responders", { age, email: "(伏せた)" });
    return NextResponse.json(
      { error: "いまこの環境はデータベースに接続されていません。保存できませんでした。" },
      { status: 503 },
    );
  }

  const attribution = parseAttribution(req);

  // 誰から来たか。コードが合わなければ、ただ無視する
  // （間違ったコードで登録そのものを止めない）。
  let referredBy: string | null = null;
  if (isReferralCode(body.ref)) {
    const inviter = await dbSelect<{ id: string; active: boolean }>(
      `responders?referral_code=eq.${encodeURIComponent(body.ref)}&select=id,active&limit=1`,
    );
    // 呼べるのは、実際に答えている人だけ。
    if (inviter[0]?.active) referredBy = inviter[0].id;
  }

  const ins = await dbInsertReturning("responders", {
    display_age_band: age,
    attrs: cleanResponderAttrs(body.attrs),
    area: isArea(body.area) ? body.area : null,
    // 職業カテゴリと回答の書き方。どちらも任意。合わないものは null で落とす。
    job_band: isJobBand(body.job) ? body.job : null,
    tone: isTone(body.tone) ? body.tone : null,
    // 言いにくい相談を受けるか。
    // true と書いてあるときだけ true。曖昧な値は受けないほうに倒す。
    takes_sensitive: body.sensitive === true,
    // 得意な話題。画面に無いカテゴリは通さない。
    specialties: Array.isArray(body.specialties)
      ? [...new Set(body.specialties.filter(isCategoryId))]
      : [],
    email,
    note: str(body.note, NOTE_MAX),
    // 運営が確かめるまで配らない。
    active: false,
    // 自分の画面を開く鍵と、友達を呼ぶコード。
    // 登録した時点で作る（あとから配るより、経路が1つで済む）。
    token: makeResponderToken(),
    referral_code: makeReferralCode(),
    referred_by: referredBy,
    utm_source: attribution.utm_source ?? null,
  });

  if (!ins.ok) return NextResponse.json({ error: ins.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
