// Experience packages on the home — laid out as a clean, parallel product
// grid (Aesop-like): a flagship feature card, then uniform theme cards.
import Link from "next/link";
import { packages } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// A quiet kanji mark + soft tint per package (no photography yet).
const GLYPH: Record<string, string> = {
  journey: "線",
  "first-impression": "顔",
  cleanliness: "清",
  hair: "髪",
  future: "未来",
};
const TINT: Record<string, string> = {
  "first-impression": "linear-gradient(155deg,#eef3ea 0%,#cdd8c8 100%)",
  cleanliness: "linear-gradient(155deg,#eaf1f1 0%,#c6d6d3 100%)",
  hair: "linear-gradient(155deg,#efeae2 0%,#d6cdbd 100%)",
  future: "linear-gradient(155deg,#eaefe9 0%,#c4cfc6 100%)",
};

export default function PackagesShowcase() {
  const flagship = packages.find((p) => p.flagship);
  const themes = packages.filter((p) => !p.flagship);

  return (
    <section id="packages" className="relative z-10 text-[#1f2a1d]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-4 pb-20 md:pb-28">
        {/* heading */}
        <div className="on-media max-w-2xl mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Experience Packages
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.6rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            体験から、<span className="text-[#3d5638]">はじめる。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            現在地を知る診断から、悩み別の体験、定着まで。点ではなく一本の線で。
            気になるものから、どうぞ。
          </p>
        </div>

        {/* flagship feature card */}
        {flagship && (
          <Link
            href="/packages"
            className="group grid md:grid-cols-2 rounded-[1.8rem] overflow-hidden bg-[#16241a] text-[#EDF1E8] mb-6 shadow-[0_30px_60px_-30px_rgba(20,32,26,0.6)]"
          >
            <div
              className="relative min-h-[220px] md:min-h-full overflow-hidden"
              style={{ background: "linear-gradient(150deg,#22351f 0%,#16241a 60%,#0e150d 100%)" }}
            >
              <span
                aria-hidden
                className="absolute -right-2 bottom-[-1.5rem] text-[#85AB8B]/15 leading-none select-none"
                style={{ ...MINCHO, fontSize: "13rem", fontWeight: 800 }}
              >
                {GLYPH[flagship.id]}
              </span>
              <div className="absolute top-5 left-6 font-mono text-[10.5px] tracking-[0.18em] uppercase text-[#85AB8B]">
                Flagship ・ {flagship.theme}
              </div>
            </div>
            <div className="p-7 md:p-10">
              <h3 className="text-[1.5rem] md:text-[1.9rem] font-bold leading-[1.35] text-[#EDF1E8]" style={MINCHO}>
                {flagship.name}
              </h3>
              <p className="mt-3 text-[#C9D2C4] text-[14px] leading-[1.95]">{flagship.tagline}</p>
              <p className="mt-3 text-[#9FB0A0] text-[12.5px]">{flagship.forWhom}</p>
              <div className="mt-6 flex flex-wrap gap-x-2 gap-y-1.5">
                {flagship.steps.map((s, i) => (
                  <span key={i} className="text-[11.5px] text-[#D7DED2] bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">
                    {i + 1}. {s}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between">
                <span className="text-[#85AB8B] text-[13px] font-semibold">{flagship.duration} ・ {flagship.price}</span>
                <span className="text-[#EDF1E8] text-[13px] font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  詳しく見る <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* theme packages — uniform parallel grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {themes.map((p) => (
            <Link
              key={p.id}
              href="/packages"
              className="group flex flex-col rounded-[1.4rem] overflow-hidden bg-white border border-[#1f2a1d]/10 shadow-sm hover:shadow-[0_20px_40px_-22px_rgba(20,32,26,0.45)] hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* visual */}
              <div className="relative aspect-[4/5] overflow-hidden" style={{ background: TINT[p.id] }}>
                <span
                  aria-hidden
                  className="absolute right-1 bottom-[-1rem] text-[#16241a]/10 leading-none select-none transition-transform duration-500 group-hover:scale-105"
                  style={{ ...MINCHO, fontSize: "8.5rem", fontWeight: 800 }}
                >
                  {GLYPH[p.id]}
                </span>
                <span className="absolute top-4 left-4 text-[10.5px] tracking-[0.12em] uppercase font-semibold text-[#3d5638]">
                  {p.theme}
                </span>
              </div>
              {/* body */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-[1.05rem] font-bold leading-[1.45] text-[#1f2a1d]" style={MINCHO}>
                  {p.name}
                </h3>
                <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.8]">{p.tagline}</p>
                <div className="mt-4 pt-4 border-t border-[#1f2a1d]/8 flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-[#3d5638]">{p.price}</span>
                  <span className="text-[11.5px] text-[#6b7a66] group-hover:text-[#1f2a1d] inline-flex items-center gap-1 transition-colors">
                    {p.duration} <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* section CTA */}
        <div className="on-media mt-10 flex flex-wrap items-center gap-4">
          <Link href="/apply" className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            予約登録する
          </Link>
          <Link href="/packages" className="text-[#3d5638] hover:text-[#1f2a1d] text-sm font-semibold inline-flex items-center gap-1.5 transition-colors">
            すべての体験を見る <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
