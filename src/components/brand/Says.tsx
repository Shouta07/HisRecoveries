import Tashikame, { type Mood } from "./Tashikame";

// タシカメが喋る吹き出し。
//
// ── 空の画面の主にする ────────────────────────────
// 「まだありません」だけの画面は、壊れているのか作っている途中かが
// 分からない。タシカメが1行言うと、そこが待っている場所だと分かる。
//
// ── 主役にしすぎない ──────────────────────────────
// 結果の数字の横に置かない。数字より先に目に入ると、
// 人が答えた結果ではなく、キャラクターが言ったことに見える。

export default function Says({
  text,
  mood = "normal",
  tone = "light",
  size = 56,
  children,
}: {
  text: string;
  mood?: Mood;
  tone?: "light" | "dark";
  size?: number;
  /** 吹き出しの下に足すもの（ボタンなど） */
  children?: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div className="flex items-start gap-4">
      <span className="shrink-0">
        <Tashikame mood={mood} tone={dark ? "dark" : "light"} size={size} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={`relative rounded-card border px-5 py-4 ${
            dark ? "border-rule-dark bg-void text-bone" : "border-rule bg-card text-void shadow-card"
          }`}
        >
          {/* 吹き出しのしっぽ。左向きの三角を、線で作る */}
          <span
            aria-hidden
            className={`absolute -left-[7px] top-6 block h-3 w-3 rotate-45 border-b border-l ${
              dark ? "border-rule-dark bg-void" : "border-rule bg-card"
            }`}
          />
          <p className="relative text-[15.5px] font-bold leading-[1.7]">{text}</p>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
