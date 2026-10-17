import { LEG_LABEL, byLeg, doneCount, type TripLog as Log } from "@/lib/trip/log";
import Stamp from "@/components/trip/Stamp";

/* 旅の記録。準備 → 出発 → 現地 → 帰国 を縦の線でつなぐ。
 *
 * ══════════════════════════════════════════════════
 * 宿題帳にしない
 * ══════════════════════════════════════════════════
 * 準備の画面は、放っておくと未完了リストになる。
 * パスポート、保険、eSIM、両替、配車アプリ、空港からの行き方。
 * 並べるほど、行くのが面倒になる。
 *
 * 逆にする。済んだことを、時間の順に積む。
 * 「ここまで来た」が見えるから、残りが怖くなくなる。
 *
 * 残りの数は数えない。数えると、そこが宿題になる。
 * 出すのは、済んだ数と、次の1つだけ。
 *
 * ══════════════════════════════════════════════════
 * 線を、旅程に見せる
 * ══════════════════════════════════════════════════
 * 段の頭に丸、あいだに線。路線図と同じ形。
 * 旅には必ずこの順番があるので、いま自分がどこにいるかが
 * 線を見れば分かる。
 */
export default function TripLog({ log }: { log: Log }) {
  const groups = byLeg(log.items);
  const done = doneCount(log.items);

  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card">
      {/* 見出し。都市と、空港の記号 */}
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[15.5px] font-black text-slate">{log.city}</span>
        {log.code && (
          <span className="rounded-[3px] border border-line px-1.5 py-[1px] text-[10.5px] font-black tracking-[0.12em] text-steel">
            {log.code}
          </span>
        )}
        <span className="ml-auto text-[11.5px] font-bold tabular-nums text-steel">
          ここまで {done}件
        </span>
      </div>

      <ol className="mt-4 flex flex-col">
        {groups.map((g, gi) => {
          const lastGroup = gi === groups.length - 1;
          return (
            <li key={g.leg}>
              {/* 段の名前。線の上の駅名 */}
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span className="text-[11.5px] font-black tracking-[0.08em] text-steel">
                  {LEG_LABEL[g.leg]}
                </span>
              </div>

              <div className="flex gap-2.5">
                {/* 線。最後の段の下には引かない（まだ続くように見える） */}
                <span
                  aria-hidden
                  className={`ml-[3.5px] w-px shrink-0 ${lastGroup ? "bg-transparent" : "bg-line"}`}
                />
                <ul className="min-w-0 flex-1 py-2">
                  {g.items.map((it) => (
                    <li key={`${it.date}-${it.what}`} className="flex gap-2.5 py-[5px]">
                      <span className="w-[3.4em] shrink-0 pt-[1px] text-[11.5px] font-bold tabular-nums text-steel">
                        {it.date}
                      </span>
                      {it.isNext ? (
                        <span
                          aria-hidden
                          className="mt-[1px] shrink-0 text-[9.5px] font-black tracking-wide text-brand"
                        >
                          NEXT
                        </span>
                      ) : (
                        <Stamp />
                      )}
                      <span
                        className={`min-w-0 flex-1 text-[13px] leading-[1.6] ${
                          it.isNext ? "font-black text-slate" : "text-steel"
                        }`}
                      >
                        {it.what}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
