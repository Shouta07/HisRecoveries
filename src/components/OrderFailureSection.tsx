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

// 自己流でよく起きる順番（＝失敗しやすい並び）
const SELF_ORDER = [
  { t: "とりあえず美容室", d: "情報が多い順に手をつけてしまう" },
  { t: "服を買い替える", d: "土台が整う前に、足し算から入る" },
  { t: "スキンケアを始める", d: "効果が出るまで時間がかかるのに、後回し" },
  { t: "直前に写真を撮る", d: "間に合わないまま、当日を迎える" },
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

        {/* 自己流の順番 */}
        <div className="mt-9 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-7">
          <div className="text-[12px] font-bold tracking-[0.08em] text-[#9aa79a] mb-4">
            自己流だと、だいたいこうなる
          </div>
          <ol className="grid sm:grid-cols-4 gap-3">
            {SELF_ORDER.map((s, i) => (
              <li key={s.t} className="relative rounded-[1rem] bg-[#f6f8f4] px-4 py-3.5">
                <span className="font-mono text-[10.5px] text-[#9aa79a]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-1 text-[13.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>
                  {s.t}
                </p>
                <p className="mt-1 text-[11.5px] text-[#6b7a66] leading-[1.7]">{s.d}</p>
                {i < SELF_ORDER.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden sm:block absolute -right-[11px] top-1/2 -translate-y-1/2 text-[#c9d3c4] text-[14px]"
                  >
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-start gap-2.5 rounded-[1rem] bg-[#16241A] text-[#EDF1E8] px-5 py-4">
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
