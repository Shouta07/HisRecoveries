import StepIcon from "@/components/brand/StepIcon";
import Reveal from "@/components/brand/Reveal";
import { STEPS } from "@/lib/ask/journey";

// 恋愛の道のり。
//
// ══════════════════════════════════════════════════
// ここでは売らない
// ══════════════════════════════════════════════════
// 前は、段を押すと場面がポップアップで開き、
// その中に商品名と値段と「この段を確かめる」が入っていた。
//
// そうすると、この節が
//   「恋愛は、小さな選択の積み重ね。」という考え方
//   商品の入口
// の両方を背負って、どちらも中途半端になる。
//
// ここは、どの段でどんなことに迷うかを書くだけ。
// 押せる場所を作らない。
// 売るのは、この下の「こんな選択を、選ぶ前に」と料金の節。
//
// ══════════════════════════════════════════════════
// 受け取れないものを書かない
// ══════════════════════════════════════════════════
// 「この写真でいい？」は置けない。画像を受け取る口が無い。
// 判定は lib/ask/journey.ts の側にある。
//
// ══════════════════════════════════════════════════
// クライアント側の仕掛けを持たない
// ══════════════════════════════════════════════════
// ポップアップをやめたので、この部品は server component でよい。
// 読むだけの節に JavaScript を配らない。

export default function Journey() {
  return (
    <ol className="relative mt-10 flex flex-col gap-4 sm:gap-5">
      {/* 背骨。
          狭い画面で左右に振ると、カード1枚が 40% 幅になって読めない。
          390px では左に1本通し、640px から真ん中へ移して左右に振る。 */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-[13px] w-px bg-line sm:left-1/2 sm:-translate-x-1/2"
      />

      {STEPS.map((j, i) => {
        const right = i % 2 === 1;

        return (
          <Reveal key={j.id} delay={i * 45}>
            {/* 左右に振ると反対側が空く。1枚目以外を少し上へ引いて詰める */}
            <li className={`relative ${i > 0 ? "sm:-mt-[40px]" : ""}`}>
              <span
                aria-hidden
                className="absolute left-[7px] top-7 h-3 w-3 rounded-full border-2 border-paper bg-brand sm:left-1/2 sm:top-9 sm:-translate-x-1/2"
              />
              <div className={`ml-8 sm:ml-0 sm:w-[46%] ${right ? "sm:ml-auto" : ""}`}>
                <div className="rounded-card border border-line bg-paper p-4 shadow-card sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-black tabular-nums text-brand-deep"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-[15.5px] font-black leading-[1.4] text-slate">
                      {j.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-3">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
                    >
                      <StepIcon name={j.icon} />
                    </span>
                    <p className="min-w-0 flex-1 pt-0.5 text-[13px] leading-[1.7] text-steel">
                      {j.summary}
                    </p>
                  </div>

                  {/* ここに、各段で迷うことを3つずつ並べていた（15行）。
                      すぐ上の「こんな瞬間、ありませんか？」が同じ仕事をしていて、
                      この節だけでスマホ2.2画面を使っていた。

                      この節の仕事は「恋愛は、小さな選択の積み重ね」という
                      考え方を見せることで、場面の一覧を出すことではない。
                      段の名前と、そこで何をするかだけにする。

                      choices は journey.ts に残してある。消すと
                      /situations と相談の入口が持っている語彙も消える。 */}
                </div>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ol>
  );
}
