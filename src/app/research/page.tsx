import type { Metadata } from "next";
import Link from "next/link";
import {
  SURVEYS,
  HAS_RESEARCH,
  KIND_LABEL,
  totalRespondents,
  assertSurveys,
} from "@/lib/research";
import { formatDate } from "@/lib/articleDates";
import { site, ogImage } from "@/lib/site";

// 調査（一次情報）の一覧。
//
// ── なぜ空のまま出すか ──────────────────────────
// 取材は始めたところで、まだ1件も終わっていない。
// 「準備中」と書いて隠すこともできるが、それだと
// いつ始まるのか、本当にやる気があるのかが分からない。
// 0件と書いて、何を集めようとしているかを先に出すほうが確かめられる。
//
// ── AIが引用する前提で組む ────────────────────────
// 誰に・何人に・いつ・どうやって・何を聞いて・何が分かったか。
// この6つが揃っていないものは、そもそも載らない（lib/research.ts が落とす）。
// 揃っているから、引用されたときに間違えられない。
//
// 組みはサイト共通（白練の地・明朝の見出し・罫線・カードなし）。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/research`;
const TITLE = "調査";
const DESC =
  "His Recoveries が自分で集めた一次情報の一覧です。誰に・何人に・いつ・どうやって聞いたかと、答えられていないことを併記しています。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    siteName: site.name,
    locale: site.locale,
    title: `${TITLE} — 誰に、何人に、いつ聞いたか`,
    description: "一次情報の一覧。答えられていないことも書いています。",
    images: [ogImage],
  },
};

/** 集めようとしているもの。まだ無いので、予定として出す */
const PLANNED = [
  { kind: "当事者への取材", t: "何に悩み、何をやめたか", how: "診断を終えた方に、その場で伺っています" },
  { kind: "専門家への取材", t: "男性が最初に変えるべきところ", how: "美容師・医師などに順次お願いしていきます" },
  { kind: "価格の調査", t: "実際にいくらかかるのか", how: "各社が公開している価格を、確認日つきで集めます" },
  { kind: "利用者の行動データ", t: "何をやって、続いたか", how: "診断の結果画面で記録された行動を、匿名で集計します" },
];

