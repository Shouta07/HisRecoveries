// 価格の提示。高単価サービスで金額を隠すと、誠実さではなく不信になる。
// 「何にいくら払うのか」と「なぜ価格が発生するのか」を正面から書く。
//
// 売っているのは施術ではなく、判断の代行・順番設計・期限管理・専門家選定・継続サポート。
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";

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
  { n: "04", t: "手順を、動画で残す", d: "メイクなどの手順を動画で納品。あとから何度でも見返して、自分で再現できます。" },
  { n: "05", t: "再現できるまで伴走", d: "その場限りにしません。お申し込み後にご案内するLINEで確認しながら、Before / After も記録します（掲載は許可があるときだけ）。" },
];

export default function PlanPricing() {
  return (
    <section id="pricing" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
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
            <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B]">
              第一印象改善プラン
            </div>
            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
              <span className="rounded-full bg-[#9ec4a3] px-2.5 py-0.5 text-[10.5px] font-bold text-[#16241A] tracking-[0.04em]">
                先着10名
              </span>
              <span className="text-[1.9rem] sm:text-[2.3rem] font-bold" style={MINCHO}>
                ¥49,800
              </span>
              <span className="text-[1.05rem] text-[#C9D2C4]">税込 ／ 30日</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#C9D2C4] leading-[1.85]">
              事例をつくる段階のため、<span className="text-[#EDF1E8] font-semibold">はじめの10名さま</span>はこの価格でお受けします。
              条件は、<span className="text-[#EDF1E8] font-semibold">記録（Before / After）の掲載にご協力いただけること</span>。
              匿名・顔を出さない形でも構いません。
            </p>
            <p className="mt-2 text-[12px] text-[#9ec4a3] leading-[1.85]">
              11名さま以降は ¥66,000（税込）でのご案内になります。
              同時にお受けできるのは数名までです。
            </p>
          </div>

          {/* 含まれるもの */}
          <div className="px-6 sm:px-9 py-7">
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
              30日で、この5つを終わらせます
            </div>
            <ol className="space-y-0">
              {STEPS.map((x, i) => (
                <li key={x.n} className="flex gap-3.5 pb-4 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-[#16241A] text-[#EDF1E8] font-mono text-[10.5px]">
                      {x.n}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span aria-hidden className="w-px flex-1 bg-[#dbe4d6] mt-1.5" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]">{x.t}</p>
                    <p className="mt-0.5 text-[12px] text-[#5c6b58] leading-[1.8]">{x.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* 施術費は別、を明示（不信を生まないため） */}
            <p className="mt-6 text-[12px] text-[#6b7a66] leading-[1.9] border-t border-[#1f2a1d]/10 pt-5">
              ※ 体験は<span className="text-[#1f2a1d] font-semibold">東京都内・土日</span>のみの実施です（所要は1日）。
              体験（眉・メイク・服選び・髪型提案・撮影）と<span className="text-[#1f2a1d] font-semibold">会場の費用は含まれます</span>。
              交通費はご本人のご負担です。
              お支払いは<span className="text-[#1f2a1d] font-semibold">PayPayのみ</span>（請求リンクをお送りします）。
              <span className="text-[#1f2a1d] font-semibold">お支払い後のキャンセル・返金はお受けできません</span>（実施者の日程を確保するため）。
              購入する服・化粧品などの実費、美容室でのカット代はご本人のご負担です。
              提携先からの手数料は受け取らないので、必要のないものは「やらなくていい」と伝えます。
            </p>
          </div>
        </div>

        {/* 総額比較 — 同じ成果を、既存のやり方より安く。ここが「お得」の唯一の論理。 */}
        <div className="mt-6 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-[#1f2a1d]/10">
            <p className="text-[11.5px] font-bold tracking-[0.08em] text-[#3d5638] mb-1">
              同じ状態を目指すとき
            </p>
            <p className="text-[14.5px] sm:text-[15.5px] font-bold text-[#1f2a1d] leading-[1.7]" style={MINCHO}>
              総額で、比べてください。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1f2a1d]/10">
            <div className="px-6 sm:px-8 py-6">
              <p className="text-[12px] font-bold text-[#9aa79a] mb-3">自分で、バラバラに揃える</p>
              <ul className="space-y-1.5 text-[12.5px] text-[#5c6b58] leading-[1.8]">
                <li>・スタイリストに同行を頼む</li>
                <li>・写真を撮り直す</li>
                <li>・肌の施術に通う</li>
                <li>・脱毛を始める</li>
                <li>・髪を見直す</li>
              </ul>
              <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[13px] text-[#1f2a1d]">
                <span className="font-bold text-[1.15rem]" style={MINCHO}>数十万円</span>
                <span className="ml-2 text-[11.5px] text-[#6b7a66]">＋ 順番も予約も、自分で</span>
              </p>
            </div>
            <div className="px-6 sm:px-8 py-6 bg-[#f6f8f4]">
              <p className="text-[12px] font-bold text-[#3d5638] mb-3">His Recoveries なら</p>
              <ul className="space-y-1.5 text-[12.5px] text-[#5c6b58] leading-[1.8]">
                <li>・<span className="text-[#1f2a1d] font-semibold">必要なものだけ</span>に絞る</li>
                <li>・眉・メイク・服・髪・撮影を<span className="text-[#1f2a1d] font-semibold">1日で</span></li>
                <li>・やらなくていいものは、やらない</li>
                <li>・順番と締切は、こちらで管理</li>
              </ul>
              <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[13px] text-[#1f2a1d]">
                <span className="font-bold text-[1.15rem]" style={MINCHO}>¥49,800</span><span className="ml-1 text-[11px] text-[#6b7a66]">税込・先着10名</span>
                <span className="ml-2 text-[11.5px] text-[#6b7a66]">＋ 服・化粧品の実費だけ</span>
              </p>
            </div>
          </div>
          <p className="px-6 sm:px-8 py-4 text-[11.5px] text-[#6b7a66] leading-[1.85] border-t border-[#1f2a1d]/10">
            ※ 金額は一般的な目安で、内容・地域・回数により変わります。
            あなたの場合の実費見込みは、着手前に一覧でお渡しします。
          </p>
        </div>

        {/* 価値分解 — 何にお金を払っているのかを、機能ではなく"消えるコスト"で示す */}
        <div className="mt-6 rounded-[1.4rem] bg-[#eef3ea] px-6 sm:px-8 py-6">
          <p className="text-[11.5px] font-bold tracking-[0.08em] text-[#3d5638] mb-1">
            これは施術費ではありません
          </p>
          <p className="text-[14.5px] sm:text-[15.5px] font-bold text-[#1f2a1d] leading-[1.7]" style={MINCHO}>
            あなたが払っているのは、<br className="sm:hidden" />
            この6つの負担が消えることです。
          </p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
            {[
              ["判断コスト", "「どれが自分に必要か」を、もう考えなくていい"],
              ["失敗コスト", "順番を間違えて、時間と費用を捨てるリスクが下がる"],
              ["時間コスト", "調べる・比べる・予約する時間が、ほぼゼロになる"],
              ["選定コスト", "どの専門家が合うかを、中立に選んでもらえる"],
              ["管理コスト", "締切と進捗を、自分で管理しなくてよくなる"],
              ["心理コスト", "一人で抱えず、迷ったその場で聞ける相手がいる"],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span aria-hidden className="text-[#3d5638] text-[12px] leading-[1.9] shrink-0">✓</span>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
                  <span className="font-bold text-[#1f2a1d]">{t}</span>
                  <span className="mx-1.5 text-[#c9d3c4]">|</span>
                  {d}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-[#4b5b47] leading-[1.95] border-t border-[#1f2a1d]/10 pt-4">
            自分で調べ、比べ、選び、間違え、やり直す。その時間と費用を合計すると、
            多くの場合これを上回ります。しかも大事な日は、やり直しがききません。
            ここで払っているのは、施術ではなく<span className="font-semibold text-[#1f2a1d]">判断と段取り</span>です。
          </p>
        </div>

        {/* 入口 */}
        <div className="mt-6 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-6 sm:px-8 py-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[14.5px] font-bold text-[#1f2a1d]" style={MINCHO}>
              いきなり申し込まなくて、大丈夫です
            </span>
          </div>
          <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">
            まず無料でご相談ください。合わないと思えば、その場でお伝えします。
            お支払い後のキャンセルはお受けしていないので、
            <span className="text-[#1f2a1d] font-semibold">迷いが残っているうちは、お勧めしません</span>。
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-[#EDF1E8] text-[13px] font-bold px-6 py-3 transition-colors">
              まず無料で相談する <span aria-hidden>→</span>
            </ConsultLink>
            <Link
              href="/#plan"
              className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#3d5638] text-[#1f2a1d] text-[13px] font-semibold px-6 py-3 transition-colors"
            >
              先に、自分のプランを見る <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
