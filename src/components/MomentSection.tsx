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
    when: "結婚式が、決まった",
    text: "前撮りの日程が届いた日。はじめて、自分の顔をまじまじと見た。",
  },
  {
    when: "写真を、求められた",
    text: "プロフィールに使える写真が、1枚もなかった。",
  },
  {
    when: "画面に、自分が映った",
    text: "オンライン会議の自分が、思っていたより疲れて見えた。",
  },
  {
    when: "美容室で、聞かれた",
    text: "「どうしますか」に、いつも「短めで」としか答えられない。",
  },
];

export default function MomentSection() {
  return (
    <section id="moment" className="relative z-10 scroll-mt-24 text-[#1f2a1d] hr-readable">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="hr-eyebrow mb-3.5">
          Moment — 来られるきっかけ
        </p>
        <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
          だいたい、こういう日に来られます。
        </h2>

        <ul className="mt-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
          {MOMENTS.map((m) => (
            <li
              key={m.when}
              className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 px-5 py-5"
            >
              <p className="font-mono text-[11px] tracking-[0.1em] text-[#85AB8B]">
                {m.when}
              </p>
              <p className="mt-2 text-[15.5px] text-[#1f2a1d] leading-[1.85]" style={MINCHO}>
                {m.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-[1.3rem] bg-[#16241A] text-[#EDF1E8] px-6 sm:px-8 py-6">
          <p className="text-[15px] sm:text-[16px] font-bold leading-[1.7]" style={MINCHO}>
            心当たりが、ひとつでもありましたか。
          </p>
          <p className="mt-2.5 text-[14px] text-[#C9D2C4] leading-[1.95]">
            どれも、放っておいて直るものではありません。でも、
            <span className="hr-mark-dark">才能や生まれつきの話でもありません</span>。
            髪・眉・服のサイズ感・表情・写真の撮られ方。
            変えられる要素を、変えられる順番で。30日あれば足ります。
          </p>
          <Link
            href="/#plan"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14.5px] font-bold px-6 py-2.5 transition-colors"
          >
            30秒で、自分に必要な改善プランを見る <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
