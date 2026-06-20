"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  activeCauseHints,
  severityFromAnswers,
  type Screening,
} from "@/lib/screenings";
import { site } from "@/lib/site";

type Answer = "yes" | "no" | undefined;

export default function ScreenClient({ screening }: { screening: Screening }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showResult, setShowResult] = useState(false);

  const total = screening.questions.length;
  const current = screening.questions[index];
  const progress = ((index + (showResult ? 1 : 0)) / total) * 100;

  const yes = useMemo(() => {
    const s = new Set<string>();
    for (const [k, v] of Object.entries(answers)) if (v === "yes") s.add(k);
    return s;
  }, [answers]);

  function answer(value: Answer) {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: value }));
    window.setTimeout(() => {
      if (index < total - 1) {
        setIndex((i) => i + 1);
      } else {
        setShowResult(true);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 220);
  }

  function back() {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (index > 0) setIndex((i) => i - 1);
  }

  function reset() {
    setAnswers({});
    setIndex(0);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Result view ───
  if (showResult) {
    const { score, band } = severityFromAnswers(screening, yes);
    const meta = screening.bands[band];
    const causes = activeCauseHints(screening, yes);
    const lineUrl = site.line?.addFriendUrl;

    return (
      <div className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-20 pb-24">
        <header className="mb-10">
          <p
            className="font-mincho text-[12px] tracking-[0.4em] uppercase text-gold"
            style={{ fontWeight: 600 }}
          >
            Result
          </p>
          <h1
            className="mt-4 font-mincho text-[2rem] sm:text-[2.5rem] lg:text-[2.85rem] text-ink leading-[1.3] tracking-[-0.005em]"
            style={{ fontWeight: 700 }}
          >
            {meta.label}
          </h1>
          <p
            className="mt-3 text-[12px] tracking-[0.22em] uppercase text-sub-gray"
            style={{ fontWeight: 600 }}
          >
            {screening.category} · score {score}
          </p>
        </header>

        <section className="mb-10">
          <p
            className="font-mincho text-[15px] sm:text-base text-ink leading-[2.05]"
            style={{ fontWeight: 500 }}
          >
            {meta.reading}
          </p>
        </section>

        {causes.length > 0 && (
          <section className="mb-10 border-t-2 border-b-2 border-ink/15 py-7">
            <p
              className="font-mincho text-[11px] tracking-[0.3em] uppercase text-sub-gray mb-4"
              style={{ fontWeight: 600 }}
            >
              読み取れる可能性（断定はしません）
            </p>
            <ul className="space-y-5">
              {causes.map((c) => (
                <li key={c.label}>
                  <p
                    className="font-mincho text-[15px] text-ink leading-[1.65]"
                    style={{ fontWeight: 700 }}
                  >
                    {c.label}
                  </p>
                  <p
                    className="mt-2 font-mincho text-[13.5px] text-ink/80 leading-[2]"
                    style={{ fontWeight: 500 }}
                  >
                    {c.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* The single recommended action — always exactly one. */}
        <section className="mb-10 bg-paper border-2 border-ink/15 p-7 sm:p-9">
          <p
            className="font-mincho text-[11px] tracking-[0.3em] uppercase text-gold mb-3"
            style={{ fontWeight: 600 }}
          >
            次の半歩、ひとつ
          </p>
          <p
            className="font-mincho text-[1.2rem] sm:text-[1.4rem] text-ink leading-[1.55]"
            style={{ fontWeight: 700 }}
          >
            {meta.action}
          </p>
          {meta.links.length > 0 && (
            <ul className="mt-6 space-y-3 text-[13px]">
              {meta.links.map((l) => (
                <li key={l.href + l.label}>
                  {l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink border-b-2 border-gold hover:text-gold transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {l.label} →
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-ink border-b-2 border-gold hover:text-gold transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      {l.label} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* LINE invite — only show if LINE friend URL is configured. */}
        {lineUrl && (
          <section className="mb-10 bg-navy text-cream p-7 sm:p-9">
            <p
              className="font-mincho text-[11px] tracking-[0.3em] uppercase text-gold-bright mb-3"
              style={{ fontWeight: 600 }}
            >
              LINE で詳細診断
            </p>
            <p
              className="font-mincho text-[1.05rem] sm:text-[1.2rem] leading-[1.65]"
              style={{ fontWeight: 700 }}
            >
              この結果をもとに、LINE で詳しく続きを聞きます。
            </p>
            <p
              className="mt-3 text-[13px] text-cream/80 leading-[2]"
              style={{ fontWeight: 500 }}
            >
              スコアの推移・原因タイプの精緻化・あなただけの行動提案。
              通知も催促もありません。
            </p>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-gold-bright text-navy px-6 py-3.5 text-[13px] tracking-[0.12em] hover:bg-cream transition-colors"
              style={{ fontWeight: 700 }}
            >
              LINE を追加する →
            </a>
          </section>
        )}
        {!lineUrl && (
          <section className="mb-10 border-2 border-dashed border-ink/15 p-7 sm:p-9">
            <p
              className="font-mincho text-[11px] tracking-[0.3em] uppercase text-sub-gray mb-3"
              style={{ fontWeight: 600 }}
            >
              LINE で詳細診断（準備中）
            </p>
            <p
              className="font-mincho text-[14.5px] text-ink/85 leading-[2]"
              style={{ fontWeight: 500 }}
            >
              この結果をもとに、LINE で詳しく続きを聞ける窓口を準備しています。
              開いたら、まず Recoveries Letter（週次）で連絡します。
            </p>
            <Link
              href="/membership"
              className="mt-5 inline-flex text-[13px] text-ink border-b-2 border-gold pb-0.5 hover:text-gold transition-colors"
              style={{ fontWeight: 600 }}
            >
              Recoveries Letter を見る →
            </Link>
          </section>
        )}

        <div className="mt-12 flex flex-wrap gap-4 text-[12.5px]">
          <button
            type="button"
            onClick={reset}
            className="text-ink border border-ink/30 hover:border-gold hover:text-gold transition-colors px-5 py-2.5"
            style={{ fontWeight: 600 }}
          >
            もう一度
          </button>
          <Link
            href="/screen"
            className="text-ink border border-ink/30 hover:border-gold hover:text-gold transition-colors px-5 py-2.5"
            style={{ fontWeight: 600 }}
          >
            ほかの領域を診断する
          </Link>
        </div>

        <p className="mt-10 text-[11px] text-sub-gray leading-[2]">
          ※ 本診断は当事者の自己観察を助ける編集ツールであり、医療行為・診断・受診勧奨を
          行うものではありません。個別の判断は医療機関にご相談ください。
        </p>
      </div>
    );
  }

  // ─── Quiz view ───
  return (
    <div className="mx-auto max-w-reading px-6 sm:px-10 pt-10 sm:pt-14 pb-24">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="font-mincho text-[11px] tracking-[0.4em] uppercase text-gold"
            style={{ fontWeight: 600 }}
          >
            {screening.category}
          </p>
          <p
            className="text-[12px] tracking-[0.08em] text-sub-gray tabular-nums"
            style={{ fontWeight: 600 }}
          >
            {index + 1} / {total}
          </p>
        </div>
        <div className="mt-3 h-[3px] bg-ink/10">
          <div
            className="h-[3px] bg-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <fieldset className="mb-12">
        <legend
          className="font-mincho text-[1.45rem] sm:text-[1.85rem] lg:text-[2.15rem] text-ink leading-[1.55] tracking-[-0.005em]"
          style={{ fontWeight: 700 }}
        >
          {current?.prompt}
        </legend>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => answer("yes")}
            className="bg-ink text-cream py-5 sm:py-7 text-[1rem] sm:text-[1.15rem] hover:bg-gold transition-colors"
            style={{ fontWeight: 700 }}
          >
            はい
          </button>
          <button
            type="button"
            onClick={() => answer("no")}
            className="bg-paper text-ink border-2 border-ink/20 py-5 sm:py-7 text-[1rem] sm:text-[1.15rem] hover:border-gold hover:text-gold transition-colors"
            style={{ fontWeight: 700 }}
          >
            いいえ
          </button>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={index === 0 && !showResult}
          className="text-[12.5px] tracking-[0.12em] text-ink border border-ink/20 hover:border-gold hover:text-gold transition-colors px-5 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontWeight: 600 }}
        >
          ← 戻る
        </button>
        <Link
          href="/screen"
          className="text-[12px] text-sub-gray hover:text-ink transition-colors"
          style={{ fontWeight: 500 }}
        >
          別の領域に変える
        </Link>
      </div>

      <p
        className="mt-10 text-[11px] text-sub-gray leading-[1.95]"
        style={{ fontWeight: 500 }}
      >
        回答はあなたの端末から出ません。最後にスコアと、推奨される次の半歩をひとつだけお返しします。
      </p>
    </div>
  );
}
