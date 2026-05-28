import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "広告・アフィリエイト方針",
  description:
    "His Recoveries における広告（アフィリエイト）の扱いと、商品・サービス紹介に関する方針。2023 年 10 月施行のステマ規制（景品表示法）に対応し、Amazon アソシエイト、楽天アフィリエイト、A8.net / もしも等の各 ASP リンクに「広告」を明示。紹介基準、医療・効果に関する免責、お問い合わせ先を記載しています。",
  alternates: { canonical: `${site.url}/disclosure` },
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-reading px-6 pt-14 sm:pt-20 pb-24">
      <header className="mb-12">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Disclosure
        </p>
        <h1 className="mt-4 font-mincho text-3xl sm:text-4xl text-ink leading-[1.5]">
          広告・アフィリエイト方針
        </h1>
        <p className="mt-6 font-mincho text-[0.9375rem] leading-[2] text-sub-gray">
          安心して読んでもらうために、お金の流れを正直に書いておきます。
        </p>
      </header>

      <div className="article-body font-mincho">
        <h2>アフィリエイトについて</h2>
        <p>
          当メディアの一部のリンクには、アフィリエイトプログラム（Amazon
          アソシエイト、楽天アフィリエイト、および各種 ASP
          を含む）による広告が含まれています。これらのリンクを経由して商品やサービスが購入された場合、当メディアが紹介料を受け取ることがあります。
        </p>
        <p>
          該当するリンクおよびその周辺には「広告」と明示しています。これは、2023
          年 10 月に施行されたいわゆるステルスマーケティング規制（景品表示法）に基づく表示です。
        </p>

        <h2>紹介する基準</h2>
        <p>
          紹介料の有無にかかわらず、紹介する基準は変えません。
          このメディアで並べるのは、原則として、書き手自身が使ったことのある、あるいは当事者として検討に値すると判断した道具だけです。
        </p>
        <p>
          効いたものだけでなく、合わなかったこと、迷ったことも、できるだけ正直に書きます。
          「これを買えば解決する」とは言いません。整えるための選択肢のひとつとして、並べておくだけです。
        </p>

        <h2>医療・効果について</h2>
        <p>
          当メディアは医療機関ではありません。掲載する内容は、特定の効果・効能を保証するものではなく、診断や治療の代わりになるものでもありません。
          身体に関する判断は、必要に応じて医師など専門家に相談してください。効果には個人差があります。
        </p>

        <h2>お問い合わせ</h2>
        <p>
          広告・アフィリエイトに関するご質問は、{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>{" "}
          までお願いします。
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-hair-line text-sm">
        <Link
          href="/shelf"
          className="text-navy border-b border-gold pb-0.5 hover:text-gold transition-colors"
        >
          ← 整える道具（The Shelf）へ
        </Link>
      </div>
    </div>
  );
}
