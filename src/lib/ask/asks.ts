import { MIND_READING } from "./model";

/* ══════════════════════════════════════════════════
   女性に、何を聞くか
   ══════════════════════════════════════════════════

   ── なぜ要るか ──────────────────────────────────
   いままで渡していたのは、本人が書いた文だけだった。
   同じ文面でも、聞きたいことは人によって違う。

     「明日楽しみにしてる！お店は19時でどう？」

   これを渡されただけでは、読む側は何に答えればいいか決められない。
     このまま送っていいか、を聞かれているのか
     重くないか、を聞かれているのか
     どう直すか、まで要るのか

   聞かれていないことに答えると、長くなるだけで当たらない。
   逆に、聞かれていることに答えないと、払った意味が無い。

   ── 書かせない ──────────────────────────────────
   自由に書いてもらう欄は、すでに文面のほうにある。
   そこへさらに「何を聞きたいか」を書かせると、
   同じ画面で2回書くことになり、たいてい2つ目は空のまま出る。

   押すだけにする。選ばなくても出せる。

   ── 「脈ありだと思う？」は入れない ────────────────
   相手の気持ちを当てる問いは売っていない（利用規約 第12条）。
   聞けるのは、読んだ本人のことだけ。

   「どう思う？」は残している。
   主語が読んだ本人なので、本人にしか分からないことを聞いている。 */

export type AskId = "ok" | "how" | "which" | "early" | "fix";

export type Ask = {
  id: AskId;
  /** 札に出す言葉。頭の中の声のまま */
  label: string;
  /** 回答する人に渡るときの言い方 */
  forReader: string;
};

export const ASKS: Ask[] = [
  { id: "ok", label: "このまま送って大丈夫？", forReader: "このまま送っていいかどうか" },
  { id: "how", label: "どう思う？", forReader: "読んでどう感じたか" },
  { id: "which", label: "どっちがいい？", forReader: "AとBのどちらがよいか" },
  { id: "early", label: "早すぎない？", forReader: "この段階で送るのが早いと感じるか" },
  { id: "fix", label: "どう直したらいい？", forReader: "どこをどう直すとよいか" },
];

export function isAskId(x: unknown): x is AskId {
  return typeof x === "string" && ASKS.some((a) => a.id === x);
}

/** 回答する人に渡す1行。選ばれていなければ null */
export function askLine(id: unknown): string | null {
  if (!isAskId(id)) return null;
  return ASKS.find((a) => a.id === id)?.forReader ?? null;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 相手の気持ちを当てる問いを売らない。
  // ここは相談の最後に押す場所なので、いちばん紛れ込みやすい。
  for (const a of ASKS) {
    for (const t of [a.label, a.forReader]) {
      if (MIND_READING.test(t)) {
        throw new Error(`聞きたいこと「${t}」が、相手の気持ちの判定になっています`);
      }
    }
  }

  // 押すだけで済むこと。長いと、読んで選ぶ作業になる。
  for (const a of ASKS) {
    if (a.label.length > 14) {
      throw new Error(`聞きたいこと「${a.label}」が長すぎます（${a.label.length}字／14字まで）`);
    }
    // 問いの形であること。
    if (!a.label.endsWith("？")) {
      throw new Error(`聞きたいこと「${a.label}」が問いになっていません`);
    }
    // 回答する人に渡る言い方は、問いの形にしない。
    // そのまま指示として読めること（「〜かどうか」）。
    if (a.forReader.endsWith("？")) {
      throw new Error(`「${a.label}」の渡し方が問いのままです（指示の形にしてください）`);
    }
  }

  // 多すぎないこと。選ぶのに迷うと、そこで止まる。
  if (ASKS.length > 6) {
    throw new Error(`聞きたいことが ${ASKS.length} 個あります（6個まで）`);
  }
  // 少なすぎると、選ぶ意味が無い。
  if (ASKS.length < 3) {
    throw new Error(`聞きたいことが ${ASKS.length} 個しかありません（3個以上）`);
  }

  // 同じ言葉が2つ無いこと。
  if (new Set(ASKS.map((a) => a.label)).size !== ASKS.length) {
    throw new Error("聞きたいことに、同じ言葉が2つあります");
  }
  if (new Set(ASKS.map((a) => a.id)).size !== ASKS.length) {
    throw new Error("聞きたいことに、同じidが2つあります");
  }
}
