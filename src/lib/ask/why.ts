// 結果を見たあとに、1問だけ聞く。
//
// ── 何のために聞くか ──────────────────────────────
// このサービスが証明したいことは1つ。
// 「ChatGPT に無料で聞けるのに、それでも払って人に聞きたい瞬間はあるか」。
//
// 相談の前に聞くのは「AIにも聞きましたか」だけ。
// 結果を見たあとに聞くのが、ここ。
// 買う前の期待ではなく、受け取ったあとの理由のほうが当てになる。
//
// ── 選択式にする ──────────────────────────────────
// 自由記述にすると、書ける人だけが答える。
// 選択式で、複数選べて、答えなくても閉じられるようにする。

export const WHY_REASONS = [
  { id: "ai_unsure", label: "AIだけだと不安だった" },
  { id: "real_reaction", label: "本当の異性の反応が知りたかった" },
  { id: "close_to_them", label: "相手に近い人へ聞きたかった" },
  { id: "multiple", label: "複数人へ聞きたかった" },
  { id: "not_friends", label: "友達には聞きづらかった" },
  { id: "important", label: "重要な判断だった" },
] as const;

export type WhyReason = (typeof WHY_REASONS)[number]["id"];

export function isWhyReason(x: unknown): x is WhyReason {
  return typeof x === "string" && WHY_REASONS.some((r) => r.id === x);
}

/** 画面から来た配列を、知っているものだけに絞る */
export function cleanReasons(x: unknown): WhyReason[] {
  if (!Array.isArray(x)) return [];
  return [...new Set(x.filter(isWhyReason))];
}

/* ── 公開の前に止めること ───────────────────────── */
{
  if (WHY_REASONS.length < 3) {
    throw new Error("理由の選択肢が少なすぎます（選ばせる意味が無くなります）");
  }
  if (new Set(WHY_REASONS.map((r) => r.id)).size !== WHY_REASONS.length) {
    throw new Error("理由のIDが重複しています");
  }
  // 「その他」を置かない。置くと、そこに寄って何も分からなくなる。
  if (WHY_REASONS.some((r) => /その他|etc/i.test(r.label))) {
    throw new Error("「その他」は置かないでください");
  }
}
