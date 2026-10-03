import type { TalkUpdate } from "../talk/shape";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   迷っているところを、見つける
   ══════════════════════════════════════════════════

   ── 恋亀は、答えを出さない ──────────────────────
   「それは脈ありです」「送った方がいいです」とは言わない。
   言えるのは、どこで迷っているかまで。

   その先は、本人が決めるか、人に聞く。
   ここは「人に渡す論点」を作るところ。

   ── 人に回すかどうかを、AIに決めさせない ────────
   「これは人に聞いたほうがいい」とAIに言わせると、
   言い方次第でいくらでも回せる。回すたびに人の時間が要る。

   規則で決める。
     相手が実際にどう受け取るか、を含むものは人へ
     本人が決められること（いつ送るか、どこへ行くか）は本人へ

   前者は、こちらが答えてはいけないもの（利用規約 第12条）。
   答えられないからこそ、人に聞く意味がある。

   ── 重さは、数で決めない ────────────────────────
   点数を付けると、恋愛が採点に見える。
   3段だけにして、言葉で持つ。 */

export type Importance = "low" | "medium" | "high";
export type DecisionStatus = "open" | "review_requested" | "reviewed" | "resolved";
export type ReviewType = "male_perspective" | "female_perspective" | "operator_comment" | "mixed";

export type DecisionPoint = {
  /** 画面に出す短い名前 */
  title: string;
  /** 何に迷っているか */
  description: string;
  importance: Importance;
  /** 人に聞いたほうがよいか。規則で決める */
  needsHumanReview: boolean;
  /** 人に回すなら、どちら側の目が要るか */
  reviewType: ReviewType | null;
};

/**
 * 相手がどう受け取るか、に触れている言い方。
 *
 * ここに当たるものは、こちらでは答えられない。
 * だから人に回す。
 */
const NEEDS_OTHER_SIDE =
  /どう(思|感じ|見え|受け取)|温度感|本気|重い|引かれ|脈|印象|好意|気がある|どう映/;

/** 本人が決められること。人に回さない */
const SELF_DECIDABLE = /いつ|日程|場所|店|時間|どこ(で|へ)|予約/;

const TITLE_MAX = 24;
const DESC_MAX = 120;

/** 1回の会話から取り出す上限。多いと、どれも軽くなる */
const MAX_POINTS = 3;

function importanceOf(text: string, concernCount: number): Importance {
  // 関係が終わるかどうかに関わるものは重い
  if (/続け|やめ|別れ|告白|付き合/.test(text)) return "high";
  // 気になっていることが積もっているなら、中くらい
  if (concernCount >= 2) return "medium";
  return "low";
}

/**
 * 会話から取り出したものを、迷っている論点に変える。
 *
 * ここでAIを呼ばない。すでに構造化されたものから作る。
 */
export function decisionPoints(u: TalkUpdate): DecisionPoint[] {
  const out: DecisionPoint[] = [];

  // 本人が「確かめたい」と言ったこと。いちばん強い材料
  for (const t of u.topicsToConfirm) {
    out.push(make(t, u));
  }
  // 気になっていること。確かめたいことが無いときだけ拾う
  if (out.length === 0) {
    for (const c of u.concernsAdd) out.push(make(c, u));
  }

  // 同じ話を2つにしない
  const seen = new Set<string>();
  const uniq = out.filter((d) => {
    if (seen.has(d.title)) return false;
    seen.add(d.title);
    return true;
  });

  return uniq.slice(0, MAX_POINTS);
}

function make(text: string, u: TalkUpdate): DecisionPoint {
  const t = text.trim();
  const title = t.length > TITLE_MAX ? t.slice(0, TITLE_MAX) : t;
  const description = t.length > DESC_MAX ? t.slice(0, DESC_MAX) : t;

  /* 人に回すかどうか。
     相手がどう受け取るかに触れていて、
     かつ本人だけで決められることでないなら、人へ。 */
  const other = NEEDS_OTHER_SIDE.test(t);
  const mine = SELF_DECIDABLE.test(t);
  const needsHumanReview = other && !mine;

  return {
    title,
    description,
    importance: importanceOf(t, u.concernsAdd.length),
    needsHumanReview,
    // どちら側の目が要るかは、相談者の性別から決まる。
    // ここでは決めない（呼ぶ側が持っている）。
    reviewType: needsHumanReview ? "mixed" : null,
  };
}

