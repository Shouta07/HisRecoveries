/* ══════════════════════════════════════════════════
   β の枠
   ══════════════════════════════════════════════════

   ── 「通常¥2,980を今だけ¥1,980」とは書かない ──────
   一度も売っていない価格を通常価格として並べるのは、
   景品表示法の有利誤認（二重価格表示）に当たる。
   比較に使える「通常価格」は、実際に相当期間売っていた価格だけ。

   書くのは、これからの値段。
     「先着100人は月¥1,980。恋亀との会話が入ったら¥2,980」

   過去ではなく未来を言うので、二重価格にならない。
   そして「値引き中」より「値上げ前」のほうが、締め切りとして効く。

   ── 言った以上、本当に上げる ────────────────────
   「101人目から¥2,980」と書いて上げないと、それも有利誤認になる。
   枠はコードが数える。人が数えない。

   ── 枠が埋まったかは、売る前に見る ────────────────
   埋まったあとに¥1,980のまま決済が通ると、約束と実際がずれる。
   口（/api/pass/checkout）が、毎回ここを見てから Price を決める。 */

import { dbSelect } from "../db";
import { BETA_YEN, BETA_SEATS, PASS_YEN, BETA_AFTER_VOICE } from "./entitle";

/** 値上げするなら、上がったあとの値段も案内に書く */
const BETA_NEEDS_PRICE_IN_LINE: Record<typeof BETA_AFTER_VOICE, boolean> = {
  keep: false,
  raise: true,
};

/** 月額として生きている状態。解約済み・未払いは数えない */
const LIVE = ["trialing", "active", "past_due"];

export type Seats = {
  /** β で埋まった数 */
  taken: number;
  /** 残り。0 なら通常価格 */
  left: number;
  /** いま申し込む人の月額 */
  yen: number;
  /** β価格が適用されるか */
  beta: boolean;
};

/**
 * いまの枠を数える。
 *
 * 数え方を「β価格で入った人」ではなく「月額で生きている人」にしてある。
 * β価格のIDで数えると、解約して入り直した人が枠を二重に食う。
 * 先着100人は「最初の100契約」であって「最初の100決済」ではない。
 */
export async function seats(): Promise<Seats> {
  const rows = await dbSelect<{ id: string }>(
    `subscriptions?status=in.(${LIVE.join(",")})&select=id`,
  );
  const taken = rows.length;
  const left = Math.max(0, BETA_SEATS - taken);
  return {
    taken,
    left,
    yen: left > 0 ? BETA_YEN : PASS_YEN,
    beta: left > 0,
  };
}

/**
 * 画面に出す、枠の言葉。
 *
 * 残り数を出すのは、残っているあいだだけ。
 * 埋まったあとに「先着100人は終了しました」と出し続けると、
 * 入れなかった人に損をした気持ちだけが残る。
 */
export function seatLine(s: Seats): string | null {
  if (!s.beta) return null;
  const after =
    BETA_AFTER_VOICE === "keep"
      ? "この価格のままご利用いただけます"
      : "恋亀との会話が入るときに月¥" + PASS_YEN.toLocaleString() + "へ変わります（1か月前にお知らせします）";
  return `先着${BETA_SEATS}名さまは月¥${BETA_YEN.toLocaleString()}（残り${s.left}名）。${after}。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 枠が埋まったら通常価格になること。ここが壊れると、
  // 101人目にも β 価格で売ってしまう。
  const full = { taken: BETA_SEATS, left: 0, yen: PASS_YEN, beta: false };
  if (full.yen !== PASS_YEN) throw new Error("枠が埋まっても β 価格のままです");
  if (seatLine(full) !== null) throw new Error("枠が埋まったあとも、先着の案内が出ます");

  // 残っているあいだは、値段と、このあとどうなるかの両方を言うこと。
  //
  // 金額は toLocaleString() で出すので「1,980」とカンマが入る。
  // String(BETA_YEN) で探すと必ず外れる（最初それで落ちた）。
  const open = { taken: 0, left: BETA_SEATS, yen: BETA_YEN, beta: true };
  const line = seatLine(open) ?? "";
  if (!line.includes(BETA_YEN.toLocaleString())) {
    throw new Error("先着の案内に、β の値段が書かれていません");
  }
  if (
    BETA_NEEDS_PRICE_IN_LINE[BETA_AFTER_VOICE] &&
    !line.includes(PASS_YEN.toLocaleString())
  ) {
    throw new Error("値上げするのに、上がったあとの値段が書かれていません");
  }

  // 「通常」「定価」「割引」を書かないこと。二重価格表示になる。
  for (const t of [seatLine(open) ?? ""]) {
    if (/通常価格|定価|本来|割引|OFF|オフ|%off/i.test(t)) {
      throw new Error(`先着の案内「${t}」が、二重価格表示になっています`);
    }
  }
}
