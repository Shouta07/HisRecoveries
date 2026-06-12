import type { Metadata } from "next";
import Link from "next/link";
import { CHECK_SECTIONS, CHECK_QUESTIONS } from "@/lib/checkQuestions";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Check — 自分の状態を、編集者と整理する",
  description:
    "30 問の自己観察と、編集者からの個別レポート。診断ではなく、自分の状態を翻訳してもらうための時間。回復の最初の半歩のために。",
  alternates: { canonical: `${site.url}/check` },
  openGraph: {
    title: `Recovery Check — ${site.name}`,
    description:
      "30 問の自己観察と、編集者からの個別レポート。自分の状態を翻訳してもらうための時間。",
    url: `${site.url}/check`,
  },
};

export const dynamic = "force-static";

export default function CheckLandingPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recovery Check",
        item: `${site.url}/check`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Check
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          自分の状態を、
          <br />
          編集者と整理する 90 分。
        </h1>
        <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[34rem]">
          30 問の自己観察に、静かに答える。
          <br />
          編集者が読んで、24 時間以内に「あなたの状態の地形図」を返します。
        </p>
        <p className="mt-6 font-mincho text-[13.5px] text-sub-gray leading-[1.95] max-w-[34rem]">
          診断ではありません。
          治療を売ることもしません。
          ただ、自分の言葉を、もう一度、自分自身に渡すための時間です。
        </p>
      </header>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          What you receive
        </p>
        <ul className="font-mincho text-[15px] leading-[2.1] text-ink space-y-2.5 max-w-[34rem]">
          <li>— あなたの状態の地形図（PDF・1,500〜2,000 字）</li>
          <li>— 観察すべき 3 つの方向</li>
          <li>— 関連する記録・悩み票へのリンク</li>
          <li>— 希望者には、Recovery Guide（有料・90 分）のご案内</li>
        </ul>
      </section>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          The 30 questions
        </p>
        <p className="font-mincho text-[14px] text-ink/80 leading-[2] max-w-[34rem] mb-7">
          {CHECK_QUESTIONS.length} 問は 4 つの章に分かれています。
          途中で休んでも、ブラウザを閉じても、続きから戻れます。
        </p>
        <ol className="border-t border-hair-line">
          {CHECK_SECTIONS.map((s) => (
            <li key={s.id} className="border-b border-hair-line py-5">
              <p className="logo-type italic text-[11px] tracking-[0.2em] text-gold">
                {s.label}
              </p>
              <p className="mt-2 font-mincho text-[14.5px] text-ink/85 leading-[1.85]">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14 sm:mb-20 border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          About the price
        </p>
        <p className="font-mincho text-[15px] text-ink leading-[2.1]">
          Recovery Check は、当面、無料 β として運営しています。
        </p>
        <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2]">
          編集者の応答数を保つため、月の受付に上限があります。
          上限に達した場合は、翌月の予約をご案内します。
          将来的に有料化する可能性がありますが、β 期間中に申し込んだ方は、
          そのまま無料で受けられます。
        </p>
      </section>

      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          Not what this is
        </p>
        <ul className="font-mincho text-[14px] leading-[2] text-ink/80 space-y-1.5 max-w-[34rem]">
          <li>— 医療診断ではありません</li>
          <li>— クリニックの紹介を目的としていません</li>
          <li>— 商品・サービスを売りません</li>
          <li>— AI による自動応答ではありません（人が読みます）</li>
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Link href="/check/start" className="btn-gold justify-center">
          始める <span aria-hidden>→</span>
        </Link>
        <Link
          href="/concerns"
          className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
        >
          先に悩み票を読む
        </Link>
      </div>

      <p className="mt-10 text-[12px] text-sub-gray leading-[2] max-w-[34rem]">
        所要時間：15〜25 分。
        回答内容はブラウザ内に自動保存されます。
        メールアドレスは、レポート送付に必要な場合にのみ最後にお伺いします。
      </p>
    </div>
  );
}
