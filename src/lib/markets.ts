// 市場検証（6領域のうち、どれが本当に勝てる市場か）のデータ層。
//
// 計測の3点セット（すべて events テーブル、props.market = 領域ID）:
//   需要 market_select        … 診断で「この悩みがある」と選ばれた
//   関心 market_view          … その領域の記事・ピラーを読んだ
//   意向 market_consult_click … その領域の文脈から相談へ進んだ
//
// 見るのは絶対数ではなく **転換率**。母数が小さいうちは順位を信じない
// （MIN_SAMPLE 未満は「判定不能」と明示する）。

import { dbSelect, dbAdminEnabled } from "./db";
import { complexes } from "./complexes";
import { clusters } from "./clusters";
import { VIDEO_REGISTRY } from "./studio";
import { GOALS } from "./goals";

/** これ未満のサンプル数では順位づけしない（早すぎる結論を防ぐ） */
export const MIN_SAMPLE = 30;

export type MarketRow = {
  id: string;
  ja: string;
  worry: string;
  /** 需要: 診断で選ばれた回数 */
  select: number;
  /** 関心: 領域ページの閲覧 */
  view: number;
  /** 意向: その領域からの相談クリック */
  consult: number;
  /** 関心→意向の転換率(%)。母数が薄いと null */
  consultRate: number | null;
  /** 需要→関心の転換率(%)。記事が需要を受け止められているか */
  readRate: number | null;
  articles: number;
  videos: number;
  /** 判定に足るサンプルがあるか */
  enough: boolean;
};

/** ゴール（理想の日）別の需要。サイトの軸が「悩み」→「迎えたい日」に移ったため、
 *  勝てる市場の一次指標はこちら。どのイベントが選ばれ、実際に進むかを見る。 */
export type GoalRow = {
  id: string;
  label: string;
  /** 選ばれた回数 */
  select: number;
  /** ステップ完了の延べ回数（＝実際に動いた量） */
  stepDone: number;
  /** 1選択あたり何ステップ進んだか。熱量の指標。 */
  stepsPerSelect: number | null;
};

export type MarketReport = {
  enabled: boolean;
  /** 何らかのイベントが1件でもあるか */
  hasData: boolean;
  rows: MarketRow[];
  totals: { select: number; view: number; consult: number };
  /** 判定に足るデータが揃った市場だけを転換率順に並べたもの */
  ranked: MarketRow[];
  /** ゴール（理想の日）別の需要。新しい軸の一次指標。 */
  goals: GoalRow[];
  sinceDays: number;
};

type EventRow = { event_name: string; props: Record<string, unknown> | null };

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * 直近 sinceDays 日のイベントを取得し、領域ごとに集計する。
 * Supabase 未設定・失敗時は enabled=false（画面側で案内を出す）。
 */
export async function buildMarketReport(sinceDays = 90): Promise<MarketReport> {
  const base = complexes.map((c) => ({ id: c.id, ja: c.ja, worry: c.worry }));

  const articleCount = new Map<string, number>();
  for (const a of clusters) {
    articleCount.set(a.areaId, (articleCount.get(a.areaId) ?? 0) + 1);
  }
  const videoCount = new Map<string, number>();
  for (const v of VIDEO_REGISTRY) {
    videoCount.set(v.areaId, (videoCount.get(v.areaId) ?? 0) + 1);
  }

  const empty = (): MarketReport => ({
    enabled: dbAdminEnabled,
    hasData: false,
    sinceDays,
    totals: { select: 0, view: 0, consult: 0 },
    rows: base.map((b) => ({
      ...b,
      select: 0,
      view: 0,
      consult: 0,
      consultRate: null,
      readRate: null,
      articles: articleCount.get(b.id) ?? 0,
      videos: videoCount.get(b.id) ?? 0,
      enough: false,
    })),
    ranked: [],
    goals: GOALS.map((g) => ({
      id: g.id,
      label: g.label,
      select: 0,
      stepDone: 0,
      stepsPerSelect: null,
    })),
  });

  if (!dbAdminEnabled) return empty();

  const since = new Date(Date.now() - sinceDays * 86400_000).toISOString();
  const query =
    `events?select=event_name,props&created_at=gte.${since}` +
    `&event_name=in.(market_select,market_view,market_consult_click,goal_select,goal_step_done)&limit=50000`;

  let events: EventRow[] = [];
  try {
    events = await dbSelect<EventRow>(query);
  } catch {
    return empty();
  }

  const counts = new Map<string, { select: number; view: number; consult: number }>();
  for (const b of base) counts.set(b.id, { select: 0, view: 0, consult: 0 });
  const goalCounts = new Map<string, { select: number; stepDone: number }>();
  for (const g of GOALS) goalCounts.set(g.id, { select: 0, stepDone: 0 });

  for (const e of events) {
    // ゴール系（props.goal）
    if (e.event_name === "goal_select" || e.event_name === "goal_step_done") {
      const gid = e.props && typeof e.props.goal === "string" ? e.props.goal : null;
      const gc = gid ? goalCounts.get(gid) : undefined;
      if (gc) {
        if (e.event_name === "goal_select") gc.select += 1;
        else gc.stepDone += 1;
      }
      continue;
    }
    // 領域系（props.market）
    const market = e.props && typeof e.props.market === "string" ? e.props.market : null;
    if (!market) continue;
    const c = counts.get(market);
    if (!c) continue; // 未知の領域IDは無視
    if (e.event_name === "market_select") c.select += 1;
    else if (e.event_name === "market_view") c.view += 1;
    else if (e.event_name === "market_consult_click") c.consult += 1;
  }

  const goals: GoalRow[] = GOALS.map((g) => {
    const c = goalCounts.get(g.id)!;
    return {
      id: g.id,
      label: g.label,
      select: c.select,
      stepDone: c.stepDone,
      stepsPerSelect:
        c.select > 0 ? Math.round((c.stepDone / c.select) * 10) / 10 : null,
    };
  });

  const rows: MarketRow[] = base.map((b) => {
    const c = counts.get(b.id)!;
    return {
      ...b,
      select: c.select,
      view: c.view,
      consult: c.consult,
      consultRate: rate(c.consult, c.view),
      readRate: rate(c.view, c.select),
      articles: articleCount.get(b.id) ?? 0,
      videos: videoCount.get(b.id) ?? 0,
      enough: c.view >= MIN_SAMPLE,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      select: acc.select + r.select,
      view: acc.view + r.view,
      consult: acc.consult + r.consult,
    }),
    { select: 0, view: 0, consult: 0 },
  );

  // 判定に足るものだけを「意向転換率」で並べる。ここが"勝てる市場"の一次指標。
  const ranked = rows
    .filter((r) => r.enough && r.consultRate !== null)
    .sort((a, b) => (b.consultRate ?? 0) - (a.consultRate ?? 0));

  return {
    enabled: true,
    hasData:
      totals.select + totals.view + totals.consult +
        goals.reduce((n, g) => n + g.select + g.stepDone, 0) >
      0,
    sinceDays,
    rows,
    totals,
    ranked,
    goals,
  };
}
