import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OPTIONS, TIER_LABEL, costLabel, type Option, type Tier } from "@/lib/options";
import { areaLabel, isAreaId, type AreaId } from "@/lib/check";
import { complexById } from "@/lib/complexes";
import { clustersByArea } from "@/lib/clusters";
import CheckCta from "@/components/check/CheckCta";
import { site } from "@/lib/site";

// 選択肢の判断情報を、クロールできる形で出す。
//
// ── なぜ作ったか ────────────────────────────────
// このサイトでいちばん判断情報が濃いのは、選択肢のデータ
// （やること・費用の目安・1日の手間・確かめるまでの週数・
// 向いている人・まだ早い条件）だった。
// ところがそれは診断の結果画面＝クライアント側にしか出ておらず、
// 検索エンジンにもAIにも1文字も見えていなかった。
//
// 「AIが回答するときに参照される」を目指すなら、まず見えないといけない。
// 記事は「原因」を説明する面、ここは「で、何を選ぶか」を並べる面。
// 役割を分けて、相互に行き来できるようにする。
//
// ── 順番を固定する ──────────────────────────────
// 並びは買わずにできる → 物を替える → 人に頼む → 医療の領域。
// 同じ段階の中は安い順。報酬額で並べ替える余地を実装上持たせない。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const AREAS: AreaId[] = ["impression", "hair", "skin", "face", "body-hair", "mind"];
const TIER_ORDER: Tier[] = ["self", "buy", "pro", "care"];

export function generateStaticParams() {
  return AREAS.map((area) => ({ area }));
}

