import type { Metadata } from "next";
import Link from "next/link";
import { OPTIONS } from "@/lib/options";
import { areaLabel, type AreaId } from "@/lib/check";
import CheckCta from "@/components/check/CheckCta";
import { site } from "@/lib/site";

// 選択肢の入口。
// 記事は「なぜそうなるのか」、ここは「で、何を選ぶか」。役割を分けている。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const AREAS: AreaId[] = ["impression", "hair", "skin", "face", "body-hair", "mind"];
const url = `${site.url}/choices`;

export const metadata: Metadata = {
  title: "何を選ぶか — 費用・手間・向き不向きで並べる",
  description:
    "男性の見た目・体の改善について、買わずにできることから医療の領域まで、費用の目安・1日の手間・確かめるまでの期間・向いている人・まだ早い条件で並べています。おすすめの順ではありません。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "何を選ぶか",
    description: "おすすめの順ではなく、条件で並べた選択肢。",
  },
};

export default function ChoicesIndexPage() {
  const total = OPTIONS.length;
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "分野ごとの選択肢",
    numberOfItems: AREAS.length,
    itemListElement: AREAS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site.url}/choices/${a}`,
      name: `${areaLabel(a)}：何から選ぶか`,
    })),
  };

  return (
    <main className="bg-shironeri">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">ホーム</Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            何を選ぶか
          </h1>
          <p className="mt-5 text-[16px] leading-[2] text-keshizumi">
            記事は「なぜそうなるのか」を書く面です。ここは「で、何を選ぶか」を並べる面。
            全{total}件を、<span className="font-bold text-sumi">買わずにできることから順に</span>置き、
            同じ段階の中は安い順にしています。おすすめの順ではありません。
          </p>
          <p className="mt-4 text-[14px] leading-[1.9] text-ainezu">
            それぞれに「向いている人」と「まだ早い条件」を書いてあります。
            まだ早いものを外せるほうが、選ぶより先に効きます。
          </p>
        </header>

        <ul className="mt-10 grid gap-px border border-shironezu bg-shironezu sm:grid-cols-2">
          {AREAS.map((a) => {
            const n = OPTIONS.filter((o) => o.area === a).length;
            return (
              <li key={a} className="bg-shironeri">
                <Link
                  href={`/choices/${a}`}
                  className="group block px-5 py-6 transition-colors hover:bg-hakuji sm:px-6 sm:py-7"
                >
                  <div className="flex items-baseline gap-2.5">
                    <h2
                      className="text-[18px] leading-[1.5] transition-colors group-hover:text-asagi sm:text-[20px]"
                      style={{ ...MINCHO, fontWeight: 700 }}
                    >
                      {areaLabel(a)}
                    </h2>
                    <span className="text-[12px] tabular-nums text-ainezu">{n}件</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-[1.85] text-ainezu">
                    費用・手間・期間・向き不向きで並べる
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <CheckCta from="choices-index" className="mt-12" />

        <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
          ※ 費用は月あたりの目安の幅です。実額の調査はまだしていません。
          医療の領域については費用を書いておらず、推奨もしていません。
        </p>
      </div>
    </main>
  );
}
