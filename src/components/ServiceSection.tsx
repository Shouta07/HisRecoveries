// サービス内容。His Recoveries がすること（理解→整理→選ぶ→伴走）を簡潔に。
// 「Webで伴走」の話とアプリ画面をここに内包する。
import { PhoneFrame, DashboardScreen, MemberScreen } from "@/components/HowShowcase";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const POINTS = [
  { n: "01", t: "理解する", d: "原因から、医師監修・中立に。" },
  { n: "02", t: "整理して、選ぶ", d: "期間・費用・リスクを中立に並べ、自分に合った改善を。" },
  { n: "03", t: "専属が伴走する", d: "オンライン・対面で、生活に根づくまで。" },
  { n: "04", t: "Webで伴走する", d: "状態を記録し、変化を見える化し、専属と共有。だから、一度で終わらせない。" },
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
            His Recoveries が、<span className="text-[#3d5638]">すること。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            原因の理解から、定着まで。匿名・中立で、専属とアプリが一気通貫で伴走します。
          </p>
        </div>

        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-10 items-center">
          {/* 4つの内容 */}
          <ol className="space-y-3">
            {POINTS.map((p) => (
              <li key={p.n} className="flex items-start gap-3.5 rounded-[1.1rem] bg-white/85 border border-[#1f2a1d]/10 p-4">
                <span className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-[#16241a] text-[#EDF1E8] font-mono text-[12px] font-bold">
                  {p.n}
                </span>
                <div>
                  <h3 className="text-[14.5px] font-bold text-[#1f2a1d]" style={MINCHO}>{p.t}</h3>
                  <p className="text-[12.5px] text-[#4b5b47] leading-[1.8] mt-0.5">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Webで伴走（アプリ画面） */}
          <div className="rounded-[1.6rem] bg-[#16241a] p-6 sm:p-7 overflow-hidden">
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-1.5">Online</div>
            <h3 className="text-[1.15rem] font-bold text-[#EDF1E8] mb-1.5" style={MINCHO}>Webで伴走する。</h3>
            <p className="text-[12.5px] text-[#C9D2C4] leading-[1.85]">
              記録し、見える化し、専属と共有。改善を、思い出した時だけのものにしない。
            </p>
            <div className="relative flex items-end justify-center pt-5 overflow-hidden" style={{ perspective: "1200px" }}>
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
