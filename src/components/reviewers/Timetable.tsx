"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SLOT_MARK,
  SLOT_MINUTES,
  bookable,
  hhmm,
  hourRange,
  md,
  slotAria,
  slotState,
  slotTimes,
  weekday,
  type DayReviewer,
  type SlotState,
} from "@/lib/reviewers/schedule";
import { SAMPLE_BADGE, SAMPLE_NOTE } from "@/lib/reviewers/sample";
import { track } from "@/lib/analytics";

// 受付の時間割。
//
// ══════════════════════════════════════════════════
// スクロールの箱は1つだけ
// ══════════════════════════════════════════════════
// 人の見出しと、枠の表を別々の箱にすると、
// 横に振ったときにずれる。ずれた瞬間、
// 「これは誰の20:30か」が分からなくなる。
//
// 箱を1つにして、
//   人の見出し  position: sticky; top: 0
//   時刻の列    position: sticky; left: 0
// で止める。同期の処理は書かない。書けばいつか壊れる。
//
// ══════════════════════════════════════════════════
// 体を横にスクロールさせない
// ══════════════════════════════════════════════════
// 横に動くのは、この表の中だけ。
// ページごと横に動くと、縦に読めなくなる。
//
// ══════════════════════════════════════════════════
// 空いていない時間を、空いているように見せない
// ══════════════════════════════════════════════════
// 過ぎた枠は押せない。受付の無い枠は「－」を出す。
// 空欄にすると、読み込み中なのか受付が無いのかが分からない。

const COL = 104; // 人の列の幅。2.5〜3.5人が見える幅
const AXIS = 56; // 時刻の列の幅
const ROW = 44; // 1枠の高さ

function tone(s: SlotState): string {
  if (s === "now") return "bg-ok-tint text-ok-text font-black";
  if (s === "open") return "bg-paper text-brand font-black";
  if (s === "busy") return "bg-mist text-steel !text-[10px] font-bold";
  return "bg-paper text-line";
}

