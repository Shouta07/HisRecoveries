// 贈る／急ぐ。商品ラダーの入口(印象診断)は Stage1、本体(Recover/Refine)は
// Stage2 に吸収済み。ここは「贈る(ギフト)」と「急ぐ(緊急枠)」だけを静かに。
// ギフトの守秘設計(受取人が匿名で選べ、贈り主に内容非開示)は変更禁止。
import BookingCTA from "@/components/BookingCTA";
import { giftOption, urgentNote } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PricingSection() {
  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-14 md:pb-20">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3 sm:gap-4 items-stretch">
          {/* 贈る — ギフト */}
          <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-7 flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#6b7a66] mb-2">Gift — 贈る</div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-[1.15rem] font-bold text-[#1f2a1d]" style={MINCHO}>{giftOption.name}</h3>
              <span className="text-[1.05rem] font-bold text-[#3d5638]" style={MINCHO}>{giftOption.price}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9] flex-1">{giftOption.note}</p>
            <BookingCTA className="mt-5 w-full sm:w-auto sm:self-start text-center bg-[#eef3ea] hover:bg-[#e3ecdd] text-[#1f2a1d] text-[13px] font-semibold px-6 py-3 rounded-full transition-colors">
              ギフトを相談する
            </BookingCTA>
          </div>

          {/* 急ぐ — 緊急枠 */}
          <div className="rounded-[1.6rem] bg-[#f2f5ef] border border-[#1f2a1d]/8 p-6 sm:p-7 flex flex-col justify-center">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#6b7a66] mb-2">Urgent — 急ぐ</div>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.95]">{urgentNote}</p>
          </div>
        </div>

        <p className="on-media mt-6 text-[12px] text-[#6b7a66] leading-[1.8]">
          ※ 価格は目安。最終価格はヒアリングのうえご提示します。完全守秘義務のもとで。
        </p>
      </div>
    </section>
  );
}
