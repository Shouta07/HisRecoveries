import type { Metadata } from "next";
import Link from "next/link";
import { COST_FACTORS, DELIVERABLES, OUT_OF_POCKET, PLAN, SUPPORT } from "@/lib/pricing";
import { FAQ_CATEGORIES } from "@/lib/faq";
import { site } from "@/lib/site";

// 個人向けサービスの面。
//
// 以前はここだけ別のデザインだった（深緑のヒーロー・角丸カード・追従バー）。
// メディアとサービスで別ブランドに見えるのは損なので、トップと同じ組みに揃える。
// 生成りの地・明朝の見出し・罫線・カードなし。追従バーも置かない。
//
// 売り込む面ではなく、相談に来るかどうかを自分で判断してもらう面として書く。
// だから「できないこと」と「お断りする場合」を、申し込みより前に置く。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/plan`;

export const metadata: Metadata = {
  title: "第一印象改善プラン（30日）— 東京都内・土日・1日の体験",
  description:
    "男性の第一印象を30日で整える個人向けプラン。眉・メンズメイク・服選び・髪型の提案・写真撮影を1日で行い、メイクの手順動画・服のサイズ表・髪型のオーダー資料など6点をお渡しします。東京都内・土日のみ。費用は個別のお見積り、ご相談は無料です。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: "第一印象改善プラン（30日）",
    description:
      "眉・メイク・服選び・髪型・撮影を1日で。手順の動画とサイズ表を持ち帰れます。東京都内・土日のみ。",
  },
};

const FACTS: [string, string][] = [
  ["期間", `${PLAN.days}日`],
  ["実施", `${PLAN.where}・${PLAN.when}`],
  ["体験当日", PLAN.duration],
  ["費用", "個別のお見積り"],
];

// 当日までの、商品の骨格
const FLOW = [
  { t: "カウンセリング", d: "何が気になっているのかを、一緒に言葉にします。ここが起点です。" },
  { t: "改善プランの作成", d: "何をやるか、何をやらないかを決めて、一枚にまとめます。" },
  {
    t: "オフライン体験（1日）",
    d: "眉・メンズメイク・服選び・髪型の提案・写真撮影。東京都内・土日のみの実施です。",
  },
  { t: "その場で、持ち帰るものをつくる", d: "撮影も記録も、当日に行います。" },
  { t: "次に使える形にして、渡す", d: "下の6点です。買い物や美容室で、そのまま使えます。" },
];

const DONT = [
  "医療行為・医療判断（診断や治療方針は、医師の領域です）",
  "効果の保証・仕上がりの保証",
  "習得の保証（お渡しした手順を、必ず再現できるようになること）",
  "別人のように変えること",
  "本人に代わって続けること（習慣は、ご本人のものです）",
  "外見以外の悩み全般の解決（恋愛・転職そのものの成否は範囲外です）",
];

const DECLINE = [
  "短期間で、別人のように変わりたい",
  "肌荒れを、施術だけで早く消したい",
  "睡眠・食事・ストレスには手をつけたくない",
  "東京都内に、土日1日来ることが難しい（オンラインのみの対応はしていません）",
];

const YOUR_PART = [
  "決めた予約に、行くこと",
  "決めたことを、続けること（週に数分でも）",
  "現在地を、正直に共有すること",
];

const STEPS = [
  {
    t: "無料で相談する",
    d: "フォームから、気になっていることをお送りください。3営業日を目処にご返信します。実名・顔写真は不要です。",
  },
  {
    t: "合うかどうかを、先に確かめる",
    d: "できること・できないことをお伝えします。合わないと思えば、その場でそう言います。ここまで費用はかかりません。",
  },
  {
    t: "お見積りと、日程",
    d: "内容が決まったらお見積りをお出しします。ご了承いただけたら、東京都内・土日で実施日を決めます。金額にご納得いただけない場合は、ここでやめていただいて構いません。",
  },
  {
    t: "LINEでつながる",
    d: "お支払いのあとに、伴走用のLINEをご案内します。当日の持ち物や待ち合わせも、ここでやりとりします。",
  },
  {
    t: "当日、そして納品",
    d: `1日で整えて、手順の動画・眉の型・服のサイズ表・オーダー資料をお渡しします。実施日から${SUPPORT.days}日間は、${SUPPORT.channel}で質問していただけます。`,
  },
];

const TERMS: [string, string][] = [
  [
    "費用",
    "サイトに金額は出していません。内容が人によって変わるためです。ご相談のあとに個別のお見積りをお出しします。",
  ],
  [
    "ご連絡の手段",
    `お申し込みまではメールです。${SUPPORT.channel}は、お申し込み後の連絡と、実施後${SUPPORT.days}日間の質問窓口に使います。`,
  ],
  [
    "キャンセル",
    "お支払い後のキャンセル・返金はお受けできません。日程の変更は、実施日の1週間前まで承ります。ご相談・お見積りの段階なら、いつでもおやめいただけます。",
  ],
];

