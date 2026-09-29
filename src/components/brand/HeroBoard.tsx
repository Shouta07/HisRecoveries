import Slot from "@/components/brand/Slot";
import { DEMO } from "@/lib/ask/demo";
import { VERDICTS } from "@/lib/ask/model";
import type { ImageKey } from "@/lib/images";

// ファーストビューの絵。
//
// ── 1枚を大きく出す ───────────────────────────────
// 狭い画面で、写真と文面と反応を横に並べていた。
// 1つ1つが小さい箱になって、どれも主役にならず、印象が薄かった。
// スマホでは縦に積んで、写真を全幅で大きく出す。
//   写真（大） → 送る前の文面 → 返ってきた反応
// 上から下に読むだけで、何が起きるのかが分かる並びにする。
//
// ── 重ねるのは、文面だけ ──────────────────────────
// 元の写真は顔が中央にある縦の構図。真ん中に何か置くと顔が隠れる。
// 重ねるのは下端の文面だけにして、顔には掛けない。
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

function Cards() {
  return (
    <ul className="flex flex-col gap-1.5 lg:gap-3">
      {PICKS.map((s, i) => {
        const v = VERDICTS.find((x) => x.id === s.verdict);
        return (
          <li
            key={s.age}
            className={`rounded-card bg-paper px-4 py-2 shadow-card lg:px-4 lg:py-3.5 ${
              i === 1 ? "hidden sm:block" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Slot
                name={FACES[i] ?? "w1"}
                rounded="rounded-full"
                className="h-8 w-8 shrink-0 lg:h-9 lg:w-9"
              />
              <span className="text-[12px] font-bold text-steel lg:text-[12.5px]">{s.age}歳</span>
              <span
                className={`ml-auto shrink-0 rounded-pill px-2.5 py-1 text-[10.5px] font-bold leading-none lg:text-[11px] ${TONE[s.verdict] ?? "bg-mist text-steel"}`}
              >
                {v?.label}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-[1.6] text-slate lg:text-[13.5px]">{s.say}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** 送ろうとしている文面。写真の下端に、顔を避けて重ねる */
function Draft({ inset }: { inset: boolean }) {
  return (
    <div
      className={`rounded-card bg-paper px-4 py-3 shadow-card ${
        inset ? "absolute inset-x-4 bottom-4" : "mt-3"
      }`}
    >
      <p className="text-[10.5px] font-bold leading-none text-brand lg:text-[11.5px]">
        送る前の文面
      </p>
      <p className="mt-2 text-[13.5px] font-bold leading-[1.6] text-slate lg:text-[14.5px]">
        {DEMO.before}
      </p>
    </div>
  );
}

/**
 * 絵につける注記。
 *
 * 絵と見出しのあいだに挟むと、いちばん見てほしい流れ
 * （写真 → 反応 → 見出し）が途中で切れる。
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
  return (
    <div>
      {/* 狭い画面。写真を全幅で大きく出して、下に反応を積む */}
      <div className="lg:hidden">
        <div className="relative">
          <Slot
            name="hero"
            rounded=""
            position="center 32%"
            className="h-[190px] w-full sm:h-[300px]"
          />
          {/* 下端だけ地の色へ落として、文面の箱が浮いて見えないようにする */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate/45 to-transparent"
          />
          <Draft inset />
        </div>

        <div className="px-5 pt-2 sm:px-8">
          <Cards />
        </div>
      </div>

      {/* 広い画面。左に自分、右に反応 */}
      <div className="mx-auto hidden max-w-[1120px] grid-cols-[minmax(0,440px)_1fr] items-center gap-10 px-12 pt-6 lg:grid">
        <div>
          <Slot name="hero" position="center 18%" className="h-[390px] w-full" />
          <Draft inset={false} />
        </div>
        <Cards />
      </div>

    </div>
  );
}
