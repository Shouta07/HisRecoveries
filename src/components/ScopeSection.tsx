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
  "その日から逆算した順番の設計（やらないことも決める）",
  "専門家・施設の選定と予約の代行",
  "実行中の判断相談（迷ったその場で聞ける）",
  "締切の管理と進捗の確認",
];

const DONT = [
  "施術そのもの（医療行為・美容施術は、提携する専門家が行います）",
  "医学的な診断・治療方針の決定（医師の領域です）",
  "効果や結果の保証（人により変わります）",
  "本人に代わって実行すること（通うのも、続けるのも、ご本人です）",
  "外見以外の悩み全般の解決（恋愛・転職そのものの成否は範囲外です）",
];

const CAN_EXPECT = [
  "何を、いつ、どの順でやるかが決まる",
  "調べる・比べる・選ぶ時間がほぼなくなる",
  "やらなくていいことが分かり、出費が減ることがある",
  "迷ったときに聞ける相手がいる状態になる",
  "期日までの進捗が、可視化される",
];

const CANNOT_EXPECT = [
  "別人のように変わること",
  "何もしなくても変わること",
  "全員に同じ結果が出ること",
  "医学的な効果の保証",
  "短期間で、すべてが解決すること",
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
