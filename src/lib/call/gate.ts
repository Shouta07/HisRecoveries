import { callEnabled } from "./room";
import { PLANS, isSellable, plan, type PlanId } from "../ask/plans";
import { canCharge } from "../legal";
import { dbAdminEnabled } from "../db";

// 声で話す商品を、売ってよい状態か。
//
// ══════════════════════════════════════════════════
// なぜ available をコードに書き込まないか
// ══════════════════════════════════════════════════
// plans.ts の available を true にするだけでは、売ってはいけない。
// 相手は実在の人で、時間を決めて呼び出す商品なので、
// 揃っていないまま売ると、来られない約束を売ることになる。
//
// 揃っているかは環境で決まる（鍵が入っているか）。
// だから、ここで見て、揃った日に自動で開くようにする。
// 手で true にするのを忘れる／早まる、のどちらも起きない。
//
// ══════════════════════════════════════════════════
// ここに無いもの（人が確かめること）
// ══════════════════════════════════════════════════
// 機械で確かめられないものは、ここには書けない。
// 開ける前に、人が確かめること。
//   ・通話を受ける女性が、新しい約束（policy.ts）に同意しているか
//   ・本人確認（verified_age）が済んでいるか
//   ・話している最中に止める連絡先が、双方の画面から辿れるか
//   ・特定商取引法の「役務の提供時期」に、予約日時のことが書いてあるか

export type Gate = { key: string; label: string; ok: boolean; how: string };

export function callGates(): Gate[] {
  return [
    {
      key: "legal",
      label: "特定商取引法に基づく表記",
      ok: canCharge(),
      how: "LEGAL_REP_NAME と LEGAL_TEL を入れる",
    },
    {
      key: "room",
      label: "通話の土台",
      ok: callEnabled,
      how: "DAILY_API_KEY を入れる",
    },
    {
      key: "db",
      label: "通話の記録",
      ok: dbAdminEnabled,
      how: "SUPABASE_URL と SUPABASE_SERVICE_KEY を入れ、schema.sql を流す",
    },
  ];
}

/** いま通話を売ってよいか。1つでも欠けたら売らない */
export function canSellCalls(): boolean {
  return callGates().every((g) => g.ok);
}

/** なぜ売れないか。画面と API で同じ言葉を使う */
export function whyCannotSellCalls(): string | null {
  const miss = callGates().filter((g) => !g.ok);
  if (miss.length === 0) return null;
  return `通話の準備が終わっていません（${miss.map((g) => g.label).join("・")}）`;
}

/**
 * いま実際に買える商品か。サーバーでだけ使う。
 *
 * plans.ts の available は「コードとして開いてよいか」。
 * 声で話す商品は、それに加えて鍵が揃っているかで決まる。
 * plans.ts に環境の話を持ち込むと、画面（client）と
 * サーバーで別の答えになり、表示がちらつく。だからここに置く。
 */
export function isSellableNow(id: unknown): id is PlanId {
  if (isSellable(id)) return true;
  if (typeof id !== "string") return false;
  const p = PLANS.find((x) => x.id === id);
  return Boolean(p?.callMinutes) && canSellCalls();
}

/** いま買える商品のID。サーバーの画面から PlanCards に渡す */
export function openPlanIds(): string[] {
  return PLANS.filter((p) => isSellableNow(p.id)).map((p) => p.id);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 通話の商品が、鍵の無いまま「買える」にならないこと。
  // ここが緩むと、部屋を作れないのに決済だけ通る。
  for (const p of PLANS) {
    if (!p.callMinutes) continue;
    if (p.available) {
      throw new Error(
        `プラン「${p.id}」の available が true です。通話は鍵が揃ってから開きます（call/gate.ts）`,
      );
    }
  }
  // 文字の商品は、この判定を通っても変わらないこと。
  if (!isSellable("review")) throw new Error("文字の商品が売れなくなっています");
  void plan;
}
