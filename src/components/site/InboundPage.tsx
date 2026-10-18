import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { BUYABLE, type InboundCopy } from "@/lib/inbound";
import { lineReady, lineUrl, contactEmail, NOT_READY_EN, NOT_READY_ZH } from "@/lib/contact";
import LangSwitch from "@/components/site/LangSwitch";
import LineCta from "@/components/site/LineCta";
import { Underline } from "@/components/art/Line";
import Mark from "@/components/brand/Mark";

/* 訪日向けの面。英語と中国語で、同じ形を使う。
 *
 * ══════════════════════════════════════════════════
 * 買える導線を置かない
 * ══════════════════════════════════════════════════
 * 面があることと、その言語で相談を受けられることは別。
 * 対応言語は未確認なので、買う口は開けない（lib/inbound.ts の BUYABLE）。
 *
 * 出すのは「対応できるか聞く」まで。
 * ここに決済ボタンを置くと、受けられるか分からないものを売ることになる。
 *
 * ══════════════════════════════════════════════════
 * 対象が違うことを、冒頭で言う
 * ══════════════════════════════════════════════════
 * 日本語の面は「海外へ行く日本人」、こちらは「日本へ来る人」。
 * 言語を切り替えると、サービスの対象も変わる。
 * 気づかないまま読み進めると、話が噛み合わない。
 */
