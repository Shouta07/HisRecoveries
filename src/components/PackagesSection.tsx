// Experience packages on the home (moved from the old /packages page).
// Anchored at #packages so step ③「パッケージを選ぶ」 of the flow links here.
import { packages } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesSection() {
  const featured = packages.find((p) => p.id === "first-impression");
  const themes = packages.filter((p) => !p.flagship && p.id !== "first-impression");

  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Recovery Packages
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたに合わせて、<span className="text-[#3d5638]">改善を設計します。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            1日で整える体験から、じっくり伴走まで。あなたの悩みと予算に合わせて、一緒に組み立てます。
          </p>
        </div>

        {/* featured — 第一印象パッケージ */}
        {featured && (
          <div className="rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] p-7 md:p-10 mb-5">
            <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12">
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[#85AB8B] mb-3">
                  Signature · {featured.theme}
                </div>
                <h3 className="text-[1.6rem] md:text-[2rem] font-bold leading-[1.35] text-[#EDF1E8]" style={MINCHO}>
                  {featured.name}
                </h3>
                <p className="mt-3 text-[14px] text-[#C9D2C4] leading-[1.95]">{featured.tagline}</p>
                <p className="mt-3 text-[12.5px] text-[#9FB0A0]">{featured.forWhom}</p>
                {featured.highlights && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {featured.highlights.map((h) => (
                      <span key={h} className="text-[11.5px] text-[#D7DED2] bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5 text-[13px] font-semibold text-[#85AB8B]">
                  {featured.duration} ・ {featured.price}
                </div>
              </div>
              <div className="rounded-[1.4rem] bg-white/[0.06] border border-white/10 p-6">
                <div className="text-[12px] font-medium text-[#85AB8B] mb-4">当日の流れ</div>
                <ol className="space-y-3">
                  {featured.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13.5px] leading-[1.7] text-[#D7DED2]">
                      <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#85AB8B]/15 text-[#85AB8B] text-[11px] font-bold">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* theme packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.slice(0, 3).map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-7"
            >
              <div className="text-[11px] tracking-[0.12em] uppercase font-semibold text-[#3d5638] mb-3">
                {p.theme}
              </div>
              <h3 className="text-[1.2rem] font-bold leading-[1.4] text-[#1f2a1d]" style={MINCHO}>
                {p.name}
              </h3>
              <p className="mt-2.5 text-[13px] text-[#4b5b47] leading-[1.9]">{p.tagline}</p>
              <p className="mt-2 text-[12px] text-[#6b7a66]">{p.forWhom}</p>
              <ol className="mt-4 space-y-2">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-[#3a423a]">
                    <span className="shrink-0 grid place-items-center w-5 h-5 rounded-full bg-[#e7ede4] text-[#3d5638] text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-5 pt-4 border-t border-[#1f2a1d]/8 text-[12.5px] font-semibold text-[#3d5638]">
                {p.duration} ・ {p.price}
              </div>
            </article>
          ))}

          {/* restraint — don't show the whole catalogue */}
          <div className="flex flex-col justify-center rounded-[1.4rem] border border-dashed border-[#1f2a1d]/20 bg-white/40 p-7">
            <div className="text-[1.05rem] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
              ほかにも、あります。
            </div>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
              動物と過ごす など。あなたの悩みと予算に合わせて、選考後にご案内します。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
