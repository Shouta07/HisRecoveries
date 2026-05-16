import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "His Recoveries のプライバシーポリシーです。",
  alternates: { canonical: `${site.url}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-12">
        <p className="text-xs tracking-widest text-sub-gray">PRIVACY</p>
        <h1 className="mt-3 font-mincho text-2xl sm:text-3xl text-ink">
          プライバシーポリシー
        </h1>
      </header>

      <div className="text-sm leading-[2] text-ink space-y-8">
        <section>
          <h2 className="font-mincho text-lg mb-3">1. 基本方針</h2>
          <p>
            His Recoveries（以下「当サイト」）は、当サイトを利用するすべての方の
            個人情報を尊重し、その保護に努めます。本ポリシーは、当サイトにおける
            個人情報の取り扱いについて定めるものです。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">2. 取得する情報</h2>
          <p>
            当サイトでは、お問い合わせフォームまたはメールでのご連絡時に、
            お名前・メールアドレス等の個人情報をご提供いただく場合があります。
          </p>
          <p className="mt-4">
            また、サイトの利用状況を把握するために、アクセス解析ツールを利用し、
            個人を直接特定しない範囲で、閲覧ページ、リファラ、デバイス情報等を
            取得することがあります。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">3. 利用目的</h2>
          <p>
            取得した情報は、お問い合わせへの返信、サイトの改善、
            および法令遵守のためにのみ利用します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">4. 第三者提供</h2>
          <p>
            法令に基づく場合を除き、ご本人の同意なく個人情報を
            第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">5. アクセス解析</h2>
          <p>
            当サイトはアクセス解析にプライバシー配慮型のツール
            （Plausible Analytics または Google Analytics 4）を利用する場合があります。
            これらはクッキー等を利用することがありますが、収集される情報は匿名であり、
            個人を特定するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">6. Cookie</h2>
          <p>
            当サイトは、サイト機能の提供および利用状況の把握のために
            Cookie を利用することがあります。ブラウザ設定で Cookie を
            無効化することは可能です。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">7. 改訂</h2>
          <p>
            本ポリシーは必要に応じて改訂します。最新の内容は本ページに掲載します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">8. お問い合わせ</h2>
          <p>
            本ポリシーに関するお問い合わせは、
            <a
              href={`mailto:${site.email}`}
              className="border-b border-hair-line hover:border-ink transition-colors"
            >
              {site.email}
            </a>{" "}
            までお願いいたします。
          </p>
        </section>

        <section className="border-t border-hair-line pt-8 mt-12 text-xs text-sub-gray">
          <h2 className="text-xs mb-2">運営者</h2>
          <p>バイタリティデザイン合同会社</p>
          <p>制定日: 2026年5月16日</p>
        </section>
      </div>
    </div>
  );
}
