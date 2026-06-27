import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getAllRecoveries } from "@/lib/recoveries";
import { getAllArticles } from "@/lib/articles";
import { complexes, complexByTerritory, complexByCategory } from "@/lib/complexes";
import { categoryLabel } from "@/lib/site";

export default function HomePage() {
  const interviews = getAllRecoveries().slice(0, 6);
  const reads = getAllArticles().slice(0, 6);

  return (
    <div className="bg-white text-zinc-950">
      {/* ───────────────────────── Masthead / Hero ───────────────────────── */}
      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="flex items-center gap-3 text-[11px] tracking-[0.26em] uppercase text-zinc-500 mb-10">
            <span aria-hidden className="block w-7 h-px bg-zinc-900" />
            男性の悩みを、メカニズムと、現場の声から。
          </div>

          <h1
            className="font-mincho text-[2.4rem] sm:text-[4rem] lg:text-[5.25rem] leading-[1.08] tracking-[-0.01em] text-zinc-950 max-w-[20ch]"
            style={{ fontWeight: 800 }}
          >
            悩みには、
            <span className="text-zinc-400">仕組み</span>がある。
          </h1>

          <p className="mt-9 text-[1.05rem] sm:text-[1.3rem] leading-[1.85] text-zinc-700 max-w-[44rem] font-mincho">
            薄毛、汗、ニキビ、顔、体毛、自意識。
            <br className="hidden sm:inline" />
            第一線で働く人たちのインタビューと、それが
            <strong className="font-bold text-zinc-950">なぜ起きるのか</strong>
            の原因メカニズムを、コンプレックス別に編集する日本発のメディアです。
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-3">
            <a
              href="#complexes"
              className="inline-flex items-center gap-2 bg-zinc-950 text-white text-[14px] font-semibold px-6 py-3.5 hover:bg-zinc-700 transition-colors"
            >
              悩み別に読む
              <span aria-hidden>↓</span>
            </a>
            <Link
              href="/recoveries"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-zinc-700 hover:text-zinc-950 transition-colors px-3 py-3.5 border-b border-zinc-300 hover:border-zinc-900"
            >
              インタビューから読む
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── The Six complexes ───────────────────────── */}
      <section id="complexes" className="scroll-mt-24 border-b border-zinc-200">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead
            index="01"
            en="The Six"
            ja="コンプレックスから入る。"
            lead="どの悩みも、入口はひとつの「気になる」から。 そこから、なぜ起きるのかの仕組みと、同じものを抱えて働く人の声へ降りていけます。"
          />

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
            {complexes.map((c, i) => (
              <Link
                key={c.id}
                href={`/territories/${c.territory}`}
                className="group relative bg-white p-7 sm:p-9 flex flex-col min-h-[15rem] hover:bg-zinc-50 transition-colors"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: c.accent }}
                />
                <div className="flex items-start justify-between">
                  <span
                    className="logo-type italic text-[12px] tracking-[0.2em] uppercase"
                    style={{ color: c.accent }}
                  >
                    {String(i + 1).padStart(2, "0")} · {c.en}
                  </span>
                  <span
                    aria-hidden
                    className="group-hover:translate-x-1 transition-transform text-lg"
                    style={{ color: c.accent }}
                  >
                    →
                  </span>
                </div>

                <h3
                  className="mt-5 font-mincho text-[1.7rem] sm:text-[2rem] leading-[1.3] text-zinc-950"
                  style={{ fontWeight: 700 }}
                >
                  {c.ja}
                </h3>
                <p className="mt-3 text-[13.5px] text-zinc-600 leading-[1.9] flex-1">
                  {c.mechanism}
                </p>
                <span
                  className="mt-6 inline-flex w-fit items-center text-[11px] tracking-[0.08em] px-2.5 py-1 font-medium"
                  style={{ backgroundColor: c.accentSoft, color: c.accent }}
                >
                  {c.system}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Interviews ───────────────────────── */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead
            index="02"
            en="Voices from the Floor"
            ja="現場の人に、聞く。"
            lead="第一線で働く人たちが、悩みとどう過ごし、何を選び、いまどこにいるのか。 完了形ではなく、半歩進んだ時間の記録として。"
          />

          {interviews.length > 0 ? (
            <ul className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
              {interviews.map((r) => {
                const c = complexByTerritory(r.territory);
                return (
                  <li key={r.slug} className="bg-white">
                    <Link
                      href={`/recoveries/${r.slug}`}
                      className="group flex flex-col h-full p-7 sm:p-9 hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 text-[11px] tracking-[0.1em] uppercase">
                        {c && (
                          <span
                            className="inline-flex items-center gap-1.5 font-semibold"
                            style={{ color: c.accent }}
                          >
                            <span
                              aria-hidden
                              className="block w-1.5 h-1.5"
                              style={{ backgroundColor: c.accent }}
                            />
                            {c.ja}
                          </span>
                        )}
                        {r.span && (
                          <>
                            <span aria-hidden className="text-zinc-300">/</span>
                            <span className="text-zinc-500">{r.span}</span>
                          </>
                        )}
                      </div>

                      <h3
                        className="mt-5 font-mincho text-[1.3rem] sm:text-[1.45rem] leading-[1.5] text-zinc-950 group-hover:text-zinc-600 transition-colors flex-1"
                        style={{ fontWeight: 700 }}
                      >
                        {r.title}
                      </h3>

                      {r.asker?.context && (
                        <p className="mt-5 pt-5 border-t border-zinc-200 text-[12.5px] text-zinc-500 leading-[1.8]">
                          {r.asker.ageRange ? `${r.asker.ageRange} · ` : ""}
                          {r.asker.context}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-12 font-mincho text-zinc-600">
              最初のインタビューを編集中です。
            </p>
          )}

          <div className="mt-12 flex justify-end">
            <Link
              href="/recoveries"
              className="logo-type italic text-[13px] tracking-[0.16em] uppercase text-zinc-900 border-b border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-400 transition-colors"
            >
              All interviews <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Mechanism / deep reads ───────────────────────── */}
      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-20 sm:py-28">
          <SectionHead
            index="03"
            en="The Mechanism"
            ja="なぜ起きるのかを、解剖する。"
            lead="医学・生理学・行動科学のレイヤーから、悩みの仕組みを順に分解する記事群。 出典 URL を引きながら、断定せず、淡々と。"
          />

          {reads.length > 0 ? (
            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-200 border border-zinc-200">
              {reads.map((a, i) => {
                const c = complexByCategory(a.category);
                const featured = i === 0;
                return (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className={`group bg-white p-7 sm:p-9 flex flex-col hover:bg-zinc-50 transition-colors ${
                      featured ? "lg:row-span-2 justify-center" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-[11px] tracking-[0.1em] uppercase">
                      <span
                        className="font-semibold"
                        style={{ color: c?.accent ?? "#71717a" }}
                      >
                        {c?.ja ?? categoryLabel(a.category)}
                      </span>
                      <span aria-hidden className="text-zinc-300">/</span>
                      <span className="text-zinc-500">{a.readingMinutes} min</span>
                    </div>

                    <h3
                      className={`mt-4 font-mincho leading-[1.45] text-zinc-950 group-hover:text-zinc-600 transition-colors ${
                        featured
                          ? "text-[1.7rem] sm:text-[2.2rem]"
                          : "text-[1.25rem] sm:text-[1.4rem]"
                      }`}
                      style={{ fontWeight: 700 }}
                    >
                      {a.title}
                    </h3>

                    {a.excerpt && (
                      <p
                        className={`mt-4 text-zinc-600 leading-[1.95] ${
                          featured ? "text-[14px] line-clamp-4" : "text-[13px] line-clamp-2"
                        }`}
                      >
                        {a.excerpt}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-12 font-mincho text-zinc-600">
              最初の解剖記事を編集中です。
            </p>
          )}

          <div className="mt-12 flex justify-end">
            <Link
              href="/articles"
              className="logo-type italic text-[13px] tracking-[0.16em] uppercase text-zinc-900 border-b border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-400 transition-colors"
            >
              All readings <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Editorial principle / closing ───────────────────────── */}
      <Reveal>
        <section className="bg-zinc-950 text-white">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-10 py-24 sm:py-32">
            <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-8">
              Our stance
            </p>
            <p
              className="font-mincho text-[1.6rem] sm:text-[2.4rem] lg:text-[2.85rem] leading-[1.5] tracking-[0.01em] max-w-[28ch]"
              style={{ fontWeight: 700 }}
            >
              商品も施術も売らない。
              <br />
              紹介手数料も、受け取らない。
            </p>
            <p className="mt-9 text-[14.5px] sm:text-base text-zinc-400 leading-[2] max-w-[40rem]">
              だから、仕組みをそのまま書ける。
              煽らず、断定せず、一人称で。
              悩みの正体を理解した上で、次の半歩を自分で選べること——
              それだけを、このメディアは目的にしています。
            </p>

            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/manifesto"
                className="inline-flex items-center gap-2 bg-white text-zinc-950 text-[14px] font-semibold px-6 py-3.5 hover:bg-zinc-200 transition-colors"
              >
                編集方針を読む
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/territories"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-zinc-300 hover:text-white transition-colors px-3 py-3.5 border-b border-zinc-700 hover:border-zinc-400"
              >
                6 つの原因を読む
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function SectionHead({
  index,
  en,
  ja,
  lead,
}: {
  index: string;
  en: string;
  ja: string;
  lead?: string;
}) {
  return (
    <div className="max-w-[62rem]">
      <div className="flex items-center gap-4 mb-6">
        <span
          className="logo-type text-zinc-300 text-[2rem] leading-none tabular-nums"
          style={{ fontWeight: 600 }}
        >
          {index}
        </span>
        <span className="logo-type italic text-[12px] tracking-[0.22em] uppercase text-zinc-500">
          {en}
        </span>
      </div>
      <h2
        className="font-mincho text-[1.9rem] sm:text-[2.6rem] lg:text-[2.95rem] leading-[1.2] tracking-[-0.005em] text-zinc-950 max-w-[22ch]"
        style={{ fontWeight: 700 }}
      >
        {ja}
      </h2>
      {lead && (
        <p className="mt-6 text-[14.5px] sm:text-[15px] text-zinc-600 leading-[1.95] max-w-[42rem]">
          {lead}
        </p>
      )}
    </div>
  );
}
