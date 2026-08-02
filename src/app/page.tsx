import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import GlassNav from "@/components/GlassNav";
import ArticleIndex from "@/components/ArticleIndex";
import ArticleList from "@/components/ArticleList";
import { complexes } from "@/lib/complexes";
import { clusters } from "@/lib/clusters";
import { byNewest, formatDate, publishedAt } from "@/lib/articleDates";
import { SITUATIONS } from "@/lib/situations";
import { site } from "@/lib/site";

// ══════════════════════════════════════════════════════════════
// トップページ = 編集メディアの表紙。
//
// サービスLPではありません。順番は DESIGN.md「10. TOPページ」で固定：
//   Hero → 最新記事 → 特集 → カテゴリ → よく読まれている記事 →
//   His Recoveriesについて → ニュースレター → サービス → Footer
//
// やらないこと：
//   ・カードで囲まない（記事は地の上に、写真と文字を直接置く）
//   ・英語のセクション見出しを置かない
//   ・すべてのセクションを同じ余白にしない（話題の切れ目で1段広げる）
//   ・ヒーローに相談・診断のボタンを置かない（「記事を読む」だけ）
// ══════════════════════════════════════════════════════════════

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  alternates: { canonical: site.url },
};

export default function HomePage() {
  // 新しい記事。公開日（git の記録）で並べる。
  // 以前は手で選んだ7本を「新しい記事」として出していたが、
  // 記事に公開日が無かったので、実際には新しくないものが混ざっていた。
  const latest = byNewest(clusters).slice(0, 7);

  const [head, ...rest] = latest;
  const areaLabel = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";

  const popular = ["seiketsukan-tsukurikata", "aga-hiyou-kangae", "mens-makeup-hajimete", "fuke-mie-genin", "datsumou-hiyou-kangae"]
    .map((slug) => clusters.find((c) => c.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // トップは「表紙」であると同時に、全記事の索引でもある。
  // 検索エンジンとAI検索に、その両方を宣言しておく。
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/#collection`,
    url: site.url,
    name: `${site.name} — 男性ウェルネスメディア`,
    description: site.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    about: complexes.map((c) => ({ "@type": "Thing", name: c.ja })),
    mainEntity: {
      "@type": "ItemList",
      name: "記事の索引",
      numberOfItems: clusters.length,
      itemListElement: clusters.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <div className="bg-shironeri text-sumi">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <GlassNav />

      {/* ══════ 1画面目 ══════
          検索を右上のアイコンに移したので、ここは写真だけ。
          高さ（100svh）は ArticleIndex 側が持つ。ここで渡すのは中身だけ。

          ── 縦組みをやめた ─────────────────────────────
          縦書きの見出しは、実機で文字が重なった。原因は
          writing-mode + text-orientation がフォント側の縦組みメトリクスに
          依存することで、環境によって送り幅が壊れる。こちらの検証環境でも
          「自」「分」の送り幅が 0 になるのを実測している。
          直せる保証のない不具合を残すより、横組みにする。

          ── 文字を1箇所にまとめた ────────────────────────
          以前は右に縦組みの見出し、左下に説明と、離れた2箇所に文字があった。
          視線が割れるうえ、下端では説明とスクロール表示が重なっていた。
          左下に、見出し → 説明 の順で1つの塊にする。

          ── 動き ────────────────────────────────────
          写真がゆっくり寄り、見出しが左から現れる。
          prefers-reduced-motion のときは全部止まる（globals.css）。 */}
      <ArticleIndex
        list={<ArticleList />}
        hero={
          <>
            <div className="hr-kenburns absolute inset-0">
              <Image
                src="/media/hero/portrait.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-[46%_24%]"
              />
            </div>

            {/* 文字が乗る下half を落とす。写真の上半分（顔と光）は残す */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[62%]"
              style={{
                background:
                  "linear-gradient(to top, rgba(17,27,38,0.92) 0%, rgba(17,27,38,0.78) 28%, rgba(17,27,38,0.42) 60%, rgba(17,27,38,0) 100%)",
              }}
            />
            {/* 左からも少し。文頭の1〜2文字が明るい所に来ても沈まないように */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-[62%]"
              style={{
                background:
                  "linear-gradient(to right, rgba(17,27,38,0.42) 0%, rgba(17,27,38,0.12) 55%, rgba(17,27,38,0) 100%)",
              }}
            />

            {/* 見出しと説明を、左下に1つの塊として置く */}
            <div /* 右端はスクロール線のぶん空ける。文字とぶつからないように */
              className="absolute bottom-[68px] left-5 right-14 sm:bottom-[84px] sm:left-12 sm:right-24 lg:bottom-[96px] lg:left-16">
              <h1
                className="hr-wipe max-w-[15em] text-[clamp(30px,7.2vw,44px)] leading-[1.42] text-shironeri sm:text-[52px] lg:text-[64px] lg:leading-[1.34]"
                style={{ ...MINCHO, fontWeight: 700, textShadow: "0 2px 28px rgba(12,20,29,0.55)" }}
              >
                もっといい自分は、
                <br />
                つくれる。
              </h1>

              <p
                className="hr-rise mt-6 max-w-[34em] text-[14px] leading-[1.95] text-shironeri/90 sm:mt-8 sm:text-[16px] sm:leading-[2]"
                style={{ ["--d" as string]: "760ms" }}
              >
                髪、肌、眠り、疲れ、体、パートナーとのこと。
                <br />
                <span className="font-bold text-shironeri">実体験と、専門家への取材をもとに。</span>
              </p>
            </div>

            {/* スクロールしてよい、と分かるようにする。
                文字は左下にまとめたので、こちらは右下に置いて重ならないようにする。 */}
            <span
              aria-hidden
              className="hr-rise hr-scrollcue absolute bottom-7 right-6 sm:bottom-9 sm:right-10"
              style={{ ["--d" as string]: "1000ms" }}
            />
          </>
        }
      />

      {/* ══════ 最新記事 ══════ */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[96px] sm:pt-[136px] lg:pt-[184px]">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
          新しい記事
        </h2>

        {/* 1本目だけ大きく。以降は2列。同じ形を並べない。 */}
        {head && (
          <Link href={`/areas/${head.areaId}/${head.slug}`} className="group mt-10 block border-t border-shironezu pt-10">
            <p className="text-[13px] text-asagi">{areaLabel(head.areaId)}</p>
            <h3
              className="mt-2 max-w-[24em] text-[23px] sm:text-[30px] leading-[1.55] group-hover:text-asagi transition-colors"
              style={{ ...MINCHO, fontWeight: 700 }}
            >
              {head.title}
            </h3>
            <p className="mt-4 max-w-[36em] text-[15px] leading-[1.95] text-keshizumi">
              {head.lead}
            </p>
            {publishedAt(head.slug) && (
              <p className="mt-4 text-[13px] tabular-nums text-ainezu">{formatDate(publishedAt(head.slug)!)}</p>
            )}
          </Link>
        )}

        <ul className="mt-[48px] sm:mt-[72px] grid gap-x-10 gap-y-[48px] sm:gap-y-[72px] sm:grid-cols-2">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link href={`/areas/${a.areaId}/${a.slug}`} className="group block">
                <p className="flex items-baseline gap-3 text-[13px] text-asagi">
                  {areaLabel(a.areaId)}
                  {publishedAt(a.slug) && (
                    <span className="tabular-nums text-ainezu">{formatDate(publishedAt(a.slug)!)}</span>
                  )}
                </p>
                <h3
                  className="mt-1.5 text-[18px] leading-[1.65] group-hover:text-asagi transition-colors"
                  style={{ ...MINCHO, fontWeight: 700 }}
                >
                  {a.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.9] text-keshizumi line-clamp-2">
                  {a.lead}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-14">
          <a
            href="#index"
            className="inline-flex items-baseline gap-2 text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] hover:decoration-asagi transition-colors"
          >
            記事をすべて見る
            <span aria-hidden>→</span>
          </a>
        </p>
      </section>

      {/* ══════ よく読まれている記事 ══════ */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[72px] sm:pt-[104px] lg:pt-[136px]">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
          よく読まれている記事
        </h2>
        <ol className="mt-9 max-w-[42em] border-t border-shironezu">
          {popular.map((a, i) => (
            <li key={a.slug} className="border-b border-shironezu">
              <Link
                href={`/areas/${a.areaId}/${a.slug}`}
                className="group flex items-baseline gap-5 py-5 hover:text-asagi transition-colors"
              >
                <span className="w-[1.6em] shrink-0 text-[13px] tabular-nums text-ainezu">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-[15.5px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {a.title}
                  </span>
                  <span className="mt-1 block text-[12.5px] text-ainezu">{areaLabel(a.areaId)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-[12.5px] text-ainezu">
          ※ 閲覧数の集計は準備中です。いまは編集部が選んだ5本を出しています。
        </p>
      </section>

      {/* ══════ His Recoveriesについて — 編集方針もここに置く ══════
          別ページに分けていたが、読まれない場所に信頼の根拠を置いても意味がない。
          誰が・どういう立場で書いているかは、記事の索引と同じ画面に出す。 */}
      <section
        id="about"
        className="mt-[96px] sm:mt-[136px] lg:mt-[184px] scroll-mt-20 border-y border-shironezu bg-hakuji"
      >
        <div className="mx-auto max-w-[840px] px-5 sm:px-8 lg:px-12 py-[72px] sm:py-[104px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            His Recoveriesについて
          </h2>
          <div className="mt-7 max-w-[34em] space-y-6 text-[15px] sm:text-[16px] leading-[2.05] text-keshizumi">
            <p>
              男性向けの美容・健康・恋愛・セクシャルウェルネスを扱う編集メディアです。
              髪、肌、睡眠、疲れ、体、パートナーとのこと——誰にも相談できないまま
              検索していることを、記事にしています。
            </p>
            <p>
              調べても出てくるのは「やったほうがいい」ばかりで、順番も、やらなくていいことも
              書いてありません。ここでは、
              <span className="font-bold text-sumi">
                やらなくていいことは、やらなくていいと書きます。
              </span>
            </p>
          </div>

          {/* 編集方針。当たり前のことは書かない。守れないことも書かない。 */}
          <ul className="mt-9 max-w-[34em] space-y-2.5 text-[15px] leading-[1.95] text-keshizumi">
            <li>効果や結果は保証しません。医療的な判断は、医師の領域です。</li>
            <li>出典のある情報と、編集部が実際に確かめたことだけを書きます。</li>
          </ul>
          <p className="mt-8 max-w-[34em] text-[14px] leading-[1.95] text-ainezu">
            専門家への取材記事は、まだ0本です。記事の誤りは
            <a
              href={`mailto:${site.email}`}
              className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
            >
              {site.email}
            </a>
            までお知らせください。
          </p>
        </div>
      </section>

      {/* ══════ サービス — 最後。静かに ══════ */}
      <section className="border-t border-shironezu">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 py-[72px] sm:py-[104px]">
          <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
            サービス
          </h2>
          <p className="mt-4 max-w-[32em] text-[14px] leading-[1.95] text-keshizumi">
            記事はすべて無料で公開しています。読むだけで進む方もいます。
            一人だと止まってしまう場合だけ、こちらをご覧ください。
          </p>
          <div className="mt-9 max-w-[34em]">
            <h3 className="text-[16px]" style={{ ...MINCHO, fontWeight: 700 }}>
              第一印象改善プラン（30日）
            </h3>
            <p className="mt-2.5 text-[14px] leading-[1.95] text-keshizumi">
              眉・メイク・服選び・髪型の提案・撮影を1日で行い、手順の動画とサイズ表をお渡しします。
              東京都内・土日のみ。費用はご相談のうえで個別にお見積りします。
            </p>
            <p className="mt-4">
              <Link
                href="/plan"
                className="inline-flex items-baseline gap-2 text-[14px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] hover:decoration-asagi transition-colors"
              >
                詳しく見る
                <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ══════ Footer ══════ */}
      <footer className="border-t border-shironezu bg-hakuji">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-5">
            <div className="col-span-2">
              <p className="text-[12.5px] text-ainezu">分野</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px]">
                {complexes.map((c) => (
                  <li key={c.id}>
                    <Link href={`/areas/${c.id}`} className="hover:text-asagi transition-colors">
                      {c.ja}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12.5px] text-ainezu">状況からさがす</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {SITUATIONS.map((x) => (
                  <li key={x.id}>
                    <Link href={`/situations/${x.id}`} className="hover:text-asagi transition-colors">
                      {x.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12.5px] text-ainezu">読みもの</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li><a href="/#index" className="hover:text-asagi transition-colors">記事をさがす</a></li>
                <li>
                  <a
                    href="https://substack.com/@hisrecoveries"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-asagi transition-colors"
                  >
                    ニュースレター（Substack）<span aria-hidden className="text-ainezu"> ↗</span>
                  </a>
                </li>
                <li><a href="/feed.xml" className="hover:text-asagi transition-colors">RSS</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12.5px] text-ainezu">His Recoveries</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li><a href="#about" className="hover:text-asagi transition-colors">編集方針</a></li>
                <li><Link href="/partner" className="hover:text-asagi transition-colors">取材・掲載について</Link></li>
                <li><Link href="/plan" className="hover:text-asagi transition-colors">第一印象改善プラン</Link></li>
                <li><Link href="/privacy" className="hover:text-asagi transition-colors">プライバシー・免責事項</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-3 border-t border-shironezu pt-7 sm:flex-row sm:items-baseline sm:justify-between">
            <Link href="/" className="logo-type text-[19px]">
              His Recoveries
            </Link>
            <p className="text-[12.5px] text-ainezu">
              © 2026 His Recoveries — 男性の美容・健康・恋愛を、編集部が調べて書いています。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
