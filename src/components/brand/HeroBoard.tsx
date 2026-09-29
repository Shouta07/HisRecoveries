import Slot from "@/components/brand/Slot";
import { DEMO } from "@/lib/ask/demo";
import { VERDICTS } from "@/lib/ask/model";
import type { ImageKey } from "@/lib/images";

// ファーストビューの絵。
//
// ── 男と女、両方を出す ────────────────────────────
// 相談する人だけを出すと、何のサービスか分からない。
// 「手が止まっている男性」と「読んで返す女性」が1枚に入って、
// はじめて、誰が誰に何をしてもらえるのかが伝わる。
//
// ── 重ねない ──────────────────────────────────────
// 最初は写真を全幅に敷いて、その上にカードを重ねていた。
// 元の写真は顔が中央にある縦の構図なので、どこに重ねても顔が隠れる。
// 隠すくらいなら、写真を置く意味が無い。
// 左に自分（写真と送る文面）、右に返ってくる反応。どの幅でも横に並べる。
//
// ── 顔に肩書きを付けない ──────────────────────────
// 顔写真に「26歳 会社員」と添えると、実在の回答者の名簿に見える。
// 写真はイメージで、回答は画面の見本。名簿ではない。
// 年代だけにして、注記は絵の外（切り取られない場所）に置く。
//
// ── 回答は作らない ────────────────────────────────
// ここに出る言葉は demo.ts のものをそのまま使う。
// 絵のために書き足すと、見本と本文で別のことを言いはじめる。
// demo.ts には「全部が肯定にならない」ビルド時の判定が入っている。

/** 絵に出す3人。「直したほうがいい／少し気になる／このままでOK」を1人ずつ */
const FACES: ImageKey[] = ["w1", "w3", "w5"];

const PICKS = [
  DEMO.says.find((s) => s.verdict === "change"),
  DEMO.says.find((s) => s.verdict === "slight"),
  DEMO.says.find((s) => s.verdict === "as_is"),
].filter((s): s is (typeof DEMO.says)[number] => Boolean(s));

const TONE: Record<string, string> = {
  change: "bg-rose-fill text-paper",
  slight: "bg-brand-tint text-brand",
  as_is: "bg-mist text-steel",
};

export default function HeroBoard() {
  return (
    <div>
      <div className="mx-auto grid max-w-[1120px] grid-cols-[0.8fr_1.2fr] items-start gap-3 px-5 pt-4 sm:gap-5 sm:px-8 lg:grid-cols-[minmax(0,440px)_1fr] lg:items-center lg:gap-10 lg:px-12 lg:pt-6">
        {/* 自分の側。写真と、送ろうとしている文面 */}
        <div>
          <Slot
            name="hero"
            position="center 18%"
            className="h-[150px] w-full sm:h-[240px] lg:h-[390px]"
          />
          <div className="mt-2.5 rounded-card border border-line bg-paper px-3.5 py-2.5 lg:mt-4 lg:px-4 lg:py-3">
            <p className="text-[10.5px] font-bold leading-none text-brand lg:text-[11.5px]">
              送る前の文面
            </p>
            <p className="mt-1.5 text-[12px] font-bold leading-[1.6] text-slate sm:text-[13px] lg:text-[14.5px]">
              {DEMO.before}
            </p>
          </div>
        </div>

        {/* 読んだ女性の反応。狭い画面では2枚（3枚だと縦が合わない） */}
        <ul className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3">
          {PICKS.map((s, i) => {
            const v = VERDICTS.find((x) => x.id === s.verdict);
            return (
              <li
                key={s.age}
                className={`rounded-card bg-paper px-3 py-2.5 shadow-card sm:px-4 sm:py-3 lg:py-3.5 ${
                  i === 1 ? "hidden sm:block" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Slot
                    name={FACES[i] ?? "w1"}
                    rounded="rounded-full"
                    className="h-7 w-7 shrink-0 lg:h-9 lg:w-9"
                  />
                  <span className="text-[10.5px] font-bold text-steel sm:text-[11.5px] lg:text-[12.5px]">
                    {s.age}歳
                  </span>
                  <span
                    className={`ml-auto shrink-0 rounded-pill px-2 py-[3px] text-[9.5px] font-bold leading-none sm:text-[10.5px] lg:text-[11px] ${TONE[s.verdict] ?? "bg-mist text-steel"}`}
                  >
                    {v?.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] leading-[1.6] text-slate sm:text-[12.5px] lg:text-[13.5px]">
                  {s.say}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 注記は絵の外に置く。画像に焼き込むと、貼られたときに一緒に切られる */}
      <p className="px-5 pt-3 text-[10.5px] leading-[1.7] text-steel sm:px-8 sm:text-[11.5px] lg:px-12">
        ※ 写真はイメージ、文面と回答は画面の見本です。
      </p>
    </div>
  );
}
