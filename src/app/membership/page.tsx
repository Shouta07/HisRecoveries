import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recoveries Letter — 毎週日曜日、男性の身体と自意識について",
  description:
    "Recoveries Letter は、His Recoveries の編集者から毎週日曜日に届く、広告のないクローズドレターです。月額 ¥500・Substack 経由。通知も催促もありません。読まない日曜日は、読まないでください。",
  alternates: { canonical: `${site.url}/membership` },
  openGraph: {
    title: `Recoveries Letter — ${site.name}`,
    description:
      "毎週日曜日、男性の身体と自意識について。広告のない場所で。月額 ¥500・Substack。",
    url: `${site.url}/membership`,
  },
};

export const dynamic = "force-static";

const PAID_SUBSCRIBE_URL = `${site.social.substack}/subscribe`;

export default function MembershipPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recovery Letters",
        item: `${site.url}/membership`,
      },
    ],
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/membership#product`,
    name: "Recoveries Letter",
    brand: { "@id": `${site.url}/#publisher` },
    description:
      "毎週日曜日、編集者から届くクローズドレター。男性の身体と自意識について、広告のない場所で。季節ごとに 1 回、Recovery Check の振り返り問。過去レターの閲覧。",
    offers: {
      "@type": "Offer",
      price: "500",
      priceCurrency: "JPY",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "500",
        priceCurrency: "JPY",
        billingDuration: "P1M",
        unitText: "MONTH",
      },
      availability: "https://schema.org/InStock",
      url: PAID_SUBSCRIBE_URL,
    },
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />

      <header className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recoveries Letter
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          毎週日曜日。
          <br />
          男性の身体と自意識について。
          <br />
          広告のない場所で。
        </h1>
        <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05] max-w-[34rem]">
          公開記事には書けなかった、編集者の私的な手紙が、
          <br className="hidden sm:inline" />
          毎週日曜日、メールで届きます。
        </p>
        <p className="mt-6 font-mincho text-[13.5px] text-sub-gray leading-[2.05] max-w-[34rem]">
          通知も、煽りも、催促もありません。
          読まない日曜日は、読まないでください。
        </p>
      </header>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          What you receive
        </p>
        <ol className="border-l border-hair-line pl-6 space-y-7 max-w-[34rem]">
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              毎週日曜日、クローズド・レター。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              公開記事より私的な、半歩先の覚え書き。誰にも見せない机の上から、そのままお送りします。
            </p>
          </li>
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              季節ごとに 1 回、自己観察の問い。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              Recovery Check の続きとして、季節ごとに 1 つ「いまの輪郭を、もう一度なぞる問い」を送ります。
            </p>
          </li>
          <li>
            <p className="font-mincho text-[15px] text-ink leading-[1.85]">
              過去のレターの閲覧。
            </p>
            <p className="mt-2 text-[12.5px] text-sub-gray leading-[1.95]">
              Substack 上で、過去に送られたすべてのレターをいつでも読み返せます。
            </p>
          </li>
        </ol>
      </section>

      <section className="mb-14 sm:mb-20 border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          Subscription
        </p>
        <p className="font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          ¥500
          <span className="ml-3 text-[14px] text-sub-gray tracking-[0.08em] align-middle">
            / 月 · 税込
          </span>
        </p>
        <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2]">
          年額 <span className="text-ink">¥5,000</span>（約 17% off）も Substack 上で選べます。
          <br />
          いつでも解約可能。残り月数の日割り返金はありません。
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <TrackedCTA
            href={PAID_SUBSCRIBE_URL}
            event="membership_subscribe_click"
            eventProps={{ location: "membership_hero" }}
            className="btn-gold justify-center"
          >
            日曜日の手紙を受け取る <span aria-hidden>→</span>
          </TrackedCTA>
          <Link
            href="/subscribe"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
          >
            まず無料の便りから
          </Link>
        </div>
      </section>

      <section className="mb-14 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          About the editor
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05] max-w-[34rem]">
          編集を担当するのは、多汗症のボトックスを 5 年、ワキガの手術を 1 回、
          ニキビ跡の美容皮膚科に 6 年通院した、His Recoveries の運営者本人です。
          実名・顔は出していませんが、当事者として通過した時間を、
          毎週日曜日の手紙のなかでお渡しします。
        </p>
      </section>

      <section className="mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          Not what this is
        </p>
        <ul className="font-mincho text-[14px] leading-[2] text-ink/80 space-y-1.5 max-w-[34rem]">
          <li>— 医療相談ではありません</li>
          <li>— クリニックや商品の宣伝は届きません</li>
          <li>— 紹介手数料を受け取りません</li>
          <li>— 個別の返信は、お約束していません</li>
        </ul>
      </section>

      <p className="mt-10 text-[12px] text-sub-gray leading-[2] max-w-[34rem]">
        購読・解約・支払いはすべて Substack 上で完結します。
        質問は{" "}
        <a
          href={`mailto:${site.email}`}
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          {site.email}
        </a>{" "}
        まで。
      </p>
    </div>
  );
}
