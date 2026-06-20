import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import TagMarquee from "@/components/TagMarquee";
import { getAllFeelings, TERRITORY_LABEL } from "@/lib/feelings";
import { getAllRecoveries } from "@/lib/recoveries";
import { site } from "@/lib/site";

export default function HomePage() {
  const feelings = getAllFeelings();
  const recoveries = getAllRecoveries().slice(0, 6);
  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Hero
         Cinematic background, type only. One statement.
         ───────────────────────────────────────── */}
      <section className="relative min-h-[86vh] flex flex-col items-center justify-center text-center px-6 sm:px-10 bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cityscape-dawn.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/70"
        />

        <div className="relative">
          <h1
            className="logo-type text-[3rem] sm:text-[5.5rem] lg:text-[7rem] text-cream leading-[0.95] tracking-[-0.01em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]"
            style={{ fontWeight: 600 }}
          >
            {site.name}
          </h1>
          <div className="mt-9 flex justify-center">
            <span
              aria-hidden
              className="block w-20 sm:w-28 h-[3px] bg-gold-bright draw-in"
            />
          </div>
          <p
            className="mt-9 font-mincho text-[1.5rem] sm:text-[2.1rem] lg:text-[2.8rem] leading-[1.55] text-cream tracking-[0.02em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]"
            style={{ fontWeight: 700 }}
          >
            男性コンプレックスの
            <br className="sm:hidden" />
            <span className="text-gold-bright">「なんで？」</span>を解剖し、
            <br />
            背中を後押しするメディア。
          </p>
          <p
            className="mt-8 font-mincho text-[12.5px] sm:text-[14.5px] tracking-[0.4em] uppercase text-cream/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
            style={{ fontWeight: 600 }}
          >
            {site.promise}
          </p>
          <div className="mt-9">
            <Link
              href="/screen"
              className="inline-flex items-center gap-3 bg-gold-bright text-navy px-7 py-4 text-[13px] tracking-[0.16em] hover:bg-cream transition-colors"
              style={{ fontWeight: 700 }}
            >
              3 分の軽診断を始める →
            </Link>
          </div>
        </div>

        {/* Scroll cue — solid SCROLL label, thicker rule */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="font-mincho text-[10.5px] tracking-[0.45em] uppercase text-cream/80"
            style={{ fontWeight: 600 }}
          >
            Scroll
          </span>
          <span
            aria-hidden
            className="block w-[2px] h-10 bg-gradient-to-b from-gold-bright to-transparent soft-float"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────
         SCENE II — Concept (cinematic scroll reveal)
         Continues the Hero's dark mood. Sentences fade in
         one at a time as the user scrolls down from the Hero.
         ───────────────────────────────────────── */}
      <section aria-label="Concept" className="bg-navy text-cream">
        <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-32 sm:py-56">
          <div className="space-y-14 sm:space-y-24 font-mincho">
            <Reveal>
              <p className="text-[1.55rem] sm:text-[2.4rem] lg:text-[2.85rem] leading-[1.7] tracking-[0.04em] text-cream drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                誰にも言えない悩みを抱える男性は、
                <br className="hidden sm:inline" />
                たいてい、ひとりで検索している。
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="text-[1.55rem] sm:text-[2.4rem] lg:text-[2.85rem] leading-[1.7] tracking-[0.04em] text-cream/85 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                His Recoveries は、
                <br className="hidden sm:inline" />
                前に進んだ男性の話を、編集する場所です。
              </p>
            </Reveal>
            <Reveal delay={420}>
              <p className="text-[1.05rem] sm:text-[1.3rem] leading-[1.95] tracking-[0.04em] text-cream/70 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">
                男性活力（Male Vitality）を扱う、
                <br className="hidden sm:inline" />
                キュレーション × インタビュー・メディア。
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Concern vocabulary — SEO/GEO-grabbable words the persona searches,
         mixed with the emotional phrases that say "you are seen here."
         Sits between the Concept statement and the Recovery Check so the
         visitor lands their own search terms before being offered the tool. */}
      <TagMarquee
        items={[
          "多汗症",
          "ワキガ",
          "ニキビ跡",
          "薄毛・AGA",
          "加齢臭",
          "男性の自意識",
          "清潔感が欲しい",
          "鏡を見るのが怖い",
          "温泉に誘われたくない",
          "集合写真が好きになれない",
          "婚活写真が苦手",
          "派手にはなりたくない",
          "老けて見えると言われた",
          "美容皮膚科に行けない",
        ]}
      />

      {/* ─────────────────────────────────────────
         SCENE III — Featured Recoveries（実例）
         エディトリアル誌のような版面: 大きな番号 + 1枚目 featured +
         残りの記録。ラベルで「インタビュー」と叫ばず、作品が並ぶことで
         語らせる。
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="featured-recoveries"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-36"
        >
          <header className="mb-14 sm:mb-20 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
            <h2
              id="featured-recoveries"
              className="font-mincho text-[2rem] sm:text-[2.85rem] lg:text-[3.3rem] text-ink leading-[1.3] tracking-[-0.005em] max-w-[28rem]"
              style={{ fontWeight: 700 }}
            >
              前に進んだ
              <br />
              男性たちの、記録。
            </h2>
            <p
              className="font-mincho text-[12.5px] tracking-[0.22em] text-sub-gray uppercase lg:pb-3"
              style={{ fontWeight: 600 }}
            >
              {recoveries.length > 0 ? `${recoveries.length} stories` : "coming soon"}
            </p>
          </header>

          {recoveries.length > 0 ? (
            <ul className="space-y-px">
              {recoveries.map((r, i) => {
                const isFeatured = i === 0;
                return (
                  <li
                    key={r.slug}
                    className="border-t-2 border-ink/15 last:border-b-2 last:border-b-ink/15"
                  >
                    <Link
                      href={`/recoveries/${r.slug}`}
                      className="group grid grid-cols-[5rem_1fr_auto] sm:grid-cols-[7rem_1fr_auto] gap-4 sm:gap-10 items-baseline py-8 sm:py-10 hover:px-2 transition-all"
                    >
                      <span
                        aria-hidden
                        className="logo-type text-gold text-[2.5rem] sm:text-[3.75rem] leading-none tabular-nums"
                        style={{ fontWeight: 600 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div
                          className="flex items-baseline gap-3 text-[10.5px] tracking-[0.22em] text-sub-gray uppercase"
                          style={{ fontWeight: 600 }}
                        >
                          <span>{TERRITORY_LABEL[r.territory] ?? r.territory}</span>
                          {r.span && (
                            <>
                              <span aria-hidden className="text-hair-line">/</span>
                              <span>{r.span}</span>
                            </>
                          )}
                        </div>
                        <h3
                          className={`mt-3 font-mincho text-ink leading-[1.4] tracking-[-0.005em] group-hover:text-gold transition-colors ${
                            isFeatured
                              ? "text-[1.55rem] sm:text-[2.05rem]"
                              : "text-[1.25rem] sm:text-[1.5rem]"
                          }`}
                          style={{ fontWeight: isFeatured ? 700 : 600 }}
                        >
                          {r.title}
                        </h3>
                        {r.asker?.context && (
                          <p
                            className={`mt-3 font-mincho text-sub-gray leading-[1.95] max-w-[34rem] ${
                              isFeatured
                                ? "text-[13.5px] sm:text-[14.5px]"
                                : "text-[12.5px] sm:text-[13px] line-clamp-2"
                            }`}
                          >
                            {r.asker.context}
                          </p>
                        )}
                      </div>
                      <span
                        aria-hidden
                        className="text-sub-gray group-hover:text-gold group-hover:translate-x-1 transition-all text-xl shrink-0 self-center"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="border-t border-b border-hair-line py-12">
              <p className="font-mincho text-[15px] text-ink leading-[2.05]">
                最初の記録が、まだ届いていません。
              </p>
            </div>
          )}

          {recoveries.length > 0 && (
            <div className="mt-14 flex justify-end">
              <Link
                href="/recoveries"
                className="logo-type italic text-[13px] tracking-[0.2em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors uppercase"
              >
                See all stories <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE IV — Recovery Hub (emotional entry)
         "あなたは今、どこにいますか？" The visitor selects by FEELING,
         not symptom. Each leads to a feeling page that translates the
         feeling into possible causes.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="recovery-hub"
          className="bg-cream-deep border-t border-hair-line"
        >
          <div className="mx-auto max-w-[860px] px-6 sm:px-10 py-20 sm:py-32">
            <div className="mb-12 sm:mb-16">
              <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
                Recovery Hub
              </p>
              <h2
                id="recovery-hub"
                className="mt-5 font-mincho text-2xl sm:text-[2.2rem] text-ink leading-[1.45]"
              >
                あなたは今、どこにいますか？
              </h2>
              <p className="mt-5 font-mincho text-[13.5px] sm:text-sm text-sub-gray max-w-[30rem] leading-[2]">
                症状ではなく、いまの気持ちから。近いものを選ぶと、
                その奥にある原因を、一緒に読みほどきます。
              </p>
            </div>

            <ul className="border-t border-hair-line">
              {feelings.map((f) => (
                <li key={f.slug} className="border-b border-hair-line">
                  <Link
                    href={`/feelings/${f.slug}`}
                    className="group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 hover:px-2 transition-all"
                  >
                    <span
                      aria-hidden
                      className="shrink-0 w-5 h-5 border border-sub-gray/50 group-hover:border-gold group-hover:bg-gold/10 transition-colors"
                    />
                    <span className="flex-1 font-mincho text-[1.05rem] sm:text-[1.3rem] text-ink leading-[1.5] group-hover:text-gold transition-colors">
                      {f.statement}
                    </span>
                    <span
                      aria-hidden
                      className="text-sub-gray group-hover:text-gold group-hover:translate-x-1 transition-all text-lg shrink-0"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

    </>
  );
}
