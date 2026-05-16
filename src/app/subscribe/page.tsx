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
      <header className="mb-20">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Subscribe — A Quiet Delivery
        </p>
        <h1 className="mt-5 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          ときどき、静かに届く
        </h1>
      </header>

      <div className="font-mincho text-[1.0625rem] leading-[2.2] text-ink space-y-7 max-w-[36rem]">
        <p>
          頻度は月に一度か二度。新しく書いた記録と、
          まだ記事にしていない覚え書きを、ニュースレターに収めて送ります。
        </p>

        <p>
          通知も、ボタンも、煽りもありません。
          気が向いたときに開けば、それで足ります。
        </p>

        <p className="text-sub-gray pt-4">
          <em className="not-italic logo-type tracking-wider text-base">
            One letter, then silence — until the next.
          </em>
        </p>

        <div className="mt-16">
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-ink px-10 py-4 text-sm tracking-[0.2em] uppercase text-ink hover:bg-ink hover:text-off-white transition-colors"
          >
            Substack で購読する
          </a>
        </div>

        <p className="mt-16 text-sm text-sub-gray leading-[2]">
          メールでの直接の連絡は{" "}
          <a
            href={`mailto:${site.email}`}
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            {site.email}
          </a>{" "}
          まで。
          <br />
          Atom フィードは{" "}
          <a
            href="/feed.xml"
            className="border-b border-hair-line hover:border-ink transition-colors"
          >
            /feed.xml
          </a>
          。
        </p>

        <p className="logo-type text-base text-ink mt-12 tracking-wider">
          —— Nagi
        </p>
      </div>
    </div>
  );
}
