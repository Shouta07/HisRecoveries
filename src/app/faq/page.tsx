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
    "His Recoveries へのお問い合わせの多い質問をまとめました。秘密保持・料金・はじめかた・体験について。ここにない内容は、無料相談でお気軽にご質問ください。",
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
    <div className="bg-[#F3F0EA] text-[#1F1E1B]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        {/* パンくず */}
        <nav aria-label="パンくず" className="text-[13.5px] text-[#5E6A70] mb-8">
          <Link href="/" className="hover:text-[#1F1E1B]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1F1E1B]">よくある質問</span>
        </nav>

        {/* コーナー括弧つき見出し */}
        <div className="relative mx-auto w-fit px-9 py-3 mb-6">
          <span aria-hidden className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-[#C28863]" />
          <span aria-hidden className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-[#C28863]" />
          <span aria-hidden className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-[#C28863]" />
          <span aria-hidden className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-[#C28863]" />
          <h1 className="text-[1.6rem] sm:text-[2.2rem] text-center leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            よくある質問
          </h1>
        </div>

        <p className="text-center text-[15px] text-[#45443E] leading-[1.95] mb-10">
          お問い合わせの多い質問をまとめました。
          <br className="sm:hidden" />
          ここにない内容は、お気軽に{" "}
          <ConsultLink className="font-semibold text-[#97613F] underline decoration-[#C28863]/60 underline-offset-4 hover:decoration-[#97613F] transition-colors">
            無料相談でご質問
          </ConsultLink>
          ください。
        </p>

        {/* カテゴリから探す（アンカー） */}
        <div className="grid grid-cols-2 gap-3 mb-12">
          {FAQ_CATEGORIES.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-[1.1rem] bg-white border border-[#1F1E1B]/10 px-4 py-5 text-center text-[14.5px] font-bold text-[#1F1E1B] hover:border-[#97613F]/50 transition-colors"
            >
              {c.label}
            </a>
          ))}
        </div>

        {/* カテゴリ別・全質問 */}
        <div className="space-y-10">
          {FAQ_CATEGORIES.map((c) => (
            <section key={c.id} id={c.id} className="scroll-mt-24">
              <h2 className="text-[1.15rem] font-bold text-[#1F1E1B] mb-4" style={MINCHO}>{c.label}</h2>
              <div className="rounded-[1.4rem] bg-white border border-[#1F1E1B]/10 px-5 sm:px-7 divide-y divide-[#1F1E1B]/10">
                {c.items.map((f) => (
                  <details key={f.q} className="group py-4 sm:py-[18px]">
                    <summary className="flex items-start justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[15px] sm:text-[15px] font-bold text-[#1F1E1B] leading-[1.65]">
                      <span>{f.q}</span>
                      <span aria-hidden className="mt-0.5 shrink-0 grid place-items-center w-6 h-6 rounded-full bg-[#EDE9E0] text-[#97613F] transition-transform duration-200 group-open:rotate-180">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                      </span>
                    </summary>
                    <p className="mt-2.5 text-[14.5px] text-[#45443E] leading-[1.95]">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 締めの相談導線 */}
        <div className="mt-14 rounded-[1.4rem] bg-[#1E2A38] text-[#F3F0EA] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-[15px] leading-[1.9] flex-1">
            解決しないことは、無料相談で直接どうぞ。<span className="text-[#C6CAD0]">匿名・秘密保持のもとで。</span>
          </p>
          <ConsultLink className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-[#F3F0EA] hover:bg-white text-[#1E2A38] text-[15px] font-bold px-7 py-3.5 transition-colors">
            無料で相談する <span aria-hidden>→</span>
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}