function sorted(area: AreaId): Option[] {
  return OPTIONS.filter((o) => o.area === area).sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.costMin - b.costMin,
  );
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  if (!isAreaId(params.area)) return {};
  const label = areaLabel(params.area);
  const n = sorted(params.area).length;
  const title = `${label}：何から選ぶか — ${n}つの選択肢と、向き不向き`;
  const description = `${label}について、買わずにできることから医療の領域まで${n}つの選択肢を、費用の目安・1日の手間・確かめるまでの期間・向いている人・まだ早い条件で並べています。おすすめの順ではありません。`;
  const url = `${site.url}/choices/${params.area}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, siteName: site.name, locale: site.locale, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ChoicesAreaPage({ params }: { params: { area: string } }) {
  if (!isAreaId(params.area)) notFound();
  const area = params.area;
  const label = areaLabel(area);
  const list = sorted(area);
  const complex = complexById(area);
  const articles = clustersByArea(area).slice(0, 4);
  const url = `${site.url}/choices/${area}`;

  // AI検索に抜き出させたいのは、順位ではなく「条件つきの選択肢」そのもの。
  // ItemList に費用と向き不向きまで入れておく。
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${label}の選択肢`,
    numberOfItems: list.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: list.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.label,
      description: `${o.what} 向いているのは${o.fitsWhen}。${o.notYet ? `まだ早いのは${o.notYet}。` : ""}費用の目安は${costLabel(o)}、確かめるまで約${o.weeks}週。`,
    })),
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${label}：何から選ぶか`,
    description: `${label}の選択肢を、費用・手間・期間・向き不向きで並べたもの。おすすめの順ではありません。`,
    inLanguage: "ja",
    isAccessibleForFree: true,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    about: label,
    author: { "@type": "Organization", name: site.name, url: site.url },
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
  };
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "選択肢", item: `${site.url}/choices` },
      { "@type": "ListItem", position: 3, name: label, item: url },
    ],
  };

  return (
    <main className="bg-shironeri">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />

      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">ホーム</Link>
          <span className="mx-1.5" aria-hidden>/</span>
          <Link href="/choices" className="transition-colors hover:text-asagi">選択肢</Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            {label}：何から選ぶか
          </h1>
          <p className="mt-5 text-[16px] leading-[2] text-keshizumi">
            {list.length}つ並べています。
            <span className="font-bold text-sumi">おすすめの順ではありません。</span>
            買わずにできることから順に置き、同じ段階の中は安い順です。
            費用の目安・1日の手間・確かめるまでの期間・向いている人・まだ早い条件を、それぞれに書いてあります。
          </p>
          {complex && (
            <p className="mt-4 text-[14px] leading-[1.9] text-ainezu">
              なぜそうなるのか（仕組み）は
              <Link
                href={`/areas/${area}`}
                className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
              >
                {complex.ja}の解説
              </Link>
              にあります。ここは「で、何を選ぶか」の面です。
            </p>
          )}
        </header>

        {/* 一覧表。AI検索がいちばん抜き出しやすい形なので、表にできるものは表にする */}
        <div className="mt-10 overflow-x-auto border border-shironezu bg-hakuji">
          <table className="w-full min-w-[720px] border-collapse text-[13.5px]">
            <caption className="sr-only">
              {label}の選択肢と、費用・手間・期間・向き不向きの一覧
            </caption>
            <thead>
              <tr>
                {["やること", "段階", "費用の目安", "1日の手間", "確かめるまで"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap border-b border-shironezu bg-shironeri px-4 py-3 text-left text-[12px] font-bold text-ainezu"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td className="border-b border-shironezu/70 px-4 py-3 font-bold leading-[1.75] text-sumi last:border-b-0">
                    {o.label}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 text-ainezu last:border-b-0">
                    {TIER_LABEL[o.tier]}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 tabular-nums text-keshizumi last:border-b-0">
                    {costLabel(o)}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 tabular-nums text-keshizumi last:border-b-0">
                    {o.tier === "care" ? "—" : o.minutesPerDay === 0 ? "なし" : `${o.minutesPerDay}分`}
                  </td>
                  <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 tabular-nums text-keshizumi last:border-b-0">
                    約{o.weeks}週
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11.5px] text-ainezu sm:hidden" aria-hidden>← 横にスクロールできます</p>
        <p className="mt-3 text-[12.5px] leading-[1.85] text-ainezu">
          費用は月あたりの目安の幅です。実額の調査はまだしていないため、幅で書いています。
          医療の領域については、費用を書いていません。
        </p>

        {/* 1つずつの詳細。向き不向きが本体なので、表より下に厚く置く */}
        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            それぞれ、誰に向いているか
          </h2>
          <div className="mt-7 flex flex-col gap-9">
            {list.map((o) => (
              <div key={o.id} id={o.id} className="scroll-mt-20 border-l-2 border-asagi pl-5 sm:pl-6">
                <p className="text-[12px] text-asagi">{TIER_LABEL[o.tier]}</p>
                <h3 className="mt-1.5 text-[17px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                  {o.label}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.95] text-keshizumi">{o.what}</p>
                <dl className="mt-4 border-t border-shironezu text-[14px]">
                  <div className="flex gap-4 border-b border-shironezu py-2.5">
                    <dt className="w-[7em] shrink-0 text-ainezu">向いている</dt>
                    <dd className="leading-[1.85] text-keshizumi">{o.fitsWhen}</dd>
                  </div>
                  {o.notYet && (
                    <div className="flex gap-4 border-b border-shironezu py-2.5">
                      <dt className="w-[7em] shrink-0 text-ainezu">まだ早い</dt>
                      <dd className="leading-[1.85] text-keshizumi">{o.notYet}</dd>
                    </div>
                  )}
                  <div className="flex gap-4 border-b border-shironezu py-2.5">
                    <dt className="w-[7em] shrink-0 text-ainezu">費用の目安</dt>
                    <dd className="tabular-nums leading-[1.85] text-keshizumi">{costLabel(o)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <CheckCta from={`choices:${area}`} className="mt-14" />

        {articles.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
              仕組みから知りたいとき
            </h2>
            <ul className="mt-5 border-t border-shironezu">
              {articles.map((a) => (
                <li key={a.slug} className="border-b border-shironezu">
                  <Link
                    href={`/areas/${a.areaId}/${a.slug}`}
                    className="block py-4 text-[15.5px] leading-[1.7] transition-colors hover:text-asagi"
                    style={{ ...MINCHO, fontWeight: 700 }}
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
          ※ このページは選択肢を並べたものです。効果や結果を示すものではなく、
          特定の商品・施術・医療機関を推奨するものでもありません。
          「いまはやらない」も同じだけ正当な選択です。個別の判断は専門家にご相談ください。
        </p>
      </div>
    </main>
  );
}
