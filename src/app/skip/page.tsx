import type { Metadata } from "next";
import Link from "next/link";
import { AVOID, skipByArea, notYetOptions } from "@/lib/skip";
import { complexById } from "@/lib/complexes";
import { site, ogImage } from "@/lib/site";

// 「やらなくていいこと」。
//
// ── 入口としての役割 ────────────────────────────
// 薄毛も肌も体毛も、調べ始めた時点ですでに「やることが多すぎる」。
// そこへさらに足すページは山ほどあるが、減らすページはほとんどない。
//
// このページは、読む側に告白をさせない。
// 「自分は薄毛だ」と認めなくても開けるし、人に渡すこともできる。
// この領域で、恥を伴わずに読める数少ない形。
//
// ── 中身は全部、既にあるデータ ────────────────────
// 手で書き足していない。診断が出す「まだ早い理由」、
// 選択肢が持っている「まだ早い条件」、順番の記事の「やらないほうがいいこと」。
// 3か所に散らばっていたものを、1枚に集めただけ。
// だから診断や選択肢を変えれば、このページも一緒に変わる。
//
// 組みはサイト共通（白練の地・明朝の見出し・罫線・カードなし）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/skip`;
const TITLE = "やらなくていいこと";
const DESC =
  "男性の見た目・体の改善で、いまはやらなくていいこと、まだ早いこと、やらないほうがいいことを並べています。売っていないので、やらなくていいと書けます。効果の保証はしません。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["やらなくていい", "何もしない", "まだ早い", "男 見た目 優先順位", "無駄", "やめていい"],
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: site.name,
    locale: site.locale,
    title: `${TITLE} — 男の改善で、減らしていいもの`,
    description: "いまはやらなくていいこと、まだ早いこと、やらないほうがいいこと。",
    images: [ogImage],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function SkipPage() {
  const areas = skipByArea();
  const notYet = notYetOptions();

  // 分野ごとにまとめる。ばらばらに並べると、自分に関係ある行を探せない
  const byArea = areas.map((a) => ({
    ...a,
    items: notYet.filter((n) => n.area === a.area),
  }));

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: TITLE,
    description: DESC,
    inLanguage: "ja",
    isAccessibleForFree: true,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: site.name, url: site.url },
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
  };

  return (
    <main className="bg-shironeri">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="mx-auto max-w-reading px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[27px] leading-[1.48] sm:text-[36px]" style={{ ...MINCHO, fontWeight: 700 }}>
            やらなくていいこと
          </h1>
          <p className="mt-5 text-[16px] leading-[2.05] text-keshizumi">
            調べると、やることばかりが増えます。どれも「やったほうがいい」と書いてあるからです。
            ここには逆を置きます。
            <span className="font-bold text-sumi">いまはやらなくていいこと、まだ早いこと、やらないほうがいいこと。</span>
          </p>
          <p className="mt-4 text-[16px] leading-[2.05] text-keshizumi">
            減らしたぶんだけ、残ったものが続きます。
          </p>
        </header>

        {/* ── 1. 気にしていないなら、やらなくていい ── */}
        <section className="mt-14">
          <h2 className="text-[21px] leading-[1.5] sm:text-[25px]" style={{ ...MINCHO, fontWeight: 700 }}>
            気にしていないなら、やらなくていい
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2] text-keshizumi">
            6つの分野それぞれについて、手をつけなくていい条件を書いておきます。
            当てはまるなら、その分野はいま考えなくて構いません。
          </p>
          <dl className="mt-7 border-t border-shironezu">
            {byArea.map((a) => (
              <div key={a.area} className="border-b border-shironezu py-5">
                <dt className="flex items-baseline gap-3">
                  <span className="text-[16.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {a.label}
                  </span>
                  <span className="text-[12px] text-ainezu">{complexById(a.area)?.system}</span>
                </dt>
                <dd className="mt-2 text-[15px] leading-[1.95] text-keshizumi">{a.reason}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── 2. 順番として、まだ早いもの ── */}
        <section className="mt-16">
          <h2 className="text-[21px] leading-[1.5] sm:text-[25px]" style={{ ...MINCHO, fontWeight: 700 }}>
            まだ早いもの
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2] text-keshizumi">
            やること自体は正しくても、順番として早すぎるものがあります。
            先に済ませていないことがあると、やっても効いたかどうかが分かりません。
          </p>
          <ul className="mt-7 border-t border-shironezu">
            {notYet.map((n) => (
              <li key={n.id} className="border-b border-shironezu py-5">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[12px] text-asagi">{complexById(n.area)?.ja}</span>
                  <span className="text-[12px] text-ainezu">{n.tier}</span>
                </p>
                <p className="mt-1.5 text-[16px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 700 }}>
                  {n.label}
                </p>
                <p className="mt-2 text-[14.5px] leading-[1.95] text-keshizumi">
                  <span className="text-ainezu">まだ早い条件：</span>
                  {n.notYet}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. やらないほうがいいこと ── */}
        <section className="mt-16">
          <h2 className="text-[21px] leading-[1.5] sm:text-[25px]" style={{ ...MINCHO, fontWeight: 700 }}>
            やらないほうがいいこと
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2] text-keshizumi">
            これは順番の問題ではなく、やると遠回りになるものです。
          </p>
          <ul className="mt-7 border-t border-shironezu">
            {AVOID.map((x) => (
              <li key={x.t} className="border-b border-shironezu py-5">
                <p className="text-[16.5px] leading-[1.65]" style={{ ...MINCHO, fontWeight: 700 }}>
                  {x.t}
                </p>
                <p className="mt-2 text-[15px] leading-[1.95] text-keshizumi">{x.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── なぜこれを書けるか ── */}
        <section className="mt-16 border-l-2 border-asagi pl-5 sm:pl-6">
          <h2 className="text-[17px] sm:text-[18px]" style={{ ...MINCHO, fontWeight: 700 }}>
            なぜ、やらなくていいと書けるのか
          </h2>
          <p className="mt-3 text-[15px] leading-[1.95] text-keshizumi">
            売っている側は、やらなくていいとは書けません。書けば、その分だけ売れなくなるからです。
            ここが書けるのは、
            <span className="font-bold text-sumi">掲載の順番を報酬額で決めていないから</span>
            です。何をどう受け取っているかは
            <Link
              href="/disclosure"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              広告と収益について
            </Link>
            に全部書いてあります。
          </p>
        </section>

        {/* ── 出口 ── */}
        <section className="mt-14 border-t border-shironezu pt-10">
          <p className="text-[16px] leading-[2.05] text-keshizumi">
            減らしたあとに、何が残るか。
            <span className="font-bold text-sumi">やることは、たいてい3つより少なくなります。</span>
          </p>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <Link
              href="/check"
              className="text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
            >
              自分の場合を出す（5問・30秒）
              <span aria-hidden> →</span>
            </Link>
            <Link
              href="/order"
              className="text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
            >
              全部の順番を読む
              <span aria-hidden> →</span>
            </Link>
          </p>
        </section>

        <p className="mt-14 text-[13px] leading-[1.95] text-ainezu">
          ※ ここに書いてあるのは、手をつける順番の話です。効果や結果を保証するものではありません。
          気になる症状がある場合は、順番に関係なく医療機関にご相談ください。
        </p>
      </article>
    </main>
  );
}