export default function PlanPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((c) => c.items).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: PLAN.name,
    serviceType: "第一印象改善",
    description:
      "眉・メンズメイク・服選び・髪型の提案・写真撮影を1日で行い、手順の動画・眉の型・服のサイズ表・髪型のオーダー資料など6点をお渡しする、30日間の個人向けプラン。",
    provider: { "@id": `${site.url}/#publisher` },
    areaServed: { "@type": "City", name: "東京都" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${site.url}/reserve`,
      servicePostalAddress: { "@type": "PostalAddress", addressRegion: "東京都", addressCountry: "JP" },
    },
    audience: { "@type": "PeopleAudience", suggestedGender: "male" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "納品物",
      itemListElement: DELIVERABLES.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: d.t,
        description: d.d,
      })),
    },
    // 金額は公開していない。値段を書かない方針を構造化データでも正直に示す。
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/LimitedAvailability",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "JPY",
        description: "費用は内容によって変わるため、ご相談のうえで個別にお見積りします。",
      },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: PLAN.name, item: url },
    ],
  };

  return (
    <div className="bg-kinari text-sumi">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-dou">ホーム</Link>
        </nav>

        <header className="mt-7">
          <p className="text-[13px] text-dou">個人向けサービス</p>
          <h1 className="mt-3 max-w-[16em] text-[28px] leading-[1.45] sm:text-[38px]" style={{ ...MINCHO, fontWeight: 700 }}>
            {PLAN.name}（{PLAN.days}日）
          </h1>
          <p className="mt-5 max-w-[34em] text-[15.5px] leading-[2.05] text-keshizumi">
            眉・メンズメイク・服選び・髪型の提案・写真撮影を1日で行い、
            あとから自分で使える材料をお渡しします。
            記事を読んでも一人だと止まってしまう、という方のためのものです。
          </p>

          <dl className="mt-9 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-shironezu py-7 sm:grid-cols-4">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-ainezu">{k}</dt>
                <dd className="mt-1.5 text-[16px] leading-[1.5]" style={{ ...MINCHO, fontWeight: 700 }}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* ══ 何をするか ══ */}
        <section className="mt-[72px] sm:mt-[96px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            何をするか
          </h2>
          <ol className="mt-7 border-t border-shironezu">
            {FLOW.map((s, i) => (
              <li key={s.t} className="flex gap-5 border-b border-shironezu py-5">
                <span className="w-[1.6em] shrink-0 text-[12.5px] tabular-nums text-ainezu">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {s.t}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.9] text-keshizumi">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ══ 渡すもの ══ */}
        <section className="mt-[72px] sm:mt-[96px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            お渡しするもの
          </h2>
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.95] text-keshizumi">
            成果ではなく、渡すもので区切っています。終わりの条件を、
            あなたがどれだけ習得したかに置かないためです。
          </p>
          <ol className="mt-7 border-t border-shironezu">
            {DELIVERABLES.map((d, i) => (
              <li key={d.t} className="flex gap-5 border-b border-shironezu py-5">
                <span className="w-[1.6em] shrink-0 text-[12.5px] tabular-nums text-ainezu">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {d.t}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.9] text-keshizumi">{d.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] leading-[1.95] text-keshizumi">
            実施日から{SUPPORT.days}日間、{SUPPORT.channel}で質問していただけます。
            <span className="text-ainezu">（{SUPPORT.note}）</span>
          </p>
        </section>

        {/* ══ できないこと ══ */}
        <section className="mt-[96px] sm:mt-[136px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            できないこと
          </h2>
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.95] text-keshizumi">
            お金を払ってから「思っていたものと違った」となるのが、いちばん不幸です。
            だから、できないことを先に書いておきます。
          </p>
          <ul className="mt-7 border-t border-shironezu">
            {DONT.map((x) => (
              <li key={x} className="border-b border-shironezu py-4 text-[14.5px] leading-[1.9] text-keshizumi">
                {x}
              </li>
            ))}
          </ul>

          <h3 className="mt-12 text-[16px]" style={{ ...MINCHO, fontWeight: 700 }}>
            こういうご相談は、お断りしています
          </h3>
          <ul className="mt-5 border-t border-shironezu">
            {DECLINE.map((x) => (
              <li key={x} className="border-b border-shironezu py-4 text-[14.5px] leading-[1.9] text-keshizumi">
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[34em] text-[14.5px] leading-[2] text-keshizumi">
            とくに肌は、施術だけで早く、というのが難しい部分です。医療にかかっても
            <span className="font-bold text-sumi">1年で解決するとは限りません</span>。
            ただ、肌が完璧でなくても、第一印象は動きます。第一印象は髪・眉・服のサイズ感・
            姿勢・表情・写真の総合点で、肌はその一つだからです。
            期日が近い場合は、動かせる要素から整えます。
          </p>
          <p className="mt-4 max-w-[34em] text-[13.5px] leading-[1.95] text-ainezu">
            医療行為は行いません。特定の医療機関をおすすめすることもしません。
            施術を受けるかどうかを決めるのは、あなたです。
          </p>

          <h3 className="mt-12 text-[16px]" style={{ ...MINCHO, fontWeight: 700 }}>
            あなたにやっていただくこと
          </h3>
          <ul className="mt-5 border-t border-shironezu">
            {YOUR_PART.map((x) => (
              <li key={x} className="border-b border-shironezu py-4 text-[14.5px] leading-[1.9] text-keshizumi">
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13.5px] leading-[1.9] text-ainezu">
            この3つさえやっていただければ、あとは考えなくて大丈夫です。
          </p>
        </section>

        {/* ══ 費用 ══ */}
        <section className="mt-[96px] sm:mt-[136px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            費用について
          </h2>
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[2] text-keshizumi">
            サイトに金額は出していません。何をやるか・何をやらないかを決めるのがこの仕事なので、
            内容が人によって変わり、一律の金額が実態と合わなくなるためです。
            <span className="font-bold text-sumi">いくらかは先に言えませんが、何で決まるかは先に言えます。</span>
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-[13px] text-dou">費用が変わる要素</p>
              <ul className="mt-4 border-t border-shironezu">
                {COST_FACTORS.map((x) => (
                  <li key={x} className="border-b border-shironezu py-3.5 text-[14px] leading-[1.85] text-keshizumi">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[13px] text-dou">ご本人の実費負担</p>
              <ul className="mt-4 border-t border-shironezu">
                {OUT_OF_POCKET.map((x) => (
                  <li key={x} className="border-b border-shironezu py-3.5 text-[14px] leading-[1.85] text-keshizumi">
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13.5px] leading-[1.9] text-ainezu">
                会場の費用は、プランに含まれます。
              </p>
            </div>
          </div>
        </section>

        {/* ══ はじめかた ══ */}
        <section className="mt-[96px] sm:mt-[136px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            はじめかた
          </h2>
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.95] text-keshizumi">
            費用の決まり方も、連絡の手段も、キャンセルの条件も、申し込む前にすべてお見せします。
          </p>
          <ol className="mt-7 border-t border-shironezu">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-5 border-b border-shironezu py-5">
                <span className="w-[1.6em] shrink-0 text-[12.5px] tabular-nums text-ainezu">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15.5px] leading-[1.6]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {s.t}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.9] text-keshizumi">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <dl className="mt-10 border-t border-shironezu">
            {TERMS.map(([t, d]) => (
              <div key={t} className="flex flex-col gap-1 border-b border-shironezu py-5 sm:flex-row sm:gap-6">
                <dt className="shrink-0 text-[13.5px] sm:w-[8em]" style={{ ...MINCHO, fontWeight: 700 }}>
                  {t}
                </dt>
                <dd className="text-[14px] leading-[1.9] text-keshizumi">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ══ 相談 ══ */}
        <section className="mt-[96px] sm:mt-[136px] border-y border-shironezu bg-hakuji px-6 py-12 sm:px-10 sm:py-14">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            まず、相談から
          </h2>
          <p className="mt-4 max-w-[32em] text-[14.5px] leading-[2] text-keshizumi">
            ご相談の時点で費用は発生しません。実名も顔写真も不要です。
            合わないと思えば、こちらからそう言います。
          </p>
          <p className="mt-7">
            <Link
              href="/reserve"
              className="inline-flex items-baseline gap-2 text-[15px] font-bold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
            >
              無料で相談する
              <span aria-hidden>→</span>
            </Link>
          </p>
        </section>

        {/* ══ よくある質問 ══ */}
        <section className="mt-[96px] sm:mt-[136px]">
          <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
            よくある質問
          </h2>
          <div className="mt-9 flex flex-col gap-12">
            {FAQ_CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <h3 className="text-[13px] text-dou">{cat.label}</h3>
                <dl className="mt-4 border-t border-shironezu">
                  {cat.items.map((f) => (
                    <div key={f.q} className="border-b border-shironezu py-5">
                      <dt className="text-[15px] font-bold leading-[1.7]">{f.q}</dt>
                      <dd className="mt-2 text-[14.5px] leading-[1.95] text-keshizumi">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-14 text-[13px] leading-[1.95] text-ainezu">
          ※ 医療行為は行いません。診断・治療方針の決定は医師の領域です。
          効果・仕上がり・習得を保証するものではありません。
        </p>

        <p className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-shironezu pt-8 text-[14px]">
          <Link
            href="/#index"
            className="font-bold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
          >
            記事をさがす<span aria-hidden> →</span>
          </Link>
          <Link
            href="/reserve"
            className="font-bold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
          >
            無料で相談する<span aria-hidden> →</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
