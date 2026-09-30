import { dbSelect, dbRpc, dbAdminEnabled } from "../db";
import { plan, type PlanId } from "./plans";
import { passCost } from "./sensitive";

// 5回パスの残り。
//
// ══════════════════════════════════════════════════
// 残りは、数えて出す
// ══════════════════════════════════════════════════
// 「残り4回」という列を持って、使うたびに1つ減らす作りにしない。
// 減らし損ねたら気づけないし、増やすのも同じ列を書き換えるだけで済む。
//
// 使った記録（pass_uses）を1件ずつ残して、
//   残り = 買った回数 + 運営が足した回数 − 使った件数
// で出す。過去に何に使ったかが、必ず残る。
//
// ══════════════════════════════════════════════════
// 期限は作る。ただし黙って消さない
// ══════════════════════════════════════════════════
// ここは元々「期限を作らない」だった。
// 急がせる商売にしないため、という理由は、いまも正しい。
//
// 変えたのは、残高に期限の無い回数券が
// 資金決済法の「前払式支払手段（自家型）」そのものだから
// （なぜ180日かは plans.ts の PASS_VALID_DAYS）。
//
// 急かす道具にしないために、決めてあること。
//   ・期限は買うときに出す（決済の直前と、特商法の表記）
//   ・残りを出すところには、必ず期限も一緒に出す
//   ・「あと○日！」とは書かない。日付を書く
//   ・切れても残りの数は残す（何回ぶん切れたかが分かる）
//
// ══════════════════════════════════════════════════
// 減らすのは、数える側でやる
// ══════════════════════════════════════════════════
// 「残りを読む → 足りていれば使う」をアプリ側で2回に分けると、
// その間にもう1つ来たときに、両方が「足りている」と判断する。
// 5回パスで6回使える瞬間ができる。
//
// 減らすのは schema.sql の spend_pass（行を押さえたまま数えて書く）。
// このファイルは、読むのと見せ方だけを持つ。
//
// ══════════════════════════════════════════════════
// 自動更新しない
// ══════════════════════════════════════════════════
// 使い切っても、勝手に次を買わない。
// 次を買うかどうかは、そのとき本人が決める。

export type Balance = {
  token: string;
  plan: PlanId;
  total: number;
  used: number;
  remaining: number;
  /** 有効期限。この日を過ぎると使えない。古いパスは null（期限なし） */
  expiresAt: string | null;
  expired: boolean;
};

type BalanceRow = {
  token: string;
  plan_id: string;
  uses_total: number;
  granted_extra: number;
  used: number;
  remaining: number;
  expires_at: string | null;
  expired: boolean;
};

/** 鍵から残りを引く。無ければ null */
export async function balanceOf(token: string): Promise<Balance | null> {
  if (!dbAdminEnabled) return null;
  const rows = await dbSelect<BalanceRow>(
    `pass_balance?token=eq.${encodeURIComponent(token)}&select=token,plan_id,uses_total,granted_extra,used,remaining,expires_at,expired&limit=1`,
  );
  const r = rows[0];
  if (!r) return null;
  return {
    token: r.token,
    plan: r.plan_id as PlanId,
    total: Number(r.uses_total) + Number(r.granted_extra ?? 0),
    used: Number(r.used),
    // 念のため負にしない。減らし方を間違えても、画面に負の数を出さない
    remaining: Math.max(0, Number(r.remaining)),
    expiresAt: r.expires_at ?? null,
    expired: Boolean(r.expired),
  };
}

/**
 * 1回使う。
 *
 * 残りが無ければ、使わない。
 * 「先に記録して、あとで残りを確かめる」にはしない。
 * 先に書くと、0回なのに使えてしまう瞬間ができる。
 */
export async function spend(
  token: string,
  consultationId: string | null,
  /** 何回分使うか。言いにくい相談は2回分（sensitive.ts の passCost） */
  cost = 1,
): Promise<{ ok: boolean; remaining: number; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, remaining: 0, why: "no db" };
  if (cost < 1) return { ok: false, remaining: 0, why: "使う回数が不正です" };

  // 数える側でやる。
  //
  // 「残りを読む → 足りていれば使う」をここで2回に分けると、
  // その間にもう1つ来たときに、両方が「足りている」と判断する。
  // 5回パスで6回使える瞬間ができる。
  //
  // schema.sql の spend_pass が、行を押さえたまま数えて書く。
  // 同じ相談が既に使っていたら、使わずに「使用済み」として返す
  // （画面の二度押し・Webhookの再送・リロードは、どれでも来る）。
  const res = await dbRpc<{ ok: boolean; remaining: number; why: string | null }[]>(
    "spend_pass",
    { p_token: token, p_consultation: consultationId, p_cost: cost },
  );
  if (!res.ok) return { ok: false, remaining: 0, why: res.error };

  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, remaining: 0, why: "このパスは見つかりません" };

  return {
    ok: Boolean(row.ok),
    remaining: Math.max(0, Number(row.remaining) || 0),
    why: row.why ?? undefined,
  };
}

