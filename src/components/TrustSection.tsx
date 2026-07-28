// 信頼要素。運営者・専門家ネットワーク・改善プロセス・匿名事例。
//
// 事実がないものは書かない。未記入の項目は「準備中」と正直に出す
// （創作した実績・事例は掲載しない）。データは src/lib/trust.ts。
import Link from "next/link";
import Image from "next/image";
import { operator, cases } from "@/lib/trust";
import { producer } from "@/lib/producer";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function TrustSection() {
  const hasOperator = operator.name.length > 0;

  return (
    <section id="trust" className="relative z-10 scroll-mt-24 text-[#1F1E1B] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          誰が、やるのか
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          任せる相手が、見えること。
        </h2>
        <p className="mt-4 text-[15px] text-[#45443E] leading-[1.95] max-w-[34rem]">
          匿名でいられるのは、お客様の側です。関わるのは2人だけで、役割を分けています。
        </p>

        {/* 関わる人は2人。誰が何をするかを、はっきり分けて出す。
            片方だけ写真があると「準備中」の表示と矛盾して見えるので、
            役割ごとに公開状況を書き分ける。 */}
        <div className="mt-8 rounded-[1.4rem] bg-white border border-[#1F1E1B]/10 overflow-hidden">
          {/* ① 当日、実際に手を動かす人 */}
          <Link
            href="/producer"
            className="group flex items-center gap-4 p-6 sm:p-7 hover:bg-[#FAF8F4] transition-colors"
          >
            {producer.avatar || producer.photo ? (
              <span className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] shrink-0 rounded-full overflow-hidden bg-[#EDE9E0] ring-2 ring-[#97613F]/35">
                <Image
                  src={producer.avatar || producer.photo}
                  alt={producer.photoAlt || producer.role}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </span>
            ) : null}
            <span className="min-w-0">
              <span className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[#97613F]">
                {producer.role}
              </span>
              <span
                className="mt-1 block text-[15.5px] font-bold text-[#1F1E1B] leading-[1.55] group-hover:text-[#97613F] transition-colors"
                style={MINCHO}
              >
                当日、実際に手を動かすのはこの人です。
              </span>
              <span className="mt-1.5 block text-[13.5px] text-[#97613F] font-semibold">
                考え方とメソッドを見る <span aria-hidden className="text-[#97613F]">→</span>
              </span>
            </span>
          </Link>

          {/* ② 設計・運営 */}
          <div className="border-t border-[#1F1E1B]/10 px-6 sm:px-7 py-5 sm:py-6 bg-[#FAF8F4]">
            {hasOperator ? (
              <div className="flex flex-col sm:flex-row gap-5">
                {operator.photo ? (
                  <div className="relative w-[80px] h-[80px] shrink-0 rounded-full overflow-hidden bg-[#EDE9E0]">
                    <Image src={operator.photo} alt={operator.name} fill className="object-cover" sizes="80px" />
                  </div>
                ) : null}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#5E6A70]">
                    {operator.role}
                  </p>
                  <p className="mt-1 text-[15.5px] font-bold text-[#1F1E1B]" style={MINCHO}>
                    {operator.name}
                  </p>
                  {operator.why ? (
                    <p className="mt-2 text-[14px] text-[#45443E] leading-[1.95]">{operator.why}</p>
                  ) : null}
                  {operator.background.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {operator.background.map((b) => (
                        <li key={b} className="text-[14px] text-[#45443E] leading-[1.8]">
                          ・{b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#5E6A70]">
                  設計・運営
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#1F1E1B]" style={MINCHO}>
                  現在地の整理と、順番を決める役です
                </p>
                <p className="mt-2 text-[14px] text-[#45443E] leading-[1.9]">
                  同じ悩みを経験した当事者が設計・運営しています。こちらは実名と写真の公開を準備中です。
                  <Link href="/why" className="ml-1 text-[#97613F] underline underline-offset-2 hover:opacity-70">
                    なぜやるのか
                  </Link>
                  は先に書いてあります。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* お金の基準。キャンセル条件は「はじめかた」とFAQに書いてあるので、
            ここでは繰り返さない（同じ注意書きが3回出ると、どれも読まれなくなる）。 */}
        <div className="mt-8 rounded-[1rem] bg-white border border-[#1F1E1B]/10 px-5 sm:px-6 py-5">
          <p className="text-[14.5px] font-bold text-[#1F1E1B] mb-2.5" style={MINCHO}>
            お金の基準
          </p>
          <ul className="space-y-1.5 text-[14px] text-[#45443E] leading-[1.8]">
            <li>・商品は<span className="text-[#1F1E1B] font-semibold">30日プランの1本のみ</span>です。上位プランも追加オプションもありません</li>
            <li>・費用はご相談のうえで個別にお見積りします。お出しした金額から増えることはありません</li>
            <li>・会場（レンタルスペース等）の費用は、こちらで負担します</li>
            <li>・服・化粧品・カット代・交通費は、実費としてご本人のご負担です</li>
            <li>・<span className="text-[#1F1E1B] font-semibold">提携先からの紹介料は受け取っていません</span>。だから「やらなくていい」と言えます</li>
          </ul>
        </div>

        {/* 匿名事例 */}
        <div className="mt-10">
          <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#5E6A70] mb-4">
            実際の記録
          </div>
          {cases.length > 0 ? (
            <ul className="space-y-3">
              {cases.map((c) => (
                <li key={c.who} className="rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-5 py-5">
                  <span className="font-mono text-[11px] text-[#C28863]">{c.who}</span>
                  <p className="mt-1.5 text-[14.5px] text-[#45443E] leading-[1.9]">
                    <span className="font-bold text-[#1F1E1B]">相談時：</span>
                    {c.before}
                  </p>
                  <p className="mt-1 text-[14.5px] text-[#45443E] leading-[1.9]">
                    <span className="font-bold text-[#1F1E1B]">設計した順番：</span>
                    {c.plan}
                  </p>
                  {c.voice ? (
                    <p className="mt-2.5 text-[14px] text-[#45443E] leading-[1.9] border-l-2 border-[#DAD6CD] pl-3">
                      「{c.voice}」
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[#45443E] leading-[1.9] rounded-[1rem] bg-white border border-[#1F1E1B]/10 px-5 py-4">
              始まったばかりのため、実際の記録はまだ掲載していません。
              作り話は載せません。ご本人の許可が取れたものから、順番に公開します。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
