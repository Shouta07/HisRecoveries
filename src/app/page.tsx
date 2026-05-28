import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import WhatsNew from "@/components/WhatsNew";
import QuietGatherings from "@/components/QuietGatherings";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TagMarquee from "@/components/TagMarquee";
import TrackedCTA from "@/components/TrackedCTA";
import { getUpcomingEvents } from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV", "V", "VI", "VII"];

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  const upcomingEvents = getUpcomingEvents();
  const territories = getAllTerritories();

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Opening
         A hotel-at-night opening: small eyebrow,
         large mincho promise, generous breath.
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-24 sm:pt-40 pb-24 sm:pb-32 text-center">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-7 logo-type text-5xl sm:text-7xl lg:text-8xl text-navy leading-[0.95]">
          {site.name}
        </h1>
        <div className="mt-10 flex justify-center">
          <span aria-hidden className="block w-16 h-px bg-gold draw-in" />
        </div>
        <p className="mt-10 font-mincho text-[1.7rem] sm:text-4xl lg:text-[3rem] leading-[1.45] text-ink tracking-[0.03em]">
          {site.promise}
        </p>
        <p className="mt-10 font-mincho text-base sm:text-lg leading-[2.05] text-ink max-w-[34rem] mx-auto">
          多汗症、ワキガ、ニキビ跡、AGA、髭脱毛、
          <br className="hidden sm:inline" />
          そして男性の自意識について。
        </p>
        <p className="mt-4 text-[13px] sm:text-sm leading-[1.95] text-sub-gray max-w-[30rem] mx-auto">
          言葉にしにくいものを、半歩先を歩いた当事者が、
          <br className="hidden sm:inline" />
          静かに記録します。
        </p>
      </section>

      {/* A quiet horizontal current — what readers actually search for */}
      <TagMarquee
        items={[
          "メンズ多汗症",
          "ワキガ手術 男",
          "ボトックス 脇汗",
          "ミラドライ",
          "ニキビ跡 男",
          "美容皮膚科",
          "AGA オンライン診療",
          "ヒゲ脱毛",
          "メンズ医療脱毛",
          "メンズスキンケア",
          "メンズメイク",
          "男性の自意識",
          "顔の印象",
          "Male Conditioning",
        ]}
      />

      {/* ─────────────────────────────────────────
         SCENE II — Philosophy fragment
         A single cinematic line, fully on cream.
         Slow breathing in the middle of the page.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-label="Philosophy"
          className="border-b border-hair-line"
        >
          <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-24 sm:py-36 text-center">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              A Philosophy
            </p>
            <p className="mt-10 font-mincho text-2xl sm:text-3xl lg:text-[2.25rem] leading-[1.7] text-ink tracking-[0.05em]">
              男性は、強くなるのではなく、
              <br />
              整うのだ。
            </p>
            <p className="mt-10 font-mincho italic text-[13px] sm:text-sm tracking-[0.15em] text-sub-gray">
              Men are not meant to become stronger.
              <br />
              They are meant to become more aligned.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE III — Presence Journal
         The editorial moment. One cover + 3 small.
         ───────────────────────────────────────── */}
      {featuredArticle && (
        <Reveal>
          <section
            aria-labelledby="presence-journal"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-28 sm:pt-36 pb-20 sm:pb-28"
          >
            <div className="flex items-end justify-between flex-wrap gap-4 mb-14 sm:mb-20">
              <SectionLabel
                en="Presence Journal"
                ja="記録"
                number={chapterRomans[0]}
              />
              <Link
                href="/articles"
                className="text-[13px] tracking-[0.1em] text-navy hover:text-gold transition-colors"
              >
                すべての記録 →
              </Link>
            </div>
            <WhatsNew featured={featuredArticle} rest={sidebarArticles} />
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE IV — Recovery Experiences
         The conversion-focused experience layer.
         ───────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="recovery-experiences"
            className="border-t border-hair-line bg-paper/40"
          >
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-32">
              <div className="flex items-end justify-between flex-wrap gap-4 mb-14 sm:mb-20">
                <SectionLabel
                  en="Recovery Experiences"
                  ja="体験"
                  number={chapterRomans[1]}
                />
                <Link
                  href="/events"
                  className="text-[13px] tracking-[0.1em] text-navy hover:text-gold transition-colors"
                >
                  すべての集まり →
                </Link>
              </div>
              <p className="font-mincho text-[1rem] sm:text-lg leading-[2] text-ink/80 max-w-[34rem] mb-12">
                Quiet Gatherings は、整える時間そのものを共有する場。
                <br className="hidden sm:inline" />
                少人数・半公開で、夜に行います。
              </p>
              <QuietGatherings events={upcomingEvents} />
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE V — Chapters
         The territory map presented as editorial
         table-of-contents. No icons, no cards.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="chapters"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-28 sm:pt-36 pb-20 sm:pb-28"
        >
          <div className="mb-14 sm:mb-20">
            <SectionLabel
              en="Chapters"
              ja="章"
              number={chapterRomans[2]}
            />
          </div>

          <ol className="border-t border-hair-line">
            {territories.map((t, i) => (
              <li key={t.slug} className="border-b border-hair-line">
                <Link
                  href={`/territories/${t.slug}`}
                  className="group grid grid-cols-[4rem_1fr_auto] sm:grid-cols-[5rem_1fr_auto] items-baseline gap-4 sm:gap-8 py-6 sm:py-8 hover:bg-paper/60 transition-colors"
                >
                  <span className="logo-type italic text-[12px] sm:text-sm tracking-[0.2em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-mincho text-xl sm:text-2xl lg:text-3xl font-medium leading-[1.45] text-ink group-hover:text-navy transition-colors">
                      {t.title}
                    </h3>
                    <p className="mt-2 font-mincho text-[13px] sm:text-sm text-sub-gray leading-[1.85]">
                      {t.subtitle}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-sub-gray group-hover:text-navy group-hover:translate-x-1 transition-all duration-300 text-lg sm:text-xl"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VI — Conditioning Rituals (the shelf)
         A single quiet pointer, not a product grid.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="rituals"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">
            <SectionLabel
              en="Conditioning Rituals"
              ja="整える道具"
              number={chapterRomans[3]}
            />
            <div>
              <p className="font-mincho text-[1rem] sm:text-lg leading-[2] text-ink/85 max-w-[28rem]">
                使ってきたもの、合わなかったこと、迷ったこと。
                効くと言わずに、正直に並べる棚です。
              </p>
              <Link
                href="/shelf"
                className="mt-7 inline-flex items-center gap-3 text-sm tracking-[0.12em] text-navy border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                棚を見る
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VII — Belonging
         A whisper-quiet subscription invitation.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="belonging"
          className="border-t border-hair-line"
        >
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-24 sm:py-32 text-center">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              Belonging
            </p>
            <p className="mt-8 font-mincho text-2xl sm:text-3xl leading-[1.6] text-ink max-w-[28rem] mx-auto">
              月に一度か二度、
              <br className="sm:hidden" />
              便りが届きます。
            </p>
            <p className="mt-6 text-[13px] sm:text-sm leading-[2] text-sub-gray max-w-[28rem] mx-auto">
              新しい記録と、まだ記事にしていない覚え書きを。
              通知も煽りも、ありません。
            </p>
            <div className="mt-10">
              <TrackedCTA
                href={site.social.substack}
                event="subscribe_click"
                eventProps={{ location: "home_belonging" }}
                className="btn-gold"
              >
                Substack で購読する
                <span aria-hidden>→</span>
              </TrackedCTA>
            </div>

            <div className="mt-16 pt-10 border-t border-hair-line/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] tracking-[0.06em] text-sub-gray">
              <Link
                href="/reflect"
                className="hover:text-navy transition-colors"
              >
                Reflect — 自分を整理する
              </Link>
              <span aria-hidden className="text-hair-line">
                ·
              </span>
              <Link
                href="/letters"
                className="hover:text-navy transition-colors"
              >
                Letters — 静かなお便り
              </Link>
              <span aria-hidden className="text-hair-line">
                ·
              </span>
              <Link
                href="/about"
                className="hover:text-navy transition-colors"
              >
                Philosophy — このサイトについて
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
