// ③ 悩みカード — 「入口の分散」。診断を使わない人向けの直接ブラウズ動線。
// NEWTの「人気のエリア」カードに相当。悩み＝HRにとってのエリア。
// 各カードは該当領域ページ /areas/[id] へ落とす（既存の記事資産を活かす）。
import Link from "next/link";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

type Card = { id: string; label: string; sub: string; icon: React.ReactNode };

const CARDS: Card[] = [
  {
    id: "impression",
    label: "清潔感・第一印象",
    sub: "髪・眉・肌・服。要素に分ければ、整えられる。",
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  },
  {
    id: "hair",
    label: "薄毛・髪",
    sub: "多くはAGA。早く知るほど、選べる幅が広がる。",
    icon: <><path d="M5 13a7 7 0 0 1 14 0" /><path d="M5 13v5M19 13v5M9 13v6M15 13v6M12 13v7" /></>,
  },
  {
    id: "skin",
    label: "肌・ニキビ",
    sub: "炎症・乾燥・摩擦。跡は分けて考える。",
    icon: <><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="13" r="1" /><circle cx="11" cy="15" r="1" /></>,
  },
  {
    id: "face",
    label: "老け見え・疲れ顔",
    sub: "睡眠・むくみ・表情から、今日動かせる。",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M8 10h.01M16 10h.01M8.5 15.5c1-1 5-1 7 0" /></>,
  },
  {
    id: "body-hair",
    label: "ヒゲ・体毛",
    sub: "整える・減らす・そのまま。目的から選ぶ。",
    icon: <><path d="M4 6h16M6 6c0 5 2 9 6 12M18 6c0 5-2 9-6 12" /></>,
  },
  {
    id: "mind",
    label: "睡眠・気分・習慣",
    sub: "内側が整うと、印象も自信も変わる。",
    icon: <><path d="M20 13a8 8 0 1 1-8.7-8 6 6 0 0 0 8.7 8z" /></>,
  },
];

export default function WorryCards() {
  return (
    <section id="worries" className="relative z-10 scroll-mt-24 text-[#1f2a1d] bg-[#f4f6f2]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="max-w-2xl mb-7">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Browse — 悩みから探す</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.35] font-[800]" style={HEAD}>
            気になる悩みから、<span className="text-[#3d5638]">読む。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.9]">
            売り込みなし・出典つきの中立記事。まず知りたいだけでも、どうぞ。
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {CARDS.map((c) => (
            <Link
              key={c.id}
              href={`/areas/${c.id}`}
              className="group flex flex-col rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 hover:border-[#3d5638]/40 p-5 sm:p-6 transition-colors"
            >
              <span aria-hidden className="grid place-items-center w-11 h-11 rounded-full bg-[#eef3ea] mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] sm:text-[15.5px] font-bold text-[#1f2a1d] group-hover:text-[#3d5638] leading-[1.4] transition-colors" style={HEAD}>{c.label}</span>
                <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
              <p className="mt-1.5 text-[11.5px] sm:text-[12.5px] text-[#6b7a66] leading-[1.7]">{c.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
