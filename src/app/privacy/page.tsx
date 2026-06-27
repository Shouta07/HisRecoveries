import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー・免責事項",
  description:
    "His Recoveries のプライバシーポリシーおよび免責事項です。本プログラムは完全匿名・完全守秘義務のもとで運営し、医療行為は行いません。診断・治療は連携する医療機関が行います。",
  alternates: { canonical: `${site.url}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-reading px-6 pb-24 pt-20 sm:pt-28">
      <header className="mb-12">
        <p className="text-xs tracking-widest text-sub-gray">
          PRIVACY &amp; DISCLAIMER
        </p>
        <h1 className="mt-3 font-mincho text-2xl sm:text-3xl text-ink">
          プライバシーポリシー・免責事項
        </h1>
      </header>

      {/* Medical & neutrality disclaimer — placed prominently at the top. */}
      <section className="mb-12 border border-hair-line bg-paper p-5 sm:p-7 text-sm leading-[2] text-ink">
        <h2 className="font-mincho text-lg mb-3 text-ink">
          免責事項（医療・中立性）
        </h2>
        <p>
          His Recoveries（以下「本プログラム」）は、完全匿名・完全守秘義務のもとで
          運営する招待制のコンプレックス改善プログラムです。
          <strong className="font-bold">
            本プログラムは医療行為ではなく、診断・治療・投薬その他の医療行為は行いません。
            診断・治療は、必要に応じて連携する医療機関が、その医師の責任と判断において行います。
          </strong>
        </p>
        <p className="mt-4">
          本プログラムが提供する自己観察・記録・情報整理・伴走は、ご自身の判断を
          支援するためのものであり、医療上の効果・成果を保証するものではありません。
          気になる症状がある場合や、治療・施術の判断にあたっては、必ず医師・医療機関等の
          専門家にご相談ください。
        </p>
        <p className="mt-4">
          本プログラムは中立を旨とし、特定の医療機関・商品・サービスを推奨・斡旋しません。
          医療機関等との連携において、紹介手数料その他の金銭の授受は行いません
          （紹介手数料ゼロ）。受診の有無および受診先の選択は、すべてご本人の判断によります。
        </p>
      </section>

      <div className="text-sm leading-[2] text-ink space-y-8">
        <section>
          <h2 className="font-mincho text-lg mb-3">1. 基本方針</h2>
          <p>
            His Recoveries（以下「本プログラム」）を運営するバイタリティデザイン合同会社
            （以下「当社」）は、本プログラムを利用するすべての方の個人情報および
            プライバシーを尊重し、その保護に努めます。本プログラムは完全匿名・
            完全守秘義務のもとで運営し、ご本人を不必要に特定する情報を保持しないことを
            基本方針とします。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">2. 取得する情報</h2>
          <p>
            当社は、本プログラムの提供にあたり、次の情報を取得することがあります。
          </p>
          <ul className="mt-4 list-disc pl-5 space-y-2">
            <li>
              予約登録（お申し込み）の際にご提供いただく連絡先およびご相談内容。
            </li>
            <li>
              プログラム提供に伴い作成・記録する、会員ID単位の状態・記録等の情報。
            </li>
            <li>
              ご本人の同意のもとで取得する、健康・身体に関する情報（要配慮個人情報）。
            </li>
            <li>
              撮影を伴う体験において作成する写真等のデータ（取扱いは第6条のとおり）。
            </li>
            <li>
              利用状況を把握するために、個人を直接特定しない範囲で取得する
              閲覧ページ・リファラ・デバイス情報等。
            </li>
          </ul>
          <p className="mt-4">
            本名・顔写真・実年齢等の識別情報は、運営上必要な範囲を超えて取得・保持せず、
            可能な限り会員ID（匿名）で運用します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">3. 利用目的</h2>
          <p>
            取得した情報は、本プログラムの提供・伴走・ご連絡、品質の向上、
            ご本人からのお問い合わせへの対応、および法令遵守のためにのみ利用します。
            効果の保証その他、本来の目的を超える利用は行いません。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">4. 要配慮個人情報の取扱い</h2>
          <p>
            健康・身体に関する情報など、いわゆる要配慮個人情報については、
            あらかじめご本人の同意を得たうえで、本プログラムの提供に必要な範囲でのみ
            取得・利用します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">5. 第三者提供・業務委託</h2>
          <p>
            当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に
            提供しません。
          </p>
          <p className="mt-4">
            本プログラムの提供のため、提携する専門家（メイク・スタイリスト・撮影等）や
            システム提供者へ業務を委託し、必要な範囲で情報を取り扱わせることがあります。
            この場合、委託先には守秘義務（秘密保持契約）を課し、適切に監督します。
          </p>
          <p className="mt-4">
            医療機関等との連携においてご本人の情報を提供する場合は、
            <strong className="font-bold">事前にご本人の同意を得たうえで</strong>、
            原則として会員ID等の匿名情報を基本とし、本名・顔写真等の識別情報は
            ご本人の個別同意なく提供しません。当該連携に関して紹介手数料その他の
            金銭の授受は行いません（中立）。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">6. 撮影データ・匿名性の保持</h2>
          <p>
            撮影を伴う体験で作成する写真等のデータは、可能な限りご本人による管理を
            原則とします。当社が保管する場合は、会員ID単位で管理し、保管期間および
            削除時期をご本人とあらかじめ合意のうえ、期限到来時に削除します。
          </p>
          <p className="mt-4">
            写真等を広告・実績紹介・提携先との共有に用いることは、
            ご本人の個別の書面同意がない限り一切行いません。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">7. 開示・訂正・削除等の請求</h2>
          <p>
            ご本人は、当社が保有するご自身の個人情報について、開示・訂正・利用停止・
            削除等を求めることができます。ご請求があった場合は速やかに対応し、
            削除等の完了をご本人にご連絡します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">8. 安全管理</h2>
          <p>
            当社は、取得した情報の漏えい・滅失・毀損の防止その他の安全管理のために、
            必要かつ適切な措置を講じ、委託先に対しても同様の措置を求めます。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">9. アクセス解析・Cookie</h2>
          <p>
            当社はアクセス解析にプライバシー配慮型のツール
            （Plausible Analytics または Google Analytics 4）を利用する場合があります。
            これらは Cookie 等を利用することがありますが、収集される情報は個人を
            特定しない範囲のものです。Cookie はブラウザ設定で無効化できます。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">10. 改訂</h2>
          <p>
            本ポリシーは必要に応じて改訂します。最新の内容は本ページに掲載します。
          </p>
        </section>

        <section>
          <h2 className="font-mincho text-lg mb-3">11. お問い合わせ</h2>
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
          <p>改定日: 2026年6月27日</p>
        </section>
      </div>
    </div>
  );
}
