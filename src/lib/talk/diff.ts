import { MIN_CONFIDENCE, type TalkUpdate, type Stage } from "./shape";

/* ══════════════════════════════════════════════════
   今回の相談から、何がどう変わるか
   ══════════════════════════════════════════════════

   ── 押すまで、本体を変えない ────────────────────
   利用者は管理表を書かない。だから相手カードに残るものは、
   ほぼ全部 AI が文字起こしから取り出したものになる。

   そのまま書き込むと、間違いに気づく機会が無い。
   しかも次の相談で、回答者に「前回までの経緯」として渡る。
   1回の読み間違いが、何回も引き継がれる。

   だから、一度ここに出す。利用者が見て、押してから入る。

   ── 変わらなかったものも出す ────────────────────
   変わったところだけ出すと、「見ていないところがある」と思われる。
   変わらなかったことも「変更なし」と出す。
   そのほうが、何を見たのかが伝わる。

   ── 事実と推測を、同じ見た目にしない ──────────────
   「2回目のデートが終わった」（本人がそう言った）と
   「返信が遅いのは忙しいからかもしれない」（AIがそう考えた）を
   同じ行で並べると、どちらも同じ重さで受け取られる。

   出どころを必ず付ける。
     said   本人が話した。引用がある
     human  回答者（人）が言った
     guess  AIの推測。確からしさを持つ

   guess は、既定で「入れない」にする。
   押せば入るが、黙っては入らない。 */

export type Source = "said" | "human" | "guess";

export type Change = {
  /** 相手カードのどの欄か */
  field: string;
  /** 画面に出す名前 */
  label: string;
  /** いまの値。無ければ null */
  from: string | null;
  /** 変わったあとの値。変わらないなら from と同じ */
  to: string | null;
  /** 変わるのかどうか */
  changed: boolean;
  source: Source;
  /** guess のときだけ */
  confidence?: number;
  /** 既定で反映するか。guess は false */
  onByDefault: boolean;
};

export type CaseNow = {
  stage: Stage | null;
  stageLabel: string | null;
  nextDate: string | null;
  nextDateStatus: string | null;
  nextAction: string | null;
  concerns: string[];
};

/** 段階の、画面に出す名前 */
export const STAGE_LABEL: Record<Stage, string> = {
  matched: "マッチした",
  messaging: "やりとり中",
  calling: "電話した",
  first_date_scheduled: "初回デートの予定",
  first_date_completed: "初回デート済み",
  second_date_scheduled: "2回目の予定",
  second_date_completed: "2回目デート済み",
  third_date_plus: "3回目以降",
  relationship_decision: "付き合うか決めるところ",
  dating: "交際中",
  ended: "終わった",
};

function fmtDate(d: string | null): string | null {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return `${Number(m[2])}月${Number(m[3])}日`;
}

/**
 * いまの相手カードと、今回の相談から取り出したものを突き合わせる。
 *
 * ここでは保存しない。出すものを作るだけ。
 */
export function diff(now: CaseNow, up: TalkUpdate): Change[] {
  const out: Change[] = [];

  // ── 段階 ────────────────────────────────────────
  // 本人が話した事実から変わるので said。
  // ただし確からしさが足りなければ、そもそも shape.ts で落ちている。
  {
    const to = up.stageUpdate?.to ?? null;
    const changed = Boolean(to && to !== now.stage);
    out.push({
      field: "stage",
      label: "どこまで進んだか",
      from: now.stageLabel,
      to: changed && to ? STAGE_LABEL[to] : now.stageLabel,
      changed,
      source: "said",
      onByDefault: true,
    });
  }

  // ── 次の予定 ────────────────────────────────────
  {
    const d = up.nextDateUpdate;
    const to = d?.status === "none" ? null : (d?.date ?? now.nextDate);
    const changed = Boolean(d) && to !== now.nextDate;
    out.push({
      field: "next_date",
      label: "次の予定",
      from: fmtDate(now.nextDate),
      to: fmtDate(to),
      changed,
      source: "said",
      onByDefault: true,
    });
  }

  // ── 次にやること ────────────────────────────────
  // ここは回答者が言ったことから出る。だから human。
  {
    const to = up.nextAction || now.nextAction;
    const changed = Boolean(up.nextAction) && up.nextAction !== now.nextAction;
    out.push({
      field: "next_action",
      label: "次にやること",
      from: now.nextAction,
      to,
      changed,
      source: "human",
      onByDefault: true,
    });
  }

  // ── 気になっていること ──────────────────────────
  // 足すだけ。消さない。消すのは本人がやること。
  for (const c of up.concernsAdd) {
    if (now.concerns.includes(c)) continue;
    out.push({
      field: "concern",
      label: "気になっていること",
      from: null,
      to: c,
      changed: true,
      source: "said",
      onByDefault: true,
    });
  }

  // ── AIの推測 ────────────────────────────────────
  // 既定で入れない。押したときだけ入る。
  for (const i of up.inferences) {
    out.push({
      field: "inference",
      label: "こうかもしれない",
      from: null,
      to: i.body,
      changed: true,
      source: "guess",
      confidence: i.confidence,
      onByDefault: false,
    });
  }

  return out;
}

