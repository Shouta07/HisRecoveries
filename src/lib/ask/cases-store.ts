import { dbSelect, dbInsertReturning, dbUpdate, dbAdminEnabled } from "../db";
import { makeConsultToken } from "./token";
import { STEPS, type StepId } from "./journey";

// 相手ごとのケース。
//
// ══════════════════════════════════════════════════
// 人は伴走しない。文脈が伴走する
// ══════════════════════════════════════════════════
// 専属のコーチは置かない。置いたら人件費がそのまま売上に比例する。
// 代わりに、前回までの経緯をこちらが持っておく。
//
// 画面では前から「前回の続きから相談できます」と言っていた。
// 言っているのに、相談は1件ずつ独立していて、
// 実際には毎回ゼロから書かせていた。ここはその穴を埋めるもの。
//
// ══════════════════════════════════════════════════
// 相手の情報は持たない
// ══════════════════════════════════════════════════
// 実名・連絡先・SNS・年齢そのものは持たない。
// 持つのは「この相談者から見た、その関係の現在地」だけ。
// 呼び名も相談者が自分で付けたもので、本名は入れないよう画面で断る。
//
// ══════════════════════════════════════════════════
// 渡すのは要約だけ
// ══════════════════════════════════════════════════
// 新しい相談のときに、過去の相談を全部渡さない。
// 渡すのは current_summary の1つだけ。
//   ・女性に長文を読ませない（3〜5分で終わらせるため）
//   ・履歴が伸びるほど、読む量が増えていくのを避けるため

export type CaseRow = {
  id: string;
  token: string;
  pass_token: string | null;
  partner_label: string | null;
  user_age_band: string | null;
  partner_age_band: string | null;
  dating_app: string | null;
  current_stage: string | null;
  goal: string | null;
  current_summary: string | null;
  last_decision: string | null;
  status: string;
  updated_at: string;
};

/** 相手の呼び名に入れてほしくないもの。画面でも断るが、ここでも落とす */
const LOOKS_LIKE_CONTACT = /@|https?:|line\.me|\d{9,}/i;

/**
 * 呼び名を整える。
 *
 * 相手の連絡先やURLが混ざっていたら落とす。
 * 保存してしまうと、消す手段が無いまま残る。
 */
export function cleanLabel(x: unknown): string | null {
  if (typeof x !== "string") return null;
  const t = x.trim().slice(0, 20);
  if (!t) return null;
  if (LOOKS_LIKE_CONTACT.test(t)) return null;
  return t;
}

/** 鍵で1件引く */
export async function findCase(token: string): Promise<CaseRow | null> {
  if (!dbAdminEnabled) return null;
  const rows = await dbSelect<CaseRow>(
    `relationship_cases?token=eq.${encodeURIComponent(token)}&select=id,token,pass_token,partner_label,user_age_band,partner_age_band,dating_app,current_stage,goal,current_summary,last_decision,status,updated_at&limit=1`,
  );
  return rows[0] ?? null;
}

/** そのパスに紐づくケース。新しい順 */
export async function casesOfPass(passToken: string): Promise<CaseRow[]> {
  if (!dbAdminEnabled) return [];
  return dbSelect<CaseRow>(
    `relationship_cases?pass_token=eq.${encodeURIComponent(passToken)}&status=eq.active&select=id,token,pass_token,partner_label,user_age_band,partner_age_band,dating_app,current_stage,goal,current_summary,last_decision,status,updated_at&order=updated_at.desc&limit=20`,
  );
}

/**
 * ケースを作る。
 *
 * 相談を出したときに、まだケースが無ければここで1つ作る。
 * 相談ごとに作らない（同じ相手の相談は、同じケースにぶら下げる）。
 */
export async function createCase(opts: {
  passToken: string | null;
  partnerLabel: string | null;
  userAgeBand: string | null;
  partnerAgeBand: string | null;
  datingApp: string | null;
  stage: StepId | null;
}): Promise<CaseRow | null> {
  if (!dbAdminEnabled) return null;
  const ins = await dbInsertReturning<CaseRow>("relationship_cases", {
    token: makeConsultToken(),
    pass_token: opts.passToken,
    partner_label: cleanLabel(opts.partnerLabel),
    user_age_band: opts.userAgeBand,
    partner_age_band: opts.partnerAgeBand,
    dating_app: opts.datingApp,
    current_stage: opts.stage,
  });
  return ins.rows[0] ?? null;
}

/**
 * ケースを進める。
 *
 * 相談が終わったときに呼ぶ。
 * 段は後ろへだけ進める（戻さない）。
 * 戻せるようにすると、履歴と現在地が食い違ったまま残る。
 */
export async function advance(
  c: CaseRow,
  next: { stage?: StepId | null; summary?: string | null; decision?: string | null },
): Promise<void> {
  if (!dbAdminEnabled) return;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (next.stage && forward(c.current_stage, next.stage)) {
    patch.current_stage = next.stage;
  }
  if (typeof next.summary === "string" && next.summary.trim()) {
    patch.current_summary = next.summary.trim().slice(0, 600);
  }
  if (typeof next.decision === "string" && next.decision.trim()) {
    patch.last_decision = next.decision.trim().slice(0, 200);
  }
  await dbUpdate("relationship_cases", `id=eq.${encodeURIComponent(c.id)}`, patch);
}

/** その段は、いまより後ろか */
export function forward(from: string | null, to: string): boolean {
  const order = STEPS.map((s) => s.id as string);
  const a = from ? order.indexOf(from) : -1;
  const b = order.indexOf(to);
  if (b < 0) return false;
  return b >= a;
}

/** 画面に出す言い方。内部の語彙をそのまま見せない */
export function stageLabel(id: string | null): string {
  const s = STEPS.find((x) => x.id === id);
  return s ? s.label : "まだ始まったところ";
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 呼び名に連絡先を入れさせない。
  for (const bad of ["@taro_line", "https://line.me/x", "09012345678", "taro@example.com"]) {
    if (cleanLabel(bad) !== null) {
      throw new Error(`相手の呼び名に連絡先が通っています（${bad}）`);
    }
  }
  // ふつうの呼び名は通ること。
  for (const ok of ["Aさん", "withの人", "カフェの人"]) {
    if (cleanLabel(ok) !== ok) throw new Error(`ふつうの呼び名が通りません（${ok}）`);
  }
  // 長すぎるものは切る。
  if ((cleanLabel("あ".repeat(40)) ?? "").length !== 20) {
    throw new Error("呼び名の長さが切られていません");
  }

  // 段は後ろへだけ進む。
  if (forward("matched", "before")) {
    throw new Error("ケースの段が前へ戻せてしまいます");
  }
  if (!forward("before", "matched")) {
    throw new Error("ケースの段が進みません");
  }
  // 同じ段に留まるのは許す（同じ段で何度も相談する）。
  if (!forward("matched", "matched")) {
    throw new Error("同じ段に留まれません");
  }
  // 知らない段は受けない。
  if (forward("matched", "nowhere")) {
    throw new Error("知らない段が通っています");
  }
}
