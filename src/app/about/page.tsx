import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "会社情報 — バイタリティデザイン合同会社",
  description:
    "バイタリティデザイン合同会社（Vitality Design LLC）の会社情報。We Design Vitality. 人とサービスの関係性をデザインし、活力あふれる社会をつくる。現場（toB）の AI・DX システム開発、顧客体験設計、ウェルネス・美容領域の事業開発。",
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    type: "website",
    url: `${site.url}/about`,
    title: "会社情報 — バイタリティデザイン合同会社",
    description:
      "We Design Vitality. 人とサービスの関係性をデザインし、活力あふれる社会をつくる。",
  },
};

const FAQ = [
  {
    q: "どんな会社ですか？",
    a: "バイタリティデザイン合同会社は「人と事業の活力を設計する会社」です。テクノロジー × 現場理解で、顧客との関係性を「資産」に変えることを軸に、現場（toB）の AI・DX システム開発、顧客体験設計、ウェルネス・美容領域の事業開発を行います。",
  },
  {
    q: "His Recoveries との関係は？",
    a: "His Recoveries は、当社が運営する男性ウェルネスのブランドです。自社ブランドで「実践・検証」する場として運営し、そこで得た知見を、現場の関係性ビジネスへ還元しています。ブランドの編集姿勢（中立・非商業）は、会社の事業判断から独立して保たれます。",
  },
  {
    q: "問い合わせ先は？",
    a: "shota@vitality-design.jp までご連絡ください。",
  },
];

export default function AboutPage() {
  const companyLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#company`,
    name: site.company.name,
    alternateName: site.company.nameEn,
    slogan: site.company.statement,
    description: site.company.definition,
    url: `${site.url}/about`,
    email: site.company.email,
    address: {
      "@type": "PostalAddress",
      postalCode: "153-0064",
      addressRegion: "東京都",
      addressLocality: "目黒区",
      streetAddress: "下目黒1丁目1番14号 コノトラビル7F",
      addressCountry: "JP",
    },
    founder: { "@type": "Person", name: site.company.representative },
    areaServed: { "@type": "Country", name: "Japan" },
    subOrganization: { "@id": `${site.url}/#publisher` },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}/about#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "会社情報", item: `${site.url}/about` },
    ],
  };

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Header */}
      <header className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          {site.company.nameEn}
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          {site.company.name}
        </h1>
        <p className="mt-6 logo-type tracking-[0.1em] text-lg sm:text-xl text-ink">
          {site.company.statement}
        </p>
      </header>

      {/* Statement */}
      <section className="mb-16 sm:mb-20">
        <p className="font-mincho text-[1.25rem] sm:text-[1.6rem] text-ink leading-[1.8] tracking-[0.03em]">
          人とサービスの関係性をデザインし、
          <br className="hidden sm:inline" />
          活力あふれる社会をつくる。
        </p>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[36rem]">
          私たちは「人と事業の活力を設計する会社」です。
          テクノロジー × 現場理解で、顧客との関係性を「資産」に変えること —
          それを三つの軸で進めています。
        </p>
      </section>

      {/* 事業内容 */}
      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
          Business — 事業内容
        </p>
        <div className="space-y-px">
          {site.company.capabilities.map((cap, i) => (
            <div
              key={cap.title}
              className="border-t border-hair-line py-6 grid grid-cols-[2.5rem_1fr] gap-4 sm:gap-6"
            >
              <span className="logo-type italic text-[13px] tracking-[0.2em] text-gold pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-mincho text-lg sm:text-xl text-ink leading-[1.5]">
                  {cap.title}
                </h2>
                <p className="mt-2 font-mincho text-[14px] text-ink/75 leading-[2]">
                  {cap.body}
                </p>
              </div>
            </div>
          ))}
          <div className="border-t border-hair-line" />
        </div>
      </section>

      {/* Brand — His Recoveries */}
      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
          Brand — 自社ブランド
        </p>
        <div className="border border-hair-line bg-paper p-6 sm:p-8">
          <p className="logo-type tracking-[0.1em] text-lg text-ink">
            His Recoveries
          </p>
          <p className="mt-1 text-[12px] tracking-[0.06em] text-sub-gray">
            男性ウェルネスブランド
          </p>
          <p className="mt-4 font-mincho text-[14px] text-ink/80 leading-[2.05]">
            人に言いにくい悩みを抱える男性が、人前に立つ自信を取り戻すための場所。
            メディア・診断・体験・コミュニティを通じて当事者の声と改善の記録を蓄積し、
            その知見を現場の関係性ビジネスへ還元する「実践・検証」のブランドです。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
          >
            His Recoveries を見る
            <span aria-hidden> →</span>
          </Link>
        </div>
      </section>

      {/* 会社概要 */}
      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
          Profile — 会社概要
        </p>
        <dl className="border-t border-hair-line text-[15px]">
          <Row label="会社名">
            {site.company.name}
            <span className="text-sub-gray text-[13px] ml-2">
              （{site.company.nameEn}）
            </span>
          </Row>
          <Row label="代表者">{site.company.representative}</Row>
          <Row label="所在地">
            {site.company.postalCode}
            <br />
            {site.company.address}
          </Row>
          <Row label="事業内容">
            <ul className="space-y-1">
              {site.company.businesses.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Row>
          <Row label="連絡先">
            <a
              href={`mailto:${site.company.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.company.email}
            </a>
          </Row>
        </dl>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
          Questions — よくある問い
        </p>
        <dl className="space-y-7">
          {FAQ.map((item, i) => (
            <div key={i}>
              <dt className="text-ink font-mincho text-[1.0625rem] leading-[1.8]">
                <span className="logo-type text-gold mr-2">Q.</span>
                {item.q}
              </dt>
              <dd className="mt-3 font-mincho text-sub-gray text-[15px] leading-[2.05]">
                <span className="logo-type text-gold mr-2">A.</span>
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-20 pt-10 border-t border-hair-line/50 flex items-center gap-4">
        <span aria-hidden className="block w-12 h-px bg-gold" />
        <p className="logo-type tracking-[0.2em] text-sm text-ink">
          {site.company.nameEn}
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-1 sm:gap-6 border-b border-hair-line py-4">
      <dt className="text-sub-gray text-[13px] tracking-[0.08em] pt-0.5">
        {label}
      </dt>
      <dd className="text-ink leading-[1.9]">{children}</dd>
    </div>
  );
}
