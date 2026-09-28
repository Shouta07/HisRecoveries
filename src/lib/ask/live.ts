// 届くまでを、見えるようにする。
//
// ── 空白のローディングにしない ────────────────────
// 決済のあとに「受付完了」とだけ出すと、そこで体験が切れる。
// いちばん面白いのは、人が読んで、返してくるところ。
// だからその途中を隠さない。
//
//   5人に届けています
//   3人に届きました
//   1人目が見ています
//   最初の反応が届きました
//   あと3人
//   5人そろいました
//
// ── 出せない数字を出さない ────────────────────────
// 「3人に届きました」は、実際に3件配ったときだけ出す。
// 演出のために数を動かさない。動かしたら、その瞬間から
// この画面は全部うそになる。
//
// ── 誰が読んでいるかは出さない ────────────────────
// 「27歳の方が見ています」は、誰が読んだかを相談者に渡すことになる。
// 回答者は匿名で引き受けている。出すのは人数だけ。

export type LiveCounts = {
  /** 何人に聞く予定か */
  panel: number;
  /** 実際に依頼を配った数 */
  sent: number;
  /** 開いた数 */
  opened: number;
  /** 返ってきた数 */
  answered: number;
};

export type Phase =
  | "paying"
  | "sending"
  | "sent"
  | "opened"
  | "first"
  | "collecting"
  | "done";

export function phaseOf(c: LiveCounts, paid: boolean): Phase {
  if (!paid) return "paying";
  if (c.answered >= c.panel) return "done";
  if (c.answered >= 2) return "collecting";
  if (c.answered === 1) return "first";
  if (c.opened > 0) return "opened";
  if (c.sent > 0) return "sent";
  return "sending";
}

/** その段階で出す一行。数字は必ず実際の値から作る */
export function headline(c: LiveCounts, phase: Phase): string {
  switch (phase) {
    case "paying":
      return "お支払いを確認しています。";
    case "sending":
      return `${c.panel}人に届けています。`;
    case "sent":
      return `${c.sent}人に届きました。`;
    case "opened":
      return c.opened === 1 ? "1人目が見ています。" : `${c.opened}人が見ています。`;
    case "first":
      return "最初の反応が届きました。";
    case "collecting":
      return `あと${Math.max(0, c.panel - c.answered)}人。`;
    case "done":
      return `${c.panel}人そろいました。`;
  }
}

/** 見出しの下の一行。急かさない */
export function subline(c: LiveCounts, phase: Phase): string | null {
  switch (phase) {
    case "sending":
      return "条件に合う人をさがしています。";
    case "sent":
      return "読んでもらうのを待っています。この画面は開いたままで大丈夫です。";
    case "opened":
      return "いま読んでもらっています。";
    case "first":
    case "collecting":
      return "残りが届くたびに、ここに増えていきます。";
    case "done":
      return null;
    case "paying":
      return "ふつうは数秒から数分で終わります。";
  }
}

/** 進み具合。0〜1 */
export function progress(c: LiveCounts): number {
  if (c.panel <= 0) return 0;
  return Math.min(1, c.answered / c.panel);
}

/** まだ動いているか。止まったら画面の問い合わせもやめる */
export function isLive(phase: Phase): boolean {
  return phase !== "done";
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const cases: [LiveCounts, boolean, Phase][] = [
    [{ panel: 5, sent: 0, opened: 0, answered: 0 }, false, "paying"],
    [{ panel: 5, sent: 0, opened: 0, answered: 0 }, true, "sending"],
    [{ panel: 5, sent: 3, opened: 0, answered: 0 }, true, "sent"],
    [{ panel: 5, sent: 5, opened: 1, answered: 0 }, true, "opened"],
    [{ panel: 5, sent: 5, opened: 2, answered: 1 }, true, "first"],
    [{ panel: 5, sent: 5, opened: 4, answered: 2 }, true, "collecting"],
    [{ panel: 5, sent: 5, opened: 5, answered: 5 }, true, "done"],
  ];
  for (const [c, paid, want] of cases) {
    const got = phaseOf(c, paid);
    if (got !== want) throw new Error(`届くまでの段階が違います: ${want} を期待して ${got}`);
  }

  // 払う前に、配った体で書かない。
  if (phaseOf({ panel: 5, sent: 5, opened: 5, answered: 5 }, false) !== "paying") {
    throw new Error("支払い前に配信中の表示になっています");
  }

  // 見出しに出る数が、渡した数と一致すること。
  // 演出で数を盛らないための歯止め。
  const c: LiveCounts = { panel: 5, sent: 3, opened: 0, answered: 0 };
  if (!headline(c, "sent").includes("3")) {
    throw new Error("届いた数が、実際の数と違います");
  }
  if (!headline({ ...c, answered: 2 }, "collecting").includes("3")) {
    throw new Error("残りの数が、実際の数と違います");
  }
}
