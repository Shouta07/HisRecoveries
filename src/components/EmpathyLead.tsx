// 記事冒頭の共感リード — 参考事例の原則1(正常化)・2(心理を正面に)・6(安心)を反映。
// 「その悩みが、どんな気持ちにさせるか」を先に受けとめ、ひとりじゃないと伝える。
// 数値は使わない（誠実・薬機法）。煽らない・断定しない。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function EmpathyLead({ worry }: { worry: string }) {
  return (
    <div className="mb-9 rounded-[1.5rem] border border-[#8A6A3B]/15 p-6 sm:p-7 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#EDE9E0 0%,#f5f7f2 60%,#e9f0e6 100%)" }}>
      <div aria-hidden className="absolute -top-10 -right-6 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.22)" }} />
      <div className="relative">
        <span aria-hidden className="block text-[2rem] leading-none text-[#B9A06B] mb-1" style={MINCHO}>“</span>
        <p className="text-[1.05rem] sm:text-[1.2rem] text-[#1F1E1B] leading-[1.7] font-bold" style={MINCHO}>
          {worry}——そう感じているなら。
        </p>
        <p className="mt-3 text-[14.5px] sm:text-[15px] text-[#45443E] leading-[1.95] max-w-[34rem]">
          その悩みは、性格や気の持ちようの問題ではありません。口に出さないだけで、同じ悩みを抱える人は大勢います。
          まずは「なぜそうなるのか」を、<span className="text-[#1F1E1B] font-medium">順を追って整理していきます。</span>
        </p>
      </div>
    </div>
  );
}
