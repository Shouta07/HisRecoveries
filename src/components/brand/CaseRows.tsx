import Slot from "@/components/brand/Slot";
import PlanCta from "@/components/brand/PlanCta";
import { OPEN_CASES } from "@/lib/ask/cases";
import { VERDICTS } from "@/lib/ask/model";
import { DEFAULT_PLAN } from "@/lib/ask/plans";
import type { ImageKey } from "@/lib/images";

// 「こういう時に使う」を、場面ごとに1行ずつ。
//
// ── 送るものと、返ってくるものを並べる ────────────
// 説明を読ませるより、送る文面と返ってきた言葉を横に置くほうが早い。
// 左が自分の出すもの、右が返ってくるもの。それだけの絵にする。
//
// ── 顔に職業を付けない ────────────────────────────
// 「26歳 看護師」のように顔の横へ職業を並べると、
// 実在の回答者の名簿に見える。年代だけにする。
//
// ── 受け付けていない場面は出さない ────────────────
// 服装や会話は、いま送る手段が無い（画像も通話も受けていない）。
// 出すと、押した人が行き止まりに当たる。OPEN_CASES だけを描く。

/** 回答する側の顔。場面ごとに2人ずつ、重ならないように配る */
const FACES: ImageKey[][] = [
  ["w1", "w2"],
  ["w3", "w4"],
  ["w5", "w1"],
];

const TONE: Record<string, string> = {
  change: "bg-rose-fill text-paper",
  slight: "bg-brand-tint text-brand",
  as_is: "bg-mist text-steel",
};

export default function CaseRows() {
  return (
    <div className="flex flex-col gap-3">
      {OPEN_CASES.map((c, row) => (
        <article
          key={c.id}
          className="rounded-card border border-line bg-paper p-3.5 shadow-card sm:p-5"
        >
          <h3 className="text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
            {c.scene}
          </h3>
          {/* 狭い画面では出さない。見出しとほぼ同じことを言っていて、
              1行ぶんが3回積み上がると、それだけで1画面近くになる。 */}
          <p className="mt-1.5 hidden text-[13.5px] leading-[1.8] text-steel sm:block">
            {c.what}
          </p>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-[minmax(0,288px)_1fr] sm:items-center sm:gap-5">
            {/* 左：その場面と、送ろうとしているもの */}
            <div className="relative">
              <Slot
                  name={c.img}
                  position="center 38%"
                  className="h-[140px] w-full sm:aspect-[226/162] sm:h-auto"
                />
              <div className="absolute inset-x-2.5 bottom-2.5 rounded-card bg-paper px-3 py-2 shadow-card">
                <p className="text-[10px] font-bold leading-none text-brand">{c.draft.label}</p>
                <p className="mt-1.5 text-[11.5px] font-bold leading-[1.55] text-slate sm:text-[12.5px]">
                  {c.draft.text}
                </p>
              </div>
            </div>

            {/* 右：返ってくる言葉 */}
            <ul className="flex flex-col gap-2">
              {c.says.map((s, i) => {
                const v = VERDICTS.find((x) => x.id === s.verdict);
                return (
                  <li key={s.age} className="rounded-card bg-mist px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Slot
                        name={FACES[row % FACES.length][i % 2]}
                        rounded="rounded-full"
                        className="h-7 w-7 shrink-0"
                      />
                      <span className="text-[11px] font-bold text-steel">{s.age}歳</span>
                      <span
                        className={`ml-auto shrink-0 rounded-pill px-2 py-[3px] text-[10px] font-bold leading-none ${TONE[s.verdict] ?? "bg-paper text-steel"}`}
                      >
                        {v?.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[1.7] text-slate sm:text-[12.5px]">
                      {s.say}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <PlanCta
            plan={DEFAULT_PLAN}
            from={`case_${c.id}`}
            category={c.category}
            className="!justify-start mt-2.5 min-h-[40px] p-0 text-[13.5px] !text-brand"
          >
            この相談をする <span aria-hidden className="ml-1.5">&rarr;</span>
          </PlanCta>
        </article>
      ))}
    </div>
  );
}
