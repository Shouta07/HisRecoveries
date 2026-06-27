import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getAllRecoveries } from "@/lib/recoveries";
import { complexes, complexByTerritory } from "@/lib/complexes";

const ACCENT = "#C5A572";
const ACCENT_DIM = "#8C7853";

const APPLY = "/assessment";

const PILLARS = [
  {
    no: "01",
    title: "原因から、設計する",
    body: "対症ではなく、なぜ起きているのかの構造から始めます。薄毛も汗も肌も、からだの仕組みに分解できる。原因の解像度が上がるほど、打ち手は正確になります。",
  },
  {
    no: "02",
    title: "中立だから、最適を選べる",
    body: "私たちは特定のクリニックや商品から紹介手数料を受け取りません。だから「売れるもの」ではなく「あなたに効くもの」だけを、利害なく選べます。",
  },
  {
    no: "03",
    title: "数少ない専門家と組む",
    body: "医師・専門家のネットワークから、その悩みに本当に強い相手だけを選んで連携します。一般論ではなく、あなたの状態に対する個別の判断を。",
  },
  {
    no: "04",
    title: "専属コンシェルジュが、伴走する",
    body: "一度の助言で終わらせません。設計した道筋が生活に根づくまで、専属のコンシェルジュと専門家チームが伴走します。オンラインでも対面でも、途中でくじけない構造を組み込みます。",
  },
];

const STEPS = [
  { no: "01", title: "選考・対話", body: "まずは申し込みと対話から。私たちが本当に力になれるか、双方で確かめます。" },
  { no: "02", title: "原因診断", body: "専門家と連携し、悩みの構造を特定。何が、なぜ起きているのかを言語化します。" },
  { no: "03", title: "改善設計", body: "あなた専用の道筋を設計。選択肢・順番・期間を、利害なく組み立てます。" },
  { no: "04", title: "専属伴走", body: "実行のあいだ、専属の担当が並走。迷いや停滞を、その都度ほどいていきます。" },
  { no: "05", title: "定着", body: "変化が日常に根づくまで。再現できる状態を、最終的なゴールにします。" },
];

