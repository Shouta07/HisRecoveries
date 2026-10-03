import type { TalkUpdate } from "../talk/shape";
import { STAGE_LABEL } from "../talk/diff";
import { decisionPoints, askLineFor } from "./decide";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   話したあとに出す、状況のカード
   ══════════════════════════════════════════════════

   ── JSON を見せない ─────────────────────────────
   会話から取り出したものは、中では構造になっている
   （talk/shape.ts の TalkUpdate）。
   それをそのまま出すと、設定画面を読まされているのと同じになる。

   出すのは、読んで分かる1枚。

     Aさんとの状況
     初回デート後 ／ 次は2回目の誘いを検討中

     いまの傾向          …
     相手との変化        …
     次に確かめたいこと  …
     次の一手            …

   ── 話していないことを、書かない ────────────────
   事実には引用（本人が実際に言った言葉）が要る。
   引用の無いものは、取り出す段階で捨てている（shape.ts）。

   ここでは、残ったものを「言ったこと」と「こちらの見立て」に
   分けて出す。混ぜると、本人が言っていないことまで
   事実として読まれる。

   ── 相手の気持ちを、当てない ────────────────────
   「脈あり」「本命」は書かない（利用規約 第12条）。
   相手がどう受け取ったかは、実在の異性に聞く。
   そこは「次に確かめたいこと」に回る。

   ── 次の一手は、1つ ─────────────────────────────
   3つ並べると、どれもやらない。 */

/** 1行の出どころ。画面で見え方を変える */
export type Source = "said" | "guess";

export type CardRow = {
  label: string;
  body: string;
  source: Source;
};

export type SituationCard = {
  /** 「Aさん」。呼び名。本名は扱わない */
  who: string;
  /** 見出しの下の1行。段階と、いま迷っていること */
  line: string;
  rows: CardRow[];
  /** 次に確かめたいこと。人に聞くものには印が付く */
  toConfirm: { text: string; needsHuman: boolean }[];
  /** 次の一手。1つだけ */
  next: string | null;
};

const LABEL_TREND = "いまの傾向";
const LABEL_CHANGE = "相手との変化";
const LABEL_NEXT = "次の一手";

/** 長い行は切る。カードは1枚で読み切れること */
const BODY_MAX = 60;
const ROW_MAX = 4;

function trim(x: string): string {
  const t = x.trim();
  return t.length > BODY_MAX ? `${t.slice(0, BODY_MAX)}…` : t;
}

/**
 * 会話から取り出したものを、1枚のカードにする。
 *
 * ここでAIを呼ばない。すでに構造になっているものを並べ替えるだけ。
 */
