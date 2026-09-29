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
  // 1件ぶんの反応。第一印象・気になったところ・その理由。
  // 以前は 200〜300 円だったが、商品が ¥5,980 になったので引き上げる。
  { kind: "quick", label: "反応を返す", min: 400, max: 700, note: "1件ぶんの反応" },
  { kind: "priority", label: "先に回す", min: 500, max: 850, note: "優先して回した依頼" },
  // 30〜45分、実在の女性と話す・やりとりする
  { kind: "talk", label: "話す・やりとりする", min: 3000, max: 7000, note: "30〜45分" },
  // 改善案とそのまま使える修正文を書く
  { kind: "improve", label: "直し方を書く", min: 400, max: 900, note: "改善案と修正文" },
];

/* ── 回答者の段 ──────────────────────────────
   良い回答をすると、単価の高い仕事が回ってくる。
   順位を付けて競わせるゲームにはしない。
   見ているのは、役に立ったと言われた割合・速さ・通報の有無。 */

export type Tier = {
  id: "bronze" | "trusted" | "top";
  label: string;
  quickYen: number;
  /** その段でできること */
  can: string;
};

/**
 * 段。
 *
 * 回答の「数」ではなく「質」で上がる。見ているのは、
 * 役に立ったと言われた割合・速さ・通報の有無。
 * 順位を公開して競わせることはしない。
 */
export const TIERS: Tier[] = [
  { id: "bronze", label: "レギュラー回答者", quickYen: 450, can: "反応を返す" },
  { id: "trusted", label: "高評価回答者", quickYen: 550, can: "優先して回る依頼も受けられる" },
  { id: "top", label: "リード回答者", quickYen: 700, can: "直し方を書き、新しい人の回答も確認する" },
];

/** 条件が珍しいときの上乗せ */
export const RARE_BONUS = { min: 50, max: 150 };

/**
 * 1注文で、回答者に払ってよい合計の上限。
 *
 * 1人いくら、を固定にしない。
 * 誰かに 300 円払ったら、残りの人の平均を下げて、合計をここに収める。
 * 顧客の価格から逆算して、供給の原価を管理する。
 */
export const REWARD_CAP: Record<PlanId, number> = {
  // ¥5,980 の 40% から手数料を引いた額が、払える上限。
  // 売っているのはこれだけ。¥5,980 の 40% から手数料を引いた額。
  review: 1960,
  // ここから下は受付前。開通するときに、売価と一緒に引き直すこと。
  // いまは見込みの報酬と同じ額を置いてある。
  reaction: 3240,
  mockchat: 4240,
  // 15分の通話。話す帯の下限（¥3,000）をそのまま上限にしている。
  // 15分で ¥3,000 は時給に直すと ¥12,000。
  // 売価 ¥7,980 に対して変動費 37.6%。下げる余地はここには無い。
  call15: 3000,
  session: 5000,
  mockdate: 7000,
};


/**
 * 実際に配る額を決める。
 *
 * 望ましい額をそのまま足すと上限を超えることがある
 * （評価の高い人ばかり当たった、珍しい条件が重なった、など）。
 * 超えたら、全体を比例で縮めて上限に収める。
 * 縮めても下限（MIN_REWARD_YEN）は割らない。割るくらいなら人数を減らす。
 */
export function allocate(
  id: PlanId,
  wanted: number[],
): { paid: number[]; total: number; capped: boolean } {
  const cap = REWARD_CAP[id];
  const sum = wanted.reduce((n, x) => n + x, 0);
  if (sum <= cap) return { paid: wanted, total: sum, capped: false };

  // 下限の合計が上限を超えるなら、そもそもこの人数を配れない。
  const floor = MIN_REWARD_YEN * wanted.length;
  if (floor > cap) {
    throw new Error(
      `${id}: ${wanted.length}人に下限（${MIN_REWARD_YEN}円）で払っても上限（${cap}円）を超えます`,
    );
  }

  // 下限より上の分だけを縮める。
  const room = cap - floor;
  const over = sum - floor;
  const paid = wanted.map((w) =>
    Math.max(MIN_REWARD_YEN, MIN_REWARD_YEN + Math.floor(((w - MIN_REWARD_YEN) * room) / over)),
  );
  return { paid, total: paid.reduce((n, x) => n + x, 0), capped: true };
}

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

/**
 * 限界利益率の下限。2段で見る。
 *
 *   MIN_MARGIN_RATE     見込みの単価で払ったとき（ふだん）
 *   MIN_MARGIN_AT_CAP   上限いっぱいまで払ったとき（いちばん厳しい）
 *
 * 1段だけだと、上限を上げれば通ってしまうか、
 * ふだんの採算を必要以上に締めるかの、どちらかになる。
 */
