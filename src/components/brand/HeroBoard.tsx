import Slot from "@/components/brand/Slot";
import { MOMENTS } from "@/lib/ask/pain";
import { PLANS, FAMILIES } from "@/lib/ask/plans";
import { IMAGES } from "@/lib/images";

// ファーストビューの絵。
//
// ══════════════════════════════════════════════════
// 3枚で、1本の話にする
// ══════════════════════════════════════════════════
// 前は1枚の写真の上に、文面と反応と修正文を重ねていた。
// 情報は全部入っていたが、「何がどう変わるのか」は
// 重ねただけでは順番にならない。
//
//   Before   手が止まっている
//     ↓
//   相談     実在の女性に聞く（文字・画像／声）
//     ↓
//   After    送れる
//
// 縦に3枚。矢印で繋ぐ。読まずに、目だけで筋が通る。
//
// ══════════════════════════════════════════════════
// 吹き出しの言葉を、ここで書かない
// ══════════════════════════════════════════════════
// 「手が止まる瞬間」（lib/ask/pain.ts）から取る。
// ここで書き足すと、すぐ下の一覧と別のことを言いはじめる。
//
// pain.ts の判定も一緒に効く。
//   画像を前提にした場面を出さない（受け取る口がまだ無い）
//   相手の気持ちを当てる言い方にしない
//   押した先が受付中のカテゴリであること
//
// 渡された案の3つ目は「この写真どっちがいい…?」だった。
// これは置けない。画像を受け取る口が開いていないので、
// 押した人が行き止まりに当たる。
// 同じ「出す前に見てほしい」場面である自己紹介文にする。
//
// ══════════════════════════════════════════════════
// 顔に、属性を付けない
// ══════════════════════════════════════════════════
// 写真は素材。審査を通った回答者はまだ0人なので、
// 年齢も職業も名前も付けない。付けた時点で名簿になる。
// 注記（HeroNote）は、絵の一部として必ず一緒に出す。
//
// ══════════════════════════════════════════════════
// 開いていないものを、開いているように出さない
// ══════════════════════════════════════════════════
// 声の商品は、鍵が揃うまで買えない（call/gate.ts）。
// 並べて出すのはいいが、いま受け付けているかは出す。
// 1画面目で約束して、押した先で断るのがいちばん悪い。

/** 絵につける注記。絵を残すかぎり、一緒に残る */
export function HeroNote() {
  return (
    <p className="mt-2.5 text-[10.5px] leading-[1.7] text-steel">
      ※ 写真はイメージです。実際の相談内容ではありません。
    </p>
  );
}

/** 段と段をつなぐ矢印 */
function Down() {
  return (
    <div className="flex justify-center py-2 sm:py-2.5">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-6 w-6 text-brand sm:h-7 sm:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4v15M5 13l7 7 7-7" />
      </svg>
    </div>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-3 top-3 z-10 rounded-pill bg-slate/85 px-3 py-1.5 text-[11.5px] font-black leading-none text-paper sm:left-4 sm:top-4 sm:px-3.5 sm:text-[13px]">
      {children}
    </span>
  );
}

/**
 * 1画面目の吹き出し。
 *
 * ══════════════════════════════════════════════════
 * ここだけ、MOMENTS を使わない
 * ══════════════════════════════════════════════════
 * すぐ下の「こんな瞬間、ありませんか？」（MOMENTS）は、
 * 1つずつが押せて、その場面の相談へ入る口になっている。
 * だから pain.ts には「押した先が受付中か」「画像を前提に
 * していないか」という判定が付いている。
 *
 * ここは押せない。頭の中の声を、絵として出しているだけ。
 * 行き先が無いので、行き止まりにもならない。
 *
 * そのぶん、実際に頭に浮かぶ言葉そのままにできる。
 * 「この写真どっちがいい…？」は、文章・画像で確カメる
 * （FAMILIES の text）が受けている相談そのもの。
 *
 * 押せる一覧のほうは MOMENTS のまま。役割が違う。
 */
const BUBBLES: { lines: [string, string]; icon: "msg" | "date" | "photo" }[] = [
  { lines: ["またご飯行こ〜", "って送っていい…？"], icon: "msg" },
  { lines: ["今誘ったら", "早すぎるかな…？"], icon: "date" },
  { lines: ["この写真", "どっちがいい…？"], icon: "photo" },
];

