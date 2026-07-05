// コンバージョンは「第一印象改善パッケージ」を予約する一点に特化。
// 単価は出さず目安レンジ。最終価格はヒアリングで確定。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";
import { packages } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PricingSection() {
  const p = packages[0];
  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-16 md:pb-24">
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Booking</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            第一印象を、<span className="text-[#3d5638]">予約する。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            まずはこの一日から。内容と予算に合わせて、ヒアリングで最終価格をご提示します。
          </p>
        </div>

        {/* 単一パッケージの予約カード */}
        <div className="rounded-[1.8rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-6 sm:p-9 max-w-[760px]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#3d5638]">Package</span>
            {p.highlights?.slice(0, 2).map((h) => (
              <span key={h} className="inline-flex items-center rounded-full bg-[#eef3ea] text-[#3d5638] px-2.5 py-0.5 text-[10px] font-bold">{h}</span>
            ))}
          </div>

          <h3 className="text-[1.5rem] sm:text-[1.9rem] font-bold text-[#1f2a1d] leading-[1.3]" style={MINCHO}>
            {p.name}
          </h3>
          <p className="mt-2.5 text-[#4b5b47] text-[13.5px] sm:text-[14.5px] leading-[1.85]">{p.tagline}</p>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-[1.5rem] font-bold text-[#3d5638]" style={MINCHO}>{p.price}</span>
            <span className="text-[12.5px] text-[#6b7a66]">/ {p.duration}</span>
          </div>

          {/* 含まれるもの */}
          <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {p.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#3a423a] leading-[1.6]">
                <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full bg-[#e7ede4] text-[#3d5638] text-[10px] font-bold mt-px">{i + 1}</span>
                {s}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-colors">
              このパッケージを予約する
            </BookingCTA>
            <Link href={`/packages/${p.id}`} className="text-[13px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity inline-flex items-center gap-1">
              詳しく見る <span aria-hidden>→</span>
            </Link>
          </div>

          <p className="mt-5 text-[12px] text-[#6b7a66] leading-[1.8]">
            ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。完全匿名で相談できます。
          </p>
        </div>
      </div>
    </section>
  );
}
