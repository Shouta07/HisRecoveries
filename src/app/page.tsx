import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import WhatsNew from "@/components/WhatsNew";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TagMarquee from "@/components/TagMarquee";
import TrackedCTA from "@/components/TrackedCTA";
import EditorProfile from "@/components/EditorProfile";
import {
  getUpcomingEvents,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/events";
import { getAllTerritories } from "@/lib/territories";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  const upcomingEvents = getUpcomingEvents();
  const featuredEvent = upcomingEvents[0];
  const territories = getAllTerritories();

  return (
    <>
      {/* ─────────────────────────────────────────
         SCENE I — Opening
         Brand identity + manifesto + 2 CTAs.
         No symptom keywords here; this is the
         brand cathedral moment.
         ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-20 sm:pt-36 pb-20 sm:pb-28 text-center">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-7 logo-type text-5xl sm:text-7xl lg:text-8xl text-ink leading-[0.95]">
          {site.name}
        </h1>
        <div className="mt-10 flex justify-center">
          <span aria-hidden className="block w-16 h-px bg-gold draw-in" />
        </div>
        <p className="mt-10 font-mincho text-[1.7rem] sm:text-4xl lg:text-[3rem] leading-[1.45] text-ink tracking-[0.03em]">
          {site.promise}
        </p>

        <div className="mt-14 sm:mt-16 max-w-[32rem] mx-auto">
          <p className="font-mincho text-lg sm:text-xl text-ink leading-[2]">
            男性は &quot;強く&quot; から、
            <br />
            &quot;整える&quot; 時代へ。
          </p>
          <p className="mt-7 font-mincho text-base sm:text-lg text-ink/85 leading-[2]">
            清潔感、疲労、余白、
            <br className="hidden sm:inline" />
            そして男性の自意識について。
          </p>
          <p className="mt-5 font-mincho text-[15px] sm:text-base text-ink/70 leading-[2]">
            言葉にしにくいものを、
            <br className="hidden sm:inline" />
            静かに記録します。
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <TrackedCTA
              href="/assessment"
              event="hero_cta_click"
              eventProps={{ target: "assessment" }}
              className="btn-gold justify-center"
            >
              回復を始める
              <span aria-hidden>→</span>
            </TrackedCTA>
            <TrackedCTA
              href="/stories"
              event="hero_cta_click"
              eventProps={{ target: "stories" }}
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
            >
              回復体験を読む
            </TrackedCTA>
          </div>
        </div>
      </section>

      {/* Quiet horizontal current — brand vocabulary only,
          no concrete symptom keywords */}
      <TagMarquee
        items={[
          "Male Conditioning",
          "Recover Your Presence",
          "Quiet Grooming",
          "Social Recovery",
          "Quiet Masculinity",
          "汗とにおい",
          "肌と跡",
          "顔の印象",
          "髪と自意識",
          "髭と体毛",
          "心と余白",
        ]}
      />

      {/* ─────────────────────────────────────────
         SCENE II — Philosophy
         Cinematic full-bleed image moment.
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-label="Philosophy" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/images/atmosphere.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-navy-deep/35 via-navy-deep/55 to-navy-deep/85"
          />
          <div className="relative mx-auto max-w-[1000px] px-6 sm:px-10 py-32 sm:py-48 lg:py-56 text-center text-white">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
              A Philosophy
            </p>
            <p className="mt-10 font-mincho text-[1.75rem] sm:text-3xl lg:text-[2.5rem] leading-[1.65] tracking-[0.05em] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              男性は、強くなるのではなく、
              <br />
              整うのだ。
            </p>
            <p className="mt-10 font-mincho italic text-[13px] sm:text-sm tracking-[0.15em] text-white/75">
              Men are not meant to become stronger.
              <br />
              They are meant to become more aligned.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE III — Featured Recovery Experience
         Promoted above Presence Journal as the
         most important offering. Otonami-register
         editorial card, not a booking widget.
         ───────────────────────────────────────── */}
      {featuredEvent && (
        <Reveal>
          <section
            aria-labelledby="featured-experience"
            className="bg-paper/40 border-b border-hair-line"
          >
            <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-32">
              <SectionLabel
                en="Featured Recovery Experience"
                ja="体験"
                number={chapterRomans[0]}
              />

              <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
                <Link
                  href={`/events/${featuredEvent.slug}`}
                  className="block group card-lift"
                  aria-hidden
                  tabIndex={-1}
                >
                  <div className="cover-zoom">
                    <Image
                      src={featuredEvent.cover ?? "/cover/event/quiet-grooming-beta.svg"}
                      alt={featuredEvent.coverAlt ?? featuredEvent.title}
                      width={1200}
                      height={900}
                      className="w-full h-auto"
                    />
                  </div>
                </Link>

                <div>
                  <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
                    {featuredEvent.status === "open" ? "受付中" : "Upcoming"}
                  </p>
                  <h3
                    id="featured-experience"
                    className="mt-3 font-mincho text-3xl sm:text-4xl lg:text-[2.5rem] font-medium leading-[1.4] text-ink"
                  >
                    <Link
                      href={`/events/${featuredEvent.slug}`}
                      className="hover:text-gold transition-colors"
                    >
                      {featuredEvent.title}
                    </Link>
                  </h3>
                  <p className="mt-5 font-mincho text-lg sm:text-xl text-ink leading-[1.7]">
                    自然に整える 90 分。
                  </p>
                  <p className="mt-6 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[34rem]">
                    疲れて見える印象を、
                    無理なく整えるための小さな集まり。
                    1 対 1 ではなく、静かに整える時間。
                  </p>

                  <dl className="mt-9 grid grid-cols-[4.5rem_1fr] gap-y-2.5 gap-x-4 text-sm border-t border-hair-line pt-6 max-w-[28rem]">
                    <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">
                      日時
                    </dt>
                    <dd className="text-ink">
                      {formatEventDate(featuredEvent.startsAt)}
                      <span className="block text-[11px] text-sub-gray mt-0.5">
                        {formatEventTimeRange(
                          featuredEvent.startsAt,
                          featuredEvent.endsAt
                        )}
                      </span>
                    </dd>
                    <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">
                      場所
                    </dt>
                    <dd className="text-ink">{featuredEvent.location}</dd>
                    {featuredEvent.format && (
                      <>
                        <dt className="text-[11px] text-sub-gray tracking-[0.08em] pt-0.5">
                          形式
                        </dt>
                        <dd className="text-ink">{featuredEvent.format}</dd>
                      </>
                    )}
                  </dl>

                  <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
                    {featuredEvent.status === "open" &&
                      featuredEvent.applyUrl && (
                        <TrackedCTA
                          href={featuredEvent.applyUrl}
                          event="gathering_apply"
                          eventProps={{
                            event_slug: featuredEvent.slug,
                            location: "home_featured",
                          }}
                          className="btn-gold"
                        >
                          応募する
                          <span aria-hidden>→</span>
                        </TrackedCTA>
                      )}
                    <Link
                      href={`/events/${featuredEvent.slug}`}
                      className="text-sm tracking-[0.1em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE IV — Presence Journal
         Reframed as "research notes on male state",
         not a blog. Symptom keywords live in the
         card excerpts, not the framing.
         ───────────────────────────────────────── */}
      {featuredArticle && (
        <Reveal>
          <section
            aria-labelledby="presence-journal"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
              <SectionLabel
                en="Presence Journal"
                ja="記録"
                number={chapterRomans[1]}
              />
              <div className="lg:pb-2">
                <p className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem]">
                  清潔感、疲労、顔の印象、身体の悩み。
                  <br className="hidden sm:inline" />
                  解決策ではなく、&quot;整える過程&quot; として記録する。
                </p>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-[0.08em] text-sub-gray">
                  <span># Male Conditioning</span>
                  <span># Presence</span>
                  <span># Quiet Grooming</span>
                  <span># Social Recovery</span>
                  <span># Deep Recovery</span>
                  <span># Self-consciousness</span>
                  <span># Grooming Records</span>
                </div>
              </div>
            </div>
            <WhatsNew featured={featuredArticle} rest={sidebarArticles} />
            <div className="mt-12 sm:mt-16 flex justify-end">
              <Link
                href="/articles"
                className="text-sm tracking-[0.1em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                すべての記録を見る →
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE V — Chapters
         Editorial table-of-contents using the
         abstract chapter language (汗とにおい etc.)
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="chapters"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
            <SectionLabel
              en="Chapters"
              ja="章"
              number={chapterRomans[2]}
            />
            <p className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem] lg:pb-2">
              男性の状態を、悩みではなく地形として見渡す。
              <br className="hidden sm:inline" />
              選択を残したまま、層として並べておく場所。
            </p>
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
                    <h3 className="font-mincho text-xl sm:text-2xl lg:text-3xl font-medium leading-[1.45] text-ink group-hover:text-ink transition-colors">
                      {t.title}
                    </h3>
                    <p className="mt-2 font-mincho text-[13px] sm:text-sm text-sub-gray leading-[1.85]">
                      {t.subtitle}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-sub-gray group-hover:text-ink group-hover:translate-x-1 transition-all duration-300 text-lg sm:text-xl"
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
         SCENE VI — Conditioning Rituals
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
                className="mt-7 inline-flex items-center gap-3 text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                棚を見る
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VII — Letters
         The late-night anonymous letter station.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="letters"
          className="border-t border-hair-line"
        >
          <div className="mx-auto max-w-[1200px] px-6 sm:px-10 py-24 sm:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-20 items-start">
              <SectionLabel
                en="Letters"
                ja="静かなお便り"
                number={chapterRomans[4]}
              />
              <div className="max-w-[34rem]">
                <p className="font-mincho text-2xl sm:text-3xl lg:text-[2rem] leading-[1.55] text-ink">
                  夜、誰にも言えなかったことを、
                  <br />
                  短く残しておく場所。
                </p>
                <p className="mt-7 font-mincho text-[15px] sm:text-base leading-[2.05] text-ink/75">
                  返信を待つためではなく、
                  <br />
                  自分の状態を少し整理するために。
                </p>
                <Link
                  href="/letters"
                  className="mt-9 inline-flex items-center gap-3 text-sm tracking-[0.12em] text-ink border border-gold/60 hover:border-gold-bright hover:text-gold-bright transition-colors px-8 py-4"
                >
                  手紙を書く
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE VIII — Belonging
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

            <div className="mt-20 max-w-[680px] mx-auto text-left">
              <EditorProfile />
            </div>

            <div className="mt-12 pt-10 border-t border-hair-line/60 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] tracking-[0.06em] text-sub-gray">
              <Link
                href="/reflect"
                className="hover:text-ink transition-colors"
              >
                Reflect — 自分を整理する
              </Link>
              <span aria-hidden className="text-hair-line">
                ·
              </span>
              <Link
                href="/territories"
                className="hover:text-ink transition-colors"
              >
                Chapters — 章
              </Link>
              <span aria-hidden className="text-hair-line">
                ·
              </span>
              <Link
                href="/about"
                className="hover:text-ink transition-colors"
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
