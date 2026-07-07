import type { Metadata } from "next";
import Link from "next/link";
import PartnerForm from "@/components/PartnerForm";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "現場のプロの方へ — 一緒に、男性のウェルネスを",
  description:
    "メイク・スタイリスト・フォトグラファー・サロン・トレーナー・医療。男性のウェルネスを盛り上げたい現場のプロの方へ。取材・チーム参画・記事紹介の3つの関わり方があります。",
  alternates: { canonical: `${site.url}/partners` },
  openGraph: {
    type: "website",
    url: `${site.url}/partners`,
    title: "現場のプロの方へ — 一緒に、男性のウェルネスを",
    description: "取材・チーム参画・記事紹介。現場のプロと一緒に、男性のウェルネスを前に進めます。",
  },
};

const WAYS = [
  {
    n: "01",
    t: "取材を受ける",
    d: "現場で何が起きているか、あなたの言葉を記事にします。お名前・活動名・SNSを紹介し、被リンクと露出をお返しします。金銭のやり取りはありません。",
  },
  {
    n: "02",
    t: "提供チームに参画する",
    d: "第一印象改善パッケージを一緒に届ける専属チーム（メイク・スタイリスト・撮影ほか）を探しています。お仕事として、単発から。",
  },
  {
    n: "03",
    t: "記事を紹介される",
    d: "あなたが公開している記事を、出典を明記して当サイトで紹介します（キュレーション）。順位付けはせず、中立に。",
  },
];

export default function PartnersPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-8">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">現場のプロの方へ</span>
        </nav>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">For Professionals</span>
          </div>
          <h1 className="text-[2.1rem] sm:text-[2.9rem] leading-[1.28]" style={HEAD}>
            現場のプロの、<br />
            <span className="text-[#3d5638]">力を貸してください。</span>
          </h1>
          <p className="mt-6 text-[15px] text-[#4b5b47] leading-[2] max-w-[38rem]">
            His Recoveries は、男性のウェルネスを当たり前にしたいという思いで運営しています。
            メイク、スタイリング、撮影、髪、肌、体、心——それぞれの現場で男性と向き合ってきたプロの力が要ります。
            関わり方は、3つあります。
          </p>
          <Link href="/manifesto" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
            私たちの思想を読む <span aria-hidden>→</span>
          </Link>
        </header>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {WAYS.map((w) => (
            <div key={w.n} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6 shadow-sm">
              <div className="font-mono text-[12px] tracking-[0.2em] text-[#85AB8B] mb-2">{w.n}</div>
              <h2 className="text-[1.1rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>{w.t}</h2>
              <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">{w.d}</p>
            </div>
          ))}
        </div>

        <section className="rounded-[1.8rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-7 sm:p-10">
          <h2 className="text-[1.4rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>まずは、話を聞かせてください。</h2>
          <p className="text-[13px] text-[#4b5b47] leading-[1.95] mb-8">
            どの関わり方でも、どれも決めていなくても構いません。数日以内にご連絡します。
          </p>
          <PartnerForm />
        </section>

        <p className="mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 取材・紹介と、金銭のやり取りは切り離しています。特定の医療機関・商品を推奨・斡旋しません（中立）。
        </p>
      </div>
    </div>
  );
}
