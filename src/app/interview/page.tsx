import type { Metadata } from "next";
import Link from "next/link";
import NeutralBadge from "@/components/NeutralBadge";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "インタビューを受ける — His Recoveries",
  description:
    "His Recoveries は、人生を前進させた男性たちの実例、男性の悩みを正面から扱う専門家、誠実な事業者の声を集めています。ユーザー・専門家・事業者の3種からお応募いただけます。",
  alternates: { canonical: `${site.url}/interview` },
};

const TYPES = [
  {
    href: "/ask",
    title: "ユーザー（当事者）として",
    eyebrow: "Recovery / 実例として",
    body: "あなたの「悩み・行動・変化・現在」を、匿名化のうえ実例として残せます。完了形でない、半歩進んだ時間の記録として。",
    cta: "問いを置く（まずひとつだけ）",
  },
  {
    href: "mailto:contact@vitality-design.jp?subject=Recovery%20Q%26A%E5%B0%82%E9%96%80%E5%AE%B6%E3%83%91%E3%83%8D%E3%83%AB%E5%BF%9C%E5%8B%9F",
    title: "専門家として",
    eyebrow: "Expert / 知見の登壇",
    body: "医師・トレーナー・コーチ・カウンセラー・美容専門家。HR の編集判断は独立、回答内の宣伝は入れない規律で運営しています。",
    cta: "編集者にメールで応募",
    external: true,
  },
  {
    href: "/partners",
    title: "事業者として",
    eyebrow: "Operator / 認証パートナー",
    body: "クリニック・サロン・ジム・専門サービス。5原則（顧客理解／強引営業の禁止／改善データ提供／顧客教育／長期伴走）を満たす相手のみ。紹介手数料は受け取りません。",
    cta: "パートナー認証について",
  },
] as const;

export default function InterviewPage() {
  return (
    <div className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      <header className="mb-12 sm:mb-16">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Interview
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.3]">
          インタビューを、
          <br />
          受ける。
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
          人生を前進させた男性の声、男性の悩みを正面から扱う専門家、誠実な事業者。
          いずれもお応募いただけます。編集者が読み、対話のあとに公開を判断します。
        </p>
        <div className="mt-6">
          <NeutralBadge />
        </div>
      </header>

      <ul className="space-y-px border-t border-hair-line">
        {TYPES.map((t) => (
          <li key={t.title} className="border-b border-hair-line">
            <Link
              href={t.href}
              {...("external" in t && t.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group block py-7 sm:py-8 hover:bg-paper/40 transition-colors"
            >
              <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold">
                {t.eyebrow}
              </p>
              <h2 className="mt-3 font-mincho text-lg sm:text-xl text-ink leading-[1.45] group-hover:text-gold transition-colors">
                {t.title}
              </h2>
              <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[1.95]">
                {t.body}
              </p>
              <span className="mt-4 inline-flex text-[13px] tracking-[0.1em] text-ink border-b border-gold/60 pb-0.5 group-hover:text-gold transition-colors">
                {t.cta} <span aria-hidden className="ml-2">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 font-mincho text-[13px] text-sub-gray leading-[2]">
        どのケースでも、編集者が読みます。返信は数日以内に。
        匿名化と本人同意を、公開の絶対条件にしています。
      </p>
      <div className="mt-6">
        <MedicalDisclaimer />
      </div>
    </div>
  );
}
