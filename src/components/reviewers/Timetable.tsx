"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SLOT_MARK,
  SLOT_MINUTES,
  WEEKS_AHEAD,
  bookable,
  currentSlot,
  dayTone,
  hhmm,
  hourRange,
  md,
  openAt,
  slotAria,
  slotState,
  slotTimes,
  weekday,
  windowLabel,
  ymd,
  type DayReviewer,
  type SlotState,
} from "@/lib/reviewers/schedule";
import type { Status } from "@/lib/reviewers/today";

/**
 * 列の見出しに出す、短い言い方。
 *
 * 列は狭いところで96px しかない。
 * 「本日の受付は終了」はどう置いても切れる。
 * 切れた言葉は、書いていないのと同じ。
 *
 * 長いほうは今日の受付の節（TodayReviewers）が持つ。
 */
const SHORT: Record<Status, string> = {
  available: "受付中",
  busy: "対応中",
  paused: "停止中",
  offline: "受付終了",
};
import { SAMPLE_BADGE, SAMPLE_NOTE } from "@/lib/reviewers/sample";
import { track } from "@/lib/analytics";

// 受付の時間割。
//
// ══════════════════════════════════════════════════
// スクロールの箱は1つだけ
// ══════════════════════════════════════════════════
// 人の見出しと枠の表を別々の箱にすると、横に振ったときにずれる。
// ずれた瞬間、「これは誰の20:30か」が分からなくなる。
//
// 箱を1つにして、
//   人の見出し  sticky top-0
//   時刻の列    sticky left-0
// で止める。同期の処理は書かない。書けばいつか壊れる。
//
// ══════════════════════════════════════════════════
// 幅は、画面で変える
// ══════════════════════════════════════════════════
// 列を1本の grid で組んで、幅を minmax(var(--col), 1fr) にする。
//   狭い画面  最小幅で並び、足りなければ表の中だけ横に動く
//   広い画面  余った幅を列が分け合って、端まで埋まる
//
// 固定幅にすると、パソコンで右半分が真っ白になる。
// パーセントにすると、スマホで1列が潰れて○が読めなくなる。
//
// ══════════════════════════════════════════════════
// 色だけに頼らない
// ══════════════════════════════════════════════════
// 土日の色は付けるが、曜日の文字も必ず出す。
// 枠の状態も、記号に加えて読み上げ用の言葉を持たせる。

/**
 * 枠の見た目。
 *
 * 押せる枠と押せない枠を、面の色で分ける。
 * 記号だけで分けると、表を斜めに見たときに
 * どこが空いているのか分からない。
 *
 *   押せる    白。○が浮いて見える
 *   いま可    緑。1つだけ目に入る
 *   押せない  灰。面ごと沈める
 */
function tone(s: SlotState): string {
  if (s === "now") return "bg-ok-tint text-ok-text font-black";
  if (s === "open") return "bg-paper text-brand font-black";
  if (s === "busy") return "bg-mist text-steel !text-[10px] font-bold";
  // 受付が無い時間と、終わった時間。面を沈めて、目が滑るようにする
  return "bg-mist text-steel/50";
}

function dateClass(d: string, on: boolean): string {
  if (on) return "border-brand bg-brand text-paper";
  const t = dayTone(d);
  if (t === "sat") return "border-line bg-paper text-brand-deep";
  if (t === "sun") return "border-line bg-paper text-rose-text";
  return "border-line bg-paper text-slate";
}

