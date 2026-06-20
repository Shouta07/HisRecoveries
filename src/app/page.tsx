import Image from "next/image";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import Reveal from "@/components/Reveal";
import TrackedCTA from "@/components/TrackedCTA";
import TagMarquee from "@/components/TagMarquee";
import NeutralBadge from "@/components/NeutralBadge";
import { getAllFeelings, TERRITORY_LABEL } from "@/lib/feelings";
import { getAllRecoveries } from "@/lib/recoveries";
import { getAllExperts } from "@/lib/experts";
import { getAllServices } from "@/lib/services";
import { site } from "@/lib/site";

const chapterRomans = ["I", "II", "III", "IV"];

export default function HomePage() {
  const feelings = getAllFeelings();
  const recoveries = getAllRecoveries().slice(0, 6);
  const experts = getAllExperts().slice(0, 3);
  const services = getAllServices().slice(0, 3);
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
          <p className="logo-type italic text-[12.5px] sm:text-[13px] tracking-[0.5em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            {site.tagline}
          </p>
          <h1 className="mt-6 logo-type text-[2.8rem] sm:text-7xl lg:text-[6.5rem] text-cream leading-[1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.name}
          </h1>
          <div className="mt-8 flex justify-center">
            <span aria-hidden className="block w-14 sm:w-20 h-px bg-gold-bright draw-in" />
          </div>
          <p className="mt-7 font-mincho text-[1.15rem] sm:text-[1.65rem] lg:text-[2.25rem] leading-[1.4] text-cream tracking-[0.04em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.promise}
          </p>

          {/* Quiet CTA strip — surfaces the editorial product (Interviews)
             without breaking the cinematic mood. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] tracking-[0.16em]">
            <Link
              href="/recoveries"
              className="text-cream border-b border-gold-bright pb-1 hover:text-gold-bright transition-colors"
            >
              実例を読む
            </Link>
            <span aria-hidden className="text-cream/30">·</span>
            <Link
              href="/interview"
              className="text-cream/85 border-b border-cream/30 pb-1 hover:text-gold-bright hover:border-gold-bright transition-colors"
            >
              インタビューを受ける
            </Link>
            <span aria-hidden className="text-cream/30">·</span>
            <Link
              href="/partners"
              className="text-cream/85 border-b border-cream/30 pb-1 hover:text-gold-bright hover:border-gold-bright transition-colors"
            >
              パートナーになる
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-cream/60">
            Scroll
          </span>
          <span
            aria-hidden
            className="block w-px h-10 bg-gradient-to-b from-gold-bright to-transparent soft-float"
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
         SCENE III — Featured Interviews（実例・キュレーション）
         HR は記事メディアではなく、取材メディア。Hero/Concept の直後に
         実例を最大の面で見せる。当事者・専門家・サービスの3パネル。
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="featured-interviews"
          className="mx-auto max-w-[1200px] px-6 sm:px-10 py-20 sm:py-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 lg:gap-14 items-end mb-10 sm:mb-14">
            <SectionLabel
              en="Interviews"
              ja="前に進んだ男性たちに、話を聞く。"
              number={chapterRomans[0]}
            />
            <p
              id="featured-interviews"
              className="font-mincho text-[14px] sm:text-[15px] text-ink/80 leading-[1.95] max-w-[34rem] lg:pb-2"
            >
              悩み・行動・支援者・変化・現在を、当事者の言葉で取材します。
              完了形ではなく、半歩進んだ時間の記録として。
            </p>
          </div>

          {recoveries.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {recoveries.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/recoveries/${r.slug}`}
                    className="group block h-full bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors card-lift"
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold">
                        {TERRITORY_LABEL[r.territory] ?? r.territory}
                      </p>
                      {r.span && (
                        <p className="text-[11px] tracking-[0.06em] text-sub-gray">
                          {r.span}
                        </p>
                      )}
                    </div>
                    <h3 className="mt-4 font-mincho text-[1.05rem] sm:text-[1.15rem] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                      {r.title}
                    </h3>
                    {r.asker?.context && (
                      <p className="mt-4 font-mincho text-[13px] text-sub-gray leading-[1.95] line-clamp-3">
                        — {r.asker.context}
                      </p>
                    )}
                    <span className="mt-5 inline-flex text-[12px] tracking-[0.1em] text-sub-gray group-hover:text-gold transition-colors">
                      話を聞く <span aria-hidden className="ml-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}

              {/* Interview invitation card — always visible to keep the
                 supply-side ask present even when recoveries are thin. */}
              <li>
                <Link
                  href="/interview"
                  className="group flex flex-col h-full border border-hair-line bg-navy text-cream p-6 sm:p-7 hover:border-gold-bright transition-colors card-lift"
                >
                  <p className="logo-type italic text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold-bright">
                    Interview Invitation
                  </p>
                  <h3 className="mt-4 font-mincho text-[1.05rem] sm:text-[1.15rem] leading-[1.55]">
                    あなたの「その後」を、編集者に話してみませんか。
                  </h3>
                  <p className="mt-4 font-mincho text-[13px] text-cream/75 leading-[1.95]">
                    完了した話でなくて構いません。半歩進んだ時間の記録として、匿名で受け付けています。
                  </p>
                  <span className="mt-auto pt-5 inline-flex text-[12px] tracking-[0.1em] text-cream/80 group-hover:text-gold-bright transition-colors">
                    インタビューを受ける <span aria-hidden className="ml-1">→</span>
                  </span>
                </Link>
              </li>
            </ul>
          ) : (
            <div className="border border-hair-line bg-paper p-8 sm:p-10">
              <p className="font-mincho text-[15px] text-ink leading-[2.05]">
                最初のインタビューが、まだ公開されていません。
              </p>
              <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
                編集者が、最初の数本を準備しています。
                あなた自身の「その後」を話してみたい方は、インタビュー応募からお願いします。
              </p>
              <div className="mt-6">
                <Link
                  href="/interview"
                  className="btn-gold !py-3 !px-5 text-xs"
                >
                  インタビューを受ける →
                </Link>
              </div>
            </div>
          )}

          {/* Curation hints — Experts + Services. Only show when at least
             one exists; otherwise stay quiet and let interviews lead. */}
          {(experts.length > 0 || services.length > 0) && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Link
                href="/experts"
                className="group block border border-hair-line bg-paper p-6 hover:border-gold transition-colors"
              >
                <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold">
                  Interviews — Experts
                </p>
                <h3 className="mt-3 font-mincho text-[15px] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  取材された専門家 {experts.length > 0 && `(${experts.length})`}
                </h3>
                <p className="mt-3 text-[12.5px] text-sub-gray leading-[1.95]">
                  医師・トレーナー・コーチ・カウンセラー・美容専門家。HR が直接話を聞いた人だけ。
                </p>
              </Link>
              <Link
                href="/services"
                className="group block border border-hair-line bg-paper p-6 hover:border-gold transition-colors"
              >
                <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold">
                  Curation — Services
                </p>
                <h3 className="mt-3 font-mincho text-[15px] text-ink leading-[1.55] group-hover:text-gold transition-colors">
                  編集者の保証つきサービス {services.length > 0 && `(${services.length})`}
                </h3>
                <p className="mt-3 text-[12.5px] text-sub-gray leading-[1.95]">
                  紹介手数料はゼロ。掲載は買えません。問い合わせは事業者へ直接。
                </p>
              </Link>
            </div>
          )}

          <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <NeutralBadge variant="subtle" />
            <Link
              href="/recoveries"
              className="text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 hover:text-gold transition-colors self-start sm:self-auto"
            >
              すべての取材を見る <span aria-hidden>→</span>
            </Link>
          </div>
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

      {/* ─────────────────────────────────────────
         SCENE VII — お品書き (the three things)
         The entire toC offering, stated plainly. Recovery Check is the
         primary free action — it is how we collect the first-party data
         on what men actually worry about.
         ───────────────────────────────────────── */}
      <Reveal>
        <section
          aria-labelledby="menu"
          className="mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-32"
        >
          <div className="mb-12 sm:mb-16">
            <SectionLabel
              en="What We Offer"
              ja="His Recoveries にあるもの"
              number={chapterRomans[1]}
            />
            <p
              id="menu"
              className="mt-6 font-mincho text-[14px] sm:text-[15px] text-sub-gray leading-[2] max-w-[34rem]"
            >
              多くを並べません。いまのあなたに必要なのは、たぶん、この三つだけです。
            </p>
          </div>

          {/* Primary — Recovery Check */}
          <div className="bg-paper border border-hair-line p-7 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 className="font-mincho text-2xl sm:text-3xl text-ink leading-[1.4]">
                    Recovery Check
                  </h3>
                  <span className="logo-type italic text-[12px] tracking-[0.2em] uppercase text-gold">
                    無料
                  </span>
                </div>
                <p className="mt-2 font-mincho text-[15px] text-ink/85 leading-[1.9]">
                  今の状態を、理解する。
                </p>
                <p className="mt-5 font-mincho text-[13.5px] text-sub-gray leading-[2.05] max-w-[34rem]">
                  30 問の自己観察に静かに答えると、編集者が読んで、24 時間以内に
                  「あなたの状態の地形図」を手紙で返します。診断ではなく、
                  自分の言葉を、もう一度、自分自身に渡すための時間です。
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] tracking-[0.05em] text-sub-gray max-w-[26rem]">
                  <li>— 30 問・15〜25 分</li>
                  <li>— 編集者が人で返信</li>
                  <li>— 完全無料</li>
                  <li>— 商品の販売なし</li>
                </ul>
              </div>
              <div className="lg:text-right">
                <TrackedCTA
                  href="/check"
                  event="hero_cta_click"
                  eventProps={{ target: "check", location: "home_menu" }}
                  className="btn-gold justify-center w-full lg:w-auto"
                >
                  Recovery Check を始める
                  <span aria-hidden>→</span>
                </TrackedCTA>
              </div>
            </div>
          </div>

          {/* Secondary — Stories (free) + Letter (paid) */}
          <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Link
              href="/stories"
              className="group block bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-mincho text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                  Recovery Stories
                </h3>
                <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  無料
                </span>
              </div>
              <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
                同じ悩みを持つ人の、回復の記録を読む。匿名の一通が、次に悩む誰かの助けになります。
              </p>
              <span className="mt-5 inline-flex text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                記録を読む <span aria-hidden> →</span>
              </span>
            </Link>

            <Link
              href="/membership"
              className="group block bg-paper border border-hair-line p-7 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-mincho text-xl text-ink leading-[1.4] group-hover:text-gold transition-colors">
                  Recoveries Letter
                </h3>
                <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  月 500 円
                </span>
              </div>
              <p className="mt-3 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
                週に一度、日曜日に届く手紙。男性の身体と自意識について、広告のない場所で。
              </p>
              <span className="mt-5 inline-flex text-[13px] tracking-[0.1em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                手紙について <span aria-hidden> →</span>
              </span>
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ─────────────────────────────────────────
         SCENE IX — Recoveries Letter (the place, not a product)
         Frame the Substack as a place to belong, not a paid subscription.
         Price stays discoverable but is not the headline.
         ───────────────────────────────────────── */}
      <Reveal>
        <section aria-labelledby="letter" className="relative bg-navy">
          <div className="absolute inset-0">
            <Image
              src="/room-morning.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center opacity-80"
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85"
          />
          <div className="relative mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-40 text-center text-cream">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Recoveries Letter
            </p>
            <p
              id="letter"
              className="mt-7 sm:mt-10 font-mincho text-[1.6rem] sm:text-[2.2rem] lg:text-[2.85rem] leading-[1.55] max-w-[36rem] mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]"
            >
              毎週日曜日。
              <br />
              男性の身体と自意識について。
              <br />
              広告のない場所で。
            </p>
            <p className="mt-7 sm:mt-9 font-mincho text-[14.5px] sm:text-[15.5px] leading-[2.05] text-cream/85 max-w-[30rem] mx-auto">
              公開記事には書けなかった、半歩先からの覚え書きを、
              <br className="hidden sm:inline" />
              週に一度、Substack でお送りします。
            </p>

            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <TrackedCTA
                href={`${site.social.substack}/subscribe`}
                event="membership_subscribe_click"
                eventProps={{ location: "home_letter" }}
                className="btn-gold justify-center"
              >
                日曜日の手紙を受け取る
                <span aria-hidden>→</span>
              </TrackedCTA>
              <TrackedCTA
                href={site.social.substack}
                event="subscribe_click"
                eventProps={{ location: "home_letter", target: "preview" }}
                className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
              >
                過去の手紙を読む
              </TrackedCTA>
            </div>

            <p className="mt-9 text-[12px] tracking-[0.08em] text-cream/55 leading-[1.95] max-w-[30rem] mx-auto">
              無料で読める便りと、月 ¥500 の Recoveries Letter から選べます。
              <br className="hidden sm:inline" />
              通知も催促もありません。読まない日曜日は、読まないでください。
            </p>
          </div>
        </section>
      </Reveal>
    </>
  );
}
