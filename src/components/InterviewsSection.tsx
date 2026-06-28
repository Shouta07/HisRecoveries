// ③ 希望を持つ — "同じ悩みを持っていた人は、どう変わったのか。"
// Each story runs the same arc: Before → 気づいたこと → 取り組んだこと → 今.
import { journeys } from "@/lib/journeys";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const STAGES = [
  { key: "before", label: "Before" },
  { key: "turning", label: "Turning Point" },
  { key: "did", label: "取り組み" },
  { key: "after", label: "After" },
] as const;

export default function InterviewsSection() {
  return (
    <section id="interviews" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Recovery Stories
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.35] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            変わった人の、<span className="text-[#3d5638]">記録。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            同じ悩みを持っていた人は、どう変わったのか。成功談ではなく、過程の記録として。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {journeys.map((j) => (
            <article
              key={j.theme}
              className="flex flex-col rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 shadow-sm"
            >
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] mb-5">
                <span>{j.theme}</span>
                <span className="text-[#1f2a1d]/25">·</span>
                <span className="text-[#6b7a66]">{j.span}</span>
              </div>

              <ol className="relative space-y-4">
                {STAGES.map((s, i) => (
                  <li key={s.key} className="relative pl-6">
                    {/* node + connector */}
                    <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#85AB8B]" />
                    {i < STAGES.length - 1 && (
                      <span aria-hidden className="absolute left-[4.5px] top-4 bottom-[-1rem] w-px bg-[#1f2a1d]/12" />
                    )}
                    <div className={`font-mono text-[10.5px] tracking-[0.12em] uppercase mb-1 ${s.key === "after" ? "text-[#3d5638] font-bold" : s.key === "turning" ? "text-[#3d5638]" : "text-[#a7b3a2]"}`}>
                      {s.label}
                    </div>
                    <p className={`text-[13px] leading-[1.8] ${s.key === "after" ? "text-[#1f2a1d] font-medium" : "text-[#4b5b47]"}`}>
                      {j[s.key]}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="mt-6 pt-5 border-t border-[#1f2a1d]/10 text-[12px] text-[#6b7a66]">
                {j.who}
              </div>
            </article>
          ))}
        </div>

        <p className="on-media mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 当事者の観察であり、医療行為・診断・受診勧奨を行うものではありません。感じ方には個人差があります。
        </p>
      </div>
    </section>
  );
}
