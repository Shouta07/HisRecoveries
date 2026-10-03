import { STAGE_LABEL } from "../talk/diff";
import type { Stage } from "../talk/shape";
import { MIND_READING } from "../ask/model";

/* ══════════════════════════════════════════════════
   相手の一覧（ボード）
   ══════════════════════════════════════════════════

   ── ここが、このサービスの芯 ────────────────────
   困っているのは「恋愛相談がしたい」ではない。

     withのAさん、昨日何話したっけ
     PairsのBさん、電話いつするんやっけ
     タップルのCさん、これ返信したっけ

   アプリが複数あって、相手が複数いる。
   そのたびに小さな判断が増える。疲れるのはそこ。

   だから、開いて最初に出すのは会話ではなく、この一覧。
   「誰と」「どのアプリで」「どこまで」「次に何を」が
   1画面で分かること。

   ── 点数を付けない ──────────────────────────────
   「脈あり度 72%」のようなものは出さない。
   出した瞬間、恋愛が採点になる。

   出すのは、本人が話したことと、本人が決めたことだけ。

   ── 並べ方で、急かさない ────────────────────────
   「3日連絡していません」のような催促をしない。
   並べる順は、最後に動きがあった順。
   古いものが下に行くが、赤くしたり責めたりしない。 */

/* ══════════════════════════════════════════════════
   やりとりの温度感
   ══════════════════════════════════════════════════

   ── 人を評価しない ──────────────────────────────
   「良好／様子見／停滞」という札を、相手の名前の横に置くと、
   相手を採点しているように読める。

   札が指しているのは、相手ではなく「やりとり」のほう。
   言葉もそう読めるものにする。
     進んでる  ひと息  止まってる

   ── 見えることだけで決める ──────────────────────
   相手の気持ちは使わない（利用規約 第12条）。
   使うのは2つだけ。

     最後に動きがあってから、何日たったか
     次にやることが、決まっているか

   どちらも、本人が話したことと本人が決めたことから出る。
   推測は1つも入れない。 */

export type Heat = "moving" | "pause" | "stalled";

export const HEAT_LABEL: Record<Heat, string> = {
  moving: "進んでる",
  pause: "ひと息",
  stalled: "止まってる",
};

/** 動きが無いとみなす日数 */
const PAUSE_DAYS = 4;
const STALLED_DAYS = 8;

export function heatOf(updatedAt: string, hasNext: boolean, now = Date.now()): Heat {
  const days = Math.floor((now - new Date(updatedAt).getTime()) / 86400000);
  if (days >= STALLED_DAYS) return "stalled";
  if (!hasNext) return "pause";
  if (days >= PAUSE_DAYS) return "pause";
  return "moving";
}

export type BoardCard = {
  id: string;
  /** 呼び名。本名は扱わない */
  who: string;
  /** どこで出会ったか。with / Pairs / タップル など */
  app: string | null;
  /** いまどこまで */
  stage: string | null;
  /** 次にやること。1つだけ */
  next: string | null;
  /** 最後に動いたのはいつか。ISO */
  updatedAt: string;
  /** 画面に出す「最終更新」。今日 / 昨日 / 3日前 */
  since: string;
  /** やりとりの温度感。相手の評価ではない */
  heat: Heat;
  /** 直近に何があったか。1行 */
  recent?: string | null;
  /** 記録の数 */
  records?: number;
};

export type BoardRow = {
  id: string;
  partner_label: string | null;
  dating_app?: string | null;
  current_stage: string | null;
  last_decision: string | null;
  updated_at: string;
  /** 直近に何があったか。episodes の最後の見出しから来る */
  recent?: string | null;
  /** 記録の数 */
  records?: number;
};

/** 名乗りの揺れをそろえる。表記はアプリ側の正式なものに寄せる */
const APP_LABEL: Record<string, string> = {
  with: "with",
  pairs: "Pairs",
  tapple: "タップル",
  tinder: "Tinder",
  omiai: "Omiai",
  bumble: "Bumble",
};

export function appLabel(x: string | null | undefined): string | null {
  if (!x) return null;
  const k = x.trim().toLowerCase();
  return APP_LABEL[k] ?? x.trim().slice(0, 12);
}

export function stageLabel(x: string | null | undefined): string | null {
  if (!x) return null;
  return STAGE_LABEL[x as Stage] ?? null;
}

