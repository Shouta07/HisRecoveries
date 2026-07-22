// What we do — 私たちの価値（手間・恥・損をなくす）。
// 「できること（体験）」は はじめかた(5ステップ)の後の ExperiencesSection に分離。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const BURDENS = [
  {
    k: "手間",
    t: "調べなくていい。",
    d: "広告も口コミも、こちらで整理。",
  },
  {
    k: "恥",
    t: "知られない。",
    d: "実名不要・NDAで守秘。",
  },
  {
    k: "損",
    t: "ぼったくられない。",
    d: "費用は先に・売り込みなし。",
  },
];

export default function ValueSection() {
  return (
    <section id="value" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        {/* ── 価値：コンシェルジュは何をしてくれるのか（端的に） ── */}
        <div className="on-media max-w-2xl mb-5">
          <div className="flex items-center gap-3 mb-2.5">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What we do — 私たちの価値</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            もう、ひとりで<span className="text-[#3d5638]">抱えなくていい。</span>
          </h2>
          <p className="mt-2.5 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            髪・肌・体・心。気になることをまとめて相談できる、男性ウェルネスのコンシェルジュ。面倒・恥ずかしい・迷う——ぜんぶ、こちらで。
          </p>
        </div>

        {/* Oh my teeth 型：3カラム（スマホも横並び）・中央寄せ・細い縦罫で区切る */}
        <div className="grid grid-cols-3 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 divide-x divide-[#1f2a1d]/10 overflow-hidden">
          {BURDENS.map((b) => (
            <div key={b.k} className="flex flex-col items-center text-center px-1.5 sm:px-5 py-5 sm:py-8">
              <span className="inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-[11.5px] font-bold tracking-[0.06em]">{b.k}</span>
              <div className="mt-2.5 sm:mt-4 text-[12.5px] sm:text-[16.5px] font-bold text-[#1f2a1d] leading-[1.4]" style={MINCHO}>{b.t}</div>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-[12.5px] text-[#6b7a66] leading-[1.6]">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
