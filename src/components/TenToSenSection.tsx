// 点を、線に。— 柱1（点の解決を、線の回復に）＋柱4（体験するだけで、記録が育つ）。
// A Day の後に置く。バラバラに売られてきた悩み → 一本の旅程 → 記録は
// あなたのものとして育つ → 次の一歩は記録をもとに、を静かに1画面で。
//
// 表現の絶対条件（docs 指示）:
// - 記録は常に「あなたのもの」「あなたの同意のもと」を明示する
// - 記録の主体を HR に見せない（預かる構造で書く）
// - 囲い込み・監視・データ収集の匂いを出さない
// - 提携先への言及は「施術をしない／中身まで知っている現場だけ」まで

import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const BEATS = [
  {
    no: "01",
    t: "ばらばらを、ひとつに",
    d: "見た目・体・心。別々に扱われてきた悩みを、あなたという一人の全体から、設計し直します。",
  },
  {
    no: "02",
    t: "体験するだけで、記録が育つ",
    d: "振り返るために、書き留めなくていい。あなたの同意があるときだけ、一日の対話と気づきを、あなたの記録としてお預かりします。記録は、あなたのものです。",
  },
  {
    no: "03",
    t: "次の一歩は、記録から",
    d: "続きが必要になったら、育った記録をもとに、次の一歩を一緒に設計します。私たちは施術をしません。ご紹介するのは、業務の中身まで知っている現場だけです。",
  },
];

export default function TenToSenSection() {
  return (
    <section id="journey" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Journey</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            点を、<span className="text-[#3d5638]">線に。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[13.5px] sm:text-[15px] leading-[2.0]">
            悩みは、ばらばらに売られている。脱毛はここ、髪はあそこ、服はまた別の店。
            <br className="hidden sm:block" />
            <span className="text-[#1f2a1d] font-medium">あなたは、ひとりしかいないのに。</span>
          </p>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            His Recoveries は、その点をつなぎます。一日の体験は終わりではなく、あなたの回復の旅程の、最初の一歩です。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {BEATS.map((b) => (
            <div key={b.no} className="rounded-[1.4rem] bg-white/70 backdrop-blur-sm border border-[#1f2a1d]/10 p-6 sm:p-7">
              <span className="font-mono text-[11px] tracking-[0.18em] text-[#85AB8B]">{b.no}</span>
              <div className="mt-2 text-[15px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>{b.t}</div>
              <p className="mt-2.5 text-[12.5px] text-[#4b5b47] leading-[1.95]">{b.d}</p>
            </div>
          ))}
        </div>

        <p className="on-media mt-4 text-[12px] text-[#6b7a66] leading-[1.8]">
          記録のお預かりは、ご本人の同意があるときだけ。やめたいときは、いつでもやめられます。
        </p>

        {/* 最初の一歩 — ふたつの現在地（外側＝第一印象／内側＝血液）。価格はここに書かない。 */}
        <div className="on-media mt-10">
          <h3 className="text-[1.15rem] sm:text-[1.35rem] leading-[1.5] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            最初の一歩は、<span className="text-[#3d5638]">ふたつの現在地</span>から。
          </h3>
          <p className="mt-2 text-[12.5px] text-[#6b7a66] leading-[1.85]">
            旅程は、いまの自分を知るところから始まります。外側と内側、どちらからでも。
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-3 sm:gap-4">
            <Link
              href="/packages/first-impression"
              className="group rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 hover:bg-[#1c2e21] transition-colors"
            >
              <div className="text-[10px] tracking-[0.18em] text-[#85AB8B] font-semibold mb-2">外側の現在地</div>
              <div className="text-[1.05rem] font-bold leading-[1.5]" style={MINCHO}>第一印象を整える、一日。</div>
              <p className="mt-2 text-[12px] text-[#9FB0A0] leading-[1.85]">
                メイク・服・写真。専属チームと過ごす一日で、外側をまるごと。持ち帰るのは「あなたの取扱説明書」。
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#85AB8B] group-hover:text-[#EDF1E8] transition-colors">
                詳しく見る <span aria-hidden>→</span>
              </span>
            </Link>
            <Link
              href="/apply"
              className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-6 sm:p-7 hover:border-[#3d5638]/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold">内側の現在地</span>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#eef3ea] text-[#3d5638]">準備中</span>
              </div>
              <div className="text-[1.05rem] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>血液で、現在地を知る。</div>
              <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85]">
                悪いところを探す検査ではなく、現在地を知る検査。提携クリニックでの検査と、結果のあとの伴走まで。
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:text-[#1f2a1d] transition-colors">
                ご案内は、匿名相談から <span aria-hidden>→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
