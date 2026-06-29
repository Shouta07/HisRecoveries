import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { packages } from "@/lib/packages";
import { site } from "@/lib/site";
import BookingCTA from "@/components/BookingCTA";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return packages.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = packages.find((x) => x.id === params.id);
  if (!p) return {};
  const url = `${site.url}/packages/${p.id}`;
  const title = `${p.name} — ${p.theme}`;
  return {
    title,
    description: p.tagline,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description: p.tagline },
  };
}

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  const p = packages.find((x) => x.id === params.id);
  if (!p) notFound();

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[860px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-6">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#packages" className="hover:text-[#1f2a1d]">改善プログラム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">{p.name}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">{p.theme}</span>
            {p.invitation && (
              <span className="inline-flex items-center rounded-full bg-[#3d5638] text-white px-2.5 py-0.5 text-[10.5px] font-bold">完全招待制</span>
            )}
          </div>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3]" style={HEAD}>{p.name}</h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{p.tagline}</p>
          <p className="mt-3 text-[13px] text-[#6b7a66]">{p.forWhom}</p>
          <div className="mt-4 text-[14px] font-semibold text-[#3d5638]">{p.duration}・{p.price}</div>
        </header>

        {/* 含まれるもの */}
        <section className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-7 mb-6">
          <div className="text-[12px] font-medium text-[#3d5638] mb-4">含まれるもの</div>
          <ol className="space-y-3">
            {p.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] leading-[1.7] text-[#3a423a]">
                <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#e7ede4] text-[#3d5638] text-[11px] font-bold">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        {/* 医療連携の注記（中立） */}
        <div className="rounded-[1.2rem] bg-[#e5f0ef] border border-[#0f766e]/15 p-5 mb-10">
          <p className="text-[13px] text-[#0f766e] leading-[1.9]">
            <span className="font-bold">医療行為は、His Recoveries は行いません。</span>
            施術・診断・治療が必要な場合は、その悩みに強い<strong>提携クリニックを中立にご紹介</strong>し、
            予約・準備・その後まで伴走します。<strong>紹介手数料はゼロ</strong>です。
          </p>
        </div>

        {/* このはじめ方“ならでは”の付加価値 */}
        <section className="mb-10">
          <h2 className="text-[1.2rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
            {p.name}の、<span className="text-[#3d5638]">付加価値。</span>
          </h2>
          <p className="text-[13px] text-[#6b7a66] leading-[1.9] mb-5">
            His Recoveries は、業界で唯一“あなたの側”に立ちます。売らないから、あなたの最適だけを。
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {p.value.map((b) => (
              <div key={b.t} className="rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 p-5">
                <h3 className="text-[14px] font-bold text-[#1f2a1d] mb-1.5" style={HEAD}>{b.t}</h3>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.85]">{b.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          {p.invitation ? (
            <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
              招待をリクエストする（完全匿名）
            </BookingCTA>
          ) : (
            <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
              このプランで相談する（完全匿名）
            </BookingCTA>
          )}
          <Link href="/areas" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            仕組みを知る <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。
          本サービスは医療行為ではありません。診断・治療は提携医療機関が行います。
        </p>

        <div className="mt-8">
          <Link href="/#packages" className="text-[13px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity">
            ← すべてのはじめ方
          </Link>
        </div>
      </div>
    </div>
  );
}
