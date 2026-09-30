import type { Reviewer, Status } from "./today";

// 受付の時間割。
//
// ══════════════════════════════════════════════════
// 縦に探させない。横に比べさせる
// ══════════════════════════════════════════════════
// 1人ずつカードを開いて空きを探す形にしない。
// 「20時なら誰が空いているか」を、開いたまま比べられること。
//
//   横 = 人
//   縦 = 時刻
//   上 = 日付
//
// ══════════════════════════════════════════════════
// 空いていない時間を、空いているように見せない
// ══════════════════════════════════════════════════
// 過ぎた時間は押せない。
// 受付の予定が無い時間は、空欄ではなく「受付なし」と分かる形にする。
// 空欄にすると、まだ読み込み中なのか、受け付けていないのかが分からない。
//
// ══════════════════════════════════════════════════
// 記号だけに頼らない
// ══════════════════════════════════════════════════
// ●と○の違いが分からない人がいる。
// 画面には記号を出すが、読み上げ用の言葉を必ず付ける。

/** 受付の予定1本 */
export type Window = { start: string; end: string };

/** 時間割に出す1人 */
export type DayReviewer = Reviewer & { windows: Window[] };

/** ひと枠の状態 */
export type SlotState = "now" | "open" | "busy" | "past" | "closed";

export type Slot = {
  /** その枠の開始（ISO） */
  at: string;
  state: SlotState;
};

/** 枠の長さ（分）。15分に変えられるように、ここだけ見る */
export const SLOT_MINUTES = 30;

/** 出す時間の既定。予定が無い日はこの幅で空の表を出す */
export const DEFAULT_FROM_HOUR = 18;
export const DEFAULT_TO_HOUR = 24;

/** 記号と、読み上げ用の言葉 */
export const SLOT_MARK: Record<SlotState, { mark: string; label: string }> = {
  now: { mark: "●", label: "今すぐ話せます" },
  open: { mark: "○", label: "予約できます" },
  busy: { mark: "対応中", label: "いま対応中です" },
  past: { mark: "", label: "終わった時間です" },
  closed: { mark: "－", label: "受付なし" },
};

/** JST の時刻だけ（18:30） */
export function hhmm(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(iso));
}

/** JST の YYYY-MM-DD */
export function ymd(d: Date): string {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** その日の、JST の時刻を UTC の ISO で */
export function atJst(date: string, hour: number, minute = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  // 24時は翌日の0時として扱う
  return new Date(Date.UTC(y, m - 1, d, hour - 9, minute, 0)).toISOString();
}

/** 日付の並び。今日から7日 */
export function dateStrip(days = 7, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    out.push(ymd(new Date(from.getTime() + i * 24 * 60 * 60 * 1000)));
  }
  return out;
}

/** 曜日（JST） */
export function weekday(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return ["日", "月", "火", "水", "木", "金", "土"][
    new Date(Date.UTC(y, m - 1, d, 3)).getUTCDay()
  ];
}

/** 「9/30」 */
export function md(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}

/**
 * その日に出す時間の幅。
 *
 * 予定のいちばん早い開始から、いちばん遅い終了まで。
 * 予定が無ければ、既定の 18〜24 時で空の表を出す
 * （表ごと消すと、何も受け付けていないのか、
 *   読み込みに失敗したのかが分からない）。
 */
export function hourRange(
  list: DayReviewer[],
  date: string,
  now = Date.now(),
): [number, number] {
  const base = new Date(atJst(date, 0)).getTime();
  const hourOf = (t: number) => (t - base) / (60 * 60 * 1000);

  const all = list.flatMap((r) => r.windows);
  let from = DEFAULT_FROM_HOUR;
  let to = DEFAULT_TO_HOUR;
  if (all.length > 0) {
    from = Math.floor(Math.min(...all.map((w) => hourOf(new Date(w.start).getTime()))));
    to = Math.ceil(Math.max(...all.map((w) => hourOf(new Date(w.end).getTime()))));
  }

  // 今日なら、終わった時間から始めない。
  //
  // 10時から出すと、夕方に開いた人は空の行を16本スクロールしてから
  // やっと中身にたどり着く。押せない行を見せても何の役にも立たない。
  // いまの時刻の1つ前の枠から出す（直前が見えていると、
  // 「さっきまでいた」が分かる）。
  const nowH = hourOf(now);
  if (nowH >= 0 && nowH < 24) {
    from = Math.max(from, Math.floor(nowH * 2) / 2 - 0.5);
  }

  from = Math.max(0, Math.floor(from * 2) / 2);
  to = Math.min(24, Math.max(to, from + 1));
  return [from, to];
}

