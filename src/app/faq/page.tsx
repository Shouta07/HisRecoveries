import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { FAQ_CATEGORIES, FAQ_ALL } from "@/lib/faq";
import { site } from "@/lib/site";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "よくある質問",
  description:
    "His Recoveries へのお問い合わせの多い質問をまとめました。秘密保持・料金・はじめかた・体験について。ここにない内容は、LINEでお気軽にご質問ください。",
  alternates: { canonical: `${site.url}/faq` },
};

export default function FaqPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ALL.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        {/* パンくず */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-8">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">よくある質問</span>
        </nav>

        {/* コーナー括弧つき見出し */}
        <div className="relative mx-auto w-fit px-9 py-3 mb-6">
          <span aria-hidden className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-[#85AB8B]" />
          <h1 className="text-[1.6rem] sm:text-[2.2rem] text-center leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            よくある質問
          </h1>
        </div>

        <p className="text-center text-[13.5px] text-[#4b5b47] leading-[1.95] mb-10">
          お問い合わせの多い質問をまとめました。
          <br className="sm:hidden" />
          ここにない内容は、お気軽に{" "}
          <ConsultLink className="font-semibold text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors">
            LINEでご質問
          </ConsultLink>
          ください。
        </p>

        {/* カテゴリから探す（アンカー） */}
        <div className="grid grid-cols-2 gap-3 mb-12">
          {FAQ_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 px-4 py-5 text-center text-[13px] font-bold text-[#1f2a1d] hover:border-[#3d5638]/50 transition-colors"
            >
              {c.label}
            </a>
          ))}
        </div>

        {/* カテゴリ別・全質問 */}
        <div className="space-y-10">
          {FAQ_CATEGORIES.map((c) => (
            <section key={c.id} id={c.id} className="scroll-mt-24">
              <h2 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-4" style={MINCHO}>{c.label}</h2>
              <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-5 sm:px-7 divide-y divide-[#1f2a1d]/10">
                {c.items.map((f) => (
                  <details key={f.q} className="group py-4 sm:py-[18px]">
                    <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[13.5px] sm:text-[14px] font-bold text-[#1f2a1d] leading-[1.65]">
                      <span>{f.q}</span>
                      <span aria-hidden className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#eef3ea] text-[#3d5638] transition-transform duration-200 group-open:rotate-180">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </span>
                    </summary>
                    <p className="mt-2.5 text-[13px] text-[#4b5b47] leading-[1.95]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 締めのLINE導線 */}
        <div className="mt-14 rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-[13.5px] leading-[1.9] flex-1">
            解決しないことは、LINEで直接どうぞ。<span className="text-[#C9D2C4]">無料・秘密保持のもとで。</span>
          </p>
          <ConsultLink className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[13.5px] font-bold px-7 py-3.5 transition-colors">
            LINEで質問する <span aria-hidden>→</span>
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}
