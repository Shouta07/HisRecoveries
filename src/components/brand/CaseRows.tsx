import Slot from "@/components/brand/Slot";
import PlanCta from "@/components/brand/PlanCta";
import { OPEN_CASES } from "@/lib/ask/cases";
import { VERDICTS } from "@/lib/ask/model";
import { DEFAULT_PLAN } from "@/lib/ask/plans";
import type { ImageKey } from "@/lib/images";

// 「こういう時に使う」を、場面ごとに1つずつ。
//
// ══════════════════════════════════════════════════
// 売るのはここ
// ══════════════════════════════════════════════════
// 「恋愛は、小さな選択の積み重ね。」の節では売らない。
// あそこは、どの段で何に迷うかを書くだけ。
//
// 売るのはここ。実際に何が返ってくるかを見せてから、押す場所を出す。
//
// ══════════════════════════════════════════════════
// 形は、分岐点 → 出すもの → 反応 → 決めたこと
// ══════════════════════════════════════════════════
// 迷っている選択を頭に置き、材料を見せ、最後に本人が決める。
// この順番が崩れると、ただの添削の見本になる。
// 最後の行をこちらの指図にしない。決めるのは読んでいる人。
//
// ══════════════════════════════════════════════════
// 顔に職業を付けない
// ══════════════════════════════════════════════════
// 「26歳 看護師」のように顔の横へ職業を並べると、
// 実在の回答者の名簿に見える。年代だけにする。
//
// ══════════════════════════════════════════════════
// 受け付けていない場面は出さない
// ══════════════════════════════════════════════════
// 出すと、押した人が行き止まりに当たる。OPEN_CASES だけを描く。

/** 回答する側の顔。場面ごとに配る */
const FACES: ImageKey[][] = [
  ["w1", "w2"],
  ["w3", "w4"],
  ["w5", "w1"],
  ["w2", "w3"],
  ["w4", "w5"],
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
          {/* 迷っている選択を、いちばん上に。場面名だけだと品書きになる */}
          <p className="text-[11.5px] font-bold text-steel">{c.scene}</p>
          <h3 className="mt-1 text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
            {c.decision}
          </h3>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-[1fr_1.15fr] sm:items-start sm:gap-5">
            {/* 自分が出すもの */}
            <div className="rounded-card border border-line px-4 py-3.5">
              <p className="text-[11px] font-bold leading-none text-brand">{c.draft.label}</p>
              <p className="mt-2 text-[13.5px] font-bold leading-[1.65] text-slate">
                {c.draft.text}
              </p>
            </div>

            {/* 返ってくる言葉。地の色を変えて、来たものだと分かるようにする */}
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
                        className={`ml-auto shrink-0 rounded-pill px-2 py-[3px] text-[10px] font-bold leading-none ${
                          TONE[s.verdict] ?? "bg-paper text-steel"
                        }`}
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

          {/* 材料を見たあと、決めるのは本人。
              ここをこちらの結論にすると、判断を預ける商売になる */}
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-3 text-[12.5px] leading-[1.7]">
            <span className="font-bold text-steel">見て、決めたこと</span>
            <span className="min-w-0 font-bold text-slate">{c.decided}</span>
          </p>

          <PlanCta
            plan={DEFAULT_PLAN}
            from={`case_${c.id}`}
            category={c.category}
            className="!justify-start mt-2 min-h-[40px] p-0 text-[13.5px] !text-brand"
          >
            この場面を確かめる <span aria-hidden className="ml-1.5">&rarr;</span>
          </PlanCta>
        </article>
      ))}
    </div>
  );
}
