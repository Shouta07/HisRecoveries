// 1注文あたりの採算。
//
// ══════════════════════════════════════════════════
// なぜここが要るか
// ══════════════════════════════════════════════════
// 人に払うサービスは、売上だけ伸びて利益が残らない形に
// いくらでもなる。回答者に払い、決済手数料を取られ、
// 返金と再配信が乗った時点で、1件あたりが赤くなる。
//
// だから「売価 − 変動費 = 限界利益」を、値段と同じ場所に置く。
// 値段を変えたら採算も一緒に動く。別の表に書いておくと、
// 値段だけ動いて採算が取り残される。
//
// ══════════════════════════════════════════════════
// やらないこと
// ══════════════════════════════════════════════════
// 粗利を守るために回答者報酬を下げる、をやらない。
// 良い回答者が稼げることが、このサービスが速くなる唯一の道。
// 原価を下げるのは、人が価値を出していない作業のほうから。
//
// 下限（MIN_REWARD）を置いてあるのは、そのため。
// ここを割る設定はビルドで落ちる。

import { PLANS, plan, type Plan, type PlanId } from "./ask/plans";

/* ── 変動費の率 ──────────────────────────────── */

/**
 * 決済手数料。Stripe の国内カードは 3.6% 前後。
 * 固定費部分は無いが、実績が出たら実効値に入れ替える。
 */
export const PAYMENT_RATE = 0.036;

/** 質問整理・伏せ字・安全確認・レポート整理にかかる分。1件あたり */
export const AI_COST_YEN = 20;

/**
 * 返金と補填の引当。
 * 人数が集まらなかった分を返す運用なので、ゼロにはならない。
 * 実績が出るまでは保守的に置く。
 */
export const REFUND_RATE = 0.03;

/** そのほかの取引変動費（通知・ストレージなど）。1件あたり */
export const MISC_COST_YEN = 10;

/* ── 回答者報酬 ──────────────────────────────── */

export type RewardKind = "quick" | "priority" | "talk" | "improve";

export type RewardBand = {
  kind: RewardKind;
  label: string;
  /** 1件あたりの下限・上限（円） */
  min: number;
  max: number;
  note: string;
};

/**
 * 報酬の幅。
 * 速さ・質・希少な条件・緊急度で、この幅の中を動かす。
 * 幅の外には出さない（下は回答者のため、上は採算のため）。
 */
export const REWARDS: RewardBand[] = [
  { kind: "quick", label: "すぐ答える", min: 150, max: 250, note: "1〜3分で1件" },
  { kind: "priority", label: "急ぎに答える", min: 250, max: 400, note: "急ぎの依頼" },
  { kind: "talk", label: "話す", min: 1500, max: 2500, note: "20〜30分" },
  { kind: "improve", label: "直しに関わる", min: 800, max: 1500, note: "改善案づくり" },
];

export function reward(kind: RewardKind): RewardBand {
  const r = REWARDS.find((x) => x.kind === kind);
  if (!r) throw new Error(`未定義の報酬帯: ${kind}`);
  return r;
}

/** これを割る設定は認めない。安く買い叩かない */
export const MIN_REWARD_YEN = 150;

/* ── 採算の目標 ──────────────────────────────── */

/** 変動費が売価に占める割合の上限 */
export const MAX_VARIABLE_RATE = 0.4;

/** 限界利益率の下限 */
export const MIN_MARGIN_RATE = 0.6;

/* ── プランごとの原価の組み立て ──────────────── */

export type CostModel = {
  /**
   * 何人に、どの帯で、いくらで払う前提か。
   *
   * atYen は「この商品で見込んでいる単価」。
   * REWARDS の幅は払ってよい範囲で、atYen はその中の見込み値。
   * 幅の上限でいつでも払える前提にすると、入口商品が成立しない
   * （¥2,980 で5人に上限 ¥250 ずつ払うと、変動費が売価の50%になる）。
   *
   * 幅の上のほうを払うのは、急ぎの上乗せ（URGENCY）を受け取ったとき。
   * その分の原資は、上乗せの売上から出す。
   */
  parts: { kind: RewardKind; n: number; atYen: number }[];
};

