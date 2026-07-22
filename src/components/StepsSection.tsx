// はじめかたの流れ（Oh my teeth 型の「N ステップ」ファネル）。
// 無料相談（LINE・相互NDA）を入口に、記録・継続までの一本を見せる。
// CTA は下部追従バー（StickyConsultBar）に集約。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const STEPS = [
  { n: "01", t: "LINEで、友だち追加", d: "まずは追加するだけ。ここから、すべてが始まります。相談は無料です。" },
  { n: "02", t: "秘密保持契約に同意", d: "話す前に、相互の秘密保持契約（NDA）に同意。あなたのことも、話した内容も、外には出しません。" },
  { n: "03", t: "地図を、一緒に創る", d: "30分の相談で、「なりたい理想」と「今の現在地」を一枚の地図に。何を・どの順で進むかが、見えます。" },
  { n: "04", t: "最短ルートを、楽しく", d: "理想へ最短で近づく体験を、一歩ずつ。点数で変化が見え、同じ道を行く仲間と続けられる。費用は先に、予算内で。" },
  { n: "05", t: "いい男に、なる。", d: "気づけば、鏡の自分が変わっている。その状態を、続けられるかたちで。記録はあなたのもの。" },
];

export default function StepsSection() {
  return (
    <section id="how" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-7">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">How it works — はじめかた</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            LINEの友だち追加から、<span className="text-[#3d5638]">5ステップ。</span>
          </h2>
        </div>

        {/* 縦タイムライン（モバイル最適・線でつなぐ） */}
        <ol className="relative border-l-2 border-[#85AB8B]/35 ml-4 sm:ml-5 space-y-6 mb-9">
          {STEPS.map((s) => (
            <li key={s.n} className="relative pl-6 sm:pl-7">
              <span
                aria-hidden
                className="absolute -left-[13px] top-0 grid place-items-center w-6 h-6 rounded-full bg-[#16241A] text-[#EDF1E8] text-[10px] font-bold font-mono"
              >
                {s.n}
              </span>
              <div className="text-[14.5px] sm:text-[15px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>{s.t}</div>
              <p className="mt-1 text-[12.5px] text-[#4b5b47] leading-[1.9]">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
