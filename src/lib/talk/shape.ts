import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   通話のあと、AIが返すもの
   ══════════════════════════════════════════════════

   ── ここがこの製品でいちばん危ないところ ──────────
   利用者は管理表を書かない。だから、相手カードに残るものは
   ほぼ全部、AIが文字起こしから取り出したものになる。

   取り出し方を間違えると、間違いがそのまま残る。
   しかも次の相談のとき、回答者には「前回までの経緯」として
   それが渡る。1回の読み間違いが、何回も引き継がれる。

   だから受け取る側で、形と中身の両方を見る。
   AIに「こう返して」と頼むだけでは足りない。頼みは外れる。

   ── 混ぜない ────────────────────────────────────
   fact      起きたこと。発言の引用が無ければ捨てる
   feeling   相談者自身の気持ち
   opinion   回答者（人）が言ったこと
   inference AIの推測。確からしさを必ず持つ
   action    次にやること

   この5つを1つの配列に混ぜない。混ぜた時点で、
   画面でも「AIが言っただけのこと」と「本当にあったこと」を
   分けて出せなくなる。

   ── 相手の気持ちは、当てない ────────────────────
   「脈あり」「本命」は、ここでも止める。
   利用規約 第12条で売らないと書いたものを、
   AIが裏口から入れてくるのを防ぐ。

   相手の気持ちについて言えるのは
   「相談者がそう見立てている」までで、それは feeling に入る。 */

export type Fact = { body: string; quote: string };
export type Inference = { body: string; confidence: number };

export type TalkUpdate = {
  facts: Fact[];
  feelings: string[];
  opinions: string[];
  inferences: Inference[];
  stageUpdate: { from: Stage; to: Stage; confidence: number } | null;
  nextDateUpdate: { date: string | null; status: "confirmed" | "proposed" | "none" } | null;
  concernsAdd: string[];
  signalsAdd: string[];
  topicsToConfirm: string[];
  nextAction: string;
  summary: string;
};

/** 恋愛の段階。schema.sql の relationship_cases_stage_check と同じ語彙 */
export const STAGES = [
  "matched",
  "messaging",
  "calling",
  "first_date_scheduled",
  "first_date_completed",
  "second_date_scheduled",
  "second_date_completed",
  "third_date_plus",
  "relationship_decision",
  "dating",
  "ended",
] as const;
export type Stage = (typeof STAGES)[number];

export function isStage(x: unknown): x is Stage {
  return typeof x === "string" && (STAGES as readonly string[]).includes(x);
}

/**
 * 推測を画面に出してよい下限。
 *
 * これより低いものは、出さずに捨てる。
 * 「たぶんこうかもしれません（自信なし）」を並べると、
 * 読む側は全部を同じ重さで受け取ってしまう。
 */
export const MIN_CONFIDENCE = 0.6;

/** 1件の長さ。長い文は、要約ではなく書き起こしになっている */
const MAX_BODY = 120;
const MAX_QUOTE = 200;
const MAX_OPINION = 200;
const MAX_SUMMARY = 300;

/** 1回の通話から取り出してよい件数。多すぎるのは、刻みすぎ */
const MAX_ITEMS = 8;

export type Rejected = { ok: false; why: string };
export type Accepted = { ok: true; value: TalkUpdate; dropped: string[] };

function str(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  const t = x.trim();
  if (!t || t.length > max) return null;
  return t;
}

function list(x: unknown): unknown[] {
  return Array.isArray(x) ? x.slice(0, MAX_ITEMS) : [];
}

/**
 * AIが返したものを受け取る。
 *
 * 形が違うものは捨てる。捨てたものは dropped に残して、
 * あとから「何が落ちたか」を見られるようにする
 * （黙って消すと、出ないことに気づけない）。
 */
