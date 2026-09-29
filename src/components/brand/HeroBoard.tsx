import Slot from "@/components/brand/Slot";
import { DEMO } from "@/lib/ask/demo";
import { VERDICTS } from "@/lib/ask/model";
import { plan as getPlan, DEFAULT_PLAN } from "@/lib/ask/plans";
import type { ImageKey } from "@/lib/images";

// ファーストビューの絵。
//
// ── 箱を浮かせない ────────────────────────────────
// 写真・送る文面・反応2枚を、別々の箱として並べていた。
// どれとどれが繋がっているのか示していないので、
// 何が起きる製品なのか、絵からは読み取れなかった。
//
// 1枚のカードにまとめて、あいだに言葉を入れる。
//   送る前の文面 → 実在の女性◯人が読むと → 返ってきた反応
// 上から下に1本の線で読める形にする。
//
// ── 写真に文字を重ねない ──────────────────────────
// 写真の下端に「このLINE、今送っていい？」を載せていた。
// 何のサービスかは、写真の上に置いた一文が先に言うようになったので、
// ここで同じ役目をもう一度やると、頭に2つ入ってどちらも残らない。
// 文字を外したので、暗く落としていた帯も要らない。
//
// ── 写真は、気分のほう ────────────────────────────
// 元の写真は 522×682 の縦。全幅に敷くと 2.6 倍に拡大されるので、
// 顔と手元のスマホを同時に入れることはできない。
// 意味はカードが持つ。写真は「自分と同じ人がいる」だけを受け持つ。
// 文字を外したぶん高さも下げた。上に説明の一文が増えたので、
// ここで取り返しておかないと、押す場所がさらに下へ行く。
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

/**
 * 送る前の文面から、返ってきた反応まで。1枚で見せる。
 *
 * 途中の「実在の女性◯人が読むと」が、この製品そのもの。
 * ここを書かずに箱だけ並べても、何が起きたのかは伝わらない。
 */
function Story() {
  const answers = getPlan(DEFAULT_PLAN).answers;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-card-hover">
      <div className="px-4 pb-3.5 pt-3.5 lg:px-5 lg:pt-4">
        <p className="text-[10.5px] font-bold leading-none text-steel lg:text-[11.5px]">
          送る前の文面
        </p>
        {/* 送信ボタンを添える。引用ではなく「いま送ろうとしている文面」に見せる。
            押せるものではないので、読み上げには出さない。 */}
        <div className="mt-2 flex items-end gap-2.5">
          <p className="min-w-0 flex-1 rounded-card rounded-br-[4px] bg-mist px-3.5 py-2.5 text-[14px] font-black leading-[1.6] text-slate lg:text-[16px]">
            {DEMO.before}
          </p>
          <span
            aria-hidden
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-paper lg:h-9 lg:w-9"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 lg:h-[18px] lg:w-[18px]" fill="currentColor">
              <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
            </svg>
          </span>
        </div>
      </div>

      {/* ここが製品。上と下を繋ぐ言葉を、線の上に載せる */}
      <div className="relative border-t border-line">
        <span className="absolute -top-[11px] left-4 inline-flex items-center gap-1.5 rounded-pill bg-brand px-3 py-1.5 text-[11.5px] font-black leading-none text-paper shadow-card lg:left-5 lg:text-[12.5px]">
          <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
          実在の女性{answers}人が読むと
        </span>

        <ul className="flex flex-col divide-y divide-line pt-3">
          {PICKS.map((s, i) => {
            const v = VERDICTS.find((x) => x.id === s.verdict);
            return (
              <li
                key={s.age}
                className={`px-4 py-2.5 lg:px-5 lg:py-3 ${i === 1 ? "hidden sm:block" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Slot
                    name={FACES[i] ?? "w1"}
                    rounded="rounded-full"
                    className="h-7 w-7 shrink-0 lg:h-8 lg:w-8"
                  />
                  <span className="text-[11.5px] font-bold text-steel lg:text-[12.5px]">
                    {s.age}歳
                  </span>
                  <span
                    className={`ml-auto shrink-0 rounded-pill px-2.5 py-1.5 text-[11px] font-black leading-none lg:text-[12px] ${TONE[s.verdict] ?? "bg-mist text-steel"}`}
                  >
                    {v?.label}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-slate lg:text-[13.5px]">
                  {s.say}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

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
  return (
    <div>
      {/* 狭い画面。写真を帯で敷いて、その下に流れを1枚で置く */}
      <div className="lg:hidden">
        <Slot
          name="hero"
          rounded=""
          position="center 22%"
          className="h-[156px] w-full sm:h-[280px]"
        />

        <div className="mt-2 px-5 sm:px-8">
          <Story />
        </div>
      </div>

      {/* 広い画面。左に自分、右に流れ */}
      <div className="mx-auto hidden max-w-[1120px] grid-cols-[minmax(0,420px)_1fr] items-center gap-10 px-12 pt-6 lg:grid">
        <Slot name="hero" position="center 18%" className="h-[380px] w-full" />
        <Story />
      </div>
    </div>
  );
}
