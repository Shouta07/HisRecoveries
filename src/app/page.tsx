import Link from "next/link";
import Image from "next/image";
import GlassNav from "@/components/GlassNav";
import GoalPlanner from "@/components/GoalPlanner";
import DesireBrowser from "@/components/DesireBrowser";
import StageBrowser from "@/components/StageBrowser";
import { complexes } from "@/lib/complexes";
import { clusters, clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";
import { fieldVoices } from "@/lib/fieldVoices";
import { experts } from "@/lib/trust";
import { PLAN } from "@/lib/pricing";

// ══════════════════════════════════════════════════════════════
// ホーム = メディアの顔。
//
// 以前ここは営業面（価格・境界線・決済）だった。メディア化にあたって、
// 売る面は /plan（個人）と /business（法人）に移し、ホームは
// 「読む場所」であることと「なぜ中立でいられるか」の証明に使う。
//
// 理由：
//  ・検索から来る人はほぼ記事に着地する。ホームは営業しても読まれない
//  ・個人向けのキャパは土日・1人で月4〜8人。営業面を張る対象が少なすぎる
//  ・キャッシュは法人で生む。個人向けは事例（一次情報）の供給源として置く
//
// このページで一度も言わないこと：モテる／イケメン／別人／女性ウケ。
// ══════════════════════════════════════════════════════════════

const HERO_HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', serif",
  fontWeight: 800,
  letterSpacing: "0.015em",
  fontFeatureSettings: '"palt" 1',
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
};

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 領域の並び順（記事数の多い順ではなく、読者の入りやすい順）
const AREA_ORDER = ["impression", "hair", "skin", "face", "body-hair", "mind"] as const;

