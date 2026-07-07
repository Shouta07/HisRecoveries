import type { Metadata } from "next";
import Link from "next/link";
import { PhoneFrame, DashboardScreen, MemberScreen } from "@/components/HowShowcase";
import { site } from "@/lib/site";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "オンライン伴走（準備中）",
  description:
    "His Recoveries の「毎日そばで支える」オンライン伴走。日々の記録・スコア・専属からのひとことで、変化を自分ごとに。現在準備中です。",
  alternates: { canonical: `${site.url}/online` },
  // 準備中ページは薄いコンテンツのため、当面は検索インデックスから除外。
  robots: { index: false, follow: true },
};

const MOMENTS = [
  "今日の調子を、ひとことで。",
  "スコアと記録で、変化が見える。",
  "専属から、そっとひとこと。",
];

export default function OnlinePage() {
  return (
    <div className="bg-[#16241a] text-[#EDF1E8] min-h-screen">
      <div className="mx-auto max-w-[860px] px-6 sm:px-10 pt-20 sm:pt-28 pb-24">
        <nav aria-label="パンくず" className="text-[12px] text-[#9FB0A0] mb-8">
          <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#EDF1E8]">オンライン伴走</span>
        </nav>

        <span className="inline-flex items-center rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#85AB8B]">
          準備中・COMING SOON
        </span>

        <h1 className="mt-5 text-[2rem] sm:text-[2.6rem] leading-[1.3] text-[#EDF1E8]" style={{ ...MINCHO, fontWeight: 800 }}>
          毎日、そばで<span className="text-[#85AB8B]">支える。</span>
        </h1>
        <p className="mt-5 text-[14.5px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
          リアルで整えた一日を、その後の毎日へ。記録とスコアで変化を可視化し、専属がそっと伴走する——
          オンラインでの伴走体験は、現在準備を進めています。まずは、リアルの回復体験からご案内します。
        </p>

        <ul className="mt-8 space-y-3">
          {MOMENTS.map((t) => (
            <li key={t} className="flex items-center gap-3">
              <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-white/[0.07] border border-white/10 text-[#85AB8B]">●</span>
              <span className="text-[13.5px] text-[#D7DED2]">{t}</span>
            </li>
          ))}
        </ul>

        {/* アプリのイメージ */}
        <div className="relative mt-12 flex items-end justify-center overflow-hidden" style={{ perspective: "1200px" }}>
          <div className="scale-[0.7] sm:scale-[0.85] flex items-end">
            <PhoneFrame className="z-10" style={{ transform: "rotate(-5deg) translateY(8px)" }}>
              <DashboardScreen />
            </PhoneFrame>
            <PhoneFrame className="z-20 -ml-12" style={{ transform: "rotate(4deg) translateY(-10px) scale(1.02)" }}>
              <MemberScreen />
            </PhoneFrame>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/#service"
            className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] text-[#16241a] text-sm font-semibold px-7 py-3.5 hover:opacity-90 transition-opacity"
          >
            リアルの回復体験を見る <span aria-hidden>→</span>
          </Link>
          <Link
            href="/#packages"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-7 py-3.5 transition-colors"
          >
            Service
          </Link>
        </div>
      </div>
    </div>
  );
}
