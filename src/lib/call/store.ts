import { dbSelect, dbUpdate, dbAdminEnabled } from "../db";
import { plan, type PlanId } from "../ask/plans";
import {
  endsAt,
  isOver,
  isNoShow,
  minutesOf,
  remainingSeconds,
  type CallStatus,
} from "./session";
import { deleteRoom } from "./room";

// 通話の1件を読み書きする。
//
// ══════════════════════════════════════════════════
// 時間を決める場所を1つにする
// ══════════════════════════════════════════════════
// started_at と ends_at を書くのは、このファイルの join だけ。
// あちこちで書けるようにすると、どこかで「入り直したら延びる」
// 実装が混ざる。混ざってもテストでは気づけない
// （切れて戻る操作は、手では再現しにくい）。
//
// ══════════════════════════════════════════════════
// 読むたびに、時間切れを直す
// ══════════════════════════════════════════════════
// 「時間になったら切る」を、定期実行の仕組みに頼らない。
// 誰かが画面を開いたときと、入ろうとしたときに、その場で確かめる。
// 定期実行は後から足せるが、無い状態でも時間は必ず切れる。

export type CallRow = {
  id: string;
  token: string;
  consultation_id: string | null;
  responder_id: string | null;
  plan_id: string;
  duration_minutes: number;
  price: number | null;
  scheduled_at: string | null;
  started_at: string | null;
  ends_at: string | null;
  ended_at: string | null;
  asker_joined_at: string | null;
  responder_joined_at: string | null;
  status: CallStatus;
  room_name: string | null;
  room_url: string | null;
  extended_minutes: number;
};

/**
 * 鍵で1件引く。無ければ null。
 *
 * 列名は変数にせず、問い合わせの文に直接書く。
 * 変数にすると scripts/check-schema.mjs が読めず、
 * schema.sql と食い違ったまま本番に出せてしまう。
 */
export async function findByToken(token: string): Promise<CallRow | null> {
  if (!dbAdminEnabled) return null;
  const rows = await dbSelect<CallRow>(
    `call_sessions?token=eq.${encodeURIComponent(token)}&select=id,token,consultation_id,responder_id,plan_id,duration_minutes,price,scheduled_at,started_at,ends_at,ended_at,asker_joined_at,responder_joined_at,status,room_name,room_url,extended_minutes&limit=1`,
  );
  return rows[0] ?? null;
}

/**
 * 時間切れと、来なかった場合を片付ける。
 *
 * 読むたびに呼ぶ。定期実行に頼らずに、必ずどこかで切れるようにする。
 * 返すのは、片付けたあとの行。
 */
