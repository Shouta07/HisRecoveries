// サービス内容 ＝ 想定している体験を「旅（Journey）」としてパッケージ化して提示。
// 提供中の主役：第一印象を取り戻す旅（実写の4ステップ）。
// 構想中のラインナップ：根本／癒し／自信 の旅。オンライン伴走は /online（準備中）。
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 第一印象の旅に含まれる4つの体験（実写写真を主役に）。
// 写真未配置でも第2レイヤーのグラデが出るので“壊れた画像”にはならない。
type Step = { no: string; t: string; s: string; img: string; fallback: string };

const FIRST_IMPRESSION: Step[] = [
  { no: "01", t: "似合う髪に、出会う", s: "スタイリング", img: "/media/offline/styling.jpg", fallback: "linear-gradient(150deg,#efeae2,#cdc2af)" },
  { no: "02", t: "プロが選ぶ、一着", s: "服選び", img: "/media/offline/clothes.jpg", fallback: "linear-gradient(150deg,#eef3ea,#c2cfba)" },
  { no: "03", t: "根本へ、専門の手で", s: "提携クリニック施術", img: "/media/offline/clinic.jpg", fallback: "linear-gradient(150deg,#eaf1f1,#bcd0cc)" },
  { no: "04", t: "変わった自分を、写真で", s: "撮影", img: "/media/offline/photo.jpg", fallback: "linear-gradient(150deg,#eaefe9,#bcc8be)" },
];

// 今後そろえていく「旅」のラインナップ（構想中）。
type Journey = { no: string; name: string; concept: string; items: string[] };

const JOURNEYS: Journey[] = [
  {
    no: "02",
    name: "根本から、整える旅",
    concept: "現在地を数値で知り、原因から。提携クリニックと、定着まで。",
    items: ["血液検査", "コンプレックス施術", "ケアの型", "記録と伴走"],
  },
  {
    no: "03",
    name: "癒しを求める旅",
    concept: "張りつめた心と体を、ほどく。休む技術から、整える。",
    items: ["温浴・サウナ", "睡眠リカバリー", "メンタルケア", "余白の時間"],
  },
  {
    no: "04",
    name: "自信を、取り戻す旅",
    concept: "すべての領域を、一気通貫で。専属が、定着まで伴走する。",
    items: ["総合可視化", "ロードマップ設計", "領域横断の実行", "専属の伴走"],
  },
];

export default function ServiceSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-6">
        <div className="on-media max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Service</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            整えるための、<span className="text-[#3d5638]">いくつかの旅。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            目的に合わせて、体験をひとつのパッケージに。
            一日で印象を変える旅から、根本に向き合う旅まで。
          </p>
        </div>

        {/* ===== 提供中の主役：第一印象を取り戻す旅 ===== */}
        <div className="rounded-[1.8rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
            <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#3d5638]">Journey 01</span>
            <span className="inline-flex items-center rounded-full bg-[#3d5638] text-white px-2.5 py-0.5 text-[10px] font-bold tracking-[0.06em]">提供中</span>
          </div>
          <h3 className="text-[1.35rem] sm:text-[1.7rem] font-bold text-[#1f2a1d] leading-[1.35]" style={MINCHO}>
            第一印象を取り戻す旅
          </h3>
          <p className="mt-2.5 text-[#4b5b47] text-[13px] sm:text-[14px] leading-[1.85] max-w-2xl">
            プロと過ごす一日で、髪・服・肌、そして写真まで。
            ひとつの窓口で、第一印象をまるごと整えます。
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {FIRST_IMPRESSION.map((x) => (
              <div
                key={x.no}
                className="relative rounded-[1.3rem] overflow-hidden aspect-[3/4]"
                style={{ backgroundImage: `url('${x.img}'), ${x.fallback}`, backgroundSize: "cover", backgroundPosition: "center" }}
              >
                <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,21,13,0) 38%, rgba(15,21,13,0.72) 100%)" }} />
                <span className="absolute top-3 left-3.5 font-mono text-[11px] tracking-[0.18em] text-white/85">{x.no}</span>
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <div className="text-[13px] sm:text-[15px] font-bold text-white leading-[1.4]" style={MINCHO}>{x.t}</div>
                  <div className="text-[10.5px] sm:text-[11.5px] text-white/75 mt-1 tracking-[0.04em]">{x.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 広がっていく旅（構想中） ===== */}
        <div className="on-media mt-8 mb-4 flex items-center gap-3">
          <h3 className="text-[15px] sm:text-[17px] font-bold text-[#1f2a1d]" style={MINCHO}>広がっていく、旅。</h3>
          <span className="text-[11.5px] text-[#6b7a66]">これから、順次。</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {JOURNEYS.map((j) => (
            <div key={j.no} className="rounded-[1.4rem] bg-[#f0f4ee]/80 border border-[#1f2a1d]/10 p-5 flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6b7a66]">Journey {j.no}</span>
                <span className="inline-flex items-center rounded-full bg-[#1f2a1d]/[0.06] text-[#4b5b47] px-2 py-0.5 text-[9.5px] font-bold tracking-[0.08em]">構想中</span>
              </div>
              <h4 className="text-[1.05rem] font-bold text-[#1f2a1d] leading-[1.4]" style={MINCHO}>{j.name}</h4>
              <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.8]">{j.concept}</p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {j.items.map((it) => (
                  <span key={it} className="inline-flex items-center rounded-full bg-white border border-[#1f2a1d]/10 text-[#3a423a] px-2.5 py-1 text-[11px]">{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* オンラインは準備中 → 別ページへ */}
        <div className="mt-7">
          <Link
            href="/online"
            className="on-media inline-flex items-center gap-2 text-[12.5px] sm:text-[13.5px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity"
          >
            毎日そばで支える「オンライン伴走」は準備中です
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
