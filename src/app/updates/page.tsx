import type { Metadata } from "next";
import Link from "next/link";
import { updatesByNewest, LAST_UPDATED } from "@/lib/updates";
import { formatDate } from "@/lib/articleDates";
import { site, ogImage } from "@/lib/site";

// 更新記録。
//
// トップで「順番が変わったら、変わった記録も残します」と約束している。
// その約束を確かめられる場所。
//
// 変更履歴のページは、ふつう「改善しました」の一覧になる。
// それだと宣伝と同じで、確かめる用には使えない。
// ここは前・後・理由の3つを必ず並べる。前を消さないことが記録の意味なので、
// 変更前は取り消し線ではなく、そのまま読める形で残す。
//
// 組みはサイト共通（白練の地・明朝の見出し・罫線・カードなし）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/updates`;

export const metadata: Metadata = {
  title: "更新記録",
  description:
    "His Recoveries が出している順番・編集方針・導線を、いつ・何から何に・なぜ変えたかの記録です。変更前の記述も消さずに残しています。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "更新記録",
    description: "何から何に、なぜ変えたか。変更前も消さずに残しています。",
    images: [ogImage],
  },
};

export default function UpdatesPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: `更新記録 — ${site.name}`,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    dateModified: LAST_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: updatesByNewest.length,
      itemListElement: updatesByNewest.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: u.title,
      })),
    },
  };

  return (
    <main className="bg-shironeri">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="mx-auto max-w-reading px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            更新記録
          </h1>
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">
            このサイトが出している順番は、暫定版です。取材が進んだり、前提が変われば書き換えます。
            そのとき「いつのまにか変わっていた」にならないよう、
            何から何に、なぜ変えたのかをここに残します。変更前の記述も消しません。
          </p>
          <p className="mt-4 text-[14.5px] leading-[1.95] text-ainezu">
            記事の追加や誤字の修正は載せていません。載せるのは、読む方が受け取る判断そのものが変わったときだけです。
          </p>
        </header>

        <ol className="mt-14 border-t border-shironezu">
          {updatesByNewest.map((u) => (
            <li key={`${u.date}-${u.title}`} className="border-b border-shironezu py-8">
              <p className="flex items-baseline gap-3 text-[12.5px]">
                <time dateTime={u.date} className="tabular-nums text-ainezu">
                  {formatDate(u.date)}
                </time>
                <span className="text-asagi">{u.kind}</span>
              </p>
              <h2
                className="mt-2.5 text-[18px] leading-[1.6] sm:text-[20px]"
                style={{ ...MINCHO, fontWeight: 700 }}
              >
                {u.title}
              </h2>

              <dl className="mt-4 space-y-3 text-[14.5px] leading-[1.95]">
                {u.before && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                    <dt className="shrink-0 text-ainezu sm:w-[4.5em]">変更前</dt>
                    <dd className="text-ainezu">{u.before}</dd>
                  </div>
                )}
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-ainezu sm:w-[4.5em]">
                    {u.before ? "変更後" : "決めたこと"}
                  </dt>
                  <dd className="text-keshizumi">{u.after}</dd>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-ainezu sm:w-[4.5em]">なぜ</dt>
                  <dd className="text-keshizumi">{u.why}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>

        <section className="mt-14 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
          <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            まだ記録がないこと
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.95] text-keshizumi">
            取材にもとづいて順番を書き換えた記録は、まだ1件もありません。
            専門家への取材記事が0本だからです。1本目が出て、それで順番が動いたときが、
            このページのいちばん大事な1件になります。
          </p>
        </section>

        <p className="mt-14 text-[14.5px] leading-[1.95] text-keshizumi">
          何をどう決めているかは
          <Link
            href="/#about"
            className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
          >
            編集方針
          </Link>
          に、収益との関係は
          <Link
            href="/disclosure"
            className="mx-1 font-bold text-asagi underline decoration-asagi/40 underline-offset-[4px] transition-colors hover:decoration-asagi"
          >
            広告と収益について
          </Link>
          に書いています。
        </p>
      </div>
    </main>
  );
}
