// Promise — 三つの約束（合法版SLA）。
// 価格不安というバーニングニーズに、「保証・比較・他院言及」なしで応える。
// 語るのは自分たちの行動の約束だけ：紹介料ゼロ／総額と内訳の事前提示／予算超過提案なし。
// 医療機関の診療内容・費用への言及はしない（値付けは医療機関）。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const PROMISES = [
  {
    t: "紹介料を、受け取りません。",
    d: "掲載料や紹介料で、おすすめを歪めません。",
  },
  {
    t: "総額の目安と内訳を、契約の前に必ず。",
    d: "あとから増える見積りで、驚かせません。",
  },
  {
    t: "合意した予算を超える提案を、しません。",
    d: "予算はあなたが決める。私たちは、その側に立ちます。",
  },
];

export default function PromiseSection() {
  return (
    <section id="promise" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-4 pb-10">
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Promise — 三つの約束</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {PROMISES.map((p) => (
            <div key={p.t} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6">
              <div className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.6]" style={MINCHO}>{p.t}</div>
              <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">{p.d}</p>
            </div>
          ))}
        </div>
        <p className="on-media mt-4 text-[11.5px] text-[#6b7a66] leading-[1.8]">
          ※ 医療にかかる診療の内容・費用は、各医療機関が決定します。私たちは医療機関の比較・順位付けをしません。
        </p>
      </div>
    </section>
  );
}