/** 吹き出しの頭に置く小さな印 */
function BubbleIcon({ kind }: { kind: "msg" | "date" | "photo" }) {
  const tone =
    kind === "msg" ? "bg-ok-tint text-ok-text"
    : kind === "date" ? "bg-rose-tint text-rose-text"
    : "bg-brand-tint text-brand";
  const d =
    kind === "msg" ? "M4 5h16v11H7.5L4 19.5V5Z"
    : kind === "date" ? "M5 4h14v16H5V4Zm2 5v9h10V9H7Zm1-7h2v3H8V2Zm6 0h2v3h-2V2Z"
    : "M4 5h16v14H4V5Zm2 2v8l4-4 3 3 3-3 2 2V7H6Zm3 2a1.4 1.4 0 1 1 0 2.8A1.4 1.4 0 0 1 9 9Z";
  return (
    <span
      aria-hidden
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] sm:h-[26px] sm:w-[26px] ${tone}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="currentColor">
        <path d={d} />
      </svg>
    </span>
  );
}

/** 「！」の代わりの、短い線3本。よかったことの印 */
function Sparks({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`text-brand ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M4 10 1.5 8M6 6 4.5 3M10 4.5 10 1.5" />
    </svg>
  );
}

export default function HeroBoard({ openIds = [] }: { openIds?: string[] }) {

  // 家族ごとに1つ、代表の商品を出す。
  // 値段はここに書かない（1画面目に金額を出すと、
  // 何のサービスか分かる前に高い／安いの話になる）
  const ways = FAMILIES.map((f) => {
    const list = PLANS.filter((p) => p.family === f.id);
    const mins = list.find((p) => p.callMinutes)?.callMinutes;
    return {
      id: f.id,
      label: f.id === "call" ? `電話で相談（${mins}分）` : "テキスト・画像で相談",
      open: list.some((p) => openIds.includes(p.id)),
    };
  });

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[760px]">
        {/* ══ Before ══ 手が止まっている */}
        <div className="relative overflow-hidden rounded-card shadow-card">
          <div className="relative h-[260px] sm:h-[320px]">
            {/* 素材は 522×682 の縦。横長の枠に入れると人が真ん中に来るので、
                枠より広く引き伸ばして左へ寄せ、右側を吹き出しに空ける */}
            <div className="absolute inset-y-0 -left-[18%] w-[118%] sm:-left-[10%] sm:w-[110%]">
              <Slot name="hero" rounded="" position="center 14%" className="h-full w-full" />
            </div>
            {/* 吹き出しの下を少し暗くする。明るい背景だと白い吹き出しが消える */}
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-l from-slate/55 via-slate/20 to-transparent"
            />
          </div>

          <Stage>Before</Stage>

          {/* 手が止まっている中身。右側に重ねる。
              3つを少しずつ左右にずらす。きれいに揃えると一覧表に見えて、
              「頭の中で同時に鳴っている」感じが出ない */}
          <ul className="absolute inset-y-0 right-2.5 flex w-[66%] max-w-[330px] flex-col justify-center gap-2 sm:right-4 sm:w-[60%] sm:gap-2.5">
            {BUBBLES.map((b, i) => (
              <li
                key={b.lines[0]}
                className={`flex items-start gap-2 rounded-[16px] bg-paper px-2.5 py-2 shadow-card sm:gap-2.5 sm:px-3 sm:py-2.5 ${
                  i === 1 ? "ml-3 sm:ml-5" : i === 2 ? "ml-1.5 sm:ml-2.5" : ""
                }`}
              >
                <BubbleIcon kind={b.icon} />
                <span className="min-w-0 text-[11.5px] font-bold leading-[1.5] text-slate sm:text-[13.5px]">
                  {b.lines[0]}
                  <br />
                  {b.lines[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Down />

        {/* ══ 相談 ══ 実在の女性に聞く */}
        <div className="rounded-card bg-mist p-3.5 shadow-card sm:p-5">
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* 素材が 202×198 しかないので、大きくしない（伸ばすと粗が出る） */}
            <div className="relative shrink-0">
              <Slot
                name="w1"
                rounded="rounded-card"
                className="h-[92px] w-[92px] sm:h-[120px] sm:w-[120px]"
              />
              <Sparks className="absolute -left-1 -top-1 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <p className="min-w-0 text-[15px] font-black leading-[1.55] text-slate sm:text-[19px]">
              実在する女性に
              <br />
              相談して、
              <br />
              本音の反応を<span className="text-brand">確カメる</span>。
            </p>
          </div>

          {/* 相談のしかたは2つ。値段はここに出さない */}
          {/* モックと同じく、狭い画面でも横に2つ。
              「文字か、声か」は見比べて決めるものなので、
              縦に積むと片方ずつしか目に入らない */}
          <ul className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
            {ways.map((w) => (
              <li
                key={w.id}
                className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-[999px] px-2.5 py-3 text-center shadow-card sm:flex-row sm:gap-2.5 sm:px-4 ${
                  w.id === "call" ? "bg-ok-tint" : "bg-paper"
                }`}
              >
                {w.id === "call" ? (
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-ok-text sm:h-9 sm:w-9"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.2 2.2Z" />
                    </svg>
                  </span>
                ) : (
                  // 文字と画像。2つ並べて「どちらも出せる」ことを出す
                  <span aria-hidden className="flex shrink-0 items-center gap-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-paper sm:h-9 sm:w-9">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M4 5h16v11H7.5L4 19.5V5Zm3 3v1.6h10V8H7Zm0 3.7v1.6h7v-1.6H7Z" />
                      </svg>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-tint text-brand sm:h-9 sm:w-9">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path d="M4 5h16v14H4V5Zm2 2v8l4-4 3 3 3-3 2 2V7H6Zm3 2a1.4 1.4 0 1 1 0 2.8A1.4 1.4 0 0 1 9 9Z" />
                      </svg>
                    </span>
                  </span>
                )}
                <span className="min-w-0 text-[11.5px] font-black leading-[1.4] text-slate sm:text-[13px]">
                  {w.id === "call" ? (
                    <>
                      電話で相談
                      <br />
                      （{PLANS.find((x) => x.callMinutes)?.callMinutes}分）
                    </>
                  ) : (
                    "テキスト・画像で相談"
                  )}
                </span>
                {/* 開いていないものは、開いていないと書く */}
                {!w.open && (
                  <span className="shrink-0 rounded-pill bg-paper/80 px-2 py-1 text-[9.5px] font-bold leading-none text-steel">
                    受付前
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Down />

        {/* ══ After ══ 送れる */}
        <div className="relative overflow-hidden rounded-card shadow-card">
          <div className="relative h-[200px] sm:h-[250px]">
            {/* ══════════════════════════════════════════
                写真がまだ無い
                ══════════════════════════════════════════
                それらしい素材で埋めない。
                ただし Slot の「何を写すか」の案内は、ここでは出せない。
                吹き出しと札を上に重ねるので、その裏に文が透けて、
                ただの不具合に見える（実際そう見えた）。

                置くまでは、淡い面だけにしておく。
                「よし、送ってみよう！」と印だけでも、
                After が何を言っているかは伝わる。
                public/img/step-4.jpg を置けば、写真に変わる。 */}
            {IMAGES.step4.ready ? (
              <>
                <Slot name="step4" rounded="" position="center 22%" className="h-full w-full" />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-l from-slate/45 to-transparent"
                />
              </>
            ) : (
              <div aria-hidden className="h-full w-full bg-gradient-to-br from-brand-tint to-sky" />
            )}
          </div>

          <Stage>After</Stage>

          <div className="absolute inset-y-0 right-2.5 flex w-[52%] max-w-[260px] items-center justify-end sm:right-4">
            <p className="rounded-card rounded-br-[4px] bg-paper px-3.5 py-2.5 text-[14px] font-black leading-[1.5] text-slate shadow-card sm:px-4 sm:py-3 sm:text-[17px]">
              よし、送ってみよう！
            </p>
          </div>

          <span
            aria-hidden
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ok text-paper shadow-card sm:right-4 sm:top-4 sm:h-10 sm:w-10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4.5 4.5L19 7" />
            </svg>
          </span>
        </div>

        <HeroNote />
      </div>
    </div>
  );
}

/* ── 公開の前に止めること ───────────────────────── */
{
  // 吹き出しに使えるだけの場面があること。
  // pain.ts が5つ以上を保証しているが、
  // ここが3つ未満になると絵として成立しない。
  if (MOMENTS.length < 3) {
    throw new Error(`1画面目の吹き出しに使える場面が ${MOMENTS.length} 個しかありません`);
  }
  // 相談のしかたが2つあること。
  // 1つになったら、この並べ方（2列）をやめること。
  if (FAMILIES.length !== 2) {
    throw new Error(`1画面目に出す相談のしかたが ${FAMILIES.length} 通りあります（2通り）`);
  }
  // 声の商品に分数があること。「電話で相談（15分）」の括弧の中はここから引く。
  if (!PLANS.some((p) => p.family === "call" && p.callMinutes)) {
    throw new Error("声の商品に分数がありません（1画面目の「電話で相談（○分）」が作れません）");
  }
}
