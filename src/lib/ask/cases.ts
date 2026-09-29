import type { ImageKey } from "../images";

// こういう相談が来ます。
//
// ══════════════════════════════════════════════════
// 体験談にしない
// ══════════════════════════════════════════════════
// 見本では「27歳・ITエンジニア」「マッチはするけど、メッセージが噛み合ない…」
// のように、名前と年齢と職業が付いた声として並んでいた。
//
// それは体験談で、体験談は実在の利用者のものでないと書けない。
// 利用者はまだ0人なので、書けば作り話になる。
//
// なので年齢も職業も名前も付けない。
// 出すのは「どういう相談が来るか」という種類だけ。
// 悩みの言葉そのものは、種類の説明として使ってよい。
//
// ── 写真について ──────────────────────────────────
// 添える絵は、特定の誰かではなく、その場面のイメージ。
// 「◯◯さんの声」の横に置いた瞬間に体験談になるので、置かない。

export type Case = {
  id: string;
  /** 相談の種類 */
  tag: string;
  /** そのとき頭にあること */
  worry: string;
  /** 何を見てもらうのか */
  what: string;
  img: ImageKey;
  /** 相談に進むときのカテゴリ */
  category: string;
  /** いま受け付けているか */
  open: boolean;
};

export const CASES: Case[] = [
  {
    id: "photo",
    tag: "写真・プロフィール",
    worry: "どの写真をメインにするといいか分からない",
    what: "マッチしても続かないので、女性の目で写真を見てほしい。",
    img: "casePhoto",
    category: "photo",
    open: true,
  },
  {
    id: "message",
    tag: "メッセージ",
    worry: "このLINE、送っても大丈夫ですか？",
    what: "デート後のLINEで迷ってしまい、送る前に確認したい。",
    img: "caseMessage",
    category: "message",
    open: true,
  },
  {
    id: "call",
    tag: "会話・デート",
    worry: "電話や初デートで何を話せばいいか不安です",
    what: "実際の会話の流れで練習して、直すところを知りたい。",
    img: "caseCall",
    category: "message",
    open: false,
  },
  {
    id: "after",
    tag: "デート後",
    worry: "デートは楽しかったけど、次に誘っていいか迷ってます",
    what: "相手の反応から、次の一手を女性に相談したい。",
    img: "caseDate",
    category: "signal",
    open: true,
  },
];

/* ── 公開の前に止めること ───────────────────────── */
{
  // 年齢・職業・名前を付けない。付いた時点で体験談になる。
  const PERSON = /\d+歳|エンジニア|営業|コンサル|公務員|経営企画|メーカー|看護師|さん」|さんの声/;
  for (const c of CASES) {
    for (const t of [c.tag, c.worry, c.what]) {
      if (PERSON.test(t)) {
        throw new Error(
          `「${c.id}」に年齢や職業が入っています。利用者はまだ0人なので、体験談は書けません`,
        );
      }
    }
  }
  if (!CASES.some((c) => c.open)) throw new Error("受け付けている相談の種類がありません");
}
