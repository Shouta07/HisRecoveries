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
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
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

        {/* ── できること：価値を「体験」として具体化（同一セクションのサブブロック）── */}
        <span id="packages" aria-hidden className="block h-px scroll-mt-24" />
        <div className="on-media max-w-2xl mt-10 pt-9 border-t border-[#1f2a1d]/10 mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">できること</span>
            <span aria-hidden className="text-[#c3ccbf]">—</span>
            <span className="text-[11.5px] text-[#6b7a66]">いま動きたい人にも、そろそろの人にも</span>
          </div>
          <h3 className="text-[1.15rem] sm:text-[1.35rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
            価値を、<span className="text-[#3d5638]">体験に。</span>
          </h3>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            「何から始めればいいか分からない」も、「今は困ってないけど、そろそろ」も。
            <br className="hidden sm:block" />
            外側（見た目）と内側（コンディション）から、あなたに合う一歩を。どの体験も、悩みを聞く無料相談から始まります。
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
          この先、<span className="text-[#1f2a1d] font-medium">髪・肌・体・心へと領域を広げていきます</span>（準備中）。ひとつに絞らなくて大丈夫。準備中の領域も、気になることは無料相談で受け付けます。
        </p>
      </div>
    </section>
  );
}
