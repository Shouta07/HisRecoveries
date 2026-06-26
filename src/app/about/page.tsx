import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vitality Design LLC — 人と事業の活力を設計する",
  description:
    "バイタリティデザイン合同会社（Vitality Design LLC）。現場（toB）の AI / DX システム開発、顧客体験・オペレーション設計、ウェルネス・美容領域の事業開発。テクノロジー × 現場理解で、顧客との関係性を「資産」に変える。",
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    type: "website",
    url: `${site.url}/about`,
    title: "Vitality Design LLC — We Design Vitality.",
    description:
      "現場の AI / DX、顧客体験設計、ウェルネス領域の事業開発。テクノロジー × 現場理解で、顧客との関係性を「資産」に変える。",
  },
};

const SERVICES = [
  {
    eyebrow: "AI / DX",
    title: "現場 AX — AI・業務システム開発",
    body: "サロン・クリニック・現場系のオペレーションを、AI と業務システムで再設計します。顧客管理・予約・記録・コミュニケーションを一つの流れにまとめ、属人化していた現場の判断を、データで支える形に変えます。",
    bullets: [
      "顧客 DB / 予約 / カルテの統合",
      "業務 LLM 導入（要件定義から運用まで）",
      "現場オペレーションの SOP 化",
    ],
  },
  {
    eyebrow: "CX / OPS",
    title: "顧客体験・オペレーション設計",
    body: "顧客との関係性を「資産」として扱う体験設計です。初回接客からアフターフォロー、教育コンテンツ、再来の動線までを一貫して設計し、満足度・継続率・口コミにつながる仕組みをつくります。",
    bullets: [
      "カスタマージャーニーの再設計",
      "オンボーディング / 教育コンテンツ",
      "継続率・LTV 改善の仕組み化",
    ],
  },
  {
    eyebrow: "VENTURE",
    title: "ウェルネス・美容領域の事業開発",
    body: "His Recoveries に代表される、当事者起点の事業づくり。メディア・診断・体験・コミュニティを組み合わせ、検証で得た知見を、他の関係性ビジネスの現場へ還元していきます。",
    bullets: [
      "ブランド / メディアの企画・運営",
      "0 → 1 の事業仮説検証",
      "ウェルネス事業者との共同事業",
    ],
  },
];

const APPROACH = [
  {
    step: "01",
    title: "現場に入る",
    body: "課題の言語化は、現場で同じ景色を見るところから。短期間でも実際の運用に立ち会い、紙とデータの両方を読み解きます。",
  },
  {
    step: "02",
    title: "仕組みを設計する",
    body: "AI・業務システム・体験設計を、別々のレイヤーではなく一つの動線として組みます。導入後に運用が続く形を、最初から設計に含めます。",
  },
  {
    step: "03",
    title: "つくり、走らせる",
    body: "小さく開発し、現場で動かしながら磨きます。リリースで終わりにせず、運用データから次の改善を回し続ける関係を前提に進めます。",
  },
  {
    step: "04",
    title: "知見を還元する",
    body: "プロジェクトで得た知見は、業界横断の学びとして次の現場に持ち込みます。一社の中に閉じない、開かれた関係を保ちます。",
  },
];

const FAQ = [
  {
    q: "どんな会社ですか？",
    a: "バイタリティデザイン合同会社は「人と事業の活力を設計する会社」です。テクノロジー × 現場理解で、顧客との関係性を「資産」に変えることを軸に、現場（toB）の AI・DX システム開発、顧客体験設計、ウェルネス・美容領域の事業開発を行います。",
  },
  {
    q: "プロジェクトの規模感は？",
    a: "数百万円規模の単発開発から、年単位の継続的なオペレーション再設計まで対応します。最初は 1〜2 ヶ月の現場入りから始め、本格的なシステム開発に進むかを双方で判断するケースが多いです。",
  },
  {
    q: "対応領域は？",
    a: "サロン・クリニックなど現場系の B2B 事業者を中心に、顧客との関係性が継続的に発生する事業領域を得意としています。ウェルネス・美容領域は特に深く、当事者として運営する His Recoveries の知見を活かせます。",
  },
  {
    q: "His Recoveries との関係は？",
    a: "His Recoveries は、当社が運営する男性ウェルネスのブランドです。自社ブランドで「実践・検証」する場として運営し、そこで得た知見を、現場の関係性ビジネスへ還元しています。ブランドの編集姿勢（中立・非商業）は、会社の事業判断から独立して保たれます。",
  },
  {
    q: "問い合わせ先は？",
    a: "shota@vitality-design.jp までご連絡ください。プロジェクトの背景・現状・期待される成果について、簡単な要件をお送りいただけると初回のお打ち合わせがスムーズです。",
  },
];

