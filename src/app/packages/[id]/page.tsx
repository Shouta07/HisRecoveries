import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { packages } from "@/lib/packages";
import { complexById } from "@/lib/complexes";
import { site } from "@/lib/site";
import PackageBuilder from "@/components/PackageBuilder";
import BookingCTA from "@/components/BookingCTA";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

const detailPackages = packages.filter((p) => !p.flagship);

// パッケージ → 関連する「取り扱う領域」(/areas) の id
const RELATED_AREAS: Record<string, string[]> = {
  "first-impression": ["face", "self"],
  cleanliness: ["sweat", "skin"],
  hair: ["hair"],
  future: [],
  animals: ["self"],
};

export function generateStaticParams() {
  return detailPackages.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = detailPackages.find((x) => x.id === params.id);
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
  const p = detailPackages.find((x) => x.id === params.id);
  if (!p) notFound();

  const relatedAreas = (RELATED_AREAS[p.id] ?? [])
    .map((id) => complexById(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">
              {p.theme}
            </span>
            {p.available ? (
              <span className="inline-flex items-center rounded-full bg-[#e7ede4] text-[#3d5638] px-2.5 py-0.5 text-[10.5px] font-bold">受付中</span>
            ) : p.invitation ? (
              <span className="inline-flex items-center rounded-full bg-[#3d5638] text-white px-2.5 py-0.5 text-[10.5px] font-bold">完全招待制</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-[#1f2a1d]/8 text-[#6b7a66] px-2.5 py-0.5 text-[10.5px] font-bold">準備中</span>
            )}
          </div>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3]" style={HEAD}>
            {p.name}
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{p.tagline}</p>
          <p className="mt-3 text-[13px] text-[#6b7a66]">{p.forWhom}</p>
          <div className="mt-4 text-[13px] font-semibold text-[#3d5638]">
            {p.duration}・{p.price}
          </div>
        </header>

        {/* 流れ */}
        <section className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-7 mb-8">
          <div className="text-[12px] font-medium text-[#3d5638] mb-4">ジャーニーの流れ</div>
          <ol className="space-y-3">
            {p.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] leading-[1.7] text-[#3a423a]">
                <span className="shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#e7ede4] text-[#3d5638] text-[11px] font-bold">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        {p.available ? (
          <>
            {p.highlights && (
              <div className="flex flex-wrap gap-2 mb-8">
                {p.highlights.map((h) => (
                  <span key={h} className="text-[12px] text-[#3d5638] bg-[#e7ede4] rounded-full px-3 py-1">{h}</span>
                ))}
              </div>
            )}
            {/* 選択式ビルダー（第一印象パッケージ） */}
            <div className="rounded-[1.6rem] bg-[#16241a] p-6 sm:p-8">
              <PackageBuilder />
            </div>
          </>
        ) : p.invitation ? (
          /* 完全招待制（ハイエンド） */
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-8 text-center">
            {p.highlights && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {p.highlights.map((h) => (
                  <span key={h} className="text-[11.5px] text-[#D7DED2] bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">{h}</span>
                ))}
              </div>
            )}
            <div className="text-[1.15rem] font-bold text-[#EDF1E8] mb-2" style={HEAD}>
              完全招待制・選考制です。
            </div>
            <p className="text-[13.5px] text-[#C9D2C4] leading-[1.95] max-w-md mx-auto">
              枠を限定し、専属が定着まで一気通貫で伴走します。まずは完全匿名の無料相談から、現在地を一緒に整理します。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
                招待をリクエストする（完全匿名）
              </BookingCTA>
              <Link href="/packages/first-impression" className="inline-flex items-center gap-2 rounded-full border border-white/30 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-7 py-3.5 transition-colors">
                受付中のパッケージを見る <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        ) : (
          /* 準備中 */
          <div className="rounded-[1.6rem] border border-dashed border-[#1f2a1d]/20 bg-white/60 p-8 text-center">
            <div className="text-[1.1rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              このパッケージは、準備中です。
            </div>
            <p className="text-[13.5px] text-[#4b5b47] leading-[1.95] max-w-md mx-auto">
              現在は「第一印象パッケージ」のみ受け付けています。こちらは順次ご案内します。
              先に話を聞いておきたい方は、完全匿名でご相談いただけます。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
                先に相談する（完全匿名）
              </BookingCTA>
              <Link href="/packages/first-impression" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
                受付中のパッケージを見る <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* 関連：仕組みを知る（/areas へ内部リンク） */}
        {relatedAreas.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>関連：仕組みを知る</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedAreas.map((c) => (
                <Link
                  key={c.id}
                  href={`/areas/${c.id}`}
                  className="group flex items-center justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3.5 hover:border-[#3d5638]/40 transition-colors"
                >
                  <span>
                    <span className="text-[13.5px] font-semibold text-[#1f2a1d]">{c.ja}</span>
                    <span className="block text-[11px] text-[#6b7a66] mt-0.5">{c.system}</span>
                  </span>
                  <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 価格は目安です。最終価格は、パーソナルなヒアリングに基づいてご提示します。
          本サービスは医療行為ではありません。診断・治療は連携する医療機関が行います。
        </p>

        <div className="mt-8">
          <Link href="/#packages" className="text-[13px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity">
            ← すべてのパッケージ
          </Link>
        </div>
      </div>
    </div>
  );
}
