import type { Metadata } from "next";
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "私たちの思想 —「気にするな」で、終わらせたくない。",
  description:
    "「気にするな」で終わらせたくない。男性のウェルネスを、まっとうな場所に。当事者としての起点、医療・サロン・日々の習慣のどれもが大事だという信念、そして女性のウェルネスが広がる今、男性のウェルネスも前に進めたいという願い。共感してくれる仲間を募っています。",
  alternates: { canonical: `${site.url}/manifesto` },
  openGraph: {
    type: "article",
    url: `${site.url}/manifesto`,
    title: "私たちの思想 —「気にするな」で、終わらせたくない。",
    description:
      "男性のウェルネスを、まっとうな場所に。当事者としての起点、医療・サロン・習慣のどれもが大事だという信念、男性のウェルネスを前に進めたいという願い。仲間を募っています。",
  },
};

const PILLARS = [
  {
    n: "01",
    h: "はじまりは、当事者だった。",
    body: [
      "髪のこと、肌のこと、汗やにおいのこと、鏡に映る自分のこと——。誰にも言えないまま、一人で抱えてきた時間があります。相談すれば「気にしすぎ」と流され、調べれば売り込みばかり。本当の味方は、どこにもいませんでした。",
      "His Recoveries は、その「味方がいなかった」経験を起点に生まれました。だから、煽らない。断定しない。まず、あなたの側に立ちます。",
    ],
  },
  {
    n: "02",
    h: "医療も、サロンも、毎日の習慣も。",
    body: [
      "コンプレックスに、たった一つの正解はありません。医療の力が要ることもあれば、プロの手で整えることもある。そして、その変化を続けるのは、結局のところ日々の生活習慣です。",
      "どれか一つを売る立場に立つと、他のものが見えなくなる。だから私たちは、モノや施術を売らない中立の立場から、医療・サロン・習慣のすべてを一人ひとりに合わせて束ねます。あなたにとっての最適だけを、一緒に探すために。",
    ],
  },
  {
    n: "03",
    h: "女性のウェルネスが広がる、今。",
    body: [
      "この10年で、女性のウェルネスは大きく前に進みました。心と体を整えることは、特別なことではなくなりつつあります。",
      "けれど男性は、まだ「気にするな」「男らしくあれ」の言葉の中に置き去りにされがちです。私たちは、男性のウェルネスも同じように、当たり前で、まっとうで、誇っていいものにしたい。恥ずかしいことでも、弱さでもなく、自分を大切にする一つの形として。",
    ],
  },
];

export default function ManifestoPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-8">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">私たちの思想</span>
        </nav>

        <header className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">
              Manifesto
            </span>
          </div>
          <h1 className="text-[2.1rem] sm:text-[3rem] leading-[1.28]" style={HEAD}>
            「気にするな」で、<br />
            <span className="text-[#3d5638]">終わらせたくない。</span>
          </h1>
          <p className="mt-6 text-[1.2rem] sm:text-[1.5rem] leading-[1.6] text-[#1f2a1d]" style={HEAD}>
            男性のウェルネスを、まっとうな場所に。
          </p>
          <p className="mt-5 text-[15px] sm:text-[16px] text-[#4b5b47] leading-[2] max-w-[38rem]">
            His Recoveries は、サービスであると同時に、一つの考え方です。
            なぜこれをやるのか。何を信じているのか。ここに書いておきます。
          </p>
        </header>

        {/* pillars */}
        <div className="space-y-12">
          {PILLARS.map((p) => (
            <section key={p.n} className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 p-7 sm:p-10 shadow-sm">
              <div className="font-mono text-[12px] tracking-[0.2em] text-[#85AB8B] mb-3">{p.n}</div>
              <h2 className="text-[1.4rem] sm:text-[1.75rem] leading-[1.4] mb-5" style={HEAD}>{p.h}</h2>
              <div className="space-y-4">
                {p.body.map((t, i) => (
                  <p key={i} className="text-[14.5px] text-[#3a423a] leading-[2.05]">{t}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* pull quote */}
        <div className="my-16 text-center">
          <p className="text-[1.3rem] sm:text-[1.7rem] leading-[1.7] text-[#1f2a1d]" style={HEAD}>
            誰にも言えなかった悩みを、<br className="hidden sm:block" />
            「<span className="text-[#3d5638]">変われるもの</span>」に。
          </p>
        </div>

        {/* 仲間を募る */}
        <section className="rounded-[1.8rem] bg-[#16241a] text-[#EDF1E8] p-8 sm:p-12 overflow-hidden relative">
          <div aria-hidden className="absolute -top-16 -right-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#85AB8B] mb-4">Join us</div>
            <h2 className="text-[1.5rem] sm:text-[2rem] leading-[1.4] text-[#EDF1E8] mb-5" style={HEAD}>
              一緒に、盛り上げてくれる<br />
              <span className="text-[#85AB8B]">仲間を募っています。</span>
            </h2>
            <p className="text-[14px] text-[#C9D2C4] leading-[2] max-w-[34rem] mb-8">
              この考えに、少しでもうなずいてくれたなら。立場はいろいろでいい。
              変わりたい本人として、支える現場のプロとして、あるいは同じ景色を見たい一人として。
            </p>

            <ul className="grid sm:grid-cols-3 gap-4 mb-9">
              {[
                { t: "変わりたい人", d: "まずは、匿名で相談から。あなたのペースで。" },
                { t: "現場のプロ", d: "メイク・スタイリスト・撮影・医療。取材や協業で。" },
                { t: "共感する人", d: "男性のウェルネスを、一緒に当たり前にしたい人。" },
              ].map((x) => (
                <li key={x.t} className="rounded-[1.1rem] bg-white/[0.05] border border-white/10 p-5">
                  <div className="text-[14px] font-bold text-[#EDF1E8] mb-1.5" style={HEAD}>{x.t}</div>
                  <div className="text-[12.5px] text-[#C9D2C4] leading-[1.85]">{x.d}</div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
                匿名で相談する
              </BookingCTA>
              <Link href="/#packages" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-7 py-3.5 transition-colors">
                サービスを見る <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。診断・治療は連携する医療機関が行います。
          特定の医療機関・商品を推奨・斡旋しません（中立）。ご相談・印象診断は匿名のまま。すべて完全守秘義務のもとで運営します。
        </p>
      </div>
    </div>
  );
}