/**
 * 使った回数を返す。
 *
 * 人数が集まらなかったとき、こちらの都合で配れなかったとき。
 *
 * ── 消さずに、打ち消す ────────────────────────
 * pass_uses の行を消すと、「使った → 返した」という
 * 出来事そのものが消えて、あとから何が起きたか追えなくなる。
 * 打ち消す行（+1）を足す。
 *
 * ── 二度返さない ──────────────────────────────
 * 返金の処理は、通信が切れて押し直されることがある。
 * 既に返してあれば、何もせずに現在の残りを返す。
 */
export async function refundTicket(
  consultationId: string,
  reason: string,
): Promise<{ ok: boolean; refunded: number; remaining: number; why?: string }> {
  if (!dbAdminEnabled) return { ok: false, refunded: 0, remaining: 0, why: "no db" };

  const res = await dbRpc<
    { ok: boolean; refunded: number; remaining: number; why: string | null }[]
  >("refund_pass", { p_consultation: consultationId, p_reason: reason });
  if (!res.ok) return { ok: false, refunded: 0, remaining: 0, why: res.error };

  const row = Array.isArray(res.data) ? res.data[0] : undefined;
  if (!row) return { ok: false, refunded: 0, remaining: 0, why: "返せませんでした" };

  return {
    ok: Boolean(row.ok),
    refunded: Math.max(0, Number(row.refunded) || 0),
    remaining: Math.max(0, Number(row.remaining) || 0),
    why: row.why ?? undefined,
  };
}

/** 何回ぶんのパスか。パスでない商品なら null */
export function usesOf(id: PlanId): number | null {
  return plan(id).uses ?? null;
}

/** 残りの見せ方。0のときに「0回」と出さない */
export function remainingLabel(n: number): string {
  return n > 0 ? `あと${n}回` : "使い切りました";
}

/**
 * 期限の見せ方。
 *
 * 「あと12日」とは書かない。日付で書く。
 * 残り日数で書くと、数が小さくなるほど急かす表示になる。
 * 期限は急かすために置いたものではない。
 */
export function expiryLabel(b: Balance): string | null {
  if (!b.expiresAt) return null;
  const d = new Date(b.expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  const ymd = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return b.expired ? `${ymd}に期限が切れました` : `${ymd}まで`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // パスの商品が、1つはあること。無いと入口が1件売りに戻る。
  const packs = (["review"] as PlanId[]).filter((id) => usesOf(id));
  if (packs.length === 0) throw new Error("まとめて持っておける商品がありません");

  // 入口はパスであること。
  // 1件ずつ売ると、迷うたびに決済の画面が出て、そこで止まる。
  if (!usesOf("review")) {
    throw new Error("入口の商品が1件売りになっています（5回パスにしてください）");
  }

  // 残りの出し方。0のときに「あと0回」と書かない。
  if (remainingLabel(0).includes("0回")) {
    throw new Error("残り0回のときの言い方が、数字のままです");
  }
  if (remainingLabel(4) !== "あと4回") throw new Error("残りの言い方が変わっています");

  // 期限の書き方。残り日数で急かさない。
  {
    const b: Balance = {
      token: "c" + "a".repeat(32),
      plan: "review",
      total: 5,
      used: 1,
      remaining: 4,
      expiresAt: "2026-12-31T00:00:00.000Z",
      expired: false,
    };
    const label = expiryLabel(b);
    if (!label) throw new Error("期限があるのに、期限の表示が出ていません");
    if (/あと\s*\d+\s*日|残り\s*\d+\s*日|まもなく|お早め/.test(label)) {
      throw new Error(`期限の表示が急かす書き方になっています（${label}）`);
    }
    if (!/\d+年\d+月\d+日/.test(label)) {
      throw new Error(`期限が日付で書かれていません（${label}）`);
    }
    // 期限の無い古いパスを、期限切れに見せない。
    if (expiryLabel({ ...b, expiresAt: null }) !== null) {
      throw new Error("期限の無いパスに、期限の表示が出ています");
    }
    // 切れたことが分かること。
    if (!expiryLabel({ ...b, expired: true })?.includes("切れました")) {
      throw new Error("期限が切れたことが、表示から分かりません");
    }
  }

  // 言いにくい相談が、ふつうの相談より多く使うこと。
  // 同じなら、受けられる人を限る理由も、取り分を増やす原資も無い。
  if (passCost("distance") <= passCost("message")) {
    throw new Error("言いにくい相談の消費回数が、ふつうの相談と同じです");
  }
  // 5回パスで、言いにくい相談が1回は使えること。
  const pack = usesOf("review") ?? 0;
  if (pack < passCost("distance")) {
    throw new Error(`5回パス（${pack}回）では、言いにくい相談が1回も使えません`);
  }
}
