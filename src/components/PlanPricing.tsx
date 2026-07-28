// プランの中身。以前はここが価格表だった。
//
// 金額をサイトから外したので、この面の仕事は「何をするか」「何が残るか」
// 「何で費用が変わるか」を示すことに変わった。売り込む面ではなく、
// 相談に来るかどうかを判断してもらうための面として書く。
import ConsultLink from "@/components/ConsultLink";
import { COST_FACTORS, DELIVERABLES, OUT_OF_POCKET, PLAN, SUPPORT } from "@/lib/pricing";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 5ステップ＝商品の骨格。工程を見せることで「相談だけのサービス」ではないと伝える。
const STEPS = [
  { n: "01", t: "カウンセリング", d: "何が気になっているのかを、一緒に言葉にします。ここが起点です。" },
  { n: "02", t: "改善プランの作成", d: "何をやるか、何をやらないかを決めて、一枚にまとめます。" },
  { n: "03", t: "オフライン体験（1日）", d: "眉・メンズメイク・服選び・髪型の提案・写真撮影。東京都内・土日のみの実施です。" },
  { n: "04", t: "持ち帰るものを、その日につくる", d: "撮影も記録も、その場で行います。" },
  { n: "05", t: "次に使える形にして、渡す", d: "下の6点です。買い物や美容室で、そのまま使えます。" },
];

export default function PlanPricing() {
  return (
    <section id="pricing" className="relative z-10 scroll-mt-24 text-[#1f2a1d] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">Plan — 何をするのか</p>
        <h2
          className="text-[1.45rem] sm:text-[2rem] leading-[1.4]"
          style={{ ...MINCHO, fontWeight: 800 }}
        >
          {PLAN.days}日で、この5つを終わらせます。
        </h2>

        <div className="mt-8 rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* 仕様 — 読まない人がここだけで判断できるように */}
          <div className="bg-[#16241A] text-[#EDF1E8] px-6 sm:px-9 py-6 sm:py-7">
            <div className="hr-eyebrow hr-eyebrow-on-dark">{PLAN.name}</div>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
              {[
                ["期間", `${PLAN.days}日`],
                ["実施", `${PLAN.where}・${PLAN.when}`],
                ["所要", `${PLAN.duration}（体験）`],
                ["費用", "個別のお見積り"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10.5px] tracking-[0.14em] uppercase text-[#9FB0A0]">{k}</dt>
                  <dd className="hr-figure mt-1 text-[15px] sm:text-[16px] font-bold text-[#E0B75F]">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 pt-4 border-t border-[#E0B75F]/20 text-[14px] text-[#C9D2C4] leading-[1.9]">
              内容は人によって変わります。何をやるかだけでなく
              <span className="hr-mark-dark">何をやらないかを決めるのが仕事</span>
              なので、一律の金額を先に出していません。ご相談のうえでお見積りをお出しします。
            </p>
          </div>

          {/* 5ステップ */}
          <div className="px-6 sm:px-9 py-7">
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
          </div>

          {/* 納品物 */}
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

        {/* 費用の決まり方 — 金額の代わりに、変数を開示する */}
        <div className="mt-6 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-6 sm:px-8 py-6">
          <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-1.5">
            費用について
          </p>
          <p className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.7]" style={MINCHO}>
            金額は先に言えませんが、何で決まるかは言えます。
          </p>
          <ul className="mt-4 grid sm:grid-cols-3 gap-x-6 gap-y-2.5">
            {COST_FACTORS.map((f, i) => (
              <li key={f} className="flex gap-2.5 text-[13.5px] text-[#4b5b47] leading-[1.85]">
                <span
                  aria-hidden
                  className="hr-figure shrink-0 text-[12px] font-bold text-[#B98A3C] pt-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {f}
              </li>
            ))}
          </ul>
          <dl className="mt-5 pt-4 border-t border-[#1f2a1d]/10 text-[13.5px] leading-[1.9]">
            <div className="flex gap-3">
              <dt className="shrink-0 w-[5.5em] font-bold text-[#3d5638]">含みます</dt>
              <dd className="text-[#5c6b58]">
                体験（眉・メイク・服選び・髪型提案・撮影）／会場費／上の納品物6点／
                {SUPPORT.days}日間の質問窓口
              </dd>
            </div>
            <div className="mt-2 flex gap-3">
              <dt className="shrink-0 w-[5.5em] font-bold text-[#9aa79a]">含みません</dt>
              <dd className="text-[#5c6b58]">{OUT_OF_POCKET.join("／")}（いずれも実費）</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] text-[#6b7a66] leading-[1.9]">
            提携先からの紹介料は受け取っていません。だから「それは要りません」と言えます。
            お見積りはご相談のあとにお出しします。
            金額にご納得いただけない場合は、そこでやめていただいて構いません。
          </p>
        </div>

        {/* 入口 — CTAは相談ひとつだけ */}
        <div className="mt-6 rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] px-6 sm:px-8 py-7">
          <p className="text-[16px] sm:text-[17px] font-bold leading-[1.65]" style={MINCHO}>
            まず、合うかどうかを確かめてください。
          </p>
          <p className="mt-3 text-[14px] text-[#C9D2C4] leading-[1.95] max-w-[34rem]">
            ご相談は無料です。実名も顔写真も要りません。
            できること・できないことをお伝えして、
            <span className="hr-mark-dark">合わないと思えば、その場でそう言います</span>。
            そのうえで、必要ならお見積りをお出しします。
          </p>
          <div className="mt-6">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#E0B75F] hover:bg-[#EBC97E] text-[#16241A] text-[15px] font-bold px-7 py-3.5 transition-colors">
              無料で相談する <span aria-hidden>→</span>
            </ConsultLink>
          </div>
        </div>
      </div>
    </section>
  );
}
