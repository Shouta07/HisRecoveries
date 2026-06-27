import type { Metadata } from "next";
import Link from "next/link";
import MangaPanels from "@/components/manga/MangaPanels";
import TrackedCTA from "@/components/TrackedCTA";
import { site } from "@/lib/site";

const APPLY = "/apply";

export const metadata: Metadata = {
  title: "漫画で読む、コンプレックスからの半歩 — His Recoveries",
  description:
    "汗・におい・肌・顔。言えない悩みを、ひとりで抱えてきたあなたへ。1本の漫画で読む、完全招待制・完全匿名の改善プログラム。煽らず、断定せず、半歩先から。",
  alternates: { canonical: `${site.url}/manga` },
  openGraph: {
    title: "漫画で読む、コンプレックスからの半歩 — His Recoveries",
    description:
      "言えない悩みを、ひとりで抱えてきたあなたへ。1本の漫画で読む、完全招待制・完全匿名の改善プログラム。",
    url: `${site.url}/manga`,
  },
};

const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.015em",
  fontFeatureSettings: '"palt" 1',
};

const POINTS = [
  {
    t: "完全匿名・完全守秘",
    d: "実名も顔も、いりません。Webアプリ上の匿名アカウントで、状態だけを可視化します。",
  },
  {
    t: "煽らない・断定しない",
    d: "「何もしない」も含めて、期間・費用・リスクを正直に並べます。売るためではなく、選ぶために。",
  },
  {
    t: "医療と中立に連携",
    d: "診断・治療は連携する医療機関が行います。紹介手数料はゼロ。本プログラムは医療行為ではありません。",
  },
  {
    t: "専属が、卒業まで伴走",
    d: "原因の特定から定着まで、専属担当がオンライン・対面で並走。自分で再現できたら卒業です。",
  },
];

export default function MangaLandingPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden border-b border-[#1f2a1d]/10 bg-[#dfe6dc]">
        <div className="mx-auto max-w-[760px] px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-20 text-center">
          <div className="mb-6 flex items-center justify-center gap-3 text-[#4b5b47]">
            <span aria-hidden className="block h-px w-8 bg-[#85AB8B]/70 sm:w-10" />
            <span
              className="text-[11px] font-medium tracking-[0.34em] sm:text-xs"
              style={{ fontFeatureSettings: '"palt" 1' }}
            >
              男性のための・漫画で読む
            </span>
            <span aria-hidden className="block h-px w-8 bg-[#85AB8B]/70 sm:w-10" />
          </div>

          <h1
            className="text-[#336443] text-[2rem] leading-[1.32] sm:text-[3rem] sm:leading-[1.28]"
            style={HEAD}
          >
            言えない悩みは、
            <br />
            <span className="text-[#85AB8B]">半歩</span>から動きだす。
          </h1>

          <p className="mx-auto mt-7 max-w-md text-[14px] leading-[2.05] tracking-[0.03em] text-[#4b5b47] sm:text-[15.5px]">
            汗、におい、肌、顔。
            <wbr />
            10年ひとりで抱えてきた人の物語を、
            <wbr />1本の漫画にしました。完全招待制・完全匿名の改善プログラム。
          </p>

          {/* 読み進めボタン */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#story"
              className="rounded-full bg-[#1f2a1d] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a3827]"
            >
              漫画を読む
            </a>
            <Link
              href={APPLY}
              className="text-sm font-semibold text-[#3d5638] transition-opacity hover:opacity-80"
            >
              先に予約登録する →
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#2d4228]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
            </svg>
            <span className="text-xs font-semibold">
              完全匿名・完全守秘義務のもと
            </span>
          </div>
        </div>
      </section>

      {/* ============ 漫画本編 ============ */}
      <section id="story" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto mb-12 max-w-[640px] text-center sm:mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3d5638]">
            A Short Story
          </p>
          <h2 className="mt-3 text-[1.5rem] sm:text-[1.9rem]" style={HEAD}>
            ある人の、半歩。
          </h2>
          <p className="mt-3 text-[13.5px] leading-[1.9] text-[#4b5b47]">
            上から下へ、読み進めてください。
          </p>
        </div>

        <MangaPanels />
      </section>

      {/* ============ 物語のあとに（CTA前の要点） ============ */}
      <section className="border-t border-[#1f2a1d]/10 bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[860px]">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-[1.5rem] sm:text-[2rem]" style={HEAD}>
              これは、物語の中だけの話ではありません。
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[2] text-[#4b5b47]">
              His Recoveries は、言えない悩みを持つ人同士でつくる、
              完全招待制・匿名の改善プログラムです。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <div
                key={p.t}
                className="rounded-[1.25rem] border border-[#1f2a1d]/10 bg-[#f4f6f2] p-6 sm:p-7"
              >
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="logo-type text-[13px] italic text-[#85AB8B]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15.5px] font-bold text-[#1f2a1d]">{p.t}</h3>
                </div>
                <p className="text-[13.5px] leading-[1.95] text-[#3a423a]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 最終CTA ============ */}
      <section className="relative overflow-hidden bg-[#16241a] px-5 py-20 text-center sm:px-8 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(133,171,139,0.22) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[640px]">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#85AB8B]">
            Recover Your Presence
          </p>
          <h2
            className="mt-5 text-[1.8rem] leading-[1.4] text-[#EDF1E8] sm:text-[2.6rem]"
            style={HEAD}
          >
            物語の続きは、
            <br />
            あなたの番です。
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[14px] leading-[2.05] text-[#c6d2c2]">
            まずは予約登録から。順番が来たら、完全匿名のまま、半歩目をご案内します。
            無理に進めることは、決してありません。
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <TrackedCTA
              href={APPLY}
              event="hero_cta_click"
              eventProps={{ location: "manga_lp_final" }}
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#16241a] transition-colors hover:bg-white/90"
            >
              予約登録する
            </TrackedCTA>
            <Link
              href="/mechanism"
              className="text-sm font-medium text-[#c6d2c2] transition-opacity hover:opacity-80"
            >
              先に「なぜ起きるのか」を読む →
            </Link>
          </div>

          <p className="mx-auto mt-10 max-w-md text-[11.5px] leading-[1.9] text-[#8aa089]">
            すべて完全匿名・完全守秘義務のもとで運営します。
            ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
            紹介手数料はゼロです。
          </p>
        </div>
      </section>
    </div>
  );
}
