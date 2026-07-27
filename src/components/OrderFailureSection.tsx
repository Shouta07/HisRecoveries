// 購買理由を「清潔感を上げたい」から
// 「失敗したくない・後悔したくない・自分では判断できない・時間がない」へ移すブロック。
//
// 主張はひとつ：**多くの男性は、努力不足ではなく順番で失敗する。**
// 自己流の典型的な順番を見せ、「あなたの場合は何からか」で診断へ送る。
// トーンは静かに。責めない・煽らない（モテ/逆転/男磨き の語彙は使わない）。
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 本当の競合は美容サービスではなく「自己流で迷走すること」。
// だから比較対象として、自己流の道筋とHRの道筋を並べて見せる。
const SELF_ORDER = [
  "調べる",
  "流行っているものを試す",
  "効果がわからない",
  "別のものを探す",
  "期限直前になる",
  "焦る",
];

const HR_ORDER = [
  "現在地を知る",
  "必要な順番を決める",
  "期限から逆算する",
  "必要な選択だけする",
  "当日を迎える",
];

export default function OrderFailureSection() {
  return (
    <section id="order" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[10.5px] tracking-[0.24em] uppercase text-[#3d5638] mb-3">
          なぜ、自己流だと届かないのか
        </p>
        <h2
          className="text-[1.45rem] sm:text-[2rem] leading-[1.4] text-[#1f2a1d]"
          style={{ ...MINCHO, fontWeight: 800 }}
        >
          多くの男性は、努力不足ではなく
          <br className="hidden sm:block" />
          <span className="text-[#3d5638]">順番</span>で失敗します。
        </h2>
        <p className="mt-4 text-[13.5px] sm:text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
          やる気がないわけでも、情報が足りないわけでもありません。
          効くまでに時間がかかるものを後回しにして、すぐ変わるものから手をつける。
          それだけで、同じ努力が間に合わなくなります。
        </p>

        {/* 自己流 vs His Recoveries — 本当の競合を並べて見せる */}
        <div className="mt-9 grid sm:grid-cols-2 gap-3 sm:gap-4">
          {/* 自己流 */}
          <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-6">
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
              自己流の場合
            </div>
            <ol className="space-y-0">
              {SELF_ORDER.map((t, i) => (
                <li key={t} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span aria-hidden className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c9d3c4]" />
                    {i < SELF_ORDER.length - 1 && (
                      <span aria-hidden className="w-px flex-1 bg-[#e7ece4] mt-1" />
                    )}
                  </div>
                  <p className="text-[13.5px] text-[#5c6b58] leading-[1.6]">{t}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* His Recoveries */}
          <div className="rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] p-5 sm:p-6">
            <div className="text-[12px] font-bold tracking-[0.08em] text-[#85AB8B] mb-4">
              His Recoveries の場合
            </div>
            <ol className="space-y-0">
              {HR_ORDER.map((t, i) => (
                <li key={t} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span aria-hidden className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#9ec4a3]" />
                    {i < HR_ORDER.length - 1 && (
                      <span aria-hidden className="w-px flex-1 bg-[#9ec4a3]/30 mt-1" />
                    )}
                  </div>
                  <p className="text-[13.5px] leading-[1.6]">{t}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-7">
          <div className="flex items-start gap-2.5 rounded-[1rem] bg-[#16241A] text-[#EDF1E8] px-5 py-4">
            <span aria-hidden className="text-[#9ec4a3] text-[15px] leading-none mt-0.5">
              →
            </span>
            <div>
              <p className="text-[14px] font-bold leading-[1.6]" style={MINCHO}>
                では、あなたの場合は何からやるべきか。
              </p>
              <p className="mt-1 text-[12px] text-[#C9D2C4] leading-[1.85]">
                同じ悩みでも、期日・現在地・体質で最初の一手は変わります。
                そこを設計するのが、このサービスです。
              </p>
              <Link
                href="/#plan"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[13px] font-bold px-6 py-2.5 transition-colors"
              >
                30秒で自分専用プランを見る <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
