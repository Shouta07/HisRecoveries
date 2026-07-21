import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { packages, urgentNote } from "@/lib/packages";
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
          <Link href="/#service" className="hover:text-[#1f2a1d]">Service</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">{p.name}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">{p.theme}</span>
          </div>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3]" style={HEAD}>{p.name}</h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{p.tagline}</p>
          <p className="mt-3 text-[13px] text-[#6b7a66]">{p.forWhom}</p>
          <div className="mt-4 text-[14px] font-semibold text-[#3d5638]">{p.duration}・{p.price}</div>
          <p className="mt-2 text-[12.5px] text-[#6b7a66] leading-[1.8]">{urgentNote}</p>
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
            <span className="font-bold">本パッケージは医療行為を含みません。</span>
            カウンセリング・メイク・服選び・撮影で、第一印象を整えます。
            将来的に施術・診断・治療が必要になった場合も、<strong>売らない・中立</strong>の立場で情報提供します。
          </p>
        </div>

        {/* このはじめ方“ならでは”の付加価値 */}
        <section className="mb-10">
          <h2 className="text-[1.2rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
            {p.name}の、<span className="text-[#3d5638]">付加価値。</span>
          </h2>
          <p className="text-[13px] text-[#6b7a66] leading-[1.9] mb-5">
            His Recoveries は、モノや施術を売りません。中立の立場で、あなたに合う選択肢だけを整理します。
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

        {/* この一日で、持ち帰るもの — 診断で終わらせない（競合との構造差） */}
        <section className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9 mb-10 overflow-hidden relative">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-[#85AB8B]/12 blur-3xl" />
          <div className="relative">
            <div className="text-[11px] tracking-[0.18em] text-[#85AB8B] font-semibold mb-3">WHAT YOU KEEP ・ 持ち帰るもの</div>
            <h2 className="text-[1.35rem] sm:text-[1.7rem] leading-[1.5]" style={HEAD}>
              翌日から、自分で再現できる。
            </h2>
            <p className="mt-4 text-[13.5px] sm:text-[14.5px] text-[#C9D2C4] leading-[2]">
当日の成果を、翌日からご自身で再現できる形にしてお渡しします。
            </p>
            <ul className="mt-6 space-y-4">
              {[
                { t: "あなた専用のスタイルガイド", d: "似合う色・形とその理由、再現の手順、服やアイテムの選び方をまとめた資料をお渡しします。" },
                { t: "当日の写真データ", d: "撮影した写真をお渡しします。データの所有権はあなたにあります。" },
                { t: "その後の記録（任意）", d: "ご本人の同意があれば、相談内容を記録として残し、次回の相談に活用します。不要な場合は残しません。" },
              ].map((x) => (
                <li key={x.t} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-[#85AB8B] shrink-0" />
                  <span>
                    <span className="block text-[14px] font-bold text-[#EDF1E8]" style={HEAD}>{x.t}</span>
                    <span className="block mt-1 text-[12.5px] text-[#9FB0A0] leading-[1.9]">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[11.5px] text-[#9FB0A0] leading-[1.85]">
              記録のお預かりは、ご本人の同意があるときだけ。やめたいときは、いつでもやめられます。
            </p>
          </div>
        </section>

        {/* こんな日の前に — 動機別の扉（商品は1つ、入口だけ増やす） */}
        <section className="mb-10">
          <h2 className="text-[1.2rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
            こんな日の、<span className="text-[#3d5638]">前に。</span>
          </h2>
          <p className="text-[13px] text-[#6b7a66] leading-[1.9] mb-5">
            大事な一日が決まっているなら、そこから逆算して整えます。まずは、その日の準備を読むところから。
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { t: "婚活・お見合いの写真の前に", href: "/areas/impression/omiai-fukusou-men" },
              { t: "面接・大事な商談の前に", href: "/areas/impression/mensetsu-daiichiinsho" },
              { t: "結婚式・二次会に呼ばれて", href: "/areas/impression/kekkonshiki-mijitaku-men" },
              { t: "同窓会で「変わったね」と", href: "/areas/impression/dousoukai-mitame-junbi" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between gap-3 rounded-[1.1rem] border border-[#1f2a1d]/10 bg-white px-5 py-4 hover:border-[#3d5638]/40 transition-colors"
              >
                <span className="text-[13.5px] font-semibold text-[#1f2a1d]">{s.t}</span>
                <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <BookingCTA className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            このパッケージを予約する
          </BookingCTA>
          <Link href="/areas" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            ライブラリを見る <span aria-hidden>→</span>
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