export default function Timetable({
  date,
  dates,
  list,
  sample,
  callsOpen,
}: {
  date: string;
  dates: string[];
  list: DayReviewer[];
  sample: boolean;
  /** 通話をいま売れるか。売れないなら、押しても決済へ行かせない */
  callsOpen: boolean;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [pick, setPick] = useState<{ r: DayReviewer; at: string } | null>(null);

  // 現在時刻の線と、枠の状態を動かす。
  // 1分ごとでよい（秒で動かすと、見ているあいだ落ち着かない）
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const range = useMemo(() => hourRange(list, date), [list, date]);
  const times = useMemo(() => slotTimes(date, range), [date, range]);
  const openNow = list.filter((r) => r.status === "available").length;

  // 今日なら、現在時刻の線を出す
  const todayStr = dates[0];
  const isToday = date === todayStr;
  const linePos = useMemo(() => {
    if (!isToday || times.length === 0) return null;
    const first = new Date(times[0]).getTime();
    const mins = (now - first) / 60000;
    if (mins < 0 || mins > times.length * SLOT_MINUTES) return null;
    return (mins / SLOT_MINUTES) * ROW;
  }, [isToday, times, now]);

  return (
    <div>
      {/* ── 日付。横に並べる ── */}
      <ul className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {dates.map((d, i) => {
          const on = d === date;
          return (
            <li key={d}>
              <button
                type="button"
                onClick={() => {
                  track("schedule_date_change", { date: d });
                  router.push(`/reviewers?date=${d}`, { scroll: false });
                }}
                aria-current={on ? "date" : undefined}
                className={`flex min-h-[64px] w-[62px] shrink-0 snap-start flex-col items-center justify-center rounded-card border text-center ${
                  on
                    ? "border-brand bg-brand text-paper"
                    : "border-line bg-paper text-slate"
                }`}
              >
                <span className="text-[10.5px] font-bold opacity-80">
                  {i === 0 ? "今日" : weekday(d)}
                </span>
                <span className="mt-0.5 text-[15px] font-black tabular-nums">
                  {md(d)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── その日の要約 ── */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-[16px] font-black text-slate">
          {md(date)}（{weekday(date)}） {list.length}人
        </p>
        {/* 人数は、本物のときだけ。見本で人数を出したら札の意味が無くなる */}
        {!sample && openNow > 0 && (
          <span className="rounded-pill bg-ok-tint px-2.5 py-1 text-[12px] font-black text-ok-text">
            いま{openNow}人 受付中
          </span>
        )}
        {sample && (
          <span className="rounded-pill border border-line bg-mist px-2.5 py-1 text-[12px] font-black text-steel">
            {SAMPLE_BADGE}
          </span>
        )}
      </div>

      {sample && (
        <p className="mt-2 rounded-card bg-mist px-4 py-3 text-[12.5px] leading-[1.85] text-steel">
          {SAMPLE_NOTE}
        </p>
      )}

      {/* ── 表。横に動くのはこの箱の中だけ ── */}
      <div
        className="relative mt-4 max-h-[62vh] overflow-auto rounded-card border border-line bg-paper"
        onScroll={() => track("schedule_scrolled", { date })}
      >
        <div className="min-w-max">
          {/* 人の見出し。縦に送っても残る */}
          <div className="sticky top-0 z-20 flex border-b border-line bg-paper">
            <div
              className="sticky left-0 z-30 shrink-0 border-r border-line bg-paper"
              style={{ width: AXIS }}
            />
            {list.map((r) => (
              <div
                key={r.id}
                className="shrink-0 border-r border-line px-2 py-2.5 text-center last:border-r-0"
                style={{ width: COL }}
              >
                <p className="truncate text-[13px] font-black leading-[1.3] text-slate">
                  {r.name}
                </p>
                <p className="mt-0.5 text-[10.5px] font-bold text-steel">{r.ageBand}</p>
                {r.verified && (
                  <p className="mt-0.5 text-[10px] font-bold text-ok-text">✓ 確認済</p>
                )}
              </div>
            ))}
          </div>

          {/* 枠 */}
          <div className="relative">
            {/* 今の時刻。今日だけ */}
            {linePos !== null && (
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 z-10 border-t-2 border-rose"
                style={{ top: linePos }}
              />
            )}

            {times.map((t) => (
              <div key={t} className="flex border-b border-line last:border-b-0">
                <div
                  className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-line bg-paper text-[11.5px] font-bold tabular-nums text-steel"
                  style={{ width: AXIS, height: ROW }}
                >
                  {hhmm(t)}
                </div>
                {list.map((r) => {
                  const s = slotState(r, t, now);
                  const can = bookable(s);
                  return (
                    <div
                      key={r.id}
                      className="shrink-0 border-r border-line last:border-r-0"
                      style={{ width: COL, height: ROW }}
                    >
                      <button
                        type="button"
                        disabled={!can}
                        aria-label={slotAria(r, t, s)}
                        onClick={() => {
                          setPick({ r, at: t });
                          track("available_slot_click", { at: hhmm(t) });
                        }}
                        className={`flex h-full w-full items-center justify-center overflow-hidden px-1 text-[15px] leading-none ${tone(
                          s,
                        )} ${can ? "cursor-pointer hover:bg-brand-tint" : "cursor-default"}`}
                      >
                        <span className="truncate">{SLOT_MARK[s].mark}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 記号の読み方。色と形だけに頼らない */}
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
            {pick.r.specialties.length > 0 && (
              <p className="mt-2 text-[12.5px] text-steel">
                {pick.r.ageBand}
                {pick.r.verified && " ・ 本人確認済み"}
              </p>
            )}

            {/* いま売れるかどうかで、出すものを変える。
                売れないのに決済へ進ませない */}
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
