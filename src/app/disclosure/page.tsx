import type { Metadata } from "next";
import Link from "next/link";
import { AD_CATEGORIES, hasSponsored } from "@/lib/monetization";
import { clusters } from "@/lib/clusters";
import { site } from "@/lib/site";

// 広告と収益の開示。
//
// 記事の中に成果報酬つきのリンクを置く以上、「どこから収入を得て、
// どこからは得ないのか」を一枚にまとめて置いておく必要がある。
// 自慢する面ではなく、確かめる面として書く。だから見出しは短く、
// 表を先に出して、理由はそのあとに一行ずつ添える。
//
// 組みはサイト共通（白練の地・明朝の見出し・罫線・カードなし）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/disclosure`;

export const metadata: Metadata = {
  title: "広告と収益について",
  description:
    "His Recoveries が記事内で紹介する物・サービスと、成果報酬（アフィリエイト）を受け取る区分・受け取らない区分を、カテゴリごとに開示しています。医療機関への送客に連動した報酬は受け取りません。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "広告と収益について",
    description:
      "受け取る区分と、受け取らない区分。掲載の順番は報酬額では決めていません。",
  },
};

// 表示のしかた。ここに書いたことは、記事側で自動的に守られるように組んである。
const HOW = [
  {
    t: "記事の頭に出す",
    d: "成果報酬つきのリンクが1つでも含まれる記事は、本文より先に見える位置で告知します。折りたたみや記事末には置きません。",
  },
  {
    t: "リンクの隣に出す",
    d: "途中から読み始めた方にも分かるよう、該当するリンクの横に「広告」と表示します。",
  },
  {
    t: "検索エンジンにも伝える",
    d: 'リンクには rel="sponsored" を付けています。',
  },
  {
    t: "順番を報酬で決めない",
    d: "並べる順は、価格の安い順・条件のゆるい順です。報酬額の高いものを上に置くことはしません。",
  },
];

const NOT = [
  "記事の内容を、広告主に決めてもらうこと",
  "効果や仕上がりを保証する書き方をすること",
  "使っていないものを、使ったように書くこと",
  "医療機関の受診に連動した報酬を受け取ること",
  "「今だけ」「残りわずか」のように、判断を急がせる書き方をすること",
];

export default function DisclosurePage() {
  // いま実際に成果報酬つきのリンクを載せているか。
  // 「受け取っています」と現在形で書いたまま1本も載っていないと、
  // 書いてあることと実態がずれる。データから引く形にして、
  // 掲載を始めた時点で文面が自動で切り替わるようにしておく。
  const live = clusters.some((a) => hasSponsored(a.sections));

  return (
    <main className="bg-shironeri">
      <div className="mx-auto max-w-reading px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            広告と収益について
          </h1>
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">
            His Recoveries は、記事の中で具体的な物やサービスを紹介することがあります。
            そのうちの一部は、リンクから購入・申し込みがあったときに、
            販売元から手数料を受け取る形（アフィリエイト）になります。
            どの区分で受け取り、どの区分では受け取らないかを、下に出しておきます。
          </p>
          {!live && (
            <p className="mt-4 border-l-2 border-asagi pl-4 text-[14.5px] leading-[1.95] text-keshizumi">
              <span className="font-bold text-sumi">
                現時点では、成果報酬つきのリンクは1本も掲載していません。
              </span>
              このページは、掲載を始める前に方針を先に出しておくためのものです。
              始めたときは、対象の記事の冒頭に告知が出ます。
            </p>
          )}
        </header>

        <section className="mt-14">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            受け取る区分と、受け取らない区分
          </h2>
          <div className="mt-6 overflow-x-auto border border-shironezu bg-hakuji">
            <table className="w-full min-w-[560px] border-collapse text-[14px]">
              <thead>
                <tr>
                  {["区分", "例", "成果報酬"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap border-b border-shironezu bg-shironeri px-4 py-3 text-left text-[12.5px] font-bold text-ainezu"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AD_CATEGORIES.map((c) => (
                  <tr key={c.id}>
                    <td className="border-b border-shironezu/70 px-4 py-3 font-bold leading-[1.8] text-sumi last:border-b-0">
                      {c.label}
                    </td>
                    <td className="border-b border-shironezu/70 px-4 py-3 leading-[1.8] text-keshizumi last:border-b-0">
                      {c.example}
                    </td>
                    <td className="whitespace-nowrap border-b border-shironezu/70 px-4 py-3 leading-[1.8] last:border-b-0">
                      <span className={c.paid ? "text-sumi" : "font-bold text-asagi"}>
                        {c.paid ? "受け取る" : "受け取らない"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-ainezu sm:hidden" aria-hidden>
            ← 横にスクロールできます
          </p>

          <dl className="mt-8 border-t border-shironezu">
            {AD_CATEGORIES.map((c) => (
              <div key={c.id} className="border-b border-shironezu py-4">
                <dt className="text-[14.5px] font-bold leading-[1.7]">{c.label}</dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.95] text-keshizumi">{c.reason}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            医療については、受け取りません
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            美容クリニック、AGA外来、医療脱毛、歯科——
            こうした医療機関について書くとき、受診に連動した報酬は一切受け取りません。
            医療機関の名前を出したうえで報酬を受け取ると、その記事は法令上の「医療広告」になり、
            自由診療の費用・リスク・副作用をすべて明示する義務がかかります。
            それは広告の仕事であって、比べるための記事の仕事ではありません。
            費用が発生しない形でしか、行かないという選択肢を並べて書くことはできない、と考えています。
          </p>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            同じ理由で、提携している専門家・施設からも、掲載料や成果報酬は受け取っていません。
            くわしくは
            <Link
              href="/partner"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              プロの方へ
            </Link>
            に書いています。
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            表示のしかた
          </h2>
          <dl className="mt-6 border-t border-shironezu">
            {HOW.map((x) => (
              <div key={x.t} className="border-b border-shironezu py-4">
                <dt className="text-[14.5px] font-bold leading-[1.7]">{x.t}</dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.95] text-keshizumi">{x.d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            しないこと
          </h2>
          <ul className="mt-5 border-t border-shironezu">
            {NOT.map((x) => (
              <li
                key={x}
                className="flex gap-3 border-b border-shironezu py-3 text-[15px] leading-[1.9] text-keshizumi"
              >
                <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-asagi" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
          <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            価格と在庫について
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.95] text-keshizumi">
            記事に書いた価格は、書いた時点のものです。販売元の都合で変わることも、
            取り扱いが終わることもあります。最終的な価格・仕様・在庫は、
            リンク先の販売元でご確認ください。購入の契約は販売元との間で成立し、
            商品そのものについての責任は販売元が負います。
          </p>
        </section>

        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            違うと思われたら
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            書いてあることと実際が違う、この書き方は広告に見える——
            そう思われた箇所があれば、お知らせください。確認して、直すか、直せない理由をお返しします。
          </p>
          <p className="mt-5 text-[15px]">
            <Link
              href="/apply"
              className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
            >
              連絡先はこちら
            </Link>
          </p>
        </section>

        <p className="mt-16 text-[13px] leading-[1.95] text-ainezu">
          このページは、景品表示法（いわゆるステルスマーケティング規制・2023年10月施行）と、
          医療法および医療広告ガイドラインを踏まえて書いています。
        </p>
      </div>
    </main>
  );
}
