// サービス内容 ＝ 2軸。具体的な「体験の場面」でイメージを湧かせる。
// オフライン：リアルな回復体験（場面で見せる）／オンライン：日々の伴走（瞬間＋アプリ）。
import { PhoneFrame, DashboardScreen, MemberScreen } from "@/components/HowShowcase";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Tile = { t: string; s: string; bg: string; icon: React.ReactNode };

const OFFLINE: Tile[] = [
  {
    t: "似合う髪に、出会う",
    s: "スタイリング",
    bg: "linear-gradient(150deg,#efeae2,#d6cdbd)",
    icon: (
      <>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4L8.5 15.5M14.5 9.5L20 20" />
      </>
    ),
  },
  {
    t: "プロが選ぶ、一着",
    s: "服選び",
    bg: "linear-gradient(150deg,#eef3ea,#cdd8c8)",
    icon: (
      <>
        <path d="M12 4a2 2 0 1 0 1.8 1.1" />
        <path d="M13 6l8 6H3l8-6" />
        <path d="M3 12v5h18v-5" />
      </>
    ),
  },
  {
    t: "根本へ、専門の手で",
    s: "提携クリニック施術",
    bg: "linear-gradient(150deg,#eaf1f1,#c6d6d3)",
    icon: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
  },
  {
    t: "変わった自分を、写真で",
    s: "撮影",
    bg: "linear-gradient(150deg,#eaefe9,#c4cfc6)",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2.5" />
        <circle cx="12" cy="13.5" r="3.5" />
        <path d="M8.5 7l1.3-2h4.4l1.3 2" />
      </>
    ),
  },
];

const ONLINE: { t: string; icon: React.ReactNode }[] = [
  {
    t: "今日の調子を、ひとことで。",
    icon: (
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z" />
    ),
  },
  {
    t: "スコアと記録で、変化が見える。",
    icon: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 16l3-4 3 2 4-6" />
      </>
    ),
  },
  {
    t: "専属から、そっとひとこと。",
    icon: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-11.7 7.9L4 20l1-4.5A8.5 8.5 0 1 1 21 11.5z" />
        <path d="M9 11h6M9 8h4" />
      </>
    ),
  },
];

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
            リアルで整える時間と、毎日そばで支える時間。その両方で、変化を自分ごとに。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {/* オフライン：体験の場面 */}
          <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-7 shadow-sm flex flex-col">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#3d5638] mb-1">Offline</div>
                <h3 className="text-[1.25rem] sm:text-[1.45rem] font-bold text-[#1f2a1d]" style={MINCHO}>リアルで、整える。</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {OFFLINE.map((x) => (
                <div key={x.t} className="rounded-[1.1rem] p-3.5 overflow-hidden" style={{ background: x.bg }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16241a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-80" aria-hidden>
                    {x.icon}
                  </svg>
                  <div className="text-[12.5px] font-bold text-[#1f2a1d] leading-[1.4]">{x.t}</div>
                  <div className="text-[10.5px] text-[#4b5b47] mt-0.5">{x.s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* オンライン：日々の伴走 */}
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 overflow-hidden flex flex-col">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-1">Online</div>
            <h3 className="text-[1.25rem] sm:text-[1.45rem] font-bold text-[#EDF1E8] mb-4" style={MINCHO}>毎日、そばで支える。</h3>
            <ul className="space-y-2.5">
              {ONLINE.map((x) => (
                <li key={x.t} className="flex items-center gap-3">
                  <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-white/[0.07] border border-white/10">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#85AB8B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {x.icon}
                    </svg>
                  </span>
                  <span className="text-[13px] text-[#D7DED2]">{x.t}</span>
                </li>
              ))}
            </ul>
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
