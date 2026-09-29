import Tashikame, { type Mood } from "./Tashikame";

// 空のときの案内。
//
// ── 吹き出しをやめた ──────────────────────────────
// 以前はタシカメが喋る吹き出しだった。
// サービスの名前がタシカメになった時点で、
// 喋っているのはキャラクターではなくサービスになる。
//
// 「勘で、出さない。」と言った3段落あとに、
// マスコットが語尾を跳ねさせていると、重さが消える。
// しっぽを外して、ただの案内にした。
//
// 亀のマークは残す。急がば回れ・慎重・焦らない。
// この製品が言いたいことと、同じことを言っている。

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
            dark ? "border-line-dark bg-slate text-paper" : "border-line bg-paper text-slate shadow-card"
          }`}
        >
          {/* しっぽは外した。喋っていないので、吹き出しにしない。 */}
          <p className="relative text-[15.5px] font-bold leading-[1.7]">{text}</p>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
