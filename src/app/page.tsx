import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import GlassNav from "@/components/GlassNav";
import HomeHero from "@/components/HomeHero";
import ArticleResults from "@/components/ArticleResults";
import ArticleList from "@/components/ArticleList";
import { complexes } from "@/lib/complexes";
import { clusters } from "@/lib/clusters";
import { byNewest, formatDate, publishedAt } from "@/lib/articleDates";
import { readingMinutes } from "@/lib/reading";
import { SITUATIONS } from "@/lib/situations";
import { site } from "@/lib/site";
import HeroStart from "@/components/check/HeroStart";
import WhyStuck from "@/components/home/WhyStuck";

// ══════════════════════════════════════════════════════════════
// トップページ = 編集メディアの表紙。
//
// サービスLPではありません。順番:
//   Hero（感情 + 診断の1問目）→ なぜ変われないのか → やることは3つ →
//   新しい記事 → よく読まれている → 全部の順番 → 分野から →
//   His Recoveriesについて → 記事をさがす（全件索引）→ サービス → Footer
//
// ── ヒーローを感情から始める ─────────────────────
// 「男の改善は、順番で決まる。」は主張としては強いが、
// 読み手が自分の話だと気づくまでに一拍かかる。
// 「変わりたい。でも、何からやればいいか分からない。」は
// 読み手の内心そのものなので、自己同定が速い。
// 主張のほうは、ナビの肩書きに残してある。
//
// ── 全件索引を最後に落とした ────────────────────────
// 以前は Hero の直後に「記事 全55本」の索引があり、編集が選んだ
// 「新しい記事」「よく読まれている記事」はそのはるか下にあった。
// 表紙をめくった最初の面が目次だと、ページは「探す画面」になる。
// 探しに来た人は下まで行くか検索を使うので、索引は下でいい。
//
// やらないこと：
//   ・カードで囲まない（記事は地の上に、写真と文字を直接置く）
//   ・英語のセクション見出しを置かない
//   ・すべてのセクションを同じ余白にしない（話題の切れ目で1段広げる）
//   ・ヒーローの中にボタンを置かない（写真と見出しだけ）
//
// 診断はヒーローの直後、記事より先に置く。
// 以前は「診断の導線を置かない」と決めていたが、それは読み物としての
// 純度を守るための判断だった。読者に現在地を渡すほうを優先する。
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
    name: `${site.name} — ${site.tagline}`,
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
          高さ（100svh）は HomeHero が持つ。ここで渡すのは中身だけ。

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
      {/* ══════ 1画面目 ══════
          写真だけの1画面をやめ、写真＋入口の帯にした。

          ── なぜ ────────────────────────────────
          実測したら、ファーストビューの中に押せるものが1つもなかった。
          訪問→診断のモデルで、最初の画面に行き先がないのは致命的。

          ── なぜ「診断する」ボタンではないのか ──────────
          ボタンは「これから何かが始まる」という約束にすぎない。
          1問目そのものを置けば、押した時点でもう始まっている。
          しかも6つの選択肢が並ぶこと自体が「誰向けのサイトか」を
          1秒で答えるので、説明のコピーがいらなくなる。

          ── コピーから外したもの ─────────────────
          「実体験と、専門家への取材をもとに。」を下ろした。
          取材はまだ0本で、同じページの下の方で自分からそう書いている。
          言えるようになってから、また置く。

          ── 動き ────────────────────────────────
          写真がゆっくり寄り、見出しが左から現れ、選択肢が1つずつ立ち上がる。
          prefers-reduced-motion のときは全部止まる（globals.css）。 */}
      <HomeHero
        photo={
          <>
            <div className="hr-kenburns absolute inset-0">
              <Image
                src="/media/hero/portrait.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover object-[54%_14%] lg:object-[46%_26%]"
              />
            </div>
            {/* 狭い画面では、写真の下端と白練の地の境目を少しだけ和らげる。
                文字を重ねないので、覆いはここだけで足りる。 */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[22%] lg:hidden"
              style={{
                background:
                  "linear-gradient(to top, rgba(241,243,243,0.55) 0%, rgba(241,243,243,0) 100%)",
              }}
            />
          </>
        }
        content={
          <>
            <h1
              className="hr-wipe text-[clamp(26px,6.4vw,34px)] leading-[1.42] text-sumi sm:text-[38px] lg:text-[clamp(34px,3.2vw,46px)] lg:leading-[1.36]"
              style={{ ...MINCHO, fontWeight: 700 }}
            >
              変わりたい。でも、
              <br />
              何からやればいいか
              <br />
              分からない。
            </h1>

            <p
              className="hr-rise mt-5 text-[14.5px] leading-[1.95] text-keshizumi sm:mt-6 sm:text-[16px] sm:leading-[2]"
              style={{ ["--d" as string]: "700ms" }}
            >
              見た目、体調、清潔感。
              <span className="whitespace-nowrap">あなたに必要な改善の順番を、整理します。</span>
            </p>

            <div className="mt-7 sm:mt-8">
              <HeroStart />
            </div>

            {/* 立場の但し書き。
                コピーの上（見出しのすぐ下）ではなく、選択肢の下に置く。
                狭い画面では1画面目の高さが写真＋文字で埋まっているので、
                上に3行足すと入口が画面の外に出る。実測して、ここにした。 */}
            <p
              className="hr-rise mt-6 max-w-[30em] text-[12.5px] leading-[1.9] text-ainezu sm:mt-7 sm:text-[13px]"
              style={{ ["--d" as string]: "1300ms" }}
            >
              順番は、公開されている情報と編集部の判断で組んだ暫定版です。
              これから男性本人・女性・専門家に聞いて、書き換えていきます。
            </p>

            {/* 下に続きがあることの手がかり。
                狭い画面は文字が下にあるので自然にスクロールするが、
                広い画面は左右分割で、1画面目の下端が読み終わりに見える。
                lg 以上でだけ出す。 */}
            <span
              aria-hidden
              className="hr-rise hr-scrollcue mt-12 hidden lg:block"
              style={{ ["--d" as string]: "1500ms" }}
            />
          </>
        }
      />

      {/* ══════ なぜ変われないのか / やることは3つ ══════
          記事一覧より先に、このサイトが何を渡すのかを説明する面を置く。
          ヒーローの次が記事だと、読む場所にしか見えない。 */}
      <div className="mt-[72px] sm:mt-[104px] lg:mt-[136px]">
        <WhyStuck />
      </div>

      {/* ══════ 新しい記事 ══════ */}
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
            {/* 導入文ではなく、要点の1本目を出す。
                リードは「これから説明します」で終わるので、一覧では引きが弱い。
                要点は結論なので、読む前に持ち帰るものが1つ決まる。 */}
            <p className="mt-4 max-w-[36em] text-[16px] leading-[2] text-keshizumi">
              {head.summary[0] ?? head.lead}
            </p>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-4 text-[12.5px] text-ainezu">
              {publishedAt(head.slug) && (
                <span className="tabular-nums">{formatDate(publishedAt(head.slug)!)}</span>
              )}
              <span className="tabular-nums">読了 約{readingMinutes(head)}分</span>
            </p>
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
                <p className="mt-2.5 text-[14.5px] leading-[1.95] text-keshizumi line-clamp-3">
                  {a.summary[0] ?? a.lead}
                </p>
                <p className="mt-2.5 text-[12px] tabular-nums text-ainezu">読了 約{readingMinutes(a)}分</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-14">
          <a
            href="#index"
            className="inline-flex items-baseline gap-2 text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] hover:decoration-asagi transition-colors"
          >
            55本すべてから探す
            <span aria-hidden>↓</span>
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

      {/* ══════ 全部の順番 ══════
          サイトの最上位に置く一本。分野の一覧より先に、
          「どれが何番目か」を渡す面があると伝わる。 */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[72px] sm:pt-[104px] lg:pt-[136px]">
        <Link
          href="/order"
          className="group block border border-shironezu bg-hakuji px-5 py-7 transition-colors hover:bg-shironeri sm:px-7 sm:py-8"
        >
          <p className="text-[13px] text-asagi">まず1本だけ読むなら</p>
          <h2
            className="mt-2.5 text-[21px] leading-[1.55] transition-colors group-hover:text-asagi sm:text-[25px]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            男の改善、全部の順番
          </h2>
          <p className="mt-3 max-w-[38em] text-[15px] leading-[1.95] text-keshizumi">
            {clusters.length}本すべてを、順番の上に並べ直した一本です。
            減点をなくす → 進むものだけ早く知る → 続けるものを絞る → 内側を触る。
            いまはやらなくていいことも書いています。
          </p>
          <span className="mt-4 inline-block text-[14px] font-bold text-asagi">
            読む<span aria-hidden> →</span>
          </span>
        </Link>
      </section>

      {/* ══════ 分野から ══════
          文字ばかりの縦の流れに、大きさの違う塊をひとつ挟む。
          6つしかないので、一覧ではなく面として置ける。
          記事の本数は実数（数合わせで作らないので、少ない分野は少ないまま出す）。 */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[72px] sm:pt-[104px] lg:pt-[136px]">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
          分野から
        </h2>
        {/* モバイルでも2列。1列にすると縦長のタイルが6つ並ぶだけで、
            結局「スクロールするだけ」の面が1つ増える。 */}
        <ul className="mt-9 grid grid-cols-2 gap-px border border-shironezu bg-shironezu lg:grid-cols-3">
          {complexes.map((c) => {
            const n = clusters.filter((a) => a.areaId === c.id).length;
            return (
              <li key={c.id} className="bg-shironeri">
                {/* タイル全体がリンクなので「この分野を見る →」は置かない。
                    6回繰り返すと、読むものではなく飾りになる。 */}
                <Link
                  href={`/areas/${c.id}`}
                  className="group flex h-full flex-col px-4 py-5 transition-colors hover:bg-hakuji sm:px-6 sm:py-7"
                >
                  <div className="flex items-baseline gap-2.5">
                    <h3
                      className="text-[17px] leading-[1.45] transition-colors group-hover:text-asagi sm:text-[21px]"
                      style={{ ...MINCHO, fontWeight: 700 }}
                    >
                      {c.ja}
                    </h3>
                    <span className="text-[12px] tabular-nums text-ainezu">{n}</span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-[1.8] text-ainezu sm:text-[13.5px]">
                    {c.system}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
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
              男性の見た目、体、関係についての改善を、順番として編集しているところです。
              髪、肌、睡眠、疲れ、体、パートナーとのこと——誰にも相談できないまま
              検索していることを扱っています。
            </p>
            <p>
              調べても出てくるのは「やったほうがいい」ばかりで、順番も、やらなくていいことも
              書いてありません。ここでは、
              <span className="font-bold text-sumi">
                やらなくていいことは、やらなくていいと書きます。
              </span>
              何を先にやって、何を後回しにしていいのかを決められる状態にするのが、仕事です。
            </p>
            <p>
              いまの順番は、公開されている情報と編集部の判断で組んだ暫定版です。
              取材はこれからです。男性本人、女性、専門家に聞いて、分かったことから順に
              書き足していきます。順番が変わったら、変わった記録も残します。
            </p>
          </div>

          {/* 編集方針。当たり前のことは書かない。守れないことも書かない。
              「聞いていないことは聞いていないと書く」を先頭に置いた。
              取材0本の状態で信頼を主張できる根拠は、いまはこれしかない。 */}
          <ul className="mt-9 max-w-[34em] space-y-2.5 text-[15px] leading-[1.95] text-keshizumi">
            <li>聞いていないことは、聞いていないと書きます。</li>
            <li>「やったほうがいい」を全部は並べません。いまはやらなくていいものは、そう書きます。</li>
            {/* 約束だけ書いて置き場所が無いと、確かめようがない。
                記録そのものへリンクする。 */}
            <li>
              順番が変わったら、変わった記録を残します（
              <Link
                href="/updates"
                className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] hover:decoration-asagi"
              >
                更新記録
              </Link>
              ）。
            </li>
            <li>効果や結果は保証しません。医療的な判断は、医師の領域です。</li>
            <li>掲載の順番を、報酬額で決めません。</li>
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

      {/* ══════ 記事をさがす（全件索引）══════
          ここまでで読むものが決まらなかった人のための面。先頭には置かない。 */}
      <ArticleResults list={<ArticleList />} />

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
                <li><Link href="/updates" className="hover:text-asagi transition-colors">更新記録</Link></li>
                <li><Link href="/disclosure" className="hover:text-asagi transition-colors">広告と収益について</Link></li>
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
