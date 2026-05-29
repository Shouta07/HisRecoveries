import type { Metadata } from "next";
import { site } from "@/lib/site";
import AssessmentClient from "./AssessmentClient";

export const metadata: Metadata = {
  title: "Recovery Assessment — 回復を始める",
  description:
    "Recovery Assessment。いまの状態を簡単に整理する 5 つの問い。多汗症、ワキガ、ニキビ跡、AGA、ヒゲ脱毛、体型、自信。男性のコンプレックスを当事者として整える、His Recoveries の入口。",
  alternates: { canonical: `${site.url}/assessment` },
  openGraph: {
    title: `Recovery Assessment — ${site.name}`,
    description: "回復を始める。5 つの問いに、静かに答えてください。",
  },
};

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <header className="mb-14">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Assessment
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.4]">
          回復を、始める。
        </h1>
        <p className="mt-7 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          いまの状態を簡単に整理する、5 つの問い。
          診断ではありません。あなたの言葉を、あなた自身に渡すための時間です。
          途中で止めても構いません。
        </p>
      </header>

      <AssessmentClient />

      <p className="mt-16 text-xs text-sub-gray leading-[1.9]">
        回答内容はあなたのブラウザの中に保存されます。
        メールアドレスは Recovery Letter（任意のニュースレター）を希望する方のみ。
      </p>
    </div>
  );
}