export async function settle(row: CallRow, now: Date = new Date()): Promise<CallRow> {
  // 終わる時刻を過ぎていたら、その場で終わらせる。
  if (row.status === "active" && isOver(row.ends_at, now)) {
    await dbUpdate("call_sessions", `token=eq.${encodeURIComponent(row.token)}`, {
      status: "completed",
      ended_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
    // 部屋も消す。券が残っていても入れなくする。
    if (row.room_name) await deleteRoom(row.room_name);
    return { ...row, status: "completed", ended_at: now.toISOString() };
  }

  // 始まらないまま、予約時刻を大きく過ぎた。
  if (
    (row.status === "scheduled" || row.status === "ready") &&
    !row.started_at &&
    isNoShow(row.scheduled_at, now)
  ) {
    await dbUpdate("call_sessions", `token=eq.${encodeURIComponent(row.token)}`, {
      status: "no_show",
      updated_at: now.toISOString(),
    });
    if (row.room_name) await deleteRoom(row.room_name);
    return { ...row, status: "no_show" };
  }

  return row;
}

/**
 * 入った、を記録する。
 *
 * ここが、この機能でいちばん間違えやすいところ。
 *   ・先に入った人からは数えない
 *   ・両方そろった瞬間に started_at と ends_at を決める
 *   ・2回目以降の入室では、決めた時刻を書き換えない
 *
 * 書き換えないことを、条件ではなく「既にあれば触らない」で守る。
 */
export async function markJoined(
  row: CallRow,
  side: "asker" | "responder",
  now: Date = new Date(),
): Promise<CallRow> {
  const patch: Record<string, unknown> = { updated_at: now.toISOString() };
  const next = { ...row };

  // 入った時刻は、最初の1回だけ書く。
  if (side === "asker" && !row.asker_joined_at) {
    patch.asker_joined_at = now.toISOString();
    next.asker_joined_at = now.toISOString();
  }
  if (side === "responder" && !row.responder_joined_at) {
    patch.responder_joined_at = now.toISOString();
    next.responder_joined_at = now.toISOString();
  }

  const both = Boolean(next.asker_joined_at && next.responder_joined_at);

  // 両方そろって、まだ始まっていなければ、ここで時間を決める。
  // 既に started_at があるときは触らない（入り直しで延びないため）。
  if (both && !row.started_at) {
    const minutes = row.duration_minutes + (row.extended_minutes ?? 0);
    const end = endsAt(now, minutes);
    patch.started_at = now.toISOString();
    patch.ends_at = end.toISOString();
    patch.status = "active";
    next.started_at = now.toISOString();
    next.ends_at = end.toISOString();
    next.status = "active";
  } else if (both && row.started_at && row.status !== "completed") {
    // 入り直し。時刻は触らない。状態だけ戻す。
    patch.status = "active";
    next.status = "active";
  }

  if (dbAdminEnabled) {
    await dbUpdate("call_sessions", `token=eq.${encodeURIComponent(row.token)}`, patch);
  }
  return next;
}

/** 終わらせる。押して終わったときと、時間で切れたときの両方 */
export async function finish(
  row: CallRow,
  now: Date = new Date(),
): Promise<CallRow> {
  if (dbAdminEnabled) {
    await dbUpdate("call_sessions", `token=eq.${encodeURIComponent(row.token)}`, {
      status: "completed",
      ended_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
  }
  if (row.room_name) await deleteRoom(row.room_name);
  return { ...row, status: "completed", ended_at: now.toISOString() };
}

/**
 * 画面に返す形。
 *
 * ここに出していいものだけを詰める。
 * 部屋のURLも入室券も、ここには入れない（join のときに1回だけ渡す）。
 */
export function publicView(row: CallRow, now: Date = new Date()) {
  const p = plan(row.plan_id as PlanId);
  return {
    token: row.token,
    plan: row.plan_id,
    planName: p.name,
    minutes: row.duration_minutes + (row.extended_minutes ?? 0),
    status: row.status,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    // 残りはサーバーの時計で出す。画面の時計は信じない。
    remaining: row.ends_at ? remainingSeconds(row.ends_at, now) : null,
    // 相手が入っているか。名前も年代も、ここでは出さない
    otherJoined: Boolean(row.responder_joined_at),
    // サーバーの「いま」。画面はこれとの差で数える
    now: now.toISOString(),
  };
}

/* ── 公開の前に止めること ─────────────────────────
   入り直しで時間が延びないことを、実際に動かして確かめる。
   ここは手で再現しにくいので、判定を置いておく。 */
{
  const t0 = new Date("2026-01-01T12:00:00.000Z");
  const base: CallRow = {
    id: "x",
    token: "c" + "a".repeat(32),
    consultation_id: null,
    responder_id: null,
    plan_id: "call15",
    duration_minutes: 15,
    price: 2980,
    scheduled_at: t0.toISOString(),
    started_at: null,
    ends_at: null,
    ended_at: null,
    asker_joined_at: null,
    responder_joined_at: null,
    status: "ready",
    room_name: null,
    room_url: null,
    extended_minutes: 0,
  };

  // 片方だけでは始まらない。
  void (async () => {
    const onlyResponder = await markJoined(base, "responder", t0);
    if (onlyResponder.started_at) {
      throw new Error("女性が入っただけで時間が始まっています");
    }
    // 5分後に男性が入って、そこから15分。
    const t5 = new Date(t0.getTime() + 5 * 60_000);
    const both = await markJoined(onlyResponder, "asker", t5);
    if (both.started_at !== t5.toISOString()) {
      throw new Error("両方そろった時刻から始まっていません");
    }
    if (both.ends_at !== new Date(t5.getTime() + 15 * 60_000).toISOString()) {
      throw new Error("終わる時刻が合いません");
    }
    // 途中で切れて入り直しても、終わる時刻は動かない。
    const t12 = new Date(t5.getTime() + 7 * 60_000);
    const again = await markJoined(both, "asker", t12);
    if (again.ends_at !== both.ends_at) {
      throw new Error("入り直しで終わる時刻が動いています");
    }
  })().catch((e) => {
    throw e;
  });

  // 分数が商品と食い違っていないこと。
  for (const id of ["call15", "call5"] as PlanId[]) {
    if (minutesOf(id) === null) throw new Error(`プラン「${id}」に分数がありません`);
  }
}
