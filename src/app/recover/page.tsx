import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { clusters, DESIRES, type DesireKey } from "@/lib/clusters";
import { site } from "@/lib/site";

// Recover｜取り戻す — 目的別ランディング。
// 「誰にも言えなかった悩みを、ゼロに戻す」側の入口。
// 記事は desire（自信・選ばれたい・損したくない）で自動仕分け。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 記事は track="recover"（今困っている＝顕在）で絞り、欲求別に並べる。
// 空の欲求は描画時に落ちるので、記事が増えても自動で追随する。
const TRACK_DESIRES: DesireKey[] = ["jishin", "erabaretai", "son", "shinrai", "wakasa", "sonae"];

export const metadata: Metadata = {
  title: "Recover｜取り戻す — 誰にも言えなかった悩みから",
  description:
    "薄毛・肌・清潔感・写真が苦手——誰にも言えなかった悩みを、ゼロに戻す。印象診断で地図を創り、プロ専属チームの体験へ。やる順番を決めて、遠回りを減らします。相談は無料・秘密保持のもとで。目安 ¥150,000〜。",
  alternates: { canonical: `${site.url}/recover` },
  openGraph: {
    type: "website",
    url: `${site.url}/recover`,
    title: "Recover｜取り戻す — 誰にも言えなかった悩みから",
    description: "誰にも言えなかった悩みを、ゼロに戻す。地図を創り、やる順番を決める。",
  },
};

const WORRIES = ["薄毛が気になり始めた", "肌・ニキビ跡", "清潔感がないと言われた", "写真の自分が嫌い", "何から始めればいいか分からない", "ぼったくられたくない"];

const INCLUDES = [
  { t: "印象診断（90分・¥22,000）", d: "外側の現在地を要素に分解し、「なりたい」と「いま」を一枚の地図に。パッケージお申し込みで全額充当。" },
  { t: "第一印象パッケージ（1日完結）", d: "メイク・服・写真のプロ専属チームを貸切。施術だけでなく、自分で再現できるレッスンまで。" },
  { t: "必要に応じて、医療・内側への橋渡し", d: "医療が要る悩みは、中立の立場で情報を整理。紹介料は受け取らず、判断はあなたのペースで。" },
  { t: "記録と、その後の伴走（LINE）", d: "変化はスコアと記録で見える形に。記録はあなたのもの——いつでも見返せ、消せます。" },
];

