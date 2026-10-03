/* ══════════════════════════════════════════════════
   月額で、今月なにをどれだけ使ったか
   ══════════════════════════════════════════════════

   ── 「残り」を列で持たない ──────────────────────
   ask_passes / pass_uses と同じ作り。使った記録を数えて残りを出す。
   残りを列で持つと、二重に引いたり引き忘れたりが起きて、
   どちらが正しいか分からなくなる。

   ── 期間は subscriptions が持つ ────────────────
   「今月」を暦で数えない。15日に入った人は、15日が月初。
   暦で数えると、入った月だけ2か月ぶん使える。
   current_period_start / end を見る。

   ── 足りなくなっても止めない ────────────────────
   上限に当たった人を途中で切らない。「今月はここまで」と伝えて、
   来月から戻る（entitle.ts の VOICE_OVER / HUMAN_OVER）。 */

import { dbSelect, dbInsert, dbAdminEnabled } from "../db";
import { allowance, type Used, type Allowance } from "./entitle";

/** 月額として生きている状態 */
const LIVE = ["trialing", "active", "past_due"];

export type Period = {
  start: string | null;
  end: string | null;
  status: string;
};

export type Standing = {
  /** いま月額に入っているか */
  active: boolean;
  period: Period | null;
  used: Used;
  left: Allowance;
};

type SubRow = {
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
};

type UseRow = { kind: string; amount: number };

/**
 * いまの状態を、1回のまとめで返す。
 *
 * 画面（残り回数）と、使う直前の判定（使ってよいか）の両方がここを見る。
 * 別々に数えると、画面に出ている残りと、実際に使えるかがずれる。
 */
export async function standing(userToken: string): Promise<Standing> {
  const empty: Used = { voiceMinutes: 0, humanRequests: 0 };
  if (!dbAdminEnabled || !userToken) {
    return { active: false, period: null, used: empty, left: allowance(empty) };
  }

  const subs = await dbSelect<SubRow>(
    `subscriptions?user_token=eq.${encodeURIComponent(userToken)}` +
      `&select=status,current_period_start,current_period_end` +
      `&order=updated_at.desc&limit=1`,
  );
  const sub = subs[0];
  if (!sub || !LIVE.includes(sub.status)) {
    return { active: false, period: null, used: empty, left: allowance(empty) };
  }

  const period: Period = {
    start: sub.current_period_start,
    end: sub.current_period_end,
    status: sub.status,
  };

  // 期間が未設定のあいだ（Webhook が届く前）は、使っていない扱いにする。
  // ここで「全部使った」にすると、入った直後の人が使えない。
  if (!sub.current_period_start) {
    return { active: true, period, used: empty, left: allowance(empty) };
  }

  const rows = await dbSelect<UseRow>(
    `subscription_uses?user_token=eq.${encodeURIComponent(userToken)}` +
      `&used_at=gte.${encodeURIComponent(sub.current_period_start)}` +
      `&select=kind,amount`,
  );

  const used: Used = {
    voiceMinutes: rows.filter((r) => r.kind === "voice").reduce((a, r) => a + (r.amount || 0), 0),
    humanRequests: rows.filter((r) => r.kind === "human").reduce((a, r) => a + (r.amount || 0), 0),
  };
  return { active: true, period, used, left: allowance(used) };
}

/**
 * 1回ぶん使ったことを残す。
 *
 * consultation_id / call_session_id に一意制約があるので、
 * 同じものを二度押しても2行にならない（DB が弾く）。
 * 画面側の二度押し対策をここに書かないのは、画面が増えるたびに
 * 書き忘れるため。止めるのは DB の仕事にしてある。
 */
export async function recordUse(opts: {
  userToken: string;
  kind: "human" | "voice";
  amount?: number;
  consultationId?: string | null;
  callSessionId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!dbAdminEnabled) return { ok: false, error: "not configured" };
  const { ok, error } = await dbInsert("subscription_uses", {
    user_token: opts.userToken,
    kind: opts.kind,
    amount: opts.amount ?? 1,
    consultation_id: opts.consultationId ?? null,
    call_session_id: opts.callSessionId ?? null,
  });
  // 一意制約でぶつかったのは「すでに引いてある」なので、成功として扱う。
  if (!ok && /duplicate|unique|23505/i.test(String(error))) {
    return { ok: true };
  }
  return { ok, error };
}

/** 月額の回数で、この相談を出せるか */
export function canUseHuman(s: Standing): boolean {
  return s.active && !s.left.humanOver;
}
