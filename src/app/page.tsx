import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getAllRecoveries } from "@/lib/recoveries";
import { getAllArticles } from "@/lib/articles";
import {
  complexes,
  complexByTerritory,
  complexByCategory,
  type Complex,
} from "@/lib/complexes";
import { categoryLabel } from "@/lib/site";

export default function HomePage() {
  const interviews = getAllRecoveries().slice(0, 6);
  const reads = getAllArticles().slice(0, 4);

  return (
    <div className="bg-[#FAF6F0] text-zinc-900">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -right-20 w-[460px] h-[460px] rounded-full bg-amber-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute top-40 -left-24 w-[380px] h-[380px] rounded-full bg-rose-200/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1180px] px-6 sm:px-10 pt-14 sm:pt-20 pb-16 sm:pb-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[12px] font-bold tracking-[0.02em] text-zinc-700 shadow-sm">
            <span aria-hidden className="text-[15px]">🪞</span>
            男性のための、からだの悩み解体メディア
          </span>

          <h1 className="mt-7 text-[2.4rem] sm:text-[3.6rem] lg:text-[4.5rem] font-extrabold leading-[1.18] tracking-[-0.02em] text-zinc-900 max-w-[18ch]">
            その悩み、ちゃんと
            <br className="hidden sm:inline" />
            <span className="relative inline-block">
              <span className="relative z-10">「仕組み」</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 h-3 sm:h-4 bg-amber-300/70 -z-0 rounded"
              />
            </span>
            があります。
          </h1>

          <p className="mt-7 text-[1.05rem] sm:text-[1.25rem] leading-[1.95] text-zinc-600 max-w-[40rem]">
            薄毛も、汗も、ニキビも、顔も。
            ひとりで検索していたことを、
            <strong className="font-bold text-zinc-900">なぜ起きるのか</strong>
            の原因と、同じ悩みで働く人の声から、いっしょに読みほどきます。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#worries"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white text-[15px] font-bold px-7 py-4 hover:bg-zinc-700 transition-colors shadow-lg shadow-zinc-900/10"
            >
              気になることから探す
              <span aria-hidden>↓</span>
            </a>
            <Link
              href="/recoveries"
              className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 text-[15px] font-bold px-7 py-4 hover:bg-zinc-50 transition-colors shadow-sm"
            >
              インタビューを読む
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* trust mini badges */}
          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] font-medium text-zinc-500">
            {["商品も施術も売らない", "紹介手数料ゼロ", "煽らない・断定しない"].map(
              (t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckIcon />
                  {t}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      {/* ───────────────────────── Worry-led entry ───────────────────────── */}
      <section id="worries" className="scroll-mt-20">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center max-w-[34rem] mx-auto">
            <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
              Start here
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.3] tracking-[-0.01em]">
              こんなこと、
              <br className="sm:hidden" />
              ありませんか？
            </h2>
            <p className="mt-4 text-[14.5px] text-zinc-500 leading-[1.9]">
              近いものを選ぶと、その奥にある「なぜ」と、
              同じ悩みを抱えて働く人の声へつながります。
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complexes.map((c) => (
              <Link
                key={c.id}
                href={`/territories/${c.territory}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span
                  className="shrink-0 grid place-items-center w-12 h-12 rounded-xl"
                  style={{ backgroundColor: c.accentSoft, color: c.accent }}
                >
                  <ComplexIcon id={c.id} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold leading-[1.5] text-zinc-900">
                    {c.worry}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-medium" style={{ color: c.accent }}>
                    {c.ja} のなぜ →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── The Six (deep) ───────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-[40rem]">
              <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
                The Six
              </p>
              <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
                6 つの悩みを、仕組みから。
              </h2>
              <p className="mt-4 text-[14.5px] text-zinc-500 leading-[1.9] max-w-[34rem]">
                どれも、性格でもだらしなさでもありません。
                からだの仕組みで説明できる、再現性のある現象です。
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {complexes.map((c) => (
              <ComplexCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Interviews ───────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="max-w-[40rem]">
            <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
              Voices
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
              現場の人の、リアルな声。
            </h2>
            <p className="mt-4 text-[14.5px] text-zinc-500 leading-[1.9]">
              第一線で働く人たちが、悩みとどう過ごし、何を選び、いまどこにいるのか。
              飾らない一人称の記録です。
            </p>
          </div>

          {interviews.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {interviews.map((r) => {
                const c = complexByTerritory(r.territory);
                const accent = c?.accent ?? "#71717a";
                const soft = c?.accentSoft ?? "#f4f4f5";
                return (
                  <Link
                    key={r.slug}
                    href={`/recoveries/${r.slug}`}
                    className="group flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center w-11 h-11 rounded-full"
                        style={{ backgroundColor: soft, color: accent }}
                      >
                        {c ? <ComplexIcon id={c.id} /> : null}
                      </span>
                      <div className="text-[12px]">
                        <span className="block font-bold" style={{ color: accent }}>
                          {c?.ja ?? "悩み"}
                        </span>
                        {r.span && (
                          <span className="block text-zinc-400">{r.span}の記録</span>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-5 text-[1.15rem] sm:text-[1.25rem] font-bold leading-[1.55] text-zinc-900 group-hover:text-zinc-600 transition-colors flex-1">
                      {r.title}
                    </h3>

                    {r.asker?.context && (
                      <p className="mt-5 pt-4 border-t border-zinc-100 text-[12.5px] text-zinc-500 leading-[1.8]">
                        {r.asker.ageRange ? `${r.asker.ageRange}・` : ""}
                        {r.asker.context}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 text-zinc-500">最初のインタビューを編集中です。</p>
          )}

          <div className="mt-10">
            <Link
              href="/recoveries"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white text-[14px] font-bold px-6 py-3.5 hover:bg-zinc-700 transition-colors"
            >
              インタビューをもっと見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Mechanism reads ───────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="max-w-[40rem]">
            <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
              Read deeper
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.25] tracking-[-0.01em]">
              なぜ起きる？を、もっと深く。
            </h2>
            <p className="mt-4 text-[14.5px] text-zinc-500 leading-[1.9]">
              医学・行動科学のレイヤーから、悩みの仕組みを順に分解。
              出典を引きながら、断定せず、淡々と。
            </p>
          </div>

          {reads.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {reads.map((a) => {
                const c = complexByCategory(a.category);
                const accent = c?.accent ?? "#71717a";
                const soft = c?.accentSoft ?? "#f4f4f5";
                return (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="group flex flex-col rounded-3xl bg-[#FAF6F0] p-6 sm:p-8 hover:bg-[#F5EFE6] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-[12px] font-bold">
                      <span
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: soft, color: accent }}
                      >
                        {c?.ja ?? categoryLabel(a.category)}
                      </span>
                      <span className="text-zinc-400">{a.readingMinutes} 分で読める</span>
                    </div>

                    <h3 className="mt-4 text-[1.3rem] sm:text-[1.5rem] font-bold leading-[1.5] text-zinc-900 group-hover:text-zinc-600 transition-colors">
                      {a.title}
                    </h3>

                    {a.excerpt && (
                      <p className="mt-3 text-[13.5px] text-zinc-500 leading-[1.95] line-clamp-3">
                        {a.excerpt}
                      </p>
                    )}

                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold" style={{ color: accent }}>
                      読んでみる <span aria-hidden>→</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 text-zinc-500">最初の解剖記事を編集中です。</p>
          )}

          <div className="mt-10">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white text-[14px] font-bold px-6 py-3.5 hover:bg-zinc-700 transition-colors"
            >
              記事をもっと見る
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Trust / why safe ───────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1180px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center max-w-[34rem] mx-auto">
            <p className="text-[13px] font-bold tracking-[0.06em] text-zinc-400 uppercase">
              Why you can trust us
            </p>
            <h2 className="mt-3 text-[1.9rem] sm:text-[2.6rem] font-extrabold leading-[1.3] tracking-[-0.01em]">
              安心して読める理由。
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                emoji: "🚫",
                title: "売らない",
                body: "商品も施術も売りません。だから、いいことも悪いことも、そのまま書けます。",
              },
              {
                emoji: "🤝",
                title: "手数料ゼロ",
                body: "クリニックからの紹介手数料も受け取りません。中立でいるための構造です。",
              },
              {
                emoji: "📖",
                title: "煽らない",
                body: "一人称・過去形で、断定せず。医療の判断は専門家へ、と必ず添えます。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-7 sm:p-8 shadow-sm text-center"
              >
                <span className="text-[2rem]" aria-hidden>
                  {item.emoji}
                </span>
                <h3 className="mt-3 text-[1.2rem] font-bold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-[13.5px] text-zinc-500 leading-[1.95]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Closing CTA ───────────────────────── */}
      <Reveal>
        <section className="px-6 sm:px-10 pb-20 sm:pb-28">
          <div className="mx-auto max-w-[1180px] rounded-[2rem] bg-zinc-900 text-white px-8 sm:px-16 py-16 sm:py-24 text-center relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-[1.9rem] sm:text-[3rem] font-extrabold leading-[1.3] tracking-[-0.01em] max-w-[20ch] mx-auto">
                ひとりで検索する夜を、
                <br />
                少しだけ短く。
              </h2>
              <p className="mt-6 text-[14.5px] sm:text-base text-zinc-400 leading-[2] max-w-[36rem] mx-auto">
                正体がわかれば、次の半歩は自分で選べます。
                気になる悩みから、読みはじめてください。
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <a
                  href="#worries"
                  className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 text-[15px] font-bold px-7 py-4 hover:bg-zinc-200 transition-colors"
                >
                  悩みから探す
                  <span aria-hidden>↑</span>
                </a>
                <Link
                  href="/manifesto"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-600 text-white text-[15px] font-bold px-7 py-4 hover:border-zinc-400 transition-colors"
                >
                  編集方針を読む
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ───────────────────────── pieces ───────────────────────── */

function ComplexCard({ c }: { c: Complex }) {
  return (
    <Link
      href={`/territories/${c.territory}`}
      className="group relative flex flex-col rounded-3xl bg-white p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: c.accent }}
      />
      <div className="flex items-center justify-between">
        <span
          className="grid place-items-center w-14 h-14 rounded-2xl"
          style={{ backgroundColor: c.accentSoft, color: c.accent }}
        >
          <ComplexIcon id={c.id} large />
        </span>
        <span
          className="rounded-full px-3 py-1 text-[11.5px] font-bold"
          style={{ backgroundColor: c.accentSoft, color: c.accent }}
        >
          {c.stat}
        </span>
      </div>

      <h3 className="mt-5 text-[1.5rem] font-extrabold leading-[1.3] text-zinc-900">
        {c.ja}
      </h3>
      <p className="mt-2 text-[13.5px] text-zinc-500 leading-[1.9] flex-1">
        {c.mechanism}
      </p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold group-hover:gap-2.5 transition-all" style={{ color: c.accent }}>
        なぜ起きる？を読む <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-emerald-500">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ComplexIcon({ id, large = false }: { id: string; large?: boolean }) {
  const s = large ? 28 : 22;
  const common = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "hair":
      return (
        <svg {...common}>
          <path d="M5 20c0-4 3-7 7-7s7 3 7 7" />
          <path d="M7 10c1-4 3-6 5-6s4 2 5 6" />
          <path d="M10 9c0-2 1-3 2-3" />
        </svg>
      );
    case "sweat":
      return (
        <svg {...common}>
          <path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z" />
        </svg>
      );
    case "skin":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1" />
          <circle cx="15" cy="13" r="1" />
          <circle cx="11" cy="15" r="0.8" />
        </svg>
      );
    case "face":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-4 3.2-6 7-6s7 2 7 6" />
        </svg>
      );
    case "body-hair":
      return (
        <svg {...common}>
          <rect x="6" y="3.5" width="12" height="5" rx="1.5" />
          <path d="M9 8.5v3M12 8.5v3M15 8.5v3" />
          <path d="M12 14v6" />
        </svg>
      );
    case "self":
      return (
        <svg {...common}>
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
