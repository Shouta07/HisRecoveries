import type { Metadata } from "next";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllServices } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "サービスを探す — His Recoveries",
  description:
    "His Recoveries が編集の目で保証するサービスのキュレーション。AGA・メンズ美容・睡眠・ジム・コーチング。紹介手数料を取らず、外部直リンクでお繋ぎします。掲載は買えません。",
  alternates: { canonical: `${site.url}/services` },
  openGraph: {
    title: `サービスを探す — ${site.name}`,
    description: "編集の目で保証する、男性活力市場のキュレーション。",
  },
};

export default function ServicesIndexPage() {
  const items = getAllServices();

  return (
    <>
      <div className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-12">
        <header className="mb-12 sm:mb-16">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            Curation — Services
          </p>
          <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]">
            買えない、編集者の保証。
          </h1>
          <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
            男性活力市場のサービスを、編集者が選びます。AGA・メンズ美容・睡眠・ジム・コーチング。
            掲載は買えません。紹介手数料はゼロ。問い合わせは事業者へ直接お願いします。
          </p>
          <div className="mt-6">
            <NeutralBadge />
          </div>
        </header>

        {items.length === 0 ? (
          <section className="border border-hair-line bg-paper p-8">
            <p className="font-mincho text-[15px] text-ink leading-[2.05]">
              認証されたサービスは、まだ一つもありません。
            </p>
            <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
              最初の数社と「共創の対話」を進めています。
              急いで増やすつもりはありません。質で並べます。
            </p>
            <div className="mt-6">
              <Link
                href="/partners"
                className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
              >
                パートナー認証について →
              </Link>
            </div>
          </section>
        ) : (
          <ul className="border-t border-hair-line">
            {items.map((s) => (
              <li key={s.slug} className="border-b border-hair-line">
                <Link
                  href={`/services/${s.slug}`}
                  className="group block py-7 hover:bg-paper/40 transition-colors"
                >
                  <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                    {s.category}
                    {s.region ? ` · ${s.region}` : ""}
                  </p>
                  <h2 className="mt-2 font-mincho text-lg sm:text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                    {s.name}
                  </h2>
                  <p className="mt-2 text-[12.5px] text-sub-gray">
                    {s.operator}
                    {s.priceBand ? ` · ${s.priceBand}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
      </div>

      <NextStepBlock
        eyebrow="For partners"
        title="この場所に並ぶ"
        body="5原則（顧客理解／強引営業の禁止／改善データの提供／顧客教育／長期伴走）を満たすクリニック・サロン・ジム・専門家のみ認証しています。紹介手数料は取りません。"
        primary={{ href: "/partners", label: "認証について読む" }}
        secondary={{ href: "/interview", label: "事業者として応募する" }}
      />
    </>
  );
}
