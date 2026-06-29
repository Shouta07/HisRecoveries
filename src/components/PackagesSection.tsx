// Experience packages on the home — each links to its own /packages/[id] page.
// 第一印象は受付中、それ以外は準備中（今後ご案内）。
import Link from "next/link";
import { packages } from "@/lib/packages";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesSection() {
  const themes = packages.filter((p) => !p.flagship);
  const featured = themes.find((p) => p.id === "first-impression");
  // 招待制（ハイエンド）を先頭に、その後に準備中
  const others = themes
    .filter((p) => p.id !== "first-impression")
    .sort((a, b) => (b.invitation ? 1 : 0) - (a.invitation ? 1 : 0));

  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Recovery Packages
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたに合わせて、<span className="text-[#3d5638]">設計します。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            第一印象パッケージを受付中。年間伴走の会員は完全招待制、ほかの領域は順次ご案内します。
          </p>
        </div>

        {/* 受付中 — 第一印象（横長・遷移） */}
        {featured && (
          <Link
            href={`/packages/${featured.id}`}
            className="group block rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] p-7 md:p-9 mb-5 hover:shadow-[0_30px_60px_-30px_rgba(20,32,26,0.7)] transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-[#85AB8B]">Signature · {featured.theme}</span>
              <span className="inline-flex items-center rounded-full bg-[#85AB8B]/20 text-[#85AB8B] px-2.5 py-0.5 text-[10.5px] font-bold">受付中</span>
            </div>
            <h3 className="text-[1.5rem] md:text-[1.9rem] font-bold leading-[1.35] text-[#EDF1E8]" style={MINCHO}>
              {featured.name}
            </h3>
            <p className="mt-3 text-[14px] text-[#C9D2C4] leading-[1.95] max-w-2xl">{featured.tagline}</p>
            {featured.highlights && (
              <div className="mt-4 flex flex-wrap gap-2">
                {featured.highlights.map((h) => (
                  <span key={h} className="text-[11.5px] text-[#D7DED2] bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">{h}</span>
                ))}
              </div>
            )}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#85AB8B]">{featured.duration}・選択式（パーソナライズ）</span>
              <span className="text-[#EDF1E8] text-[13px] font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                内容を選んで相談する <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        )}

        {/* 準備中 — その他（カードで遷移） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {others.map((p) => (
            <Link
              key={p.id}
              href={`/packages/${p.id}`}
              className={`group flex flex-col rounded-[1.4rem] shadow-sm p-6 transition-all hover:shadow-[0_20px_40px_-22px_rgba(20,32,26,0.45)] hover:-translate-y-0.5 ${
                p.invitation
                  ? "bg-white border border-[#85AB8B]/60 ring-1 ring-[#85AB8B]/30"
                  : "bg-white border border-[#1f2a1d]/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10.5px] tracking-[0.12em] uppercase font-semibold text-[#3d5638]">{p.theme}</span>
                {p.invitation ? (
                  <span className="inline-flex items-center rounded-full bg-[#3d5638] text-white px-2 py-0.5 text-[10px] font-bold">完全招待制</span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#1f2a1d]/8 text-[#6b7a66] px-2 py-0.5 text-[10px] font-bold">準備中</span>
                )}
              </div>
              <h3 className="text-[1.1rem] font-bold leading-[1.4] text-[#1f2a1d]" style={MINCHO}>{p.name}</h3>
              <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.85] flex-1">{p.tagline}</p>
              <span className="mt-4 pt-3 border-t border-[#1f2a1d]/8 text-[12px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                詳しく見る <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="on-media mt-6 text-[12px] text-[#6b7a66] leading-[1.8]">
          ※ 「準備中」のパッケージは順次ご案内します。先に相談しておきたい方は、各ページから完全匿名でご連絡いただけます。
        </p>
      </div>
    </section>
  );
}
