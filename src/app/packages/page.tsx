import type { Metadata } from "next";
import Link from "next/link";
import { packages } from "@/lib/packages";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "体験パッケージ — 点ではなく、線で整える",
  description:
    "His Recoveries の体験パッケージ。単発の体験ではなく、現在地を知る診断 → 複数の体験 → 定着までを一本のジャーニーに束ねた、男性のコンプレックス改善プログラム。",
  alternates: { canonical: `${site.url}/packages` },
};

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[1080px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <header className="max-w-[42rem] mb-14">
          <p className="font-mono text-[12px] tracking-[0.14em] text-[#3d5638] uppercase font-medium">
            Experience Packages
          </p>
          <h1 className="mt-4 text-[2.2rem] sm:text-[3rem] leading-[1.25] text-[#1f2a1d]" style={HEAD}>
            体験は点ではなく、<span className="text-[#3d5638]">線で。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[1.95]">
            単発の体験ではなく、「現在地を知る診断 → 複数の体験 → 定着・ふりかえり」までを
            一本のジャーニーに束ねています。到達点が見える形で、無理なく前へ。
          </p>
        </header>

        <div className="space-y-6">
          {packages.map((p) => (
            <div
              key={p.id}
              className={`rounded-[2rem] p-8 md:p-10 ${
                p.flagship
                  ? "bg-[#16241a] text-[#EDF1E8]"
                  : "bg-white border border-[#1f2a1d]/10 shadow-sm"
              }`}
            >
              <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12">
                <div>
                  <div
                    className={`text-[11px] tracking-[0.16em] uppercase font-semibold mb-3 ${
                      p.flagship ? "text-[#85AB8B]" : "text-[#3d5638]"
                    }`}
                  >
                    {p.theme}
                  </div>
                  <h2
                    className={`font-mincho text-[1.6rem] md:text-[2rem] font-bold leading-[1.35] ${
                      p.flagship ? "text-[#EDF1E8]" : "text-[#1f2a1d]"
                    }`}
                  >
                    {p.name}
                  </h2>
                  <p className={`mt-3 text-sm md:text-[15px] leading-[1.9] ${p.flagship ? "text-[#C9D2C4]" : "text-[#4b5b47]"}`}>
                    {p.tagline}
                  </p>
                  <p className={`mt-4 text-[13px] ${p.flagship ? "text-[#9FB0A0]" : "text-[#6b7a66]"}`}>
                    {p.forWhom}
                  </p>
                  <div className={`mt-5 text-[13px] font-semibold ${p.flagship ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>
                    {p.duration} ・ {p.price}
                  </div>
                </div>

                <div
                  className={`rounded-[1.4rem] p-6 ${
                    p.flagship ? "bg-white/[0.06] border border-white/10" : "bg-[#f4f6f2]"
                  }`}
                >
                  <div className={`text-[12px] tracking-wide font-medium mb-4 ${p.flagship ? "text-[#85AB8B]" : "text-[#3d5638]"}`}>
                    ジャーニーの流れ
                  </div>
                  <ol className="space-y-3">
                    {p.steps.map((s, i) => (
                      <li key={i} className={`flex items-start gap-3 text-[13.5px] leading-[1.7] ${p.flagship ? "text-[#D7DED2]" : "text-[#3a423a]"}`}>
                        <span
                          className={`shrink-0 grid place-items-center w-6 h-6 rounded-full text-[11px] font-bold ${
                            p.flagship ? "bg-[#85AB8B]/15 text-[#85AB8B]" : "bg-[#e7ede4] text-[#3d5638]"
                          }`}
                        >
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/apply"
                  className={`inline-flex items-center gap-2 rounded-full text-sm font-semibold px-6 py-3 transition-colors ${
                    p.flagship
                      ? "bg-[#EDF1E8] hover:bg-white text-[#16241a]"
                      : "bg-[#1f2a1d] hover:bg-[#2a3827] text-white"
                  }`}
                >
                  このパッケージを相談する <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
