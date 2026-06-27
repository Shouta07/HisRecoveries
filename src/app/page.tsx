import Link from "next/link";
import { getAllRecoveries } from "@/lib/recoveries";
import { complexes, complexByTerritory } from "@/lib/complexes";
import { PhoneMock, ClinicScene } from "@/components/ServiceMock";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import ScrollProgress from "@/components/ScrollProgress";

const ACCENT = "#0F766E"; // calm, trustworthy teal
const ACCENT_SOFT = "#E6F2F0";

const APPLY = "/check"; // free, low-pressure first step

const STEPS = [
  {
    no: "01",
    title: "原因を特定する",
    body: "推測で進めません。自己観察と、連携する専門家の診断で、「何が・なぜ起きているのか」を言葉にします。ここがずれると、対処もずれます。",
  },
  {
    no: "02",
    title: "選択肢を、中立に並べる",
    body: "効果・期間・費用・リスクを、正直に表にします。「何もしない」を含めて。私たちは特定の商品やクリニックから手数料を受け取らないので、利害なく比べられます。",
  },
  {
    no: "03",
    title: "必要なら、医療と連携する",
    body: "私たち自身は診断も治療もしません。医療が必要な段階なら、その悩みに本当に強い医療機関へおつなぎします（紹介手数料はいただきません）。",
  },
  {
    no: "04",
    title: "専属で、伴走する",
    body: "設計した道筋が生活に根づくまで、専属の担当がオンライン・対面で並走します。迷いや停滞を、その都度いっしょにほどきます。",
  },
  {
    no: "05",
    title: "定着したら、卒業する",
    body: "ずっと抱え込ませません。自分で再現できる状態になったら、そこがゴール。終わりを設計に含めているのが、私たちの考え方です。",
  },
];

const DO = [
  "原因を、仕組みから言語化する",
  "中立に、選択肢を並べる",
  "必要な医療機関へつなぐ",
  "定着まで、専属で伴走する",
  "費用を、最初に明確に伝える",
];

const DONT = [
  "商品や施術を、売りつける",
  "効果を、保証・断定する",
  "紹介手数料を、受け取る",
  "不安を煽って、契約を急がせる",
  "診断・治療を、自分たちで行う",
];

const FAQ = [
  {
    q: "正直、ちょっと怪しくないですか？",
    a: "もっともな疑いです。だから私たちは「やらないこと」を先に公開しています。商品・施術は売りません。効果は保証しません。紹介手数料も受け取りません。収益はプログラムの伴走料のみで、費用は初回相談で明確にお伝えします。",
  },
  {
    q: "結局、何かを売りつけられませんか？",
    a: "売りません。私たちの役割は、原因を特定し、中立に選択肢を並べ、必要なら医療につなぎ、伴走することです。特定の商品やクリニックを勧めて手数料を得る構造を、最初から持っていません。",
  },
  {
    q: "効果は保証されますか？",
    a: "保証はしません。からだのことに「必ず」はないからです。できるのは、原因の解像度を上げ、根拠のある選択肢を示し、続けられるよう伴走することまで。診断・治療の判断は、連携する医師が行います。",
  },
  {
    q: "費用はいくらですか？",
    a: "悩みと内容によって変わるため、初回相談で明確にお伝えします。不透明な追加課金はありません。初回相談は無料・申し込み義務もありません。",
  },
];

