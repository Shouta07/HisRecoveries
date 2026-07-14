// サービス内容 ＝ 第一印象改善パッケージ「一日の体験」。
// 写真タイルは実写素材が用意できるまで置かない（プレースホルダのグラデ板は
// わくわくを削ぐため削除）。当日の中身は A Day セクションが担う。
// （構想中の「旅」ラインナップ／オンライン伴走は docs/_archive にアーカイブ）

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

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
            第一印象を、<span className="text-[#3d5638]">まるごと整える。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            「似合う」は、一人ひとり違う。だから、あなた専属のプロが、
            あなたに合わせてパーソナルに。メイクも、服も、写真も——
            はじめてでも、一日で迷わず整えます。
          </p>
        </div>

        <p className="on-media text-[12px] text-[#6b7a66] leading-[1.8]">
          すべて完全マンツーマンで。最後に、明日から自分で使える「あなたの取扱説明書」を持ち帰ります。
        </p>
      </div>
    </section>
  );
}
