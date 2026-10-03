import { MIND_READING } from "../ask/model";
import { FIRST_LINE } from "./prompt";

/* ══════════════════════════════════════════════════
   トップに出す、恋亀との会話
   ══════════════════════════════════════════════════

   ── 説明より先に、会話を見せる ──────────────────
   「話すだけで整理されます」と書いても、伝わらない。
   実際のやりとりを見せたほうが早い。

   そのあとに、話した結果できたもの（EP）を出す。
   順番は、会話 → できたもの → 次にやること。

   ── 見本であることを隠さない ────────────────────
   実在の誰かのやりとりではない。
   札は、この部品の外（page.tsx）で必ず付ける。

   ── 長くしない ──────────────────────────────────
   6往復まで。読むのに時間がかかると、スクロールで飛ばされる。
   恋亀の返事は2文まで（人格の決まりと同じ）。 */

export type Turn = { who: "koi" | "me"; say: string };

export const DEMO_TALK: Turn[] = [
  { who: "koi", say: "Aさん今日2回目やったよね。どうやった？" },
  { who: "me", say: "めっちゃよかった" },
  { who: "koi", say: "お、声で分かるやん。何が一番よかった？" },
  { who: "me", say: "向こうから水族館行きたいって言われた" },
  { who: "koi", say: "次回予告きてるやん。日程までは？" },
  { who: "me", say: "まだ" },
  { who: "koi", say: "惜しい（笑）。じゃあ次はそこやな。" },
];

/** 会話のあとにできるもの */
export const DEMO_EP = {
  person: "Aさん",
  app: "with",
  number: 3,
  title: "2回目デート",
  rows: [
    { mark: "✨", label: "よかったこと", body: "向こうから次の提案が出た" },
    { mark: "❤️", label: "自分", body: "また会いたいと思っている" },
    { mark: "🤔", label: "気になる", body: "返信が少し遅い" },
  ],
  next: "水族館の日程を決める",
};

/** そのあと、人に聞くことを提案する一言 */
export const DEMO_ASK = "これ、実際の女性にも聞いてみる？";

/* ── 公開の前に止めること ───────────────────────── */
{
  // 恋亀から始まること。利用者に最初の一言を考えさせない。
  if (DEMO_TALK[0].who !== "koi") {
    throw new Error("会話が、利用者から始まっています");
  }

  // 恋亀の返事が短いこと。人格の決まり（2文まで）と同じ。
  for (const t of DEMO_TALK) {
    if (t.who !== "koi") continue;
    const sentences = t.say.split(/[。？！]/).filter(Boolean).length;
    if (sentences > 2) {
      throw new Error(`恋亀の返事「${t.say}」が ${sentences} 文あります（2文まで）`);
    }
    // 1回に質問は1つまで。
    const q = (t.say.match(/？/g) ?? []).length;
    if (q > 1) throw new Error(`恋亀の返事「${t.say}」に、質問が ${q} つあります`);
  }

  // 相手の気持ちを当てる言い方をしないこと。
  for (const t of [...DEMO_TALK.map((x) => x.say), DEMO_ASK, DEMO_EP.next,
    ...DEMO_EP.rows.map((r) => r.body)]) {
    if (MIND_READING.test(t)) {
      throw new Error(`会話の見本「${t}」が、相手の気持ちの判定になっています`);
    }
  }

  // 長くしないこと。読むのに時間がかかると、飛ばされる。
  if (DEMO_TALK.length > 8) {
    throw new Error(`会話の見本が ${DEMO_TALK.length} 往復あります（8まで）`);
  }

  /* できたものに、利用者が入力していない項目が入っていること。
     「話しただけなのに全部できてる」がこの見本の役目なので、
     会話に出ていないことが埋まっていると、嘘になる。

     会話に出ているのは
       2回目だった / よかった / 水族館の提案 / 日程はまだ
     それ以外を書かない。 */
  const said = DEMO_TALK.map((t) => t.say).join("");
  if (!said.includes("水族館")) {
    throw new Error("会話に出ていないことが、EPに入っています（水族館）");
  }
  if (!said.includes("2回目")) {
    throw new Error("会話に出ていないことが、EPに入っています（2回目）");
  }

  // 次にやることが1つだけであること。
  if (/[、,]|および/.test(DEMO_EP.next)) {
    throw new Error(`次にやることが1つになっていません（${DEMO_EP.next}）`);
  }

  // 点数・率を出さないこと。恋愛をゲームにしない。
  for (const r of DEMO_EP.rows) {
    if (/\d+%|点|レベル|偏差値|勝率/.test(r.body)) {
      throw new Error(`EPの「${r.body}」が、点数になっています`);
    }
  }

  // 人に聞くことを、押し売りにしないこと。問いの形であること。
  if (!DEMO_ASK.endsWith("？")) {
    throw new Error("人に聞く提案が、問いになっていません");
  }

  // 最初のひとことが、人格のほうと食い違っていないこと。
  // 画面と中身で別の恋亀にしない。
  if (FIRST_LINE.length > 24) {
    throw new Error("最初のひとことが長すぎます");
  }
}
