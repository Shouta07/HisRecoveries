import { PLANS } from "./plans";
import { MIND_READING } from "./model";

/* ══════════════════════════════════════════════════
   AとBを並べて、どちらか選んでもらう
   ══════════════════════════════════════════════════

   ── 作りはもう入っている ────────────────────────
   相談を書く画面には「AとBを比べる」があり、
   回答画面はどちらを選んだかを数えて、割れたかどうかまで出す
   （model.ts の PICKS、aggregate.ts の tally）。

   できるのに、トップで一度も言っていなかった。
   使える機能のうち、いちばん人に見せる価値があるのはここ。

   ── なぜここが効くか ────────────────────────────
   「この文面どう？」は、答えるほうも難しい。
   良いか悪いかの線が、人によって違うから。

   「AとBどっち？」なら、誰でも即答できる。
   答える側が楽な設問は、返ってくるのも速い。

   そして買う側にとっては、いちばん結果が分かりやすい。
   2対1でも、割れたことがそのまま読める。

   ── 票数は、売っている人数と同じにする ────────────
   10人に聞いた絵を出して、3人しか来ないのでは嘘になる。
   下の判定で、おすすめの商品の人数と突き合わせている。 */

export type AbDemo = {
  /** 何を並べたか */
  subject: string;
  /** 聞いたこと */
  question: string;
  a: { label: string; votes: number };
  b: { label: string; votes: number };
  /** 選んだ理由。どちらを選んだ人のものかが分かる形で持つ */
  says: { pick: "a" | "b"; age: number; say: string }[];
};

export const AB_DEMO: AbDemo = {
  subject: "アプリの1枚目",
  question: "最初の1枚なら、どっち？",
  a: { label: "A", votes: 2 },
  b: { label: "B", votes: 1 },
  says: [
    { pick: "a", age: 26, say: "Aのほうが、話しかけたときの雰囲気が想像できます。" },
    { pick: "b", age: 24, say: "Bが好きです。Aは少し構えて見えました。" },
    { pick: "a", age: 29, say: "Aです。Bは加工が強いところが、少しだけ気になりました。" },
  ],
};

/* ── 公開の前に止めること ───────────────────────── */
{
  const d = AB_DEMO;
  const total = d.a.votes + d.b.votes;

  // 票の合計が、おすすめの商品の人数と同じであること。
  // 10人に聞いた絵を出して3人しか来ないのでは、買ったあとに足りない。
  const featured = PLANS.find((p) => p.featured) ?? PLANS[0];
  if (total !== featured.answers) {
    throw new Error(
      `AとBの見本が ${total}票ですが、おすすめの「${featured.id}」は ${featured.answers}人です`,
    );
  }

  // 理由の数と、票の数が合っていること。
  if (d.says.length !== total) {
    throw new Error(`AとBの見本は ${total}票なのに、理由が ${d.says.length}件です`);
  }
  for (const k of ["a", "b"] as const) {
    const n = d.says.filter((s) => s.pick === k).length;
    if (n !== d[k].votes) {
      throw new Error(`${k.toUpperCase()}は${d[k].votes}票なのに、理由が${n}件です`);
    }
  }

  // 割れていること。
  // 全票が片側だと「聞くまでもなかった」絵になる。
  // AとBを並べる意味は、分かれることがあると分かること。
  if (d.a.votes === 0 || d.b.votes === 0) {
    throw new Error("AとBの見本が、片方に全部入っています（分かれる絵になりません）");
  }

  // 相手の気持ちを当てる言い方にしない。
  for (const t of [d.question, ...d.says.map((s) => s.say)]) {
    if (MIND_READING.test(t)) {
      throw new Error(`AとBの見本「${t}」が、相手の気持ちの判定になっています`);
    }
  }

  // 票数を割合で書かせない材料にしない（母数が小さい）。
  // ここは数そのものしか持たないので、割合は作れない。
  if (total > 20) {
    throw new Error(`AとBの見本が ${total}票あります。この数は統計に見えます`);
  }
}
