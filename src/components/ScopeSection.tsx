// 期待値調整ブロック。高単価サービスで最も重要な「買う前に、境界線を見せる」役割。
//
// クレームは「成果が出ない」ときより、「思っていたものと違う」ときに起きる。
// だから：提供する範囲／提供しない範囲／期待できる変化／期待できないこと／
// あなた自身にやってもらうこと、を購入前に正面から書く。
//
// 効果の保証はしない（薬機法・景表法）。断定と誇張を避け、静かに書く。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const DO = [
  "現在地の整理（何が減点になっているかを言葉にする）",
  "改善プランの作成（やらないことも決める）",
  "オフラインでの体験（眉・メイク・服選び・髪型提案・撮影）",
  "自分で再現できるまでの伴走",
  "変化の記録（Before / After）",
];

const DONT = [
  "医療行為（脱毛・注入・AGA治療などは行いません）",
  "医療判断（診断・治療方針の決定は、医師の領域です）",
  "効果の保証・仕上がりの保証",
  "本人に代わって続けること（習慣は、ご本人のものです）",
  "外見以外の悩み全般の解決（恋愛・転職そのものの成否は範囲外です）",
];

// 医療・美容を扱う以上、線引きは名詞で明示する（「紹介サービス」に見せない）。
const MEDICAL_DO = ["現在地の整理", "選択肢の整理", "情報の整理", "比較軸の作成", "質問の用意"];
const MEDICAL_DONT = ["医療判断", "効果保証", "施術結果の保証", "医師の代替"];

const CAN_EXPECT = [
  "何をやるか、何をやらないかが決まる",
  "眉・髪型・服の「自分に合う型」が分かる",
  "整えた状態を、自分で再現できるようになる",
  "写真で、変化が客観的に見える",
  "調べる・比べる・選ぶ時間がほぼなくなる",
];

const CANNOT_EXPECT = [
  "別人のように変わること",
  "何もしなくても変わること",
  "全員に同じ結果が出ること",
  "医学的な効果の保証",
  "短期間で、すべてが解決すること",
];

// お断りするご相談。断れることが商品になる（サロンもクリニックも言えない）。
// 医学的な断定はしない。「早くは難しい」「時間がかかる」に留める。
const DECLINE = [
  "短期間で、別人のように変わりたい",
  "肌荒れを、施術だけで早く消したい",
  "睡眠・食事・ストレスには手をつけたくない",
];

const YOUR_PART = [
  "決めた予約に、行くこと",
  "決めたことを、続けること（週に数分でも）",
  "現在地を、正直に共有すること",
];

