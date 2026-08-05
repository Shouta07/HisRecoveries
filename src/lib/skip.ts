import { NOT_YET, areaLabel, type AreaId } from "./check";
import { OPTIONS, TIER_LABEL } from "./options";
import { assertNoPromoWords } from "./monetization";

// 「やらなくていいこと」を1か所に集める。
//
// ── なぜ独立させるか ────────────────────────────
// この材料はサイト中に散らばっていた。
//   ・診断の結果に出る「いまはやらなくていいこと」（check.ts の NOT_YET）
//   ・選択肢ごとの「まだ早い条件」（options.ts の notYet）
//   ・/order の「やらないほうがいいこと」（JSXに直書き）
// 全部、読者が何かをやり終えたあとにしか出てこない場所にあった。
//
// この事業でいちばん人が入ってきやすい入口は、たぶんここ。
// 薄毛も肌も体毛も、調べる時点ですでに「やることが多すぎる」状態にある。
// そこへ足すページは山ほどあるが、減らすページはほとんどない。
//
// しかも「やらなくていい」は、読む側に告白をさせない。
// 「自分は薄毛だ」と認めなくても開ける。人に渡すこともできる。
// この領域で、恥を伴わずに読める数少ない形になっている。
//
// ── 書ける根拠 ────────────────────────────────
// 売っている側は、やらなくていいとは書けない。
// 掲載の順番を報酬で決めていないことが、この面を書ける唯一の根拠。
// だからページの末尾で、その根拠のほうへリンクする。

export type Avoid = { t: string; d: string };

/**
 * 順番以前に、やらないほうがいいこと。
 *
 * もとは /order のJSXに直書きしていた。
 * 同じ内容を2ページで出すので、片方だけ直すと食い違う。
 */
export const AVOID: Avoid[] = [
  {
    t: "全部を同時に始めること",
    d: "3つ揃えて2週間でやめるより、1つを3ヶ月続けるほうが、確かめられることが多くあります。",
  },
  {
    t: "顔立ちそのものを変えようとすること",
    d: "第一印象で見られているのは、骨格より手入れで動く部分です。順番としては、あとになります。",
  },
  {
    t: "気になっていないものに手をつけること",
    d: "体毛も、メイクも、そのままで構いません。減らすことが上位互換ではありません。",
  },
  {
    t: "記録を残す前に、お金を使うこと",
    d: "比べる基準がないと、効いたかどうかを判断できません。0円でできることが先です。",
  },
];

/** 分野ごとの「気にしていないなら、やらなくていい」 */
export function skipByArea(): { area: AreaId; label: string; reason: string }[] {
  return (Object.keys(NOT_YET) as AreaId[]).map((a) => ({
    area: a,
    label: areaLabel(a),
    reason: NOT_YET[a],
  }));
}

/** 選択肢ごとの「まだ早い条件」。持っているものだけ拾う */
export function notYetOptions(): {
  id: string;
  area: AreaId;
  label: string;
  tier: string;
  notYet: string;
}[] {
  return OPTIONS.filter((o) => o.notYet).map((o) => ({
    id: o.id,
    area: o.area,
    label: o.label,
    tier: TIER_LABEL[o.tier],
    notYet: o.notYet as string,
  }));
}

// 煽る言い回しが入っていないかを、公開の前に確かめる。
// 「やらなくていい」は言い切りの形なので、書き足すと強くなりやすい。
assertNoPromoWords(
  AVOID.flatMap((a) => [a.t, a.d]),
  "やらなくていいこと",
);

// 材料が空のまま公開されると、見出しだけのページが出る。
if (AVOID.length === 0 || notYetOptions().length === 0) {
  throw new Error("「やらなくていいこと」の材料が空です");
}