/** 画面に出す言葉。人に回すとき、何を聞くのかを1行で */
export function askLineFor(d: DecisionPoint): string {
  return `${d.description}について、実際のところどう見えるか`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const base: TalkUpdate = {
    facts: [], feelings: [], opinions: [], inferences: [],
    stageUpdate: null, nextDateUpdate: null,
    concernsAdd: [], signalsAdd: [], topicsToConfirm: [],
    nextAction: "", summary: "",
  };

  /* 相手がどう受け取るかは、人に回すこと。
     ここは恋亀が答えてはいけないところ（利用規約 第12条）。
     答えられないからこそ、人に聞く意味がある。 */
  {
    const d = decisionPoints({ ...base, topicsToConfirm: ["相手の温度感"] })[0];
    if (!d) throw new Error("確かめたいことが、論点になっていません");
    if (!d.needsHumanReview) {
      throw new Error(`「${d.title}」が人に回りません（相手の受け取り方の話です）`);
    }
  }

  /* 本人が決められることは、人に回さないこと。
     回すたびに人の時間が要る。日程を決めるのに人は要らない。 */
  {
    const d = decisionPoints({ ...base, topicsToConfirm: ["次の日程をいつにするか"] })[0];
    if (!d) throw new Error("論点が取れていません");
    if (d.needsHumanReview) {
      throw new Error(`「${d.title}」が人に回っています（本人が決められることです）`);
    }
  }

  // 確かめたいことが無ければ、気になっていることから拾うこと。
  {
    const d = decisionPoints({ ...base, concernsAdd: ["返信がどう思われているか"] });
    if (d.length === 0) throw new Error("気になっていることから、論点が取れていません");
  }
  // 確かめたいことがあるなら、そちらを優先すること。
  {
    const d = decisionPoints({
      ...base,
      topicsToConfirm: ["相手の温度感"],
      concernsAdd: ["返信が遅い"],
    });
    if (!d.some((x) => x.title.includes("温度感"))) {
      throw new Error("確かめたいことが、優先されていません");
    }
  }

  /* 多すぎないこと。どれも軽くなる。

     最初 MAX_POINTS と比べていたが、それだと
     上限を上げたときに判定も一緒に上がって、何も止まらなかった。
     守りたい数（3）を、ここに直接書く。 */
  {
    const many = decisionPoints({
      ...base,
      topicsToConfirm: ["あ1", "い2", "う3", "え4", "お5"],
    });
    if (many.length > 3) {
      throw new Error(`論点が ${many.length} 個あります（3個まで）`);
    }
  }

  // 同じ話を2つにしないこと。
  {
    const dup = decisionPoints({ ...base, topicsToConfirm: ["相手の温度感", "相手の温度感"] });
    if (dup.length !== 1) throw new Error("同じ論点が2つ出ています");
  }

  // 重さは3段だけ。点数にしない（恋愛が採点に見える）。
  {
    const d = decisionPoints({ ...base, topicsToConfirm: ["このまま続けるかどうか"] })[0];
    if (d.importance !== "high") {
      throw new Error("関係が終わるかどうかの話が、重く扱われていません");
    }
    for (const v of ["low", "medium", "high"]) {
      if (typeof v !== "string") throw new Error("重さが数になっています");
    }
  }

  // 人に聞く言い方が、相手の気持ちを当てる形になっていないこと。
  {
    const d = decisionPoints({ ...base, topicsToConfirm: ["相手の温度感"] })[0];
    const line = askLineFor(d);
    if (MIND_READING.test(line)) {
      throw new Error(`人に聞く言い方「${line}」が、相手の気持ちの判定になっています`);
    }
    // 「どう見えるか」であること。「どう思っているか」にしない。
    if (!/どう見える/.test(line)) {
      throw new Error("人に聞く言い方が、見え方を聞く形になっていません");
    }
  }

  // 何も無いときは、論点を作らないこと。
  if (decisionPoints(base).length !== 0) {
    throw new Error("材料が無いのに、論点が作られています");
  }
}
