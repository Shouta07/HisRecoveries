import { TIERS } from "@/lib/economics";

// 回答者が友達を呼ぶ。
//
// ══════════════════════════════════════════════════
// なぜ、ここにだけ紹介を置くか
// ══════════════════════════════════════════════════
// 相談する側は、人に言いません。
// 「送っていいか分からなかったLINEを、女性5人に見てもらった」
// を友達に話す人はいない。使う瞬間が恥ずかしい瞬間だからです。
//
// 回答する側は言えます。「空いた2分で180円」は恥ずかしくない。
// そして供給が増えることが、このサービスが速くなる唯一の道です。
//
//   人が増える → 速くなる → 単価を上げられる
//   → 報酬を上げられる → 良い人が増える → 品質が上がる
//
// 紹介はこのループの入口。だから供給側にだけ置きます。
//
// ══════════════════════════════════════════════════
// 登録しただけでは払わない
// ══════════════════════════════════════════════════
// 登録だけで払うと、登録だけする人が集まります。
// 実際に答えて、役に立ってから払う。
//
// ══════════════════════════════════════════════════
// これは変動費ではなく、人を集める費用
// ══════════════════════════════════════════════════
// 1注文の採算（economics.ts）には入れません。
// 入れると、紹介を増やすほど注文の粗利が悪く見えて、
// 増やすべきものを止める判断になります。
// これは CAC として別に見ます。

/** 紹介された人が、これだけ答えたら成立 */
export const REQUIRED_ANSWERS = 5;

/** 呼んだ人に払う */
export const INVITER_YEN = 500;

/** 呼ばれた人に払う */
export const INVITEE_YEN = 500;

/** 1人が呼べる上限。ここを外すと、配るだけの人が出る */
export const MAX_INVITES = 20;

export type ReferralState = {
  code: string;
  invited: number;
  completed: number;
  earnedYen: number;
  left: number;
};

export function stateOf(row: {
  referral_code: string;
  invited?: number;
  completed?: number;
}): ReferralState {
  const invited = row.invited ?? 0;
  const completed = row.completed ?? 0;
  return {
    code: row.referral_code,
    invited,
    completed,
    earnedYen: completed * INVITER_YEN,
    left: Math.max(0, MAX_INVITES - invited),
  };
}

/** 画面に出す1行。盛らない */
export function pitch(): string {
  return `友達が${REQUIRED_ANSWERS}件答えたら、二人とも¥${INVITER_YEN.toLocaleString()}。`;
}

/** 1人あたり、いくらかけて回答者を1人増やしているか */
export function acquisitionCost(): number {
  return INVITER_YEN + INVITEE_YEN;
}

/**
 * その費用が、何件の回答で回収できるか。
 * 回収に時間がかかりすぎるなら、紹介は割に合っていない。
 */
export function paybackAnswers(marginPerOrder: number, answersPerOrder: number): number {
  if (marginPerOrder <= 0 || answersPerOrder <= 0) return Infinity;
  const marginPerAnswer = marginPerOrder / answersPerOrder;
  return Math.ceil(acquisitionCost() / marginPerAnswer);
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 登録だけで払わないこと。
  if (REQUIRED_ANSWERS < 1) {
    throw new Error("登録しただけで紹介料が出る設定になっています");
  }
  // 呼ばれた人がもらえる額が、1件の報酬より十分大きいこと。
  // 1件分と変わらないなら、呼ぶ理由にならない。
  const top = TIERS[TIERS.length - 1].quickYen;
  if (INVITEE_YEN < top) {
    throw new Error(`呼ばれた人への額（${INVITEE_YEN}円）が、1件の報酬（${top}円）を下回っています`);
  }
  // 無制限に配らないこと。
  if (MAX_INVITES > 50) throw new Error("紹介の上限が高すぎます");

  // 1人増やす費用が、その人が最初に生む回答で回収できる見込みであること。
  // 「今すぐ聞く」の1件あたり限界利益 ¥1,854 / 5人 = 1回答あたり約¥370。
  // 費用 ¥1,000 は約3回答で回収できる。紹介の条件が5回答なので、
  // 成立した時点ですでに回収できている。
  const need = paybackAnswers(1854, 5);
  if (need > REQUIRED_ANSWERS) {
    throw new Error(
      `紹介の費用を回収するのに ${need} 回答が要りますが、成立の条件は ${REQUIRED_ANSWERS} 回答です`,
    );
  }
}