/** 最後に動いてからの日数を、読める言葉に */
export function sinceLabel(updatedAt: string, now = Date.now()): string {
  const days = Math.floor((now - new Date(updatedAt).getTime()) / 86400000);
  if (days <= 0) return "今日";
  if (days === 1) return "昨日";
  return `${days}日前`;
}

/** 行をカードにする。足さない。無いものは null のまま出す */
export function toCard(r: BoardRow, now = Date.now()): BoardCard {
  const next = (r.last_decision ?? "").trim() || null;
  return {
    id: r.id,
    who: (r.partner_label ?? "").trim() || "名前なし",
    app: appLabel(r.dating_app),
    stage: stageLabel(r.current_stage),
    next,
    updatedAt: r.updated_at,
    since: sinceLabel(r.updated_at, now),
    heat: heatOf(r.updated_at, Boolean(next), now),
    recent: (r.recent ?? "").trim() || null,
    records: r.records,
  };
}

/**
 * 並べる。最後に動いた順。
 *
 * 「次にやることがある人を上に」も考えたが、やめた。
 * やることが無い人（返信を待っている人）が下に沈むと、
 * 待つという判断をしたことまで忘れる。
 */
export function toBoard(rows: BoardRow[], now = Date.now()): BoardCard[] {
  return rows
    .map((r) => toCard(r, now))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

/* ══════════════════════════════════════════════════
   今日やること
   ══════════════════════════════════════════════════

   ── 開いて最初に見るのは、これ ──────────────────
   一覧より先に、「今日は何をすればいいか」を出す。
   そのために来ているので。

   ── 待つことも、やること ────────────────────────
   次の一手が無い相手を、一覧から落とさない。
   「今日は待つ」と出す。待つと決めたことも判断なので。

   ── 急かさない ──────────────────────────────────
   「3日連絡していません」は出さない。赤くしない。
   出すのは、本人が決めたことだけ。 */

export type Todo = {
  id: string;
  who: string;
  /** やること。本人が決めたもの */
  what: string;
  /** 待つだけの人か */
  waiting: boolean;
};

export function todayOf(cards: BoardCard[]): Todo[] {
  return cards.map((c) => ({
    id: c.id,
    who: c.who,
    what: c.next ?? "今日は待つ",
    waiting: !c.next,
  }));
}

/** 一覧の上に出す1行。何人いて、何をすることになっているか */
export function boardLine(cards: BoardCard[]): string {
  if (cards.length === 0) return "まだ誰も登録されていません。";
  const withNext = cards.filter((c) => c.next).length;
  const apps = new Set(cards.map((c) => c.app).filter(Boolean));
  const head = apps.size > 1 ? `${apps.size}つのアプリ・` : "";
  if (withNext === 0) return `${head}${cards.length}人。いま決まっている次の一手はありません。`;
  return `${head}${cards.length}人。次にやることが ${withNext} 件あります。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const rows: BoardRow[] = [
    {
      id: "1", partner_label: "Aさん", dating_app: "with",
      current_stage: "second_date_completed", last_decision: "水族館の日程を決める",
      updated_at: "2026-10-03T10:00:00Z",
    },
    {
      id: "2", partner_label: "Bさん", dating_app: "pairs",
      current_stage: "messaging", last_decision: "電話に誘う",
      updated_at: "2026-10-02T10:00:00Z",
    },
    {
      id: "3", partner_label: "Cさん", dating_app: "tapple",
      current_stage: "first_date_scheduled", last_decision: null,
      updated_at: "2026-10-01T10:00:00Z",
    },
  ];
  const b = toBoard(rows);

  // 最後に動いた順であること。
  if (b[0].who !== "Aさん" || b[2].who !== "Cさん") {
    throw new Error("一覧が、最後に動いた順になっていません");
  }

  // アプリ名が、正式な表記にそろうこと。
  if (b[1].app !== "Pairs" || b[2].app !== "タップル") {
    throw new Error(`アプリ名がそろっていません（${b[1].app} / ${b[2].app}）`);
  }

  // 段階が、画面に出す言葉になること。
  if (b[0].stage !== "2回目デート済み") {
    throw new Error(`段階が画面の言葉になっていません（${b[0].stage}）`);
  }

  /* 次にやることが無い人を、消さないこと。
     返信を待っている人が沈むと、待つと決めたことまで忘れる。 */
  if (b.length !== 3) throw new Error("次にやることが無い人が、落ちています");
  if (b[2].next !== null) throw new Error("無いものを、あることにしています");

  /* 点数を付けないこと。恋愛が採点になる。 */
  const flat = JSON.stringify(b) + boardLine(b);
  if (/脈あり|％|%|点|スコア|確率|ランク/.test(flat)) {
    throw new Error(`一覧に、点数らしきものが出ています（${flat.slice(0, 80)}）`);
  }
  if (MIND_READING.test(flat)) {
    throw new Error("一覧が、相手の気持ちの判定になっています");
  }

  /* 急かさないこと。
     「3日連絡していません」のような催促を出さない。 */
  for (const bad of ["放置", "遅れています", "危険", "要注意", "急いで"]) {
    if (boardLine(b).includes(bad)) {
      throw new Error(`一覧の1行が、急かす言い方になっています（${bad}）`);
    }
  }

  // 1行に、人数と、やることの数が出ること。
  {
    const line = boardLine(b);
    if (!line.includes("3人")) throw new Error(`1行に人数が出ていません（${line}）`);
    if (!line.includes("2 件")) throw new Error(`1行にやることの数が出ていません（${line}）`);
    // アプリが複数なら、それも出ること（これが「複数アプリ横断」の証拠）
    if (!line.includes("3つのアプリ")) {
      throw new Error(`1行に、アプリが複数あることが出ていません（${line}）`);
    }
  }

  // 誰もいないときに、嘘の数を出さないこと。
  if (!boardLine([]).includes("まだ誰も")) {
    throw new Error("誰もいないときの言い方が、ありません");
  }

  /* ══════════════════════════════════════════════
     温度感が、相手の評価にならないこと
     ══════════════════════════════════════════════
     札が指しているのは、相手ではなく「やりとり」。
     言葉もそう読めるものであること。 */
  for (const [k, v] of Object.entries(HEAT_LABEL)) {
    if (/良|悪|優|劣|脈|好|ダメ|有望|見込/.test(v)) {
      throw new Error(`温度感の「${v}」（${k}）が、相手の評価に読めます`);
    }
  }

  /* 見えることだけで決めること。
     日数と、次にやることがあるかどうか。それだけ。 */
  {
    const DAY = 86400000;
    const now = Date.UTC(2026, 9, 10);
    const cases: [number, boolean, Heat][] = [
      [0, true, "moving"],     // 今日動いた。次もある
      [3, true, "moving"],     // 3日前。まだ動いている
      [4, true, "pause"],      // 4日空いた
      [0, false, "pause"],     // 今日動いたが、次が決まっていない
      [8, true, "stalled"],    // 8日空いた
      [30, false, "stalled"],  // ずっと動いていない
    ];
    for (const [days, hasNext, want] of cases) {
      const got = heatOf(new Date(now - days * DAY).toISOString(), hasNext, now);
      if (got !== want) {
        throw new Error(`${days}日前・次${hasNext ? "あり" : "なし"} が ${got} です（${want}）`);
      }
    }
  }

  // 最終更新の言い方。
  {
    const DAY = 86400000;
    const now = Date.UTC(2026, 9, 10);
    for (const [days, want] of [[0, "今日"], [1, "昨日"], [3, "3日前"]] as const) {
      const got = sinceLabel(new Date(now - days * DAY).toISOString(), now);
      if (got !== want) throw new Error(`${days}日前が「${got}」です（${want}）`);
    }
  }

  /* 今日やることに、待つ人も出ること。
     落とすと、待つと決めたことまで忘れる。 */
  {
    const t = todayOf(b);
    if (t.length !== b.length) throw new Error("今日やることから、誰かが落ちています");
    const wait = t.find((x) => x.waiting);
    if (!wait) throw new Error("待つ人が、今日やることに出ていません");
    if (!wait.what.includes("待つ")) {
      throw new Error(`待つ人のやることが「${wait.what}」になっています`);
    }
    // 急かす言い方をしないこと。
    for (const x of t) {
      if (/早く|急いで|放置|遅れ/.test(x.what)) {
        throw new Error(`今日やること「${x.what}」が、急かす言い方です`);
      }
    }
  }

  // 呼び名が空でも、落ちないこと。
  {
    const c = toCard({ ...rows[0], partner_label: null });
    if (!c.who) throw new Error("呼び名が空のとき、カードが壊れています");
  }
}
