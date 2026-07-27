// 信頼要素。運営者・専門家ネットワーク・改善プロセス・匿名事例。
//
// 事実がないものは書かない。未記入の項目は「準備中」と正直に出す
// （創作した実績・事例は掲載しない）。データは src/lib/trust.ts。
import Link from "next/link";
import Image from "next/image";
import { operator, experts, cases, PROCESS } from "@/lib/trust";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function TrustSection() {
  const hasOperator = operator.name.length > 0;

  return (
    <section id="trust" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
          Who — 誰が、やるのか
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          任せる相手が、見えること。
        </h2>
        <p className="mt-4 text-[13.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          匿名でいられるのは、お客様の側です。わたしたちは、名前と顔と理由を出します。
        </p>

        {/* 運営者 */}
        <div className="mt-8 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-7">
          {hasOperator ? (
            <div className="flex flex-col sm:flex-row gap-5">
              {operator.photo ? (
                <div className="relative w-[104px] h-[104px] shrink-0 rounded-full overflow-hidden bg-[#eef3ea]">
                  <Image src={operator.photo} alt={operator.name} fill className="object-cover" sizes="104px" />
                </div>
              ) : null}
              <div>
                <p className="text-[15.5px] font-bold text-[#1f2a1d]" style={MINCHO}>
                  {operator.name}
                  <span className="ml-2 text-[12px] font-normal text-[#6b7a66]">{operator.role}</span>
                </p>
                {operator.why ? (
                  <p className="mt-2.5 text-[13px] text-[#4b5b47] leading-[1.95]">{operator.why}</p>
                ) : null}
                {operator.background.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {operator.background.map((b) => (
                      <li key={b} className="text-[12.5px] text-[#5c6b58] leading-[1.8]">
                        ・{b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[14px] font-bold text-[#1f2a1d]" style={MINCHO}>
                運営者プロフィール — 準備中
              </p>
              <p className="mt-2 text-[12.5px] text-[#5c6b58] leading-[1.9]">
                同じ悩みを経験した当事者が設計・運営しています。実名と経歴の公開を準備中です。
                先に人柄を知りたい方は、なぜこの事業をやるのかを書いた
                <Link href="/why" className="mx-1 text-[#3d5638] underline underline-offset-2 hover:opacity-70">
                  想いのページ
                </Link>
                をご覧ください。
              </p>
            </div>
          )}
        </div>

        {/* 改善プロセス（事実なので常時掲載） */}
        <div className="mt-10">
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            どう進めるか
          </div>
          <ol className="grid sm:grid-cols-5 gap-3">
            {PROCESS.map((p) => (
              <li key={p.n} className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-4 py-4">
                <span className="font-mono text-[10.5px] text-[#85AB8B]">{p.n}</span>
                <p className="mt-1 text-[13px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>
                  {p.t}
                </p>
                <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.75]">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* 専門家ネットワーク */}
        <div className="mt-10">
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            つなぐ相手
          </div>
          {experts.length > 0 ? (
            <ul className="grid sm:grid-cols-3 gap-3">
              {experts.map((e) => (
                <li key={e.field + e.name} className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-4 py-4">
                  <span className="font-mono text-[10.5px] text-[#85AB8B]">{e.field}</span>
                  <p className="mt-1 text-[13.5px] font-bold text-[#1f2a1d]" style={MINCHO}>
                    {e.name}
                  </p>
                  <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.75]">{e.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-[#5c6b58] leading-[1.9] rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
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
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            料金の決まり方と、やめ方
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              <p className="text-[13px] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
                料金の基準
              </p>
              <ul className="space-y-1.5 text-[12.5px] text-[#5c6b58] leading-[1.8]">
                <li>・90日 ¥298,000〜 の1本です（いまは他のプランを設けていません）</li>
                <li>・期間を延ばす場合のみ、着手前にご相談します</li>
                <li>・総額と内訳は、着手前に必ず提示します</li>
                <li>・提携先からの紹介料は受け取っていません</li>
              </ul>
            </div>
            <div className="rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              <p className="text-[13px] font-bold text-[#1f2a1d] mb-2" style={MINCHO}>
                返金・キャンセル
              </p>
              <ul className="space-y-1.5 text-[12.5px] text-[#5c6b58] leading-[1.8]">
                <li>・着手から2週間以内に合わないと感じた場合、全額返金します</li>
                <li>・以降の中断は、実施済みの工程分のみのご負担です</li>
                <li>・施術・商品の実費は、各事業者の規定に従います</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[11.5px] text-[#6b7a66] leading-[1.85]">
            ※ 正式な条件は契約書面でご確認いただきます。曖昧なままお金をいただくことはしません。
          </p>
        </div>

        {/* 匿名事例 */}
        <div className="mt-10">
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            実際の記録
          </div>
          {cases.length > 0 ? (
            <ul className="space-y-3">
              {cases.map((c) => (
                <li key={c.who} className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-5 py-5">
                  <span className="font-mono text-[10.5px] text-[#85AB8B]">{c.who}</span>
                  <p className="mt-1.5 text-[13px] text-[#4b5b47] leading-[1.9]">
                    <span className="font-bold text-[#1f2a1d]">相談時：</span>
                    {c.before}
                  </p>
                  <p className="mt-1 text-[13px] text-[#4b5b47] leading-[1.9]">
                    <span className="font-bold text-[#1f2a1d]">設計した順番：</span>
                    {c.plan}
                  </p>
                  {c.voice ? (
                    <p className="mt-2.5 text-[12.5px] text-[#5c6b58] leading-[1.9] border-l-2 border-[#c9d3c4] pl-3">
                      「{c.voice}」
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-[#5c6b58] leading-[1.9] rounded-[1rem] bg-white border border-[#1f2a1d]/10 px-5 py-4">
              始まったばかりのため、実際の記録はまだ掲載していません。
              作り話は載せません。ご本人の許可が取れたものから、順番に公開します。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
