import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clusters } from "@/lib/clusters";
import { complexById } from "@/lib/complexes";
import { SITUATIONS } from "@/lib/situations";
import { byNewest, formatDate, publishedAt } from "@/lib/articleDates";
import { site } from "@/lib/site";

// 状況ページ。「結婚式に呼ばれた」「面接・転職がある」など9本。
//
// ── なぜキーワードのタグページを作らなかったか ──────────────
// 各記事は keywords を5〜8個持っている（「メンズメイク 初心者」など）。
// これをそのままタグページにすると100本以上のURLが増えるが、
// 中身は検索語の言い換えで、1〜2本しか記事のないページが大量にできる。
// それは「数合わせで記事を作らない」という自分の方針と正面から矛盾する。
//
// 代わりに、すでに編集の手で束ねてある「状況」をページにした。
// 9本すべてが5本以上の記事を持ち、読者が自分の口で言う言葉になっている。
// 検索でも「結婚式 服装 男」のような、状況そのもののクエリで受けられる。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

/** ページの導入。状況ごとに、なぜこの束なのかを1行で書く（作り話はしない） */
const INTRO: Record<string, string> = {
  deai: "見た目だけで決まるものではありませんが、会う前に落とされる理由は減らせます。減点をなくすところから並べています。",
  kekkonshiki: "日にちが決まっている分、やることの順番がはっきりします。当日までに間に合うものから順に。",
  shashin: "写真写りは顔立ちより、光・角度・表情で動く部分が大きい。撮る側と撮られる側、両方の記事を集めました。",
  konkatsu: "写真・服・清潔感まわりで、最初に整えると効きやすいものを集めています。",
  mensetsu: "第一印象で不利にならないための最低限。短時間で伝わる要素から並べています。",
  fuke: "老けて見える理由の多くは、衰えではなく手入れで動く部分です。原因の切り分けから。",
  kami: "気づいた時点でどこまで選べるかが決まります。まず現在地を知るための記事から。",
  tsukare: "睡眠・むくみ・数値。外側の話に見えて、印象にいちばん出るところです。",
  hajimete: "全部やろうとすると全部が中途半端になります。順番を決めるための記事を集めました。",
};

export function generateStaticParams() {
  return SITUATIONS.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const s = SITUATIONS.find((x) => x.id === params.id);
  if (!s) return {};
  const n = s.slugs.filter((slug) => clusters.some((c) => c.slug === slug)).length;
  const title = `${s.label}人が読んでいる記事${n}本`;
  const description = `${s.label}——そのときに読まれている記事を${n}本、編集部がまとめました。${INTRO[s.id] ?? ""}`;
  const url = `${site.url}/situations/${s.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: site.name, locale: site.locale, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function SituationPage({ params }: { params: { id: string } }) {
  const s = SITUATIONS.find((x) => x.id === params.id);
  if (!s) notFound();

  const items = byNewest(
    s.slugs
      .map((slug) => clusters.find((c) => c.slug === slug))
      .filter((x): x is (typeof clusters)[number] => Boolean(x)),
  );
  if (items.length === 0) notFound();

  const url = `${site.url}/situations/${s.id}`;
  const others = SITUATIONS.filter((x) => x.id !== s.id);

  const listLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: `${s.label}人が読んでいる記事`,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
        name: a.title,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: s.label, item: url },
    ],
  };

  return (
    <div className="bg-shironeri text-sumi">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[860px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">ホーム</Link>
        </nav>

        <header className="mt-7">
          <p className="text-[13px] text-asagi">いまの状況から</p>
          <h1 className="mt-3 text-[28px] leading-[1.45] sm:text-[38px]" style={{ ...MINCHO, fontWeight: 700 }}>
            {s.label}
          </h1>
          <p className="mt-5 max-w-[34em] text-[15.5px] leading-[2.05] text-keshizumi">{INTRO[s.id]}</p>
          <p className="mt-5 border-t border-shironezu pt-4 text-[12.5px] tabular-nums text-ainezu">
            記事 {items.length}本
          </p>
        </header>

        <ul className="mt-10">
          {items.map((a) => {
            const d = publishedAt(a.slug);
            return (
              <li key={a.slug} className="border-b border-shironezu">
                <Link
                  href={`/areas/${a.areaId}/${a.slug}`}
                  className="group block py-7 transition-colors hover:text-asagi"
                >
                  <p className="flex items-baseline gap-3 text-[12.5px] text-ainezu">
                    <span className="text-asagi">{complexById(a.areaId)?.ja ?? ""}</span>
                    {d && <span className="tabular-nums">{formatDate(d)}</span>}
                  </p>
                  <h2
                    className="mt-2 max-w-[30em] text-[17px] leading-[1.7] sm:text-[19px]"
                    style={{ ...MINCHO, fontWeight: 700 }}
                  >
                    {a.title}
                  </h2>
                  <p className="mt-2.5 max-w-[38em] text-[14px] leading-[1.95] text-keshizumi">{a.lead}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        <section className="mt-16 border-t border-shironezu pt-10">
          <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
            ほかの状況から
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/situations/${o.id}`}
                  className="text-[14px] text-keshizumi underline decoration-shironezu underline-offset-[5px] transition-colors hover:text-asagi hover:decoration-asagi"
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[14px]">
            <Link
              href="/#index"
              className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
            >
              年代・分野からもさがす<span aria-hidden> →</span>
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
