// 当日の流れ — 高単価の購買障壁「何が起きるか分からない」を解消する。
// 具体的なタイムラインで、体験を想像できるようにする。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const FLOW = [
  { time: "10:00", t: "印象カウンセリング", d: "似合う・なりたいを、言葉に。ゴールを一緒に決めます。" },
  { time: "11:30", t: "完全初心者向けメイク", d: "プロが施術しながら、自分で再現できるところまでレッスン。" },
  { time: "13:30", t: "服選び（買い物同行）", d: "スタイリストと、あなたに似合う一着を。" },
  { time: "15:30", t: "写真撮影", d: "整った状態を、ビフォーアフターで記録に。" },
  { time: "17:00", t: "振り返り", d: "今日の型を持ち帰り、明日から続けられるように。" },
];

export default function FlowSection() {
  return (
    <section id="flow" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">A Day</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            当日の、<span className="text-[#3d5638]">流れ。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            はじめてでも、迷わないように。専属チームが、一日を進行します。（時間はイメージです）
          </p>
        </div>

        <ol className="relative border-l border-[#1f2a1d]/12 ml-3 sm:ml-4 space-y-6">
          {FLOW.map((f) => (
            <li key={f.time} className="relative pl-6 sm:pl-8">
              <span aria-hidden className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#3d5638] border-2 border-[#f4f6f2]" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="font-mono text-[12px] text-[#3d5638] font-semibold">{f.time}</span>
                <span className="text-[14.5px] font-bold text-[#1f2a1d]" style={MINCHO}>{f.t}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-[#4b5b47] leading-[1.8] max-w-[34rem]">{f.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
