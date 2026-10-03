import { advisorWord } from "../who";
import { PASS_YEN, INCLUDED, VOICE_MINUTES_PER_MONTH, HUMAN_PER_MONTH } from "./entitle";
import { koiEnabled } from "../koi/gate";

/* ══════════════════════════════════════════════════
   月額を、何として売るか
   ══════════════════════════════════════════════════

   ── AIの利用料として売らない ────────────────────
   「高度なAIが使えます」は、何が良くなるのか分からない。
   読んだ人は、自分の生活で何が変わるかを想像できない。

   売るのは、自分の恋愛を覚えてくれている状態。
   毎回、最初から説明しなくていいこと。

   ── 出すタイミング ──────────────────────────────
   初回の相談と、EP ができるところまでは無料。
   2回目に「前回を覚えている」を体験した直後に出す。

   覚えていることを体験する前に出すと、
   何を買うのか分からないまま値段だけ見ることになる。

   ── 上限を、先に書く ────────────────────────────
   「月50分まで」「月1回」を、買う前に出す。
   買ったあとで知ると、それだけで解約の理由になる。 */

export const PAYWALL_HEAD = "恋亀に、続きを覚えてもらう。";

export const PAYWALL_BODY = [
  "Aさんのことも。",
  "次のデートも。",
  "いま迷ってることも。",
  "毎回、最初から説明しなくていい。",
];

export const PAYWALL_NAME = "Tashikame Pass";

/** 買う場所の言葉。何に払うのかが、押す場所に書いてあること */
export const PAYWALL_CTA = "続きを覚えてもらう";

/** 買わない側の選択肢。閉じられないようにしない */
export const PAYWALL_LATER = "あとで";

/** 月額の下に出す、いちばん効く1行 */
export const PAYWALL_HUMAN = `月${HUMAN_PER_MONTH}回、実在する${advisorWord()}3人にも確カメられます。`;

/** 設定にある、解約へ行く場所 */
export const MANAGE_LABEL = "プランを管理";
export const MANAGE_NOTE =
  "解約も、支払い方法の変更も、ここからできます。連絡は要りません。";

/* ── 公開の前に止めること ───────────────────────── */
{
  const all = [PAYWALL_HEAD, ...PAYWALL_BODY, PAYWALL_CTA, PAYWALL_HUMAN, PAYWALL_NAME];

  /* AIの利用料として売らない。
     「高度なAI」「使い放題」は、何が良くなるのか伝わらない。 */
  const BANNED = [
    "Premium", "プレミアム", "高度なAI", "AI使い放題", "使い放題",
    "無制限", "フル機能", "すべての機能", "アップグレード",
  ];
  for (const t of all) {
    const hit = BANNED.find((b) => t.includes(b));
    if (hit) throw new Error(`月額の言葉に「${hit}」が入っています`);
  }

  // 何を覚えてもらうのかが、書いてあること。
  // ここが無いと、ただの月額になる。
  if (!/覚え/.test(PAYWALL_HEAD)) {
    throw new Error("月額の見出しに、覚えてもらうことが書かれていません");
  }
  if (!PAYWALL_BODY.some((t) => /説明しなくていい/.test(t))) {
    throw new Error("月額の説明に、毎回説明しなくていいことが書かれていません");
  }

  // 押す場所に、何に払うのかが書いてあること。
  // 「購入する」だけのボタンは、何を買ったのか残らない。
  if (/^(購入|申し込む|登録)/.test(PAYWALL_CTA)) {
    throw new Error("月額のボタンが、何に払うのか分からない言葉になっています");
  }

  // 買わない道があること。閉じられない画面にしない。
  if (!PAYWALL_LATER) throw new Error("月額を、あとにする選択肢がありません");

  /* 上限を、買う前に書くこと。
     買ったあとで知ると、それだけで解約の理由になる。 */
  const shown = INCLUDED.join("");
  /* 分数は、音声が開いているときだけ。
     同じことを entitle.ts でも見ている。
     こちらは「買う前に上限が書いてあるか」を見る側。 */
  if (koiEnabled && !shown.includes(`${VOICE_MINUTES_PER_MONTH}分`)) {
    throw new Error("声で話せるのに、含まれるものに分数が書かれていません");
  }
  if (!shown.includes(`月${HUMAN_PER_MONTH}回`)) {
    throw new Error("月額に含まれるものに、確カメる回数が書かれていません");
  }

  // 人に聞けることを、必ず出すこと。
  // ここが AI だけのサービスとの違いなので、隠すと値段の理由が消える。
  if (!/実在する/.test(PAYWALL_HUMAN)) {
    throw new Error("月額の説明に、実在の女性に聞けることが書かれていません");
  }

  // 解約が、自分でできると書いてあること。
  // 問い合わせないと解約できない形にしない（§45）。
  if (!/連絡は要りません/.test(MANAGE_NOTE)) {
    throw new Error("解約に、連絡が要らないことが書かれていません");
  }
  if (!/解約/.test(MANAGE_NOTE)) {
    throw new Error("プランを管理の説明に、解約が書かれていません");
  }

  /* ══════════════════════════════════════════════
     値段を、画面の言葉に直書きしないこと
     ══════════════════════════════════════════════
     ここは前、こう書いてあった。

       if (PASS_YEN !== 1980) throw ...

     「entitle から来ていること」を見るつもりで、金額そのものを
     固定していた。二重管理は1つも防げず、値段を動かした日に
     ここだけが止まる。実際、¥1,980 → ¥2,980 で止まった。

     見たいのは「画面の言葉の中に、金額が直に書かれていないか」。
     PASS_YEN から作った文字列なら、何円になっても通る。 */
  for (const [k, v] of Object.entries({
    PAYWALL_HEAD, PAYWALL_NAME, PAYWALL_CTA, PAYWALL_LATER,
    PAYWALL_HUMAN, MANAGE_LABEL, MANAGE_NOTE,
    PAYWALL_BODY: PAYWALL_BODY.join(" "),
  })) {
    const yen = String(v).match(/(\d[\d,]{2,})\s*円|¥\s*(\d[\d,]{2,})/);
    if (!yen) continue;
    const n = Number((yen[1] ?? yen[2]).replace(/,/g, ""));
    if (n !== PASS_YEN) {
      throw new Error(
        `${k} に、月額と違う金額（¥${n}）が直に書かれています。PASS_YEN から作ってください`,
      );
    }
  }
}
