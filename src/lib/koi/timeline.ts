import { STAGE_LABEL } from "../talk/diff";
import type { Stage } from "../talk/shape";

/* ══════════════════════════════════════════════════
   相手ごとの、ここまで
   ══════════════════════════════════════════════════

   ── 「毎回、最初から説明しなくていい」の中身 ──────
   それを文字で主張しても伝わらない。
   実際に、いつ何があったかが並んでいれば伝わる。

     9/20  withでマッチ
     9/26  初回電話
     9/30  初デート
     10/2  デート後に話した
     10/3  2回目を検討

   ── 作らない ────────────────────────────────────
   ここに出るのは、本人が話したことから残ったものだけ。
   「返信が遅くなっています」のような、こちらが数えた指標は出さない。
   数え始めると、恋愛が計測になる。

   ── 古い順に並べる ──────────────────────────────
   一覧（board）は新しい順。あちらは「いま何をするか」を見る場所。
   こちらは「どう進んできたか」を見る場所なので、古い順。 */

export type TimelineItem = {
  /** 画面に出す日付。9/20 の形 */
  date: string;
  /** 何があったか */
  what: string;
  /** その回に決めた、次にやること */
  next?: string | null;
};

export type EpisodeRow = {
  episode_number: number;
  title: string;
  next_action: string | null;
  occurred_at?: string | null;
  created_at?: string | null;
};

/** 月/日。年は出さない（同じ年のうちに何度も見る場所なので） */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 段階が変わったことを、1行として足す */
export function stageItem(stage: string | null, at: string | null): TimelineItem | null {
  const label = stage ? STAGE_LABEL[stage as Stage] : null;
  if (!label || !at) return null;
  return { date: shortDate(at), what: label };
}

export function toTimeline(rows: EpisodeRow[]): TimelineItem[] {
  return rows
    .map((r) => ({
      date: shortDate(r.occurred_at ?? r.created_at),
      what: r.title,
      next: r.next_action,
      n: r.episode_number,
    }))
    .sort((a, b) => a.n - b.n)
    .map(({ date, what, next }) => ({ date, what, next }));
}

/* ── 公開の前に止めること ───────────────────────── */
{
  const rows: EpisodeRow[] = [
    { episode_number: 2, title: "初デート", next_action: "お礼を送る", created_at: "2026-09-30T10:00:00Z" },
    { episode_number: 1, title: "初回電話", next_action: "デートに誘う", created_at: "2026-09-26T10:00:00Z" },
    { episode_number: 3, title: "2回目を検討", next_action: "水族館の日程を決める", created_at: "2026-10-03T10:00:00Z" },
  ];
  const t = toTimeline(rows);

  // 古い順であること。進んできた順に読める形にする。
  if (t[0].what !== "初回電話" || t[2].what !== "2回目を検討") {
    throw new Error("ここまでが、古い順に並んでいません");
  }
  // 日付が、月/日で出ること。
  if (t[0].date !== "9/26") throw new Error(`日付の形が違います（${t[0].date}）`);

  /* こちらが数えた指標を出さないこと。
     「返信が3日ありません」を出し始めると、恋愛が計測になる。 */
  const flat = JSON.stringify(t);
  for (const bad of ["日間", "回数", "頻度", "％", "%", "スコア", "率"]) {
    if (flat.includes(bad)) {
      throw new Error(`ここまでに、数えた指標（${bad}）が出ています`);
    }
  }

  // 日付が無いものでも、落ちないこと。
  {
    const x = toTimeline([{ episode_number: 1, title: "話した", next_action: null }]);
    if (x.length !== 1) throw new Error("日付が無いと、行が落ちています");
  }

  // 段階の行が、画面の言葉で出ること。
  {
    const si = stageItem("first_date_completed", "2026-09-30T10:00:00Z");
    if (si?.what !== "初回デート済み") throw new Error("段階が画面の言葉になっていません");
    if (stageItem(null, null) !== null) throw new Error("段階が無いのに、行を作っています");
  }
}
