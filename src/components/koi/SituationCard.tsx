import type { SituationCard } from "@/lib/koi/card";
import KoiFace from "@/components/koi/KoiFace";

/* 話したあとに出す、状況の1枚。
 *
 * ══════════════════════════════════════════════════
 * JSON を見せない
 * ══════════════════════════════════════════════════
 * 中では構造になっているが、それを出すと
 * 設定画面を読まされているのと同じになる。
 * 読んで分かる1枚にする（言葉と判定は lib/koi/card.ts）。
 *
 * ══════════════════════════════════════════════════
 * 言ったことと、見立てを、見た目で分ける
 * ══════════════════════════════════════════════════
 * 混ぜると、本人が言っていないことまで事実として読まれる。
 *   言ったこと  そのまま
 *   見立て      薄くして「たぶん」と添える
 *
 * 消しはしない。消すと、なぜそう整理されたのかが分からなくなる。
 *
 * ══════════════════════════════════════════════════
 * 人に聞くものには、印を付ける
 * ══════════════════════════════════════════════════
 * 「相手がどう受け取るか」は、こちらでは答えられない
 * （利用規約 第12条）。そこだけ実在の異性に回る。
 * 印が無いと、恋亀が答えたように読まれる。
 */

export default function SituationCardView({ card }: { card: SituationCard }) {
  // 同じ見出しが続くときは、2行目から見出しを出さない
  let last = "";

  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card">
      <div className="flex items-start gap-3">
        <KoiFace size={34} alive={false} className="-mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-black leading-[1.4] text-slate">
            {card.who}との状況
          </p>
          {card.line && (
            <p className="mt-1 text-[12.5px] font-bold leading-[1.7] text-steel">
              {card.line}
            </p>
          )}
        </div>
      </div>

      {card.rows.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          {card.rows.map((r, i) => {
            const head = r.label === last ? "" : r.label;
            last = r.label;
            return (
              <li
                key={`${i}-${r.body.slice(0, 8)}`}
                className="grid grid-cols-[6.5em_1fr] gap-2 text-[13px] leading-[1.75]"
              >
                <span className="font-bold text-steel">{head}</span>
                <span className={r.source === "guess" ? "text-steel" : "text-slate"}>
                  {r.body}
                  {r.source === "guess" && (
                    <span className="ml-1.5 whitespace-nowrap text-[11px] text-steel">
                      （たぶん）
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {card.toConfirm.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[12px] font-bold text-steel">次に確かめたいこと</p>
          <ul className="mt-2 flex flex-col gap-2">
            {card.toConfirm.map((t, i) => (
              <li
                key={`${i}-${t.text.slice(0, 8)}`}
                className="flex items-start gap-2 text-[13px] leading-[1.75]"
              >
                <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                  ?
                </span>
                <span className="min-w-0 text-slate">
                  {t.text}
                  {t.needsHuman && (
                    <span className="ml-1.5 inline-flex rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                      人に聞く
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 話していないことは、ここに出ていない。
          そう言い切れるのは、引用の無い事実を
          取り出す段階で捨てているから（talk/shape.ts）。 */}
      <p className="mt-4 text-[11px] leading-[1.75] text-steel">
        話した内容から作っています。話していないことは入りません。
      </p>
    </div>
  );
}
