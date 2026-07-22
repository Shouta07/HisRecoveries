// What we do ＋ Service を1セクションに統合。
// 上：コンシェルジュが出す「価値」（手間・恥・損をなくす）
// 下：その価値を「できること（体験）」として具体化（提供中/準備中）
import Link from "next/link";
import { visibleExperiences } from "@/lib/experiences";

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
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        {/* ── 価値：コンシェルジュは何をしてくれるのか ── */}
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What we do — 私たちの価値</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            もう、ひとりで<span className="text-[#3d5638]">抱えなくていい。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            髪・肌・体・心。気になることを、まとめて相談できる、男性ウェルネスのコンシェルジュです。
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

        {/* ── できること：価値を「体験」として具体化 ── */}
        <span id="packages" aria-hidden className="block h-px scroll-mt-24" />
        <div className="on-media max-w-2xl mt-12 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">できること</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            いま動きたい人にも、そろそろの人にも。
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            「何から始めればいいか分からない」も、「今は困ってないけど、そろそろ」も。
            <br className="hidden sm:block" />
            外側（見た目）と内側（コンディション）から、あなたに合う一歩を。どの体験も、悩みを聞く匿名相談から始まります。
          </p>
        </div>

        {/* 体験モジュール（experiences レジストリから描画。拡張は配列に1件足すだけ） */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          {visibleExperiences.map((e) => (
            <Link key={e.id} href={e.href} className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-5 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold">{e.axisLabel}</span>
                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${e.status === "available" ? "bg-[#16241A] text-[#EDF1E8]" : "bg-[#eef3ea] text-[#3d5638]"}`}>{e.statusLabel}</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{e.name}</span>
                {e.price && <span className="text-[13px] font-bold text-[#3d5638]">{e.price}</span>}
              </div>
              {e.hook && <p className="mt-1.5 text-[12px] font-semibold text-[#3d5638] leading-[1.7]">{e.hook}</p>}
              <p className="mt-1.5 text-[12px] text-[#4b5b47] leading-[1.85]">{e.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">{e.cta} <span aria-hidden>→</span></span>
            </Link>
          ))}
        </div>

        {/* 拡張と「まとめて相談できる」を1行で */}
        <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
          この先、<span className="text-[#1f2a1d] font-medium">髪・肌・体・心へと領域を広げていきます</span>（準備中）。ひとつに絞らなくて大丈夫。準備中の領域も、いま気になることは匿名相談で受け付けます。
        </p>
      </div>
    </section>
  );
}
