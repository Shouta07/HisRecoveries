/* ══════════════════════════════════════════════════
   誰が、誰に聞くのか
   ══════════════════════════════════════════════════

   ── 中立にするだけでは、嘘になる ────────────────
   「男性なら女性に、女性なら男性に」と書くのは簡単だが、
   いま確保できている回答者は女性3人、男性0人。

   コピーだけ中立にすると、女性が申し込んでも
   女性の回答者に届く。供給の判定は性別を見ていない。

   このセッションで何度も直してきたのと同じ種類の間違い。
     女性1人しか売っていないのに「女性3人」と書いてあった
     審査を通った人が0人なのに、架空の4人を出していた

   だから、開いている向きをここで持つ。
   画面の言葉は、ここを見て変わる。

   ── 恋亀は、性別を問わない ──────────────────────
   恋亀はAIなので、男女どちらでも同じように動く。
   性別で変わるのは「確カメる」だけ。

   月額5項目のうち4つは、どちらの人にもそのまま使える。
   そこを男性向けに書く理由は無い。 */

export type Gender = "male" | "female";

/** 相談する人から見て、答えるのは異性 */
export function opposite(g: Gender): Gender {
  return g === "male" ? "female" : "male";
}

export const GENDER_LABEL: Record<Gender, string> = {
  male: "男性",
  female: "女性",
};

/**
 * いま、どの向きの相談を受けられるか。
 *
 * 回答者が実際に集まっている側だけ true。
 * 増えたらここを変える。変えると画面の言葉も変わる。
 *
 * male: true  → 男性からの相談（女性が答える）を受けられる
 * female: true → 女性からの相談（男性が答える）を受けられる
 */
export const ASKER_OPEN: Record<Gender, boolean> = {
  male: true,
  female: false,
};

/** 両方の向きが開いているか */
export const bothWaysOpen = ASKER_OPEN.male && ASKER_OPEN.female;

/** いま受けられる向きの、相談する側 */
export function openAskers(): Gender[] {
  return (Object.keys(ASKER_OPEN) as Gender[]).filter((g) => ASKER_OPEN[g]);
}

/* ══════════════════════════════════════════════════
   画面に出す言葉
   ══════════════════════════════════════════════════ */

/**
 * 「実在する◯◯に確カメる」の◯◯。
 *
 * ══════════════════════════════════════════════════
 * 「異性」に決めた
 * ══════════════════════════════════════════════════
 * ここは前、開いている向きから相手の性別を引いていた。
 * 片方しか開いていないなら「女性」、と名乗る形。
 *
 * その結果、1つの画面に2つの言い方が並んだ。
 *   ヘッダーとボタン  女性に確カメる   （page.tsx に直書き）
 *   本文              実在する異性にも （voice.ts の DEFINITION）
 * 直書きと、ここから引く場所が別々にあったので、食い違った。
 *
 * 言い方は「異性」に1つにする。男女どちらが読んでも、
 * 自分のことだと分かる。製品としてもそちらを向いている。
 *
 * ── そのぶん、断りを隠さない ────────────────────
 * 「異性」と書くと、どちらの向きも開いているように読める。
 * いまは男性からの相談しか受けられない（ASKER_OPEN）。
 *
 * だから notYetNote() を、1画面目に出す。
 * 下のほうに置くと、読まずに申し込む人が出る。
 * scripts/check-copy.mjs が、1画面目にあることを見ている。
 */
export function advisorWord(): string {
  return "異性";
}

/** まだ開いていない向きがあるときの、断り */
export function notYetNote(): string | null {
  if (bothWaysOpen) return null;
  const closed = (Object.keys(ASKER_OPEN) as Gender[]).filter((g) => !ASKER_OPEN[g]);
  if (closed.length === 0) return null;
  const who = closed.map((g) => GENDER_LABEL[g]).join("・");
  return `いま確カメるをお使いいただけるのは、${openAskers()
    .map((g) => GENDER_LABEL[g])
    .join("・")}の方のみです。${who}の方向けは、回答者が揃い次第はじめます。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 言い方が1つであること。
     性別で分岐すると、直書きしている場所と必ず食い違う
     （実際に、ヘッダーは「女性」・本文は「異性」になっていた）。 */
  if (advisorWord() !== "異性") {
    throw new Error(`相手の呼び方が「${advisorWord()}」になっています（「異性」に統一しています）`);
  }

  // 開いていない向きがあるなら、必ず断りが出ること。
  // 「異性」と書く以上、ここが唯一の歯止めになる。
  // 出ていないと、使えない人が申し込んでしまう。
  if (!bothWaysOpen && !notYetNote()) {
    throw new Error("開いていない向きがあるのに、断りが出ていません");
  }
  // 両方開いたら、断りは消えること（残ると嘘になる）。
  if (bothWaysOpen && notYetNote()) {
    throw new Error("両方開いているのに、断りが残っています");
  }

  // 断りに、誰が使えて誰が使えないかが書いてあること。
  const note = notYetNote();
  if (note) {
    if (!/のみです/.test(note)) {
      throw new Error("断りに、いま使える人が書かれていません");
    }
    if (!/揃い次第/.test(note)) {
      throw new Error("断りに、あとで開くことが書かれていません");
    }
  }

  // 少なくとも1つの向きは開いていること。
  // 全部閉じていたら、確カメるを売っていないことになる。
  if (openAskers().length === 0) {
    throw new Error("どの向きも開いていません。確カメるを出せません");
  }

  // 異性であること。同性に聞く形になっていないこと。
  for (const g of ["male", "female"] as const) {
    if (opposite(g) === g) throw new Error("異性の求め方が壊れています");
  }
}
