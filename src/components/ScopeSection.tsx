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

// 以前は「提供する/しない」と「期待できる/できない」を別々の4リストにしていたが、
// 中身がほぼ同じことの言い換えだった。2リストに統合する。
const DO = [
  "現在地の整理（何が減点になっているかを言葉にする）",
  "改善プランの作成（やらないことも決める）",
  "オフラインでの体験（眉・メイク・服選び・髪型提案・撮影）",
  "次に使える材料の納品（手順動画・眉の型・服のサイズ表・オーダー資料）",
  "実施後30日間の質問窓口（LINE）",
];

const DONT = [
  "医療行為・医療判断（診断や治療方針は、医師の領域です）",
  "効果の保証・仕上がりの保証",
  "習得の保証（お渡しした手順を、必ず再現できるようになること）",
  "別人のように変えること",
  "本人に代わって続けること（習慣は、ご本人のものです）",
  "外見以外の悩み全般の解決（恋愛・転職そのものの成否は範囲外です）",
];

// お断りするご相談。断れることが商品になる（サロンもクリニックも言えない）。
// 医学的な断定はしない。「早くは難しい」「時間がかかる」に留める。
const DECLINE = [
  "短期間で、別人のように変わりたい",
  "肌荒れを、施術だけで早く消したい",
  "睡眠・食事・ストレスには手をつけたくない",
  "東京都内に、土日1日来ることが難しい（オンラインのみの対応はしていません）",
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
  const markColor = tone === "do" ? "text-[#8A6A3B]" : "text-[#5E6A70]";
  return (
    <div className="rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 p-5 sm:p-6">
      <p className="text-[15px] font-bold text-[#1F1E1B] mb-3" style={MINCHO}>
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((x) => (
          <li key={x} className="flex gap-2.5 text-[14px] text-[#45443E] leading-[1.85]">
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
    <section id="scope" className="relative z-10 scroll-mt-24 text-[#1F1E1B] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          できること・できないこと
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          先に、境界線をお伝えします。
        </h2>
        <p className="mt-4 text-[15px] text-[#45443E] leading-[1.95] max-w-[34rem]">
          お金を払ってから「思っていたものと違った」となるのが、いちばん不幸です。
          だから、できることと、できないことを、申し込みの前に書いておきます。
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
          <List title="提供すること" items={DO} tone="do" />
          <List title="提供しないこと" items={DONT} tone="dont" />
        </div>

        {/* お断りする場合 — 受けない判断を先に見せる。ここが最大のクレーム予防。
            肌の説明は長くなるので、詳細は FAQ に逃がして要点だけ残す。 */}
        <div className="mt-4 rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 p-5 sm:p-7">
          <p className="text-[15px] font-bold text-[#1F1E1B] mb-3" style={MINCHO}>
            こういうご相談は、お断りしています
          </p>
          <ul className="space-y-2">
            {DECLINE.map((x) => (
              <li key={x} className="flex gap-2.5 text-[14px] text-[#45443E] leading-[1.85]">
                <span aria-hidden className="text-[#5E6A70] shrink-0 leading-[1.85]">—</span>
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] text-[#45443E] leading-[1.95] border-t border-[#1F1E1B]/10 pt-4">
            とくに肌は、施術だけで早く、というのが難しい部分です。医療にかかっても
            <span className="text-[#1F1E1B] font-semibold">1年で解決するとは限りません</span>。
            ただ、<span className="hr-mark">肌が完璧でなくても、第一印象は動きます</span>。
            第一印象は髪・眉・服のサイズ感・姿勢・表情・写真の総合点で、肌はその一つだからです。
            期日が近い場合は、動かせる要素から整えます。
          </p>
          <p className="mt-2.5 text-[13.5px] text-[#5E6A70] leading-[1.9]">
            医療行為は行いません。特定の医療機関を「おすすめ」することもせず、
            紹介料も受け取っていません。施術を受けるかどうかを決めるのは、あなたです。
          </p>
        </div>

        {/* 顧客自身の役割 — ここを曖昧にすると必ず揉める */}
        <div className="mt-4 rounded-[1.2rem] bg-[#2C3A2E] text-[#F3F0EA] px-5 sm:px-7 py-6">
          <p className="text-[15px] font-bold" style={MINCHO}>
            あなたにやっていただくこと
          </p>
          <ul className="mt-3 grid sm:grid-cols-3 gap-2.5">
            {YOUR_PART.map((x) => (
              <li
                key={x}
                className="rounded-[0.9rem] bg-white/[0.06] border border-white/10 px-4 py-3 text-[14px] leading-[1.75]"
              >
                {x}
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-[12.5px] text-[#B9A06B] leading-[1.85]">
            この3つさえやっていただければ、あとは考えなくて大丈夫です。
          </p>
        </div>
      </div>
    </section>
  );
}
