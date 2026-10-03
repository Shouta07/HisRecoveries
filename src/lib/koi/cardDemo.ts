import { cardOf, type SituationCard } from "./card";
import type { TalkUpdate } from "../talk/shape";

/* トップに出す、整理のあとの1枚。
 *
 * ── 実物と同じ部品で作る ────────────────────────
 * ここだけ別に作ると、見せている1枚と、実際に返ってくる1枚がずれる。
 * cardOf() は /api/koi/wrap が使っているものと同じ。
 * 違うのは、元になる会話が見本かどうかだけ。
 *
 * ── 会話に出ていないことを、入れない ────────────
 * 下の会話（DEMO_TALK）で話していることだけから作る。
 * 話していないことが1枚に出ていたら、それは嘘の見本になる。 */
const UPDATE: TalkUpdate = {
  facts: [{ body: "2回目のデートが終わった", quote: "Aさん今日2回目やった" }],
  feelings: ["また会いたいと思っている"],
  opinions: [],
  inferences: [
    { body: "日程が決まっていないことが、止まっているところ", confidence: 0.8 },
  ],
  stageUpdate: null,
  nextDateUpdate: null,
  concernsAdd: [],
  signalsAdd: ["向こうから水族館の提案が出た"],
  topicsToConfirm: ["水族館にいつ誘うか", "相手の温度感"],
  nextAction: "水族館の日程を出す",
  summary: "2回目まで進んでいる。日程が決まっていない。",
};

export const DEMO_CARD: SituationCard = cardOf(UPDATE, {
  who: "Aさん",
  stage: "second_date_completed",
});

/* ── 公開の前に止めること ───────────────────────── */
{
  // 行があること。空の枠を見せない。
  if (DEMO_CARD.rows.length === 0) {
    throw new Error("見本の1枚に、行がありません");
  }
  /* 言ったことと、こちらの見立ての両方が出ること。
     片方だけだと、分けている意味が伝わらない。 */
  const kinds = new Set(DEMO_CARD.rows.map((r) => r.source));
  if (!kinds.has("said") || !kinds.has("guess")) {
    throw new Error("見本の1枚に、言ったことと見立ての両方が出ていません");
  }
  /* 人に回るものが1つは出ること。
     ここが無いと、実在の異性に聞ける意味が画面に出ない。 */
  if (!DEMO_CARD.toConfirm.some((t) => t.needsHuman)) {
    throw new Error("見本の1枚に、人に聞くものが出ていません");
  }
  // 次の一手が1つ出ること。
  if (!DEMO_CARD.next) throw new Error("見本の1枚に、次の一手がありません");
}
