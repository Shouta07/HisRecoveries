import type { Reviewer } from "./today";
import type { DayReviewer, Window } from "./schedule";
import { atJst } from "./schedule";

// 受付の見本。
//
// ══════════════════════════════════════════════════
// なぜ見本を出すのか
// ══════════════════════════════════════════════════
// 審査を通った人が0人のあいだ、この節は出なかった。
// そうすると「誰かが受け付けていて、そこへ届く」という
// 仕組みそのものが、文章でしか伝わらない。
//
// 仕組みを見せるために、動いている形を出す。
//
// ══════════════════════════════════════════════════
// 見本だと、必ず書く
// ══════════════════════════════════════════════════
// 「いま2人 受付中」と書いて実際は0人だと、
// 相談を送った人が最初に気づく。そして二度と来ない。
//
// このサイトは前から、見本には見本と書いてきた
//   「※ 写真はイメージ、文面と回答は画面の見本です」
// ここも同じ扱いにする。小さな※ではなく、札を付ける。
//
// ══════════════════════════════════════════════════
// 実績は書かない
// ══════════════════════════════════════════════════
// 見本の人に「これまで42件」と書くと、
// 見本の札があっても、サービスの実績として読まれる。
// 出すのは、年代・確認済み・得意な相談・受付時間だけ。
// 仕組みを見せるのに、件数は要らない。
//
// ══════════════════════════════════════════════════
// 本物が1人でも入ったら、消える
// ══════════════════════════════════════════════════
// 本物と見本を混ぜない。混ぜた瞬間、
// どれが本物か誰にも分からなくなる（判定が落とす）。

/** 今日の、この時刻（JST）。見本の受付時間を今日のものにする */
function todayJst(hour: number, minute = 0): string {
  const now = new Date();
  // JST の「今日」の日付を出す
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = jst.getUTCMonth();
  const d = jst.getUTCDate();
  // JST の hour:minute を UTC に戻す
  return new Date(Date.UTC(y, m, d, hour - 9, minute, 0)).toISOString();
}

/**
 * 見本の受付。
 *
 * 呼び名は、実在の登録者のものではない。
 * 年代と得意な相談は、実際に選べる区分から取っている
 * （ここだけ架空の区分を作ると、押した先で行き止まりになる）。
 */
/**
 * 受付の時間を、1日に散らす。
 *
 * 最初は全員を夜（18〜24時）に置いていた。
 * そうすると昼に来た人には、4人とも「本日の受付は終了」に見える。
 * 仕組みを見せるための見本なのに、動いていないものを見せることになる。
 *
 * 実際の受付は夜に寄るはずだが、
 * ここは「いま受け付けている人がいて、時間で入れ替わる」という
 * 形を見せるためのものなので、昼から夜まで重ねて並べる。
 */
const WINDOWS: {
  id: string;
  name: string;
  ageBand: string;
  from: [number, number];
  to: [number, number];
  specialties: Reviewer["specialties"];
  /** イメージ写真。見本なので、既にある5枚から当てる */
  face: string;
  /** 受付の時間内でも、手が一杯の状態を見せる人 */
  alwaysBusy?: boolean;
}[] = [
  { id: "sample-1", name: "みさき", ageBand: "25-29", from: [10, 0], to: [15, 0], specialties: ["message", "date"], face: "w2" },
  { id: "sample-2", name: "あや", ageBand: "20-24", from: [13, 0], to: [19, 0], specialties: ["signal"], face: "w1" },
  { id: "sample-3", name: "りこ", ageBand: "25-29", from: [17, 0], to: [22, 0], specialties: ["photo", "message"], alwaysBusy: true, face: "w3" },
  { id: "sample-4", name: "まい", ageBand: "30s", from: [20, 0], to: [24, 0], specialties: ["distance"], face: "w4" },
];

