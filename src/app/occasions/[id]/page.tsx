import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConsultLink from "@/components/ConsultLink";
import TrackedCTA from "@/components/TrackedCTA";
import { allOccasions, occasionById } from "@/lib/occasions";
import { composePlan, formatYen } from "@/lib/planner";
import { site } from "@/lib/site";

// Job（叶えたいこと）別のランディングページ。広告・検索の着地先。
//
// 「構成の一例」と費用は、ここで文言を書き起こさず composePlan をビルド時に
// 呼んで生成する。LP のプランナーと同じエンジンから出るので、数字が食い違わない
// （価格を二重管理しない＝更新漏れで嘘をつかない、が狙い）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 構成例の前提。いちばん人口の多い条件に固定し、画面上でも前提を明記する。
const SAMPLE = { prefectureId: "tokyo", age: 35 };

export function generateStaticParams() {
  return allOccasions.map((o) => ({ id: o.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const o = occasionById(params.id);
  if (!o) return {};
  const title = `${o.title} — ${o.purpose}`;
  const url = `${site.url}/occasions/${o.id}`;
  return {
    title,
    description: o.metaDescription,
    keywords: o.keywords,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description: o.metaDescription },
    twitter: { card: "summary_large_image", title, description: o.metaDescription },
  };
}

export default function OccasionPage({ params }: { params: { id: string } }) {
  const o = occasionById(params.id);
  if (!o) notFound();

  // プランナーと同じエンジンで、構成の一例を組む。
  const plan = composePlan({
    prefectureId: SAMPLE.prefectureId,
    age: SAMPLE.age,
    goalKeys: o.goalKeys,
    occasion: { label: o.headline, modules: o.modules, flowLead: o.flowLead },
  });

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
        { "@type": "ListItem", position: 2, name: "叶えたいことから", item: `${site.url}/occasions` },
        { "@type": "ListItem", position: 3, name: o.title, item: `${site.url}/occasions/${o.id}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: o.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }}
        />
        <div className="relative max-w-[860px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <Link href="/occasions" className="hover:text-[#EDF1E8]">叶えたいことから</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">{o.title}</span>
          </nav>

          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">
            {o.no} — {o.purpose}
          </div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            {o.title}。
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[36rem]">
            <span className="font-semibold text-[#EDF1E8]">{o.job}</span>
            <br />
            {o.lead}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {o.examples.map((e) => (
              <span key={e} className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12px] text-[#D7DED2]">
                {e}
              </span>
            ))}
          </div>

          <TrackedCTA
            href={`/?occasion=${o.id}#diagnosis`}
            event="occasion_cta_click"
            eventProps={{ job: o.id, placement: "hero" }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-8 py-3.5 transition-colors"
          >
            30秒で、あなたの構成を組む <span aria-hidden>→</span>
          </TrackedCTA>
          <p className="mt-3 text-[11.5px] text-[#9FB0A0]">無料・匿名・登録不要／相互の秘密保持契約のもとで</p>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 sm:px-8">
        {/* ── 現在の障害 ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Obstacles — 現在の障害
            </span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-4" style={{ ...MINCHO, fontWeight: 800 }}>
            ここで、よく壁になるもの。
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {o.obstacles.map((x) => (
              <span key={x} className="rounded-full bg-white border border-[#1f2a1d]/12 px-4 py-2 text-[13px] font-semibold text-[#3a423a]">
                {x}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-[#4b5b47] leading-[1.95]">
            どれが効くかは、人によって違います。<span className="font-semibold text-[#3d5638]">全部やる必要はありません。</span>
            当てはまるものだけを、効く順に組みます。「やらなくていい」も、はっきりお伝えします。
          </p>
        </section>

        {/* ── 進め方（束ね方） ── */}
        <section className="pt-12 sm:pt-14">
          <div className="rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] p-6 sm:p-8">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2">Order — 整える順番</div>
            <h2 className="text-[1.2rem] sm:text-[1.5rem] leading-[1.5] mb-3" style={{ ...MINCHO, fontWeight: 800 }}>
              なぜ、この順番なのか。
            </h2>
            <p className="text-[13px] sm:text-[13.5px] leading-[2] text-[#D7DED2]">{plan.synthesis}</p>
          </div>
        </section>

        {/* ── 構成の一例（composePlan の出力） ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Example — 構成の一例
            </span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
            たとえば、こう組みます。
          </h2>
          <p className="text-[12.5px] text-[#6b7a66] leading-[1.9] mb-6">
            東京・35歳の場合の一例です。お住まい・年齢・その日までの期間で、構成も費用も変わります。
          </p>

          <ul className="rounded-[1.2rem] border border-[#1f2a1d]/10 bg-white divide-y divide-[#1f2a1d]/8 overflow-hidden">
            {plan.modules.map((m) => (
              <li key={m.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]" style={MINCHO}>
                      {m.name}
                      {m.medical && (
                        <span className="ml-2 align-middle rounded-full bg-[#e5f0ef] text-[#0f766e] px-2 py-0.5 text-[10px] font-bold">
                          中立紹介
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-[#4b5b47] leading-[1.8]">{m.what}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[12.5px] font-bold text-[#3d5638]">{m.price ? formatYen(m.price) : "無料"}</div>
                    {m.priceNote && <div className="mt-0.5 text-[10px] text-[#9aa79a] max-w-[9rem] leading-[1.5]">{m.priceNote}</div>}
                  </div>
                </div>
              </li>
            ))}
            <li className="px-5 py-4 bg-[#f6f8f4] flex items-center justify-between gap-3">
              <span className="text-[12.5px] font-bold text-[#1f2a1d]">合計の目安</span>
              <span className="text-[1.05rem] font-bold text-[#16241A]" style={MINCHO}>
                {formatYen(plan.priceFrom)}〜
              </span>
            </li>
          </ul>

          <div className="mt-4 rounded-[1.1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
            <div className="text-[12.5px] font-bold text-[#16241A] mb-2">入口は、ここから</div>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
              まずは<span className="font-semibold text-[#3d5638]">無料相談（匿名・15分）</span>。
              そのうえで印象カウンセリング <span className="font-semibold text-[#16241A]">¥22,000</span>
              （パッケージお申し込みで全額充当）から始まります。
              価格・所要はすべて目安です。総額と内訳は、契約の前に必ずお伝えします。
            </p>
          </div>
        </section>

        {/* ── 逆算（締切があるJobだけ） ── */}
        {o.dated && (
          <section className="pt-12 sm:pt-14">
            <div className="flex items-center gap-3 mb-3">
              <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
                Countdown — その日から逆算する
              </span>
            </div>
            <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-3" style={{ ...MINCHO, fontWeight: 800 }}>
              間に合うものと、<span className="text-[#3d5638]">間に合わないもの。</span>
            </h2>
            <p className="text-[13px] text-[#4b5b47] leading-[1.95] mb-5">
              変化には、それぞれ必要な期間があります。
              日付を入れていただければ、<span className="font-semibold text-[#3d5638]">間に合わないものは「間に合わない」と先にお伝えします。</span>
              黙って構成に混ぜることはしません。
            </p>

            <ul className="rounded-[1.2rem] border border-[#1f2a1d]/10 bg-white divide-y divide-[#1f2a1d]/8 overflow-hidden">
              {[
                ["髪（薄毛の治療）", "効果が見えるまで 3〜6ヶ月", "その日に間に合わないときは、髪型と分け目で対応します"],
                ["肌（質感そのもの）", "ターンオーバー1周期でおよそ1ヶ月", "足りないときは、下地づくりとメイクで整えます"],
                ["ヒゲ・体毛（減らす）", "複数回の照射が必要", "間に合わないときは、当日は形を整えるところまで"],
                ["髪型・服・撮影・当日の整え", "直前でも十分に効きます", "むしろ直前すぎないほうが馴染みます（3〜7日前推奨）"],
              ].map(([what, span, note]) => (
                <li key={what} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[13px] font-bold text-[#1f2a1d]" style={MINCHO}>{what}</span>
                    <span className="text-[12px] font-semibold text-[#3d5638]">{span}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.75]">{note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] text-[#6b7a66] leading-[1.85]">
              ※ 編成そのものにも時間が要ります。東京は最短2週間、地方は約3〜4週間いただきます。
            </p>
          </section>
        )}

        {/* ── 誰が実行するのか ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Network — 誰が、実行するのか
            </span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-3" style={{ ...MINCHO, fontWeight: 800 }}>
            私たちは、手を動かしません。
          </h2>
          <p className="text-[13px] text-[#4b5b47] leading-[1.95] mb-5">
            His Recoveries は、設計と接続をする立場です。実際に手を動かすのは、各分野の専門家。
            だから<span className="font-semibold text-[#3d5638]">特定の一社に縛られず</span>、あなたに合う人を選べます。
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {o.partners.map((p) => (
              <span key={p} className="rounded-full bg-white border border-[#1f2a1d]/12 px-3.5 py-2 text-[12.5px] text-[#3a423a]">
                {p}
              </span>
            ))}
          </div>

          <ul className="grid sm:grid-cols-3 gap-2.5">
            {["紹介料を受け取らない", "総額と内訳を、契約の前に", "合意した予算を超えない"].map((p) => (
              <li key={p} className="flex items-center gap-2 rounded-full bg-[#eef3ea] px-3.5 py-2 text-[12px] font-semibold text-[#3d5638]">
                <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {p}
              </li>
            ))}
          </ul>
        </section>

        {/* ── FAQ ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-5">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">FAQ — よくある質問</span>
          </div>
          <div className="space-y-3">
            {o.faqs.map((f) => (
              <div key={f.q} className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5">
                <div className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]" style={MINCHO}>{f.q}</div>
                <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.95]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-12 sm:py-16">
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9">
            <h2 className="text-[1.3rem] sm:text-[1.6rem] leading-[1.5] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
              まず、<span className="text-[#85AB8B]">現在地から。</span>
            </h2>
            <p className="text-[13px] text-[#C9D2C4] leading-[1.95] mb-6">
              お住まいと年齢を入れるだけで、あなた用の構成と日程プランをその場でお見せします。
              登録不要・売り込みなしです。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <TrackedCTA
                href={`/?occasion=${o.id}#diagnosis`}
                event="occasion_cta_click"
                eventProps={{ job: o.id, placement: "footer" }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-8 py-3.5 transition-colors"
              >
                30秒で、構成を組む <span aria-hidden>→</span>
              </TrackedCTA>
              <ConsultLink
                event="plan_consult_click"
                eventProps={{ job: o.id, placement: "occasion_lp" }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 hover:bg-white/[0.08] text-[#EDF1E8] text-[14px] font-bold px-8 py-3.5 transition-colors"
              >
                無料で相談する <span aria-hidden>→</span>
              </ConsultLink>
            </div>
          </div>

          {/* 他のJobへ */}
          <div className="mt-8">
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">ほかの「叶えたいこと」</div>
            <ul className="flex flex-wrap gap-2">
              {allOccasions
                .filter((x) => x.id !== o.id)
                .map((x) => (
                  <li key={x.id}>
                    <Link
                      href={`/occasions/${x.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#1f2a1d]/12 px-4 py-2 text-[12.5px] font-semibold text-[#3a423a] hover:border-[#3d5638]/45 transition-colors"
                    >
                      {x.title} <span aria-hidden className="text-[#85AB8B]">→</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <p className="mt-8 text-[11.5px] text-[#6b7a66] leading-[1.9]">
            ※ His Recoveries は医療行為を行いません。医療が必要な場合は、中立の立場で情報を整理し、
            判断はご本人と医療機関に委ねます。特定の医療機関・商品を推奨・斡旋しません。
          </p>
        </section>
      </div>
    </div>
  );
}
