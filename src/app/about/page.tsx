import type { Metadata } from "next";
import { site, socialSameAs } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "His Recoveries は、半歩先から後ろを歩く人に静かに記録を残すメディアです。発信者 Nagi について。",
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    type: "profile",
    url: `${site.url}/about`,
    title: `About — ${site.name}`,
    description: site.authorBio,
  },
};

export default function AboutPage() {
  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${site.url}/about#profile`,
    url: `${site.url}/about`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "Person",
      "@id": `${site.url}/#author`,
      name: site.author,
      alternateName: site.handle,
      description: site.authorBio,
      url: `${site.url}/about`,
      sameAs: socialSameAs,
      knowsAbout: site.topics,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${site.url}/about`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-20">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          About — A Quiet Record
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          このメディアについて
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-base">
          — {site.tagline} —
        </p>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.2] text-ink space-y-7">
        <p>
          His Recoveries は、いくつかのコンプレックスを抱えていた頃の経験と、
          それを超えてきた後の観察を、半歩先から記録するメディアです。
        </p>

        <p>
          扱うのは、男性の身体と自意識に関わる、けれど言葉にされにくい領域。
          多汗症、ニキビ、ワキガ、そして顔の自信のなさ。
          いずれも、当事者にとっては日常を静かに侵食する種類の悩みでした。
        </p>

        <p>
          このサイトの目的は、解決策を売ることでも、励ますことでもありません。
          後ろから歩いてくる人が、自分よりほんの少し先を歩いた人の記録を読むこと。
          それだけで距離が縮まる、という経験を残したい。
        </p>

        <p className="text-sub-gray pt-4">
          <em className="not-italic logo-type tracking-wider text-base">
            Observed — not proclaimed.
          </em>
        </p>

        <div className="pt-12 mt-4">
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-8">
            I. Territories — 扱う4つの領域
          </p>
          <ol className="space-y-3">
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-8">I.</span>
              <span>多汗症</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-8">II.</span>
              <span>ニキビ・ニキビ跡</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-8">III.</span>
              <span>ワキガ（腋臭症）</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-8">IV.</span>
              <span>顔の自信のなさ</span>
            </li>
          </ol>
        </div>

        <div className="pt-12 mt-4">
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-8">
            II. The Writer — 書き手について
          </p>
          <p>
            ペンネームは <span className="text-ink">Nagi</span>。
            顔も実年齢も公開していません。
            かつて当事者だった、というだけが書き手の資格です。
          </p>

          <p className="mt-6">
            半歩先から、後ろから来る人へ。
            観察を主張に優先し、当事者の沈黙を尊重して書きます。
          </p>
        </div>

        <div className="pt-12 mt-4">
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-8">
            III. Editorial Principles — 編集の原則
          </p>
          <ol className="space-y-4">
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">I.</span>
              <span>叫ばない。整える。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">II.</span>
              <span>観察を主張に優先する。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">III.</span>
              <span>当事者の沈黙を尊重する。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">IV.</span>
              <span>リアクションを煽らない。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">V.</span>
              <span>万人に届くことを期待しない。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">VI.</span>
              <span>教える前に、書き残す。</span>
            </li>
            <li className="flex items-baseline gap-5">
              <span className="logo-type text-sub-gray text-sm w-10">VII.</span>
              <span>半歩だけ先を歩く。</span>
            </li>
          </ol>
        </div>

        <div className="pt-12 mt-4">
          <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-8">
            IV. Contact — 連絡
          </p>
          <p>
            ご連絡は{" "}
            <a
              href={`mailto:${site.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.email}
            </a>{" "}
            まで。
          </p>
        </div>

        <p className="logo-type text-base text-ink mt-16 tracking-wider">
          —— Nagi
        </p>
      </div>
    </div>
  );
}