export function sampleReviewers(): Reviewer[] {
  const now = Date.now();

  return WINDOWS.map((w) => {
    const from = todayJst(w.from[0], w.from[1]);
    const to = todayJst(w.to[0], w.to[1]);
    const inWindow =
      now >= new Date(from).getTime() && now < new Date(to).getTime();
    const status: Reviewer["status"] = inWindow
      ? w.alwaysBusy
        ? "busy"
        : "available"
      : "offline";

    return {
      id: w.id,
      name: w.name,
      ageBand: w.ageBand,
      status,
      specialties: w.specialties,
      face: w.face,
      verified: true,
      answered: 0,
      until: status === "available" ? to : null,
      // 受付中でないときは、次にいつ受け付けるか。
      // すでに終わった時間でも、今日の予定として出す
      nextAt: status === "offline" ? from : null,
    };
  }).sort((a, b) => {
    const rank = (s: Reviewer["status"]) =>
      s === "available" ? 0 : s === "busy" ? 1 : 2;
    return rank(a.status) - rank(b.status);
  });
}

/** 見本に付ける札。小さな※にしない */
export const SAMPLE_BADGE = "画面の見本";

/** 札の下に書く断り */
export const SAMPLE_NOTE =
  "受付の見せ方の見本です。いま登録が済んだ人はいません。実際に受け付けている人がいるときは、その人が出ます。";

/* ── 公開の前に止めること ───────────────────────── */
{
  const list = sampleReviewers();

  // 実績を書かない。見本の札があっても、件数は実績として読まれる。
  for (const r of list) {
    if (r.answered !== 0) {
      throw new Error(`見本「${r.name}」に件数が入っています（実績として読まれます）`);
    }
  }

  // 断りに、いま誰もいないことが書かれていること。
  // 「見本です」だけだと、見せ方が見本なのか、
  // 人が見本なのかが分からない。
  if (!SAMPLE_NOTE.includes("いま登録が済んだ人はいません")) {
    throw new Error("見本の断りに、いま誰もいないことが書かれていません");
  }
  // 本物が入ったら入れ替わることも書く。
  if (!SAMPLE_NOTE.includes("実際に受け付けている人がいるときは")) {
    throw new Error("見本の断りに、本物が出たら入れ替わることが書かれていません");
  }

  // 札が、見ただけで見本だと分かる言葉であること。
  if (!/見本|イメージ|サンプル/.test(SAMPLE_BADGE)) {
    throw new Error(`見本の札が、見本だと分かりません（${SAMPLE_BADGE}）`);
  }

  // 見本のIDは、必ず sample- で始まること。
  // 本物と混ざったときに、どちらか見分けられるようにする。
  for (const r of list) {
    if (!r.id.startsWith("sample-")) {
      throw new Error(`見本のIDが「sample-」で始まっていません（${r.id}）`);
    }
  }

  // 受付中だけを並べない。
  // 全員が受付中の見本を出すと、いつ来ても全員いることになる。
  // 実際には時間で入れ替わるので、その形を見せる。
  if (!list.some((r) => r.status === "offline")) {
    throw new Error("見本が、常に全員受付中になっています（時間で入れ替わる形を見せてください）");
  }

  // 昼に来た人に、全員「本日の受付は終了」を見せない。
  // 仕組みを見せるための見本なのに、動いていないものを見せることになる。
  //
  // 10時から24時のあいだ、1時間ごとに数えて、
  // 受付中か対応中の人が1人はいること。
  {
    const span = (w: (typeof WINDOWS)[number]) =>
      [w.from[0] * 60 + w.from[1], w.to[0] * 60 + w.to[1]] as const;
    for (let h = 10; h < 24; h++) {
      const m = h * 60;
      const live = WINDOWS.filter((w) => {
        const [a, b] = span(w);
        return m >= a && m < b;
      });
      if (live.length === 0) {
        throw new Error(
          `見本の受付が、${h}時台に1人もいません（その時間に来た人には、動いていないものが見えます）`,
        );
      }
    }
  }
}


/**
 * 見本の時間割。
 *
 * 日付を渡すと、その日の受付予定を返す。
 * 今日以外でも同じ形で受け付けている見本にする
 * （日を送ったら全部空になると、送る意味が無くなる）。
 */
export function sampleDay(date: string): DayReviewer[] {
  const base = sampleReviewers();
  return WINDOWS.map((w) => {
    const r = base.find((x) => x.id === w.id)!;
    const win: Window = {
      start: atJst(date, w.from[0], w.from[1]),
      end: atJst(date, w.to[0], w.to[1]),
    };
    return { ...r, windows: [win] };
  });
}
