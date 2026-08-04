import Link from "next/link";

// 「なぜ、変われないのか」と「3つの段階」。
//
// ── なぜトップに置くか ──────────────────────────
// ヒーローの直後に記事一覧が来ると、このサイトは「読む場所」に見える。
// 実際に渡しているのは順番なので、そこを先に説明する面が要る。
//
// 課題提示 → 解決の説明、という順は営業の型そのままだが、
// ここでは煽らない形でやる。不安を置いてから答えを出すのではなく、
// 「情報が足りないわけではない」から入る。
// 読み手を否定せずに始められるのは、原因を本人ではなく構造に置くから。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const REASONS = [
  {
    h: "自分の場合が、書いていない",
    d: "検索して出てくるのは一般論です。年代も、予算も、続けられる時間も違うのに、答えは1つしか載っていない。",
  },
  {
    h: "順番が、どこにも書いていない",
    d: "どれも「やったほうがいい」と書いてあります。全部やろうとして続かず、何も残らない。効く順番は、売っている側からは書きにくい。",
  },
  {
    h: "相談する相手がいない",
    d: "友人にも、恋人にも、職場にも聞けない。だから検索に来る。ところが検索結果は、ほとんどが広告になっています。",
  },
];

const STEPS = [
  {
    n: "01",
    h: "自分の状態を知る",
    d: "5問・30秒。年代、いちばん気になっていること、どうなりたいか、予算、期限。登録は要りません。",
    to: "/check",
    cta: "測る",
  },
  {
    n: "02",
    h: "順番を知る",
    d: "何を何番目にやるかが出ます。今月やること3つと、90日の進め方まで。いまはやらなくていいことも出します。",
    to: "/order",
    cta: "全体の順番を読む",
  },
  {
    n: "03",
    h: "選ぶ",
    d: "各段階で何を選ぶか。費用の目安・1日の手間・確かめるまでの期間・向いている人・まだ早い条件で並べています。おすすめの順ではありません。",
    to: "/choices",
    cta: "選択肢を見る",
  },
];

export default function WhyStuck({ between }: { between?: React.ReactNode }) {
  return (
    <>
      {/* ── 解決の3段階。課題より先に置く ──
          もとは 課題 → 解決 の順だった。営業の型としては正しいが、
          ヒーローで「変わりたい。でも分からない。」と言い当てられた人は、
          そこですでに自分の話だと分かっている。
          そのあと2画面ぶん問題の説明が続くと、答えが画面2.4枚目まで出てこない。
          実測でも、価値（何をしてくれるか）に着くまでに2画面スクロールが要った。
          自己同定はヒーローで済んでいるので、次は答えを出す。 */}
      <section className="mx-auto max-w-[1080px] px-5 pt-10 sm:px-8 sm:pt-[88px] lg:px-12 lg:pt-[120px]">
        <h2 className="text-[21px] leading-[1.55] sm:text-[26px]" style={{ ...MINCHO, fontWeight: 700 }}>
          やることは、3つだけ
        </h2>
        {/* 「売っていないので」と書いていたが、下ろした。
            この先アフィリエイトや送客が始まると、その一文は嘘になる。
            「掲載の順番を報酬で決めない」は、収入が発生したあとも成立し、
            しかも /disclosure で確かめられる。 */}
        <p className="mt-4 max-w-[34em] text-[15.5px] leading-[2.05] text-keshizumi sm:mt-5 sm:text-[16px]">
          知る、順番を決める、選ぶ。どれも無料で、登録は要りません。
          掲載の順番を報酬で決めていないので、
          <span className="font-bold text-sumi">やらなくていいことも書けます。</span>
        </p>

        <ol className="mt-7 flex flex-col gap-px border border-shironezu bg-shironezu sm:mt-10">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-shironeri">
              <div className="grid gap-2.5 px-5 py-5 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-baseline sm:gap-8 sm:px-7 sm:py-7">
                <p className="text-[13px] tabular-nums tracking-[0.14em] text-asagi">{s.n}</p>
                <div>
                  <h3 className="text-[18px] leading-[1.55] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
                    {s.h}
                  </h3>
                  <p className="mt-2 max-w-[34em] text-[14.5px] leading-[1.9] text-keshizumi sm:mt-2.5 sm:leading-[1.95]">
                    {s.d}
                  </p>
                </div>
                <Link
                  href={s.to}
                  className="justify-self-start whitespace-nowrap text-[14px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
                >
                  {s.cta}
                  <span aria-hidden> →</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>

        {/* 順番を渡す以上、その順番の出どころを同じ面に書く。
            別ページに逃がすと、読む人は根拠を見ないまま順番だけ受け取る。 */}
        <p className="mt-5 max-w-[34em] text-[13px] leading-[1.95] text-ainezu sm:mt-6">
          ここで出る順番は、いまある情報で組んだものです。取材が進んで前提が変われば、書き換えます。
          変えたときは、変えた記録も残します。
        </p>
      </section>

      {/* 説明のすぐ後ろに、現物を置く。
          課題を挟むと、説明 → 問題 → 現物 になって間延びする。 */}
      {between}

      {/* ── 課題。あとに置いて、畳む ──
          3つとも読ませる必要はない。見出しだけで「どれか1つは自分だ」と
          分かればよく、詳しい説明は当てはまった人だけが開けばいい。
          畳んでも中身は HTML に残る（details）ので、検索とAI検索からは読める。
          先頭だけ開けてあるのは、閉じた列が3本並ぶと
          何の話が始まるのか分からないため。 */}
      <section className="mt-12 border-y border-shironezu bg-hakuji sm:mt-[88px] lg:mt-[120px]">
        <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-[88px] lg:px-12">
          <h2 className="text-[21px] leading-[1.55] sm:text-[26px]" style={{ ...MINCHO, fontWeight: 700 }}>
            情報は足りている。<br className="sm:hidden" />足りないのは、順番のほう。
          </h2>
          <p className="mt-4 max-w-[34em] text-[15.5px] leading-[2.05] text-keshizumi sm:mt-5 sm:text-[16px]">
            調べれば、やり方は出てきます。それでも動けないのは、意志が弱いからではありません。
            構造の問題です。
          </p>

          <ul className="mt-7 grid gap-px border border-shironezu bg-shironezu sm:mt-10">
            {REASONS.map((r, i) => (
              <li key={r.h} className="bg-hakuji">
                <details className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-baseline gap-3 px-5 py-4 transition-colors hover:bg-shironeri sm:px-6 sm:py-5">
                    <span
                      className="flex-1 text-[16.5px] leading-[1.6]"
                      style={{ ...MINCHO, fontWeight: 700 }}
                    >
                      {r.h}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-[11px] text-asagi transition-transform group-open:rotate-180"
                    >
                      ▼
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-[14.5px] leading-[1.95] text-keshizumi sm:px-6 sm:pb-6">
                    {r.d}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
