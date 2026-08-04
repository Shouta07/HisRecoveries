import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { clustersByArea } from "@/lib/clusters";
import { CORE_QUESTIONS } from "@/lib/check";
import CheckFlow, { type ArticleRef } from "@/components/check/CheckFlow";
import { site } from "@/lib/site";

// 診断。サイトの入口をここに移す。
//
// これまで記事55本の出口が「別の記事」しかなかったので、
// 読み終えた人との関係が一度きりで終わっていた。
// 診断は、読者に現在地を渡して、順番を1本に決めるための道具。
//
// 記事データは重いのでサーバで組み立て、必要な分（slug と title）だけ渡す。
// 全文をクライアントに送ると、また 230KB を積むことになる。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/check`;
const AREAS = ["impression", "hair", "skin", "face", "body-hair", "mind"];

export const metadata: Metadata = {
  title: "何から始めるかを決める｜5問・30秒",
  description:
    "5問・30秒で、手をつける順番と、今月やること3つが出ます。いまはやらなくていいことも出します。無料・登録不要。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "何から始めるかを決める",
    description: "5問・30秒。順番と、いまはやらなくていいことが出ます。",
  },
};

export default function CheckPage() {
  // 各領域の代表記事を2本ずつ。結果の各ステップに添える
  const articles: Record<string, ArticleRef[]> = {};
  for (const id of AREAS) {
    articles[id] = clustersByArea(id)
      .slice(0, 2)
      .map((a) => ({ slug: a.slug, title: a.title }));
  }

  return (
    <main className="bg-shironeri">
      <div className="mx-auto max-w-reading px-5 pb-24 pt-6 sm:px-8 sm:pt-14">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        {/* h1 はページの見出しなので常に出す。
            長い説明だけを1問目の前に限る（CheckFlow が出し分ける）。
            結果の上に案内文が残り続けると、読みたいものが下に押される。
            余白を詰めているのは、初回表示で選択肢が画面に入るようにするため。 */}
        <h1
          className="mt-3 text-[22px] leading-[1.45] sm:mt-5 sm:text-[33px]"
          style={{ ...MINCHO, fontWeight: 700 }}
        >
          何から始めるかを、決めます
        </h1>

        {/* useSearchParams（?focus=）を使うので境界が要る。
            中身は即座に描けるので、待ちの表示は最小限でよい。 */}
        <div className="mt-4 sm:mt-7">
          <Suspense fallback={<p className="text-[14px] text-ainezu">読み込み中…</p>}>
          <CheckFlow
            articles={articles}
            // 押す前に要るのは「何問で終わるか」と「登録が要らないか」だけ。
            // それ以外は選択肢の下（note）に回す。
            intro={
              <p className="mb-5 text-[15px] leading-[1.95] text-keshizumi sm:mb-7">
                {CORE_QUESTIONS}問・30秒。登録は要りません。
              </p>
            }
            note={
              <p className="mt-9 border-t border-shironezu pt-6 text-[14px] leading-[1.95] text-ainezu">
                手をつける順番と、今月やること3つが出ます。
                <span className="font-bold text-keshizumi">いまはやらなくていいことも出します。</span>
                <span className="mt-1 block">回答は保存していません。</span>
              </p>
            }
          />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
