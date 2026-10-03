import type { BoardCard } from "@/lib/koi/board";
import { boardLine, HEAT_LABEL } from "@/lib/koi/board";

/* 相手の一覧。
 *
 * ══════════════════════════════════════════════════
 * 1画面で、現在地が分かること
 * ══════════════════════════════════════════════════
 * 困っているのは「恋愛相談がしたい」ではない。
 *   withのAさん、昨日何話したっけ
 *   PairsのBさん、電話いつするんやっけ
 * アプリが複数、相手が複数。そのたびに判断が増える。
 *
 * 1枚に入れるのは5つ。
 *   誰と ／ どのアプリで ／ どこまで ／ 直近に何が ／ 次に何を
 * 増やすと、1枚で読めなくなる。
 *
 * ══════════════════════════════════════════════════
 * 業務ツールに見せない
 * ══════════════════════════════════════════════════
 * 表で並べると、恋愛が案件になる。
 * カードを縦に積む。スマホで1枚ずつ読める形にする。
 *
 * NEXT だけ色を変える。開いた人が最初に見るのはそこ。
 *
 * ══════════════════════════════════════════════════
 * 温度感は、相手の評価ではない
 * ══════════════════════════════════════════════════
 * 札が指しているのは、やりとりのほう。
 *   進んでる ／ ひと息 ／ 止まってる
 * 「良好」「停滞」にすると、相手を採点しているように読める
 * （lib/koi/board.ts の判定が止める）。
 *
 * 色も付けない。付けた瞬間に、良い相手と悪い相手ができる。
 *
 * ══════════════════════════════════════════════════
 * 急かさない
 * ══════════════════════════════════════════════════
 * 「3日連絡していません」は出さない。赤くしない。
 * 次にやることが無い人は「いまは待つ」と出す。
 * 待つと決めたことも、立派な判断なので消さない。
 */

export default function PersonBoard({
  cards,
  hrefOf,
  /** 上の1行を出すか。今日やることの下に置くときは要らない */
  showLine = true,
}: {
  cards: BoardCard[];
  hrefOf?: (c: BoardCard) => string;
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
              {/* 名前・アプリ・温度感 */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[15.5px] font-black leading-[1.3] text-slate">{c.who}</span>
                {c.app && (
                  <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                    {c.app}
                  </span>
                )}
                <span className="ml-auto shrink-0 text-[10.5px] font-bold text-steel">
                  {HEAT_LABEL[c.heat]}
                </span>
              </div>

              {/* どこまで／直近に何が */}
              <div className="mt-1.5 flex flex-col gap-0.5">
                {c.stage && (
                  <span className="text-[12px] font-bold text-steel">{c.stage}</span>
                )}
                {c.recent && (
                  <span className="text-[12.5px] leading-[1.6] text-slate">{c.recent}</span>
                )}
              </div>

              {/* 開いた人が最初に見るのはここ */}
              <div className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5">
                <span
                  aria-hidden
                  className="mt-[1px] shrink-0 text-[10px] font-black tracking-wide text-brand"
                >
                  NEXT
                </span>
                <span
                  className={`min-w-0 flex-1 text-[13.5px] font-bold leading-[1.6] ${
                    c.next ? "text-slate" : "text-steel"
                  }`}
                >
                  {c.next ?? "いまは待つ"}
                </span>
              </div>

              {/* 最終更新と記録数。小さく */}
              <div className="mt-2 flex flex-wrap gap-x-3 text-[11px] text-steel">
                <span>更新 {c.since}</span>
                {typeof c.records === "number" && <span>記録 {c.records}件</span>}
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
