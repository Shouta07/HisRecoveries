import { PHASE_LABEL, boardLine, type TripCard } from "@/lib/trip/board";
import Stamp from "@/components/trip/Stamp";

/* 旅の一覧。1枚を搭乗券の形にする。
 *
 * ══════════════════════════════════════════════════
 * なぜ切符の形にするか
 * ══════════════════════════════════════════════════
 * 中身（都市・日程・済んだこと・次にやること）は変えていない。
 * 変えたのは形だけ。
 *
 * 四角いカードが縦に並ぶ作りは、どの管理アプリとも同じ見た目になる。
 * 初めての一人旅で開く画面が、仕事の進捗表と同じだと、気持ちが乗らない。
 *
 * 切符の形は、覚えがある。
 *   都市と、3文字の記号
 *   出発 → 到着
 *   ミシン目で切れる
 * 予約確認のメールで、その人が何度も見ている形。
 *
 * ══════════════════════════════════════════════════
 * 色は増やしていない
 * ══════════════════════════════════════════════════
 * 使っているのは既存のトークンだけ。
 * 切符らしさは、形と、数字の揃え（tabular-nums）で出す。
 *
 * ミシン目は border-dashed、切り欠きは丸を2つ置くだけ。
 * 絵も影も足していない。
 */

export default function TripBoard({
  cards,
  hrefOf,
  showLine = true,
  notch = "bg-mist",
}: {
  cards: TripCard[];
  hrefOf?: (c: TripCard) => string;
  showLine?: boolean;
  /**
   * ミシン目の切り欠きの色。
   *
   * 切り欠きは「カードの外の色で丸く抜く」ことで出している。
   * だから、置く場所の地の色をもらわないと、灰色の点に見える。
   * 既定は端末の枠の中（bg-mist）。白地に置くなら bg-paper。
   */
  notch?: string;
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
              {/* ── 券面の上。都市と、空港の記号 ── */}
              <div className="px-4 pt-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[17px] font-black leading-[1.2] text-slate">{c.city}</span>
                  {c.code && (
                    <span className="rounded-[3px] border border-line px-1.5 py-[1px] text-[10px] font-black tracking-[0.14em] text-steel">
                      {c.code}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 text-[10.5px] font-bold text-steel">
                    {PHASE_LABEL[c.phase]}
                  </span>
                </div>

                {/* 日程。切符なので、数字を主役にする */}
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[15px] font-black tabular-nums leading-none text-slate">
                    {c.dates}
                  </span>
                  {/* 出発までの日数。「あと」とは書かない（急かさない）。
                      数字は事実なので出すが、言い方は中立にする */}
                  {c.daysToGo !== null && (
                    <span className="text-[11.5px] font-bold tabular-nums text-steel">
                      出発まで {c.daysToGo}日
                    </span>
                  )}
                </div>
              </div>

              {/* ── ミシン目。切り欠きを左右に置く ── */}
              <div className="relative my-3">
                <span
                  aria-hidden
                  className={`absolute -left-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${notch}`}
                />
                <span
                  aria-hidden
                  className={`absolute -right-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${notch}`}
                />
                <span aria-hidden className="block border-t border-dashed border-line" />
              </div>

              {/* ── 券面の下。済んだこと → 次にやること ── */}
              <div className="px-4 pb-3.5">
                {c.done && (
                  <div className="flex items-start gap-2">
                    <Stamp />
                    <span className="min-w-0 flex-1 text-[12.5px] leading-[1.6] text-steel">
                      {c.done}
                    </span>
                  </div>
                )}

                {c.next && (
                  <div className={`flex items-start gap-2 ${c.done ? "mt-2" : ""}`}>
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

                <div className="mt-2.5 flex flex-wrap gap-x-3 text-[11px] tabular-nums text-steel">
                  <span>更新 {c.since}</span>
                  <span>記録 {c.records}件</span>
                </div>
              </div>
            </>
          );
          return (
            <li key={c.id}>
              {hrefOf ? (
                <a
                  href={hrefOf(c)}
                  className="block overflow-hidden rounded-card border border-line bg-paper shadow-card transition-shadow hover:shadow-card-hover"
                >
                  {inner}
                </a>
              ) : (
                <div className="overflow-hidden rounded-card border border-line bg-paper shadow-card">
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
