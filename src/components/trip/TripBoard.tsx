import { PHASE_LABEL, boardLine, type TripCard } from "@/lib/trip/board";

/* 旅の一覧。
 *
 * 1枚に入れるのは5つ。
 *   どこへ ／ いつ ／ いまどの段階 ／ 何が済んだ ／ 次に何をするか
 * 増やすと1枚で読めなくなる。
 *
 * 段階に色を付けない。
 * 色を付けた瞬間に、良い旅と悪い旅ができる。 */

export default function TripBoard({
  cards,
  hrefOf,
  showLine = true,
}: {
  cards: TripCard[];
  hrefOf?: (c: TripCard) => string;
  showLine?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {showLine && (
        <p className="text-[12.5px] font-bold leading-[1.7] text-steel">{boardLine(cards)}</p>
      )}
      <ul className="flex flex-col gap-2.5">
        {cards.map((c) => {
          const inner = (
            <>
              {/* 都市・日程・段階 */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[15.5px] font-black leading-[1.3] text-slate">{c.city}</span>
                <span className="text-[12px] font-bold tabular-nums text-steel">{c.dates}</span>
                <span className="ml-auto shrink-0 rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                  {PHASE_LABEL[c.phase]}
                </span>
              </div>

              {/* 出発まで何日か。準備中のときだけ。
                  「あと3日」とは書かない（急かさない）。
                  日数は事実なので出すが、言い方は中立にする。 */}
              {c.daysToGo !== null && (
                <p className="mt-1 text-[12px] font-bold tabular-nums text-steel">
                  出発まで {c.daysToGo}日
                </p>
              )}

              {/* 済んだこと。これが先。
                  次にやることだけ並ぶと、宿題帳になる */}
              {c.done && (
                <div className="mt-2 flex items-start gap-2">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-ok-text">
                    済
                  </span>
                  <span className="min-w-0 flex-1 text-[12.5px] leading-[1.6] text-steel">
                    {c.done}
                  </span>
                </div>
              )}

              {/* 開いた人が最初に見るところ */}
              {c.next && (
                <div className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5">
                  <span
                    aria-hidden
                    className="mt-[1px] shrink-0 text-[10px] font-black tracking-wide text-brand"
                  >
                    NEXT
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] font-bold leading-[1.6] text-slate">
                    {c.next}
                  </span>
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-x-3 text-[11px] text-steel">
                <span>更新 {c.since}</span>
                <span>記録 {c.records}件</span>
              </div>
            </>
          );
          return (
            <li key={c.id}>
              {hrefOf ? (
                <a
                  href={hrefOf(c)}
                  className="block rounded-card border border-line bg-paper p-4 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  {inner}
                </a>
              ) : (
                <div className="rounded-card border border-line bg-paper p-4 shadow-card">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