export default function Timetable({
  date,
  dates,
  from,
  list,
  sample,
  callsOpen,
}: {
  date: string;
  dates: string[];
  /** いま見せている7日の先頭 */
  from: string;
  list: DayReviewer[];
  sample: boolean;
  callsOpen: boolean;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [pick, setPick] = useState<{ r: DayReviewer; at: string } | null>(null);

  // 1分ごと。秒で動かすと、見ているあいだ落ち着かない
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const range = useMemo(() => hourRange(list, date, now), [list, date, now]);
  const times = useMemo(() => slotTimes(date, range), [date, range]);

  const today = ymd(new Date(now));
  const isToday = date === today;
  const slot = isToday ? currentSlot(now) : null;
  const openHere = slot ? openAt(list, slot.from, now) : 0;

  // 週送り。今日より前へは戻さない
  const step = (n: number) => {
    const next = ymd(new Date(Date.parse(`${from}T00:00:00Z`) + n * 7 * 86400000));
    const limit = ymd(new Date(Date.parse(`${today}T00:00:00Z`) + WEEKS_AHEAD * 7 * 86400000));
    if (next < today || next > limit) return;
    router.push(`/reviewers?from=${next}&date=${next}`, { scroll: false });
  };
  const canBack = from > today;
  const canFwd =
    from < ymd(new Date(Date.parse(`${today}T00:00:00Z`) + (WEEKS_AHEAD - 1) * 7 * 86400000));

  // 列の幅。狭い画面は最小幅、広い画面は余りを分け合う
  const grid = {
    gridTemplateColumns: `var(--axis) repeat(${Math.max(1, list.length)}, minmax(var(--col), 1fr))`,
  };

  return (
    <div className="[--axis:52px] [--col:96px] sm:[--axis:60px] sm:[--col:124px] lg:[--col:150px]">
      {/* ══════════════════════════════════════════════
          日付：7列を等分する
          ══════════════════════════════════════════════
          横スクロールにしていたが、7日しか無いのに動かすのは無駄。
          375px でも 7列 × 47px で収まる。
          動かさずに全部見えるほうが、1日ぶん速い。 */}
      <ul className="grid grid-cols-7 overflow-hidden rounded-card border border-line">
        {dates.map((d) => {
          const on = d === date;
          const t = dayTone(d);
          return (
            <li key={d} className="border-r border-line last:border-r-0">
              <button
                type="button"
                onClick={() => {
                  track("schedule_date_change", { date: d });
                  router.push(`/reviewers?from=${from}&date=${d}`, { scroll: false });
                }}
                aria-current={on ? "date" : undefined}
                className={`flex min-h-[58px] w-full flex-col items-center justify-center text-center ${
                  on
                    ? "bg-brand text-paper"
                    : t === "sat"
                      ? "bg-paper text-brand-deep"
                      : t === "sun"
                        ? "bg-paper text-rose-text"
                        : "bg-paper text-slate"
                }`}
              >
                <span className="text-[13.5px] font-black tabular-nums leading-none">
                  {md(d)}
                </span>
                {/* 曜日は必ず文字で出す。色だけだと、色が見えない人に伝わらない */}
                <span className="mt-1 text-[10.5px] font-bold leading-none opacity-90">
                  （{weekday(d)}）
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ══════════════════════════════════════════════
          その日の要約と、週送り
          ══════════════════════════════════════════════
          人数は「いつの時点の人数か」まで書く。
          書かないと、いま開いた瞬間の話なのかが分からない。

          前へ／次へは、日付の左右ではなくここに置く。
          左右に置くと、狭い画面で日付の幅を食う。 */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-black leading-[1.6] text-slate">
            <span>
              {md(date)}（{weekday(date)}）の受付：{list.length}人
            </span>
            {/* 札は人数の横。行を1つ使わせない */}
            {sample && (
              <span className="rounded-pill border border-line bg-mist px-2 py-0.5 text-[11px] font-black text-steel">
                {SAMPLE_BADGE}
              </span>
            )}
          </p>
          {!sample && slot && (
            <p className="mt-0.5 text-[13px] font-bold leading-[1.6] text-ok-text">
              只今受付中（{hhmm(slot.from)}〜{hhmm(slot.to)}）：{openHere}人
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={!canBack}
            className="min-h-[38px] rounded-soft border border-line bg-paper px-3 text-[12px] font-bold text-steel disabled:opacity-30"
          >
            ‹ 前へ
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={!canFwd}
            className="min-h-[38px] rounded-soft border border-line bg-paper px-3 text-[12px] font-bold text-steel disabled:opacity-30"
          >
            次へ ›
          </button>
        </div>
      </div>

      {sample && (
        <p className="mt-2 rounded-card bg-mist px-4 py-3 text-[12.5px] leading-[1.85] text-steel">
          {SAMPLE_NOTE}
        </p>
      )}

      {/* ── 表。横に動くのはこの箱の中だけ ── */}
      <div className="relative mt-4 max-h-[64vh] overflow-auto rounded-card border border-line bg-paper">
        <div className="min-w-full">
          {/* 人の見出し */}
          <div
            className="sticky top-0 z-20 grid border-b border-line bg-paper"
            style={grid}
          >
            <div className="sticky left-0 z-30 border-r border-line bg-paper" />
            {list.map((r) => (
              <div
                key={r.id}
                className="border-r border-line px-2 py-2.5 text-center last:border-r-0"
              >
                {/* 名前と年代は分ける。
                    1行にまとめたら、96pxの列で名前のほうが切れた
                    （「みさき（2...」）。切れた名前は、無いのと同じ。
                    年代は小さく下へ。見出しが12px伸びるだけで済む */}
                <p className="truncate text-[12.5px] font-black leading-[1.25] text-slate">
                  {r.name}
                </p>
                <p className="text-[9.5px] font-bold leading-[1.3] text-steel">
                  {r.ageBand}
                </p>
                {/* その日の受付時間。これが無いと、○がいつまで続くか読めない */}
                {windowLabel(r) && (
                  <p className="mt-1 text-[10.5px] font-bold tabular-nums text-steel">
                    {windowLabel(r)}
                  </p>
                )}
                {/* 状態は短く。列が狭いので、
                    「本日の受付は終了」は必ず切れる */}
                <p
                  className={`mt-1 truncate text-[10px] font-bold ${
                    r.status === "available" ? "text-ok-text" : "text-steel"
                  }`}
                >
                  {SHORT[r.status]}
                </p>
              </div>
            ))}
          </div>

          {/* 枠 */}
          {times.map((t) => {
            const isNowRow = Boolean(slot && t === slot.from);
            // :00 を太く、:30 を細く。目で追うときの手がかりになる
            const onHour = hhmm(t).endsWith(":00");
            return (
              <div
                key={t}
                className={`grid border-b border-line last:border-b-0 ${
                  isNowRow ? "bg-brand-tint/40" : ""
                }`}
                style={grid}
              >
                <div
                  className={`sticky left-0 z-10 flex h-11 items-center justify-center border-r border-line tabular-nums ${
                    isNowRow ? "bg-brand-tint" : "bg-paper"
                  } ${
                    onHour
                      ? "text-[12px] font-black text-slate"
                      : "text-[11px] font-bold text-steel"
                  }`}
                >
                  {hhmm(t)}
                </div>
                {list.map((r) => {
                  const s = slotState(r, t, now);
                  const can = bookable(s);
                  return (
                    <div key={r.id} className="border-r border-line last:border-r-0">
                      <button
                        type="button"
                        disabled={!can}
                        aria-label={slotAria(r, t, s)}
                        onClick={() => {
                          setPick({ r, at: t });
                          track("available_slot_click", { at: hhmm(t) });
                        }}
                        className={`flex h-11 w-full items-center justify-center overflow-hidden px-1 text-[15px] leading-none ${tone(
                          s,
                        )} ${can ? "cursor-pointer hover:bg-brand-tint" : "cursor-default"}`}
                      >
                        <span className="truncate">{SLOT_MARK[s].mark}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 記号の読み方 */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-steel">
        <li>● 今すぐ話せます</li>
        <li>○ 予約できます</li>
        <li>－ 受付なし</li>
      </ul>

      {/* ── 押したとき ── */}
      {pick && (
        <div
          role="dialog"
          aria-label={`${pick.r.name}さんにタシカメる`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate/40 p-3 sm:items-center"
          onClick={() => setPick(null)}
        >
          <div
            className="w-full max-w-[26em] rounded-card bg-paper p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[17px] font-black text-slate">
              {pick.r.name}さんにタシカメる
            </p>
            <p className="mt-1.5 text-[13.5px] font-bold text-steel">
              {md(date)}（{weekday(date)}） {hhmm(pick.at)} から
            </p>
            <p className="mt-2 text-[12.5px] text-steel">
              {pick.r.ageBand}
              {pick.r.verified && " ・ 本人確認済み"}
            </p>

            {callsOpen ? (
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/ask?plan=call15&at=${encodeURIComponent(pick.at)}`}
                  className="flex min-h-[56px] items-center justify-between rounded-card border border-line px-4 font-bold text-slate"
                >
                  <span className="text-[14.5px]">15分</span>
                  <span className="text-[16px] font-black tabular-nums">¥5,980</span>
                </Link>
                <Link
                  href={`/ask?plan=session&at=${encodeURIComponent(pick.at)}`}
                  className="flex min-h-[56px] items-center justify-between rounded-card border border-line px-4 font-bold text-slate"
                >
                  <span className="text-[14.5px]">30分</span>
                  <span className="text-[16px] font-black tabular-nums">¥9,800</span>
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-4 rounded-card bg-mist px-4 py-3 text-[13px] leading-[1.85] text-steel">
                  声で話す商品は、まだ受け付けていません。時間を決めた受け入れ方と、
                  その場を見る体制が用意できてから開きます。
                </p>
                <Link
                  href="/talk"
                  className="mt-3 flex min-h-[52px] items-center justify-center rounded-pill border border-line bg-paper text-[14.5px] font-bold text-slate"
                >
                  開いたら知らせてもらう
                </Link>
                <Link
                  href="/ask"
                  className="mt-2 flex min-h-[52px] items-center justify-center rounded-pill bg-brand text-[15px] font-bold text-paper"
                >
                  いまは文字で確かめる
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setPick(null)}
              className="mt-3 min-h-[44px] w-full text-[13px] font-bold text-steel"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