/** 画面に出す、出どころの名前 */
export const SOURCE_LABEL: Record<Source, string> = {
  said: "話した内容から",
  human: "回答者の言葉から",
  guess: "推測",
};

/* ── 公開の前に止めること ───────────────────────── */
{
  const now: CaseNow = {
    stage: "first_date_completed",
    stageLabel: STAGE_LABEL.first_date_completed,
    nextDate: null,
    nextDateStatus: null,
    nextAction: null,
    concerns: ["返信が遅い"],
  };
  const up: TalkUpdate = {
    facts: [{ body: "2回目が終わった", quote: "先週2回目行ってきました" }],
    feelings: [],
    opinions: [],
    inferences: [{ body: "日程が決まっていないのが原因かもしれない", confidence: 0.8 }],
    stageUpdate: { from: "first_date_completed", to: "second_date_completed", confidence: 0.9 },
    nextDateUpdate: { date: "2026-10-10", status: "proposed" },
    concernsAdd: ["返信が遅い"],
    signalsAdd: [],
    topicsToConfirm: [],
    nextAction: "次回の日程を具体化する",
    summary: "",
  };
  const d = diff(now, up);

  // 推測が、黙って入らないこと。ここが抜けると、
  // AIの当て推量が「前回こうだった」として次の相談へ渡っていく。
  for (const c of d) {
    if (c.source === "guess" && c.onByDefault) {
      throw new Error(`推測「${c.to}」が、既定で入るようになっています`);
    }
  }

  // 推測には、必ず確からしさが付いていること。
  for (const c of d) {
    if (c.source === "guess" && typeof c.confidence !== "number") {
      throw new Error(`推測「${c.to}」に、確からしさがありません`);
    }
    if (c.source === "guess" && (c.confidence ?? 0) < MIN_CONFIDENCE) {
      throw new Error(`確からしさの足りない推測「${c.to}」が出ています`);
    }
  }

  /* 決まった3つは、変わっても変わらなくても必ず出すこと。

     最初ここを「変わらなかった行が1つはある」と書いていたが、
     それは成り立たない。全部変わる相談もある。

     守りたいのは「出す項目が、変化の有無で増えたり減ったりしない」こと。
     変わったところだけ出すと、見ていないところがあると思われる。 */
  for (const f of ["stage", "next_date", "next_action"]) {
    if (!d.some((c) => c.field === f)) {
      throw new Error(`「${f}」が、確認する一覧に出ていません`);
    }
  }
  // 何も変わらない相談でも、同じ3つが出ること。
  {
    const none = diff(now, {
      facts: [], feelings: [], opinions: [], inferences: [],
      stageUpdate: null, nextDateUpdate: null,
      concernsAdd: [], signalsAdd: [], topicsToConfirm: [],
      nextAction: "", summary: "",
    });
    for (const f of ["stage", "next_date", "next_action"]) {
      const row = none.find((c) => c.field === f);
      if (!row) throw new Error(`何も変わらないときに「${f}」が出ていません`);
      if (row.changed) throw new Error(`何も変わらないのに「${f}」が変わったことになっています`);
    }
    if (none.some((c) => c.source === "guess")) {
      throw new Error("推測が無いのに、推測の行が出ています");
    }
  }

  // 同じことを2回足さないこと。
  // すでに「返信が遅い」があるのに、もう1行増やさない。
  if (d.filter((c) => c.field === "concern" && c.to === "返信が遅い").length > 0) {
    throw new Error("すでにあるものを、もう一度足そうとしています");
  }

  // 段階が、ちゃんと変わること。
  const st = d.find((c) => c.field === "stage");
  if (!st?.changed || st.to !== STAGE_LABEL.second_date_completed) {
    throw new Error("段階の変化が取れていません");
  }

  // 次の予定が、日付の形で出ること。
  const nd = d.find((c) => c.field === "next_date");
  if (nd?.to !== "10月10日") throw new Error(`次の予定が「${nd?.to}」になっています`);

  // 段階の名前が、全部そろっていること。
  // 抜けると、画面に undefined が出る。
  for (const k of Object.keys(STAGE_LABEL)) {
    if (!STAGE_LABEL[k as Stage]) throw new Error(`段階「${k}」に、画面に出す名前がありません`);
  }

  // 出どころの名前が、全部そろっていること。
  for (const s of ["said", "human", "guess"] as const) {
    if (!SOURCE_LABEL[s]) throw new Error(`出どころ「${s}」に、画面に出す名前がありません`);
  }
  // 推測は「推測」と書くこと。言い換えてぼかさない。
  if (SOURCE_LABEL.guess !== "推測") {
    throw new Error("推測の出どころが「推測」になっていません");
  }
}
