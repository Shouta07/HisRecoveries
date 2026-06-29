// Experience packages on the home. 現在は第一印象パッケージのみ受付。
// Anchored at #packages so step ③「パッケージを選ぶ」 of the flow links here.
import { packages } from "@/lib/packages";
import PackageBuilder from "@/components/PackageBuilder";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesSection() {
  const featured = packages.find((p) => p.id === "first-impression");
  if (!featured) return null;

  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1080px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Recovery Package
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたに合わせて、<span className="text-[#3d5638]">設計します。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            内容と予算に合わせて、選んで組み立てます。最終価格はヒアリングでご提示します。
          </p>
        </div>

        {/* 第一印象パッケージ（現在はこちらのみ受付） */}
        <div className="rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] p-7 md:p-10">
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
                {featured.duration}・選択式（パーソナライズ）
              </div>
              <p className="mt-4 text-[11.5px] text-[#9FB0A0] leading-[1.7]">
                ※ 現在は第一印象パッケージのみ受け付けています。ほかの領域は順次ご案内します。
              </p>
            </div>

            {/* 選択式ビルダー（内容を選ぶと目安合計が変動） */}
            <PackageBuilder />
          </div>
        </div>
      </div>
    </section>
  );
}