/** その日の、枠の開始時刻を並べる */
export function slotTimes(date: string, [from, to]: [number, number]): string[] {
  const out: string[] = [];
  for (let m = Math.round(from * 60); m < to * 60; m += SLOT_MINUTES) {
    out.push(atJst(date, Math.floor(m / 60), m % 60));
  }
  return out;
}

/**
 * その人の、その枠の状態。
 *
 * now は「いまこの瞬間が、その枠の中にある」とき。
 * 予定の中でも、手が一杯なら busy。
 */
export function slotState(
  r: DayReviewer,
  at: string,
  now = Date.now(),
): SlotState {
  const t = new Date(at).getTime();
  const end = t + SLOT_MINUTES * 60 * 1000;

  // 終わった枠。押せない
  if (end <= now) return "past";

  const inWindow = r.windows.some(
    (w) => t >= new Date(w.start).getTime() && t < new Date(w.end).getTime(),
  );
  if (!inWindow) return "closed";

  const isNow = t <= now && now < end;
  if (isNow) {
    if (r.status === "busy") return "busy";
    if (r.status === "paused") return "closed";
    return "now";
  }
  return "open";
}

/** 押せる枠か */
export function bookable(s: SlotState): boolean {
  return s === "now" || s === "open";
}

/** その日、押せる枠が1つでもあるか */
export function anyOpen(list: DayReviewer[], times: string[]): boolean {
  return list.some((r) => times.some((t) => bookable(slotState(r, t))));
}

/** 読み上げ用。「みさきさん、20時00分、予約できます」 */
export function slotAria(r: DayReviewer, at: string, s: SlotState): string {
  return `${r.name}さん、${hhmm(at)}、${SLOT_MARK[s].label}`;
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 記号だけで状態を出さない。
  // ●と○の違いが分からない人に、何も伝わらなくなる。
  for (const [k, v] of Object.entries(SLOT_MARK)) {
    if (!v.label || v.label.length < 4) {
      throw new Error(`枠の状態「${k}」に、読み上げ用の言葉がありません`);
    }
  }

  // 終わった枠は押せないこと。
  if (bookable("past")) throw new Error("終わった時間が押せます");
  if (bookable("closed")) throw new Error("受付していない時間が押せます");
  if (bookable("busy")) throw new Error("対応中の枠が押せます");

  // 枠の長さ。1時間より長いと、選ぶ意味が無くなる
  if (SLOT_MINUTES > 60) throw new Error("枠が長すぎます");
  if (60 % SLOT_MINUTES !== 0) throw new Error("枠の長さが、1時間を割り切れません");

  // 日付の並びは、今日から。過去の日を出さない
  {
    const strip = dateStrip(7);
    if (strip.length !== 7) throw new Error("日付の並びが7日ではありません");
    if (strip[0] !== ymd(new Date())) throw new Error("日付の並びが今日から始まっていません");
  }

  // 24時が翌日の0時として扱えること。
  {
    const a = atJst("2026-09-30", 24);
    const b = atJst("2026-10-01", 0);
    if (a !== b) throw new Error("24時が翌日0時として扱えていません");
  }

  // 予定が無い日でも、表の幅が出ること。
  {
    const [f, t] = hourRange([], "2026-09-30", Date.parse("2026-09-30T00:00:00Z"));
    if (t <= f) throw new Error("予定が無い日に、表の幅が出ません");
  }

  // 今日は、終わった時間から始めないこと。
  // 空の行を何本もスクロールさせない。
  {
    const day = "2026-09-30";
    const list = [
      { windows: [{ start: atJst(day, 10), end: atJst(day, 24) }] },
    ] as unknown as DayReviewer[];
    // JST 20:00 に開いたとする
    const [f] = hourRange(list, day, Date.parse(atJst(day, 20)));
    if (f < 19) {
      throw new Error(`今日の表が、終わった時間から始まっています（${f}時）`);
    }
  }
}
