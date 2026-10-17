import { LEGS, type Leg } from "./log";

/* ══════════════════════════════════════════════════
   準備の骨格
   ══════════════════════════════════════════════════

   ── チェックリストを、画面に並べない ────────────
   9個のチェックボックスを並べると、未完了リストになる。
   初めての一人旅で、空のチェックボックスが9個見えると、
   行くのが面倒になる。

   lib/trip/log.ts にも同じことを書いて、判定まで置いた。
   「済んだことが、次にやることより多いこと（宿題帳になっています）」

   ── では何に使うか ──────────────────────────────
   NEXT の種にする。

   貼られた文から、どれが済んだかを judge() が読む。
   済んだものは記録として積み、
   まだのものの中から、旅程の順でいちばん早い1つだけを
   「次にやること」として出す。

   本人に見えるのは、いつでも1つ。
   9個あることは、本人は知らなくていい。

   ── 入力フォームは作らない ──────────────────────
   最初のご指示にこうある。
     ※ ユーザーが貼った内容から自動で「済」「未」を判定する。
       入力フォームは作らない

   だから hints は、本人の言葉を拾う形にしてある。
   「eSIM買った」「保険入った」「宿とった」。
   チェックを押させない。

   ── 順番を決め打ちしない ────────────────────────
   パスポートが先、保険が後、のような正解は作らない。
   並び順は旅程（準備→出発→現地）に沿うだけで、
   同じ段の中では、貼られた順に済んでいく。 */

export type Check = {
  id: string;
  /** 次にやることとして出す文。そのまま画面に出る */
  label: string;
  leg: Leg;
  /** 本人の言葉。これが貼られた文にあれば、済とみなす */
  hints: RegExp;
};

export const CHECKS: Check[] = [
  {
    id: "passport",
    label: "パスポートの残りを確かめる",
    leg: "prep",
    hints: /パスポート|旅券/,
  },
  {
    id: "stay",
    label: "泊まるところを決める",
    leg: "prep",
    hints: /宿|ホテル|泊ま|予約(した|済)/,
  },
  {
    id: "sim",
    label: "現地でつながる手段を決める（eSIM など）",
    leg: "prep",
    hints: /esim|sim|ワイファイ|wi-?fi|ポケット|ローミング/i,
  },
  {
    id: "insurance",
    label: "海外旅行保険に入る",
    leg: "prep",
    hints: /保険/,
  },
  {
    id: "money",
    label: "お金の持ち方を決める（両替・カード）",
    leg: "prep",
    hints: /両替|現金|カード|キャッシング|atm/i,
  },
  {
    id: "rideapp",
    label: "配車アプリを入れておく",
    leg: "prep",
    hints: /grab|uber|配車|タクシーアプリ|bolt/i,
  },
  {
    id: "airport",
    label: "空港から宿までの行き方を決める",
    leg: "prep",
    hints: /空港から|空港→|mrt|bts|電車|リムジン|送迎/i,
  },
  {
    id: "emergency",
    label: "困ったときの連絡先を控える（大使館・保険会社）",
    leg: "prep",
    hints: /大使館|領事|緊急|連絡先|保険会社/,
  },
  {
    id: "family",
    label: "家族に日程を伝える",
    leg: "prep",
    hints: /親|家族|実家|日程を(伝|共有|送)/,
  },
];

export type Judged = {
  /** 貼られた文から、済んだと読めたもの */
  done: Check[];
  /** 次にやること。1つだけ。全部済んでいれば null */
  next: Check | null;
};

/**
 * 貼られた文から、どこまで済んだかを読む。
 *
 * 押させない。聞かない。書いてあるものだけ拾う。
 * 書いていないものは「まだ」ではなく「分からない」なので、
 * 済にはしないが、責めもしない。
 */
export function judge(text: string, alreadyDone: string[] = []): Judged {
  const had = new Set(alreadyDone);
  const done: Check[] = [];
  for (const c of CHECKS) {
    if (had.has(c.id) || c.hints.test(text)) done.push(c);
  }
  const doneIds = new Set(done.map((c) => c.id));
  // 旅程の順で、まだのものの先頭を1つだけ
  const rest = CHECKS.filter((c) => !doneIds.has(c.id)).sort(
    (a, b) => LEGS.indexOf(a.leg) - LEGS.indexOf(b.leg),
  );
  return { done, next: rest[0] ?? null };
}

/** 全部済んだときに出す1行。数えて見せない */
export function allDoneLine(): string {
  return "準備でやることは、ひととおり済んでいます。";
}

/* ── 公開の前に止めること ───────────────────────── */
{
  if (CHECKS.length < 5) throw new Error(`準備の骨格が ${CHECKS.length} 個しかありません`);
  /* 増やしすぎないこと。
     多いほど「まだ終わらない」が長くなる。
     初めての一人旅に、本当に要るものだけ。 */
  if (CHECKS.length > 12) {
    throw new Error(`準備の骨格が ${CHECKS.length} 個あります（12個まで）。多いほど、終わらなく感じます`);
  }

  const ids = new Set<string>();
  for (const c of CHECKS) {
    if (ids.has(c.id)) throw new Error(`準備の骨格のID「${c.id}」が重なっています`);
    ids.add(c.id);
    if (c.label.length > 30) {
      throw new Error(`「${c.label}」が ${c.label.length} 字あります（30字まで）`);
    }
    /* 次にやることとして、そのまま出る文。
       「〜しましたか？」のような問いにしない。問われると宿題になる。 */
    if (/[?？]|ですか|ましたか/.test(c.label)) {
      throw new Error(`「${c.label}」が問いかけになっています。次にやることとして出す文です`);
    }
    /* 急かさないこと。 */
    for (const w of ["必ず", "忘れずに", "絶対", "早めに", "急いで"]) {
      if (c.label.includes(w)) {
        throw new Error(`「${c.label}」に「${w}」が入っています。急かさないでください`);
      }
    }
  }

  /* ── 出すのは、いつでも1つだけ ──────────────────
     ここがこの仕組みの全部。
     2つ出た時点で、本人はどちらからやるかを考えることになる。 */
  {
    const r = judge("");
    if (!r.next) throw new Error("何も貼っていないのに、やることが無くなっています");
    if (r.done.length !== 0) throw new Error("何も貼っていないのに、済んだことがあります");
  }
  {
    const r = judge("宿はスクンビットに取った。eSIMも買った。");
    if (r.done.length !== 2) {
      throw new Error(`貼った文から ${r.done.length} 個読めました（宿とeSIMの2つのはず）`);
    }
    if (!r.next) throw new Error("まだ残っているのに、次にやることが出ていません");
    if (r.done.some((c) => c.id === r.next?.id)) {
      throw new Error("済んだものが、次にやることとして出ています");
    }
  }
  {
    // 全部済んだら、責めずに終わること
    const all = CHECKS.map((c) => c.id);
    const r = judge("", all);
    if (r.next) throw new Error("全部済んでいるのに、次にやることが出ています");
    if (!allDoneLine().includes("済んで")) {
      throw new Error("全部済んだときの1行が、済んだことを言っていません");
    }
    for (const w of ["残り", "あと", "未", "完了率", "％", "%"]) {
      if (allDoneLine().includes(w)) {
        throw new Error(`全部済んだときの1行に「${w}」が入っています。数えて見せないでください`);
      }
    }
  }

  /* 旅程の段が、記録と同じ語彙であること。 */
  for (const c of CHECKS) {
    if (!(LEGS as string[]).includes(c.leg)) {
      throw new Error(`「${c.label}」の段「${c.leg}」が、log.ts のものと食い違っています`);
    }
  }
}
