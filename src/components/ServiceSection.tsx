// サービス内容のメイン ＝ オフラインのリアルな回復体験（第一印象を、まるごと整える一日）。
// 実写の体験写真を主役に。オンラインの日々の伴走は別ページ /online（準備中）へ。
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 各タイルは実写写真（/public/media/offline/*.jpg）を背景に敷く。
// 写真が未配置でも、第2レイヤーのグラデが出るので“壊れた画像”にはならない。
type Tile = { no: string; t: string; s: string; img: string; fallback: string };

const OFFLINE: Tile[] = [
  {
    no: "01",
    t: "似合う髪に、出会う",
    s: "スタイリング",
    img: "/media/offline/styling.jpg",
    fallback: "linear-gradient(150deg,#efeae2,#cdc2af)",
  },
  {
    no: "02",
    t: "プロが選ぶ、一着",
    s: "服選び",
    img: "/media/offline/clothes.jpg",
    fallback: "linear-gradient(150deg,#eef3ea,#c2cfba)",
  },
  {
    no: "03",
    t: "根本へ、専門の手で",
    s: "提携クリニック施術",
    img: "/media/offline/clinic.jpg",
    fallback: "linear-gradient(150deg,#eaf1f1,#bcd0cc)",
  },
  {
    no: "04",
    t: "変わった自分を、写真で",
    s: "撮影",
    img: "/media/offline/photo.jpg",
    fallback: "linear-gradient(150deg,#eaefe9,#bcc8be)",
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
            リアルで、<span className="text-[#3d5638]">整える。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            プロと過ごす一日で、髪・服・肌、そして写真まで。
            ひとつの窓口で、第一印象をまるごと整えます。
          </p>
        </div>

        {/* オフライン体験：実写を主役にした4ステップ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {OFFLINE.map((x) => (
            <div
              key={x.no}
              className="group relative rounded-[1.4rem] overflow-hidden aspect-[3/4] shadow-sm"
              style={{
                backgroundImage: `url('${x.img}'), ${x.fallback}`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* 下部スクリム：写真の上でも文字が読めるように */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(15,21,13,0) 38%, rgba(15,21,13,0.72) 100%)" }}
              />
              <span className="absolute top-3 left-3.5 font-mono text-[11px] tracking-[0.18em] text-white/85">{x.no}</span>
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                <div className="text-[13.5px] sm:text-[15px] font-bold text-white leading-[1.4]" style={MINCHO}>{x.t}</div>
                <div className="text-[10.5px] sm:text-[11.5px] text-white/75 mt-1 tracking-[0.04em]">{x.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* オンラインは準備中 → 別ページへ */}
        <div className="mt-6 sm:mt-7">
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