export default function RecoverPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "Recover｜取り戻す", item: `${site.url}/recover` },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ヒーロー（深緑・ブランド） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[860px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">Recover｜取り戻す</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">RECOVER — 取り戻す</div>
          <h1 className="text-[#EDF1E8] text-[1.9rem] sm:text-[2.7rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            誰にも言えなかった悩みを、<br />
            <span className="text-[#85AB8B]">ゼロに戻す。</span>
          </h1>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[2] max-w-[36rem]">
            相談すれば「気にしすぎ」。調べれば、売り込みばかり。
            ここでは、悩みを笑わず、煽らず、地図にします。
            マイナスをゼロへ。やる順番を決めて、遠回りを減らします。
          </p>
          {/* 悩みチップ */}
          <div className="mt-7 flex flex-wrap gap-2">
            {WORRIES.map((w) => (
              <span key={w} className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12px] text-[#D7DED2]">{w}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 sm:px-8">
        {/* ── 含まれるもの ── */}
        <section className="pt-12 sm:pt-16">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">What&apos;s included — 含まれるもの</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-6" style={{ ...MINCHO, fontWeight: 800 }}>
            地図から体験、記録まで。<span className="text-[#3d5638]">まるごと。</span>
          </h2>
          <div className="space-y-3">
            {INCLUDES.map((x, i) => (
              <div key={x.t} className="flex items-start gap-4 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5">
                <span aria-hidden className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-[#16241A] text-[#EDF1E8] font-mono text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>{x.t}</div>
                  <p className="mt-1 text-[12.5px] text-[#4b5b47] leading-[1.85]">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] text-[#6b7a66] leading-[1.9]">
            <span className="font-semibold text-[#3d5638]">カスタマイズ可。</span>要る・要らないは、地図を見ながら一緒に決めます。全部やる必要はありません。
          </p>
        </section>

        {/* ── 料金 ── */}
        <section className="pt-12 sm:pt-14">
          <div className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[1.5rem] font-bold text-[#16241A]" style={MINCHO}>費用は、¥50,000（30日）。</span>
              <span className="text-[12px] text-[#9aa79a]">・オーダーメイド／専属チーム貸切</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#4b5b47] leading-[1.9]">
              内容・期間・手配する専門家の数で変わります。入口の印象診断（90分・¥22,000／お申し込みで全額充当）で状況を伺い、総額と内訳を着手前に必ず提示します。予算を超えることはありません。施術・商品の実費は別です。
            </p>
            <ul className="mt-4 grid sm:grid-cols-3 gap-2.5">
              {["紹介料を受け取らない", "総額と内訳を、契約の前に", "合意した予算を超えない"].map((p) => (
                <li key={p} className="flex items-center gap-2 rounded-full bg-[#eef3ea] px-3.5 py-2 text-[12px] font-semibold text-[#3d5638]">
                  <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 目的別の読みもの（desire で自動仕分け） ── */}
        <section className="pt-12 sm:pt-16 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Read — 目的別の読みもの</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
            まず、読んで確かめたい人へ。
          </h2>
          <p className="text-[13px] text-[#4b5b47] leading-[1.9] mb-8">
            売り込みなし・出典つき。あなたの目的に近いところから、どうぞ。
          </p>

          <div className="space-y-9">
            {TRACK_DESIRES.map((key) => {
              const d = DESIRES[key];
              const articles = clusters.filter((a) => a.track === "recover" && a.desire === key && a.kind !== "interview").slice(0, 4);
              if (articles.length === 0) return null;
              return (
                <div key={key}>
                  <div className="flex items-start gap-2.5 mb-3.5">
                    <span className="shrink-0 inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-3 py-1 text-[11px] font-bold tracking-[0.06em]">{d.label}</span>
                    <p className="text-[12px] text-[#6b7a66] leading-[1.8] pt-0.5">{d.hook}</p>
                  </div>
                  <ul className="space-y-2">
                    {articles.map((a) => (
                      <li key={a.slug}>
                        <Link href={`/areas/${a.areaId}/${a.slug}`} className="group flex items-center justify-between gap-3 rounded-[1rem] border border-[#1f2a1d]/10 bg-white px-4 py-3.5 hover:border-[#3d5638]/40 transition-colors">
                          <span className="text-[13.5px] font-semibold text-[#1f2a1d] leading-[1.6] group-hover:text-[#3d5638] transition-colors">{a.title}</span>
                          <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Link href="/areas" className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
            記事をすべて見る（Library） <span aria-hidden>→</span>
          </Link>
        </section>

        {/* ── CTA ── */}
        <section className="py-12 sm:py-16">
          <div className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9">
            <h2 className="text-[1.3rem] sm:text-[1.6rem] leading-[1.5] mb-2" style={{ ...MINCHO, fontWeight: 800 }}>
              ゼロに戻す一歩を、<span className="text-[#85AB8B]">今日から。</span>
            </h2>
            <p className="text-[13px] text-[#C9D2C4] leading-[1.95] mb-6">
              日程を選ぶ → 匿名でWeb相談（15分） → 秘密保持契約に同意 → 地図づくりから。無料です。
            </p>
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-8 py-3.5 transition-colors">
              今の悩みを相談してみる <span aria-hidden>→</span>
            </ConsultLink>
          </div>
          <p className="mt-6 text-[11.5px] text-[#6b7a66] leading-[1.9]">
            ※ His Recoveries は医療行為を行いません。医療が必要な場合は、中立の立場で情報を整理し、判断はご本人と医療機関に委ねます。特定の医療機関・商品を推奨・斡旋しません。
          </p>
        </section>
      </div>
    </div>
  );
}
