// Service — 一本の線を1セクションに集約。
// Step 01 現在地を知る（外側=印象診断¥22,000 / 内側=血液・準備中）
// CTA はすべて既存の匿名相談導線（/apply）。
import Link from "next/link";
import { entryDiagnosis, bloodCheck } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ServiceSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-16 pb-6">

        {/* Step 01 — 現在地を知る */}
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Service — はじめかた</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            はじめに、現在地を把握します。
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            取り戻すのか（Recover）、さらに深めるのか（Refine）。
            <br className="hidden sm:block" />
            まずは現在地を、外側（第一印象）と内側（血液）から把握します。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
          {/* 外側の現在地 — 印象診断 */}
          <Link href="/apply" className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-5 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
            <div className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold mb-2">外側の現在地</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{entryDiagnosis.name}</span>
              <span className="text-[13px] font-bold text-[#3d5638]">{entryDiagnosis.price}</span>
            </div>
            <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">{entryDiagnosis.note}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">匿名で相談する <span aria-hidden>→</span></span>
          </Link>
          {/* 内側の現在地 — 血液（準備中） */}
          <Link href="/apply" className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-5 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold">内側の現在地</span>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#eef3ea] text-[#3d5638]">{bloodCheck.status}</span>
            </div>
            <div className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{bloodCheck.name}</div>
            <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">{bloodCheck.note}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">ご案内は、匿名相談から <span aria-hidden>→</span></span>
          </Link>
        </div>

        {/* 気になることは、いくつでも（複数選択して始められる） */}
        <div className="on-media mb-8 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white/60 p-5 sm:p-7">
          <div className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>気になることは、いくつでも。</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["薄毛", "ニキビ・肌", "疲れて見える", "清潔感", "写真が苦手", "自信・パートナーシップ", "そのほか"].map((t) => (
              <span key={t} className="rounded-full border border-[#3d5638]/25 bg-[#eef3ea] px-3.5 py-1.5 text-[12px] font-medium text-[#3d5638]">
                {t}
              </span>
            ))}
          </div>
          <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
            ひとつに絞らなくて大丈夫。<span className="text-[#1f2a1d] font-medium">Recover でも Refine でも、複数の悩みをまとめて、ひとつの窓口で</span>始められます。何から手をつけるかは、一緒に決めます。
          </p>
        </div>

      </div>
    </section>
  );
}
