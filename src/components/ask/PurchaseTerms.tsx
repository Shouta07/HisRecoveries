import Link from "next/link";
import { site } from "@/lib/site";
import { PASS_VALID_DAYS, type Plan } from "@/lib/ask/plans";

// 決済へ進む直前に出すもの。
//
// ══════════════════════════════════════════════════
// 何を買うのか分からないまま払わせない
// ══════════════════════════════════════════════════
// 決済の画面（Stripe）に出るのは、商品名と金額だけ。
// 回数なのか、いつまで使えるのか、自動更新はあるのか、
// やめたいときどうなるのかは、そこには出ない。
//
// 出す場所は、押す直前のここしかない。
// 別のページへのリンクにして済ませない。リンクは押されない。
// 押されなかった条件は、無かったことにされる。
//
// ══════════════════════════════════════════════════
// 2か所から呼ばれる
// ══════════════════════════════════════════════════
// 相談を出してそのまま払う流れ（AskFlow）と、
// 戻ってきて払い直す画面（PayButton）。
// 別々に書くと、片方だけ古い条件が残る。
//
// ══════════════════════════════════════════════════
// 売主は当社
// ══════════════════════════════════════════════════
// 「女性に払う」ように見えると、実態と食い違う。
// 契約と支払いの相手が誰なのかを、ここで1行にして出す。

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5em_1fr] gap-x-3 gap-y-1 py-2 text-[12.5px] leading-[1.8]">
      <dt className="font-bold text-steel">{label}</dt>
      <dd className="min-w-0 text-slate">{children}</dd>
    </div>
  );
}

export default function PurchaseTerms({ plan: p }: { plan: Plan }) {
  const uses = p.uses ?? 1;

  return (
    <div className="mt-5 rounded-soft border border-line bg-paper px-4 py-3">
      <p className="text-[11.5px] font-bold text-steel">お支払いの前に</p>

      <dl className="mt-1 divide-y divide-line">
        <Row label="商品">
          {p.name}
          {p.callMinutes ? `（1回 ${p.callMinutes}分）` : null}
        </Row>
        <Row label="金額">
          {p.yen.toLocaleString()}円（税込）
          {uses > 1 ? ` / ${uses}回分・1回あたり ${Math.round(p.yen / uses).toLocaleString()}円` : null}
        </Row>
        <Row label="回数">
          {uses > 1 ? `${uses}回` : "1回"}。月額ではありません。自動更新もしません。
        </Row>
        {uses > 1 && (
          <Row label="有効期限">
            お支払いの日から{PASS_VALID_DAYS}日間。残りの回数と期限は、いつでも画面で確認できます。
          </Row>
        )}
        <Row label="提供">
          {p.callMinutes
            ? "お支払いの確認後、当社から日時をご案内します。"
            : "お支払いの確認後、条件に合う女性へ順次お渡しします。"}
        </Row>
        <Row label="キャンセル">
          {p.callMinutes
            ? "予約の24時間前までは全額返金、または回数をお戻しします。それ以降と無連絡の不参加は、返金いたしません。"
            : "女性へお渡しする前なら全額返金します。お渡しのあとはキャンセルできません。"}
        </Row>
        <Row label="お相手">
          {site.company.name}。お支払いの相手も当社です。答える女性は当社の業務委託先で、直接のお支払いはありません。
        </Row>
      </dl>

      <p className="mt-2.5 border-t border-line pt-2.5 text-[11.5px] leading-[1.8] text-steel">
        進むと{" "}
        <Link href="/terms" target="_blank" className="underline decoration-line underline-offset-2 hover:text-slate">
          利用規約
        </Link>
        {" / "}
        <Link href="/privacy" target="_blank" className="underline decoration-line underline-offset-2 hover:text-slate">
          プライバシー
        </Link>
        {" / "}
        <Link href="/legal" target="_blank" className="underline decoration-line underline-offset-2 hover:text-slate">
          特定商取引法に基づく表記
        </Link>
        {" "}に同意したものとして扱います。18歳以上の方に限ります。
      </p>
    </div>
  );
}
