import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "インタビュー — 同じ道を、通った人たち",
  description:
    "第一線で働く人たちが、コンプレックスとどう向き合い、何を選び、いまどこにいるのか。成功談ではなく、過程の記録として。",
  alternates: { canonical: `${site.url}/interviews` },
};

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

const FEATURED = {
  theme: "薄毛・AGA",
  span: "1年後",
  quote:
    "「名刺を渡す角度を、いつのまにか変えていた。気づいたのは、変えなくてよくなってからでした。」",
  who: "30代前半・法人営業 / 一日に何度も初対面の相手と向き合う",
};

const INTERVIEWS = [
  {
    theme: "ニキビ・肌",
    span: "8ヶ月後",
    title: "歯科衛生士、一日中マスクの下で頬を気にしていた頃のこと",
    who: "20代後半・歯科衛生士 / 勤務中はほぼ終日マスク",
    body:
      "マスクのせいだと思って後回しにしていた頬の赤み。受診して「炎症・乾燥・摩擦」を分けて理解できてから、頬を触る回数が目に見えて減った。",
  },
  {
    theme: "汗・におい",
    span: "半年後",
    title: "ワキガ手術から半年、夏のグレーを選び直せた朝のこと",
    who: "20代後半・夏のグレーを、何年も避けてきた",
    body:
      "施術が自意識を消したわけではない。ただ、その自意識が居続ける場所を、少しずつ別の場所へ動かしてくれた。半年は、シャツの色を自分の好みで選び直せるまでの時間だった。",
  },
];

export default function InterviewsPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <header className="max-w-[42rem] mb-12 sm:mb-16">
          <p className="font-mono text-[12px] tracking-[0.14em] text-[#3d5638] uppercase font-medium">
            Interviews
          </p>
          <h1 className="mt-4 text-[2.2rem] sm:text-[3rem] leading-[1.25]" style={HEAD}>
            同じ道を、<span className="text-[#3d5638]">通った人たち。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[1.95]">
            第一線で働く人たちが、悩みとどう向き合い、何を選び、いまどこにいるのか。
            成功談ではなく、過程の記録として。完了形ではなく、半歩進んだ時間として。
          </p>
        </header>

        {/* featured pull-quote */}
        <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-8 md:p-12 mb-8">
          <div className="flex items-center gap-2 text-[#85AB8B] text-[13px] font-medium mb-6">
            <span>{FEATURED.theme}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/60">{FEATURED.span}</span>
          </div>
          <p className="font-mincho text-[1.5rem] md:text-[2rem] leading-[1.6] text-[#EDF1E8]">
            {FEATURED.quote}
          </p>
          <div className="mt-8 text-[#9FB0A0] text-sm">{FEATURED.who}</div>
        </div>

        {/* interviews */}
        <div className="grid sm:grid-cols-2 gap-6">
          {INTERVIEWS.map((it) => (
            <article
              key={it.title}
              className="rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 md:p-8 shadow-sm flex flex-col"
            >
              <div className="flex items-center gap-2 text-[#3d5638] text-[13px] font-semibold mb-5">
                <span>{it.theme}</span>
                <span className="text-[#1f2a1d]/25">·</span>
                <span className="text-[#6b7a66]">{it.span}</span>
              </div>
              <h2 className="text-[1.15rem] md:text-[1.3rem] font-bold leading-[1.55] text-[#1f2a1d]">
                {it.title}
              </h2>
              <p className="mt-4 text-[13.5px] text-[#4b5b47] leading-[1.95] flex-1">
                {it.body}
              </p>
              <div className="mt-6 pt-5 border-t border-[#1f2a1d]/10 text-[12.5px] text-[#6b7a66]">
                {it.who}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 当事者の観察であり、医療行為・診断・受診勧奨を行うものではありません。
          個別の判断は医療機関にご相談ください。
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/mechanism" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            なぜ起きるのかを読む <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            予約登録する <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