export const COSTS: Record<PlanId, CostModel> = {
  // 5人にすぐ答えてもらう
  // ¥200 だと変動費が売価の41%になり、限界利益率が59%に落ちる。
  // ¥180 で 62%・1件あたり約¥1,850。これはこの商品の狙い（¥1,700〜¥2,000）の中。
  final_check: { parts: [{ kind: "quick", n: 5, atYen: 180 }] },
  // 1人と20〜30分
  // ¥4,980 で限界利益率60%を保てる報酬の上限は約¥1,590。
  // ¥2,000 払うなら、売価は¥5,980前後が要る。
  // いまは報酬¥1,500（20〜30分なので時給換算 ¥3,000〜¥4,500）で置く。
  talk: { parts: [{ kind: "talk", n: 1, atYen: 1500 }] },
  // 5人 ＋ 直しに関わる1人
  improve: { parts: [{ kind: "quick", n: 5, atYen: 180 }, { kind: "improve", n: 1, atYen: 900 }] },
  // 5人 ＋ 直し ＋ 別の5人
  retest: { parts: [{ kind: "quick", n: 10, atYen: 180 }, { kind: "improve", n: 1, atYen: 1400 }] },
  // まとめて見る分
  date_ready: {
    parts: [
      { kind: "quick", n: 10, atYen: 180 },
      { kind: "improve", n: 1, atYen: 1500 },
      { kind: "talk", n: 1, atYen: 1500 },
    ],
  },
};

/* ── 急ぎの上乗せ ────────────────────────────
   速さそのものを売るのは、実際に速く返せるようになってから。
   売れるようになったとき、上乗せ分の一部を回答者の
   優先報酬に回しても、通常より利益額が残る形にしておく。 */

export type Urgency = {
  id: "normal" | "fast" | "now";
  label: string;
  /** 売価への上乗せ */
  addYen: number;
  /**
   * 上乗せのうち、回答者へ回す割合。
   *
   * 1人いくら、と固定にすると人数の多い商品で破綻する
   * （10人の案件に +¥1,000 で1人¥100ずつ配ると、上乗せが全部消える）。
   * 割合で持てば、人数が増えても残る利益が減らない。
   */
  toResponderRate: number;
  /** いま売ってよいか。速さを担保できるまで false */
  available: boolean;
};

export const URGENCY: Urgency[] = [
  { id: "normal", label: "通常", addYen: 0, toResponderRate: 0, available: true },
  { id: "fast", label: "急ぎ", addYen: 1000, toResponderRate: 0.5, available: false },
  { id: "now", label: "大至急", addYen: 2000, toResponderRate: 0.5, available: false },
];

/**
 * 急ぎで上乗せを受け取ったとき、1人あたりいくら増やせるか。
 *
 * 急ぐのは「すぐ答える」人だけ。話す人と直す人は、
 * そもそも自分の都合で時間を取ってもらうので対象にしない。
 */
export function priorityBonus(id: PlanId, u: Urgency): number {
  if (u.addYen <= 0) return 0;
  const quick = COSTS[id].parts
    .filter((x) => x.kind === "quick")
    .reduce((n, x) => n + x.n, 0);
  if (quick === 0) return 0;
  return Math.floor((u.addYen * u.toResponderRate) / quick);
}

export type Unit = {
  plan: Plan;
  /** 回答者報酬（見込みの単価で積んだ額。ここを超えさせない） */
  rewardMax: number;
  /** 回答者報酬（下限で見た場合） */
  rewardMin: number;
  payment: number;
  ai: number;
  refund: number;
  misc: number;
  /** 変動費の合計（最大で見た場合） */
  variable: number;
  /** 限界利益（最大原価で見た場合＝いちばん厳しい見方） */
  margin: number;
  marginRate: number;
  /** 1注文あたりの原価上限。案件を作るときはこれを超えさせない */
  capYen: number;
};