export function readTalkUpdate(raw: unknown): Accepted | Rejected {
  if (!raw || typeof raw !== "object") return { ok: false, why: "JSONではありません" };
  const o = raw as Record<string, unknown>;
  const dropped: string[] = [];

  // 相手の気持ちを当てる言い方は、どこに入っていても落とす。
  const clean = (t: string, where: string): boolean => {
    if (MIND_READING.test(t)) {
      dropped.push(`${where}「${t}」が相手の気持ちの判定になっている`);
      return false;
    }
    return true;
  };

  // ── 事実。引用が無ければ事実にしない ──────────────
  const facts: Fact[] = [];
  for (const x of list(o.facts)) {
    const f = x as Record<string, unknown>;
    const body = str(f.body, MAX_BODY);
    const quote = str(f.quote, MAX_QUOTE);
    if (!body) continue;
    if (!quote) {
      // ここが肝。引用の無い「事実」は、AIが作った話かもしれない。
      dropped.push(`事実「${body}」に、元の発言が無い`);
      continue;
    }
    if (!clean(body, "事実")) continue;
    facts.push({ body, quote });
  }

  // ── 相談者自身の気持ち ──────────────────────────
  const feelings: string[] = [];
  for (const x of list(o.feelings)) {
    const t = str(x, MAX_BODY);
    if (t) feelings.push(t);
  }

  // ── 回答者が言ったこと。言い換えすぎない ──────────
  const opinions: string[] = [];
  for (const x of list(o.opinions)) {
    const t = str(x, MAX_OPINION);
    if (t && clean(t, "回答者の言葉")) opinions.push(t);
  }

  // ── AIの推測。確からしさが無ければ捨てる ──────────
  const inferences: Inference[] = [];
  for (const x of list(o.inferences)) {
    const i = x as Record<string, unknown>;
    const body = str(i.body, MAX_BODY);
    const c = typeof i.confidence === "number" ? i.confidence : null;
    if (!body) continue;
    if (c === null || c < 0 || c > 1) {
      dropped.push(`推測「${body}」に、確からしさが無い`);
      continue;
    }
    if (c < MIN_CONFIDENCE) {
      dropped.push(`推測「${body}」の確からしさが ${c.toFixed(2)}`);
      continue;
    }
    if (!clean(body, "推測")) continue;
    inferences.push({ body, confidence: c });
  }

  // ── 段階。知らない語は受け取らない ────────────────
  let stageUpdate: TalkUpdate["stageUpdate"] = null;
  const su = o.stageUpdate ?? o.stage_update;
  if (su && typeof su === "object") {
    const s = su as Record<string, unknown>;
    const c = typeof s.confidence === "number" ? s.confidence : null;
    if (isStage(s.from) && isStage(s.to) && c !== null && c >= MIN_CONFIDENCE) {
      stageUpdate = { from: s.from, to: s.to, confidence: c };
    } else {
      dropped.push("段階の更新が、受け取れる形ではない");
    }
  }

  // ── 次の予定 ────────────────────────────────────
  let nextDateUpdate: TalkUpdate["nextDateUpdate"] = null;
  const nd = o.nextDateUpdate ?? o.next_date_update;
  if (nd && typeof nd === "object") {
    const n = nd as Record<string, unknown>;
    const st = n.status;
    const okStatus = st === "confirmed" || st === "proposed" || st === "none";
    const date =
      typeof n.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(n.date) ? n.date : null;
    if (okStatus) nextDateUpdate = { date, status: st };
    else dropped.push("次の予定が、受け取れる形ではない");
  }

  const take = (v: unknown, max = MAX_BODY) =>
    list(v)
      .map((x) => str(x, max))
      .filter((t): t is string => t !== null);

  const concernsAdd = take(o.concernsAdd ?? o.concerns_add).filter((t) => clean(t, "気になること"));
  const signalsAdd = take(o.signalsAdd ?? o.signals_add).filter((t) => clean(t, "良かったこと"));
  const topicsToConfirm = take(o.topicsToConfirm ?? o.topics_to_confirm);

  const nextAction = str(o.nextAction ?? o.next_action, MAX_BODY) ?? "";
  const summary = str(o.summary, MAX_SUMMARY) ?? "";

  // 何も残らなかったなら、受け取らない。
  // 空の更新を本体に入れると、「整理された」と見えて中身が無い。
  const any =
    facts.length || feelings.length || opinions.length || inferences.length ||
    stageUpdate || nextDateUpdate || concernsAdd.length || signalsAdd.length || nextAction;
  if (!any) return { ok: false, why: "取り出せたものがありません" };

  return {
    ok: true,
    dropped,
    value: {
      facts, feelings, opinions, inferences,
      stageUpdate, nextDateUpdate,
      concernsAdd, signalsAdd, topicsToConfirm,
      nextAction, summary,
    },
  };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 段階の語彙が、DBの check と同じであること。
  // ずれると、保存しようとして弾かれる（買った人の更新が消える）。
  if (STAGES.length !== 11) {
    throw new Error(`段階が ${STAGES.length} 個あります（schema.sql と合わせてください）`);
  }
  if (STAGES[0] !== "matched" || STAGES[STAGES.length - 1] !== "ended") {
    throw new Error("段階の最初と最後が、想定と違います");
  }

  // 引用の無い「事実」を受け取らないこと。ここが抜けると、
  // AIが作った話が「前回こうだった」として次へ渡っていく。
  const noQuote = readTalkUpdate({
    facts: [{ body: "2回目のデートが終わった" }],
    nextAction: "次の日程を決める",
  });
  if (noQuote.ok && noQuote.value.facts.length > 0) {
    throw new Error("引用の無い事実を受け取っています");
  }

  // 確からしさの低い推測を出さないこと。
  const weak = readTalkUpdate({
    inferences: [{ body: "少し距離を置きたいのかもしれない", confidence: 0.3 }],
    nextAction: "様子を見る",
  });
  if (weak.ok && weak.value.inferences.length > 0) {
    throw new Error("確からしさの低い推測を受け取っています");
  }

  // 相手の気持ちを当てる言い方を、どこからも入れないこと。
  const mind = readTalkUpdate({
    inferences: [{ body: "脈ありだと思われる", confidence: 0.9 }],
    nextAction: "誘う",
  });
  if (mind.ok && mind.value.inferences.length > 0) {
    throw new Error("相手の気持ちの判定を受け取っています");
  }

  // 知らない段階を受け取らないこと。
  const badStage = readTalkUpdate({
    stageUpdate: { from: "matched", to: "こくはく", confidence: 0.9 },
    nextAction: "決める",
  });
  if (badStage.ok && badStage.value.stageUpdate !== null) {
    throw new Error("知らない段階を受け取っています");
  }

  // 正しい形は、ちゃんと通ること。
  const good = readTalkUpdate({
    facts: [{ body: "2回目のデートが終わった", quote: "先週、2回目行ってきました" }],
    feelings: ["次も会いたいと思っている"],
    opinions: ["日程を先に出したほうが、相手は返しやすいと思います"],
    inferences: [{ body: "日程が決まっていないことが、止まっている原因", confidence: 0.8 }],
    stageUpdate: { from: "first_date_completed", to: "second_date_completed", confidence: 0.9 },
    nextDateUpdate: { date: "2026-10-10", status: "proposed" },
    nextAction: "次回の日程を具体化する",
    summary: "2回目まで進んでいる。日程が決まっていない。",
  });
  if (!good.ok) throw new Error(`正しい形が通りません（${good.why}）`);
  if (good.value.facts.length !== 1) throw new Error("事実が取れていません");
  if (good.value.stageUpdate?.to !== "second_date_completed") {
    throw new Error("段階が取れていません");
  }
  if (good.value.nextDateUpdate?.date !== "2026-10-10") {
    throw new Error("次の予定が取れていません");
  }

  // 中身が空なら、受け取らないこと。
  if (readTalkUpdate({}).ok) throw new Error("空の更新を受け取っています");
}
