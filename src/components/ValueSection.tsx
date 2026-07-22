// What we do ＋ Why を1セクションに合体。
// 上：何をしてくれる会社か（探す/恥/迷うの3つの負担を肩代わり）
// 下：なぜやるのか（思想の引用・manifesto へ）
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const BURDENS = [
  {
    k: "探す",
    t: "情報の海を、代わりに整理する。",
    d: "広告と口コミのノイズを、代わりに。迷う時間を、なくします。",
  },
  {
    k: "恥",
    t: "言えなかったことも、匿名のまま。",
    d: "誰にも打ち明けられない悩みも、匿名で受け止めます。同じ説明を、二度させません。",
  },
  {
    k: "迷う",
    t: "何が正解か、いくらかかるか。",
    d: "売り込みません。紹介料も受け取りません。あなたの最適だけを、一緒に。",
  },
];

// 男性が「証拠」を探す位置に、症例なしで効く構造的信頼を3つ。
const TRUST = [
  { t: "当事者が、運営している。", d: "同じ悩みを経験した側から。" },
  { t: "紹介料は、受け取らない。", d: "どの院・どの商品にも寄らない（中立）。" },
  { t: "総額を、先に説明する。", d: "契約前に目安と内訳。予算は超えない。" },
];

export default function ValueSection() {
  return (
    <section id="value" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        {/* 証拠バー — ヒーロー直下、男性が最初にスキャンする位置に構造的信頼を置く */}
        <div className="on-media grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1f2a1d]/12 rounded-[1.1rem] overflow-hidden border border-[#1f2a1d]/12 mb-7">
          {TRUST.map((x) => (
            <div key={x.t} className="bg-[#f7f9f4] px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3">
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16241A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <div>
                <div className="text-[13px] font-bold tracking-[0.01em] text-[#16241A] leading-[1.4]">{x.t}</div>
                <div className="mt-0.5 text-[11.5px] text-[#4b5b47] leading-[1.65]">{x.d}</div>
              </div>
            </div>
          ))}
        </div>

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
            His Recoveries は、男の自己投資から遠回りをなくす、相談窓口です。
            <br className="hidden sm:block" />
            今の自分から理想まで、「探す・恥・迷う」の3つの負担を、私たちが引き受けます。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {BURDENS.map((b) => (
            <div key={b.k} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 border-t-[3px] border-t-[#16241A] p-5 sm:p-6">
              <div className="inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-2.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em]">{b.k}の負担</div>
              <div className="mt-3 text-[15.5px] font-bold text-[#1f2a1d] leading-[1.5] tracking-[-0.005em]">{b.t}</div>
              <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">{b.d}</p>
            </div>
          ))}
        </div>

        {/* Why — なぜ、やるのか（同じセクションに合体） */}
        <div className="mt-8 sm:mt-10 rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-12 overflow-hidden relative">
          <div aria-hidden className="absolute -top-20 -right-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#85AB8B] mb-4">Why — なぜ、やるのか</div>
            <h2 className="text-[#EDF1E8] text-[1.4rem] sm:text-[2rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800, lineBreak: "strict" }}>
              「気にするな」で、<br />
              <span className="text-[#85AB8B]">終わらせたくない。</span>
            </h2>
            <div className="mt-6 space-y-4 text-[14px] sm:text-[15.5px] text-[#C9D2C4] leading-[2.05] max-w-[34rem]" style={{ lineBreak: "strict" }}>
              <p>
                相談すれば「気にしすぎ」。調べれば、売り込みばかり。
                <span className="text-[#EDF1E8] font-medium">本当の味方は、どこにもいなかった。</span>
              </p>
              <p>
                だから、<span className="text-[#85AB8B] font-semibold">モノや施術は、売りません</span>。
                あなたのペースで、遠回りのない道だけを整理します。
              </p>
            </div>
            <Link href="/manifesto" className="mt-7 inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#85AB8B] hover:text-[#EDF1E8] transition-colors">
              この続きを、思想として読む <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
