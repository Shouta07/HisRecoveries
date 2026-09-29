import { dbSelect, dbInsert, dbAdminEnabled } from "../db";
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
// 期限を作らない
// ══════════════════════════════════════════════════
// 買った回数は、使うまで残る。
// 期限で消す仕組みを入れると、急がせる商売になる。
// 「残りわずか」を作らないのと同じ理由（voice.ts の CHEAP）。
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
};

type BalanceRow = {
  token: string;
  plan_id: string;
  uses_total: number;
  granted_extra: number;
  used: number;
  remaining: number;
};

/** 鍵から残りを引く。無ければ null */
export async function balanceOf(token: string): Promise<Balance | null> {
  if (!dbAdminEnabled) return null;
  const rows = await dbSelect<BalanceRow>(
    `pass_balance?token=eq.${encodeURIComponent(token)}&select=token,plan_id,uses_total,granted_extra,used,remaining&limit=1`,
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
  const b = await balanceOf(token);
  if (!b) return { ok: false, remaining: 0, why: "このパスは見つかりません" };
  if (cost < 1) return { ok: false, remaining: b.remaining, why: "使う回数が不正です" };
  // 足りないのに「1回だけ使っておく」をしない。
  // 半端に使うと、何回分の相談だったのかが分からなくなる。
  if (b.remaining < cost) {
    return {
      ok: false,
      remaining: b.remaining,
      why:
        cost > 1
          ? `この相談は${cost}回分です。残りが足りません`
          : "残りがありません",
    };
  }

  const rows = await dbSelect<{ id: string }>(
    `ask_passes?token=eq.${encodeURIComponent(token)}&select=id&limit=1`,
  );
  const passId = rows[0]?.id;
  if (!passId) return { ok: false, remaining: b.remaining, why: "このパスは見つかりません" };

  // 2回分なら2行入れる。1行に「2」と書かない。
  // 数で持つと、数え方を間違えたときに気づけない。
  for (let i = 0; i < cost; i++) {
    const res = await dbInsert("pass_uses", {
      pass_id: passId,
      consultation_id: consultationId,
    });
    if (!res.ok) return { ok: false, remaining: b.remaining, why: res.error };
  }

  return { ok: true, remaining: b.remaining - cost };
}

/** 何回ぶんのパスか。パスでない商品なら null */
export function usesOf(id: PlanId): number | null {
  return plan(id).uses ?? null;
}

/** 残りの見せ方。0のときに「0回」と出さない */
export function remainingLabel(n: number): string {
  return n > 0 ? `あと${n}回` : "使い切りました";
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
