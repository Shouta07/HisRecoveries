// Value — 「何をしてくれる会社か」を一目で。
// バーニングニーズ＝探す/恥/迷うの3つの負担。それを肩代わりするのがHRの価値。
// 静かで短く。売らない・中立・匿名・二度説明させない、を機能として言い切る。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const BURDENS = [
  {
    k: "探す",
    t: "情報の海を、代わりに整理する。",
    d: "広告と口コミのノイズを、中立に。何が本当かを、あなたの側から。",
  },
  {
    k: "恥",
    t: "言えなかったことも、匿名のまま。",
    d: "誰にも打ち明けられない悩みも、そっと。同じ説明を、二度させません。",
  },
  {
    k: "迷う",
    t: "何が正解か、いくらかかるか。",
    d: "売り込みません。紹介料も受け取りません。あなたの最適だけを、一緒に。",
  },
];

export default function ValueSection() {
  return (
    <section id="value" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What we do</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            もう、ひとりで<span className="text-[#3d5638]">抱えなくていい。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            His Recoveries は、男性のコンプレックスを匿名のまま整えるための、中立の相談窓口です。
            <br className="hidden sm:block" />
            自己投資につきものの「探す・恥・迷う」——その3つの負担を、私たちが肩代わりします。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {BURDENS.map((b) => (
            <div key={b.k} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6">
              <div className="inline-flex items-center rounded-full bg-[#eef3ea] text-[#3d5638] px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em]">{b.k}の負担</div>
              <div className="mt-3 text-[15px] font-bold text-[#1f2a1d] leading-[1.55]" style={MINCHO}>{b.t}</div>
              <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