export default function ResearchPage() {
  // 欠けた調査が載っていないかを、公開の前に確かめる
  assertSurveys();

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#page`,
    url,
    name: `${TITLE} — ${site.name}`,
    description: DESC,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SURVEYS.length,
      itemListElement: SURVEYS.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Dataset",
          name: s.theme,
          description: s.findings.join(" "),
          temporalCoverage: `${s.from}/${s.to}`,
          measurementTechnique: s.method,
          creator: { "@type": "Organization", name: site.name, url: site.url },
        },
      })),
    },
  };

  return (
    <main className="bg-shironeri">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-reading px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <nav aria-label="パンくず" className="text-[12.5px] text-ainezu">
          <Link href="/" className="transition-colors hover:text-asagi">
            ホーム
          </Link>
        </nav>

        <header className="mt-7">
          <h1 className="text-[26px] leading-[1.5] sm:text-[34px]" style={{ ...MINCHO, fontWeight: 700 }}>
            調査
          </h1>
          <p className="mt-5 text-[15.5px] leading-[2.05] text-keshizumi">
            このサイトが自分で集めた情報を、ここに置きます。
            誰に、何人に、いつ、どうやって聞いたか。そして
            <span className="font-bold text-sumi">答えられていないことも、一緒に書きます。</span>
          </p>
          <p className="mt-4 text-[15.5px] leading-[2.05] text-keshizumi">
            この6つが揃っていない調査は、ここに載せられない仕組みにしてあります。
            揃っていないものは、調査ではなく感想だからです。
          </p>
        </header>

        {HAS_RESEARCH ? (
          <>
            <p className="mt-10 border-y border-shironezu py-4 text-[14px] tabular-nums text-ainezu">
              調査 {SURVEYS.length}件 ／ 延べ {totalRespondents()}人・件
            </p>
            <div className="mt-12 flex flex-col gap-14">
              {SURVEYS.map((s) => (
                <section key={s.id} className="border-t border-shironezu pt-8">
                  <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[12.5px]">
                    <span className="text-asagi">{KIND_LABEL[s.kind]}</span>
                    <span className="tabular-nums text-ainezu">
                      {formatDate(s.from)}〜{formatDate(s.to)}
                    </span>
                    <span className="tabular-nums text-ainezu">{s.n}人・件</span>
                  </p>
                  <h2
                    className="mt-2.5 text-[20px] leading-[1.55] sm:text-[23px]"
                    style={{ ...MINCHO, fontWeight: 700 }}
                  >
                    {s.theme}
                  </h2>

                  <dl className="mt-5 space-y-3 text-[14.5px] leading-[1.95]">
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                      <dt className="shrink-0 text-ainezu sm:w-[6em]">聞いた相手</dt>
                      <dd className="text-keshizumi">{s.who}</dd>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                      <dt className="shrink-0 text-ainezu sm:w-[6em]">集め方</dt>
                      <dd className="text-keshizumi">{s.method}</dd>
                    </div>
                  </dl>

                  <p className="mt-6 text-[12.5px] text-ainezu">聞いたこと</p>
                  <ul className="mt-2 space-y-1.5 text-[14.5px] leading-[1.9] text-keshizumi">
                    {s.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>

                  <p className="mt-6 text-[12.5px] text-ainezu">分かったこと</p>
                  <ul className="mt-2 space-y-2 text-[15px] leading-[1.95] text-sumi">
                    {s.findings.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  <p className="mt-6 text-[12.5px] text-ainezu">答えられていないこと</p>
                  <ul className="mt-2 space-y-1.5 text-[14.5px] leading-[1.9] text-ainezu">
                    {s.limits.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>

                  {s.source && (
                    <p className="mt-5 text-[13px] leading-[1.9] text-ainezu">出典：{s.source}</p>
                  )}
                </section>
              ))}
            </div>
          </>
        ) : (
          <section className="mt-12 border-l-2 border-asagi pl-5 sm:pl-6">
            <p className="text-[16px] leading-[2] text-sumi" style={{ ...MINCHO, fontWeight: 700 }}>
              いま公開できる調査は、0件です。
            </p>
            <p className="mt-3 text-[15px] leading-[1.95] text-keshizumi">
              始めたところで、まだ1件も終わっていません。
              「準備中」と書いて隠すこともできますが、それだと本当にやるのかが分かりません。
              集めようとしているものを、先に出しておきます。
            </p>
          </section>
        )}

        {/* 何を集めようとしているか */}
        <section className="mt-16">
          <h2 className="text-[19px] sm:text-[21px]" style={{ ...MINCHO, fontWeight: 700 }}>
            これから集めるもの
          </h2>
          <dl className="mt-6 border-t border-shironezu">
            {PLANNED.map((p) => (
              <div key={p.t} className="border-b border-shironezu py-4">
                <dt className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-[12.5px] text-asagi">{p.kind}</span>
                  <span className="text-[16px] leading-[1.7]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {p.t}
                  </span>
                </dt>
                <dd className="mt-1.5 text-[14.5px] leading-[1.95] text-keshizumi">{p.how}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 何を一次情報として扱わないか */}
        <section className="mt-16 border-l-2 border-ainezu/40 pl-5 sm:pl-6">
          <h2 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            ここに載せないもの
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14.5px] leading-[1.95] text-keshizumi">
            <li>
              生成AIがまとめた一般論。調査の区分そのものを用意していないので、載せられません。
            </li>
            <li>人数を数えていないもの。「多くの男性が」は書けません。</li>
            <li>集め方を書けないもの。どう集めたか言えないなら、調査ではなく感想です。</li>
            <li>答えられていないことを書いていないもの。</li>
          </ul>
        </section>

        <section className="mt-16 border-t border-shironezu pt-10">
          <p className="text-[15.5px] leading-[2.05] text-keshizumi">
            1件目は、診断を終えた方に伺っているところです。
          </p>
          <p className="mt-5">
            <Link
              href="/interview"
              className="text-[15px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
            >
              取材にご協力いただけませんか
              <span aria-hidden> →</span>
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
