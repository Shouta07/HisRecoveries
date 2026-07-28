import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import ArticleIndex from "@/components/ArticleIndex";
import { complexes } from "@/lib/complexes";
import { clusters, clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";

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

export default function HomePage() {
  // 最新記事。編集の順で並べる（自動レコメンドを作らない）。
  const latest = [
    "30dai-seiketsukan",
    "aga-early-signs",
    "otona-nikibi-genin",
    "fuke-mie-genin",
    "sleep-totonoe",
    "mens-hairstyle-seiketsukan",
    "kekkonshiki-mijitaku-men",
  ]
    .map((slug) => clusters.find((c) => c.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  const [head, ...rest] = latest;
  const areaLabel = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";

  const popular = ["seiketsukan-tsukurikata", "aga-hiyou-kangae", "mens-makeup-hajimete", "fuke-mie-genin", "datsumou-hiyou-kangae"]
    .map((slug) => clusters.find((c) => c.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="bg-kinari text-sumi">
      <GlassNav />

      {/* ══════ Hero — 何のメディアかを説明するだけ ══════ */}
      <header className="border-b border-shironezu">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 xl:px-16 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-44 lg:pb-36">
          <h1
            className="max-w-[20em] text-[27px] sm:text-[33px] lg:text-[38px] leading-[1.5]"
            style={{ ...MINCHO, fontWeight: 600 }}
          >
            男性の美容・健康・恋愛を、
            <br />
            編集部が調べて書いています。
          </h1>
          <p className="mt-8 max-w-[34em] text-[15px] sm:text-[16px] leading-[2.05] text-keshizumi">
            AGA、肌、脱毛、睡眠、婚活。誰にも聞けないまま、
            何から始めればいいか分からないことを、実体験と専門家への取材をもとにまとめています。
            提携先から紹介料を受け取っていないので、「これはやらなくていい」とも書きます。
          </p>
          <p className="mt-10">
            <a
              href="#index"
              className="inline-flex items-baseline gap-2 text-[16px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] hover:decoration-dou transition-colors"
            >
              記事を読む
              <span aria-hidden>→</span>
            </a>
          </p>
        </div>
      </header>

      {/* ══════ 最新記事 ══════ */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[72px] sm:pt-[104px] lg:pt-[136px]">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
          新しい記事
        </h2>

        {/* 1本目だけ大きく。以降は2列。同じ形を並べない。 */}
        {head && (
          <Link href={`/areas/${head.areaId}/${head.slug}`} className="group mt-10 block border-t border-shironezu pt-10">
            <p className="text-[13px] text-dou">{areaLabel(head.areaId)}</p>
            <h3
              className="mt-2 max-w-[24em] text-[23px] sm:text-[30px] leading-[1.55] group-hover:text-dou transition-colors"
              style={{ ...MINCHO, fontWeight: 600 }}
            >
              {head.title}
            </h3>
            <p className="mt-4 max-w-[36em] text-[15px] leading-[1.95] text-keshizumi">
              {head.lead}
            </p>
            <p className="mt-4 text-[13px] text-ainezu">{CLUSTER_UPDATED.replace(/-/g, ".")}</p>
          </Link>
        )}

        <ul className="mt-[48px] sm:mt-[72px] grid gap-x-10 gap-y-[48px] sm:gap-y-[72px] sm:grid-cols-2">
          {rest.map((a) => (
            <li key={a.slug}>
              <Link href={`/areas/${a.areaId}/${a.slug}`} className="group block">
                <p className="text-[13px] text-dou">{areaLabel(a.areaId)}</p>
                <h3
                  className="mt-1.5 text-[18px] leading-[1.65] group-hover:text-dou transition-colors"
                  style={{ ...MINCHO, fontWeight: 600 }}
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
            className="inline-flex items-baseline gap-2 text-[15px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] hover:decoration-dou transition-colors"
          >
            記事をすべて見る
            <span aria-hidden>→</span>
          </a>
        </p>
      </section>

      {/* ══════ 記事の索引 — このメディアの本体 ══════ */}
      <section
        id="index"
        className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[96px] sm:pt-[136px] lg:pt-[184px] scroll-mt-20"
      >
        <ArticleIndex />
      </section>

      {/* ══════ よく読まれている記事 ══════ */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 pt-[72px] sm:pt-[104px] lg:pt-[136px]">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
          よく読まれている記事
        </h2>
        <ol className="mt-9 max-w-[42em] border-t border-shironezu">
          {popular.map((a, i) => (
            <li key={a.slug} className="border-b border-shironezu">
              <Link
                href={`/areas/${a.areaId}/${a.slug}`}
                className="group flex items-baseline gap-5 py-5 hover:text-dou transition-colors"
              >
                <span className="w-[1.6em] shrink-0 text-[13px] tabular-nums text-ainezu">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-[15.5px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 600 }}>
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

      {/* ══════ His Recoveriesについて ══════ */}
      <section className="mt-[96px] sm:mt-[136px] lg:mt-[184px] border-y border-shironezu bg-hakuji">
        <div className="mx-auto max-w-[840px] px-5 sm:px-8 lg:px-12 py-[72px] sm:py-[104px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
            His Recoveriesについて
          </h2>
          <div className="mt-7 max-w-[34em] space-y-6 text-[15px] sm:text-[16px] leading-[2.05] text-keshizumi">
            <p>
              男性向けの美容・健康・恋愛・セクシャルウェルネスを扱う編集メディアです。
              編集部が実際に試したこと、専門家に取材して聞いたことを記事にしています。
            </p>
            <p>
              この分野の情報は、ほとんどを売る側が書いています。だから「やったほうがいい」しか
              出てきません。His Recoveries は提携先から紹介料を受け取っていないので、
              <span className="font-semibold text-sumi">
                「いまはやらなくていい」と書くことができます。
              </span>
            </p>
            <p>
              効果を保証することはしません。出典のある情報と、実際に確かめたことだけを書きます。
              専門家への取材記事はまだ0本です。これから増やしていきます。
            </p>
          </div>
          <p className="mt-9">
            <Link
              href="/why"
              className="inline-flex items-baseline gap-2 text-[15px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] hover:decoration-dou transition-colors"
            >
              編集方針を読む
              <span aria-hidden>→</span>
            </Link>
          </p>
        </div>
      </section>

      {/* ══════ ニュースレター — 囲まない ══════ */}
      <section className="mx-auto max-w-[840px] px-5 sm:px-8 lg:px-12 py-[72px] sm:py-[104px]">
        <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
          新しい記事のお知らせ
        </h2>
        <p className="mt-4 max-w-[30em] text-[14px] leading-[1.95] text-keshizumi">
          月に2〜3回、新しく公開した記事をお送りします。配信の停止はいつでもできます。
        </p>
        <form
          action="https://hisrecoveries.substack.com/subscribe"
          method="get"
          target="_blank"
          className="mt-6 flex max-w-[26rem] flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="nl-email" className="sr-only">
            メールアドレス
          </label>
          <input
            id="nl-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-12 flex-1 rounded-[2px] border border-shironezu bg-hakuji px-4 text-[16px] text-sumi outline-none transition-colors focus:border-dou"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-[2px] bg-konjo px-6 text-[15px] font-semibold text-kinari transition-colors hover:bg-[#2A3849]"
          >
            登録する
          </button>
        </form>
      </section>

      {/* ══════ サービス — 最後。静かに ══════ */}
      <section className="border-t border-shironezu">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-8 lg:px-12 py-[72px] sm:py-[104px]">
          <h2 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
            サービス
          </h2>
          <p className="mt-4 max-w-[32em] text-[14px] leading-[1.95] text-keshizumi">
            記事はすべて無料で公開しています。読むだけで進む方もいます。
            一人だと止まってしまう場合だけ、こちらをご覧ください。
          </p>
          <div className="mt-9 max-w-[34em]">
            <h3 className="text-[16px]" style={{ ...MINCHO, fontWeight: 600 }}>
              第一印象改善プラン（30日）
            </h3>
            <p className="mt-2.5 text-[14px] leading-[1.95] text-keshizumi">
              眉・メイク・服選び・髪型の提案・撮影を1日で行い、手順の動画とサイズ表をお渡しします。
              東京都内・土日のみ。費用はご相談のうえで個別にお見積りします。
            </p>
            <p className="mt-4">
              <Link
                href="/plan"
                className="inline-flex items-baseline gap-2 text-[14px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] hover:decoration-dou transition-colors"
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            <div className="col-span-2">
              <p className="text-[12.5px] text-ainezu">分野</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px]">
                {complexes.map((c) => (
                  <li key={c.id}>
                    <Link href={`/areas/${c.id}`} className="hover:text-dou transition-colors">
                      {c.ja}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12.5px] text-ainezu">読みもの</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li><a href="/#index" className="hover:text-dou transition-colors">記事をさがす</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12.5px] text-ainezu">His Recoveries</p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li><Link href="/why" className="hover:text-dou transition-colors">編集方針</Link></li>
                <li><Link href="/partner" className="hover:text-dou transition-colors">取材・掲載について</Link></li>
                <li><Link href="/plan" className="hover:text-dou transition-colors">第一印象改善プラン</Link></li>
                <li><Link href="/privacy" className="hover:text-dou transition-colors">プライバシー・免責事項</Link></li>
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