export const MIN_MARGIN_RATE = 0.6;
export const MIN_MARGIN_AT_CAP = 0.55;

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
  // 3人が読んで反応を返し、1人が直し方を書く。
  // 合計 ¥1,950。指定の「女性目線レビュー 1,500〜2,500円」の中。
  // 1件ぶんの反応は ¥230 → ¥500 になる。
  review: {
    parts: [
      { kind: "quick", n: 3, atYen: 500 },
      { kind: "improve", n: 1, atYen: 450 },
    ],
  },
  // 1人が動画で反応を返す
  reaction: { parts: [{ kind: "talk", n: 1, atYen: 3000 }] },
  // 1人と、その場でやりとり
  mockchat: { parts: [{ kind: "talk", n: 1, atYen: 4000 }] },
  // 1人と15分
  call15: { parts: [{ kind: "talk", n: 1, atYen: 3000 }] },
  // 1人と30〜45分
  session: { parts: [{ kind: "talk", n: 1, atYen: 5000 }] },
  // 1人と、通しで
  mockdate: { parts: [{ kind: "talk", n: 1, atYen: 7000 }] },
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
  // +1,000円のうち 300円を回答者へ、700円がこちらに残る。
  // 買う人は速さに払い、答える人は急ぎだから多くもらい、
  // こちらは通常より利益額が増える。
  { id: "fast", label: "急ぎ", addYen: 1000, toResponderRate: 0.3, available: false },
  { id: "now", label: "大至急", addYen: 2000, toResponderRate: 0.3, available: false },
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

  const share = Math.floor((u.addYen * u.toResponderRate) / quick);

  // 上乗せた結果が「急ぎに答える」の幅を超えないようにする。
  // 人数の少ない商品（入口の3人）だと、1人あたりの取り分が
  // 大きくなりすぎて幅の外に出る。余った分はこちらに残す。
  const base = COSTS[id].parts.find((x) => x.kind === "quick")?.atYen ?? 0;
  const room = Math.max(0, reward("priority").max - base);
  return Math.min(share, room);
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
  /** 上限いっぱいまで払ったときの限界利益 */
  marginAtCap: number;
  marginRateAtCap: number;
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

  const capYen = REWARD_CAP[id];
  const variableAtCap = capYen + payment + AI_COST_YEN + refund + MISC_COST_YEN;
  const marginAtCap = p.yen - variableAtCap;

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
    capYen,
    marginAtCap,
    marginRateAtCap: p.yen > 0 ? marginAtCap / p.yen : 0,
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
  // 5人ほしいなら、まず8人。2分待って足りなければ5人。
  // 「5人要るから50人へ一斉通知」はしない。
  // 通知が当たり前になると、回答者は通知を見なくなる。
  return [
    { n: Math.ceil(need * 1.6), afterMinutes: 0 },
    { n: need, afterMinutes: 2 },
    { n: need, afterMinutes: 10 },
  ];
}

/** その案件で、報酬に使ってよい上限を超えていないか */
export function withinCap(id: PlanId, plannedRewardYen: number): boolean {
  return plannedRewardYen <= unit(id).capYen;
}

/* ── 公開の前に止めること ─────────────────────
   値段を触ったときに、採算が崩れたまま出ていかないようにする。 */
{

  /**
   * 受付前の商品に許す限界利益率。
   *
   * 受け入れ手順がまだ無いものは、値段も報酬も見込みでしかない。
   * ここで 60% を課すと、値段を決めて置いておくことができない。
   *
   * ただし「売り物にするとき（available: true）」は 60% を満たすこと。
   * 下の判定が、その時点で必ず落ちる。
   */
  const PLANNING_FLOOR = 0.55;

  for (const p of PLANS) {
    const u = unit(p.id);
    // 受付前のうちは、見込みとして置いておける下限まで緩める
    const floorFor = (base: number) =>
      p.available ? base : Math.min(base, PLANNING_FLOOR);

    // いちばん厳しい見方（報酬を上限で払った場合）で赤字にならないこと。
    if (u.margin <= 0) {
      throw new Error(
        `プラン「${p.id}」は、報酬を上限で払うと赤字です（売価 ${p.yen} / 変動費 ${u.variable}）`,
      );
    }

    // 変動費が売価に占める割合。
    // 入口の商品だけ、限界利益率の下限に合わせて緩める。
    const maxRate =
      1 - floorFor(p.marginFloor !== undefined ? p.marginFloor : 1 - MAX_VARIABLE_RATE);
    const rate = u.variable / p.yen;
    if (rate > maxRate) {
      throw new Error(
        `プラン「${p.id}」の変動費が売価の ${Math.round(rate * 100)}% です（${Math.round(
          maxRate * 100,
        )}% まで）`,
      );
    }

    // 上限いっぱいまで払っても、下限を大きく割らないこと。
    const capFloor = floorFor(
      p.marginFloor !== undefined ? p.marginFloor - 0.05 : MIN_MARGIN_AT_CAP,
    ) - (p.available ? 0 : 0.05);
    if (u.marginRateAtCap < capFloor) {
      throw new Error(
        `プラン「${p.id}」は、上限（${u.capYen}円）まで払うと限界利益率が ${Math.round(
          u.marginRateAtCap * 100,
        )}% になります（${Math.round(capFloor * 100)}% 以上）`,
      );
    }

    // 上限が、見込みより下がっていないこと。下がっていたら上限の意味が無い。
    if (u.capYen < u.rewardMax) {
      throw new Error(
        `プラン「${p.id}」の上限（${u.capYen}円）が、見込み（${u.rewardMax}円）を下回っています`,
      );
    }

    // 限界利益率。
    //
    // 売っているものは 60% を満たすこと。
    // 受付前のものは、値段も報酬もまだ見込みなので 55% まで許す。
    // 売り物にした瞬間に、ここが 60% で落ちる。
    //
    // 報酬を削って率を作らない。良い回答者から抜けていく。
    const floor = floorFor(p.marginFloor ?? MIN_MARGIN_RATE);
    if (u.marginRate < floor) {
      throw new Error(
        `プラン「${p.id}」の限界利益率が ${Math.round(u.marginRate * 100)}% です（${Math.round(
          floor * 100,
        )}% 以上にしてください）`,
      );
    }
    // 下限を下げてよいのは、いちばん安い商品だけ。
    if (p.marginFloor !== undefined) {
      const cheapest = [...PLANS].sort((a, b) => a.yen - b.yen)[0];
      if (p.id !== cheapest.id) {
        throw new Error(`プラン「${p.id}」は入口ではないので、限界利益率の下限を下げられません`);
      }
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
