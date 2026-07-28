// 信頼要素。運営者・専門家ネットワーク・改善プロセス・匿名事例。
//
// 事実がないものは書かない。未記入の項目は「準備中」と正直に出す
// （創作した実績・事例は掲載しない）。データは src/lib/trust.ts。
import Link from "next/link";
import Image from "next/image";
import { operator, experts, cases, PROCESS } from "@/lib/trust";
import { producer } from "@/lib/producer";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function TrustSection() {
  const hasOperator = operator.name.length > 0;

  return (
    <section id="trust" className="relative z-10 scroll-mt-24 text-[#1f2a1d] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          Who — 誰が、やるのか
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          任せる相手が、見えること。
        </h2>
        <p className="mt-4 text-[15px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          匿名でいられるのは、お客様の側です。関わるのは2人だけで、役割を分けています。
        </p>

        {/* 関わる人は2人。誰が何をするかを、はっきり分けて出す。
            片方だけ写真があると「準備中」の表示と矛盾して見えるので、
            役割ごとに公開状況を書き分ける。 */}
        <div className="mt-8 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 overflow-hidden">
          {/* ① 当日、実際に手を動かす人 */}
          <Link
            href="/producer"
            className="group flex items-center gap-4 p-6 sm:p-7 hover:bg-[#f8faf6] transition-colors"
          >
            {producer.avatar || producer.photo ? (
              <span className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px] shrink-0 rounded-full overflow-hidden bg-[#eef3ea] ring-2 ring-[#B98A3C]/35">
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
              <span className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[#7E5B29]">
                {producer.role}
              </span>
              <span
                className="mt-1 block text-[15.5px] font-bold text-[#1f2a1d] leading-[1.55] group-hover:text-[#3d5638] transition-colors"
                style={MINCHO}
              >
                当日、実際に手を動かすのはこの人です。
              </span>
              <span className="mt-1.5 block text-[13.5px] text-[#3d5638] font-semibold">
                考え方とメソッドを見る <span aria-hidden className="text-[#B98A3C]">→</span>
              </span>
            </span>
          </Link>

          {/* ② 設計・運営 */}
          <div className="border-t border-[#1f2a1d]/10 px-6 sm:px-7 py-5 sm:py-6 bg-[#f8faf6]">
            {hasOperator ? (
              <div className="flex flex-col sm:flex-row gap-5">
                {operator.photo ? (
                  <div className="relative w-[80px] h-[80px] shrink-0 rounded-full overflow-hidden bg-[#eef3ea]">
                    <Image src={operator.photo} alt={operator.name} fill className="object-cover" sizes="80px" />
                  </div>
                ) : null}
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#9aa79a]">
                    {operator.role}
                  </p>
                  <p className="mt-1 text-[15.5px] font-bold text-[#1f2a1d]" style={MINCHO}>
                    {operator.name}
                  </p>
                  {operator.why ? (
                    <p className="mt-2 text-[14px] text-[#4b5b47] leading-[1.95]">{operator.why}</p>
                  ) : null}
                  {operator.background.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {operator.background.map((b) => (
                        <li key={b} className="text-[14px] text-[#5c6b58] leading-[1.8]">
                          ・{b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#9aa79a]">
                  設計・運営
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#1f2a1d]" style={MINCHO}>
                  現在地の整理と、順番を決める役です
                </p>
                <p className="mt-2 text-[14px] text-[#5c6b58] leading-[1.9]">
                  同じ悩みを経験した当事者が設計・運営しています。こちらは実名と写真の公開を準備中です。
                  <Link href="/why" className="ml-1 text-[#3d5638] underline underline-offset-2 hover:opacity-70">
                    なぜやるのか
                  </Link>
                  は先に書いてあります。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 改善プロセス（事実なので常時掲載） */}
        <div className="mt-10">
          <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            どう進めるか
          </div>
          <ol className="grid sm:grid-cols-5 gap-3">
            {PROCESS.map((p) => (
              <li key={p.n} className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-4 py-4">
                <span className="font-mono text-[11px] text-[#85AB8B]">{p.n}</span>
                <p className="mt-1 text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>
                  {p.t}
                </p>
                <p className="mt-1 text-[12.5px] text-[#6b7a66] leading-[1.75]">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 専門家ネットワーク */}
        <div className="mt-10">
          <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            つなぐ相手
          </div>
          {experts.length > 0 ? (
            <ul className="grid sm:grid-cols-3 gap-3">
              {experts.map((e) => (
                <li key={e.field + e.name} className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-4 py-4">
                  <span className="font-mono text-[11px] text-[#85AB8B]">{e.field}</span>
                  <p className="mt-1 text-[15px] font-bold text-[#1f2a1d]" style={MINCHO}>
                    {e.name}
                  </p>
                  <p className="mt-1 text-[12.5px] text-[#6b7a66] leading-[1.75]">{e.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[#5c6b58] leading-[1.9] rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              提携する専門家・施設は、公開の許可が取れた順に掲載します。
              特定の一社に縛られないため、助言が歪むことはありません。
              <Link href="/partner" className="ml-1 text-[#3d5638] underline underline-offset-2 hover:opacity-70">
                提携をご検討の方へ
              </Link>
            </p>
          )}
        </div>

        {/* 料金基準と、やめ方 — 高額ほど「止め方」が明示されていないと踏み切れない */}
        <div className="mt-10">
          <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            料金の決まり方と、やめ方
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              <p className="text-[14.5px] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
                料金の基準
              </p>
              <ul className="space-y-1.5 text-[14px] text-[#5c6b58] leading-[1.8]">
                <li>・商品は<span className="text-[#1f2a1d] font-semibold">30日 ¥49,800（税込）の1本のみ</span>です。先着10名さまの価格で、11名以降は ¥66,000（税込）です</li>
                <li>・<span className="text-[#1f2a1d] font-semibold">お支払いはクレジットカードのみ</span>です（Stripeの決済ページ／カード情報はこちらを通りません）</li>
                <li>・表示価格はすべて税込です。追加費用はありません</li>
                <li>・会場（レンタルスペース等）の費用は、こちらで負担します</li>
                <li>・服・化粧品・カット代・交通費は、実費としてご本人のご負担です</li>
                <li>・提携先からの紹介料は受け取っていません</li>
              </ul>
            </div>
            <div className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              <p className="text-[14.5px] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
                キャンセルについて
              </p>
              <ul className="space-y-1.5 text-[14px] text-[#5c6b58] leading-[1.8]">
                <li>・<span className="text-[#1f2a1d] font-semibold">お支払い後のキャンセル・返金はお受けできません</span></li>
                <li>・実施者の土日と場所を確保するため、この形にしています</li>
                <li>・日程の変更は、実施日の1週間前まで承ります</li>
                <li>・迷われている場合は、お申し込みの前に必ずご相談ください</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[12.5px] text-[#6b7a66] leading-[1.85]">
            ※ 正式な条件は契約書面でご確認いただきます。曖昧なままお金をいただくことはしません。
          </p>
        </div>

        {/* 匿名事例 */}
        <div className="mt-10">
          <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            実際の記録
          </div>
          {cases.length > 0 ? (
            <ul className="space-y-3">
              {cases.map((c) => (
                <li key={c.who} className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-5 py-5">
                  <span className="font-mono text-[11px] text-[#85AB8B]">{c.who}</span>
                  <p className="mt-1.5 text-[14.5px] text-[#4b5b47] leading-[1.9]">
                    <span className="font-bold text-[#1f2a1d]">相談時：</span>
                    {c.before}
                  </p>
                  <p className="mt-1 text-[14.5px] text-[#4b5b47] leading-[1.9]">
                    <span className="font-bold text-[#1f2a1d]">設計した順番：</span>
                    {c.plan}
                  </p>
                  {c.voice ? (
                    <p className="mt-2.5 text-[14px] text-[#5c6b58] leading-[1.9] border-l-2 border-[#c9d3c4] pl-3">
                      「{c.voice}」
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[#5c6b58] leading-[1.9] rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              始まったばかりのため、実際の記録はまだ掲載していません。
              作り話は載せません。ご本人の許可が取れたものから、順番に公開します。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
