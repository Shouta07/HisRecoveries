import { dbAdminEnabled } from "./db";
import { stripeEnabled } from "./stripe";
import { canCharge, missingLegal } from "./legal";

// 売れる状態か。
//
// ══════════════════════════════════════════════════
// なぜ1か所にまとめるか
// ══════════════════════════════════════════════════
// 決済までには、揃っていないと動かないものが3つある。
//   データベース  相談を保存する先
//   Stripe        お金を受け取る口
//   特商法の表記   通信販売で対価を受け取るのに要る
//
// これまで、この3つは別々の場所で見ていた。
// その結果、相談を保存する口（/api/consult）だけ
// データベースの確認をしていなかった。
//
// 設定が無いと、保存は黙って成功したことになり、
// 行が返ってこないまま先へ進んで、どこかで落ちる。
// 画面には upstream の文字がそのまま出る。
// 本番で「internal error」とだけ出ていたのは、これ。
//
// ══════════════════════════════════════════════════
// 書く前に言う
// ══════════════════════════════════════════════════
// いちばん悪いのは、300字書いたあとに止まること。
// 書いた時間が丸ごと無駄になる。
//
// 足りないものがあるなら、書き始める前の画面で言う。
// このファイルを、画面もAPIも同じように見る。
//
// ══════════════════════════════════════════════════
// 理由を隠さない
// ══════════════════════════════════════════════════
// 「エラーが発生しました」で終わらせない。
// 何が足りないのかを、運営が見れば分かる形で返す。
// ただし鍵の中身は出さない（名前だけ）。

export type Missing = { key: string; label: string };

/** 足りないもの。空なら売れる */
export function missingToSell(): Missing[] {
  const out: Missing[] = [];
  if (!dbAdminEnabled) {
    out.push({ key: "db", label: "相談を保存する先（Supabase）" });
  }
  if (!stripeEnabled) {
    out.push({ key: "stripe", label: "お支払いの口（Stripe）" });
  }
  for (const f of missingLegal()) {
    out.push({ key: `legal:${f.key}`, label: `特定商取引法の表記（${f.label}）` });
  }
  return out;
}

/** いま相談を受け取れるか */
export function readyToSell(): boolean {
  return missingToSell().length === 0;
}

/**
 * 相談する人に出す言葉。
 *
 * 何が足りないかは書かない（Supabase と言われても分からない）。
 * 書くのは、いまどうなっていて、どうすればいいか。
 */
export const NOT_READY_USER =
  "いま新しい相談を受け付けられません。準備が終わるまでお待ちください。書いた内容は送られていません。";

/** 運営が見れば分かる言葉。ログとAPIの返事に付ける */
export function whyNotReady(): string | null {
  const miss = missingToSell();
  if (miss.length === 0) return null;
  return `準備ができていません: ${miss.map((m) => m.label).join(" / ")}`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 相談する人に出す言葉に、こちらの都合の言葉を混ぜない。
  // 「Supabase」「Stripe」「環境変数」と言われても、読む人には何も分からない。
  for (const bad of ["Supabase", "Stripe", "環境変数", "API", "サーバー"]) {
    if (NOT_READY_USER.includes(bad)) {
      throw new Error(`受け付けられないときの言葉に「${bad}」が入っています`);
    }
  }
  // 書いたものがどうなったかを、必ず書く。
  // ここが無いと、送れたのかどうかが分からないまま終わる。
  if (!NOT_READY_USER.includes("送られていません")) {
    throw new Error("受け付けられないときの言葉に、送られていないことが書かれていません");
  }
  // 特商法だけは、決済の判定（canCharge）と食い違わないこと。
  // 片方だけ直すと、画面は出るのに決済で落ちる、が起きる。
  if (canCharge() !== (missingLegal().length === 0)) {
    throw new Error("特商法の判定が、決済の判定と食い違っています");
  }
}