export default function InboundPage({ c }: { c: InboundCopy }) {
  const notReady = c.lang === "en" ? NOT_READY_EN : NOT_READY_ZH;

  /* 地は日本語の面と同じクリーム。
     白のままだと、言語を切り替えたときに
     別のサイトへ移ったように見える。 */
  return (
    <div data-brand className="min-h-screen bg-sky text-slate">
      <header className="sticky top-0 z-40 border-b border-line bg-sky/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href={`/${c.lang}`} className="flex min-w-0 items-center gap-2">
            <Mark size={34} />
            <span className="truncate text-[17.5px] font-black leading-[1.15] text-slate">{NAME}</span>
          </Link>
          <LangSwitch current={c.lang} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-5 pb-20 sm:px-8">
        {/* 対象が変わったことを、いちばん上で言う */}
        <p className="mt-5 rounded-soft bg-mist px-4 py-3 text-[12.5px] leading-[1.8] text-steel">
          {c.audience}
        </p>

        <h1 className="mt-7 text-mega font-black leading-[1.2] text-slate">
          {c.heroA}
          <br />
          {c.heroB}
        </h1>
        <p className="mt-4 max-w-[34em] text-[16px] font-bold leading-[1.8] text-slate">{c.lead}</p>

        {/* 値段のそばに、必ず期間と返信を置く */}
        <div className="mt-6 rounded-card border border-line bg-paper p-5 shadow-card">
          <p className="text-[20px] font-black leading-tight text-slate sm:text-[23px]">
            {c.priceLine}
          </p>
          {/* 値段のすぐ下に、中身を1行で。
              通話とLINEの両方を書く。片方だけだと、
              いちばん読まれる行に商品の半分しか出ない */}
          <p className="mt-2 text-[14px] font-bold leading-[1.6] text-slate">{c.priceWhat}</p>
          <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13.5px] leading-[1.8] text-steel">
            <li>{c.meet}</li>
            <li>{c.unlimited}</li>
            <li>{c.window}</li>
            <li>{c.reply}</li>
          </ul>
        </div>

        {/* ── LINEを追加して終わり、にしない ──────────
            追加したあと何を書けばいいか分からないと、
            そこで止まる。押す前の画面に、送る4つを置く */}
        <div className="mt-6 max-w-[26em] rounded-card border border-line bg-paper p-5">
          <p className="text-[13.5px] font-black text-slate">{c.askItemsTitle}</p>
          <ol className="mt-3 flex flex-col gap-2">
            {c.askItems.map((t, i) => (
              <li key={t} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-[10.5px] font-black text-brand-deep"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 text-[13.5px] leading-[1.7] text-slate">{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 対応言語が未確認のあいだは、問い合わせまで */}
        <div className="mt-5 max-w-[26em]">
          <Cta c={c} notReady={notReady} where="hero" />
        </div>
        <p className="mt-3 max-w-[34em] rounded-soft border border-dashed border-line px-4 py-3 text-[12.5px] leading-[1.8] text-steel">
          {c.langNote}
        </p>

        {/* ── 相談できること ── */}
        <section className="mt-12">
          <h2 className="text-balance text-huge font-black text-slate">{c.askTitle}</h2>
          <Underline className="mt-3" />
          <ul className="mt-5 flex flex-col gap-2">
            {c.asks.map((t) => (
              <li
                key={t}
                className="rounded-card rounded-bl-[4px] bg-mist px-4 py-3 text-[14.5px] leading-[1.75] text-slate"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[34em] text-[13px] leading-[1.9] text-steel">{c.imageNote}</p>
        </section>

        {/* ── 誰が答えるか ── */}
        <section className="mt-12">
          <h2 className="text-balance text-huge font-black text-slate">{c.whoTitle}</h2>
          <Underline className="mt-3" />
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.9] text-steel">{c.who}</p>
        </section>

        {/* ── 含まないもの ── */}
        <section className="mt-12">
          <h2 className="text-balance text-huge font-black text-slate">{c.notIncludedTitle}</h2>
          <Underline className="mt-3" />
          <ul className="mt-5 flex flex-col gap-2">
            {c.notIncluded.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.85] text-steel">
                <span aria-hidden className="mt-[3px] shrink-0 text-[12px] font-black text-steel">×</span>
                <span className="min-w-0">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 流れ ── */}
        <section className="mt-12">
          <h2 className="text-balance text-huge font-black text-slate">{c.stepsTitle}</h2>
          <Underline className="mt-3" />
          <ol className="mt-5 flex flex-col gap-2.5">
            {c.steps.map(([head, sub], i) => (
              <li
                key={head}
                className="flex items-start gap-3 rounded-card border border-line bg-paper px-4 py-4 shadow-card"
              >
                <span
                  aria-hidden
                  className="mt-[1px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-black text-paper"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-black leading-[1.5] text-slate">{head}</span>
                  <span className="mt-1 block text-[13px] leading-[1.8] text-steel">{sub}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── FAQ ── */}
        <section className="mt-12">
          <h2 className="text-balance text-huge font-black text-slate">{c.faqTitle}</h2>
          <Underline className="mt-3" />
          <div className="mt-5 overflow-hidden rounded-card border border-line bg-paper shadow-card">
            {c.faq.map((f, i) => (
              <details key={f.q} className={`group ${i > 0 ? "border-t border-line" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-[14.5px] font-bold leading-[1.6] text-slate">
                  {f.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-[18px] leading-none text-steel transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[13.5px] leading-[1.9] text-steel">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── 最後 ── */}
        <section className="mt-12 rounded-card bg-brand p-6 text-paper shadow-card sm:p-8">
          <p className="text-big font-black leading-[1.5]">{c.closing}</p>
          {/* ここまで読んだ人は、上の4つを忘れている */}
          <ol className="mt-5 flex flex-col gap-1.5">
            {c.askItems.map((t, i) => (
              <li key={t} className="flex items-start gap-2 text-[13.5px] leading-[1.7]">
                <span aria-hidden className="font-black text-paper/70">{i + 1}</span>
                <span className="min-w-0 font-bold">{t}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 max-w-[26em]">
            <Cta c={c} notReady={notReady} where="final" onBrand />
          </div>
        </section>

        <footer className="mt-12 border-t border-line pt-6">
          <LangSwitch current={c.lang} />
          <p className="mt-4 text-[11.5px] leading-[1.7] text-steel">{site.company.name}</p>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-steel">
            {[
              ["/legal", "Legal"],
              ["/terms", "Terms"],
              ["/privacy", "Privacy"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-brand">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          {/* 決済の画面が日本語だけなら、申し込む前に言っておく */}
          <p className="mt-4 text-[11.5px] leading-[1.8] text-steel">
            {c.lang === "en"
              ? "Our legal pages and the payment screen are in Japanese only."
              : "法务页面和付款页面目前仅提供日语。"}
          </p>
        </footer>
      </main>
    </div>
  );
}

/** 問い合わせの口。URLが無いときは、押せる形にしない */
function Cta({
  c, notReady, where, onBrand = false,
}: { c: InboundCopy; notReady: string; where: string; onBrand?: boolean }) {
  const base = onBrand
    ? "flex min-h-[54px] w-full items-center justify-center rounded-pill bg-paper px-6 text-[15.5px] font-bold text-brand-deep"
    : "flex min-h-[54px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card";

  return (
    <>
      <LineCta
        where={`${c.lang}-${where}`}
        label={c.cta}
        notReady={notReady}
        className={base}
        notReadyClassName={`rounded-card border border-dashed px-4 py-3.5 text-[13.5px] leading-[1.8] ${
          onBrand ? "border-paper/50 text-paper/90" : "border-line bg-mist text-steel"
        }`}
      />
      <p className={`mt-2.5 text-[12px] leading-[1.75] ${onBrand ? "text-paper/90" : "text-steel"}`}>
        {c.freeCheck}. {c.paidStart}.
      </p>
      <p className={`mt-1.5 text-[11.5px] leading-[1.7] ${onBrand ? "text-paper/80" : "text-steel"}`}>
        {c.lineNeeded}
        {contactEmail && (
          <>
            {" "}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-4">
              {c.lang === "en" ? "Or email us." : "也可以发邮件。"}
            </a>
          </>
        )}
      </p>
      {/* 買える形にしない。対応言語が決まるまでは問い合わせまで */}
      {BUYABLE[c.lang] ? null : null}
    </>
  );
}
