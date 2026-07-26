import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";

// /why — なぜ、やるのか（想い）。運営者の当事者としての立脚点を、匿名のまま明かす。
// 顔・実名・実年齢は非公開（site.authorBio の方針）。主役は"あなた"に置く。
// ※ 具体的なエピソードは運営者本人の真実に合わせて随時上書きしてよい下書き。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "なぜ、やるのか — 誰にも言えない、を知っているから",
  description:
    "His Recoveries は、男性のコンプレックスを当事者として経験した人間がつくったサービスです。笑わない・急かさない・渡して終わりにしない。整える順番を一緒に描き、そのあとも伴走します。",
  alternates: { canonical: `${site.url}/why` },
  openGraph: {
    type: "website",
    url: `${site.url}/why`,
    title: "なぜ、やるのか — His Recoveries",
    description: "誰にも言えない、を知っているから。主役は、あなた。",
  },
};

export default function WhyPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "なぜ、やるのか", item: `${site.url}/why` },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ヒーロー（深緑・ブランド） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 18%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[760px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">なぜ、やるのか</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">WHY — なぜ、やるのか</div>
          <h1 className="text-[#EDF1E8] text-[2rem] sm:text-[2.9rem] leading-[1.35] font-[800]" style={HEAD}>
            誰にも言えない、を<br />
            <span className="text-[#9ec4a3]">知っているから。</span>
          </h1>
        </div>
      </section>

      {/* ── 本文（想い） ── */}
      <div className="max-w-[680px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="space-y-7 text-[15px] sm:text-[16px] leading-[2.05] text-[#3a423a]">
          <p>
            「清潔感がない」と言われた日のこと。写真の自分から、目をそらした夜のこと。鏡の前で、何から手をつければいいのか、分からなかった時間のこと。——それを、知っています。
          </p>
          <p>
            相談できる場所は、どこにもありませんでした。友達には言えない。家族には、もっと言えない。検索すれば、出てくるのは売り込みばかり。「あなたの場合は、この順番で整えるといい」と、<span className="font-semibold text-[#16241A]">誰も教えてくれなかった</span>。
          </p>

          <p className="text-[1.15rem] sm:text-[1.3rem] font-[800] text-[#16241A] leading-[1.7] py-2" style={HEAD}>
            だから、つくりました。<br />
            同じ場所で立ち止まった人間が、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">「最初に来ていい場所」</span>を。
          </p>

          <p>
            His Recoveries は、あなたを<span className="font-semibold text-[#16241A]">笑いません</span>。<span className="font-semibold text-[#16241A]">急かしません</span>。そして、どこかへ<span className="font-semibold text-[#16241A]">渡して終わりにもしません</span>。整える順番を一緒に描いて、あなたに合う人・場所へつなぎ、そのあとも隣で伴走します。
          </p>
          <p>
            顔も、名前も出していません。これは、誰かのカリスマの物語ではないからです。主役は、<span className="font-semibold text-[#16241A]">あなた</span>。あなたが、あなたの鏡に「OK」を出せるようになること。やっているのは、それだけです。
          </p>

          <p className="pt-2 text-[13px] text-[#6b7a66]">—— His Recoveries 運営</p>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9">
          <h2 className="text-[1.25rem] sm:text-[1.55rem] leading-[1.5] mb-2 text-[#EDF1E8] font-[800]" style={HEAD}>
            まず、あなたの<span className="text-[#85AB8B]">「整える順番」</span>を。
          </h2>
          <p className="text-[13px] text-[#C9D2C4] leading-[1.95] mb-6">
            30秒・無料・匿名。お住まい・年齢・やりたいことを書くだけで、あなた用のパッケージと日程プラン、読みものをお見せします。相談は、そのあとで大丈夫です。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/#diagnosis" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-7 py-3.5 transition-colors">
              パッケージを組んでみる <span aria-hidden>→</span>
            </Link>
            <ConsultLink className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 hover:bg-white/10 text-[#EDF1E8] text-[14px] font-semibold px-7 py-3.5 transition-colors">
              無料で相談する <span aria-hidden>→</span>
            </ConsultLink>
          </div>
        </div>

        <p className="mt-6 text-[11.5px] text-[#8a9686] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。運営チームは、男性のコンプレックスを当事者として経験した人間で構成しています（実名・顔・実年齢は非公開）。
        </p>
      </div>
    </div>
  );
}
