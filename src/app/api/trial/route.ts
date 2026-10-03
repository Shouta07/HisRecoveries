import { NextRequest, NextResponse } from "next/server";
import { dbInsertReturning, dbSelect, dbAdminEnabled, parseAttribution } from "@/lib/db";
import { redact } from "@/lib/ask/redact";
import {
  trialOpen, intakeFor, waitlistLine, TOPIC_MAX, TRIAL_PER_DAY, TRIAL_DONE,
} from "@/lib/trial";
import type { Gender } from "@/lib/who";

// 体験の予約を受ける口。
//
// ── お金を受け取らない ────────────────────────────
// ここは決済を作らない。作る経路も持たない。
// 決済が開くまでのあいだ、文章の相談を手で届けるための入口。
//
// ── 保存できないなら、できたと言わない ────────────
// 保存先が無いときに ok を返すと、本人は申し込めたと思って待つ。
// そのまま誰も来ない。これがいちばん悪い。
//
// 503 を返して、画面側が別の送り方（メール）を出す。
// 書いたものが消えないようにするのは画面の仕事。
//
// ── 連絡先以外は、伏せ字をかけてから入れる ────────
// 確かめたいことの中に、相手の連絡先や名前が入ることがある。
// 本人の連絡先とは別の話で、これは相手の情報。
// 入る前に落とす（lib/ask/redact.ts）。
//
// ── 回答者が揃っていない向きは、断らずに受ける ────
// 断ると、その向きの人が何人来たのかが分からない。
// 分からないままだと、回答者を集める理由が作れない。

export const runtime = "edge";

const EMAIL_MAX = 200;
const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

function looksLikeEmail(x: unknown): x is string {
  return typeof x === "string" && x.length <= EMAIL_MAX && EMAIL.test(x.trim());
}

function isGender(x: unknown): x is Gender {
  return x === "male" || x === "female";
}

/** 今日もう何件受けたか。手で回せる数を超えたら順番待ちにする */
async function todayCount(): Promise<number> {
  // 日の区切りは日本時間。受けている人が日本にいるので
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const midnightJst = Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate())
    - 9 * 60 * 60 * 1000;
  const since = new Date(midnightJst).toISOString();
  const rows = await dbSelect<{ id: string }>(
    `trial_bookings?created_at=gte.${encodeURIComponent(since)}&status=eq.new&select=id`,
  );
  return rows.length;
}

export async function POST(req: NextRequest) {
  if (!trialOpen) {
    return NextResponse.json(
      { error: "いま体験のお申し込みを受け付けていません。" },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!looksLikeEmail(body.email)) {
    return NextResponse.json(
      { error: "メールアドレスを確認してください" },
      { status: 400 },
    );
  }
  if (!isGender(body.gender)) {
    return NextResponse.json(
      { error: "どちらかを選んでください" },
      { status: 400 },
    );
  }

  // 保存先が無いのに「受け付けました」と返さない。
  // 画面側はこの 503 を見て、メールで送る道を出す。
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "いまこの画面からお預かりできません。", fallback: true },
      { status: 503 },
    );
  }

  const gender = body.gender;

  // 確かめたいことは任意。書かれていたら伏せ字をかける
  let topic: string | null = null;
  let masked: string[] = [];
  if (typeof body.topic === "string" && body.topic.trim()) {
    const r = redact(body.topic.trim().slice(0, TOPIC_MAX));
    topic = r.text;
    masked = r.findings.map((f) => f.label);
  }

  /* 体験として受けるか、順番待ちにするか。
       回答者が揃っていない向き       → 順番待ち
       今日の受け入れ数を超えている   → 順番待ち
     どちらも、断るのではなく受ける。 */
  let intake = intakeFor(gender);
  let overflow = false;
  if (intake === "trial" && (await todayCount()) >= TRIAL_PER_DAY) {
    intake = "waitlist";
    overflow = true;
  }

  const a = parseAttribution(req);
  const ins = await dbInsertReturning("trial_bookings", {
    email: body.email.trim().toLowerCase(),
    asker_gender: gender,
    status: intake === "trial" ? "new" : "waitlist",
    topic,
    redacted: masked.length ? masked : null,
    utm_source: a.utm_source ?? null,
    referrer_host: a.referrer_host ?? null,
  });

  /* 同じ人が二度押しても、申し込み済みとして扱う（一意制約に当たるだけ）。

     ── 入らなかったときも、取りこぼさない ────────────
     ここは前、500 を返していた。画面はただのエラーになり、
     書いたものはそこで消えていた。

     いちばん起きやすいのは、schema.sql をまだ本番に当てていない場合。
     trial_bookings が無いので、鍵は入っているのに毎回落ちる。
     広告を回し始めた日に、全員ぶんが消える形になっていた。

     理由が何であれ、保存できなかったことは同じ。
     保存先が無いときと同じ 503 を返して、メールの道に移す。
     何が起きたかは、こちら側のログに残す。 */
  if (!ins.ok && !/duplicate|unique/i.test(ins.error ?? "")) {
    console.error("[trial] insert failed", ins.error);
    return NextResponse.json(
      { error: "いまこの画面からお預かりできません。", fallback: true },
      { status: 503 },
    );
  }

  /* 返す言葉。何が起きたかをそのまま書く。
     順番待ちになったなら、そう書く。「受け付けました」で一緒にしない。 */
  const message =
    intake === "trial"
      ? TRIAL_DONE
      : overflow
        ? "本日の受け入れ数に達したため、順番待ちでお預かりしました。順番にこちらからご連絡します。"
        : `順番待ちでお預かりしました。${waitlistLine(gender)}`;

  return NextResponse.json({
    ok: true,
    intake,
    message,
    // 何を伏せたかは本人に伝える（黙って消すと文の意味が変わる）
    redacted: masked,
  });
}
