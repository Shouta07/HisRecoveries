import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import WhatsNew from "@/components/WhatsNew";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TagMarquee from "@/components/TagMarquee";
import TrackedCTA from "@/components/TrackedCTA";
import FeaturedRituals from "@/components/FeaturedRituals";
import ProductCard from "@/components/ProductCard";
import { getAllTerritories } from "@/lib/territories";
import { getAllProducts } from "@/lib/products";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  const territories = getAllTerritories();
  const products = getAllProducts();
  const featuredProducts = products.slice(0, 2);
  const shelfPreview = products.slice(0, 3);

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

        <div className="mt-14 sm:mt-16 max-w-[34rem] mx-auto">
          <p className="font-mincho text-lg sm:text-xl text-ink leading-[2]">
            男性は &quot;強く&quot; から、
            <br />
            &quot;整える&quot; 時代へ。
          </p>
          <p className="mt-7 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.05]">
            汗・におい・肌・髪・髭・自意識 ──
            <br className="hidden sm:inline" />
            男性が言葉にしにくいことを、
            <br className="hidden sm:inline" />
            当事者として整理するエディトリアル・メディア。
          </p>
          <p className="mt-5 font-mincho text-[13.5px] sm:text-[14px] text-sub-gray leading-[2]">
            運営：20 代で多汗症ボトックス、ワキガ手術、
            <br className="hidden sm:inline" />
            ニキビ跡の通院を通過した、日本人男性。
          </p>

          <Link
            href="/founder"
            className="mt-6 inline-flex items-center gap-2 logo-type italic text-[12px] tracking-[0.2em] uppercase text-gold/85 hover:text-gold-bright transition-colors"
          >
            Founder&apos;s Note を読む
            <span aria-hidden>→</span>
          </Link>

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
              href="/shelf"
              event="hero_cta_click"
              eventProps={{ target: "shelf" }}
              className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3.5"
            >
              整える道具を見る
            </TrackedCTA>
          </div>

          <div className="mt-6 flex justify-center">
            <TrackedCTA
              href="/stories"
              event="hero_cta_click"
              eventProps={{ target: "stories" }}
              className="text-[12px] tracking-[0.12em] text-sub-gray hover:text-ink transition-colors underline-offset-4 hover:underline"
            >
              回復体験を読む →
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
         SCENE I½ — Three Entries (persona-clear)
         Three explicit entrances for first-time
         visitors. No abstraction; each card states
         who it's for and what's there.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="three-entries"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-12 sm:pb-16"
        >
          <div className="text-center mb-12 sm:mb-16">
            <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.4em] uppercase text-gold">
              For First-Time Visitors
            </p>
            <h2
              id="three-entries"
              className="mt-5 font-mincho text-2xl sm:text-3xl lg:text-4xl text-ink leading-[1.4]"
            >
              入口は、3 つあります。
            </h2>
            <p className="mt-5 font-mincho text-[14px] sm:text-[15px] text-ink/75 leading-[2] max-w-[32rem] mx-auto">
              あなたが今いる場所に合わせて、選んでください。
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <li>
              <TrackedCTA
                href="/territories"
                event="hero_cta_click"
                eventProps={{ target: "territories", source: "three_entries" }}
                className="block h-full bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
              >
                <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                  01 · For you with a 悩み
                </p>
                <h3 className="mt-4 font-mincho text-lg sm:text-xl text-ink leading-[1.55]">
                  悩みの章から読む
                </h3>
                <p className="mt-4 font-mincho text-[13.5px] sm:text-[14px] text-ink/80 leading-[2]">
                  汗・におい、肌・跡、顔の印象、髪、髭、心と余白 ──
                  6 つの章を地形図として並べています。
                </p>
                <p className="mt-4 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.9]">
                  こんな人向け：今、何かに気になっている
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-0.5 transition-colors group-hover:text-gold">
                  章を見る →
                </span>
              </TrackedCTA>
            </li>

            <li>
              <TrackedCTA
                href="/shelf"
                event="hero_cta_click"
                eventProps={{ target: "shelf", source: "three_entries" }}
                className="block h-full bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
              >
                <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                  02 · For you wanting tools
                </p>
                <h3 className="mt-4 font-mincho text-lg sm:text-xl text-ink leading-[1.55]">
                  整える道具の棚を見る
                </h3>
                <p className="mt-4 font-mincho text-[13.5px] sm:text-[14px] text-ink/80 leading-[2]">
                  リカバリーウェア、メンズスキンケア、医療脱毛など、
                  当事者として選択肢に置いてきたものを正直に並べる棚。
                </p>
                <p className="mt-4 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.9]">
                  こんな人向け：実際に試せるものを見たい
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-0.5 transition-colors group-hover:text-gold">
                  棚を見る →
                </span>
              </TrackedCTA>
            </li>

            <li>
              <TrackedCTA
                href="/recoveries"
                event="hero_cta_click"
                eventProps={{ target: "recoveries", source: "three_entries" }}
                className="block h-full bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
              >
                <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
                  03 · For you wanting story
                </p>
                <h3 className="mt-4 font-mincho text-lg sm:text-xl text-ink leading-[1.55]">
                  回復の物語を読む
                </h3>
                <p className="mt-4 font-mincho text-[13.5px] sm:text-[14px] text-ink/80 leading-[2]">
                  処置の時代、所作の時代、未完の時代 ──
                  運営者が通過した三幕を、長尺で読む。
                </p>
                <p className="mt-4 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.9]">
                  こんな人向け：先に通過した人の話を読みたい
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-0.5 transition-colors group-hover:text-gold">
                  Three Recoveries を読む →
                </span>
              </TrackedCTA>
            </li>
          </ol>

          <p className="mt-10 text-center text-[12px] text-sub-gray leading-[2]">
            選びかねる人は{" "}
            <Link
              href="/assessment"
              className="text-ink border-b border-gold pb-0.5 hover:text-gold transition-colors"
            >
              5 問の Recovery Assessment
            </Link>
            {" "}から始められます。
          </p>
        </section>
      </Reveal>

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
         SCENE II½ — Three Recoveries (story teaser)
         A single editorial moment that links to the
         long-form arc. The 3-up persona entry cards
         (above) already cover the action layer.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="three-recoveries"
          className="mx-auto max-w-[900px] px-6 sm:px-10 pt-20 sm:pt-28 pb-12 sm:pb-16 text-center"
        >
          <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.5em] uppercase text-gold">
            Three Recoveries · 回復の物語
          </p>
          <h2
            id="three-recoveries"
            className="mt-6 font-mincho text-2xl sm:text-3xl lg:text-4xl text-ink leading-[1.55] max-w-[30rem] mx-auto"
          >
            回復は、一回では終わらない。
          </h2>
          <p className="mt-7 font-mincho text-[14.5px] sm:text-[15px] text-ink/75 leading-[2.05] max-w-[32rem] mx-auto">
            身体の処置で終わる回復、所作で整え続ける回復、他者と並び直す回復。
            <br className="hidden sm:inline" />
            三幕の物語として、運営者が通過した時間を並べています。
          </p>
          <Link
            href="/recoveries"
            className="mt-9 inline-flex items-center gap-2 text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold-bright transition-colors px-6 py-3"
          >
            三幕の物語を読む
            <span aria-hidden>→</span>
          </Link>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE III — Featured Rituals
         Affiliate exit, promoted above Presence
         Journal. Editorial cards, not product tiles.
         Replaces the old Featured Recovery
         Experience slot per ops decision.
         ───────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <Reveal>
          <FeaturedRituals
            products={featuredProducts}
            numberLabel={chapterRomans[0]}
          />
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
                ja="記録（読みもの）"
                number={chapterRomans[1]}
              />
              <div className="lg:pb-2">
                <p className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem]">
                  運営者が自分の身体と自意識について書いてきたエッセイ。
                  <br className="hidden sm:inline" />
                  解決策ではなく、整えていった過程の記録です。
                </p>
                <p className="mt-3 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
                  読む人：当事者の声を、急かされずに読みたい人
                </p>
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
              ja="悩みの章（地形図）"
              number={chapterRomans[2]}
            />
            <div className="lg:pb-2">
              <p className="font-mincho text-[15px] sm:text-base text-ink/80 leading-[2] max-w-[34rem]">
                男性のコンプレックスを 6 つの章として並べた地形図。
                <br className="hidden sm:inline" />
                自分の悩みに近い章から、関連する記録と道具に辿れます。
              </p>
              <p className="mt-3 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
                読む人：自分の悩みに該当する章から入りたい人
              </p>
            </div>
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
         SCENE VI — Conditioning Rituals (Shelf preview)
         Inline 3-up product preview, not just text.
         Discoverability of the affiliate exit.
         ───────────────────────────────────────── */}
      {shelfPreview.length > 0 && (
        <Reveal>
          <section
            aria-labelledby="rituals"
            className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-20 sm:pt-28 pb-20 sm:pb-28"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-14 items-end mb-12 sm:mb-16">
              <SectionLabel
                en="Conditioning Rituals"
                ja="整える道具の棚"
                number={chapterRomans[3]}
              />
              <div id="rituals" className="lg:pb-2 max-w-[34rem]">
                <p className="font-mincho text-[15px] sm:text-base leading-[2] text-ink/80">
                  運営者が当事者として実際に選択肢に置いてきた整える道具。
                  <br className="hidden sm:inline" />
                  リカバリーウェア、メンズスキンケア、医療脱毛など、効くとは言わず層として並べます。
                </p>
                <p className="mt-3 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
                  読む人：実際に試せる道具を見たい人 ／ ※ 広告を含みます
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shelfPreview.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 justify-end">
              <Link
                href="/disclosure"
                className="text-[11px] tracking-[0.06em] text-sub-gray hover:text-ink transition-colors"
              >
                広告・アフィリエイト方針
              </Link>
              <Link
                href="/shelf"
                className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                棚をすべて見る
                <span aria-hidden> →</span>
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {/* ─────────────────────────────────────────
         SCENE VII — Belonging
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="belonging"
          className="border-t border-hair-line"
        >
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10 py-24 sm:py-32 text-center">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              Belonging · ニュースレター
            </p>
            <p className="mt-8 font-mincho text-2xl sm:text-3xl leading-[1.6] text-ink max-w-[28rem] mx-auto">
              月に一度か二度、
              <br className="sm:hidden" />
              便りが届きます。
            </p>
            <p className="mt-6 text-[13px] sm:text-sm leading-[2] text-sub-gray max-w-[30rem] mx-auto">
              新しい記録と、まだ記事にしていない覚え書きを。
              通知も煽りもありません。
            </p>
            <p className="mt-3 text-[12px] tracking-[0.06em] text-sub-gray leading-[1.95]">
              読む人：急かされずに、ゆっくり追いたい人
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
