import { dbSelect, dbUpdate, dbInsertReturning } from "@/lib/db";
import { REWARD_CAP, MIN_REWARD_YEN, TIERS, reward, RARE_BONUS } from "@/lib/economics";
import type { PlanId } from "@/lib/ask/plans";

// 回答者のお金。
//
// ══════════════════════════════════════════════════
// 確定は即時、出金はまとめて
// ══════════════════════════════════════════════════
// 答えて、品質の確認を通った瞬間に残高へ入る。
// 回答者から見れば「答えたらすぐ稼げた」。
//
// ただし銀行への振り込みは、毎回はしない。
// 1件200円を都度振り込むと、送金の手数料と手間だけが積み上がる。
// まとまってから、まとめて振り込む。
//
// この2つを分けているのが要点。
// 「すぐ稼げた」の手触りは残したまま、裏はまとめて精算する。
//
// ══════════════════════════════════════════════════
// 残高を直接書き換えない
// ══════════════════════════════════════════════════
// 増減は必ず responder_ledger を通す。
// 残高テーブルだけ動かすと、合わない日が来たときに追えない。
//
// ══════════════════════════════════════════════════
// 同じ回答に二度払わない
// ══════════════════════════════════════════════════
// 品質の確認が二度走ることがある。
// 台帳に一意制約を置いてあるので、二度目は弾かれる。

export type Tier = (typeof TIERS)[number]["id"];

/** 出金を受け付ける下限。これより小さいと送金の手数料に負ける */
export const PAYOUT_MIN_YEN = 3000;

/**
 * この回答者に、この案件でいくら払うか。
 *
 * 一律にしない。速さ・評価・条件の珍しさで動かす。
 * ただし1注文の合計は REWARD_CAP を超えない（呼ぶ側が allocate で丸める）。
 */
export function rateFor(opts: {
  tier: Tier;
  /** 急ぎの案件か */
  urgent?: boolean;
  /** 条件が珍しいか。0〜1 で珍しさ */
  rarity?: number;
}): number {
  const base = TIERS.find((t) => t.id === opts.tier)?.quickYen ?? TIERS[0].quickYen;

  // 急ぎなら「急ぎに答える」の帯へ乗せ換える。
  const band = opts.urgent ? reward("priority") : reward("quick");
  const onBand = Math.min(Math.max(base, band.min), band.max);

  // 珍しい条件の上乗せ。
  const rare = opts.rarity
    ? Math.round(RARE_BONUS.min + (RARE_BONUS.max - RARE_BONUS.min) * Math.min(1, opts.rarity))
    : 0;

  return Math.max(MIN_REWARD_YEN, onBand + rare);
}

/** その案件で、まだ払える残りはいくらか */
export async function remainingBudget(
  planId: PlanId,
  consultationId: string,
): Promise<number> {
  const cap = REWARD_CAP[planId];
  const rows = await dbSelect<{ yen: number }>(
    `responder_ledger?consultation_id=eq.${consultationId}&kind=in.(earn,bonus)&select=yen`,
  );
  const spent = rows.reduce((n, r) => n + (r.yen ?? 0), 0);
  return Math.max(0, cap - spent);
}

export type Credit = {
  responderId: string;
  yen: number;
  responseId: string;
  consultationId: string;
  planId: PlanId;
  note?: string;
};

/**
 * 報酬を確定して、残高に入れる。
 *
 * 予算を超える分は払わない。超えていたら残りだけ払う。
 * 残りが下限を割るなら、払わずに理由を返す（黙って0円にしない）。
 */
export async function credit(c: Credit): Promise<{ ok: boolean; paid: number; why?: string }> {
  const left = await remainingBudget(c.planId, c.consultationId);
  if (left <= 0) {
    return { ok: false, paid: 0, why: "この案件の報酬の上限に達しています" };
  }

  const yen = Math.min(c.yen, left);
  if (yen < MIN_REWARD_YEN) {
    return { ok: false, paid: 0, why: `残りが下限（${MIN_REWARD_YEN}円）を割ります` };
  }

  // 台帳が先。ここが一意制約で弾かれたら、既に払っている。
  const ins = await dbInsertReturning("responder_ledger", {
    responder_id: c.responderId,
    kind: "earn",
    yen,
    response_id: c.responseId,
    consultation_id: c.consultationId,
    note: c.note ?? null,
  });
  if (!ins.ok) {
    if (/duplicate|unique/i.test(ins.error ?? "")) {
      return { ok: true, paid: 0, why: "すでに支払い済みです" };
    }
    return { ok: false, paid: 0, why: ins.error ?? "記録できませんでした" };
  }

  // 残高に反映。
  const bal = await dbSelect<{
    responder_id: string;
    available_yen: number;
    lifetime_yen: number;
  }>(`responder_balances?responder_id=eq.${c.responderId}&select=*`);

  if (bal[0]) {
    await dbUpdate("responder_balances", bal[0].responder_id, {
      available_yen: bal[0].available_yen + yen,
      lifetime_yen: bal[0].lifetime_yen + yen,
      updated_at: new Date().toISOString(),
    });
  } else {
    await dbInsertReturning("responder_balances", {
      responder_id: c.responderId,
      available_yen: yen,
      lifetime_yen: yen,
    });
  }

  return { ok: true, paid: yen };
}

export type Balance = {
  available: number;
  pending: number;
  lifetime: number;
  todayYen: number;
  todayCount: number;
};

export async function balanceOf(responderId: string): Promise<Balance> {
  const [bal, today] = await Promise.all([
    dbSelect<{ available_yen: number; pending_yen: number; lifetime_yen: number }>(
      `responder_balances?responder_id=eq.${responderId}&select=available_yen,pending_yen,lifetime_yen`,
    ),
    dbSelect<{ earned_yen: number | null; answered: number | null }>(
      `responder_today?responder_id=eq.${responderId}&select=earned_yen,answered`,
    ),
  ]);

  return {
    available: bal[0]?.available_yen ?? 0,
    pending: bal[0]?.pending_yen ?? 0,
    lifetime: bal[0]?.lifetime_yen ?? 0,
    todayYen: today[0]?.earned_yen ?? 0,
    todayCount: today[0]?.answered ?? 0,
  };
}

/** 出金できる状態か */
export function canPayout(b: Balance): boolean {
  return b.available >= PAYOUT_MIN_YEN;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 段が上がるほど単価が上がること。
  for (let i = 1; i < TIERS.length; i++) {
    if (TIERS[i].quickYen <= TIERS[i - 1].quickYen) {
      throw new Error(`回答者の段「${TIERS[i].id}」の単価が上がっていません`);
    }
  }
  // いちばん下の段でも、下限を割らないこと。
  if (TIERS[0].quickYen < MIN_REWARD_YEN) {
    throw new Error("いちばん下の段の単価が、下限を割っています");
  }
  // 出金の下限が、1件の報酬より十分大きいこと。
  // 1件ごとに出金できてしまうと、送金の手数料に負ける。
  if (PAYOUT_MIN_YEN < TIERS[TIERS.length - 1].quickYen * 5) {
    throw new Error("出金の下限が低すぎます（1件ごとの出金に近くなります）");
  }
  // 急ぎのときに、通常より下がらないこと。
  const normal = rateFor({ tier: "bronze" });
  const urgent = rateFor({ tier: "bronze", urgent: true });
  if (urgent <= normal) throw new Error("急ぎのほうが報酬が低くなっています");
}
