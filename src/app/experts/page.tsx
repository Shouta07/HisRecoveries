import type { Metadata } from "next";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import NextStepBlock from "@/components/NextStepBlock";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { getAllExperts } from "@/lib/experts";
import { TERRITORY_LABEL } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "専門家 — His Recoveries",
  description:
    "His Recoveries が編集の目で認証する、男性の悩みを正面から扱う専門家のディレクトリ。医師・トレーナー・コーチ・カウンセラー・美容専門家。紹介手数料を取らず、HRが推薦するのではなく基準に達した人だけを並べます。",
  alternates: { canonical: `${site.url}/experts` },
  openGraph: {
    title: `専門家 — ${site.name}`,
    description: "男性の沈黙を任せられる、数少ない専門家を編集する。",
  },
};

export default function ExpertsIndexPage() {
  const items = getAllExperts();

  return (
    <>
      <div className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-12">
        <header className="mb-12 sm:mb-16">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            Interviews — Experts
          </p>
          <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]">
            男性活力を支える、
            <br />
            取材された専門家。
          </h1>
          <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
            医師・トレーナー・コーチ・カウンセラー・美容専門家。編集者が直接話を聞き、
            「なぜこの仕事をしているか」「上手くいく人の共通点」を取材して載せています。
            HR が推薦するのではなく、編集の基準に達した方だけを並べます。
            紹介手数料はゼロ。連絡は本人へ直接お願いします。
          </p>
          <div className="mt-6">
            <NeutralBadge />
          </div>
        </header>

        {items.length === 0 ? (
          <section className="border border-hair-line bg-paper p-8">
            <p className="font-mincho text-[15px] text-ink leading-[2.05]">
              認証された専門家は、まだ一名もいません。
            </p>
            <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
              一次理解を集めながら、最初の数名と共創の対話を始めています。
              「数より質」で進めるため、急いで増やすつもりはありません。
            </p>
            <div className="mt-6">
              <Link
                href="/interview"
                className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
              >
                専門家として応募する →
              </Link>
            </div>
          </section>
        ) : (
          <ul className="border-t border-hair-line">
            {items.map((e) => (
              <li key={e.slug} className="border-b border-hair-line">
                <Link
                  href={`/experts/${e.slug}`}
                  className="group block py-7 hover:bg-paper/40 transition-colors"
                >
                  <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                    {e.role}
                    {e.region ? ` · ${e.region}` : ""}
                  </p>
                  <h2 className="mt-2 font-mincho text-lg sm:text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                    {e.name}
                  </h2>
                  {e.field.length > 0 && (
                    <p className="mt-2 text-[12px] text-sub-gray">
                      {e.field.map((f) => TERRITORY_LABEL[f] ?? f).join(" / ")}
                    </p>
                  )}
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
        eyebrow="For experts"
        title="この場所に登壇する"
        body="HR の編集判断は独立に保ち、回答内の宣伝・広告誘導は入れない規律で運営しています。共創の対話を、いつでも。"
        primary={{ href: "/interview", label: "専門家として応募する" }}
        secondary={{ href: "/qa", label: "Recovery Q&A を見る" }}
      />
    </>
  );
}
