import { plan, type PlanId } from "./plans";

// 人数が集まらなかったとき。
//
// ══════════════════════════════════════════════════
// 「5人集まりませんでした」で終わらせない
// ══════════════════════════════════════════════════
// ここを放っておくと、いちばん信用を失う。
// 払ったのに揃わない、何の連絡も無い、問い合わせるしかない。
//
// なので、一定の時間が過ぎたら、こちらから3つ出す。
//   1 集まった分だけ受け取って、足りない分は返す
//   2 条件を少し広げて、もう少し待つ
//   3 全部返す
//
// 選ぶのは相談した人。こちらで勝手に決めない。
// ここまで自動にしておけば、供給が足りない日でも
// 問い合わせ対応が積み上がらない。

/** これを過ぎたら選択肢を出す */
export const WAIT_MINUTES = 30;

export type Choice = {
  id: "partial" | "widen" | "full";
  label: string;
  note: string;
};

export function choices(planId: PlanId, got: number, want: number): Choice[] {
  const p = plan(planId);
  const back = refundFor(p.yen, got, want);

  const list: Choice[] = [];

  // 1件でも届いているときだけ、「集まった分だけ受け取る」を出す。
  if (got > 0) {
    list.push({
      id: "partial",
      label: `${got}人分を受け取る`,
      note: `足りなかった${want - got}人分 ¥${back.toLocaleString()} をお返しします。`,
    });
  }

  list.push({
    id: "widen",
    label: "条件を少し広げて待つ",
    note: "年代や条件をゆるめて、もう一度お声がけします。追加のお支払いはありません。",
  });

  list.push({
    id: "full",
    label: "全額返してもらう",
    note: `¥${p.yen.toLocaleString()} を全額お返しします。届いた回答は見られなくなります。`,
  });

  return list;
}

/**
 * 足りなかった分の返金額。
 *
 * 人数で割る。端数は相談した人のほうへ寄せる（切り上げ）。
 * こちらに有利な丸め方をしない。
 */
export function refundFor(yen: number, got: number, want: number): number {
  if (want <= 0) return 0;
  const missing = Math.max(0, want - got);
  if (missing === 0) return 0;
  if (missing >= want) return yen;
  return Math.ceil((yen * missing) / want);
}

/** 待たせすぎていないか */
export function needsChoice(paidAt: string | null, got: number, want: number): boolean {
  if (!paidAt || got >= want) return false;
  const passed = (Date.now() - new Date(paidAt).getTime()) / 60000;
  return passed >= WAIT_MINUTES;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 端数がこちらに有利にならないこと。
  // 2,980円で3/5なら、返すのは1,192円。切り捨てると1,192→1,192。
  // 端数が出る組み合わせで確かめる。
  if (refundFor(2980, 3, 5) !== 1192) {
    throw new Error(`足りない分の返金額が合いません: ${refundFor(2980, 3, 5)}`);
  }
  if (refundFor(2980, 4, 5) !== 596) {
    throw new Error("4/5 のときの返金額が合いません");
  }
  // 1件も届いていないなら全額。
  if (refundFor(2980, 0, 5) !== 2980) throw new Error("0件のときに全額になっていません");
  // 揃っていたら返さない。
  if (refundFor(2980, 5, 5) !== 0) throw new Error("揃っているのに返金額が出ています");

  // 全額返金の選択肢が、必ずあること。
  // ここを外すと、返してもらえない設計になる。
  const c = choices("final_check", 3, 5);
  if (!c.some((x) => x.id === "full")) {
    throw new Error("全額返金の選択肢がありません");
  }
  // 1件も無いのに「集まった分を受け取る」を出さないこと。
  if (choices("final_check", 0, 5).some((x) => x.id === "partial")) {
    throw new Error("0件なのに「集まった分を受け取る」が出ています");
  }
}
