// Experience packages on the home (moved from the old /packages page).
// Anchored at #packages so step ③「パッケージを選ぶ」 of the flow links here.
import { packages } from "@/lib/packages";
import BookingCTA from "@/components/BookingCTA";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesSection() {
  const themes = packages.filter((p) => !p.flagship);

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
            現在地の整理をもとに、悩み別の改善パッケージを一緒に選びます。点ではなく、一本の線で。
          </p>
        </div>

        {/* theme packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {themes.map((p) => (
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
        </div>

        <div className="on-media mt-10 flex flex-wrap items-center gap-4">
          <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            このまま相談する
          </BookingCTA>
          <span className="text-[#4b5b47] text-[13px]">
            完全招待制・選考制。価格は目安で、内容により異なります。
          </span>
        </div>
      </div>
    </section>
  );
}
