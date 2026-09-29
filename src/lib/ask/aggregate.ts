import { VERDICTS, PICKS, SECONDS, type Verdict, type Pick, type Second } from "./model";

// 回答をまとめる。
//
// ── 結論を作らない ────────────────────────────────
// ここでやるのは数えることと、割れているかどうかを言うことだけ。
// 「こうした方がいい」は作らない。それを作った瞬間、
// 人に聞くサービスではなく、判定するサービスになる。
//
// ── 無い要約を、あるように見せない ────────────────
// 「共通していた意見」は、回答文を読んで書かれたときだけ出す。
// 文面をまとめる仕組みが動いていない間は、その欄ごと出さない。
// それらしい一文を機械で組み立てると、誰も言っていないことが
// 「みんなが言っていること」として画面に出る。

export type Answer = {
  id: string;
  /** 回答者の年代。誰が言ったかは、これ以上出さない */
  ageBand: string;
  verdict: Verdict | null;
  pick: Pick | null;
  /** カテゴリごとの2つ目の問い。無いカテゴリでは null */
  second: Second | null;
  comment: string;
  /**
   * どう変われば自然か。答えた本人が書いたもの。任意。
   *
   * ここを AI に書かせない。
   * 「どう直すか」は、そう感じた本人が書いたものにいちばん価値がある。
   * AI が書けば誰でも書ける一般論になり、人に頼む理由が消える。
   */
  fix?: string | null;
  /** 回答者の属性。誰が言ったかではなく、どういう人が言ったか */
  attrs: string[];
};

export type Tally = {
  /** 回答数 */
  total: number;
  /** 選択肢ごとの数。0のものも含めて、並び順は VERDICTS と同じ */
  byVerdict: { id: Verdict; label: string; n: number }[];
  byPick: { id: Pick; label: string; n: number }[];
  /** いちばん多かったもの。同数なら null（多数派がいない、と出す） */
  top: { label: string; n: number } | null;
  /** 意見が割れているか */
  split: boolean;
  /** 数だけから作った1行。回答文からは作らない */
  headline: string;
  /**
   * 2つ目の問いの集計。
   * 誰も答えていないカテゴリでは null になり、画面にもその欄が出ない。
   */
  second: { yes: number; no: number; total: number } | null;
};

/** 「かなり良い」「良い」を前向き、「微妙」「やめた方がいい」を後ろ向きに寄せる */
// 「このままでOK」だけを、直さなくていい側として数える。
//
// 「少し気になる」を良い側に入れてはいけない。
// 引っかかったところがある、と言われているのに
// 「4/5が好印象」と出すと、いちばん要る情報が消える。
const POSITIVE: Verdict[] = ["as_is"];

export function tally(answers: Answer[], isAb: boolean): Tally {
  const total = answers.length;

  const byVerdict = VERDICTS.map((v) => ({
    id: v.id,
    label: v.label,
    n: answers.filter((a) => a.verdict === v.id).length,
  }));
  const byPick = PICKS.map((p) => ({
    id: p.id,
    label: p.label,
    n: answers.filter((a) => a.pick === p.id).length,
  }));

  const counted = isAb ? byPick : byVerdict;
  const max = Math.max(0, ...counted.map((c) => c.n));
  const leaders = counted.filter((c) => c.n === max && c.n > 0);
  const top = leaders.length === 1 ? { label: leaders[0].label, n: leaders[0].n } : null;

  let split: boolean;
  if (isAb) {
    // A と B が両方いれば割れている
    const a = byPick.find((p) => p.id === "a")?.n ?? 0;
    const b = byPick.find((p) => p.id === "b")?.n ?? 0;
    split = a > 0 && b > 0;
  } else {
    const pos = answers.filter((a) => a.verdict && POSITIVE.includes(a.verdict)).length;
    const neg = answers.filter((a) => a.verdict && !POSITIVE.includes(a.verdict)).length;
    split = pos > 0 && neg > 0;
  }

  const yes = answers.filter((a) => a.second === "yes").length;
  const no = answers.filter((a) => a.second === "no").length;
  const second = yes + no > 0 ? { yes, no, total: yes + no } : null;

  return {
    total,
    byVerdict,
    byPick,
    top,
    split,
    headline: headline(total, top, split),
    second,
  };
}

export { SECONDS };

function headline(total: number, top: Tally["top"], split: boolean): string {
  if (total === 0) return "まだ回答がありません。";
  if (!top) return `${total}人に聞きました。意見は分かれました。`;
  if (top.n === total) return `${total}人全員が「${top.label}」でした。`;
  if (split) {
    return `${total}人中${top.n}人が「${top.label}」。残りは違う見方でした。`;
  }
  return `${total}人中${top.n}人が「${top.label}」でした。`;
}

/* ── 公開の前に止めること ─────────────────────────
   数え方を間違えると、人が言っていないことが画面に出る。 */
{
  const mk = (
    verdict: Verdict | null,
    pick: Pick | null = null,
    second: Second | null = null,
  ): Answer => ({
    id: Math.random().toString(36).slice(2),
    ageBand: "25-29",
    verdict,
    pick,
    second,
    comment: "……",
    attrs: [],
  });

  const all = tally([mk("as_is"), mk("as_is"), mk("as_is")], false);
  if (all.headline !== "3人全員が「このままでOK」でした。") {
    throw new Error(`全員一致の文が違います: ${all.headline}`);
  }
  if (all.split) throw new Error("全員一致なのに、割れていることになっています");

  const mixed = tally([mk("as_is"), mk("as_is"), mk("change")], false);
  if (!mixed.split) throw new Error("前向きと後ろ向きが混ざっているのに、割れていません");
  if (!mixed.headline.includes("3人中2人")) {
    throw new Error(`多数派の数え方が違います: ${mixed.headline}`);
  }

  // 同数のときに、どちらかを多数派にしない
  const tie = tally([mk("as_is"), mk("change")], false);
  if (tie.top !== null) throw new Error("同数なのに多数派を作っています");
  if (!tie.headline.includes("分かれました")) {
    throw new Error(`同数のときの文が違います: ${tie.headline}`);
  }

  const ab = tally([mk(null, "a"), mk(null, "a"), mk(null, "b")], true);
  if (!ab.split) throw new Error("A と B に割れているのに、割れていません");
  if (ab.top?.label !== "A") throw new Error("A/B の多数派が違います");

  if (tally([], false).total !== 0) throw new Error("0件の扱いが違います");

  // 2つ目の問いは、誰も答えていなければ欄ごと出さない。
  if (tally([mk("as_is"), mk("slight")], false).second !== null) {
    throw new Error("誰も答えていない2つ目の問いを、集計してしまっています");
  }
  const sec = tally([mk("as_is", null, "yes"), mk("slight", null, "yes"), mk("change", null, "no")], false).second;
  if (!sec || sec.yes !== 2 || sec.no !== 1 || sec.total !== 3) {
    throw new Error("2つ目の問いの数え方が違います");
  }
}
