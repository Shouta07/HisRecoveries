// 3パターンの価格提示（目安）。ギフト〜ハイエンドで“刺さる”設計。
// 単価は出さず、目安レンジ。最終価格はヒアリングで確定。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const TIERS = [
  { id: "gift", name: "ギフト・お試し", price: "目安 ¥30,000〜", d: "第一印象の改善。1日完結。贈り物にも。", anchor: false },
  { id: "standard", name: "スタンダード", price: "目安 ¥100,000〜", d: "血液検査・コンプレックス施術。提携クリニックと中立に。", anchor: false },
  { id: "highend", name: "ハイエンド", price: "応相談・完全招待制", d: "フルパッケージ。専属が一気通貫で伴走。", anchor: true },
];

export default function PricingSection() {
  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-16 md:pb-24">
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Pricing</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            3つの、<span className="text-[#3d5638]">はじめ方。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            ギフトから、ハイエンドまで。内容と予算に合わせて、ヒアリングで最終価格をご提示します。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <Link
              key={t.id}
              href={`/packages/${t.id}`}
              className={`group flex flex-col rounded-[1.4rem] p-6 transition-all hover:-translate-y-0.5 ${
                t.anchor
                  ? "bg-[#16241a] text-[#EDF1E8] border border-[#85AB8B]/40 hover:shadow-[0_24px_50px_-26px_rgba(20,32,26,0.7)]"
                  : "bg-white border border-[#1f2a1d]/10 shadow-sm hover:shadow-[0_20px_40px_-22px_rgba(20,32,26,0.45)]"
              }`}
            >
              {t.anchor && (
                <span className="inline-flex w-fit items-center rounded-full bg-[#85AB8B]/20 text-[#85AB8B] px-2.5 py-0.5 text-[10px] font-bold mb-2">完全招待制</span>
              )}
              <h3 className={`text-[1.15rem] font-bold ${t.anchor ? "text-[#EDF1E8]" : "text-[#1f2a1d]"}`} style={MINCHO}>
                {t.name}
              </h3>
              <div className={`mt-1 text-[14px] font-semibold ${t.anchor ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>
                {t.price}
              </div>
              <p className={`mt-3 text-[12.5px] leading-[1.85] flex-1 ${t.anchor ? "text-[#C9D2C4]" : "text-[#4b5b47]"}`}>
                {t.d}
              </p>
              <span className={`mt-4 pt-3 border-t text-[12px] font-semibold inline-flex items-center gap-1 group-hover:gap-1.5 transition-all ${t.anchor ? "border-white/10 text-[#85AB8B]" : "border-[#1f2a1d]/8 text-[#3d5638]"}`}>
                詳しく見る <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="on-media mt-7">
          <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            予約登録する
          </BookingCTA>
        </div>
        <p className="on-media mt-4 text-[12px] text-[#6b7a66] leading-[1.8]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。
        </p>
      </div>
    </section>
  );
}
