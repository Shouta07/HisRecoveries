// What we do ＋ Why を1セクションに合体。
// 上：何をしてくれる会社か（探す/恥/迷うの3つの負担を肩代わり）
// 下：なぜやるのか（思想の引用・manifesto へ）

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const BURDENS = [
  {
    k: "手間",
    t: "調べなくていい。",
    d: "広告と口コミだらけの情報は、こちらで整理します。あなたは選ぶだけ。",
  },
  {
    k: "恥",
    t: "誰にも知られない。",
    d: "匿名のまま相談できます。実名・顔写真は不要。同じ説明を、二度させません。",
  },
  {
    k: "損",
    t: "ぼったくられない。",
    d: "費用は先に説明します。売り込みなし。紹介料も受け取りません。",
  },
];

export default function ValueSection() {
  return (
    <section id="value" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        {/* What we do */}
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What we do</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            もう、ひとりで<span className="text-[#3d5638]">抱えなくていい。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            髪・肌・体・心。気になることを、まとめて相談できるコンシェルジュです。
            <br className="hidden sm:block" />
            面倒なこと、恥ずかしいこと、迷うこと——ぜんぶ、こちらで引き受けます。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {BURDENS.map((b) => (
            <div key={b.k} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 border-t-[3px] border-t-[#16241A] p-5 sm:p-6">
              <div className="inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em]">{b.k}</div>
              <div className="mt-3 text-[15.5px] font-bold text-[#1f2a1d] leading-[1.5] tracking-[-0.005em]">{b.t}</div>
              <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
