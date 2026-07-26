import type { Metadata } from "next";
import Link from "next/link";
import { allOccasions } from "@/lib/occasions";
import { site } from "@/lib/site";

// Job（叶えたいこと）の一覧。/occasions/{id} の親であり、
// 「悩みから探す」（/areas）と対をなすもうひとつの探し方。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const DESC =
  "恋愛、大切な日、仕事、家族、自己再起、そして大切な人への贈りもの。叶えたいことから逆算して、整える順番を設計し、合うプロ・施設へつなぎます。相談は無料・匿名。";

export const metadata: Metadata = {
  title: "叶えたいことから — 大切な場面で、自信を持てる自分へ",
  description: DESC,
  alternates: { canonical: `${site.url}/occasions` },
  openGraph: {
    type: "website",
    url: `${site.url}/occasions`,
    title: "叶えたいことから — 大切な場面で、自信を持てる自分へ",
    description: DESC,
  },
};

export default function OccasionsIndexPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "叶えたいことから", item: `${site.url}/occasions` },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }}
        />
        <div className="relative max-w-[900px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-14">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">叶えたいことから</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">
            大切な場面で、自信を持てる自分へ
          </div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.6rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたは、<span className="text-[#85AB8B]">何を叶えたい</span>ですか？
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[36rem]">
            必要な変化は、悩みではなく叶えたいことから決まります。
            近いものを選んでください。そこから逆算して、あなたに必要な変化の順番を設計します。
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {allOccasions.map((o) => (
            <Link
              key={o.id}
              href={`/occasions/${o.id}`}
              className="group flex flex-col rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-5 sm:p-6 hover:border-[#3d5638]/45 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="font-mono text-[10.5px] tracking-[0.14em] text-[#85AB8B]">{o.no}</span>
                <span className="text-[11px] font-semibold text-[#6b7a66] leading-[1.5]">{o.purpose}</span>
              </div>
              <div className="text-[1.05rem] sm:text-[1.15rem] font-bold text-[#1f2a1d] leading-[1.45]" style={MINCHO}>
                {o.title}
              </div>
              <p className="mt-2.5 text-[12.5px] font-semibold text-[#3d5638] leading-[1.8]">{o.job}</p>
              <ul className="mt-3.5 flex flex-wrap gap-1.5">
                {o.examples.slice(0, 4).map((e) => (
                  <li key={e} className="rounded-full bg-[#eef3ea] px-2.5 py-1 text-[10.5px] text-[#3d5638] leading-[1.5]">
                    {e}
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#3d5638]">
                詳しく見る <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-[1.2rem] border border-dashed border-[#1f2a1d]/18 bg-[#f6f8f4] p-5 sm:p-6">
          <div className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>
            決まっていなくても、大丈夫です
          </div>
          <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">
            年齢だけでも、構成は組めます。悩みから探したい方は、
            <Link href="/areas" className="font-semibold text-[#3d5638] underline underline-offset-4 hover:opacity-70">
              悩み別のライブラリ
            </Link>
            もどうぞ。
          </p>
          <Link
            href="/#diagnosis"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[13.5px] font-bold px-7 py-3 transition-colors"
          >
            選ばずに、構成を組む <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
