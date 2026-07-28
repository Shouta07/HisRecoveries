import Link from "next/link";

// 自己同定のためのブロック。「条件」ではなく「瞬間」を書く。
//
// 人が「これは自分のことだ」と思うのは、属性（年齢・地域）を読んだときではなく、
// 自分が実際に経験した場面を、言い当てられたときである。
// だから抽象語（清潔感・自己投資）を使わず、具体的な情景だけを置く。
//
// トーン厳守：責めない・笑わない・煽らない。読んだ人が恥をかかないように。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const MOMENTS = [
  {
    when: "結婚式が決まった",
    text: "前撮りの日程が届いた日。はじめて、自分の顔をまじまじと見た。",
  },
  {
    when: "写真を求められた",
    text: "プロフィールに使える写真が、1枚もなかった。",
  },
  {
    when: "画面に映った自分",
    text: "オンライン会議の自分が、思っていたより疲れて見えた。",
  },
  {
    when: "美容室で聞かれた",
    text: "「どうしますか」に、いつも「短めで」としか答えられない。",
  },
];

export default function MomentSection() {
  return (
    <section id="moment" className="relative z-10 scroll-mt-24 text-[#1F1E1B] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          来られるきっかけ
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          だいたい、こういう日に来られます。
        </h2>

        {/* スマホでも2列。4枚を縦に積むと、それだけで1画面を使ってしまう。 */}
        <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-4">
          {MOMENTS.map((m) => (
            <li
              key={m.when}
              className="rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-4 sm:px-5 py-4 sm:py-5"
            >
              <p className="text-[11.5px] font-bold tracking-[0.06em] text-[#97613F]">
                {m.when}
              </p>
              <p className="mt-1.5 text-[13.5px] sm:text-[15px] text-[#1F1E1B] leading-[1.8]" style={MINCHO}>
                {m.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-[1.3rem] bg-[#1E2A38] text-[#F3F0EA] px-6 sm:px-8 py-6">
          <p className="text-[15px] sm:text-[16px] font-bold leading-[1.7]" style={MINCHO}>
            心当たりが、ひとつでもありましたか。
          </p>
          <p className="mt-2.5 text-[14px] text-[#C6CAD0] leading-[1.95]">
            どれも、放っておいて直るものではありません。でも、
            <span className="hr-mark-dark">才能や生まれつきの話でもありません</span>。
            多くの場合、努力不足ではなく<span className="text-[#F3F0EA] font-semibold">順番</span>の問題です。
            時間のかかるものを後回しにするだけで、同じ努力が間に合わなくなります。
            髪・眉・服のサイズ感・表情・写真の撮られ方。変えられる要素を、変えられる順番で。
          </p>
          <Link
            href="/#plan"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F3F0EA] hover:bg-white text-[#1E2A38] text-[14.5px] font-bold px-6 py-2.5 transition-colors"
          >
            30秒で、自分に必要な改善プランを見る <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