export default function HomePage() {
  const voices = getAllRecoveries().slice(0, 3);

  return (
    <div className="bg-[#0E0E10] text-[#F3EEE6]">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="grain relative overflow-hidden border-b border-white/5">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 80% 0%, rgba(197,165,114,0.16) 0%, rgba(14,14,16,0) 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 sm:px-10 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <span
            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11.5px] font-medium tracking-[0.18em]"
            style={{ borderColor: "rgba(197,165,114,0.4)", color: ACCENT }}
          >
            <span aria-hidden>◇</span>
            完全招待制 ・ 会員制コンプレックス改善プログラム
          </span>

          <h1 className="mt-9 font-mincho text-[2.6rem] sm:text-[4.2rem] lg:text-[5.4rem] leading-[1.12] tracking-[0.01em] text-[#F6F1E8]" style={{ fontWeight: 800 }}>
            その悩みを、
            <br />
            <span style={{ color: ACCENT }}>原因から</span>終わらせる。
          </h1>

          <p className="mt-9 text-[1.05rem] sm:text-[1.25rem] leading-[1.95] text-[#C9C2B6] max-w-[42rem] font-mincho">
            薄毛、汗、肌、顔、体毛、自意識。
            ひとりで検索して終わる夜を、原因の解明と専属の伴走で、本気で変えていく。
            <span className="text-[#F3EEE6]">私たちが「変えられる」と確信できた方だけ</span>を、ご招待します。
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-4">
            <Link
              href={APPLY}
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-bold text-[#0E0E10] transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: ACCENT }}
            >
              招待をリクエストする
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#program"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[15px] font-medium text-[#F3EEE6] hover:border-white/50 transition-colors"
            >
              プログラムを見る
              <span aria-hidden>↓</span>
            </a>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[12.5px] text-[#9A938763] [&_li]:text-[#9C9488]">
            {["各期 定員制", "完全招待・選考制", "紹介手数料ゼロの中立設計"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <span aria-hidden style={{ color: ACCENT }}>—</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── Empathy ───────────────────────── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28">
          <p className="font-mincho text-[1.7rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.5] tracking-[0.01em] text-[#F3EEE6] max-w-[24ch]" style={{ fontWeight: 700 }}>
            「知っている」と「変わった」のあいだには、
            <span style={{ color: ACCENT }}>深い谷</span>がある。
          </p>
          <p className="mt-9 text-[15px] sm:text-base leading-[2.1] text-[#A8A096] max-w-[40rem]">
            原因はもう、検索すれば出てくる時代です。
            それでも変わらないのは、知識が足りないからではなく、
            <span className="text-[#F3EEE6]">自分の状態に合わせて設計し、最後まで伴走する人がいない</span>から。
            His Recoveries は、その谷を一緒に渡るための、招待制の改善プログラムです。
          </p>
        </div>
      </section>

      {/* ───────────────────────── Why we can change it ───────────────────────── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead en="Why we can change it" ja="なぜ、変えられるのか。" />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {PILLARS.map((p) => (
              <div key={p.no} className="bg-[#121215] p-8 sm:p-10">
                <span
                  className="logo-type text-[2.4rem] leading-none tabular-nums"
                  style={{ color: ACCENT_DIM, fontWeight: 600 }}
                >
                  {p.no}
                </span>
                <h3 className="mt-5 font-mincho text-[1.4rem] text-[#F3EEE6] leading-[1.4]" style={{ fontWeight: 700 }}>
                  {p.title}
                </h3>
                <p className="mt-4 text-[14px] leading-[2] text-[#A8A096]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── The program ───────────────────────── */}
      <section id="program" className="scroll-mt-20 border-b border-white/5">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead
            en="The Program"
            ja="完全招待制の、改善プログラム。"
            lead="入口から定着まで、ひとつの流れとして設計しています。 一人ひとりに深く伴走するため、各期の人数は絞っています。"
          />

          <ol className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-white/10 border border-white/10">
            {STEPS.map((s) => (
              <li key={s.no} className="bg-[#121215] p-7 flex flex-col">
                <span
                  className="text-[12px] font-bold tracking-[0.2em]"
                  style={{ color: ACCENT }}
                >
                  STEP {s.no}
                </span>
                <h3 className="mt-4 font-mincho text-[1.2rem] text-[#F3EEE6] leading-[1.4]" style={{ fontWeight: 700 }}>
                  {s.title}
                </h3>
                <p className="mt-3 text-[12.5px] leading-[1.95] text-[#9C9488]">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── Target complexes ───────────────────────── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead en="What we work on" ja="向き合う、6 つの悩み。" />

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {complexes.map((c, i) => (
              <Link
                key={c.id}
                href={`/territories/${c.territory}`}
                className="group relative bg-[#121215] p-8 sm:p-9 flex flex-col min-h-[14rem] hover:bg-[#17171b] transition-colors"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: ACCENT }}
                />
                <div className="flex items-baseline justify-between">
                  <span className="logo-type italic text-[12px] tracking-[0.2em] uppercase" style={{ color: ACCENT }}>
                    {String(i + 1).padStart(2, "0")} · {c.en}
                  </span>
                </div>
                <h3 className="mt-5 font-mincho text-[1.7rem] text-[#F3EEE6] leading-[1.3]" style={{ fontWeight: 700 }}>
                  {c.ja}
                </h3>
                <p className="mt-3 text-[13px] leading-[1.95] text-[#9C9488] flex-1">
                  {c.mechanism}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] font-medium group-hover:gap-2.5 transition-all" style={{ color: ACCENT }}>
                  このテーマを読む <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Voices ───────────────────────── */}
      {voices.length > 0 && (
        <section className="border-b border-white/5">
          <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28">
            <SectionHead
              en="Voices"
              ja="同じ道を、通った人たち。"
              lead="第一線で働く人たちが、悩みとどう向き合い、何を選んだか。飾らない一人称の記録です。"
            />

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
              {voices.map((r) => {
                const c = complexByTerritory(r.territory);
                return (
                  <Link
                    key={r.slug}
                    href={`/recoveries/${r.slug}`}
                    className="group bg-[#121215] p-8 flex flex-col hover:bg-[#17171b] transition-colors"
                  >
                    <span className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: ACCENT }}>
                      {c?.ja ?? r.territory}
                      {r.span ? ` · ${r.span}` : ""}
                    </span>
                    <h3 className="mt-5 font-mincho text-[1.25rem] text-[#F3EEE6] leading-[1.55] flex-1" style={{ fontWeight: 700 }}>
                      {r.title}
                    </h3>
                    {r.asker?.context && (
                      <p className="mt-5 pt-5 border-t border-white/10 text-[12.5px] text-[#9C9488] leading-[1.8]">
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
      )}

      {/* ───────────────────────── Invitation-only explained ───────────────────────── */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20">
          <div>
            <SectionHead en="Why invitation-only" ja="なぜ、完全招待制なのか。" />
            <p className="mt-8 text-[15px] leading-[2.1] text-[#A8A096]">
              誰でも受けられるようにすれば、一人あたりに注げる深さは薄くなります。
              私たちは逆を選びました。
              <span className="text-[#F3EEE6]">本当に力になれると確信できた方だけ</span>を、
              各期、限られた人数だけご招待する。
              それが、結果の質を守るための構造です。
            </p>
          </div>

          <dl className="space-y-px bg-white/10 border border-white/10 self-start w-full">
            {[
              { t: "選考制", d: "申し込みと対話を経て、双方で適性を確認します。" },
              { t: "定員制", d: "各期の人数を絞り、専属で深く伴走します。" },
              { t: "形式", d: "オンラインと対面の両方に対応。専属コンシェルジュと専門家チームが担当します。" },
              { t: "料金", d: "プログラム内容は一人ひとり異なるため、選考後に個別にご提示します。" },
              { t: "中立", d: "特定の医療機関・商品からの紹介手数料は受け取りません。" },
            ].map((row) => (
              <div key={row.t} className="bg-[#121215] p-6 sm:p-7 grid grid-cols-[6rem_1fr] gap-4">
                <dt className="text-[13px] font-bold tracking-[0.08em]" style={{ color: ACCENT }}>
                  {row.t}
                </dt>
                <dd className="text-[13.5px] leading-[1.9] text-[#A8A096]">{row.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────────────────── Final CTA ───────────────────────── */}
      <Reveal>
        <section className="grain relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(100% 80% at 50% 100%, rgba(197,165,114,0.18) 0%, rgba(14,14,16,0) 60%)",
            }}
          />
          <div className="relative mx-auto max-w-[1180px] px-6 sm:px-10 py-24 sm:py-36 text-center">
            <p className="logo-type italic text-[12px] tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
              Request an invitation
            </p>
            <h2 className="mt-6 font-mincho text-[2.1rem] sm:text-[3.4rem] leading-[1.3] tracking-[0.01em] text-[#F6F1E8] max-w-[20ch] mx-auto" style={{ fontWeight: 800 }}>
              次の選考枠は、
              <br />
              若干名です。
            </h2>
            <p className="mt-7 text-[14.5px] sm:text-base leading-[2] text-[#A8A096] max-w-[34rem] mx-auto">
              まずは対話から。あなたの悩みを聞かせてください。
              私たちが力になれると判断したとき、ご招待をお送りします。
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href={APPLY}
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-bold text-[#0E0E10] transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: ACCENT }}
              >
                招待をリクエストする
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/territories"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[15px] font-medium text-[#F3EEE6] hover:border-white/50 transition-colors"
              >
                まず悩みを読む
                <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-8 text-[11.5px] text-[#7C766B] leading-[1.9] max-w-[32rem] mx-auto">
              ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
            </p>
          </div>
        </section>
      </Reveal>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#0E0E10]/95 backdrop-blur px-4 py-3">
        <Link
          href={APPLY}
          className="flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold text-[#0E0E10]"
          style={{ backgroundColor: ACCENT }}
        >
          招待をリクエストする <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

function SectionHead({
  en,
  ja,
  lead,
}: {
  en: string;
  ja: string;
  lead?: string;
}) {
  return (
    <div className="max-w-[60rem]">
      <span className="logo-type italic text-[12px] tracking-[0.24em] uppercase" style={{ color: ACCENT }}>
        {en}
      </span>
      <h2 className="mt-4 font-mincho text-[1.9rem] sm:text-[2.7rem] leading-[1.25] tracking-[0.01em] text-[#F3EEE6] max-w-[22ch]" style={{ fontWeight: 700 }}>
        {ja}
      </h2>
      {lead && (
        <p className="mt-6 text-[14.5px] sm:text-[15px] leading-[2] text-[#A8A096] max-w-[42rem]">
          {lead}
        </p>
      )}
    </div>
  );
}
