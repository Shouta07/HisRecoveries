import type { Masked } from "./mask";
import { readTalkUpdate, type TalkUpdate } from "../talk/shape";
import { VERSION } from "./prompt";

/* ══════════════════════════════════════════════════
   話したことを、残せる形にする
   ══════════════════════════════════════════════════

   ── 伏せ忘れを、型で止める ──────────────────────
   この関数は Masked しか受け取らない。
   生の文字起こしを渡すと、ビルドが落ちる。

   「伏せてから渡すこと」と書くだけでは、いつか忘れる。
   忘れたことは、漏れるまで分からない。

   ── 分けたまま持つ ──────────────────────────────
   FACT          起きたこと。発言の引用がある
   USER_FEELING  本人の気持ち
   HUMAN_OPINION 人（回答者）が言ったこと
   AI_INFERENCE  AIの推測
   NEXT_ACTION   次にやること

   混ぜない。混ぜた時点で、AIの当て推量が
   「前回こうだった」として次の相談に渡っていく。

   ── ここでAIを呼ばない ──────────────────────────
   呼ぶのは外側。ここは、返ってきたものを受け取る側。
   分けておくと、キーが無くても全部試せる。 */

export type ExtractInput = {
  /** 伏せ字を通した文字起こし。生のものは型が通らない */
  transcript: Masked;
  /** どの版の恋亀と話したか */
  promptVersion: string;
};

export type Episode = {
  /** 「2回目デート」のような短い名前 */
  title: string;
  summary: string;
  /** 次にやること。1つだけ */
  nextAction: string;
};

export type Note = {
  kind: "fact" | "feeling" | "opinion" | "inference" | "action";
  body: string;
  quote?: string;
  confidence?: number;
};

export type Extracted = {
  episode: Episode;
  notes: Note[];
  /** 捨てたもの。黙って消さない */
  dropped: string[];
  promptVersion: string;
};

/** 見出しを短くする。長いと一覧で折り返して読めない */
const TITLE_MAX = 24;

/**
 * AIが返したものを、残せる形にする。
 *
 * raw は、AIの出力（JSON）。文字起こしそのものではない。
 * 文字起こしは、呼ぶ側が Masked にしてからAIへ渡す。
 */
export function extract(input: ExtractInput, raw: unknown): Extracted | { error: string } {
  const read = readTalkUpdate(raw);
  if (!read.ok) return { error: read.why };

  const u: TalkUpdate = read.value;

  // 見出し。段階が変わったならそれ、無ければ最初の事実から。
  let title = u.stageUpdate ? stageTitle(u.stageUpdate.to) : (u.facts[0]?.body ?? "話した");
  if (title.length > TITLE_MAX) title = title.slice(0, TITLE_MAX);

  const notes: Note[] = [
    ...u.facts.map((f): Note => ({ kind: "fact", body: f.body, quote: f.quote })),
    ...u.feelings.map((b): Note => ({ kind: "feeling", body: b })),
    ...u.opinions.map((b): Note => ({ kind: "opinion", body: b })),
    ...u.inferences.map((i): Note => ({
      kind: "inference",
      body: i.body,
      confidence: i.confidence,
    })),
  ];
  if (u.nextAction) notes.push({ kind: "action", body: u.nextAction });

  return {
    episode: { title, summary: u.summary, nextAction: u.nextAction },
    notes,
    dropped: read.dropped,
    promptVersion: input.promptVersion,
  };
}

/** 段階から、見出しの言葉を作る */
function stageTitle(stage: string): string {
  const M: Record<string, string> = {
    matched: "マッチ",
    messaging: "やりとり",
    calling: "電話した",
    first_date_scheduled: "初デートの約束",
    first_date_completed: "初デート",
    second_date_scheduled: "2回目の約束",
    second_date_completed: "2回目デート",
    third_date_plus: "3回目",
    relationship_decision: "決めるところ",
    dating: "交際開始",
    ended: "終わり",
  };
  return M[stage] ?? "話した";
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 試すときだけ、伏せ字を通したことにする
  const asMasked = (s: string) => s as Masked;
  const input: ExtractInput = { transcript: asMasked(""), promptVersion: VERSION };

  const good = extract(input, {
    facts: [{ body: "2回目のデートに行った", quote: "昨日2回目行ってきた" }],
    feelings: ["また会いたいと思っている"],
    opinions: ["日程を先に出したほうが返しやすいと思います"],
    inferences: [{ body: "日程が決まっていないのが止まっている理由", confidence: 0.8 }],
    stageUpdate: { from: "first_date_completed", to: "second_date_completed", confidence: 0.9 },
    nextAction: "水族館の日程を決める",
    summary: "2回目まで進んだ。日程がまだ。",
  });
  if ("error" in good) throw new Error(`正しい形が通りません（${good.error}）`);

  // 種類が、混ざらずに分かれていること。
  // ここが混ざると、AIの推測が事実として次へ渡っていく。
  const kinds = good.notes.map((n) => n.kind);
  for (const k of ["fact", "feeling", "opinion", "inference", "action"]) {
    if (!kinds.includes(k as Note["kind"])) {
      throw new Error(`「${k}」が残っていません`);
    }
  }
  // 事実には引用が、推測には確からしさが付いていること。
  for (const n of good.notes) {
    if (n.kind === "fact" && !n.quote) throw new Error(`事実「${n.body}」に引用がありません`);
    if (n.kind === "inference" && typeof n.confidence !== "number") {
      throw new Error(`推測「${n.body}」に確からしさがありません`);
    }
    // 推測に引用が付いていないこと（付くと、言われたことに見える）
    if (n.kind === "inference" && n.quote) {
      throw new Error(`推測「${n.body}」に引用が付いています`);
    }
  }

  // 見出しが、段階から作られること。
  if (good.episode.title !== "2回目デート") {
    throw new Error(`見出しが「${good.episode.title}」になっています`);
  }
  // 見出しが長くならないこと。
  if (good.episode.title.length > TITLE_MAX) throw new Error("見出しが長すぎます");

  // 次にやることが、1つだけ残ること。
  if (good.episode.nextAction !== "水族館の日程を決める") {
    throw new Error("次にやることが取れていません");
  }

  // どの版の恋亀かが、残ること。
  if (good.promptVersion !== VERSION) throw new Error("恋亀の版が残っていません");

  // 受け取れないものは、理由を返すこと。黙って空を返さない。
  const bad = extract(input, { facts: [{ body: "引用の無い事実" }] });
  if (!("error" in bad)) throw new Error("取り出せないのに、通っています");

  // 捨てたものが、残ること。
  const dropped = extract(input, {
    facts: [{ body: "引用が無い", quote: "" }],
    inferences: [{ body: "自信が無い推測", confidence: 0.2 }],
    nextAction: "様子を見る",
  });
  if ("error" in dropped) throw new Error("通るはずのものが落ちています");
  if (dropped.dropped.length < 2) {
    throw new Error("捨てたものが、記録に残っていません");
  }

  // 段階が無いときも、見出しが付くこと。
  const noStage = extract(input, {
    facts: [{ body: "久しぶりに連絡が来た", quote: "昨日ひさしぶりに連絡きて" }],
    nextAction: "返事を考える",
  });
  if ("error" in noStage) throw new Error("段階が無いと通りません");
  if (!noStage.episode.title) throw new Error("段階が無いと、見出しが空になります");
}
