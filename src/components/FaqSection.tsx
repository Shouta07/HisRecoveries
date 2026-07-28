// よくある質問（ホーム用・Oh my teeth 型）。
// 最頻出だけを質問行で少なく見せ、全件は /faq へ遷移させる。
// FAQPage schema は /faq 側に集約（重複を避ける）。
import Link from "next/link";
import { FAQ_TOP } from "@/lib/faq";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function FaqSection() {
  return (
    <section id="faq" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 pt-7 sm:pt-14 pb-8">
        {/* コーナー括弧つき見出し（特徴セクションと揃える） */}
        <div className="relative mx-auto w-fit px-9 py-3 mb-7 sm:mb-9">
          <span aria-hidden className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-[#85AB8B]" />
          <h2 className="text-[1.4rem] sm:text-[2rem] text-center leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            よくある質問
          </h2>
        </div>

        {/* 最頻出のみ・質問行のアコーディオン */}
        <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-5 sm:px-8 divide-y divide-[#1f2a1d]/10">
          {FAQ_TOP.map((f) => (
            <details key={f.q} className="group py-4 sm:py-[18px]">
              <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[15px] sm:text-[15px] font-bold text-[#1f2a1d] leading-[1.65]">
                <span>{f.q}</span>
                <span aria-hidden className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#eef3ea] text-[#3d5638] transition-transform duration-200 group-open:rotate-180">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </summary>
              <p className="mt-2.5 text-[14.5px] text-[#4b5b47] leading-[1.95]">{f.a}</p>
            </details>
          ))}

          {/* 全FAQへ */}
          <div className="py-6 text-center">
            <Link href="/faq" className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[15px] font-bold px-8 py-3.5 transition-colors">
              すべての質問をみる <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
