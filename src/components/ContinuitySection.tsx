// 90日で関係を終わらせないための継続設計。
//
// ユーザー心理の流れ：「変わりたい」→「維持したい」→「さらに良くしたい」。
// 美容メンテナンスではなく、印象と習慣の"定点観測"として設計する。
// 効果の保証はしない。約束するのは、状態の確認と、次の節目への備え。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const STAGES = [
  {
    key: "Recover",
    ja: "整える",
    mind: "変わりたい",
    period: "90日",
    price: "¥98,000",
    d: "大事な日から逆算し、必要な変化だけを順番に。当日を迎えるまで進行を管理します。",
  },
  {
    key: "Maintain",
    ja: "保つ",
    mind: "維持したい",
    period: "年間",
    price: "¥60,000／年",
    d: "四半期ごとの定点チェックと、年2回の順番見直し。整えた状態は、放っておくと戻ります。",
  },
  {
    key: "Refine",
    ja: "高める",
    mind: "さらに良くしたい",
    period: "節目ごと",
    price: "¥30,000〜",
    d: "昇進・転職・同窓会・家族の行事。次の節目に合わせて、短期で設計し直します。",
  },
];

export default function ContinuitySection() {
  return (
    <section id="continuity" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
          After — その日を過ぎたあと
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          90日で、終わりにしない。
        </h2>
        <p className="mt-4 text-[13.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          整えた状態は、放っておくと戻ります。そして、次の節目は必ず来ます。
          続けたい方には、状態を保つための関わり方を用意しています。
          <span className="text-[#1f2a1d]">続けない選択も、もちろんあります。</span>
        </p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 sm:gap-4">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              className={`relative rounded-[1.4rem] p-5 sm:p-6 ${
                i === 0
                  ? "bg-[#16241A] text-[#EDF1E8]"
                  : "bg-white border border-[#1f2a1d]/10 text-[#1f2a1d]"
              }`}
            >
              <div
                className={`font-mono text-[10.5px] tracking-[0.2em] uppercase ${
                  i === 0 ? "text-[#85AB8B]" : "text-[#3d5638]"
                }`}
              >
                {s.key}
              </div>
              <p className="mt-1.5 text-[15.5px] font-bold" style={MINCHO}>
                {s.ja}
              </p>
              <p
                className={`mt-0.5 text-[11.5px] ${
                  i === 0 ? "text-[#9ec4a3]" : "text-[#6b7a66]"
                }`}
              >
                「{s.mind}」
              </p>
              <p
                className={`mt-3 text-[12px] leading-[1.85] ${
                  i === 0 ? "text-[#C9D2C4]" : "text-[#5c6b58]"
                }`}
              >
                {s.d}
              </p>
              <div
                className={`mt-4 pt-3 border-t text-[12px] ${
                  i === 0 ? "border-white/15 text-[#EDF1E8]" : "border-[#1f2a1d]/10 text-[#1f2a1d]"
                }`}
              >
                <span className="font-bold">{s.price}</span>
                <span className={`ml-2 text-[11px] ${i === 0 ? "text-[#9ec4a3]" : "text-[#6b7a66]"}`}>
                  {s.period}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 継続は任意です。自動更新はしません。更新の可否は、その都度こちらから確認します。
        </p>
      </div>
    </section>
  );
}
