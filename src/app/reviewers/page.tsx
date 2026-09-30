import type { Metadata } from "next";
import Link from "next/link";
import { NAME } from "@/lib/voice";
import { scheduleFor } from "@/lib/reviewers/today";
import { dateStrip, ymd, WEEKS_AHEAD } from "@/lib/reviewers/schedule";
import { canSellCalls } from "@/lib/call/gate";
import Timetable from "@/components/reviewers/Timetable";
import Tashikame from "@/components/brand/Tashikame";
import PlanCta from "@/components/brand/PlanCta";

// 今日、誰が何時に受け付けているか。
//
// ══════════════════════════════════════════════════
// これは案内のページではない
// ══════════════════════════════════════════════════
// 大きな見出しも、長い説明も、SEOの文章も置かない。
// 置くのは、日付・人数・今すぐ・人・時間だけ。
//
// 「今日誰いるかな」で開く画面なので、
// 開いた瞬間に、それが分かることだけを考える。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `今日、タシカメできる人 — ${NAME}`,
  description: "今日、何時に、誰が受け付けているか。",
  // 受付は時間で変わる。古い状態が検索に残ると、
  // 開く前に間違った人数を見せることになる
  robots: { index: false, follow: true },
};

export default async function ReviewersPage({
  searchParams,
}: {
  searchParams: { date?: string; from?: string };
}) {
  const today = ymd(new Date());
  const limit = ymd(new Date(Date.parse(`${today}T00:00:00Z`) + WEEKS_AHEAD * 7 * 86400000));

  // 週の先頭。今日より前へは戻さない。先も WEEKS_AHEAD まで
  const askedFrom = searchParams.from;
  const from =
    askedFrom && askedFrom >= today && askedFrom <= limit ? askedFrom : today;

  const dates = dateStrip(7, new Date(Date.parse(`${from}T00:00:00Z`)));
  const asked = searchParams.date;
  // 知らない日付・見せていない週の日付は、その週の先頭に寄せる
  const date = asked && dates.includes(asked) ? asked : from;

  const { list, sample } = await scheduleFor(date);
  const callsOpen = canSellCalls();

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Tashikame size={34} />
            <span className="truncate text-[17px] font-black text-slate">{NAME}</span>
          </Link>
          <Link
            href="/ask"
            className="shrink-0 text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
          >
            文字で確かめる
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-5 pb-28 pt-6 sm:px-8">
        <h1 className="text-[22px] font-black leading-[1.35] text-slate sm:text-[26px]">
          今日、タシカメできる人
        </h1>

        {/* ここに「相談の内容に合う、受付中の人へ届けます」の箱を置いていた。
            この画面は案内ではなく道具なので、説明は要らない。
            選ぶのが面倒な人の行き先は、下に置きっぱなしのボタンが持つ。 */}

        <div className="mt-4">
          <Timetable
            date={date}
            dates={dates}
            from={from}
            list={list}
            sample={sample}
            callsOpen={callsOpen}
          />
        </div>
      </main>

      {/* 下に置きっぱなしにする。表を見ているあいだ、ずっと押せる */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto w-full max-w-[26em]">
          <PlanCta
            plan="review"
            from="schedule_sticky"
            className="min-h-[52px] w-full rounded-pill bg-brand px-6 text-[15.5px] !text-paper shadow-card"
          >
            今すぐおまかせで確かめる
          </PlanCta>
        </div>
      </div>
    </div>
  );
}
