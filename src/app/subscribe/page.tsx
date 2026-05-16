import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "His Recoveries の更新を、控えめに、ときどき。Substack で受け取れます。",
  alternates: { canonical: `${site.url}/subscribe` },
};

export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-sub-gray">SUBSCRIBE</p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink">
          ときどき、静かに届く
        </h1>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.1] text-ink space-y-6 max-w-[36rem]">
        <p>
          頻度は、月に一度から二度ほど。新しく書いた記録と、
          まだ記事にしていない覚え書きを、ニュースレターでお送りします。
        </p>

        <p>
          通知も、ボタンも、煽りもありません。気が向いたときに開けば足ります。
        </p>

        <div className="mt-12">
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-ink px-8 py-3 text-sm tracking-widest text-ink hover:bg-ink hover:text-off-white transition-colors"
          >
            Substack で購読する
          </a>
        </div>

        <p className="mt-12 text-sm text-sub-gray">
          メールでの直接の連絡は{" "}
          <a
            href={`mailto:${site.email}`}
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            {site.email}
          </a>{" "}
          まで。
        </p>
      </div>
    </div>
  );
}
