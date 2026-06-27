import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "メカニズム — コンプレックスは、なぜ生じるのか",
  description:
    "薄毛・汗・肌・顔・体毛・自意識。男性のコンプレックスが「なぜ起きるのか」を、原因から、煽らず・断定せず・仕組みで解説します。",
  alternates: { canonical: `${site.url}/mechanism` },
};

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export default function MechanismPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[860px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <header className="mb-14">
          <p className="font-mono text-[12px] tracking-[0.14em] text-[#3d5638] uppercase font-medium">
            The Mechanism
          </p>
          <h1 className="mt-4 text-[2.2rem] sm:text-[3rem] leading-[1.25]" style={HEAD}>
            コンプレックスは、<span className="text-[#3d5638]">なぜ生じるのか。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[1.95]">
            性格でも、だらしなさでもありません。からだの仕組みで説明できる、再現性のある現象です。
            煽らず、断定せず、原因から読みほどきます。
          </p>
        </header>

        <div className="space-y-5">
          {complexes.map((c, i) => (
            <section
              key={c.id}
              id={c.id}
              className="scroll-mt-24 rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 sm:p-9 shadow-sm"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="logo-type italic text-[13px] text-[#85AB8B]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[1.5rem] font-bold text-[#1f2a1d]">{c.ja}</h2>
              </div>
              <span
                className="inline-flex rounded-full px-3 py-1 text-[11.5px] font-bold mb-4"
                style={{ backgroundColor: c.accentSoft, color: c.accent }}
              >
                {c.system}
              </span>
              <p className="text-[14.5px] text-[#3a423a] leading-[2]">{c.why}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 一般的に知られる情報の整理であり、診断・治療を目的としたものではありません。
          個別の症状や治療の判断は、医療機関にご相談ください。
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/interviews" className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            同じ悩みの人の声を読む <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            参加を申し込む <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
