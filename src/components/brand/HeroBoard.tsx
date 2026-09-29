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
// ── 顔に肩書きを付けない ──────────────────────────
// 顔写真に「26歳 会社員」と添えると、実在の回答者の名簿に見える。
// 写真はイメージで、回答は画面の見本。名簿ではない。
// 年代だけにして、注記は絵の外（切り取られない場所）に置く。
//
// ── 回答は作らない ────────────────────────────────
// ここに出る言葉は demo.ts のものをそのまま使う。
// 絵のために書き足すと、見本と本文で別のことを言いはじめる。
// demo.ts には「全部が肯定にならない」ビルド時の判定が入っている。
//
// ── 広い画面では、写真を全幅に敷かない ────────────
// 元の写真は 522×682。1280px に敷くと 2.45 倍に拡大されて、
// 顔だけが画面いっぱいに伸びる（粗くもなる）。
// 広い画面では左の段に入れて、等倍に近い大きさで使う。

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
 * 読んだ女性の反応。
 *
 * 狭い画面に3枚は入らない（入れると上下が切れて読めない）。
 * 真ん中を落として、意見が割れることだけ伝える。枚数は要点ではない。
 */
function Cards({ compact }: { compact: boolean }) {
  return (
    <ul className={`flex flex-col ${compact ? "gap-2 sm:gap-3" : "gap-3"}`}>
      {PICKS.map((s, i) => {
        const v = VERDICTS.find((x) => x.id === s.verdict);
        return (
          <li
            key={s.age}
            className={`rounded-card bg-paper shadow-card ${
              compact
                ? `px-3 py-2.5 sm:px-4 sm:py-3 ${i === 1 ? "hidden sm:block" : ""}`
                : "px-4 py-3.5"
            }`}
          >
            <div className="flex items-center gap-2">
              <Slot
                name={FACES[i] ?? "w1"}
                rounded="rounded-full"
                className={compact ? "h-7 w-7 shrink-0 sm:h-8 sm:w-8" : "h-9 w-9 shrink-0"}
              />
              <span
                className={`font-bold text-steel ${
                  compact ? "text-[10.5px] sm:text-[11.5px]" : "text-[12.5px]"
                }`}
              >
                {s.age}歳
              </span>
              <span
                className={`ml-auto shrink-0 rounded-pill px-2 py-[3px] font-bold leading-none ${
                  compact ? "text-[9.5px] sm:text-[10.5px]" : "text-[11px]"
                } ${TONE[s.verdict] ?? "bg-mist text-steel"}`}
              >
                {v?.label}
              </span>
            </div>
            <p
              className={`mt-1.5 leading-[1.6] text-slate ${
                compact ? "text-[11px] sm:text-[12.5px]" : "text-[13.5px]"
              }`}
            >
              {s.say}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** 送る前の文面。写真の左下に、小さく重ねる */
function Draft({ compact }: { compact: boolean }) {
  return (
    <div
      className={`absolute rounded-card bg-paper shadow-card ${
        compact
          ? "bottom-3 left-3 w-[42%] max-w-[210px] px-3 py-2.5 sm:bottom-5 sm:left-5"
          : "bottom-5 left-5 w-[76%] px-4 py-3"
      }`}
    >
      <p
        className={`font-bold leading-none text-brand ${
          compact ? "text-[10px] sm:text-[11px]" : "text-[11.5px]"
        }`}
      >
        送る前の文面
      </p>
      <p
        className={`mt-1.5 font-bold leading-[1.55] text-slate ${
          compact ? "text-[11.5px] sm:text-[13px]" : "text-[14.5px]"
        }`}
      >
        {DEMO.before}
      </p>
    </div>
  );
}

export default function HeroBoard() {
  return (
    <div>
      {/* 狭い〜中くらいの画面。写真を全幅に敷いて、その上に重ねる */}
      <div className="relative h-[264px] w-full overflow-hidden sm:h-[340px] lg:hidden">
        <Slot
          name="hero"
          rounded=""
          position="18% 20%"
          className="absolute inset-0 h-full w-full"
        />
        <Draft compact />
        <div className="absolute inset-y-0 right-0 flex w-[57%] max-w-[330px] flex-col justify-center pr-2.5 sm:w-[50%] sm:pr-5">
          <Cards compact />
        </div>
      </div>

      {/* 広い画面。左に写真、右に反応。重ねずに並べる */}
      <div className="mx-auto hidden max-w-[1120px] grid-cols-[minmax(0,480px)_1fr] items-center gap-10 px-8 pt-6 lg:grid lg:px-12">
        <div className="relative">
          <Slot name="hero" position="center 16%" className="h-[410px] w-full" />
          <Draft compact={false} />
        </div>
        <Cards compact={false} />
      </div>

      {/* 注記は絵の外に置く。画像に焼き込むと、貼られたときに一緒に切られる */}
      <p className="px-5 pt-2 text-[10.5px] leading-[1.7] text-steel sm:px-8 sm:text-[11.5px] lg:px-12">
        ※ 写真はイメージ、文面と回答は画面の見本です。
      </p>
    </div>
  );
}
