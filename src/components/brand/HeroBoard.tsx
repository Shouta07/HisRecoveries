import Slot from "@/components/brand/Slot";
import { DEMO } from "@/lib/ask/demo";
import { VERDICTS } from "@/lib/ask/model";
import { plan as getPlan, DEFAULT_PLAN } from "@/lib/ask/plans";
import type { ImageKey } from "@/lib/images";

// ファーストビューの絵。
//
// ══════════════════════════════════════════════════
// 1枚の場面にする
// ══════════════════════════════════════════════════
// 前は「写真の帯」と「流れのカード」が上下に別々に積んであった。
// 縦に積むと、写真は写真、カードはカードで、
// 同じ出来事の絵だと読み取れない。
//
// 渡された案の形にする。写真の上に直接のせる。
//   左下   いま送ろうとしている文面
//   矢印   それが右へ渡る
//   右     読んだ女性の反応
// 目で1本の線を引けるので、何が起きる製品なのかが読まずに入る。
//
// ══════════════════════════════════════════════════
// 顔に職業を付けない
// ══════════════════════════════════════════════════
// 案では顔の横に「26歳 会社員」「28歳 事務職」「24歳 大学生」と
// 入っていた。ここだけは案のとおりにできない。
//
// 写真は素材で、回答は画面の見本。
// そこに年齢と職業を添えると、実在の登録者の名簿になる。
// 審査を通った回答者はまだ0人なので、並べた時点で作り話になる。
// 出すのは年代だけにして、注記を絵の外に置く。
//
// ══════════════════════════════════════════════════
// 回答は作らない
// ══════════════════════════════════════════════════
// ここに出る言葉は demo.ts のものをそのまま使う。
// 絵のために書き足すと、見本と本文で別のことを言いはじめる。
// demo.ts には「全部が肯定にならない」ビルド時の判定が入っている。
//
// ══════════════════════════════════════════════════
// 写真のどこに何を置けるか
// ══════════════════════════════════════════════════
// 1回 = 1人になったので、反応は1枚。
// 空いたぶんに「直した文面」を入れて、
//   送る前の文面 → 女性が読むと → 反応 → 直した文面
// が1枚で読めるようにする。感想で終わる絵にしない。
//
// 素材は 522×682 の縦。そのまま全幅に敷くと、人が真ん中に来る。
// 真ん中にいる人の上にカードを置くと、顔が隠れる。
//
// object-position では直せない。縦の素材を横長の枠に入れると
// 横幅でぴったり合ってしまい、左右に動かす余地が無いため。
// なので枠より広く引き伸ばして、左へずらす。
//   枠     w-full
//   写真   w-[122%] -left-[22%]
// 倍率はこれ以上上げない。上げると顔が枠から溢れる。
// 顔は素材の横 18〜62% にあるので、k 倍して d ずらすと
// 右端は 0.62k − d。カードが 46% から始まるので、
// 0.62k − d ≦ 0.46 かつ 右に隙間を作らない k − 1 ≦ d。
// この2つを満たす上限が k = 1.22。
//
//   反応   右上   背景の上。顔を隠さない
//   文面   左下   手とスマホの上。案と同じ置き方
// 狭い画面では反応を2枚にして、文面と重ならないようにする。

/** 絵に出す人の顔 */
const FACES: ImageKey[] = ["w1", "w3", "w5"];

// 見本に出す反応。1回 = 1人なので、ふつうは1つ。
// 人数を増やしたときも、ここは demo.ts の中身をそのまま出す
// （絵のために足さない）。
const PICKS = DEMO.says;

const TONE: Record<string, string> = {
  change: "bg-rose-fill text-paper",
  slight: "bg-brand-tint text-brand",
  as_is: "bg-mist text-steel",
};

/**
 * 絵につける注記。
 *
 * 絵と見出しのあいだに挟むと、いちばん見てほしい流れが途中で切れる。
 * 画像には焼き込まない（貼られたときに一緒に切られる）ので、
 * 同じ画面の下のほうに、文字として置く。
 */
export function HeroNote() {
  return (
    <p className="text-[11px] leading-[1.7] text-steel">
      ※ 写真はイメージ、文面と回答は画面の見本です。
    </p>
  );
}

