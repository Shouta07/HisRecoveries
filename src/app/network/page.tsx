import type { Metadata } from "next";
import Link from "next/link";
import { dbSelect, dbAdminEnabled } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Certified Network — 男性の沈黙を任せられる相手を",
  description:
    "His Recoveries は商品も施術も売りません。だから中立に、男性の悩みを正面から扱うに足るクリニック・サロン・ジム・専門家を認証します。5 つの原則（顧客理解 / 強引営業の禁止 / 改善データの提供 / 顧客教育 / 長期伴走）と覆面審査。紹介手数料も広告費も受け取りません。",
  alternates: { canonical: `${site.url}/network` },
  openGraph: {
    title: `Recovery Certified Network — ${site.name}`,
    description:
      "顧客理解と長期伴走を約束したクリニック・サロン・ジム・専門家の認証連合。",
    url: `${site.url}/network`,
  },
};

export const dynamic = "force-dynamic";

type CertifiedRow = {
  id: string;
  org_name: string;
  org_type: string;
  location: string | null;
  website_url: string | null;
  public_blurb: string | null;
  certified_year: number | null;
};

const TYPE_LABELS: Record<string, string> = {
  clinic: "クリニック",
  salon: "サロン",
  gym: "ジム / トレーニング",
  specialist: "専門家",
};

export default async function NetworkPage() {
  const certified = dbAdminEnabled
    ? await dbSelect<CertifiedRow>(
        "certified_applications?select=id,org_name,org_type,location,website_url,public_blurb,certified_year&status=eq.certified&order=org_name.asc"
      )
    : [];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recovery Certified Network",
        item: `${site.url}/network`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <header className="mb-16 sm:mb-20 max-w-[42rem]">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Certified Network
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          男性の沈黙を任せられる、
          <br />
          数少ない相手を。
        </h1>
        <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
          His Recoveries は、商品も施術も売りません。だから、中立でいられます。
          その立場でできる唯一のことが、男性の悩みを正面から扱うに足る相手を、
          編集者の目で認証することです。
        </p>
        <p className="mt-6 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
          認証されたクリニック・サロン・ジム・専門家は、5 つの原則を毎年更新し、
          編集者による覆面の顧客審査を通過しています。紹介手数料も広告費も、
          私たちからもパートナーからも、一切受け取りません。
          だから、ここに名前があることは、お金では買えません。
        </p>
      </header>

      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          5 つの原則
        </p>
        <ol className="border-t border-hair-line">
          {[
            {
              n: "01",
              t: "顧客理解",
              d: "カウンセリングの過程を記録に残し、相手の状態を、本人と一緒に言葉にする。売る前に、まず理解する。",
            },
            {
              n: "02",
              t: "強引営業の禁止",
              d: "初回相談から最低 24 時間のクーリング期間を置き、その日のうちの決断を、決して迫らない。",
            },
            {
              n: "03",
              t: "改善データの提供",
              d: "施術後 6 ヶ月・1 年の顧客の状態を、匿名で His Recoveries に共有する。検証できない「効果」は、語らない。",
            },
            {
              n: "04",
              t: "顧客教育",
              d: "院内・店内に、決定を急がせないための読み物を備える。迷う時間を、奪わない。",
            },
            {
              n: "05",
              t: "長期伴走",
              d: "単発の処置で終わらせず、年単位で付き合う選択肢を、必ず差し出す。",
            },
          ].map((p) => (
            <li key={p.n} className="border-b border-hair-line py-6">
              <div className="grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr] gap-4">
                <span className="logo-type italic text-[13px] tracking-[0.2em] text-gold">
                  {p.n}
                </span>
                <div>
                  <p className="font-mincho text-lg text-ink">{p.t}</p>
                  <p className="mt-2 font-mincho text-[14px] text-ink/80 leading-[2]">
                    {p.d}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[12px] text-sub-gray leading-[2]">
          認証は毎年更新されます。原則が守られていないと判断した場合、認証を取り消します。
          取り消した事例は、年に一度、このページで公開します。隠さないことも、原則のひとつです。
        </p>
      </section>

      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          Certified Partners
        </p>
        {certified.length === 0 ? (
          <div className="border border-hair-line bg-paper p-8 sm:p-10">
            <p className="font-mincho text-[15px] text-ink leading-[2.05]">
              認証パートナーは、まだ一つもありません。
            </p>
            <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
              いま His Recoveries は、男性が本当は何に悩んでいるのか——その一次情報を
              集めている段階です。十分な理解が貯まったうえで、2026 年内に、
              最初の数院・数名を認証します。最初の認証が決まれば、ここに名前が並びます。
              急いで数を増やすつもりは、ありません。
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {certified.map((c) => (
              <li
                key={c.id}
                className="border border-hair-line bg-paper p-6 flex flex-col"
              >
                <p className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  {TYPE_LABELS[c.org_type] ?? c.org_type}
                  {c.location ? ` · ${c.location}` : ""}
                </p>
                <h3 className="mt-3 font-mincho text-lg text-ink leading-[1.55]">
                  {c.org_name}
                </h3>
                {c.public_blurb && (
                  <p className="mt-3 font-mincho text-[13.5px] text-ink/80 leading-[2]">
                    {c.public_blurb}
                  </p>
                )}
                <div className="mt-auto pt-4 flex items-baseline justify-between gap-3">
                  <p className="text-[11px] tracking-[0.06em] text-sub-gray">
                    認証 {c.certified_year ?? "—"}
                  </p>
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] tracking-[0.08em] text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
                    >
                      Web →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-hair-line bg-paper p-6 sm:p-8 mb-12">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          For partners
        </p>
        <h2 className="font-mincho text-xl text-ink leading-[1.5]">
          認証を申請する
        </h2>
        <p className="mt-4 font-mincho text-[14px] text-ink/85 leading-[2]">
          5 つの原則をすでに満たしている、あるいは半年以内に満たす意志のある
          クリニック・サロン・ジム・専門家からの申請を受け付けています。
          数ではなく、質で選びます。
        </p>
        <p className="mt-3 font-mincho text-[12.5px] text-sub-gray leading-[2]">
          申請料・年会費は、β 期間中は無料です。
          審査には、覆面顧客審査の日程調整を含めて、平均 4〜8 週間かかります。
        </p>
        <div className="mt-6">
          <Link href="/network/apply" className="btn-gold !py-3 !px-5 text-xs">
            認証を申請する →
          </Link>
        </div>
      </section>

      <section>
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-5">
          Not what this is
        </p>
        <ul className="font-mincho text-[14px] leading-[2] text-ink/80 space-y-1.5 max-w-[34rem]">
          <li>— 紹介手数料を受け取りません</li>
          <li>— パートナーから広告費を受け取りません</li>
          <li>— 「比較サイト」ではありません</li>
          <li>— 認証は買えません</li>
        </ul>
      </section>
    </div>
  );
}
