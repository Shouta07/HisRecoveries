import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Guide — 編集者と 90 分、整える話をする",
  description:
    "Recovery Guide は、His Recoveries の編集者と 1 対 1 で 90 分、状態の整理と選択肢の翻訳をするオンラインの時間です。診断ではなく、解決策の販売でもなく、選ぶための時間を整えるためのセッションです。",
  alternates: { canonical: `${site.url}/guide` },
  openGraph: {
    title: `Recovery Guide — ${site.name}`,
    description:
      "編集者と 1 対 1 の 90 分。状態の整理と、選択肢の翻訳。診断ではなく、選ぶ前の時間。",
    url: `${site.url}/guide`,
  },
};

export const dynamic = "force-static";

export default function GuideLandingPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recovery Guide",
        item: `${site.url}/guide`,
      },
    ],
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/guide#service`,
    name: "Recovery Guide",
    serviceType: "1:1 editorial recovery consultation",
    provider: { "@id": `${site.url}/#publisher` },
    areaServed: { "@type": "Country", name: "Japan" },
    description:
      "His Recoveries の編集者との 1 対 1 オンラインセッション（90 分）。状態の整理と、選択肢の翻訳。診断ではなく、選ぶ前の時間。",
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />

      <header className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Guide
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          編集者と、90 分。
          <br />
          整える話を、ひとりにしない。
        </h1>
        <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05] max-w-[34rem]">
          His Recoveries の編集者と、1 対 1 で 90 分話す時間です。
          <br />
          オンライン（Zoom 等）、または都内対面。
        </p>
        <p className="mt-6 font-mincho text-[13.5px] text-sub-gray leading-[2.05] max-w-[34rem]">
          私たちは、診断をしません。
          治療やクリニックを売ることもしません。
          ただ、あなたの状態を、あなた自身に翻訳する手伝いをします。
        </p>
      </header>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          What we do
        </p>
        <ol className="border-l border-hair-line pl-6 space-y-7 max-w-[34rem]">
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              事前にお送りした Recovery Check の回答を、一緒に読みます。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              受けていない方も、当日 30 分かけて状態を整理します。
            </p>
          </li>
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              いま選べる選択肢を、並列に置きます。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              「いま急ぐ理由」「いま急がない理由」を、一緒に並べます。
            </p>
          </li>
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              次の半歩を、あなたが選びます。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              私たちは、選びません。並べるだけです。
            </p>
          </li>
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              セッション後 7 日以内に、要約をお送りします。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              話したこと・並べた選択肢・読みかえす言葉を、PDF で。
            </p>
          </li>
        </ol>
      </section>

      <section className="mb-14 sm:mb-20 border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          Investment
        </p>
        <p className="font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          ¥30,000
          <span className="ml-3 text-[14px] text-sub-gray tracking-[0.08em] align-middle">
            / 90 分 · 税込
          </span>
        </p>
        <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2]">
          β 期間中（先着 10 名）は <span className="text-ink">¥9,800</span> で
          ご案内します。
          <br />
          支払いは、初回お申し込み後にメールでご案内します。
        </p>
      </section>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          About the editor
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05] max-w-[34rem]">
          編集を担当するのは、多汗症のボトックスを 5 年、ワキガの手術を 1 回、
          ニキビ跡の美容皮膚科に 6 年通院した、His Recoveries の運営者本人です。
          実名・顔は出していませんが、当事者として通過した時間を、
          90 分のなかでお渡しします。
        </p>
      </section>

      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          Not what this is
        </p>
        <ul className="font-mincho text-[14px] leading-[2] text-ink/80 space-y-1.5 max-w-[34rem]">
          <li>— 医療相談ではありません</li>
          <li>— クリニックや商品を売る場ではありません</li>
          <li>— 紹介手数料を受け取りません</li>
          <li>— あなたを「説得」しようとしません</li>
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Link href="/guide/apply" className="btn-gold justify-center">
          申し込む <span aria-hidden>→</span>
        </Link>
        <Link
          href="/check"
          className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
        >
          まず Recovery Check から
        </Link>
      </div>

      <p className="mt-10 text-[12px] text-sub-gray leading-[2] max-w-[34rem]">
        お申し込み後、72 時間以内に編集者からメールで日程候補をご案内します。
        都内対面を希望の場合は、その旨を申込時に書いてください。
      </p>
    </div>
  );
}
