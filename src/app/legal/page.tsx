import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "特定商取引法に基づく表記",
  alternates: { canonical: `${site.url}/legal` },
  robots: { index: true, follow: true },
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-12">
        <p className="text-[10px] tracking-widest text-sub-gray">LEGAL</p>
        <h1 className="mt-3 font-mincho text-xl sm:text-2xl text-ink">
          特定商取引法に基づく表記
        </h1>
      </header>

      <dl className="text-xs leading-[2] text-ink space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">販売事業者</dt>
          <dd>バイタリティデザイン合同会社</dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">代表者</dt>
          <dd>山本翔太</dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">所在地</dt>
          <dd>
            ご請求があった場合、遅滞なく開示いたします。
            <br />
            （法人登記住所。請求は下記連絡先まで。）
          </dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">連絡先</dt>
          <dd>
            <a
              href={`mailto:${site.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.email}
            </a>
          </dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">販売価格</dt>
          <dd>本サイトでは現在、有料商品の販売は行っておりません。</dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">支払方法</dt>
          <dd>該当なし</dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">引渡時期</dt>
          <dd>該当なし</dd>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4">
          <dt className="text-sub-gray">返品・キャンセル</dt>
          <dd>該当なし</dd>
        </div>
      </dl>
    </div>
  );
}
