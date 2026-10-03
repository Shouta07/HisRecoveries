import { NextRequest, NextResponse } from "next/server";
import { dbAdminEnabled } from "@/lib/db";
import { isTalkerToken } from "@/lib/ask/token";
import { koiEnabled } from "@/lib/koi/gate";
import { decide, type Used } from "@/lib/koi/dispatch";
import { TOOLS } from "@/lib/koi/tools";
import {
  peopleOf, usageOf, addPerson, setStage, setNextAction, addEpisode, recentEpisodes,
} from "@/lib/koi/store";
import { wallOf, upsellFor } from "@/lib/pass/free";
import { passEnabled } from "@/lib/stripe";

// 恋亀が呼んだ道具を、実際に動かす口。
//
// ══════════════════════════════════════════════════
// 判定は、こちら側でやる
// ══════════════════════════════════════════════════
// 画面側（VoiceRoom）でも decide() を通しているが、
// あれは「何が起きたか」を出すためのもの。
//
// ブラウザは書き換えられるので、通ったかどうかを
// 画面の言うとおりにしない。ここでもう一度 decide() を通す。
//
// 通っていないものは、ここで止まる。
//
// ══════════════════════════════════════════════════
// 誰のものかは、鍵で決める
// ══════════════════════════════════════════════════
// 本人の証拠は、話す人の鍵（t...）を知っていることだけ。
// 鍵はここで受け取り、store.ts の全部の関数へ渡す。
//
// person_id をそのまま信じない。
// store.ts が「その鍵のものか」を確かめてから書く。
// 確かめないと、IDを1つ書き換えるだけで他人の記録に書ける。
//
// ══════════════════════════════════════════════════
// 人に聞くのは、ここでは進めない
// ══════════════════════════════════════════════════
// request_human_feedback は、人の時間とお金が動く。
// 本人が画面で確かめてから進める。ここは受け付けだけ。

export const runtime = "edge";

/* ══════════════════════════════════════════════
   道具と、動かす口を、揃えておく
   ══════════════════════════════════════════════
   道具（tools.ts）を1つ足して、ここの switch に足し忘れると、
   恋亀は呼べるのに何も起きない。しかも落ちない。
   default に落ちて「まだ使えない道具です」と返るだけなので、
   気づかないまま「話したのに残っていない」になる。

   ここに名前を並べ、tools.ts と突き合わせる。
   足し忘れたら、公開の前に止まる。 */
const HANDLED = new Set([
  "get_user_goal",
  "get_person_context",
  "get_recent_episodes",
  "create_person",
  "update_person_stage",
  "create_episode",
  "set_next_action",
  // 人に聞くのは、本人の確認を挟むので、ここでは進めない。
  // 口が無いのではなく「確認が要る」で返す（下の分岐）。
  "request_human_feedback",
]);

{
  for (const t of TOOLS) {
    if (!HANDLED.has(t.name)) {
      throw new Error(
        `道具「${t.name}」を動かす口がありません（恋亀が呼んでも何も起きません）`,
      );
    }
  }
  for (const n of HANDLED) {
    if (!TOOLS.some((t) => t.name === n)) {
      throw new Error(`道具の一覧に無い「${n}」の口があります`);
    }
  }
}

type Body = {
  talker?: unknown;
  name?: unknown;
  args?: unknown;
  /** その会話で、その道具を何回呼んだか。画面が持ち回る */
  used?: unknown;
};

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  if (!koiEnabled) {
    return NextResponse.json({ error: "いま恋亀と話せません。" }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const talker = body.talker;
  if (!isTalkerToken(talker)) {
    return NextResponse.json({ error: "この会話は見つかりません" }, { status: 400 });
  }

  const name = str(body.name, 60);
  const args = (body.args && typeof body.args === "object" ? body.args : {}) as Record<
    string,
    unknown
  >;
  const used = (body.used && typeof body.used === "object" ? body.used : {}) as Used;

  /* もう一度、判定を通す。
     画面が「通った」と言っても、ここで通らなければ動かさない。 */
  const d = decide({ name, args }, used);
  if (!d.ok) {
    return NextResponse.json({ ok: false, why: d.why });
  }

  // 保存先が無いなら、動いたことにしない。
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { ok: false, why: "いま記録を保存できません" },
      { status: 503 },
    );
  }

  /* 本人の確認が要るものは、ここでは進めない。
     画面が confirm を立てて、もう一度呼ぶ。 */
  if (d.confirm) {
    return NextResponse.json({ ok: false, needsConfirm: true, why: "本人の確認が要ります" });
  }

  /* ══════════════════════════════════════════════
     無料の上限は、サーバーで止める
     ══════════════════════════════════════════════
     画面でも出すが、あれは知らせるため。
     ブラウザは書き換えられるので、通ったかどうかを
     画面の言うとおりにしない。

     止めるのは「増やすこと」だけ。
     入れたものは消さないし、見られなくもしない。

     ［要確認］いまは passEnabled（Stripeの鍵が揃っているか）で
     有料かどうかを見ている。1人ずつの契約を見る仕組みが
     できたら、そちらに差し替えること。 */
  {
    const want =
      name === "create_person" ? "person"
      : name === "create_episode" ? "record"
      : name === "request_human_feedback" ? "human"
      : null;
    if (want) {
      const wall = wallOf(await usageOf(talker as string), passEnabled, want);
      if (wall) {
        const up = upsellFor(wall);
        return NextResponse.json({ ok: false, wall, why: up?.title ?? "", upsell: up });
      }
    }
  }

  const pid = str(args.person_id, 40);

  switch (name) {
    /* ── 読む ──────────────────────────────── */
    case "get_person_context": {
      const list = await peopleOf(talker as string);
      const nick = str(args.nickname, 40);
      const hit = list.find((c) => c.partner_label === nick) ?? null;
      return NextResponse.json({ ok: true, result: hit });
    }
    case "get_recent_episodes": {
      const n = typeof args.limit === "number" ? args.limit : 3;
      return NextResponse.json({
        ok: true,
        result: await recentEpisodes(talker as string, pid, n),
      });
    }
    case "get_user_goal": {
      // 目的はまだ受け取る画面が無い。無いものを作って返さない。
      return NextResponse.json({ ok: true, result: null });
    }

    /* ── 書く ──────────────────────────────── */
    case "create_person": {
      const row = await addPerson(
        talker as string,
        str(args.nickname, 40),
        str(args.source_app, 20) || null,
      );
      return row
        ? NextResponse.json({ ok: true, result: { person_id: row.id } })
        : NextResponse.json({ ok: false, why: "作れませんでした" });
    }
    case "update_person_stage": {
      const ok = await setStage(talker as string, pid, str(args.stage, 40));
      return NextResponse.json(ok ? { ok: true } : { ok: false, why: "変えられませんでした" });
    }
    case "set_next_action": {
      const ok = await setNextAction(talker as string, pid, str(args.action, 200));
      return NextResponse.json(ok ? { ok: true } : { ok: false, why: "残せませんでした" });
    }
    case "create_episode": {
      const r = await addEpisode(talker as string, pid, {
        title: str(args.title, 60),
        summary: str(args.summary, 600) || null,
        nextAction: str(args.next_action, 200) || null,
      });
      return r
        ? NextResponse.json({ ok: true, result: { episode_number: r.number } })
        : NextResponse.json({ ok: false, why: "残せませんでした" });
    }

    default:
      // dispatch.ts を通ったのに、ここに口が無い。
      // 道具を足して、こちらを足し忘れたときに来る。
      console.error("[koi] no handler for", name);
      return NextResponse.json({ ok: false, why: "まだ使えない道具です" });
  }
}