export function cardOf(
  u: TalkUpdate,
  opts: { who: string; stage?: string | null },
): SituationCard {
  const rows: CardRow[] = [];

  /* いまの傾向。
     本人が話した「気になっている」「よかった」を、そのまま出す。
     こちらの判定は混ぜない。 */
  for (const t of [...u.signalsAdd, ...u.concernsAdd].slice(0, ROW_MAX)) {
    rows.push({ label: LABEL_TREND, body: trim(t), source: "said" });
  }

  /* 相手との変化。
     引用のある事実だけ。引用が無いものは shape.ts が捨てている。 */
  for (const f of u.facts.slice(0, ROW_MAX)) {
    rows.push({ label: LABEL_CHANGE, body: trim(f.body), source: "said" });
  }

  /* こちらの見立ては、分けて出す。
     確からしさが足りないものは、ここへ来る前に捨てられている。 */
  for (const i of u.inferences.slice(0, 2)) {
    rows.push({ label: LABEL_CHANGE, body: trim(i.body), source: "guess" });
  }

  /* 次に確かめたいこと。
     人に回すかどうかは decide.ts が規則で決める。
     「相手がどう受け取るか」はこちらでは答えられないので人へ。 */
  const points = decisionPoints(u);
  const toConfirm = points.map((d) => ({
    text: d.needsHumanReview ? askLineFor(d) : d.description,
    needsHuman: d.needsHumanReview,
  }));

  const next = u.nextAction.trim() ? trim(u.nextAction) : null;
  if (next) rows.push({ label: LABEL_NEXT, body: next, source: "said" });

  /* 見出しの下の1行。
     段階と、いま迷っていることを「／」でつなぐ。
     長い説明にしない。開いて2秒で現在地が分かること。 */
  const parts: string[] = [];
  const stage = opts.stage && STAGE_LABEL[opts.stage as keyof typeof STAGE_LABEL];
  if (stage) parts.push(stage);
  if (points[0]) parts.push(`次は${points[0].title}を検討中`);
  else if (next) parts.push(`次は${next}`);

  return {
    who: opts.who,
    line: parts.join(" ／ "),
    rows,
    toConfirm,
    next,
  };
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const base: TalkUpdate = {
    facts: [], feelings: [], opinions: [], inferences: [],
    stageUpdate: null, nextDateUpdate: null,
    concernsAdd: [], signalsAdd: [], topicsToConfirm: [],
    nextAction: "", summary: "",
  };

  const sample: TalkUpdate = {
    ...base,
    facts: [{ body: "初回デートが終わった", quote: "先週デート行ってきた" }],
    concernsAdd: ["返信が前より遅い"],
    signalsAdd: ["向こうから次の話が出た"],
    topicsToConfirm: ["2回目をどう誘うか", "相手の温度感"],
    nextAction: "2回目の日程を出す",
  };
  const c = cardOf(sample, { who: "Aさん", stage: "first_date_completed" });

  /* 構造の名前が、そのまま画面に出ないこと。
     ここが漏れると、設定画面を読ませることになる。 */
  const flat = JSON.stringify(c);
  for (const key of [
    "facts", "feelings", "opinions", "inferences",
    "concernsAdd", "signalsAdd", "topicsToConfirm", "stageUpdate", "nextDateUpdate",
  ]) {
    if (flat.includes(key)) {
      throw new Error(`カードに、中の構造の名前（${key}）が出ています`);
    }
  }

  // 現在地が、1行で出ること。
  if (!c.line.includes(STAGE_LABEL.first_date_completed)) {
    throw new Error(`カードの1行目に、いまの段階が入っていません（${c.line}）`);
  }

  /* 相手の気持ちを当てる書き方をしないこと（利用規約 第12条）。
     カードはいちばん読まれる場所なので、ここで止める。 */
  for (const t of [c.line, ...c.rows.map((r) => r.body), ...c.toConfirm.map((x) => x.text)]) {
    if (MIND_READING.test(t)) {
      throw new Error(`カードの「${t}」が、相手の気持ちの判定になっています`);
    }
  }

  /* 言ったことと、こちらの見立てが、分かれていること。
     混ぜると、本人が言っていないことまで事実として読まれる。 */
  {
    const withGuess = cardOf(
      { ...sample, inferences: [{ body: "日程が決まっていないことが止まっている原因", confidence: 0.8 }] },
      { who: "Aさん", stage: "first_date_completed" },
    );
    const g = withGuess.rows.filter((r) => r.source === "guess");
    if (g.length === 0) throw new Error("こちらの見立てが、言ったことと分かれていません");
    for (const r of withGuess.rows.filter((x) => x.source === "said")) {
      if (g.some((x) => x.body === r.body)) {
        throw new Error("同じ行が、言ったことと見立ての両方に出ています");
      }
    }
  }

  /* 相手がどう受け取るかは、人に回ること。
     ここを恋亀が答えると、AIが気持ちを当てる製品になる。 */
  {
    const human = c.toConfirm.filter((x) => x.needsHuman);
    if (human.length === 0) {
      throw new Error("「相手の温度感」が、人に回っていません");
    }
  }

  // 次の一手は1つだけ。3つ並べると、どれもやらない。
  {
    const nexts = c.rows.filter((r) => r.label === LABEL_NEXT);
    if (nexts.length > 1) throw new Error(`次の一手が ${nexts.length} 個あります（1つ）`);
    if (c.next && /[、,]|および/.test(c.next)) {
      throw new Error(`次の一手が1つになっていません（${c.next}）`);
    }
  }

  // 何も話していないなら、カードを作らないこと。
  {
    const empty = cardOf(base, { who: "Aさん" });
    if (empty.rows.length !== 0) {
      throw new Error("話していないのに、カードに行ができています");
    }
  }

  // 1枚で読み切れること。行が多いと、どれも読まれない。
  if (c.rows.length > 10) {
    throw new Error(`カードの行が ${c.rows.length} 行あります（多すぎます）`);
  }
}