const PROFILE: { label: string; value: React.ReactNode }[] = [
  {
    label: "Company",
    value: (
      <>
        バイタリティデザイン合同会社
        <span className="text-zinc-500"> / Vitality Design LLC</span>
      </>
    ),
  },
  { label: "Founded", value: "2024" },
  {
    label: "Address",
    value: (
      <>
        〒153-0064
        <br />
        東京都目黒区下目黒 1-1-14 コノトラビル 7F
      </>
    ),
  },
  {
    label: "Business",
    value: (
      <ul className="space-y-1.5">
        <li>現場（toB）向け AI・DX システム開発</li>
        <li>顧客体験・業務オペレーション設計</li>
        <li>ウェルネス・美容領域の事業開発</li>
      </ul>
    ),
  },
  {
    label: "Contact",
    value: (
      <a
        href={`mailto:${site.company.email}`}
        className="border-b border-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
      >
        {site.company.email}
      </a>
    ),
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
      { "@type": "ListItem", position: 2, name: "Company", item: `${site.url}/about` },
    ],
  };

  return (
    <div className="bg-white text-zinc-950 -mb-20 sm:-mb-32 antialiased">
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

      {/* ── Top nav — corporate ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-200/70">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-4 flex items-center justify-between">
          <Link
            href="/about"
            aria-label="Vitality Design LLC"
            className="group flex items-center gap-2.5"
          >
            <span
              aria-hidden
              className="block w-2 h-2 bg-zinc-950 group-hover:bg-emerald-500 transition-colors"
            />
            <span className="text-[14px] font-semibold tracking-[-0.005em] text-zinc-950">
              Vitality Design
            </span>
            <span className="text-[12px] tracking-[0.18em] text-zinc-400 uppercase hidden sm:inline">
              LLC
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6">
            <a
              href="#services"
              className="hidden sm:inline text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Services
            </a>
            <a
              href="#approach"
              className="hidden sm:inline text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Approach
            </a>
            <a
              href="#profile"
              className="hidden sm:inline text-[13px] text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Company
            </a>
            <a
              href={`mailto:${site.company.email}`}
              className="ml-2 inline-flex items-center gap-1.5 bg-zinc-950 text-white text-[13px] font-medium px-4 py-2 hover:bg-zinc-800 transition-colors"
            >
              Contact
              <span aria-hidden>→</span>
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero — dark, restrained ─────────────────────────────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-emerald-500/15 via-emerald-500/0 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 pt-28 sm:pt-40 pb-24 sm:pb-32">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-zinc-400 mb-10">
            <span aria-hidden className="block w-6 h-px bg-emerald-400" />
            Vitality Design LLC · Tokyo
          </div>
          <h1 className="text-[2.5rem] sm:text-[4rem] lg:text-[5.25rem] leading-[1.05] tracking-[-0.025em] font-semibold max-w-[18ch]">
            人と事業の活力を、
            <br className="hidden sm:inline" />
            <span className="text-zinc-400">設計する。</span>
          </h1>
          <p className="mt-10 text-[1.0625rem] sm:text-[1.25rem] leading-[1.85] text-zinc-300 max-w-[42rem] tracking-[0.01em]">
            テクノロジー × 現場理解で、顧客との関係性を「資産」に変える。
            <br />
            現場（toB）の AI・DX システム開発、顧客体験設計、
            <br className="hidden sm:inline" />
            ウェルネス・美容領域の事業開発を行うデザイン・ファームです。
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${site.company.email}`}
              className="inline-flex items-center gap-2 bg-white text-zinc-950 text-[14px] font-semibold px-6 py-3.5 hover:bg-emerald-400 transition-colors"
            >
              プロジェクトの相談をする
              <span aria-hidden>→</span>
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 text-[14px] text-zinc-300 hover:text-white transition-colors px-2 py-3.5"
            >
              事業内容を見る
              <span aria-hidden className="text-zinc-500">↓</span>
            </a>
          </div>

          {/* hero meta strip */}
          <dl className="mt-20 sm:mt-28 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-8 border-t border-zinc-800 pt-10 text-[12.5px]">
            <div>
              <dt className="text-zinc-500 tracking-[0.16em] uppercase text-[10.5px] mb-2">
                Founded
              </dt>
              <dd className="text-white font-medium">2024 — Tokyo</dd>
            </div>
            <div>
              <dt className="text-zinc-500 tracking-[0.16em] uppercase text-[10.5px] mb-2">
                Focus
              </dt>
              <dd className="text-white font-medium">B2B Operations × AI</dd>
            </div>
            <div>
              <dt className="text-zinc-500 tracking-[0.16em] uppercase text-[10.5px] mb-2">
                Sectors
              </dt>
              <dd className="text-white font-medium">Wellness · Clinic · Salon</dd>
            </div>
            <div>
              <dt className="text-zinc-500 tracking-[0.16em] uppercase text-[10.5px] mb-2">
                Brand
              </dt>
              <dd className="text-white font-medium">His Recoveries</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Statement strip ─────────────────────────────────────── */}
      <section className="bg-zinc-50 border-y border-zinc-200">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-16 sm:py-24">
          <p className="text-[1.5rem] sm:text-[2.25rem] lg:text-[2.75rem] leading-[1.4] tracking-[-0.018em] text-zinc-950 font-semibold max-w-[34ch]">
            関係性を、もう一度
            <br className="hidden sm:inline" />
            <span className="text-emerald-700">利益が立つ場所</span>に置き直す。
          </p>
          <p className="mt-8 text-[15px] sm:text-base text-zinc-600 leading-[1.95] max-w-[42rem]">
            広告で集めて売り切る時代の設計から、関係性を継続資産として扱う設計へ。
            私たちは、サロン・クリニック・ウェルネスといった「人が人を担当する事業」に対して、
            AI と業務システム、そして顧客体験の設計を組み合わせて、その移行を支えます。
          </p>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section id="services" className="scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
          <SectionHead
            eyebrow="01 — Services"
            heading="3 つの軸で、活力を設計する。"
            lead="単発の開発でも、長期のオペレーション再設計でも、入口は変わりません。 現場の景色を一緒に見るところから始めます。"
          />

          <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
            {SERVICES.map((s) => (
              <article
                key={s.title}
                className="bg-white p-8 sm:p-10 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span aria-hidden className="block w-1.5 h-1.5 bg-emerald-500" />
                  <span className="text-[10.5px] tracking-[0.22em] uppercase text-zinc-500 font-medium">
                    {s.eyebrow}
                  </span>
                </div>
                <h3 className="text-[1.25rem] sm:text-[1.375rem] leading-[1.4] tracking-[-0.01em] text-zinc-950 font-semibold">
                  {s.title}
                </h3>
                <p className="mt-4 text-[14px] text-zinc-600 leading-[1.95]">
                  {s.body}
                </p>
                <ul className="mt-7 pt-6 border-t border-zinc-200/80 space-y-2.5 text-[13px] text-zinc-700">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[7px] block w-3 h-px bg-zinc-400 shrink-0"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Approach ─────────────────────────────────────────────── */}
      <section id="approach" className="bg-zinc-50 border-t border-zinc-200 scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
          <SectionHead
            eyebrow="02 — Approach"
            heading="現場に入って、設計し、走らせる。"
            lead="提案書だけで終わらせない。導入後に運用が続く形を、最初から設計に含めます。"
          />

          <ol className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200">
            {APPROACH.map((step) => (
              <li
                key={step.step}
                className="bg-white p-8 sm:p-10 flex flex-col gap-5"
              >
                <span className="text-[2.75rem] leading-none tabular-nums text-zinc-300 font-semibold tracking-[-0.04em]">
                  {step.step}
                </span>
                <h3 className="text-[1.0625rem] font-semibold text-zinc-950 tracking-[-0.005em]">
                  {step.title}
                </h3>
                <p className="text-[13.5px] text-zinc-600 leading-[1.9]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Brand: His Recoveries ───────────────────────────────── */}
      <section className="scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
          <SectionHead
            eyebrow="03 — Own Brand"
            heading="自社で検証してから、現場に持ち込む。"
            lead="クライアントワークと並行して、自社ブランドで仮説検証を続けています。 そこで得た顧客理解と運用知見が、コンサルティング/開発の精度を支えます。"
          />

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
            <div className="relative bg-zinc-950 text-white p-10 sm:p-14 overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              <div className="relative">
                <p className="text-[10.5px] tracking-[0.28em] uppercase text-emerald-400 font-medium mb-6">
                  Editorial Brand
                </p>
                <p className="font-serif italic text-[2rem] sm:text-[2.5rem] leading-[1.15] tracking-[-0.01em]">
                  His Recoveries
                </p>
                <p className="mt-2 text-[12px] tracking-[0.14em] text-zinc-500 uppercase">
                  Male Vitality · Curation Media
                </p>
                <p className="mt-8 text-[14.5px] text-zinc-300 leading-[2]">
                  人に言いにくい悩みを抱える男性に向けた、
                  キュレーション × インタビュー・メディア。
                  当事者の声と医学的な解剖を編集する場として運営し、
                  そこで蓄積する顧客理解を、現場の関係性ビジネスへ還元しています。
                </p>
                <Link
                  href="/"
                  className="mt-10 inline-flex items-center gap-2 text-[13px] text-white border-b border-emerald-400 pb-1 hover:text-emerald-300 transition-colors"
                >
                  His Recoveries を見る
                  <span aria-hidden>↗</span>
                </Link>
              </div>
            </div>

            <div className="lg:pt-6">
              <p className="text-[13.5px] text-zinc-500 tracking-[0.16em] uppercase font-medium mb-6">
                Why we run our own brand
              </p>
              <ul className="space-y-5 text-[14.5px] text-zinc-700 leading-[1.95]">
                <li className="flex gap-4">
                  <span className="text-zinc-300 tabular-nums">01</span>
                  <span>
                    クライアントの顧客理解を、二次情報ではなく
                    自社運営の現場で先に掴む。
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="text-zinc-300 tabular-nums">02</span>
                  <span>
                    AI・コンテンツ・体験設計の打ち手を、
                    自社で先に走らせて検証する。
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="text-zinc-300 tabular-nums">03</span>
                  <span>
                    広告に頼らず、関係性で立つ事業モデルを、
                    自分たちで実演する。
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company profile ─────────────────────────────────────── */}
      <section id="profile" className="bg-zinc-50 border-y border-zinc-200 scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
          <SectionHead
            eyebrow="04 — Company"
            heading="会社概要。"
          />

          <dl className="mt-14 border-t border-zinc-200">
            {PROFILE.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-10 border-b border-zinc-200 py-6 sm:py-7"
              >
                <dt className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 font-medium pt-1">
                  {row.label}
                </dt>
                <dd className="text-[15px] text-zinc-900 leading-[1.85]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-32">
          <SectionHead
            eyebrow="05 — FAQ"
            heading="よくある問い。"
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {FAQ.map((item) => (
              <div key={item.q}>
                <p className="text-[10.5px] tracking-[0.22em] uppercase text-emerald-700 font-medium mb-3">
                  Q
                </p>
                <h3 className="text-[1.0625rem] sm:text-[1.125rem] font-semibold text-zinc-950 leading-[1.55] tracking-[-0.005em]">
                  {item.q}
                </h3>
                <p className="mt-4 text-[14px] text-zinc-600 leading-[2]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA closing ──────────────────────────────────────────── */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-emerald-500/0 to-transparent blur-3xl"
        />
        <div className="relative mx-auto max-w-[1240px] px-6 sm:px-10 py-24 sm:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
            <div>
              <p className="text-[10.5px] tracking-[0.28em] uppercase text-emerald-400 font-medium mb-6">
                Get in touch
              </p>
              <h2 className="text-[2.25rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.05] tracking-[-0.025em] font-semibold max-w-[14ch]">
                一度、話してみませんか。
              </h2>
              <p className="mt-8 text-[15px] sm:text-[1.0625rem] text-zinc-300 leading-[1.9] max-w-[36rem]">
                現場のオペレーションを、AI と業務システムで再設計したい方。
                顧客との関係性を、もう一度資産として扱いたい方。
                守秘義務契約のうえで、まずは現状をお聞かせください。
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <a
                href={`mailto:${site.company.email}`}
                className="inline-flex items-center justify-between gap-6 bg-white text-zinc-950 text-[14px] font-semibold px-6 py-4 hover:bg-emerald-400 transition-colors w-full lg:w-auto"
              >
                <span>{site.company.email}</span>
                <span aria-hidden>→</span>
              </a>
              <p className="text-[12px] text-zinc-500 lg:text-right">
                平日 2 営業日以内にご返信します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Corporate footer ────────────────────────────────────── */}
      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800/60">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="block w-2 h-2 bg-emerald-500" />
                <span className="text-[14px] font-semibold text-white tracking-[-0.005em]">
                  Vitality Design
                </span>
                <span className="text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                  LLC
                </span>
              </div>
              <p className="mt-4 text-[12px] text-zinc-500 leading-[1.8] max-w-[28rem]">
                バイタリティデザイン合同会社 — We Design Vitality.
                <br />
                〒153-0064 東京都目黒区下目黒 1-1-14 コノトラビル 7F
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-zinc-500">
              <Link href="/" className="hover:text-white transition-colors">
                His Recoveries
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <a
                href={`mailto:${site.company.email}`}
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
              <span className="text-zinc-600">© 2026 Vitality Design LLC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({
  eyebrow,
  heading,
  lead,
}: {
  eyebrow: string;
  heading: string;
  lead?: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end max-w-[60rem]">
      <div>
        <p className="text-[10.5px] tracking-[0.28em] uppercase text-zinc-500 font-medium mb-5">
          {eyebrow}
        </p>
        <h2 className="text-[1.875rem] sm:text-[2.5rem] lg:text-[2.875rem] leading-[1.15] tracking-[-0.022em] text-zinc-950 font-semibold max-w-[24ch]">
          {heading}
        </h2>
        {lead && (
          <p className="mt-6 text-[14.5px] sm:text-[15px] text-zinc-600 leading-[1.95] max-w-[40rem]">
            {lead}
          </p>
        )}
      </div>
    </div>
  );
}
