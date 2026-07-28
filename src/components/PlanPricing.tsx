// 価格の提示。高単価サービスで金額を隠すと、誠実さではなく不信になる。
// 「何にいくら払うのか」と「なぜ価格が発生するのか」を正面から書く。
//
// 売っているのは施術ではなく、判断の代行・順番設計・期限管理・専門家選定・継続サポート。
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { DELIVERABLES, PLAN, SUPPORT, TIERS, yen } from "@/lib/pricing";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 5ステップ＝商品の骨格。工程を見せることで「相談サービス」ではないと伝える。
// 第一印象改善に絞った30日。設計だけでなく「実行」まで含むのが中核。
const STEPS = [
  { n: "01", t: "カウンセリング", d: "何が気になっているのかを、一緒に言葉にします。ここが起点です。" },
  { n: "02", t: "改善プランの作成", d: "何をやるか、何をやらないかを決めて、一枚にまとめます。" },
  { n: "03", t: "オフライン体験（1日）", d: "眉・メンズメイク・服選び・髪型の提案・写真撮影。東京都内・土日のみの実施です。" },
  // 04/05 の中身は下の納品物リストで具体的に出すので、ここでは繰り返さない。
  { n: "04", t: "持ち帰るものを、その日につくる", d: "撮影も記録も、その場で行います。" },
  { n: "05", t: "次に使える形にして、渡す", d: "下の6点です。買い物や美容室で、そのまま使えます。" },
];

