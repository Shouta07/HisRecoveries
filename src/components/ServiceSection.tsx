// サービス内容 ＝ 2軸だけ。
// オフライン：あらゆる男性に、回復体験を提供する。
// オンライン：それを、伴走で支える。
import { PhoneFrame, DashboardScreen, MemberScreen } from "@/components/HowShowcase";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ServiceSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Service</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            回復体験を、<span className="text-[#3d5638]">2つの場所で。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            あらゆる男性に、オフラインの回復体験を。それを、オンラインでも伴走で支えます。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {/* オフライン */}
          <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-8 shadow-sm flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#3d5638] mb-2">Offline</div>
            <h3 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
              回復体験を、提供する。
            </h3>
            <p className="text-[13px] text-[#4b5b47] leading-[1.95]">
              あらゆる男性に、対面のリアルな回復体験を。カウンセリング・施術（提携クリニック）・メイク・服選びなどを、中立に束ねて整えます。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["第一印象", "清潔感", "薄毛・AGA", "施術連携"].map((c) => (
                <span key={c} className="text-[11.5px] text-[#3d5638] bg-[#e7ede4] rounded-full px-3 py-1">{c}</span>
              ))}
            </div>
          </div>

          {/* オンライン */}
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-8 overflow-hidden flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2">Online</div>
            <h3 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[#EDF1E8] mb-2" style={MINCHO}>
              それを、伴走で支える。
            </h3>
            <p className="text-[13px] text-[#C9D2C4] leading-[1.95]">
              状態を記録し、変化を見える化し、専属と共有。改善を、一度で終わらせない。
            </p>
            <div className="relative flex-1 flex items-end justify-center pt-5 overflow-hidden" style={{ perspective: "1200px" }}>
              <div className="scale-[0.78] sm:scale-[0.85] flex items-end -mb-8">
                <PhoneFrame className="z-10" style={{ transform: "rotate(-5deg) translateY(8px)" }}>
                  <DashboardScreen />
                </PhoneFrame>
                <PhoneFrame className="z-20 -ml-10" style={{ transform: "rotate(4deg) translateY(-10px) scale(1.02)" }}>
                  <MemberScreen />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
