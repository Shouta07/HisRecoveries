import type { Metadata } from "next";
import { Suspense } from "react";
import AskClient from "./AskClient";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Q&A に問いを置く",
  description:
    "言葉にしにくい悩みを、いまの言葉のまま編集者に届ける場所。多汗症・ワキガ・ニキビ跡・薄毛・体毛・顔・自意識。匿名で書けて、編集者が手紙で答えます。診断はしません。",
  alternates: { canonical: `${site.url}/ask` },
  openGraph: {
    title: `Recovery Q&A — ${site.name}`,
    description: "言葉にしにくい問いを、いまの言葉のままで置く。",
    url: `${site.url}/ask`,
  },
};

export const dynamic = "force-dynamic";

export default function AskPage() {
  return (
    <div className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-24 pb-24">
      <header className="mb-12 sm:mb-16">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          Recovery Q&A
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-5xl text-ink leading-[1.35]">
          いまの言葉のまま、
          <br />
          ひとつだけ、置いていってください。
        </h1>
        <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
          整っていなくて構いません。問いと、いまの場面が分かれば、編集者が読んで、
          数日以内に手紙で返事を書きます。
        </p>
        <p className="mt-5 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
          診断はしません。治療を売ることもしません。半歩先からの観察を、静かにお返しします。
        </p>
      </header>

      <Suspense fallback={null}>
        <AskClient />
      </Suspense>
    </div>
  );
}
