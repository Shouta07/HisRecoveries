import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExperienceInvite from "@/components/ExperienceInvite";
import { complexes } from "@/lib/complexes";
import { CLUSTER_UPDATED } from "@/lib/clusters";
import { STAGES, getStage, clustersByStage, isStageId } from "@/lib/stages";
import { site } from "@/lib/site";

// ライフステージ別の記事一覧。
// 記事は増やしていない。既存55本を年代で並べ替えているだけ。
// 0本のステージも 404 にせず、正直に「まだありません」と出す。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return STAGES.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const stage = getStage(params.id);
  if (!stage) return {};
  const url = `${site.url}/stages/${stage.id}`;
  const n = clustersByStage(stage.id).length;
  return {
    title: `${stage.age}の男性へ — ${stage.label}（記事${n}本）`,
    description: `${stage.age}の男性が向き合うことになるテーマを、${n}本の記事で整理しています。${stage.loss} 出典を明記し、やらなくていいことも書いています。`,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${stage.age}の男性へ — ${stage.label}`,
      description: stage.hook,
    },
  };
}

export default function StagePage({ params }: { params: { id: string } }) {
  if (!isStageId(params.id)) notFound();
  const stage = getStage(params.id)!;
  const articles = clustersByStage(stage.id);
  const url = `${site.url}/stages/${stage.id}`;

  // この年代の記事が、どの領域に散っているか
  const byArea = complexes
    .map((c) => ({ area: c, items: articles.filter((a) => a.areaId === c.id) }))
    .filter((g) => g.items.length > 0);

  const idx = STAGES.findIndex((s) => s.id === stage.id);
  const prev = STAGES[idx - 1];
  const next = STAGES[idx + 1];

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: `${stage.age}の男性へ — ${stage.label}`,
    description: stage.loss,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    dateModified: CLUSTER_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "記事", item: `${site.url}/areas` },
      { "@type": "ListItem", position: 3, name: stage.label, item: url },
    ],
  };

  return (
    <div className="bg-[#F3F0EA] text-[#1F1E1B]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── ヒーロー ── */}
      <section className="relative overflow-hidden bg-[#1E2A38] text-[#F3F0EA]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #2A3849 0%, #1E2A38 58%, #161F2A 100%)",
          }}
        />
        <div className="relative max-w-[900px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-14">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#8E979E] mb-8">
            <Link href="/" className="hover:text-[#F3F0EA]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <Link href="/areas" className="hover:text-[#F3F0EA]">記事</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#F3F0EA]">{stage.label}</span>
          </nav>

          <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">
            {stage.age}
          </p>
          <h1 className="text-[1.8rem] sm:text-[2.5rem] leading-[1.4] text-[#F3F0EA]" style={HEAD}>
            {stage.hook}
          </h1>
          <p className="mt-6 text-[15px] text-[#C6CAD0] leading-[2] max-w-[36rem]">
            <span className="text-[#F3F0EA] font-semibold">{stage.theme}</span>——
            {stage.loss}
          </p>
          <p className="mt-5 font-mono text-[12.5px] text-[#8E979E] tracking-[0.06em]">
            {articles.length} 本 ／ 更新 {CLUSTER_UPDATED}
          </p>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {articles.length === 0 ? (
          <div className="rounded-[1.3rem] border border-dashed border-[#1F1E1B]/20 bg-white/60 px-6 sm:px-8 py-8">
            <p className="text-[16px] font-bold text-[#1F1E1B] mb-2.5" style={HEAD}>
              この年代の記事は、まだ1本もありません。
            </p>
            <p className="text-[14px] text-[#45443E] leading-[1.95]">
              数合わせで書くことはしません。ここは、実際にその年代を通った方への取材で
              埋めていく場所だと考えています。取材にご協力いただける方を探しています。
            </p>
            <Link
              href="/partner"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1E2A38] hover:bg-[#2A3849] text-[#F3F0EA] text-[14px] font-bold px-6 py-3 transition-colors"
            >
              取材について <span aria-hidden className="text-[#C28863]">→</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {byArea.map(({ area, items }) => (
              <section key={area.id}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span
                    aria-hidden
                    className="block w-6 h-[3px] shrink-0"
                    style={{ background: area.accent }}
                  />
                  <h2 className="text-[1.05rem] font-bold text-[#1F1E1B]" style={HEAD}>
                    {area.ja}
                  </h2>
                  <span className="font-mono text-[11px] text-[#5E6A70]">{items.length}</span>
                  <Link
                    href={`/areas/${area.id}`}
                    className="ml-auto text-[12.5px] font-semibold text-[#97613F] hover:opacity-70 transition-opacity whitespace-nowrap"
                  >
                    領域を見る →
                  </Link>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {items.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/areas/${a.areaId}/${a.slug}`}
                        style={{ borderLeftColor: area.accent, borderLeftWidth: 3 }}
                        className="group flex h-full flex-col rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-5 py-5 hover:border-[#97613F]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-24px_rgba(20,32,26,0.5)] transition-all"
                      >
                        <h3
                          className="text-[14.5px] font-bold text-[#1F1E1B] leading-[1.6] group-hover:text-[#97613F] transition-colors"
                          style={HEAD}
                        >
                          {a.title}
                        </h3>
                        <p className="mt-2 text-[13px] text-[#45443E] leading-[1.85] line-clamp-3 flex-1">
                          {a.lead}
                        </p>
                        <span className="mt-3 text-[12.5px] font-semibold text-[#97613F]">
                          読む <span aria-hidden>→</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* 記事の文脈からサービスへ */}
        {articles.length > 0 && <ExperienceInvite context={`${stage.age}で迷っているなら`} />}

        {/* 前後のステージ */}
        <nav className="mt-4 grid sm:grid-cols-2 gap-3" aria-label="ほかのライフステージ">
          {[prev, next].filter(Boolean).map((s) => (
            <Link
              key={s!.id}
              href={`/stages/${s!.id}`}
              className="group rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-5 py-5 hover:border-[#97613F]/40 transition-colors"
            >
              <p className="font-mono text-[11px] text-[#97613F] tracking-[0.08em]">
                Stage {s!.n} ／ {s!.age}
              </p>
              <p
                className="mt-1.5 text-[15px] font-bold text-[#1F1E1B] group-hover:text-[#97613F] transition-colors"
                style={HEAD}
              >
                {s!.label}
              </p>
              <p className="mt-1 text-[13px] text-[#45443E] leading-[1.8]">{s!.hook}</p>
            </Link>
          ))}
        </nav>

        <p className="mt-8 text-[13.5px]">
          <Link
            href="/areas"
            className="text-[#97613F] underline decoration-[#C28863]/60 underline-offset-4 hover:decoration-[#97613F] transition-colors"
          >
            すべての記事を見る
          </Link>
        </p>
      </div>
    </div>
  );
}
