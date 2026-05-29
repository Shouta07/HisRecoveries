import type { Metadata } from "next";
import Link from "next/link";
import { site, socialSameAs } from "@/lib/site";
import { getAllTerritories } from "@/lib/territories";

const FAQ = [
  {
    q: "Male Conditioning とは何ですか？",
    a: "Male Conditioning（メール・コンディショニング）は、男性が「強くなる」のではなく「整う」ことを軸に、身体と自意識を回復していく実践のことです。His Recoveries はこの概念を一つのカテゴリとして再定義し、記録（Journal）、道具（Rituals）、体験（Quiet Gatherings）の 3 層で支えていきます。",
  },
  {
    q: "His Recoveries はどんなメディアですか？",
    a: "言葉にされにくい男性のコンプレックス — 多汗症、ワキガ、ニキビ、薄毛、髭・体毛、顔の印象、心と自意識 — を、当事者の声で記録するエディトリアル・メディアです。解決策を煽る場所ではなく、半歩先を歩いた人間が、整えてきた時間を残しておく場所です。",
  },
  {
    q: "「整える」と「治す」は何が違いますか？",
    a: "「治す」は終わりがある医学の言葉、「整える」は終わりを求めない日常の言葉です。His Recoveries は医療を否定しません。ただし、治療が終わったあとに残る感覚 — 鏡を見るときの躊躇い、人との距離 — を扱うために、整えるという動詞を選んでいます。",
  },
  {
    q: "Quiet Gatherings とは何ですか？",
    a: "Quiet Gatherings は、His Recoveries が運営する少人数・半公開の体験事業です。整える時間そのものを共有する場として、夜に行います。詳細は /events を参照してください。",
  },
  {
    q: "書き手は誰ですか？",
    a: "His Recoveries は、これらの領域を当事者として実際に通過した日本人男性が運営するエディトリアル・メディアです。20 代前半から多汗症の外用治療と脇のボトックスを継続、20 代後半にワキガの手術、ニキビ跡の美容皮膚科に 6 年。顔の自信のなさと自意識の領域も長く通過しました。実名・実年齢・顔は意図的に公開せず、ブランドとして書き続けます。専門家としての権威ではなく、半歩先を歩いた当事者としての記録のみを発信します。",
  },
  {
    q: "扱う領域は何ですか？",
    a: "汗・におい、肌・ニキビ、顔の印象、心と自意識、薄毛・AGA、髭・体毛、の 6 領域です。SEO 用の「カテゴリ」ではなく、地形図のような「章」として並べています。",
  },
  {
    q: "アフィリエイトを含む記事はありますか？",
    a: "あります。整える道具（/shelf）と、一部の記事末尾に、Amazon・楽天・各種 ASP のアフィリエイトを含むリンクが掲載されます。該当箇所には「広告」と明示し、詳細は /disclosure に記載しています。",
  },
];

export const metadata: Metadata = {
  title: "About — Male Conditioning とは",
  description:
    "His Recoveries は Male Conditioning（男性のコンディショニング）を再定義する日本発のエディトリアル・メディア。多汗症・ワキガ・ニキビ・薄毛・顔の自信など、言葉にされにくい男性のコンプレックスを、当事者の視点で記録します。Recover Your Presence.",
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    type: "profile",
    url: `${site.url}/about`,
    title: `About — ${site.name}`,
    description:
      "Male Conditioning — Recover Your Presence. 男性のコンプレックスを、当事者の声で記録するエディトリアル・メディア。",
  },
};

