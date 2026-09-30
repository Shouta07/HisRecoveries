import { dbSelect, dbRpc, dbAdminEnabled } from "../db";
import { isSensitive } from "../ask/sensitive";

// 答える人が、自分で案件を取る。
//
// ══════════════════════════════════════════════════
// なぜ要るか
// ══════════════════════════════════════════════════
// 依頼は作られるのに、誰に届けるかが決まっていなかった。
// 運営が1件ずつURLを送るしかなく、そこで詰まる。
// 人を増やさずに件数を増やすなら、ここを自動にするしかない。
//
// ══════════════════════════════════════════════════
// 選べること
// ══════════════════════════════════════════════════
// ノルマも指名もない、と約束している（responder/policy.ts）。
// だから「割り当てる」のではなく「取る」形にする。
// 答えたいものだけ取れば、それでよい。
//
// ══════════════════════════════════════════════════
// 同じ案件を2人が取らない
// ══════════════════════════════════════════════════
// 取る判断は Postgres 側（claim_invite）。行を押さえてから確かめる。
// ここで「空いているか読む → 取る」を2回に分けると、
// 同時に来たときに両方が取れてしまう。

export type OpenInvite = {
  id: string;
  consultation_id: string;
  created_at: string;
  category: string;
  journey_step: string | null;
  panel_age: string | null;
  asker_age_band: string | null;
  other_age_band: string | null;
  is_ab: boolean;
  product_type: string | null;
};

/**
 * いま取れる案件。
 *
 * 言いにくい相談は、受けると決めた人にしか出さない。
 * ただし、出さないだけでは足りない（URLは直に叩ける）。
 * 取るときにも関数の側で止めている。
 */
export async function openInvites(opts: {
  takesSensitive: boolean;
  limit?: number;
}): Promise<OpenInvite[]> {
  if (!dbAdminEnabled) return [];
  const rows = await dbSelect<OpenInvite>(
    `open_invites?select=id,consultation_id,created_at,category,journey_step,panel_age,asker_age_band,other_age_band,is_ab,product_type&limit=${opts.limit ?? 20}`,
  );
  return rows.filter((r) => (isSensitive(r.category) ? opts.takesSensitive : true));
}

/**
 * 案件を取る。
 *
 * 取れたら、その依頼の鍵（回答画面のURL）が返る。
 * 取れなかった理由は、そのまま画面に出す
 * （「エラーが発生しました」では、待てばよいのか諦めるのかが分からない）。
 */
export async function claim(
  responderToken: string,
  inviteId: string,
): Promise<{ ok: boolean; replyToken?: string; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, why: "no db" };

  const res = await dbRpc<{ ok: boolean; reply_token: string | null; why: string | null }[]>(
    "claim_invite",
    { p_responder_token: responderToken, p_invite: inviteId },
  );
  if (!res.ok) return { ok: false, why: res.error };

  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, why: "この依頼は見つかりません" };
  if (!row.ok) return { ok: false, why: row.why ?? "取れませんでした" };

  return { ok: true, replyToken: row.reply_token ?? undefined };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 言いにくい相談が、受けると決めていない人の一覧に混ざらないこと。
  const rows = [
    { category: "message" },
    { category: "distance" },
  ] as unknown as OpenInvite[];
  const forOff = rows.filter((r) => (isSensitive(r.category) ? false : true));
  if (forOff.length !== 1 || forOff[0].category !== "message") {
    throw new Error("受けると決めていない人の一覧に、言いにくい相談が混ざっています");
  }
}