export default function HomePage() {
  const voices = getAllRecoveries().slice(0, 3);

  return (
    <div className="bg-white text-zinc-900">
      <ScrollProgress />
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="border-b border-zinc-100 overflow-hidden">
        <div className="mx-auto max-w-[1120px] px-6 sm:px-10 pt-14 sm:pt-20 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-10 items-center">
          <div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-bold"
            style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
          >
            His Recoveries（ヒズ・リカバリーズ）とは
          </span>

          <h1 className="mt-7 text-[2.4rem] sm:text-[3.6rem] lg:text-[4.4rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-zinc-900 max-w-[20ch]">
            男性の悩みを、
            <br className="hidden sm:inline" />
            <span style={{ color: ACCENT }}>原因から</span>整える人。
          </h1>

          <p className="mt-7 text-[1.05rem] sm:text-[1.2rem] leading-[1.9] text-zinc-600 max-w-[40rem]">
            His Recoveries は、薄毛・汗・肌・顔・体毛・自意識といった
            <strong className="font-bold text-zinc-900">男性のコンプレックス</strong>を、
            <strong className="font-bold text-zinc-900">オンラインのシステム</strong>と
            <strong className="font-bold text-zinc-900">オフラインの専属伴走</strong>の両輪で、
            原因から整える少人数の改善プログラムです。
            商品も施術も売りません。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={APPLY}
              className="inline-flex items-center gap-2 rounded-full text-white text-[15px] font-bold px-7 py-4 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: ACCENT }}
            >
              まずは無料で相談する
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#approach"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 text-zinc-800 text-[15px] font-bold px-7 py-4 hover:border-zinc-900 transition-colors"
            >
              改善の進め方を見る
              <span aria-hidden>↓</span>
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-zinc-500">
            {["中立 — 紹介手数料ゼロ", "医療機関と連携", "初回相談は無料・義務なし"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CheckIcon />
                {t}
              </li>
            ))}
          </ul>
          </div>

          {/* Service mock — online system */}
          <div className="justify-self-center lg:justify-self-end soft-float">
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* ───────────────────────── What His Recoveries is ───────────────────────── */}
      <section className="bg-[#F7F8F7] border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-20">
          <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-zinc-400 uppercase mb-5">
            About His Recoveries
          </p>
          <p className="text-[1.3rem] sm:text-[1.7rem] font-bold leading-[1.6] text-zinc-900 max-w-[34ch]">
            「調べても変わらなかった」を、
            <span style={{ color: ACCENT }}>いっしょに前へ。</span>
          </p>
          <p className="mt-6 text-[15px] text-zinc-600 leading-[2] max-w-[40rem]">
            原因はもう、検索すれば出てくる時代です。それでも変わらないのは、
            自分の状態に合わせて選び、続けられるよう伴走する人がいないから。
            His Recoveries は、その間を一緒に渡るためにあります。
            派手な宣伝も、もったいぶりもありません。やることを、正直に書きます。
          </p>

          {/* 3 quick facts: what it is / isn't / for whom */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                t: "これは何か",
                d: "原因の特定から定着までを伴走する、男性のコンプレックス改善プログラム。",
              },
              {
                t: "これは何でないか",
                d: "商品や施術を売る場所ではありません。診断・治療も行いません（医療は連携先が担当）。",
              },
              {
                t: "誰のためか",
                d: "ひとりで調べ続けて、それでも前に進めずにいる男性のために。",
              },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl bg-white border border-zinc-100 p-6">
                <p className="text-[14px] font-bold" style={{ color: ACCENT }}>
                  {f.t}
                </p>
                <p className="mt-2.5 text-[13.5px] text-zinc-600 leading-[1.9]">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Stats band (animated) ───────────────────────── */}
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-14 sm:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {[
              { v: <CountUp to={6} suffix=" 領域" />, label: "向き合う悩み" },
              { v: <CountUp to={0} prefix="¥" />, label: "紹介手数料（中立）" },
              { v: <CountUp to={5} suffix=" STEP" />, label: "改善の進め方" },
              { v: <span>1:1</span>, label: "専属で伴走" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-[2.4rem] sm:text-[3rem] font-extrabold leading-none tracking-[-0.02em]"
                  style={{ color: ACCENT }}
                >
                  {s.v}
                </div>
                <div className="mt-3 text-[12.5px] font-medium text-zinc-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Solution: system × offline ───────────────────────── */}
      <Reveal>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="max-w-[40rem]">
            <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Our solution
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
              システム × オフラインで、
              <br className="hidden sm:inline" />
              解決する。
            </h2>
            <p className="mt-4 text-[15px] text-zinc-600 leading-[1.95]">
              アプリやセルフ診断だけでは、人は変わりきれません。
              かといって、対面の伴走だけでは続きません。
              His Recoveries は、
              <strong className="font-bold text-zinc-900">オンラインのシステム</strong>と
              <strong className="font-bold text-zinc-900">オフラインの専属伴走</strong>を
              ひとつにして、悩みを解決まで運びます。
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* System (online) */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-7 sm:p-9">
              {/* mini system mock */}
              <div className="mb-9 rounded-2xl bg-[#F7F8F7] border border-zinc-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-zinc-400">いまの状態</span>
                  <span className="text-[11px] font-bold" style={{ color: ACCENT }}>改善中</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "62%", backgroundColor: ACCENT }} />
                </div>
                <div className="mt-4 flex items-end gap-1.5 h-12">
                  {[35, 42, 38, 50, 55, 60, 72].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[3px]"
                      style={{ height: `${h}%`, backgroundColor: i >= 5 ? ACCENT : "#CBD5D2" }}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-1.5">
                  <span
                    className="rounded-2xl rounded-tl-sm px-3 py-1.5 text-[10.5px]"
                    style={{ backgroundColor: ACCENT_SOFT, color: "#134E48" }}
                  >
                    今週の調子はどうですか？
                  </span>
                </div>
              </div>
              <span
                className="inline-flex w-fit rounded-full px-3 py-1 text-[11.5px] font-bold mb-5"
                style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
              >
                Online — システム
              </span>
              <h3 className="text-[1.35rem] font-extrabold text-zinc-900">
                状態を、可視化する。
              </h3>
              <p className="mt-3 text-[14px] text-zinc-600 leading-[1.95]">
                セルフ診断で現在地を把握し、記録で変化を追う。専属担当とのやり取りも、ひとつの画面に。いつでも、どこからでも。
              </p>
              <ul className="mt-6 space-y-2.5">
                {["セルフ診断・原因の見立て", "変化の記録とふりかえり", "担当へのチャット相談"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-zinc-700 leading-[1.7]">
                    <CheckIcon />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Offline (human) */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-7 sm:p-9">
              <ClinicScene className="mb-9" />
              <span
                className="inline-flex w-fit rounded-full px-3 py-1 text-[11.5px] font-bold mb-5"
                style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
              >
                Offline — 専属伴走
              </span>
              <h3 className="text-[1.35rem] font-extrabold text-zinc-900">
                人が、最後まで伴走する。
              </h3>
              <p className="mt-3 text-[14px] text-zinc-600 leading-[1.95]">
                原因の診断、改善設計、医療連携、そして定着まで。専属の担当と専門家が、対面でもオンラインでも、あなたに並走します。
              </p>
              <ul className="mt-6 space-y-2.5">
                {["専属担当による改善設計", "専門医療機関との連携", "定着までの継続フォロー"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-zinc-700 leading-[1.7]">
                    <CheckIcon />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] text-zinc-500">
            システムが「続ける力」を、人が「変える力」を担います。
          </p>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Approach (how) ───────────────────────── */}
      <Reveal>
      <section id="approach" className="scroll-mt-20 border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="max-w-[40rem]">
            <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
              どうやって、改善するのか。
            </h2>
            <p className="mt-4 text-[15px] text-zinc-600 leading-[1.95]">
              5 つのステップで進めます。どれも、隠さず・順番どおりに。
            </p>
          </div>

          <ol className="mt-12 space-y-4">
            {STEPS.map((s) => (
              <li
                key={s.no}
                className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-7 rounded-2xl border border-zinc-100 bg-white p-6 sm:p-7 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
              >
                <span
                  className="shrink-0 grid place-items-center w-12 h-12 rounded-full text-[16px] font-extrabold tabular-nums"
                  style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
                >
                  {s.no}
                </span>
                <div>
                  <h3 className="text-[1.2rem] font-bold text-zinc-900">{s.title}</h3>
                  <p className="mt-2 text-[14px] text-zinc-600 leading-[1.95]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Do / Don't (honesty) ───────────────────────── */}
      <Reveal>
      <section className="bg-[#F7F8F7] border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
            やること、やらないこと。
          </h2>
          <p className="mt-4 text-[15px] text-zinc-600 leading-[1.95] max-w-[36rem]">
            胡散臭さは、曖昧さから生まれます。だから、先に線を引いておきます。
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-white border border-zinc-100 p-7 sm:p-8">
              <p className="text-[13px] font-bold mb-5" style={{ color: ACCENT }}>
                やること
              </p>
              <ul className="space-y-3.5">
                {DO.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-[14.5px] text-zinc-800 leading-[1.7]">
                    <CheckIcon />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-zinc-100 p-7 sm:p-8">
              <p className="text-[13px] font-bold text-zinc-400 mb-5">やらないこと</p>
              <ul className="space-y-3.5">
                {DONT.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-[14.5px] text-zinc-500 leading-[1.7]">
                    <CrossIcon />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Complexes ───────────────────────── */}
      <Reveal>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="max-w-[40rem]">
            <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              What we work on
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
              向き合う、6 つの悩み。
            </h2>
            <p className="mt-4 text-[15px] text-zinc-600 leading-[1.95]">
              それぞれ「なぜ起きるのか」を、原因から読めるようにしています。
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complexes.map((c) => (
              <Link
                key={c.id}
                href={`/territories/${c.territory}`}
                className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <span
                  aria-hidden
                  className="block w-9 h-1 rounded-full mb-5"
                  style={{ backgroundColor: c.accent }}
                />
                <h3 className="text-[1.3rem] font-extrabold text-zinc-900">{c.ja}</h3>
                <p className="mt-2 text-[13px] text-zinc-500 leading-[1.9] flex-1">
                  {c.mechanism}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold group-hover:gap-2.5 transition-all"
                  style={{ color: c.accent }}
                >
                  なぜ起きる？を読む <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Cost & transparency ───────────────────────── */}
      <Reveal>
      <section className="bg-[#F7F8F7] border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
            費用と、進め方。
          </h2>
          <p className="mt-4 text-[15px] text-zinc-600 leading-[1.95] max-w-[38rem]">
            お金の話を曖昧にしません。安心して相談できるように、先に書いておきます。
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "初回相談は無料", d: "まずは話すだけ。申し込みの義務はありません。" },
              { t: "費用は相談で明示", d: "悩みと内容で変わるため、最初にはっきりお伝えします。" },
              { t: "追加課金なし", d: "あとから不透明な請求が増えることはありません。" },
              { t: "いつでも卒業", d: "定着したら終わり。続けさせる仕組みは作りません。" },
            ].map((row) => (
              <div key={row.t} className="rounded-2xl bg-white border border-zinc-100 p-6">
                <p className="text-[15px] font-bold text-zinc-900">{row.t}</p>
                <p className="mt-2 text-[13px] text-zinc-500 leading-[1.85]">{row.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Voices ───────────────────────── */}
      {voices.length > 0 && (
        <Reveal>
        <section className="border-b border-zinc-100">
          <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
            <div className="max-w-[40rem]">
              <p className="font-mono text-[12px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                Voices
              </p>
              <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
                同じ道を、通った人たち。
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {voices.map((r) => {
                const c = complexByTerritory(r.territory);
                const accent = c?.accent ?? "#71717a";
                const soft = c?.accentSoft ?? "#f4f4f5";
                return (
                  <Link
                    key={r.slug}
                    href={`/recoveries/${r.slug}`}
                    className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-6 hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <span
                      className="inline-flex w-fit rounded-full px-3 py-1 text-[11.5px] font-bold"
                      style={{ backgroundColor: soft, color: accent }}
                    >
                      {c?.ja ?? r.territory}
                      {r.span ? ` · ${r.span}` : ""}
                    </span>
                    <h3 className="mt-4 text-[1.15rem] font-bold leading-[1.55] text-zinc-900 group-hover:text-zinc-600 transition-colors flex-1">
                      {r.title}
                    </h3>
                    {r.asker?.context && (
                      <p className="mt-4 pt-4 border-t border-zinc-100 text-[12.5px] text-zinc-500 leading-[1.8]">
                        {r.asker.ageRange ? `${r.asker.ageRange}・` : ""}
                        {r.asker.context}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        </Reveal>
      )}

      {/* ───────────────────────── FAQ (address skepticism) ───────────────────────── */}
      <Reveal>
      <section className="border-b border-zinc-100">
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-16 sm:py-24">
          <h2 className="text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
            よくある不安に、正直に。
          </h2>

          <dl className="mt-10 space-y-3 max-w-[46rem]">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-zinc-100 bg-white p-6 sm:p-7">
                <dt className="flex gap-3 text-[15.5px] font-bold text-zinc-900 leading-[1.7]">
                  <span
                    className="shrink-0 grid place-items-center w-6 h-6 rounded-full text-[12px] font-bold"
                    style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
                  >
                    Q
                  </span>
                  {item.q}
                </dt>
                <dd className="mt-3 pl-9 text-[14px] text-zinc-600 leading-[2]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      </Reveal>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <Reveal>
      <section>
        <div className="mx-auto max-w-[1080px] px-6 sm:px-10 py-20 sm:py-28">
          <div
            className="rounded-3xl px-8 sm:px-14 py-14 sm:py-20 text-center"
            style={{ backgroundColor: ACCENT_SOFT }}
          >
            <h2 className="text-[1.8rem] sm:text-[2.6rem] font-extrabold leading-[1.3] tracking-[-0.01em] text-zinc-900 max-w-[22ch] mx-auto">
              まずは、話すだけでも。
            </h2>
            <p className="mt-5 text-[14.5px] sm:text-base text-zinc-600 leading-[2] max-w-[34rem] mx-auto">
              初回相談は無料で、申し込みの義務はありません。
              いまの悩みを聞かせてください。合わないと感じたら、それで構いません。
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href={APPLY}
                className="inline-flex items-center gap-2 rounded-full text-white text-[15px] font-bold px-8 py-4 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: ACCENT }}
              >
                無料で相談する
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/territories"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 text-zinc-800 text-[15px] font-bold px-7 py-4 hover:border-zinc-900 transition-colors bg-white"
              >
                まず悩みを読む
                <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-7 text-[11.5px] text-zinc-400 leading-[1.9] max-w-[32rem] mx-auto">
              ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
            </p>
          </div>
        </div>
      </section>
      </Reveal>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ACCENT}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#a1a1aa"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 shrink-0"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
