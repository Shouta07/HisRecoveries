// 改善プログラム＝2ステップの選択式デザイナー。
// ① 目的を選ぶ（直す / 自信 / 両方）→ ② 中身を選ぶ → 目安合計。
import PackageBuilder from "@/components/PackageBuilder";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PackagesSection() {
  return (
    <section id="packages" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1080px] mx-auto px-5 sm:px-8 pt-6 pb-16 md:pb-24">
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              Recovery Package
            </span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたに合わせて、<span className="text-[#3d5638]">設計します。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.85]">
            「直す」「自信をつける」「その両方」から選び、中身と予算で組み立て。最終価格はヒアリングで。
          </p>
        </div>

        {/* 2ステップの選択式ビルダー */}
        <div className="rounded-[1.6rem] bg-[#16241a] p-5 sm:p-7">
          <PackageBuilder />
        </div>
      </div>
    </section>
  );
}
