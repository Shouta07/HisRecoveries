// 点を、線に。＝ 事業の軸。ヒーロー直後に置く。
// 一言の思想（点→線）＋「最初の一歩＝ふたつの現在地」カードだけに絞る。
// 記録が育つ／同意の話は package 詳細に譲り、ここでは一行に留める（密度を上げない）。
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

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
          <p className="mt-4 text-[#4b5b47] text-[13.5px] sm:text-[15px] leading-[1.95]">
            悩みは、ばらばらに売られている。<span className="text-[#1f2a1d] font-medium">あなたは、ひとりしかいないのに。</span>
            <br className="hidden sm:block" />
            その点をつなぎ、一本の回復の旅程に。はじまりは、いまの自分を知ることから。
          </p>
        </div>

        {/* 最初の一歩 — ふたつの現在地（外側＝第一印象／内側＝血液）。価格はここに書かない。 */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/packages/first-impression"
            className="group rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 hover:bg-[#1c2e21] transition-colors"
          >
            <div className="text-[10px] tracking-[0.18em] text-[#85AB8B] font-semibold mb-2">外側の現在地</div>
            <div className="text-[1.05rem] font-bold leading-[1.5]" style={MINCHO}>第一印象を整える、一日。</div>
            <p className="mt-2 text-[12px] text-[#9FB0A0] leading-[1.85]">
              メイク・服・写真を、専属チームと過ごす一日で。持ち帰るのは「あなたの取扱説明書」。
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
              悪いところを探す検査ではなく、現在地を知る検査。
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:text-[#1f2a1d] transition-colors">
              ご案内は、匿名相談から <span aria-hidden>→</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
