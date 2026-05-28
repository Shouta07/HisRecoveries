import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getAllArticles } from "@/lib/articles";
import ReflectClient from "./ReflectClient";

export const metadata: Metadata = {
  title: "Reflect — 自分を整理する",
  description:
    "5 つの問いに静かに答えると、いまの自分に近い記録が並びます。多汗症・ワキガ・ニキビ・顔の印象・薄毛・髭体毛・心と自意識のうち、どの領域から読みはじめるかを、診断ではなく観察として手渡す質問フロー。Male Conditioning のための整理ツール。",
  alternates: { canonical: `${site.url}/reflect` },
  openGraph: {
    title: `Reflect — ${site.name}`,
    description:
      "5 つの問いに静かに答えると、いまの自分に近い記録が並びます。診断ではなく、観察。",
  },
};

export default function ReflectPage() {
  const articles = getAllArticles();

  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
          いまの自分を、整理する
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          5 つの問いに答えると、いまの自分に近い記録が並びます。
          診断ではありません。観察として、急がずに進めてください。
          途中でやめても、答えなくても構いません。
        </p>
      </header>

      <ReflectClient articles={articles} />

      <p className="mt-16 text-xs text-sub-gray leading-[1.9]">
        回答内容はあなたのブラウザの中だけにあり、サーバには送信されません。
      </p>
    </div>
  );
}
