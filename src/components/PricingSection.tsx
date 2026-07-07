// コンバージョンは「第一印象改善パッケージ」を予約する一点に特化。
// 商品ラダー: ①印象診断（入口）→ ②パッケージ本体 → ③ギフト（贈り手）。
// 単価は目安。最終価格はヒアリングで確定。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";
import { packages, entryDiagnosis, giftOption, urgentNote } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PricingSection() {
  const p = packages[0];
  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-16 md:pb-24">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Booking</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            第一印象を、<span className="text-[#3d5638]">予約する。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            まずは印象診断から。その場でロードマップと最終価格をご提示します。すべて完全匿名で。
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr_1fr] gap-4 items-stretch">
          {/* ① 入口: 印象診断 */}
          <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-6 flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#6b7a66] mb-2">Step 01 — 入口</div>
            <h3 className="text-[1.15rem] font-bold text-[#1f2a1d]" style={MINCHO}>{entryDiagnosis.name}</h3>
            <div className="mt-1.5 text-[1.15rem] font-bold text-[#3d5638]" style={MINCHO}>{entryDiagnosis.price}</div>
            <div className="text-[11.5px] text-[#6b7a66] mb-3">{entryDiagnosis.duration}</div>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.85] flex-1">{entryDiagnosis.note}</p>
            <BookingCTA className="mt-5 w-full text-center bg-[#eef3ea] hover:bg-[#e3ecdd] text-[#1f2a1d] text-[13px] font-semibold px-5 py-3 rounded-full transition-colors">
              診断を予約する
            </BookingCTA>
          </div>

          {/* ② 本体: 第一印象改善パッケージ */}
          <div className="rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] border border-[#85AB8B]/40 shadow-[0_24px_50px_-26px_rgba(20,32,26,0.7)] p-7 sm:p-8 flex flex-col relative overflow-hidden">
            <div aria-hidden className="absolute -top-16 -right-10 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B]">Step 02 — 本体</span>
                <span className="inline-flex items-center rounded-full bg-[#85AB8B]/20 text-[#85AB8B] px-2.5 py-0.5 text-[10px] font-bold">おすすめ</span>
              </div>
              <h3 className="text-[1.45rem] sm:text-[1.7rem] font-bold text-[#EDF1E8] leading-[1.3]" style={MINCHO}>{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-[1.5rem] font-bold text-[#85AB8B]" style={MINCHO}>{p.price}</span>
                <span className="text-[12px] text-[#9FB0A0]">/ {p.duration}・{p.theme}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-[#D7DED2] leading-[1.55]">
                    <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full bg-white/[0.08] text-[#85AB8B] text-[10px] font-bold mt-px">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11.5px] text-[#9FB0A0] leading-[1.8]">{urgentNote}</p>
              <div className="mt-auto pt-6 flex flex-col gap-2.5">
                <BookingCTA className="w-full text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-6 py-3.5 rounded-full transition-colors">
                  このパッケージを予約する
                </BookingCTA>
                <Link href={`/packages/${p.id}`} className="text-center text-[12.5px] text-[#85AB8B] font-semibold hover:text-[#EDF1E8] transition-colors">
                  詳しく見る →
                </Link>
              </div>
            </div>
          </div>

          {/* ③ 出口: ギフト */}
          <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-6 flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#6b7a66] mb-2">Gift — 贈る</div>
            <h3 className="text-[1.15rem] font-bold text-[#1f2a1d]" style={MINCHO}>{giftOption.name}</h3>
            <div className="mt-1.5 text-[1.15rem] font-bold text-[#3d5638]" style={MINCHO}>{giftOption.price}</div>
            <div className="text-[11.5px] text-[#6b7a66] mb-3">{giftOption.duration}</div>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.85] flex-1">{giftOption.note}</p>
            <BookingCTA className="mt-5 w-full text-center bg-[#eef3ea] hover:bg-[#e3ecdd] text-[#1f2a1d] text-[13px] font-semibold px-5 py-3 rounded-full transition-colors">
              ギフトを相談する
            </BookingCTA>
          </div>
        </div>

        <p className="on-media mt-6 text-[12px] text-[#6b7a66] leading-[1.8]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。すべて完全匿名・完全守秘義務のもとで。
        </p>
      </div>
    </section>
  );
}
