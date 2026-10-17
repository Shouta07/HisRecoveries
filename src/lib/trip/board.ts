import { CITIES } from "../voice";

/* ══════════════════════════════════════════════════
   旅ごとの記録
   ══════════════════════════════════════════════════

   ── 単位が、相手から旅に変わった ────────────────
   マチアプ版は「相手1人＝1枚」だった。
   旅版は「1回の旅＝1枚」。

     バンコク 11/14〜11/17（準備中）
     済   宿確定（スクンビット）
     NEXT 空港→宿の移動手段を決める

   ── 段階は3つだけ ──────────────────────────────
   準備中 ／ 旅行中 ／ 帰国後。

   マチアプ版の「進んでる／ひと息／止まってる」は、
   こちらが相手との関係を採点している形だった。
   旅は日付で決まるので、採点にならない。そこが良い。

   日付から出す。手で切り替えさせない。
   切り替えを本人にやらせると、旅行中に誰も押さない。

   ── 急かさない ──────────────────────────────────
   「あと3日なのに5件残っています」とは出さない。
   出すのは、次にやること1つだけ。

   残りの数を数えて見せるのは、量であって、遅れではない。
   初めての一人旅で、残り件数を赤く出されると、
   それだけで行くのが怖くなる。 */

export type Phase = "before" | "during" | "after";

export const PHASE_LABEL: Record<Phase, string> = {
  before: "準備中",
  during: "旅行中",
  after: "帰国後",
};

export type TripRow = {
  id: string;
  city: string;
  /** 出発日・帰国日。YYYY-MM-DD */
  departAt: string;
  returnAt: string;
  /** 済んだこと。直近の1つ */
  done: string | null;
  /** 次にやること。無ければ null（「いまは待つ」ではなく出さない） */
  next: string | null;
  records: number;
  updatedAt: string;
};

export type TripCard = {
  id: string;
  city: string;
  /** 11/14〜11/17 */
  dates: string;
  phase: Phase;
  /** 出発まで何日か。旅行中・帰国後は null */
  daysToGo: number | null;
  done: string | null;
  next: string | null;
  records: number;
  since: string;
};

const DAY = 86400000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** 日付から段階を出す。手で切り替えさせない */
export function phaseOf(departAt: string, returnAt: string, now = new Date()): Phase {
  const t = startOfDay(now);
  const d = startOfDay(new Date(departAt));
  const r = startOfDay(new Date(returnAt));
  if (t < d) return "before";
  if (t <= r) return "during";
  return "after";
}

/** 11/14〜11/17 */
export function datesLabel(departAt: string, returnAt: string): string {
  const f = (s: string) => {
    const d = new Date(s);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  return `${f(departAt)}〜${f(returnAt)}`;
}

/** 更新がいつか。今日／昨日／3日前 */
export function sinceLabel(updatedAt: string, now = new Date()): string {
  const n = Math.floor((startOfDay(now) - startOfDay(new Date(updatedAt))) / DAY);
  if (n <= 0) return "今日";
  if (n === 1) return "昨日";
  return `${n}日前`;
}

export function toCard(r: TripRow, now = new Date()): TripCard {
  const phase = phaseOf(r.departAt, r.returnAt, now);
  const toGo = Math.round((startOfDay(new Date(r.departAt)) - startOfDay(now)) / DAY);
  return {
    id: r.id,
    city: r.city,
    dates: datesLabel(r.departAt, r.returnAt),
    phase,
    daysToGo: phase === "before" ? toGo : null,
    done: r.done,
    next: r.next,
    records: r.records,
    since: sinceLabel(r.updatedAt, now),
  };
}

export function toBoard(rows: TripRow[], now = new Date()): TripCard[] {
  return rows.map((r) => toCard(r, now));
}

/**
 * 一覧の上に出す1行。
 *
 * 数えられるものだけ出す。
 * 「準備が40%終わっています」は出さない（分母を決められない）。
 */
export function boardLine(cards: TripCard[]): string {
  if (cards.length === 0) return "まだ旅がありません。";
  const next = cards.filter((c) => c.next).length;
  const head = `${cards.length}つの旅`;
  if (next === 0) return `${head}。いま、やることはありません。`;
  return `${head}。次にやることが ${next} 件あります。`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  /* 段階は3つだけ。増やすと、本人に切り替えを意識させる。 */
  const phases = Object.keys(PHASE_LABEL);
  if (phases.length !== 3) {
    throw new Error(`段階が ${phases.length} 個あります（準備中・旅行中・帰国後の3つ）`);
  }

  /* 採点に読める言葉を、段階に使わないこと。
     マチアプ版は「進んでる／止まってる」で、
     相手との関係を採点している形になっていた。 */
  for (const v of Object.values(PHASE_LABEL)) {
    for (const w of ["順調", "遅れ", "停滞", "危険", "要注意", "未完了", "不足"]) {
      if (v.includes(w)) {
        throw new Error(`段階の名前「${v}」が、採点に読めます`);
      }
    }
  }

  /* 日付から出ること。手で切り替える形になっていないこと。 */
  {
    const d = "2026-11-14";
    const r = "2026-11-17";
    const at = (s: string) => new Date(`${s}T12:00:00`);
    if (phaseOf(d, r, at("2026-11-01")) !== "before") throw new Error("出発前が準備中になっていません");
    if (phaseOf(d, r, at("2026-11-14")) !== "during") throw new Error("出発日が旅行中になっていません");
    if (phaseOf(d, r, at("2026-11-17")) !== "during") throw new Error("帰国日が旅行中になっていません");
    if (phaseOf(d, r, at("2026-11-18")) !== "after") throw new Error("帰国の翌日が帰国後になっていません");
  }

  /* 急かさないこと。
     残り件数や日数を、焦らせる形で出していないか。 */
  {
    const line = boardLine([
      { id: "x", city: CITIES[0], dates: "11/14〜11/17", phase: "before", daysToGo: 3,
        done: null, next: "空港→宿の移動手段を決める", records: 2, since: "今日" },
    ]);
    for (const w of ["あと", "まだ", "残り", "急", "早く", "間に合"]) {
      if (line.includes(w)) {
        throw new Error(`一覧の1行「${line}」が、急かす言い方になっています`);
      }
    }
  }

  /* やることが無いときに、空で終わらせないこと。
     「やることがありません」だけだと、何もしていないことを突きつける形になる。 */
  if (!boardLine([]).includes("まだ")) {
    throw new Error("旅が1つも無いときの1行が、ありません");
  }
}
