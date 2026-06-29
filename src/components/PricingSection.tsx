// 3パターンの価格提示（目安）。ギフト〜ハイエンドで“刺さる”設計。
// 単価は出さず、目安レンジ。最終価格はヒアリングで確定。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const TIERS = [
  { name: "ギフト・お試し", price: "目安 ¥30,000〜", d: "単発の体験から。贈り物にも。", anchor: false },
  { name: "スタンダード", price: "目安 ¥60,000〜", d: "複数を束ねて、しっかり整える。", anchor: false },
  { name: "ハイエンド", price: "応相談・完全招待制", d: "専属が、定着まで一気通貫で伴走。", anchor: true },
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
            <div
              key={t.name}
              className={`flex flex-col rounded-[1.4rem] p-6 ${
                t.anchor
                  ? "bg-[#16241a] text-[#EDF1E8] border border-[#85AB8B]/40"
                  : "bg-white border border-[#1f2a1d]/10 shadow-sm"
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
              <p className={`mt-3 text-[12.5px] leading-[1.85] ${t.anchor ? "text-[#C9D2C4]" : "text-[#4b5b47]"}`}>
                {t.d}
              </p>
            </div>
          ))}
        </div>

        <div className="on-media mt-7 flex flex-wrap items-center gap-4">
          <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            予約登録する
          </BookingCTA>
          <Link href="/packages/first-impression" className="text-[#3d5638] hover:text-[#1f2a1d] text-sm font-semibold inline-flex items-center gap-1.5 transition-colors">
            内容を選んで相談する <span aria-hidden>→</span>
          </Link>
        </div>
        <p className="on-media mt-4 text-[12px] text-[#6b7a66] leading-[1.8]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。
        </p>
      </div>
    </section>
  );
}
