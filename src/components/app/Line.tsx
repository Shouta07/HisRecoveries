"use client";

import { STAGES, type StageId } from "@/lib/journey";

// 一本の線（§28）。
//
// このプロダクトを通しての唯一の装飾。
// 道のり、時間、人との距離、記録の連なり——全部これ1つで表す。
// アイコンを増やす代わりに、同じ線を別の向きで使い回す。
//
// ── 進捗バーにしない ──────────────────────────────
// 線は「どこまで進んだか」を塗らない。全長がいつも同じ濃さで引かれていて、
// 点がひとつ、いまいるところに置いてあるだけ。
// 塗ってしまうと、右端に行くほど良いという意味が生まれる。
// 恋愛には戻ることも、止まることもある（§09）。

export function JourneyLine({
  current,
  onPick,
}: {
  current: StageId | null;
  onPick?: (id: StageId) => void;
}) {
  return (
    <div className="relative">
      {/* 線。全長が同じ濃さ。左から引かれるが、塗り分けはしない */}
      <span
        aria-hidden
        className="motion-safe:animate-hr-draw absolute left-0 right-0 top-[5px] block h-px origin-left bg-hairline"
      />
      <ul className="relative flex items-start justify-between">
        {STAGES.map((s) => {
          const now = s.id === current;
          const dot = (
            <span
              aria-hidden
              className={`block rounded-full transition-colors duration-200 ${
                now ? "h-[11px] w-[11px] bg-accent" : "h-[5px] w-[5px] bg-hairline"
              }`}
            />
          );
          return (
            <li key={s.id} className="flex flex-col items-center">
              {onPick ? (
                <button
                  type="button"
                  onClick={() => onPick(s.id)}
                  aria-current={now ? "step" : undefined}
                  aria-label={s.label}
                  className="flex min-h-[44px] w-9 flex-col items-center justify-start pt-0"
                  title={s.label}
                >
                  <span className={now ? "-mt-[3px]" : ""}>{dot}</span>
                </button>
              ) : (
                <span className={`block w-9 ${now ? "-mt-[3px]" : ""}`}>
                  <span className="mx-auto block w-fit">{dot}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {/* 両端だけ言葉を置く。
          8つ全部にラベルを付けると 390px で潰れるが、
          点だけの列は何の線か分からない。端を2つだけ書いて、道だと分かるようにする。 */}
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-[10.5px] text-faint">{STAGES[0]?.label}</span>
        <span className="text-[10.5px] text-faint">{STAGES[STAGES.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/**
 * 記録の時系列に沿う縦の線の上に置く点。
 * 1件ずつをカードで囲わず、線の上に留めていく形にする（§27）。
 *
 * 置き方は決まっている。親の <ol> が `border-l pl-6`、各 <li> が `relative`。
 * -28px は「pl-6（24px）の外に出て、1pxの線の真上に9pxの丸を載せる」位置。
 * ここを画面側で書き換えると、点が日付の文字に重なる。
 */
export function Node({ filled = false }: { filled?: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute left-[-28px] top-[7px] block h-[9px] w-[9px] rounded-full border ${
        filled ? "border-accent bg-accent" : "border-hairline bg-ground"
      }`}
    />
  );
}