export function unit(id: PlanId): Unit {
  const p = plan(id);
  const model = COSTS[id];

  // 見込みの単価で積む。幅の上限で積むと、入口商品が成立しない。
  const rewardMax = model.parts.reduce((n, x) => n + x.atYen * x.n, 0);
  const rewardMin = model.parts.reduce((n, x) => n + reward(x.kind).min * x.n, 0);

  const payment = Math.round(p.yen * PAYMENT_RATE);
  const refund = Math.round(p.yen * REFUND_RATE);
  const variable = rewardMax + payment + AI_COST_YEN + refund + MISC_COST_YEN;
  const margin = p.yen - variable;

  return {
    plan: p,
    rewardMax,
    rewardMin,
    payment,
    ai: AI_COST_YEN,
    refund,
    misc: MISC_COST_YEN,
    variable,
    margin,
    marginRate: p.yen > 0 ? margin / p.yen : 0,
    // 案件を作るときの上限。報酬を動かしてよいのはここまで。
    capYen: rewardMax,
  };
}

export function allUnits(): Unit[] {
  return PLANS.map((p) => unit(p.id));
}

/* ── 配信の広げ方 ────────────────────────────
   5人ほしいからといって、最初から20人分の報酬を確定しない。
   まず少し多めに声をかけ、集まったら止める。
   足りなければ次の波へ。 */

export type Wave = { n: number; afterMinutes: number };

/**
 * 欲しい人数から、声をかける順番を作る。
 * 1波目は欲しい数の 1.6 倍（切り上げ）。届かなければ半分ずつ足す。
 *
 * 払うのは、採用した回答に対してだけ。
 * 声をかけた人数分の報酬を先に確定させない。
 */
export function waves(need: number): Wave[] {
  if (need < 1) return [];
  const first = Math.ceil(need * 1.6);
  const second = Math.ceil(need * 0.8);
  const third = Math.ceil(need * 0.8);
  return [
    { n: first, afterMinutes: 0 },
    { n: second, afterMinutes: 10 },
    { n: third, afterMinutes: 30 },
  ];
}

/** その案件で、報酬に使ってよい上限を超えていないか */
export function withinCap(id: PlanId, plannedRewardYen: number): boolean {
  return plannedRewardYen <= unit(id).capYen;
}

