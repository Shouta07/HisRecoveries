import type { Metadata } from "next";
import Link from "next/link";
import { AD_CATEGORIES, hasSponsored } from "@/lib/monetization";
import { HAS_MEDICAL_CLIENTS, assertNoClientInArticles } from "@/lib/medicalClients";
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
    t: "順番も、勧め方も、報酬で決めない",
    d: "並べる順は、価格の安い順・条件のゆるい順です。報酬額の高いものを上に置くことはしません。報酬があるかどうかで、勧め方の強さを変えることもしません。この並び順は、実装の側で固定してあります（報酬額はそもそも並べ替えの材料として持っていません）。",
  },
  {
    t: "煽る言い回しを、書けなくしてある",
    d: "「今だけ」「残りわずか」「お得」「キャンペーン」などの語が原稿に入ると、公開の前に自動で止まります。方針として書くだけだと、締切に追われたときに1回通り、その1回が前例になるためです。",
  },
];

// 送客をするための条件。
//
// 「本当に推奨できる相手にだけ送る」は、書いただけでは何も担保しない。
// 何を確かめたら推奨できるのか、その中身を先に固定して出しておく。
// いまは満たした相手が0件なので、送客もしていない。そこも書く。
const PARTNER_RULES = [
  {
    t: "編集部が、実際に会って聞いていること",
    d: "資料と公開情報だけで載せることはしません。聞いていないところは、聞いていないので載せられません。",
  },
  {
    t: "総額と、やめ方が、先に確認できること",
    d: "月額だけでなく総額。途中でやめるときにいくら残るか。この2つが事前に書面で分かることを条件にします。",
  },
  {
    t: "「合わない人」を、先方自身が言えること",
    d: "全員に向いていると答えるところは、載せません。誰に向いていないかを言える相手だけを扱います。",
  },
  {
    t: "報酬が、掲載の可否と順番に影響しないこと",
    d: "報酬の条件は、載せるかどうかを決めたあとで詰めます。金額が理由で載せることも、外すこともしません。",
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
  // 受託した医療機関が記事に出ていないかを、公開の前に確かめる。
  // 出ていたら、いただいている制作費が実質的にご紹介の対価になる。
  assertNoClientInArticles();

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
          {/* もとは「提携している専門家・施設からも、掲載料や成果報酬は受け取っていません」。
              主語が広すぎて、同じページの「送客するかどうかの基準」と食い違っていた。
              医療に限定する。医療以外をどうするかは、下の節で状態として書く。 */}
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            同じ理由で、医療機関および医師・歯科医師からは、掲載料も成果報酬も受け取りません。
          </p>

          {/* 受け取らないものと、受け取るものを、同じ場所で分けて書く。
              別のページに散らすと、読む側は片方しか見ない。 */}
          <h3 className="mt-10 text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            では、医療機関から一切お金を受け取らないのか
          </h3>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            そうではありません。受け取らないのは
            <span className="font-bold text-sumi">患者さまのご紹介に連動した報酬</span>
            です。医療機関ご自身の発信——自院サイトの記事や、患者さま向けの説明資料の制作——は、
            運営元のバイタリティデザインが受託することがあります。
            料金は制作物に対するもので、患者さまの人数とは連動しないので、ご紹介の対価にはあたりません。
          </p>
          <p className="mt-4 border-l-2 border-asagi pl-4 text-[14.5px] leading-[1.95] text-keshizumi">
            <span className="font-bold text-sumi">
              制作を受託した医療機関を、このサイトの記事で扱うことはしません。
            </span>
            扱えば、いただいている制作費が、結局ご紹介の対価と同じものになるからです。
            これは心がけではなく、記事に受託先の名前が出たらサイトを公開できない仕組みにしてあります。
            {!HAS_MEDICAL_CLIENTS && "現時点で、制作を受託している医療機関は0件です。"}
          </p>
          <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">
            提携の条件は
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
            送客するかどうかの基準
          </h2>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            物を紹介するのと、人を送るのは、別の話として扱います。
            提携先を紹介して手数料を受け取る形をとる場合、次の4つを満たした相手にだけ送ります。
          </p>
          <dl className="mt-6 border-t border-shironezu">
            {PARTNER_RULES.map((x) => (
              <div key={x.t} className="border-b border-shironezu py-4">
                <dt className="text-[14.5px] font-bold leading-[1.7]">{x.t}</dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.95] text-keshizumi">{x.d}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-l-2 border-asagi pl-4 text-[14.5px] leading-[1.95] text-keshizumi">
            <span className="font-bold text-sumi">
              この4つを確かめられた提携先は、現時点で0件です。だから、いまは送客をしていません。
            </span>
            1件目ができたときは、どこを・どうやって確かめたのかを、このページに足します。
            確かめていないことを「確かめた」と書くくらいなら、送客をしません。
          </p>
          {/* 受け取り方の中身。ここを書かないと、基準だけがきれいごとになる。 */}
          <h3 className="mt-10 text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            いくら、どう受け取るか
          </h3>
          <ul className="mt-4 space-y-2.5 text-[15px] leading-[1.95] text-keshizumi">
            <li>掲載料・初期費用・月額は、どの提携先からも受け取りません。</li>
            <li>
              医療以外の事業者（サロン、ジムなど）からは、お客さまが実際にご利用になったときだけ手数料をいただきます。
            </li>
            <li>
              <span className="font-bold text-sumi">料率は分野ごとに一律で、相手によって変えません。</span>
              相手ごとに料率が違うと、「順番を報酬額で決めない」が、守る意志の問題になってしまいます。
              一律なら、金額で順番を動かす動機がそもそも発生しません。
            </li>
            <li>医療機関からは、掲載料も紹介料も受け取りません（上記のとおり）。</li>
          </ul>
          <p className="mt-6 border-l-2 border-asagi pl-4 text-[14.5px] leading-[1.95] text-keshizumi">
            <span className="font-bold text-sumi">
              現時点で受け取った手数料は0円です。条件を満たした提携先が0件だからです。
            </span>
            提携先にお伝えしている条件は
            <Link
              href="/partner"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              取材・掲載について
            </Link>
            に、この方針をいつ変えたかは
            <Link
              href="/updates"
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
            >
              更新記録
            </Link>
            に書いています。
          </p>
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