export default function PlanPricing() {
  return (
    <section id="pricing" className="relative z-10 scroll-mt-24 text-[#1f2a1d] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          Price — 費用
        </p>
        <h2
          className="text-[1.45rem] sm:text-[2rem] leading-[1.4]"
          style={{ ...MINCHO, fontWeight: 800 }}
        >
          何に、いくら払うのか。
        </h2>

        <div className="mt-8 rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* 本体プラン */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="hr-eyebrow hr-eyebrow-on-dark">
              第一印象改善プラン
            </div>
            <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
              <span className="rounded-full bg-[#E0B75F] px-3 py-1 text-[12px] font-bold text-[#16241A] tracking-[0.04em]">
                {TIERS.founder.label}
              </span>
              <span className="hr-figure text-[2.6rem] sm:text-[3.2rem] font-bold text-[#E0B75F]">
                {yen(TIERS.founder.amount)}
              </span>
              <span className="text-[15px] text-[#C9D2C4]">税込 ／ {PLAN.days}日</span>
            </div>

            {/* 仕様を1行で。読まない人はここだけ見る。 */}
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 border-t border-[#E0B75F]/20 pt-4">
              {[
                ["実施", `${PLAN.where}・${PLAN.when}`],
                ["所要", "1日（体験）"],
                ["支払い", "カード1回"],
                ["キャンセル", "支払い後は不可"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10.5px] tracking-[0.14em] uppercase text-[#9FB0A0]">{k}</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold text-[#EDF1E8]">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-[14px] text-[#C9D2C4] leading-[1.9]">
              事例をつくる段階のため、
              <span className="hr-mark-dark">はじめの{TIERS.founder.seats}名さまはこの価格</span>
              でお受けします。条件は、記録（Before / After）の掲載にご協力いただけること。
              匿名・顔を出さない形でも構いません。
            </p>
            <p className="mt-2.5 text-[13.5px] text-[#9ec4a3] leading-[1.85]">
              {(TIERS.founder.seats ?? 0) + 1}名さま以降は {yen(TIERS.standard.amount)}（税込）でのご案内になります。
              同時にお受けできるのは数名までです。
            </p>
          </div>

          {/* 含まれるもの */}
          <div className="px-6 sm:px-9 py-7">
            <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
              30日で、この5つを終わらせます
            </div>
            <ol className="space-y-0">
              {STEPS.map((x, i) => (
                <li key={x.n} className="flex gap-3.5 pb-4 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-[#16241A] text-[#EDF1E8] font-mono text-[11px]">
                      {x.n}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span aria-hidden className="w-px flex-1 bg-[#dbe4d6] mt-1.5" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[15px] font-bold text-[#1f2a1d] leading-[1.6]">{x.t}</p>
                    <p className="mt-0.5 text-[13.5px] text-[#5c6b58] leading-[1.8]">{x.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* 含む/含まないは、文章より表のほうが速く読める。
                実施日・支払い方法・キャンセルは上の仕様欄に出しているので繰り返さない。 */}
            <dl className="mt-6 border-t border-[#1f2a1d]/10 pt-5 text-[13.5px] leading-[1.9]">
              <div className="flex gap-3">
                <dt className="shrink-0 w-[5.5em] font-bold text-[#3d5638]">含みます</dt>
                <dd className="text-[#5c6b58]">体験（眉・メイク・服選び・髪型提案・撮影）／会場費／下の納品物6点／{SUPPORT.days}日間の質問窓口</dd>
              </div>
              <div className="mt-2 flex gap-3">
                <dt className="shrink-0 w-[5.5em] font-bold text-[#9aa79a]">含みません</dt>
                <dd className="text-[#5c6b58]">交通費／購入する服・化粧品／美容室のカット代（いずれも実費）</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13.5px] text-[#6b7a66] leading-[1.9]">
              <span className="hr-mark">お支払い後のキャンセル・返金はお受けできません</span>。
              実施者の土日と会場を確保するためです。
            </p>
          </div>

          {/* 納品物 — 「できるようになるまで」ではなく「渡すもの」で書く。
              終わりの条件が相手の習得度で決まる約束は、いつ終わったのかを
              こちらから言えない。数えられる物に置き換えている。 */}
          <div className="border-t border-[#1f2a1d]/10 bg-[#f6f8f4] px-6 sm:px-9 py-7">
            <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-1.5">
              その日で、終わらせないために
            </p>
            <p className="text-[16px] sm:text-[17px] font-bold text-[#1f2a1d] leading-[1.6]" style={MINCHO}>
              手元に、この6つが残ります。
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-7 gap-y-4">
              {DELIVERABLES.map((d, i) => (
                <li key={d.t} className="flex gap-3">
                  <span
                    aria-hidden
                    className="hr-figure shrink-0 text-[13px] font-bold text-[#B98A3C] pt-0.5"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.55]">{d.t}</p>
                    <p className="mt-0.5 text-[13.5px] text-[#5c6b58] leading-[1.85]">{d.d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 pt-4 border-t border-[#1f2a1d]/10 text-[13.5px] text-[#5c6b58] leading-[1.9]">
              加えて、実施日から<span className="text-[#1f2a1d] font-semibold">{SUPPORT.days}日間</span>
              は{SUPPORT.channel}で質問していただけます（{SUPPORT.note}）。
              ただし、<span className="text-[#1f2a1d] font-semibold">お渡ししたものを必ず再現できるようになること</span>
              までは、お約束していません。手を動かすのはご本人だからです。
            </p>
          </div>
        </div>

        {/* 総額比較 — 同じ成果を、既存のやり方より安く。ここが「お得」の唯一の論理。 */}
        <div className="mt-6 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-[#1f2a1d]/10">
            <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#3d5638] mb-1">
              同じ状態を目指すとき
            </p>
            <p className="text-[15.5px] sm:text-[15.5px] font-bold text-[#1f2a1d] leading-[1.7]" style={MINCHO}>
              総額で、比べてください。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1f2a1d]/10">
            <div className="px-6 sm:px-8 py-6">
              <p className="text-[13.5px] font-bold text-[#9aa79a] mb-3">自分で、バラバラに揃える</p>
              <p className="text-[14px] text-[#5c6b58] leading-[1.9]">
                スタイリストに同行を頼む／写真を撮り直す／肌の施術に通う／脱毛／髪を見直す。
                それぞれ別々に、探して、比べて、予約する。
              </p>
              <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[14.5px] text-[#1f2a1d]">
                <span className="font-bold text-[1.15rem]" style={MINCHO}>数十万円</span>
                <span className="ml-2 text-[12.5px] text-[#6b7a66]">＋ 順番も予約も、自分で</span>
              </p>
            </div>
            <div className="px-6 sm:px-8 py-6 bg-[#f6f8f4] border-t-2 sm:border-t-0 sm:border-l-2 border-[#B98A3C]">
              <p className="text-[13.5px] font-bold text-[#7E5B29] mb-3">His Recoveries なら</p>
              <p className="text-[14px] text-[#5c6b58] leading-[1.9]">
                <span className="text-[#1f2a1d] font-semibold">必要なものだけ</span>に絞って、
                眉・メイク・服・髪・撮影を<span className="text-[#1f2a1d] font-semibold">1日で</span>。
                順番と締切は、こちらで管理します。
              </p>
              <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[14.5px] text-[#1f2a1d]">
                <span className="hr-figure font-bold text-[1.6rem] text-[#7E5B29]">{yen(TIERS.founder.amount)}</span>
                <span className="ml-1.5 text-[12px] text-[#6b7a66]">税込・{TIERS.founder.label}</span>
                <span className="block mt-1 text-[12.5px] text-[#6b7a66]">＋ 服・化粧品の実費だけ</span>
              </p>
            </div>
          </div>
          <p className="px-6 sm:px-8 py-4 text-[12.5px] text-[#6b7a66] leading-[1.85] border-t border-[#1f2a1d]/10">
            ※ 金額は一般的な目安で、内容・地域・回数により変わります。
            あなたの場合の実費見込みは、着手前に一覧でお渡しします。
          </p>
        </div>

        {/* 「何に払うのか」は、6項目の一覧ではなく1文で足りる。
            機能を並べるほど読まれなくなるので、比較表の直後に置いて締める。 */}
        <p className="mt-4 px-1 text-[14px] text-[#4b5b47] leading-[1.95]">
          自分で調べ、比べ、選び、間違え、やり直す。その時間と費用を合計すると、
          多くの場合これを上回ります。しかも大事な日は、やり直しがききません。
          ここで払っているのは、施術ではなく
          <span className="hr-mark">判断と段取り</span>です。
        </p>

        {/* 入口 */}
        <div className="mt-6 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-6 sm:px-8 py-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[15.5px] font-bold text-[#1f2a1d]" style={MINCHO}>
              いきなり申し込まなくて、大丈夫です
            </span>
          </div>
          <p className="mt-2 text-[14px] text-[#4b5b47] leading-[1.9]">
            まず無料でご相談ください。合わないと思えば、その場でお伝えします。
            お支払い後のキャンセルはお受けしていないので、
            <span className="hr-mark">迷いが残っているうちは、お勧めしません</span>。
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[14.5px] font-bold px-6 py-3 transition-colors">
              まず無料で相談する <span aria-hidden>→</span>
            </ConsultLink>
            <Link
              href="/#plan"
              className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#3d5638] text-[#1f2a1d] text-[14.5px] font-semibold px-6 py-3 transition-colors"
            >
              先に、自分のプランを見る <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
