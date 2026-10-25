import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME, FULL, TAGLINE, TAB_TITLE } from "@/lib/voice";
import {
  DEFINITION, HERO_A, HERO_B, HERO_LEAD, STATUS_LINE,
  JOURNEY, LOOP, NOT_THIS, NOT_BUILT, TALK_TO, TALK_LEAD,
  END_USER, BUYER, PROBLEM, SOLUTION, MARKET, MVP, ICP, NOT_FOR,
} from "@/lib/concept";
import { contactEmail } from "@/lib/contact";
import Mark from "@/components/brand/Mark";
import { Underline } from "@/components/art/Line";

/* ══════════════════════════════════════════════════════════════
   構想の面
   ══════════════════════════════════════════════════════════════

   ── 売り場ではない ──────────────────────────────────────
   前はここで 3,980円の相談を売っていた。
   値段も、申し込みも、料金の帯も、全部外した。

   いま置いてあるのは、構想と、何が無いかと、話したい相手だけ。

   ── 「まだ無い」を、下に置かない ────────────────────────
   いちばん気をつけたところ。

   8段の流れを上から読むと、もう動いていると思う。
   丁寧に書くほどそう読まれる。

   だから「まだ無いもの」を、流れの途中（4段目のあと）に、
   同じ大きさで挟む。最後に小さく置くと、そこまで読まれない。

   1画面目にも、見出しのすぐ下に枠付きで出す。

   ── 夜の段だけ、暗くする ────────────────────────────────
   5〜6段目（宿に戻る・浸る）は、部屋の中の夜の話。
   ここだけ地を濃くして、読む側の時間も夜へ動かす。

   装飾ではなく、話が夜に移ったことの合図として使う。 */