function List({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "do" | "dont";
}) {
  const mark = tone === "do" ? "✓" : "—";
  const markColor = tone === "do" ? "text-[#3d5638]" : "text-[#9aa79a]";
  return (
    <div className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-6">
      <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((x) => (
          <li key={x} className="flex gap-2.5 text-[12.5px] text-[#4b5b47] leading-[1.85]">
            <span aria-hidden className={`${markColor} shrink-0 leading-[1.85]`}>
              {mark}
            </span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScopeSection() {
  return (
    <section id="scope" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
          Scope — 何をして、何をしないか
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          先に、境界線をお伝えします。
        </h2>
        <p className="mt-4 text-[13.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          お金を払ってから「思っていたものと違った」となるのが、いちばん不幸です。
          だから、できることと、できないことを、申し込みの前に書いておきます。
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
          <List title="提供すること" items={DO} tone="do" />
          <List title="提供しないこと" items={DONT} tone="dont" />
          <List title="期待できる変化" items={CAN_EXPECT} tone="do" />
          <List title="期待できないこと" items={CANNOT_EXPECT} tone="dont" />
        </div>

        {/* 医療・美容の線引き — 「おすすめクリニック紹介」に見せないための中核 */}
        <div className="mt-4 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-7">
          <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-1" style={MINCHO}>
            医療・美容を扱うときの、線引き
          </p>
          <p className="text-[12.5px] text-[#5c6b58] leading-[1.9]">
            わたしたちは医療者ではありません。だから、次のように分けています。
          </p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="rounded-[1rem] bg-[#f6f8f4] px-4 py-3.5">
              <p className="text-[11.5px] font-bold tracking-[0.06em] text-[#3d5638] mb-2">
                提供するもの
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {MEDICAL_DO.map((x) => (
                  <li
                    key={x}
                    className="rounded-full bg-white border border-[#1f2a1d]/10 px-2.5 py-1 text-[11.5px] text-[#1f2a1d]"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1rem] bg-[#f6f8f4] px-4 py-3.5">
              <p className="text-[11.5px] font-bold tracking-[0.06em] text-[#9aa79a] mb-2">
                提供しないもの
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {MEDICAL_DONT.map((x) => (
                  <li
                    key={x}
                    className="rounded-full bg-white border border-[#1f2a1d]/10 px-2.5 py-1 text-[11.5px] text-[#9aa79a] line-through decoration-[#c9a091]"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-[13.5px] font-bold text-[#1f2a1d] leading-[1.8]" style={MINCHO}>
            施術を受けるかどうかを決めるのは、あなたです。<br className="hidden sm:block" />
            私たちは、納得して選べる状態を作ります。
          </p>
          <p className="mt-2.5 text-[12px] text-[#6b7a66] leading-[1.9]">
            特定の医療機関を「おすすめ」することはしません。候補と、比べるための軸と、
            受診時に聞くべき質問をお渡しします。提携先からの紹介料は受け取っていません。
          </p>
        </div>

        {/* お断りする場合 — 受けない判断を先に見せる。ここが最大のクレーム予防。 */}
        <div className="mt-4 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-7">
          <p className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>
            こういうご相談は、お断りしています
          </p>
          <ul className="space-y-2">
            {DECLINE.map((x) => (
              <li key={x} className="flex gap-2.5 text-[12.5px] text-[#4b5b47] leading-[1.85]">
                <span aria-hidden className="text-[#9aa79a] shrink-0 leading-[1.85]">—</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-[#5c6b58] leading-[1.95]">
            とくに肌は、施術だけで早く、というのが難しい部分です。睡眠・食事・ストレスが関わり、
            年齢によってはホルモンの影響で避けにくい面もあります。医療にかかっても、
            <span className="text-[#1f2a1d] font-semibold">1年で解決するとは限りません</span>。
            期日が近いのに肌を主戦場にすると、間に合わないまま当日を迎えることになります。
          </p>
          <p className="mt-2.5 text-[12.5px] text-[#1f2a1d] leading-[1.95] font-semibold">
            ただ、肌が完璧でなくても、第一印象は動きます。
          </p>
          <p className="mt-1.5 text-[12.5px] text-[#5c6b58] leading-[1.95]">
            第一印象は、髪・眉・服のサイズ感・姿勢・表情・写真の撮られ方の総合点です。
            肌はそのうちの一つで、十割ではありません。期日が近い場合は、
            動かせる要素から整えます。肌は期日と切り離して、長く付き合う前提でお話しします。
          </p>
          <p className="mt-2.5 text-[12px] text-[#6b7a66] leading-[1.9]">
            それでも「施術中心で、短期間に」をお望みの場合は、力になれません。
            正直にお伝えして、お引き受けしません。
          </p>
        </div>

        {/* 顧客自身の役割 — ここを曖昧にすると必ず揉める */}
        <div className="mt-4 rounded-[1.2rem] bg-[#16241A] text-[#EDF1E8] px-5 sm:px-7 py-6">
          <p className="text-[14px] font-bold" style={MINCHO}>
            あなたにやっていただくこと
          </p>
          <p className="mt-2 text-[12.5px] text-[#C9D2C4] leading-[1.9]">
            段取りは全部こちらで引き受けます。ただし、代われないことが3つだけあります。
          </p>
          <ul className="mt-3 grid sm:grid-cols-3 gap-2.5">
            {YOUR_PART.map((x) => (
              <li
                key={x}
                className="rounded-[0.9rem] bg-white/[0.06] border border-white/10 px-4 py-3 text-[12.5px] leading-[1.75]"
              >
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-[11.5px] text-[#9ec4a3] leading-[1.85]">
            逆に言えば、この3つさえやっていただければ、あとは考えなくて大丈夫です。
          </p>
        </div>
      </div>
    </section>
  );
}