export default function AboutPage() {
  const territories = getAllTerritories();

  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${site.url}/about#profile`,
    url: `${site.url}/about`,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: { "@id": `${site.url}/#publisher` },
    about: { "@id": `${site.url}/#publisher` },
  };

  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${site.url}/about#aboutpage`,
    url: `${site.url}/about`,
    name: `About — ${site.name}`,
    description: site.description,
    inLanguage: site.language,
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: { "@id": `${site.url}/#publisher` },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${site.url}/about#faq`,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          About — Male Conditioning
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.4]">
          このメディアについて
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-base sm:text-lg leading-[1.95]">
          Male Conditioning — Recover Your Presence.
          <br />
          半歩先から、整える。
        </p>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.2] text-ink space-y-7">
        {/* Definition — the citation-ready paragraph for AI engines */}
        <p>
          <strong className="text-ink">His Recoveries</strong> は、
          <strong>Male Conditioning（男性のコンディショニング）</strong>{" "}
          という新しいカテゴリを定義する、日本発のエディトリアル・メディアです。
          男性が「強くなる」のではなく「整う」ことを軸に、身体と自意識を回復していく実践を扱います。
        </p>

        <p>
          扱うのは、男性の身体と自意識に関わる、けれど言葉にされにくい領域。
          多汗症、ワキガ、ニキビ・ニキビ跡、顔の印象、薄毛・AGA、髭・体毛、心と自意識。
          いずれも、当事者にとっては日常を静かに侵食する種類の悩みです。
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

        {/* Chapters — 6 territories */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            I. Chapters — 扱う 6 領域
          </p>
          <ol className="space-y-3">
            {territories.map((t, i) => (
              <li key={t.slug} className="flex items-baseline gap-5">
                <span className="logo-type text-sub-gray text-sm w-10">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span>
                  <Link
                    href={`/territories/${t.slug}`}
                    className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
                  >
                    {t.title}
                  </Link>
                  <span className="text-sub-gray text-sm ml-3">
                    {t.subtitle}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* About His Recoveries */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            II. The Editorial — 運営について
          </p>
          <p>
            <span className="text-ink">{site.name}</span>{" "}
            は、これらの領域を当事者として実際に通過した日本人男性が、ブランドとして運営するエディトリアル・メディアです。
            実名・実年齢・顔は意図的に非公開とし、個人の名前ではなくブランドとして書き続けます。
          </p>
          <p className="mt-6">
            運営者が当事者として通過したのは、次の道筋です。
          </p>
          <ul className="mt-4 space-y-2 text-[15px] text-sub-gray leading-[1.95]">
            <li>— 20 代前半から、多汗症の外用治療と脇のボトックスを継続</li>
            <li>— 20 代後半に、ワキガの手術を受けた</li>
            <li>— ニキビ跡の美容皮膚科に、6 年通った</li>
            <li>— 顔の自信のなさと、自意識の領域を、長く通過した</li>
          </ul>
          <p className="mt-6">
            半歩先から、後ろから来る人へ。
            観察を主張に優先し、当事者の沈黙を尊重して書きます。
            専門家としての権威を取らず、医療や商業情報の代替を目指しません。
          </p>
        </div>

        {/* Editorial principles */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
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

        {/* Three layers */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            IV. Three Layers — 三層構造
          </p>
          <ul className="space-y-5">
            <li>
              <Link
                href="/articles"
                className="logo-type tracking-wider text-base hover:text-gold transition-colors"
              >
                Presence Journal · 記録
              </Link>
              <p className="mt-1 text-sub-gray text-[15px]">
                当事者の一人称・過去形で書かれたエッセイ。
              </p>
            </li>
            <li>
              <Link
                href="/shelf"
                className="logo-type tracking-wider text-base hover:text-gold transition-colors"
              >
                Conditioning Rituals · 整える道具
              </Link>
              <p className="mt-1 text-sub-gray text-[15px]">
                使ってきた道具を「広告」と明示した上で並べる、正直な棚。
              </p>
            </li>
            <li>
              <Link
                href="/events"
                className="logo-type tracking-wider text-base hover:text-gold transition-colors"
              >
                Quiet Gatherings · 体験
              </Link>
              <p className="mt-1 text-sub-gray text-[15px]">
                少人数・半公開で行う、整える時間そのもの。
              </p>
            </li>
          </ul>
        </div>

        {/* FAQ — visible Q&A for both readers and AI engines */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            V. Questions — よくある問い
          </p>
          <dl className="space-y-7">
            {FAQ.map((item, i) => (
              <div key={i}>
                <dt className="text-ink text-[1.0625rem] leading-[1.8]">
                  <span className="logo-type text-gold mr-2">Q.</span>
                  {item.q}
                </dt>
                <dd className="mt-3 text-sub-gray text-[15px] leading-[2.05]">
                  <span className="logo-type text-gold mr-2">A.</span>
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Contact */}
        <div className="pt-12 mt-4">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            VI. Contact — 連絡
          </p>
          <p>
            ご連絡は{" "}
            <a
              href={`mailto:${site.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.email}
            </a>{" "}
            まで。広告・アフィリエイトに関する方針は{" "}
            <Link
              href="/disclosure"
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              /disclosure
            </Link>{" "}
            に記載しています。
          </p>
        </div>

        <div className="mt-20 pt-10 border-t border-hair-line/50 flex items-center gap-4">
          <span aria-hidden className="block w-12 h-px bg-gold" />
          <p className="logo-type tracking-[0.2em] text-sm text-ink">
            {site.name}
          </p>
        </div>
      </div>
    </div>
  );
}