export default function HomePage() {
  const articleCount = clusters.length + complexes.length;
  const interviewCount = clusters.filter((c) => c.kind === "interview").length;

  const areas = AREA_ORDER.map((id) => {
    const c = complexes.find((x) => x.id === id)!;
    return { ...c, count: clustersByArea(id).length + 1 };
  });

  // 「はじめの1本」— 各領域の入口記事。読む場所を迷わせない。
  const starters = areas.slice(0, 3).map((a) => {
    const first = clustersByArea(a.id)[0];
    return first ? { area: a, article: first } : null;
  });

  return (
    <div className="relative font-sans bg-[#f4f6f2]">
      <GlassNav />

      {/* ══════ ヒーロー — 何のメディアか、を1画面で ══════ */}
      <section className="relative z-10 w-full overflow-hidden bg-[#16241A]">
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 95% 72% at 50% 24%, #24382b 0%, #16241A 56%, #0f1a12 100%)" }}
        />
        <div className="relative z-10 max-w-[1000px] mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-14 sm:pb-20">
          <p className="hr-eyebrow hr-eyebrow-on-dark mb-5">
            Media — 男性のリカバリーメディア
          </p>

          <h1
            className="text-[#EDF1E8] text-[2rem] sm:text-[3.1rem] leading-[1.32] max-w-[22em]"
            style={HERO_HEAD}
          >
            <span className="inline-block">男性が立ち止まったとき、</span>
            <br />
            <span className="inline-block text-[#9ec4a3]">最初に読む場所</span>
            <span className="inline-block">をつくる。</span>
          </h1>

          <p className="mt-7 text-[#D7DED2] text-[15px] sm:text-[16px] leading-[2.05] max-w-[36rem]">
            髪・肌・清潔感・老け見え・習慣。男性の見た目の悩みは、
            どこで調べても<span className="text-[#EDF1E8] font-semibold">売っている人が書いています</span>。
            だから「やったほうがいい」しか出てこない。
            ここでは、<span className="hr-mark-dark">やらなくていいことも書きます</span>。
          </p>

          {/* 実数だけを出す。盛らない。 */}
          <dl className="hr-facts mt-9 w-full max-w-[620px] text-left">
            {[
              { k: "記事", v: `${articleCount}`, sub: "本" },
              { k: "取材", v: `${interviewCount}`, sub: "本" },
              { k: "紹介料", v: "0", sub: "円" },
              { k: "更新", v: CLUSTER_UPDATED.slice(5).replace("-", "/"), sub: "" },
            ].map((f) => (
              <div key={f.k}>
                <dt className="text-[10.5px] tracking-[0.14em] uppercase text-[#9FB0A0]">{f.k}</dt>
                <dd className="hr-figure mt-1.5 text-[18px] sm:text-[20px] font-bold text-[#E0B75F]">
                  {f.v}
                  {f.sub && <span className="ml-0.5 text-[11px] font-normal text-[#C9D2C4]">{f.sub}</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/areas"
              className="inline-flex items-center gap-2 rounded-full bg-[#E0B75F] hover:bg-[#EBC97E] text-[#16241A] text-[15px] font-bold px-7 py-3.5 transition-colors"
            >
              記事を読む <span aria-hidden>→</span>
            </Link>
            <a
              href="#plan"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-[15px] font-semibold px-6 py-3.5 transition-colors"
            >
              30秒で、自分の順番を見る
            </a>
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden bg-[#f4f6f2]">
        {/* ══════ なぜ中立でいられるか ══════
            メディアの信頼は書き手の腕ではなく、書き手の利害で決まる。
            これはサービスページではなくメディアの顔に置くべき主張。 */}
        <section className="hr-readable">
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <p className="hr-eyebrow mb-3.5">Why neutral — なぜ「やらなくていい」と書けるのか</p>
            <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
              紹介料を、受け取っていないからです。
            </h2>
            <p className="mt-4 text-[15px] text-[#4b5b47] leading-[2] max-w-[36rem]">
              クリニックもサロンもジムも、顧客が「やらない」と売上が減ります。
              だから構造的に「やらなくていい」と言えない。メディアも同じで、
              広告とアフィリエイトで成り立っていれば、送客できない記事は書けません。
            </p>

            <div className="mt-8 rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 overflow-hidden">
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1f2a1d]/10">
                <div className="px-6 sm:px-7 py-6">
                  <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#9aa79a] mb-3">
                    受け取らないもの
                  </p>
                  <ul className="space-y-2 text-[14px] text-[#5c6b58] leading-[1.85]">
                    <li>— 医療機関・サロンからの紹介料</li>
                    <li>— 記事広告・タイアップ</li>
                    <li>— アフィリエイト報酬</li>
                    <li>— 掲載料（専門家の掲載は無料）</li>
                  </ul>
                </div>
                <div className="px-6 sm:px-7 py-6 bg-[#f6f8f4] border-l-0 sm:border-l-2 border-t-2 sm:border-t-0 border-[#B98A3C]">
                  <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-3">
                    収益はここだけ
                  </p>
                  <ul className="space-y-2 text-[14px] text-[#5c6b58] leading-[1.85]">
                    <li>
                      ・<Link href="/plan" className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4">個人向けプラン</Link>
                      （{PLAN.days}日・個別見積）
                    </li>
                    <li>
                      ・<Link href="/business" className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4">法人向け研修</Link>
                      （個別見積）
                    </li>
                  </ul>
                  <p className="mt-4 pt-3 border-t border-[#1f2a1d]/10 text-[13px] text-[#6b7a66] leading-[1.85]">
                    読者から離れた場所にお金の出どころを置かない。
                    だから記事で「それは要りません」と書けます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ ライフステージから探す ══════
            領域（髪・肌）や目的より、年代のほうが「自分はどれか」を迷わない。
            だから3つの入口のうち、これを先頭に置く。 */}
        <section className="hr-readable">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-8 pb-14 sm:pb-20">
            <StageBrowser />
          </div>
        </section>

        {/* ══════ 目的から探す ══════ */}
        <section className="hr-readable">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-8 pb-4">
            <DesireBrowser />
          </div>
        </section>

        {/* ══════ 領域から探す ══════ */}
        <section className="hr-readable">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <p className="hr-eyebrow mb-3.5">Areas — 悩みから探す</p>
            <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
              6つの領域。
            </h2>
            <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
              どれも「なぜ起きるのか」から書いています。原因が分かると、
              やらなくていいことも分かります。
            </p>

            <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {areas.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/areas/${a.id}`}
                    className="group flex h-full flex-col rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 hover:border-[#3d5638]/40 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-24px_rgba(20,32,26,0.5)] transition-all px-5 py-5"
                    style={{ borderLeftColor: a.accent, borderLeftWidth: 3 }}
                  >
                    <p
                      className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors"
                      style={MINCHO}
                    >
                      {a.ja}
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-[#6b7a66] leading-[1.8] flex-1">
                      {a.worry}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-[#B98A3C] tracking-[0.06em]">
                      {a.count} 本
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            {/* はじめの1本 */}
            <div className="mt-8 rounded-[1.2rem] bg-[#eef3ea] px-6 py-6">
              <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-3">
                どこから読めばいいか分からないとき
              </p>
              <ul className="grid sm:grid-cols-3 gap-3">
                {starters.filter(Boolean).map((s) => (
                  <li key={s!.article.slug}>
                    <Link
                      href={`/areas/${s!.area.id}/${s!.article.slug}`}
                      className="group block rounded-[0.9rem] bg-white border border-[#1f2a1d]/10 px-4 py-4 hover:border-[#3d5638]/40 transition-colors h-full"
                    >
                      <p className="font-mono text-[10.5px] tracking-[0.1em] text-[#85AB8B]">
                        {s!.area.ja}
                      </p>
                      <p className="mt-1.5 text-[13.5px] font-bold text-[#1f2a1d] leading-[1.6] group-hover:text-[#3d5638] transition-colors">
                        {s!.article.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════ 一次情報 — 0件でも正直に置く ══════
            埋める圧力を構造として残すため、空でもセクションごと消さない。 */}
        <section className="hr-readable">
          <div className="max-w-[880px] mx-auto px-5 sm:px-8 pb-14 sm:pb-20">
            <p className="hr-eyebrow mb-3.5">First-hand — 一次情報</p>
            <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
              自分たちで、取りに行った話。
            </h2>
            <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[36rem]">
              調べれば分かることは、これから AI が全部答えます。
              残るのは<span className="hr-mark">現場に会いに行かないと出てこない話</span>だけです。
              取材、実際にかかった費用、うまくいかなかったこと。ここに積んでいきます。
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              {[
                { t: "専門家への取材", n: interviewCount, note: "必ず「勧めないこと」を聞きます" },
                { t: "現場の声の紹介", n: fieldVoices.length, note: "公開記事を出典つきで紹介します" },
                { t: "掲載中の専門家", n: experts.length, note: "掲載料も紹介料も取りません" },
              ].map((x) => (
                <div key={x.t} className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-5 py-5">
                  <p className="text-[13.5px] font-bold text-[#1f2a1d]">{x.t}</p>
                  <p className="hr-figure mt-2 text-[1.9rem] font-bold text-[#B98A3C]">
                    {x.n}
                    <span className="ml-1 text-[13px] font-normal text-[#6b7a66]">
                      {x.t === "掲載中の専門家" ? "人" : "本"}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-[#6b7a66] leading-[1.8]">{x.note}</p>
                </div>
              ))}
            </div>

            {interviewCount === 0 && (
              <p className="mt-5 rounded-[1.1rem] border border-dashed border-[#1f2a1d]/20 bg-white/60 px-6 py-5 text-[14px] text-[#5c6b58] leading-[1.95]">
                <span className="font-bold text-[#1f2a1d]">まだ 0 本です。</span>
                いま公開している記事は、公開情報を出典つきで整理したものです。
                取材はこれから始めます。数が増えていない間は、この数字がそのまま出ます。
              </p>
            )}

            <p className="mt-5 text-[13.5px]">
              <Link
                href="/partner"
                className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
              >
                取材・掲載について（現場のプロの方へ）
              </Link>
            </p>
          </div>
        </section>

        {/* ══════ 無料ツール — メディアの提供物としてのロードマップ ══════ */}
        <GoalPlanner />

        {/* ══════ サービス — 個人と法人。ここは控えめに2枚だけ ══════ */}
        <section className="hr-readable">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
            <p className="hr-eyebrow mb-3.5">Services — 読むだけでは足りないとき</p>
            <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
              実際に整えるところまで、やります。
            </h2>
            <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95] max-w-[34rem]">
              記事は無料で全部公開しています。それだけで進む方もいます。
              一人だと止まる、時間がない、という場合だけ、こちらへ。
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Link
                href="/plan"
                className="group flex flex-col rounded-[1.4rem] bg-[#16241A] text-[#EDF1E8] px-6 sm:px-7 py-7 hover:bg-[#1c2e21] transition-colors"
              >
                <p className="hr-eyebrow hr-eyebrow-on-dark mb-3">個人の方へ</p>
                <p className="text-[1.15rem] font-bold leading-[1.55]" style={MINCHO}>
                  第一印象改善プラン
                </p>
                <p className="mt-2.5 text-[13.5px] text-[#C9D2C4] leading-[1.9] flex-1">
                  眉・メイク・服選び・髪型の提案・撮影を1日で。手順の動画とサイズ表を
                  持ち帰っていただきます。東京都内・土日のみ。
                </p>
                <p className="mt-4 pt-4 border-t border-white/15 text-[13.5px] text-[#C9D2C4]">
                  {PLAN.days}日 ／ {PLAN.where}・{PLAN.when}
                  <span className="ml-2 text-[12.5px] text-[#9FB0A0]">費用は個別見積</span>
                </p>
                <p className="mt-3 text-[13.5px] font-semibold text-[#E0B75F]">
                  何をするのかを見る <span aria-hidden>→</span>
                </p>
              </Link>

              <Link
                href="/business"
                className="group flex flex-col rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 hover:border-[#B98A3C] px-6 sm:px-7 py-7 transition-colors"
              >
                <p className="hr-eyebrow mb-3">法人・団体の方へ</p>
                <p className="text-[1.15rem] font-bold leading-[1.55] text-[#1f2a1d]" style={MINCHO}>
                  第一印象研修
                </p>
                <p className="mt-2.5 text-[13.5px] text-[#5c6b58] leading-[1.9] flex-1">
                  新卒研修・営業職研修・管理職研修・会員向け講座。座学で終わらせず、
                  その場で整えて、一人ずつに印象カルテを渡します。
                </p>
                <p className="mt-4 pt-4 border-t border-[#1f2a1d]/10 text-[14px] text-[#1f2a1d] font-semibold">
                  個別見積
                  <span className="ml-2 text-[12.5px] font-normal text-[#6b7a66]">
                    人数・時間・場所で変わります
                  </span>
                </p>
                <p className="mt-3 text-[13.5px] font-semibold text-[#7E5B29]">
                  ご案内を見る <span aria-hidden>→</span>
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════ Footer ══════ */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10 bg-[#eef1ea]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
              <div className="col-span-2 sm:col-span-2">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">悩みから探す</div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[14.5px] text-[#4b5b47]">
                  {[
                    ["impression", "清潔感・第一印象"],
                    ["hair", "薄毛・髪"],
                    ["skin", "肌・ニキビ"],
                    ["face", "老け見え・疲れ顔"],
                    ["body-hair", "ヒゲ・体毛"],
                    ["mind", "睡眠・気分・習慣"],
                  ].map(([id, label]) => (
                    <li key={id}>
                      <Link href={`/areas/${id}`} className="hover:text-[#1f2a1d] transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">サービス</div>
                <ul className="space-y-2 text-[14.5px] text-[#4b5b47]">
                  <li><Link href="/plan" className="hover:text-[#1f2a1d] transition-colors">個人向けプラン（30日）</Link></li>
                  <li><Link href="/business" className="hover:text-[#1f2a1d] transition-colors">法人向け研修</Link></li>
                  <li><a href="#plan" className="hover:text-[#1f2a1d] transition-colors">無料のロードマップ</a></li>
                  <li><Link href="/reserve" className="hover:text-[#1f2a1d] transition-colors">無料で相談する</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">His Recoveries</div>
                <ul className="space-y-2 text-[14.5px] text-[#4b5b47]">
                  <li><Link href="/areas" className="hover:text-[#1f2a1d] transition-colors">記事をすべて見る</Link></li>
                  <li><Link href="/producer" className="hover:text-[#1f2a1d] transition-colors">担当者について</Link></li>
                  <li><Link href="/why" className="hover:text-[#1f2a1d] transition-colors">なぜ、やるのか</Link></li>
                  <li><Link href="/partner" className="hover:text-[#1f2a1d] transition-colors">取材・掲載について</Link></li>
                  <li><Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#1f2a1d]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link href="/" className="logo-type text-xl font-semibold tracking-tight text-[#1f2a1d]">His Recoveries</Link>
              <span className="text-[13.5px] text-[#6b7a66]">© 2026 His Recoveries — 何度でも、戻れる。</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