/* ── 公開の前に止めること ─────────────────────
   値段を触ったときに、採算が崩れたまま出ていかないようにする。 */
{
  for (const p of PLANS) {
    const u = unit(p.id);

    // いちばん厳しい見方（報酬を上限で払った場合）で赤字にならないこと。
    if (u.margin <= 0) {
      throw new Error(
        `プラン「${p.id}」は、報酬を上限で払うと赤字です（売価 ${p.yen} / 変動費 ${u.variable}）`,
      );
    }

    // 変動費が売価の 40% を超えないこと。
    const rate = u.variable / p.yen;
    if (rate > MAX_VARIABLE_RATE) {
      throw new Error(
        `プラン「${p.id}」の変動費が売価の ${Math.round(rate * 100)}% です（${Math.round(
          MAX_VARIABLE_RATE * 100,
        )}% まで）`,
      );
    }

    // 限界利益率 60% 以上。
    if (u.marginRate < MIN_MARGIN_RATE) {
      throw new Error(
        `プラン「${p.id}」の限界利益率が ${Math.round(u.marginRate * 100)}% です（${Math.round(
          MIN_MARGIN_RATE * 100,
        )}% 以上にしてください）`,
      );
    }
  }

  // 高い商品ほど、1件あたりの利益「額」も大きいこと。
  // 率だけ追うと、安い商品ばかり売れて利益が積み上がらない。
  const byYen = [...PLANS].sort((a, b) => a.yen - b.yen);
  for (let i = 1; i < byYen.length; i++) {
    const lo = unit(byYen[i - 1].id);
    const hi = unit(byYen[i].id);
    if (hi.margin <= lo.margin) {
      throw new Error(
        `「${byYen[i].id}」は「${byYen[i - 1].id}」より高いのに、1件あたりの利益額が増えていません`,
      );
    }
  }

  // 報酬の下限を割らないこと。安く買い叩くと、良い回答者から抜けていく。
  for (const r of REWARDS) {
    if (r.min < MIN_REWARD_YEN) {
      throw new Error(`報酬「${r.kind}」の下限が ${r.min} 円です（${MIN_REWARD_YEN} 円以上）`);
    }
    if (r.max < r.min) throw new Error(`報酬「${r.kind}」の上下が逆です`);
  }

  // 入口商品が、いちばん利益の大きい商品になっていないこと。
  // 入口で最大の利益を取る設計にすると、そこから先へ人を送る理由が消える。
  const entry = [...PLANS].filter((p) => p.available).sort((a, b) => a.yen - b.yen)[0];
  const best = allUnits()
    .filter((u) => u.plan.available)
    .sort((a, b) => b.margin - a.margin)[0];
  if (best.plan.id === entry.id && PLANS.filter((p) => p.available).length > 1) {
    throw new Error("入口商品がいちばん儲かる設計になっています（入口は人の体験に入れるための商品）");
  }

  // 見込みの単価が、払ってよい幅の中にあること。
  for (const [id, model] of Object.entries(COSTS)) {
    for (const part of model.parts) {
      const band = reward(part.kind);
      if (part.atYen < band.min || part.atYen > band.max) {
        throw new Error(
          `プラン「${id}」の ${part.kind} の見込み単価 ${part.atYen} 円が、幅（${band.min}〜${band.max}）の外です`,
        );
      }
    }
  }

  // 急ぎの上乗せを売ったときに、通常より利益額が減らないこと。
  // 減るなら、上乗せを売るほど損をする。
  for (const p of PLANS) {
    const quick = COSTS[p.id].parts
      .filter((x) => x.kind === "quick")
      .reduce((n, x) => n + x.n, 0);

    for (const u of URGENCY) {
      if (u.addYen === 0) continue;
      const bonus = priorityBonus(p.id, u);
      const extraCost = bonus * quick + Math.round(u.addYen * (PAYMENT_RATE + REFUND_RATE));
      if (u.addYen - extraCost <= 0) {
        throw new Error(
          `「${u.label}」の上乗せ ${u.addYen} 円では、追加原価 ${extraCost} 円を賄えません`,
        );
      }

      // 上乗せた結果、1人あたりが「急ぎに答える」の幅を超えないこと。
      if (quick > 0) {
        const per = COSTS[p.id].parts.find((x) => x.kind === "quick")!.atYen + bonus;
        if (per > reward("priority").max) {
          throw new Error(
            `「${p.id}」を${u.label}で売ると、1人あたり ${per} 円になり、幅（〜${reward("priority").max}）を超えます`,
          );
        }
      }
    }
  }

  // 速さを担保できていないうちは、速さを売らない。
  // 「急ぎ」で買った人が待たされるのは、ただの不履行になる。
  for (const u of URGENCY) {
    if (u.id !== "normal" && u.available) {
      throw new Error(
        `「${u.label}」は、実際に速く返せることを確かめるまで available を false にしてください`,
      );
    }
  }

  // 波の作り方。1波目で欲しい数を下回ると、必ず待たせることになる。
  const w = waves(5);
  if (w.length === 0 || w[0].n < 5) throw new Error("1波目が必要人数に届いていません");
  if (w[0].n > 5 * 2) throw new Error("1波目が多すぎます（余分な原価になります）");
}
