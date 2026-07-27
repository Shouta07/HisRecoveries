import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { clusters, DESIRES, type DesireKey } from "@/lib/clusters";
import { site } from "@/lib/site";

// Refine｜深める — 目的別ランディング。
// 「すでに整っている人が、もう一段」の入口。先手・上積み・維持。
// 記事は desire（若くいたい・信頼されたい・先手を打ちたい）で自動仕分け。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 記事は track="refine"（もっと良くなりたい＝潜在）で絞り、欲求別に並べる。
// 空の欲求は描画時に落ちるので、記事が増えても自動で追随する。
const TRACK_DESIRES: DesireKey[] = ["sonae", "jishin", "shinrai", "wakasa", "erabaretai", "son"];

export const metadata: Metadata = {
  title: "Refine｜深める — すでに整っている人が、もう一段",
  description:
    "老け見えの先手、仕事の第一印象の上積み、内側のコンディション最適化。すでに整っている人が、もう一段深めるための伴走。相談は無料・秘密保持のもとで。目安 ¥150,000〜。",
  alternates: { canonical: `${site.url}/refine` },
  openGraph: {
    type: "website",
    url: `${site.url}/refine`,
    title: "Refine｜深める — すでに整っている人が、もう一段",
    description: "先手・上積み・維持。整っている人が、もう一段深めるための伴走。",
  },
};

const AIMS = ["老けて見られたくない", "商談・人前の印象を上げたい", "疲れが顔に出はじめた", "体の中から整えたい", "今のうちに、先手を打ちたい", "維持を、仕組みにしたい"];

const INCLUDES = [
  { t: "印象診断（90分・¥22,000）", d: "「整っている」の先を言語化。伸ばす一点と、先手を打つ一点を地図に。パッケージお申し込みで全額充当。" },
  { t: "高度なスタイリング・印象設計", d: "似合うの精度を上げる。場面（商談・登壇・写真）に合わせた印象の設計まで。" },
  { t: "内側のコンディション最適化", d: "血液コンディション・チェック（準備中）で、疲れ・活力を数値から。解釈は医師、伴走は私たち。" },
  { t: "続ける仕組み（スコア・記録）", d: "変化をスコアで追い、維持を仕組みに。記録はあなたのもの——いつでも見返せ、消せます。" },
];

export default function RefinePage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "Refine｜深める", item: `${site.url}/refine` },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ヒーロー（深緑・ブランド） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[860px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">Refine｜深める</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">REFINE — 深める</div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            整っているからこそ、<br />
            <span className="text-[#85AB8B]">もう一段。</span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[36rem]">
            現状維持は、ゆるやかな後退。
            いまの良さを言語化し、伸ばす一点と、先手を打つ一点を決める。
            上積みと維持を、仕組みにします。
          </p>
          {/* 目的チップ */}
          <div className="mt-7 flex flex-wrap gap-2">
            {AIMS.map((w) => (
              <span key={w} className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12px] text-[#D7DED2]">{w}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 sm:px-8">
        {/* ── 含まれるもの ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What&apos;s included — 含まれるもの</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-6" style={{ ...MINCHO, fontWeight: 800 }}>
            外側の精度と、内側の土台。<span className="text-[#3d5638]">両方から。</span>
          </h2>
          <div className="space-y-3">
            {INCLUDES.map((x, i) => (
              <div key={x.t} className="flex items-start gap-4 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5">
                <span aria-hidden className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-[#16241A] text-[#EDF1E8] font-mono text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>{x.t}</div>
                  <p className="mt-1 text-[12.5px] text-[#4b5b47] leading-[1.85]">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-[#6b7a66] leading-[1.9]">
            <span className="font-semibold text-[#3d5638]">カスタマイズ可。</span>何から深めるかは、地図を見ながら。一部（血液）は準備中のため、ご案内は無料相談からになります。
          </p>
        </section>

        {/* ── 料金 ── */}
        <section className="pt-12 sm:pt-14">
          <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[1.5rem] font-bold text-[#16241A]" style={MINCHO}>費用は、¥200,000〜500,000。</span>
              <span className="text-[12px] text-[#9aa79a]">・オーダーメイド／専属チーム貸切</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">
              目的・期間・手配する専門家の数で変わります。入口の印象診断（90分・¥22,000／お申し込みで全額充当）で状況を伺い、総額と内訳を着手前に必ず提示します。予算を超えることはありません。施術・商品の実費は別です。
            </p>
            <ul className="mt-4 grid sm:grid-cols-3 gap-2.5">
              {["紹介料を受け取らない", "総額と内訳を、契約の前に", "合意した予算を超えない"].map((p) => (
                <li key={p} className="flex items-center gap-2 rounded-full bg-[#eef3ea] px-3.5 py-2 text-[12px] font-semibold text-[#3d5638]">
                  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 目的別の読みもの（desire で自動仕分け） ── */}
        <section className="pt-12 sm:pt-16 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Read — 目的別の読みもの</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
            まず、読んで確かめたい人へ。
          </h2>
          <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-8">
            売り込みなし・出典つき。あなたの目的に近いところから、どうぞ。
          </p>

          <div className="space-y-9">
            {TRACK_DESIRES.map((key) => {
              const d = DESIRES[key];
              const articles = clusters.filter((a) => a.track === "refine" && a.desire === key && a.kind !== "interview").slice(0, 4);
              if (articles.length === 0) return null;
              return (
                <div key={key}>
                  <div className="flex items-start gap-2.5 mb-3.5">
                    <span className="shrink-0 inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-3 py-1 text-[11px] font-bold tracking-[0.06em]">{d.label}</span>
                    <p className="text-[12px] text-[#6b7a66] leading-[1.8] pt-0.5">{d.hook}</p>
                  </div>
                  <ul className="space-y-2">
                    {articles.map((a) => (
                      <li key={a.slug}>
                        <Link href={`/areas/${a.areaId}/${a.slug}`} className="group flex items-center justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3.5 hover:border-[#3d5638]/40 transition-colors">
                          <span className="text-[13.5px] font-semibold text-[#1f2a1d] leading-[1.6] group-hover:text-[#3d5638] transition-colors">{a.title}</span>
                          <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Link href="/areas" className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
            記事をすべて見る（Library） <span aria-hidden>→</span>
          </Link>
        </section>

        {/* ── CTA ── */}
        <section className="py-12 sm:py-16">
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9">
            <h2 className="text-[1.3rem] sm:text-[1.6rem] leading-[1.5] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
              もう一段を、<span className="text-[#85AB8B]">仕組みに。</span>
            </h2>
            <p className="text-[13px] text-[#C9D2C4] leading-[1.95] mb-6">
              日程を選ぶ → 匿名でWeb相談（15分） → 秘密保持契約に同意 → 伸ばす一点を決める。無料です。
            </p>
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-8 py-3.5 transition-colors">
              まず、話してみる <span aria-hidden>→</span>
            </ConsultLink>
          </div>
          <p className="mt-6 text-[11.5px] text-[#6b7a66] leading-[1.9]">
            ※ His Recoveries は医療行為を行いません。血液検査等は提携する医療機関（自由診療）が行い、数値の解釈・診断は医師が行います。特定の医療機関・商品を推奨・斡旋しません。
          </p>
        </section>
      </div>
    </div>
  );
}
