import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";
import { AUDIENCES, PROGRAM, QUOTE_FACTORS, PRINCIPLES } from "@/lib/business";

// 法人向けの面。キャッシュはここで生む。
// 実績0を隠さないまま商談に入れる形にする（初期3社は事例化が条件）。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/business`;

export const metadata: Metadata = {
  title: "法人・団体の方へ — 男性向け第一印象研修",
  description:
    "新卒研修・営業職研修・管理職研修・婚活事業者向けの、男性に特化した第一印象研修。髪・眉・服のサイズ感・姿勢・表情を要素に分け、その場で整えて、個別の印象カルテを持ち帰っていただきます。特定商材の販売や紹介料の受け取りは行いません。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title: "法人・団体の方へ — 男性向け第一印象研修",
    description:
      "座学で終わらせず、その場で整える。個別の印象カルテを持ち帰れる、男性特化の第一印象研修。",
  },
};

export default function BusinessPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "法人の方へ", item: url },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #24382b 0%, #16241A 58%, #0f1a12 100%)",
          }}
        />
        <div className="relative max-w-[900px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">
              ホーム
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">法人の方へ</span>
          </nav>

          <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">For organizations — 法人・団体の方へ</p>
          <h1
            className="text-[1.8rem] sm:text-[2.5rem] leading-[1.4] text-[#EDF1E8]"
            style={HEAD}
          >
            <span className="inline-block">「清潔感を出しましょう」で</span>
            <br />
            <span className="inline-block">終わらせない、</span>
            <span className="inline-block text-[#E0B75F]">男性向けの研修。</span>
          </h1>
          <p className="mt-6 text-[15px] text-[#C9D2C4] leading-[2] max-w-[36rem]">
            身だしなみ研修が形骸化するのは、
            <span className="hr-mark-dark">何をどう直すかを個人ごとに言わないから</span>です。
            全員に同じことを伝える座学は、誰の行動も変えません。
            髪・眉・服のサイズ感・姿勢・表情を要素に分け、その場で整え、
            一人ずつに印象カルテを渡します。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#E0B75F] hover:bg-[#EBC97E] text-[#16241A] text-[15px] font-bold px-7 py-3.5 transition-colors">
              研修について相談する <span aria-hidden>→</span>
            </ConsultLink>
            <a
              href="#program"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-[15px] font-semibold px-6 py-3.5 transition-colors"
            >
              内容を見る
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-5 sm:px-8">
        {/* ── 実績0を先に言う ── */}
        <section className="py-12 sm:py-16 hr-readable">
          <div className="rounded-[1.3rem] border-l-[3px] border-l-[#B98A3C] border-y border-r border-[#1f2a1d]/10 bg-white px-6 sm:px-8 py-6">
            <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-2">
              先に、正直なところ
            </p>
            <p className="text-[16px] sm:text-[17px] font-bold text-[#1f2a1d] leading-[1.65] mb-3" style={HEAD}>
              法人での実施実績は、まだありません。
            </p>
            <p className="text-[14px] text-[#5c6b58] leading-[1.95]">
              始めたばかりだからです。導入事例を並べることはできません。代わりに、
              <span className="text-[#1f2a1d] font-semibold">
                最初の3社さまは、事例掲載にご協力いただける前提で特別価格
              </span>
              でお受けします。掲載範囲（社名を出すか、匿名にするか）は御社と決めます。
            </p>
            <p className="mt-2.5 text-[13.5px] text-[#6b7a66] leading-[1.9]">
              個人向けプランでの実施記録は蓄積しています。内容・進め方はそちらをご覧いただけます。
              <Link
                href="/plan"
                className="ml-1 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4"
              >
                個人向けプランを見る
              </Link>
            </p>
          </div>
        </section>

        {/* ── 対象 ── */}
        <section className="pb-12 sm:pb-16 hr-readable">
          <p className="hr-eyebrow mb-3.5">Who — 想定している組織</p>
          <h2 className="text-[1.4rem] sm:text-[1.9rem] leading-[1.45]" style={HEAD}>
            指摘しにくい領域を、
            <br className="sm:hidden" />
            外から引き受けます。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[36rem]">
            外見への指摘は、社内の人間がやると角が立ちます。上司が部下に、
            担当者が学生に言うと、指導ではなく人格への評価に聞こえてしまう。
            <strong className="text-[#1f2a1d]">外部が言えば、単なる情報になります。</strong>
          </p>

          <ul className="mt-8 grid sm:grid-cols-2 gap-3.5">
            {AUDIENCES.map((a) => (
              <li
                key={a.id}
                className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-6 py-6"
              >
                <p className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.55]" style={HEAD}>
                  {a.who}
                </p>
                <p className="mt-2.5 text-[13.5px] text-[#5c6b58] leading-[1.95]">{a.pain}</p>
                <p className="mt-3 pt-3 border-t border-[#1f2a1d]/10 text-[13px] text-[#7E5B29] font-semibold">
                  {a.form}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 内容 ── */}
        <section id="program" className="pb-12 sm:pb-16 scroll-mt-24 hr-readable">
          <p className="hr-eyebrow mb-3.5">Program — 研修の中身</p>
          <h2 className="text-[1.4rem] sm:text-[1.9rem] leading-[1.45]" style={HEAD}>
            座学で終わらせず、
            <br className="sm:hidden" />
            <span className="hr-mark">その場で整えます。</span>
          </h2>

          <ol className="mt-8 relative border-l-2 border-[#B98A3C]/30 ml-3.5 space-y-7">
            {PROGRAM.map((p) => (
              <li key={p.n} className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute -left-[13px] top-0.5 grid place-items-center w-6 h-6 rounded-full bg-[#B98A3C] text-white text-[10.5px] font-bold"
                >
                  {p.n}
                </span>
                <p className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.55]" style={HEAD}>
                  {p.t}
                </p>
                <p className="mt-1 text-[14px] text-[#4b5b47] leading-[1.95]">{p.d}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-[1.2rem] bg-[#eef3ea] px-6 py-6">
            <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-2">
              研修後に残るもの
            </p>
            <p className="text-[14px] text-[#4b5b47] leading-[1.95]">
              受講者ごとの<strong className="text-[#1f2a1d]">印象カルテ</strong>（どこが効くか・何をやらないか）、
              <strong className="text-[#1f2a1d]">服のサイズ表</strong>（肩幅・着丈・袖丈）、
              <strong className="text-[#1f2a1d]">髪型のオーダー資料</strong>。
              研修の場だけで消えないよう、本人が後で使える形で渡します。
              ご希望があれば、部署単位の傾向レポート（個人が特定されない形）もお出しします。
            </p>
          </div>
        </section>

        {/* ── 中立性の宣言（法人でも同じ基準） ── */}
        <section className="pb-12 sm:pb-16 hr-readable">
          <p className="hr-eyebrow mb-3.5">Principles — 法人でも変えないこと</p>
          <h2 className="text-[1.4rem] sm:text-[1.9rem] leading-[1.45]" style={HEAD}>
            受講者に、何も売りません。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[36rem]">
            外部講師を入れるときに一番怖いのは、研修が営業の場になることだと思います。
            そうならない理由を、構造で説明します。
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-3.5">
            {PRINCIPLES.map((p) => (
              <div
                key={p.t}
                className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-6 py-6"
              >
                <p className="flex items-baseline gap-2.5 text-[15px] font-bold text-[#1f2a1d] leading-[1.55]">
                  <span aria-hidden className="w-2 h-2 shrink-0 rounded-full bg-[#B98A3C]" />
                  {p.t}
                </p>
                <p className="mt-2 text-[13.5px] text-[#5c6b58] leading-[1.95]">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 見積 ── */}
        <section className="pb-12 sm:pb-16 hr-readable">
          <p className="hr-eyebrow mb-3.5">Quote — お見積り</p>
          <h2 className="text-[1.4rem] sm:text-[1.9rem] leading-[1.45]" style={HEAD}>
            金額は、個別にお出しします。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[36rem]">
            人数と形式で費用が大きく変わるため、一律の価格表を置いていません。
            次の5点をお知らせいただければ、お見積りをお出しします。
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-2.5 max-w-[40rem]">
            {QUOTE_FACTORS.map((f, i) => (
              <li key={f} className="flex gap-3 text-[14px] text-[#4b5b47] leading-[1.9]">
                <span
                  aria-hidden
                  className="hr-figure shrink-0 text-[12.5px] font-bold text-[#B98A3C] pt-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13.5px] text-[#6b7a66] leading-[1.9]">
            実施は東京都内を基本としています。遠方の場合は交通費・宿泊費を別途申し受けます。
            現時点では土日の実施が中心ですが、法人研修については平日もご相談いただけます。
          </p>
        </section>
      </div>

      {/* ── 締め ── */}
      <section className="bg-[#16241A] text-[#EDF1E8]">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
          <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">Contact</p>
          <h2
            className="text-[1.4rem] sm:text-[1.9rem] leading-[1.55] text-[#EDF1E8]"
            style={HEAD}
          >
            <span className="inline-block">まず、御社の課題を</span>
            <span className="inline-block">聞かせてください。</span>
          </h2>
          <p className="mt-5 text-[14.5px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
            研修が必要かどうかも含めて、正直にお答えします。
            合わないと思えばそうお伝えしますし、
            他の手段のほうが早いと思えばそれもお伝えします。
            ご相談の段階で費用は発生しません。
          </p>
          <div className="mt-8">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#E0B75F] hover:bg-[#EBC97E] text-[#16241A] text-[15px] font-bold px-7 py-3.5 transition-colors">
              相談する（無料） <span aria-hidden>→</span>
            </ConsultLink>
          </div>
          <p className="mt-6 text-[12.5px] text-[#9FB0A0] leading-[1.9]">
            ご連絡はフォームからお願いします。お問い合わせの際に「法人」とご記入いただくか、
            ご希望欄にその旨をお書きください。
          </p>
        </div>
      </section>
    </div>
  );
}
