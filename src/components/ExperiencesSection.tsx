// できること（体験）— はじめかた5ステップの「④体験」の具体。
// ふたつの向き Recover｜取り戻す / Refine｜深める で提示。
// どちらもオーダーメイド（カスタマイズ可）。最低価格を明記。
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Plan = {
  key: string;
  ja: string;
  status: string;
  available: boolean;
  who: string;
  includes: string[];
  custom: string;
  from: string;
  entry: string;
  href: string;
  cta: string;
  line: boolean; // true=LINE相談へ / false=詳細ページへ
};

const PLANS: Plan[] = [
  {
    key: "Recover",
    ja: "取り戻す",
    status: "提供中",
    available: true,
    who: "誰にも言えなかった悩みから。いま動きたい人に。",
    includes: [
      "印象診断で、現在地と地図づくり",
      "メイク・服・写真の第一印象パッケージ（プロ専属チーム）",
      "必要に応じて、医療連携・内側のケア",
    ],
    custom: "要る・要らないは一緒に。あなたの悩みに合わせて、オーダーメイドで組みます。",
    from: "目安 ¥150,000〜",
    entry: "入口は印象診断 ¥22,000（お申し込みで全額充当）",
    href: "/packages/first-impression",
    cta: "詳しく見る",
    line: false,
  },
  {
    key: "Refine",
    ja: "深める",
    status: "一部準備中",
    available: false,
    who: "すでに整っている人が、もう一段。先手を打ちたい人に。",
    includes: [
      "より高度なスタイリング・印象設計",
      "内側のコンディション最適化（血液・準備中）",
      "続けて深める、継続の設計",
    ],
    custom: "目的に合わせて、オーダーメイドで。何から深めるかは、地図を見ながら。",
    from: "目安 ¥150,000〜",
    entry: "まずは無料相談から",
    href: "/apply",
    cta: "無料相談から",
    line: true,
  },
];

export default function ExperiencesSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <span id="packages" aria-hidden className="block h-px scroll-mt-24" />
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-6">
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">できること — Recover / Refine</span>
          </div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            ふたつの、<span className="text-[#3d5638]">始め方。</span>
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            「取り戻す（Recover）」も、「深める（Refine）」も。あなたに合わせて、オーダーメイドで組みます。
            <br className="hidden sm:block" />
            どちらも、悩みを聞く無料相談から始まります。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          {PLANS.map((p) => (
            <div key={p.key} className="flex flex-col rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[1.2rem] font-bold text-[#16241A]" style={MINCHO}>
                  {p.key}<span className="text-[13px] text-[#3d5638] font-semibold ml-1.5">｜{p.ja}</span>
                </span>
                <span className={`ml-auto shrink-0 text-[9.5px] font-bold px-2 py-0.5 rounded-full ${p.available ? "bg-[#16241A] text-[#EDF1E8]" : "bg-[#eef3ea] text-[#3d5638]"}`}>{p.status}</span>
              </div>
              <p className="text-[12.5px] font-semibold text-[#3d5638] leading-[1.7] mb-4">{p.who}</p>

              <div className="text-[10.5px] font-bold tracking-[0.1em] text-[#9aa79a] mb-2">含まれるもの</div>
              <ul className="space-y-1.5 mb-4">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-[12.5px] text-[#3a423a] leading-[1.65]">
                    <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {i}
                  </li>
                ))}
              </ul>
              <p className="text-[11.5px] text-[#6b7a66] leading-[1.7] mb-5">
                <span className="font-semibold text-[#3d5638]">カスタマイズ可。</span>{p.custom}
              </p>

              <div className="mt-auto pt-4 border-t border-[#1f2a1d]/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] text-[#6b7a66]">最低</span>
                  <span className="text-[1.05rem] font-bold text-[#16241A]">{p.from}</span>
                  <span className="text-[10.5px] text-[#9aa79a]">・専属チーム貸切</span>
                </div>
                <p className="text-[11px] text-[#6b7a66] mt-1 leading-[1.6]">{p.entry}</p>
                {p.line ? (
                  <ConsultLink className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
                    {p.cta} <span aria-hidden>→</span>
                  </ConsultLink>
                ) : (
                  <Link href={p.href} className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
                    {p.cta} <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 拡張 */}
        <p className="mt-5 text-[12.5px] text-[#4b5b47] leading-[1.9]">
          この先、<span className="text-[#1f2a1d] font-medium">髪・肌・体・心へと領域を広げていきます</span>（準備中）。ひとつに絞らなくて大丈夫。準備中の領域も、気になることは無料相談で受け付けます。
        </p>
      </div>
    </section>
  );
}
