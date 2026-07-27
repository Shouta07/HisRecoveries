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

const INCLUDED = [
  { t: "現在地診断", d: "外側と習慣を要素に分解し、いまの位置を言語化します。" },
  { t: "90日改善ロードマップ", d: "その日から逆算し、いつ何をやるかを一枚に。" },
  { t: "専門家・施設の選定と手配", d: "中立に選び、予約まで。探す手間はかかりません。" },
  { t: "LINEでの相談", d: "計画を進める中で、迷いや判断が必要なときに相談できます。" },
  { t: "進捗管理", d: "締切を置き、遅れたら声をかけます。放置しません。" },
  { t: "当日までの伴走", d: "終わるまで見届けます。手が止まったら、声をかけます。" },
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
              第一印象改善プラン（90日・伴走）
            </div>
            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
              <span className="text-[1.9rem] sm:text-[2.3rem] font-bold" style={MINCHO}>
                ¥200,000
              </span>
              <span className="text-[1.05rem] text-[#C9D2C4]">〜 ¥500,000</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#C9D2C4] leading-[1.85]">
              期間・範囲・手配する専門家の数で変わります。総額と内訳は、
              着手前に必ず提示します。予算を超えることはありません。
            </p>
          </div>

          {/* 含まれるもの */}
          <div className="px-6 sm:px-9 py-7">
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
              含まれるもの
            </div>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {INCLUDED.map((x) => (
                <li key={x.t} className="flex gap-2.5">
                  <span aria-hidden className="text-[#3d5638] text-[13px] leading-[1.7] shrink-0">
                    ✓
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6]">{x.t}</p>
                    <p className="mt-0.5 text-[12px] text-[#5c6b58] leading-[1.8]">{x.d}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* 施術費は別、を明示（不信を生まないため） */}
            <p className="mt-6 text-[12px] text-[#6b7a66] leading-[1.9] border-t border-[#1f2a1d]/10 pt-5">
              ※ 施術・商品の実費は含みません。中立に選ぶため、提携先からの手数料で
              価格を歪めることはしません。必要のないものは「やらなくていい」と伝えます。
            </p>
          </div>
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
              まず現在地だけ知りたい方へ
            </span>
            <span className="text-[14.5px] font-bold text-[#3d5638]" style={MINCHO}>
              印象診断 ¥22,000
            </span>
          </div>
          <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">
            90分。いまの位置と、最初にやるべき一手をお伝えします。
            プランをお申し込みの場合は、全額を充当します。
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
