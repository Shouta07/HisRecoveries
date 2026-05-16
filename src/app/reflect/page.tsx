import type { Metadata } from "next";
import { site } from "@/lib/site";
import ReflectClient from "./ReflectClient";

export const metadata: Metadata = {
  title: "整理する",
  description:
    "5 つの問いに静かに答えることで、いま自分がどの地形にいるかを言葉にする場所。診断ではなく、観察。",
  alternates: { canonical: `${site.url}/reflect` },
  openGraph: {
    title: `整理する — ${site.name}`,
    description:
      "5 つの問いに静かに答えることで、いま自分がどの地形にいるかを言葉にする場所。",
  },
};

export default function ReflectPage() {
  return (
    <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
          いまの自分を、整理する
        </h1>
        <p className="mt-6 font-mincho text-sub-gray text-[0.9375rem] leading-[2] max-w-[34rem]">
          5 つの問いに答えることで、いまの自分がどの地形にいるかを言葉にする時間。
          診断ではありません。観察として、急がずに進めてください。
          途中でやめても、答えなくても構いません。
        </p>
      </header>

      <ReflectClient />

      <p className="mt-16 text-xs text-sub-gray leading-[1.9]">
        回答内容はあなたのブラウザの中だけにあり、サーバには送信されません。
      </p>
    </div>
  );
}
