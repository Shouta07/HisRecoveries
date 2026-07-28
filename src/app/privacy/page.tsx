import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー・免責事項",
  description:
    "His Recoveries のプライバシーポリシーおよび免責事項です。ご相談は実名不要・完全守秘のもとで。お名前の確認はお申し込みの段階に限ります。医療行為は行いません。診断・治療は医療機関が行います。",
  alternates: { canonical: `${site.url}/privacy` },
  robots: { index: true, follow: true },
};

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-baseline gap-2.5 text-[1.05rem] font-bold text-[#1f2a1d] mb-3" style={HEAD}>
        <span className="font-mono text-[13.5px] font-medium text-[#85AB8B] not-italic">{n}</span>
        {title}
      </h2>
      <div className="text-[15px] leading-[2] text-[#4b5b47] space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <p className="font-mono text-[13.5px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">
              Privacy &amp; Disclaimer
            </p>
          </div>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3] text-[#1f2a1d]" style={HEAD}>
            プライバシーポリシー・<wbr />免責事項
          </h1>
        </header>

        {/* Medical & neutrality disclaimer — placed prominently at the top. */}
        <section className="mb-12 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-[#16241a] text-[#EDF1E8] p-6 sm:p-8">
          <h2 className="text-[1.1rem] mb-4 text-[#EDF1E8]" style={HEAD}>
            免責事項（医療・中立性）
          </h2>
          <div className="text-[15px] leading-[2] text-[#C9D2C4] space-y-4">
            <p>
              His Recoveries（以下「本サービス」）は、<strong className="font-bold text-[#EDF1E8]">実名・顔写真なしのご相談から始められる</strong>、
              完全守秘のもとで運営する第一印象改善サービスです。お名前・ご連絡先の確認は、お申し込み（お支払い）の段階で、当日のご案内とご請求に必要な範囲に限って行います。
              <strong className="font-bold text-[#EDF1E8]">
                本サービスは医療行為ではなく、診断・治療・投薬その他の医療行為は行いません。
                診断・治療は、必要に応じて連携する医療機関が、その医師の責任と判断において行います。
              </strong>
            </p>
            <p>
              本サービスが提供する自己観察・記録・情報整理・伴走は、ご自身の判断を
              支援するためのものであり、医療上の効果・成果を保証するものではありません。
              気になる症状がある場合や、治療・施術の判断にあたっては、必ず医師・医療機関等の
              専門家にご相談ください。
            </p>
            <p>
              本サービスは中立を旨とし、特定の医療機関・商品・サービスを推奨・斡旋しません。
              医療機関等との連携において、紹介手数料その他の金銭の授受は行いません
              （紹介手数料ゼロ）。受診の有無および受診先の選択は、すべてご本人の判断によります。
            </p>
          </div>
        </section>

        <div className="space-y-10">
          <Section n="01" title="基本方針">
            <p>
              His Recoveries（以下「本サービス」）を運営するバイタリティデザイン合同会社
              （以下「当社」）は、本サービスを利用するすべての方の個人情報および
              プライバシーを尊重し、その保護に努めます。本サービスは<strong className="font-bold text-[#1f2a1d]">実名なしで相談から始められる設計</strong>とし、完全守秘義務のもとで運営します。
              お名前・記録の預かりに進む段階でのみ、ご本人の同意のうえ、必要最小限の情報を確認します。
              ご本人を不必要に特定する情報を保持しないことを基本方針とします。
            </p>
          </Section>

          <Section n="02" title="取得する情報">
            <p>当社は、本サービスの提供にあたり、次の情報を取得することがあります。</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#85AB8B]">
              <li>無料相談のフォームでご提供いただく連絡先およびご相談内容。フォームの送信には外部サービスを利用します（当該サービスの取扱いは各社のポリシーに従います）。</li>
              <li>お申し込みの段階で、ご本人の同意のもとで確認するお名前・ご連絡先。お支払い方法は個別にご案内し、当社がクレジットカード番号等の決済情報を保持することはありません。</li>
              <li>お支払い後の伴走で利用するLINEでのやりとり、および作成・記録する状態・記録等の情報。</li>
              <li>ご本人の同意のもとで取得する、健康・身体に関する情報（要配慮個人情報）。</li>
              <li>撮影を伴う体験において作成する写真等のデータ（取扱いは第6条のとおり）。</li>
              <li>
                利用状況を把握するために、個人を直接特定しない範囲で取得する
                閲覧ページ・リファラ・デバイス情報等。
              </li>
            </ul>
            <p>
              本名・顔写真・実年齢等の識別情報は、運営上必要な範囲を超えて取得・保持せず、
              可能な限り会員ID（匿名）で運用します。
            </p>
          </Section>

          <Section n="03" title="利用目的">
            <p>
              取得した情報は、本サービスの提供・伴走・ご連絡、品質の向上、
              ご本人からのお問い合わせへの対応、および法令遵守のためにのみ利用します。
              効果の保証その他、本来の目的を超える利用は行いません。
            </p>
          </Section>

          <Section n="04" title="要配慮個人情報の取扱い">
            <p>
              健康・身体に関する情報など、いわゆる要配慮個人情報については、
              あらかじめご本人の同意を得たうえで、本サービスの提供に必要な範囲でのみ
              取得・利用します。
            </p>
          </Section>

          <Section n="05" title="第三者提供・業務委託">
            <p>当社は、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者に提供しません。</p>
            <p>
              本サービスの提供のため、提携する専門家（メイク・スタイリスト・撮影等）や
              システム提供者（日程調整・予約ツール、フォーム、メッセージング、ホスティング等）へ業務を委託し、
              必要な範囲で情報を取り扱わせることがあります。
              この場合、委託先には守秘義務（秘密保持契約）を課し、適切に監督します。
            </p>
            <p>
              医療機関等との連携においてご本人の情報を提供する場合は、
              <strong className="font-bold text-[#1f2a1d]">事前にご本人の同意を得たうえで</strong>、
              原則として会員ID等の匿名情報を基本とし、本名・顔写真等の識別情報は
              ご本人の個別同意なく提供しません。当該連携に関して紹介手数料その他の
              金銭の授受は行いません（中立）。
            </p>
          </Section>

          <Section n="06" title="撮影データ・匿名性の保持">
            <p>
              撮影を伴う体験で作成する写真等のデータは、可能な限りご本人による管理を
              原則とします。当社が保管する場合は、会員ID単位で管理し、保管期間および
              削除時期をご本人とあらかじめ合意のうえ、期限到来時に削除します。
            </p>
            <p>
              写真等を広告・実績紹介・提携先との共有に用いることは、
              ご本人の個別の書面同意がない限り一切行いません。
            </p>
          </Section>

          <Section n="07" title="開示・訂正・削除等の請求">
            <p>
              ご本人は、当社が保有するご自身の個人情報について、開示・訂正・利用停止・
              削除等を求めることができます。ご請求があった場合は速やかに対応し、
              削除等の完了をご本人にご連絡します。
            </p>
          </Section>

          <Section n="08" title="安全管理">
            <p>
              当社は、取得した情報の漏えい・滅失・毀損の防止その他の安全管理のために、
              必要かつ適切な措置を講じ、委託先に対しても同様の措置を求めます。
            </p>
          </Section>

          <Section n="09" title="アクセス解析・Cookie">
            <p>
              当社はアクセス解析にプライバシー配慮型のツール
              （Plausible Analytics または Google Analytics 4）を利用する場合があります。
              これらは Cookie 等を利用することがありますが、収集される情報は個人を
              特定しない範囲のものです。Cookie はブラウザ設定で無効化できます。
            </p>
          </Section>

          <Section n="10" title="改訂">
            <p>本ポリシーは必要に応じて改訂します。最新の内容は本ページに掲載します。</p>
          </Section>

          <Section n="11" title="お問い合わせ">
            <p>
              本ポリシーに関するお問い合わせは、
              <a
                href={`mailto:${site.email}`}
                className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
              >
                {site.email}
              </a>{" "}
              までお願いいたします。
            </p>
          </Section>

          <section className="border-t border-[#1f2a1d]/10 pt-8 mt-4 text-[13.5px] text-[#6b7a66] leading-[1.9]">
            <p className="font-semibold text-[#4b5b47] mb-1">運営者</p>
            <p>バイタリティデザイン合同会社</p>
            <p>制定日: 2026年5月16日</p>
            <p>改定日: 2026年7月23日</p>
          </section>
        </div>
      </div>
    </div>
  );
}