export default function HeroBoard() {
  const answers = getPlan(DEFAULT_PLAN).answers;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 lg:px-12">
      <div className="relative">
        {/* 写真。人を左へ寄せて、右側を空ける */}
        <div className="relative h-[360px] overflow-hidden rounded-card sm:h-[440px] lg:h-[460px] lg:w-[62%]">
          {/* Slot 自身が relative を持っているので、ここで absolute を上書きできない
              （Tailwind では .relative が後ろに出る）。外側の箱でずらす */}
          <div className="absolute inset-y-0 -left-[22%] w-[122%] sm:-left-[15%] sm:w-[115%] lg:-left-[8%] lg:w-[108%]">
            <Slot name="hero" rounded="" position="center 16%" className="h-full w-full" />
          </div>
        </div>

        {/* 右上：読んだ女性の反応。背景の上に来るので、顔は隠れない */}
        <div className="absolute right-3 top-3 w-[54%] max-w-[240px] sm:right-5 sm:top-6 sm:w-[48%] sm:max-w-[330px] lg:right-0 lg:top-9 lg:w-[46%] lg:max-w-[440px]">
          {/* ここが製品そのもの。矢印だけだと「何人が」が消える */}
          <span className="inline-flex items-center gap-1 rounded-pill bg-brand px-2.5 py-1.5 text-[10.5px] font-black leading-none text-paper shadow-card sm:text-[12px]">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {answers > 1 ? `実在の女性${answers}人が読むと` : "実在の女性が読むと"}
          </span>

          <ul className="mt-2 flex flex-col gap-1.5 sm:gap-2.5">
            {PICKS.map((s, i) => {
              const v = VERDICTS.find((x) => x.id === s.verdict);
              return (
                <li
                  key={s.age}
                  className={`rounded-card bg-paper px-2.5 py-2 shadow-card-hover sm:px-3.5 sm:py-2.5 ${
                    i === 1 ? "hidden sm:block" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Slot
                      name={FACES[i] ?? "w1"}
                      rounded="rounded-full"
                      className="h-6 w-6 shrink-0 sm:h-8 sm:w-8"
                    />
                    {/* 年代だけ。職業は付けない（付けた時点で名簿になる） */}
                    <span className="text-[10.5px] font-bold text-steel sm:text-[12px]">
                      {s.age}歳
                    </span>
                    <span
                      className={`ml-auto shrink-0 rounded-pill px-1.5 py-1 text-[9.5px] font-black leading-none sm:px-2.5 sm:py-1.5 sm:text-[11.5px] ${
                        TONE[s.verdict] ?? "bg-mist text-steel"
                      }`}
                    >
                      {v?.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[10.5px] leading-[1.55] text-slate sm:mt-1.5 sm:text-[13px] lg:text-[13.5px]">
                    {s.say}
                  </p>
                </li>
              );
            })}
          </ul>

          {/* 感想で終わらせない。直した文面まで、同じ絵の中に置く */}
          <div className="mt-1.5 rounded-card bg-brand px-2.5 py-2 shadow-card sm:mt-2.5 sm:px-3.5 sm:py-2.5">
            <p className="text-[9.5px] font-bold leading-none text-paper/85 sm:text-[11px]">
              そのまま使える修正文
            </p>
            <p className="mt-1 text-[10.5px] font-bold leading-[1.55] text-paper sm:mt-1.5 sm:text-[13px]">
              {DEMO.after}
            </p>
          </div>
        </div>

        {/* 左下：いま送ろうとしている文面。手とスマホの上に置く */}
        <div className="absolute bottom-3.5 left-3 w-[58%] max-w-[240px] sm:bottom-6 sm:left-6 sm:w-[44%] sm:max-w-[300px] lg:bottom-8 lg:left-8 lg:w-[34%]">
          <span className="inline-flex rounded-pill bg-slate px-2.5 py-1 text-[10px] font-bold leading-none text-paper shadow-card sm:text-[11.5px]">
            送る前の文面
          </span>
          {/* 送信ボタンを添える。引用ではなく「いま送ろうとしている文面」に見せる。
              押せるものではないので、読み上げには出さない。 */}
          <div className="mt-1.5 flex items-end gap-2 rounded-card bg-paper p-2.5 shadow-card-hover sm:gap-2.5 sm:p-3.5">
            <p className="min-w-0 flex-1 text-[12px] font-black leading-[1.55] text-slate sm:text-[14.5px]">
              {DEMO.before}
            </p>
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-paper sm:h-9 sm:w-9"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" fill="currentColor">
                <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
              </svg>
            </span>
          </div>
        </div>

        {/* 文面から反応へ、目を運ぶ線。狭い画面では場所が無いので出さない */}
        <svg
          aria-hidden
          viewBox="0 0 60 48"
          className="absolute bottom-[36%] left-[46%] hidden h-[40px] w-[50px] text-brand sm:block lg:bottom-[42%] lg:left-[36%] lg:h-[54px] lg:w-[66px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 44C10 22 28 8 52 6" />
          <path d="M38 4h15v15" />
        </svg>
      </div>
    </div>
  );
}