export const metadata: Metadata = {
  title: { absolute: TAB_TITLE },
  description: `${DEFINITION}${STATUS_LINE}`,
  keywords: ["旅の体験設計", "宿泊体験 構想", "体験型ホテル", "旅先 記録", "地域文化 観光"],
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: FULL,
    title: TAB_TITLE,
    description: `${DEFINITION}${STATUS_LINE}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TAB_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TAB_TITLE,
    description: `${DEFINITION}${STATUS_LINE}`,
    images: ["/opengraph-image"],
  },
};

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1040px] px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

function H({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <div>
      <h2
        className={`text-balance text-huge font-black leading-[1.45] ${
          onDark ? "text-paper" : "text-slate"
        }`}
      >
        {children}
      </h2>
      <Underline className="mt-3" />
    </div>
  );
}

/** 連絡の口。メールが未設定なら、押せる形にしない */
function TalkCta({ onDark = false }: { onDark?: boolean }) {
  if (!contactEmail) {
    return (
      <p
        className={`rounded-card border border-dashed px-4 py-3.5 text-[13.5px] leading-[1.8] ${
          onDark ? "border-paper/50 text-paper/90" : "border-line bg-mist text-steel"
        }`}
      >
        連絡先は準備中です。開き次第、ここからご案内します。
      </p>
    );
  }
  return (
    <a
      href={`mailto:${contactEmail}?subject=${encodeURIComponent("体験の構想について")}`}
      className={`flex min-h-[58px] w-full items-center justify-center rounded-pill px-8 text-[16px] font-bold ${
        onDark
          ? "bg-paper text-brand-deep"
          : "bg-brand text-paper shadow-card transition-colors hover:bg-brand-deep"
      }`}
    >
      この構想について話す
    </a>
  );
}

/** まだ無いものの一覧。流れの途中と、最後の節に置く */
function NotBuilt({ onDark = false }: { onDark?: boolean }) {
  return (
    <div
      className={`rounded-card border-2 p-5 sm:p-6 ${
        onDark ? "border-paper/40" : "border-slate bg-paper"
      }`}
    >
      <p className={`text-[15px] font-black ${onDark ? "text-paper" : "text-slate"}`}>
        まだ、ここまでしかできていません
      </p>
      <ul
        className={`mt-4 flex flex-col gap-2.5 text-[14px] leading-[1.85] ${
          onDark ? "text-paper/85" : "text-steel"
        }`}
      >
        {NOT_BUILT.map((t) => (
          <li key={t} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={`mt-[2px] shrink-0 text-[13px] font-black ${
                onDark ? "text-paper/60" : "text-steel"
              }`}
            >
              ×
            </span>
            <span className="min-w-0">{t}</span>
          </li>
        ))}
      </ul>
      <p
        className={`mt-4 border-t pt-3.5 text-[13px] leading-[1.9] ${
          onDark ? "border-paper/25 text-paper/80" : "border-line text-steel"
        }`}
      >
        上に書いた一日は、いまのところ1度も起きていません。
        作る前に、現場から見て成り立つのかを知りたい段階です。
      </p>
    </div>
  );
}

/** 流れの1段 */
function StepRow({
  n, when, title, body, point, onDark = false,
}: {
  n: number; when: string; title: string; body: string[]; point: string; onDark?: boolean;
}) {
  return (
    <li className="grid gap-4 lg:grid-cols-[minmax(0,170px)_minmax(0,1fr)] lg:gap-10">
      <div>
        <p
          className={`text-[11.5px] font-black tracking-[0.08em] ${
            onDark ? "text-gold" : "text-brand"
          }`}
        >
          {when}
        </p>
        <p
          className={`mt-1 text-[32px] font-black tabular-nums leading-none ${
            onDark ? "text-paper/25" : "text-line"
          }`}
        >
          {String(n).padStart(2, "0")}
        </p>
      </div>
      <div>
        <h3
          className={`text-balance text-[18px] font-black leading-[1.55] sm:text-[20px] ${
            onDark ? "text-paper" : "text-slate"
          }`}
        >
          {title}
        </h3>
        <div className="mt-3 flex flex-col gap-2.5">
          {body.map((p, i) => (
            <p
              key={i}
              className={`max-w-[34em] text-[14.5px] leading-[1.95] ${
                onDark ? "text-paper/85" : "text-steel"
              }`}
            >
              {p}
            </p>
          ))}
        </div>
        <p
          className={`mt-4 border-l-2 border-gold pl-4 text-[13.5px] font-bold leading-[1.85] ${
            onDark ? "text-paper" : "text-slate"
          }`}
        >
          {point}
        </p>
      </div>
    </li>
  );
}

export default function ConceptPage() {
  /* 夜の段（宿に戻る・浸る）。ここだけ地を濃くする */
  const NIGHT = [5, 6];
  const before = JOURNEY.filter((s) => s.n < NIGHT[0]);
  const night = JOURNEY.filter((s) => NIGHT.includes(s.n));
  const after = JOURNEY.filter((s) => s.n > NIGHT[NIGHT.length - 1]);

  return (
    <div data-brand className="min-h-screen bg-sky text-slate">
      <header className="sticky top-0 z-40 border-b border-line bg-sky/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <Mark size={32} />
            <span className="truncate text-[18px] font-black leading-none text-slate sm:text-[20px]">
              {NAME}
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[13.5px] font-bold text-steel lg:flex">
            {[
              ["#who", "誰のため"],
              ["#journey", "一日の流れ"],
              ["#status", "まだ無いもの"],
              ["#talk", "話したい相手"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-brand">
                {label}
              </a>
            ))}
          </nav>
          <p className="shrink-0 rounded-pill border border-line bg-mist px-3 py-1.5 text-[11.5px] font-bold text-steel">
            構想段階
          </p>
        </Wrap>
      </header>

      {/* ══ 1画面目 ══ */}
      <section className="border-b border-line bg-sky">
        <Wrap className="py-12 sm:py-16 lg:py-20">
          <p className="text-[13px] font-black tracking-[0.04em] text-brand">{TAGLINE}</p>

          <h1 className="mt-3 max-w-[14em] text-balance text-mega font-black leading-[1.3] text-slate">
            {HERO_A}
            <br />
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[0.08em] h-[0.34em] rounded-[2px] bg-gold/40"
              />
              <span className="relative">{HERO_B}</span>
            </span>
          </h1>

          {/* 見出しのすぐ下。ここを見落とす人はいない */}
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-pill border-2 border-slate bg-paper px-4 py-2.5 text-[13.5px] font-bold text-slate">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-gold" />
            {STATUS_LINE}
          </p>

          <p className="mt-6 max-w-[34em] text-[15.5px] leading-[1.95] text-steel sm:text-[16.5px]">
            {HERO_LEAD}
          </p>

          {/* ひとめぐり。構想の骨をここで見せる */}
          <ul className="mt-9 flex flex-wrap items-center gap-x-2 gap-y-2.5">
            {LOOP.map((l, i) => (
              <li key={l.en} className="flex items-center gap-2">
                <span className="block rounded-soft border border-line bg-paper px-3 py-1.5">
                  <span className="block text-[13.5px] font-black leading-[1.3] text-slate">
                    {l.ja}
                  </span>
                  <span className="block text-[10px] font-bold leading-[1.3] text-steel">
                    {l.en}
                  </span>
                </span>
                {i < LOOP.length - 1 && (
                  <span aria-hidden className="text-[12px] text-steel">
                    →
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Wrap>
      </section>

      {/* ══ 誰のため ══ */}
      {/* つなぐ相手が2者いる。片方だけだと
          「旅行者向けアプリ」か「ホテルの設備」に見える */}
      <section id="who" className="scroll-mt-20 border-b border-line bg-paper">
        <Wrap className="py-14 sm:py-20">
          <H>誰と、誰をつなぐか。</H>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
            <div className="rounded-card border border-line bg-sky p-6">
              <p className="text-[11.5px] font-black tracking-[0.08em] text-brand">旅行者</p>
              <p className="mt-2 text-balance text-[18px] font-black leading-[1.55] text-slate">
                {END_USER.who}
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">{END_USER.detail}</p>
            </div>
            <div aria-hidden className="flex items-center justify-center text-steel">
              <span className="rotate-90 text-[22px] lg:rotate-0">⇄</span>
            </div>
            <div className="rounded-card border border-line bg-sky p-6">
              <p className="text-[11.5px] font-black tracking-[0.08em] text-brand">宿泊施設</p>
              <p className="mt-2 text-balance text-[18px] font-black leading-[1.55] text-slate">
                {BUYER.who}
              </p>
              <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">{BUYER.detail}</p>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border-l-2 border-gold pl-4">
              <dt className="text-[11.5px] font-black tracking-[0.08em] text-steel">解きたいこと</dt>
              <dd className="mt-1.5 text-[15px] font-black leading-[1.7] text-slate">{PROBLEM}</dd>
            </div>
            <div className="border-l-2 border-gold pl-4">
              <dt className="text-[11.5px] font-black tracking-[0.08em] text-steel">作ろうとしているもの</dt>
              <dd className="mt-1.5 text-[15px] font-black leading-[1.7] text-slate">{SOLUTION}</dd>
            </div>
          </dl>
        </Wrap>
      </section>

      {/* ══ 最初の市場 ══ */}
      {/* 「全国のホテル」にしない。
          最初の1件を作れる大きさまで絞ったことを、面でも言う */}
      <section className="border-b border-line bg-mist">
        <Wrap className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            <div>
              <H>
                まず、{MARKET.city}の
                <span className="whitespace-nowrap">{MARKET.first}</span>
                から。
              </H>
              <p className="mt-5 max-w-[32em] text-[14.5px] leading-[1.95] text-steel">{MARKET.why}</p>

              <p className="mt-7 text-[11.5px] font-black tracking-[0.08em] text-steel">
                街そのものに物語がある場所
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {MARKET.areas.map((a) => (
                  <li
                    key={a}
                    className={`rounded-pill border px-3.5 py-1.5 text-[13px] font-bold ${
                      MARKET.first.includes(a)
                        ? "border-brand bg-brand text-paper"
                        : "border-line bg-paper text-slate"
                    }`}
                  >
                    {a}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-card border-2 border-slate bg-paper p-5">
                <p className="text-[11.5px] font-black tracking-[0.08em] text-steel">最初に作る大きさ</p>
                <p className="mt-2 text-[20px] font-black tabular-nums leading-[1.4] text-slate sm:text-[22px]">
                  {MVP.line}
                </p>
                <p className="mt-2 text-[13px] leading-[1.9] text-steel">{MVP.note}</p>
              </div>
            </div>

            <div>
              <div className="rounded-card border border-line bg-paper p-5 sm:p-6">
                <p className="text-[15px] font-black text-slate">最初に声をかけたい宿</p>
                <ul className="mt-4 flex flex-col gap-2 text-[14px] leading-[1.85] text-slate">
                  {ICP.lines.map((l) => (
                    <li key={l} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-brand" />
                      <span className="min-w-0">{l}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line pt-3.5 text-[13.5px] leading-[1.9] text-steel">
                  {ICP.owner}
                </p>
              </div>

              <div className="mt-4 rounded-card border border-dashed border-line p-5">
                <p className="text-[12px] font-black tracking-[0.06em] text-steel">最初は、声をかけない相手</p>
                <ul className="mt-3 flex flex-col gap-1.5 text-[13px] leading-[1.8] text-steel">
                  {NOT_FOR.map((n) => (
                    <li key={n} className="flex items-start gap-2">
                      <span aria-hidden className="text-[12px]">×</span>
                      <span className="min-w-0">{n}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] leading-[1.8] text-steel">
                  断るためではなく、最初の1件で向きを間違えないためです。
                </p>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ 一日の流れ（昼） ══ */}
      <section id="journey" className="scroll-mt-20 border-b border-line bg-paper">
        <Wrap className="py-14 sm:py-20">
          <H>ある一日。</H>
          <p className="mt-5 max-w-[32em] text-[14.5px] leading-[1.95] text-steel">
            旅の前から、チェックアウトまで。機能の一覧ではなく、時間の順に並べます。
          </p>

          <ol className="mt-10 flex flex-col gap-10">
            {before.map((s) => (
              <StepRow key={s.n} {...s} />
            ))}
          </ol>
        </Wrap>
      </section>

      {/* ══ まだ無いもの（流れの途中に挟む） ══ */}
      {/* 最後に置くと、そこまで読まれない。
          読まれるのは、話が面白くなってきたところ */}
      <section id="status" className="scroll-mt-20 border-b border-line bg-mist">
        <Wrap className="py-12 sm:py-16">
          <div className="mx-auto max-w-[640px]">
            <NotBuilt />
          </div>
        </Wrap>
      </section>

      {/* ══ 一日の流れ（夜） ══ */}
      <section className="border-b border-line-dark bg-brand-deep text-paper">
        <Wrap className="py-14 sm:py-20">
          <H onDark>夜、部屋に戻る。</H>
          <p className="mt-5 max-w-[32em] text-[14.5px] leading-[1.95] text-paper/85">
            ここが、この構想でいちばん変わるところです。
          </p>

          <ol className="mt-10 flex flex-col gap-10">
            {night.map((s) => (
              <StepRow key={s.n} {...s} onDark />
            ))}
          </ol>
        </Wrap>
      </section>

      {/* ══ 翌日とチェックアウト ══ */}
      <section className="border-b border-line bg-paper">
        <Wrap className="py-14 sm:py-20">
          <ol className="flex flex-col gap-10">
            {after.map((s) => (
              <StepRow key={s.n} {...s} />
            ))}
          </ol>
        </Wrap>
      </section>

      {/* ══ これではない ══ */}
      <section className="border-b border-line bg-mist">
        <Wrap className="py-14 sm:py-20">
          <H>これではありません。</H>
          <p className="mt-5 max-w-[32em] text-[14.5px] leading-[1.95] text-steel">
            近いものが先にいくつもあります。どこが違うのかを、先に書いておきます。
          </p>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {NOT_THIS.map((n) => (
              <li key={n.no} className="rounded-card border border-line bg-paper p-5">
                <p className="flex items-center gap-2 text-[14.5px] font-black text-slate">
                  <span aria-hidden className="text-[13px] text-steel">
                    ×
                  </span>
                  <span className="line-through decoration-steel/50">{n.no}</span>
                </p>
                <p className="mt-3 text-[13.5px] leading-[1.9] text-steel">{n.but}</p>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-[34em] text-balance text-[16px] font-black leading-[1.85] text-slate sm:text-[18px]">
            作ろうとしているのは没入型ホテルではなく、
            旅先と泊まる場所をつなぐための仕組みです。
          </p>
        </Wrap>
      </section>

      {/* ══ 話したい相手 ══ */}
      <section id="talk" className="scroll-mt-20 bg-brand text-paper">
        <Wrap className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-14">
            <div>
              <H onDark>いま、話したい相手。</H>
              <p className="mt-5 max-w-[28em] text-[14.5px] leading-[1.95] text-paper/90">
                {TALK_LEAD}
              </p>

              <ul className="mt-8 flex flex-col gap-5">
                {TALK_TO.map((t) => (
                  <li key={t.who} className="border-l-2 border-gold pl-4">
                    <p className="text-[15px] font-black text-paper">{t.who}</p>
                    <p className="mt-1.5 max-w-[30em] text-[13.5px] leading-[1.9] text-paper/85">
                      {t.why}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-9 max-w-[25em]">
                <TalkCta onDark />
                <p className="mt-3 text-[12px] leading-[1.8] text-paper/80">
                  売っているものはありません。買えるものが何もないので、
                  申し込みの口も置いていません。
                </p>
              </div>
            </div>

            <NotBuilt onDark />
          </div>
        </Wrap>
      </section>

      <footer className="bg-brand-deep text-paper">
        <Wrap className="py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <Mark size={26} />
              <span className="text-[15px] font-black">{NAME}</span>
              <span className="text-[11.5px] text-paper/70">{site.company.name}</span>
            </div>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-paper/85">
              {[
                ["/terms", "利用規約"],
                ["/privacy", "プライバシーポリシー"],
                ["/legal", "事業者情報"],
                [`mailto:${site.company.email}`, "お問い合わせ"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
