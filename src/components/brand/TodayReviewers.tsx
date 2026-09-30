import Link from "next/link";
import { scheduleFor, TODAY, OMAKASE } from "@/lib/reviewers/today";
import { dateStrip, ymd } from "@/lib/reviewers/schedule";
import { canSellCalls } from "@/lib/call/gate";
import Timetable from "@/components/reviewers/Timetable";
import PlanCta from "@/components/brand/PlanCta";

// 今日、受け付けている人。
//
// ══════════════════════════════════════════════════
// 同じものを2つ持たない
// ══════════════════════════════════════════════════
// ここは横に流れるカードの一覧だった。
// 別の面（/reviewers）に、日付×人×時刻の表を作った。
//
// 同じことを2つの見せ方で持つと、片方だけ古くなる。
// しかも /reviewers へ行く導線がどこにも無かったので、
// 作った表を誰も見られない状態だった。
//
// ここを表そのものにする。カードは畳む。
// 「今日誰がいて、何時なら空いているか」は
// 表のほうが1画面で分かる。
//
// ══════════════════════════════════════════════════
// 高さは増やさない
// ══════════════════════════════════════════════════
// カード一覧で 1.3画面ぶん使っていた。
// 表も同じくらいに収める（箱の中だけが縦に動く）。
//
// ══════════════════════════════════════════════════
// 0人でも、表は出す
// ══════════════════════════════════════════════════
// 登録が済んだ人がいないあいだは、見せ方の見本を出す。
// 札と断りは表の側が持っている。

export default async function TodayReviewers() {
  const today = ymd(new Date());
  const dates = dateStrip(7);
  const { list, sample } = await scheduleFor(today);
  const callsOpen = canSellCalls();

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-12 sm:px-8 sm:py-14">
        <h2 className="text-huge font-black leading-[1.35] text-slate">{TODAY.head}</h2>
        <p className="mt-2.5 max-w-[32em] text-[14.5px] leading-[1.85] text-steel">
          {TODAY.lead}
        </p>

        <div className="mt-5">
          <Timetable
            date={today}
            dates={dates}
            from={today}
            list={list}
            sample={sample}
            callsOpen={callsOpen}
            compact
          />
        </div>

        {/* 押す場所。人を選ぶのが面倒な人は、ここから */}
        <div className="mt-6 rounded-card border border-line bg-mist px-5 py-5 sm:px-6">
          <p className="text-[15px] font-black leading-[1.6] text-slate">{OMAKASE.head}</p>
          <p className="mt-2 text-[13.5px] leading-[1.85] text-steel">{OMAKASE.body}</p>

          <div className="mt-4 max-w-[24em]">
            <PlanCta
              plan="review"
              from="today_reviewers"
              className="min-h-[56px] w-full rounded-pill bg-brand px-8 text-[16px] !text-paper shadow-card"
            >
              今の迷いを確かめる <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
          </div>

          {/* 別の日を見たい人の行き先。
              ここが無いと、作った表の7日ぶんが誰にも届かない */}
          <Link
            href="/reviewers"
            className="mt-3 inline-flex min-h-[44px] items-center text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
          >
            別の日の受付も見る
          </Link>
        </div>
      </div>
    </section>
  );
}
