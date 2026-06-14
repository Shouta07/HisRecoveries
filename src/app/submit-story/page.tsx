import type { Metadata } from "next";
import { site } from "@/lib/site";
import SubmitStoryClient from "./SubmitStoryClient";

export const metadata: Metadata = {
  title: "Share Your Recovery Story — 回復体験を共有する",
  description:
    "あなたの回復体験を、His Recoveries のアーカイブに共有してください。髪、肌、汗、匂い、ヒゲ、体型、自信。匿名掲載可能。返信は約束しませんが、必ず読みます。",
  alternates: { canonical: `${site.url}/submit-story` },
  openGraph: {
    title: `Share Your Recovery Story — ${site.name}`,
    description: "あなたの回復体験を共有する。",
  },
};

export default function SubmitStoryPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <header className="mb-14">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Share Your Recovery Story
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.4]">
          回復体験を、共有する。
        </h1>
        <p className="mt-7 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          かつてのあなたの記録が、いま同じ場所にいる誰かの希望になります。
          すっかり終わった話でなくて構いません。
          回復の途中、ほんの少しの変化、断片でも。匿名でも構いません。
        </p>
      </header>

      <SubmitStoryClient />

      <p className="mt-16 text-xs text-sub-gray leading-[1.9]">
        匿名掲載の場合、メールアドレスや個人情報は公開されません。
        返信は約束できませんが、必ず読みます。
      </p>
    </div>
  );
}
