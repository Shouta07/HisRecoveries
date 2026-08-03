"use client";

// 診断の本体。1画面1問で、選んだら自動で次へ進む。
//
// 35問を1画面ずつ出すと多く見えるが、選択＝前進なのでタップは35回、
// 実測で90秒前後に収まる。ページ送りのボタンを別に押させると、
// ここで倍のタップ数になり、完了率がはっきり落ちる。
//
// 気になっていない領域は、先頭の設問で「特にない」を選んだ時点で
// 残りを飛ばす。答えなかったこと自体が「該当なし」という回答になる。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BLOCKS,
  TOTAL_QUESTIONS,
  AREA_LABEL_SHORT,
  evaluate,
  isAreaId,
  summarize,
  type AreaId,
  type Answers,
  type Question,
} from "@/lib/check";
import { track } from "@/lib/analytics";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export type ArticleRef = { slug: string; title: string };

/** 質問を1本の配列に伸ばしておく。飛ばす判定は進むときに行う */
type Flat = { q: Question; blockIndex: number; indexInBlock: number };

const FLAT: Flat[] = BLOCKS.flatMap((b, bi) =>
  b.questions.map((q, qi) => ({ q, blockIndex: bi, indexInBlock: qi })),
);

export default function CheckFlow({
  articles,
  intro,
}: {
  articles: Record<string, ArticleRef[]>;
  /** 説明。まだ1問も答えていないときだけ出す（結果の上に残すと邪魔になる） */
  intro?: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [cursor, setCursor] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const finished = useRef(false);

  // ファーストビューでどの悩みから入ったか。
  // 回答を先に埋めることはしない（本人の代わりに答えることになる）。
  // 使うのは ①入ってきた入口の記録 ②「その話も見ます」と返すことの2つだけ。
  const params = useSearchParams();
  const raw = params.get("focus");
  const focus: AreaId | null = isAreaId(raw) ? raw : null;

  const current = FLAT[cursor];

  // 離脱の計測。どこまで進んで閉じたかが分かると、質問の並びを直せる。
  useEffect(() => {
    const onLeave = () => {
      if (!finished.current && started.current) {
        track("check_abandon", { at: cursor + 1 });
      }
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [cursor]);

  const next = useCallback(
    (fromIndex: number, ans: Answers) => {
      let i = fromIndex + 1;
      // 「特にない」を選んだブロックの残りは飛ばす
      while (i < FLAT.length) {
        const f = FLAT[i];
        const block = BLOCKS[f.blockIndex];
        if (
          block.skipRestIf &&
          f.indexInBlock > 0 &&
          ans[block.questions[0].id] === block.skipRestIf
        ) {
          i++;
          continue;
        }
        break;
      }
      if (i >= FLAT.length) {
        finished.current = true;
        setDone(true);
        return;
      }
      setCursor(i);
    },
    [],
  );

  function answer(value: string) {
    const ans = { ...answers, [current.q.id]: value };
    setAnswers(ans);
    if (!started.current) {
      started.current = true;
      track("check_start");
    }
    next(cursor, ans);
  }

  function back() {
    // 飛ばした設問を戻りでも飛ばす
    let i = cursor - 1;
    while (i >= 0) {
      const f = FLAT[i];
      const block = BLOCKS[f.blockIndex];
      if (
        block.skipRestIf &&
        f.indexInBlock > 0 &&
        answers[block.questions[0].id] === block.skipRestIf
      ) {
        i--;
        continue;
      }
      break;
    }
    if (i >= 0) setCursor(i);
  }

  const result = useMemo(() => (done ? evaluate(answers) : null), [done, answers]);

  useEffect(() => {
    if (result) {
      track("check_complete", {
        first: result.steps[0]?.areaId ?? "none",
        untouched: result.untouched,
        focus: focus ?? "none",
      });
    }
  }, [result, focus]);

  if (result) return <Result r={result} articles={articles} onRedo={() => {
    setAnswers({});
    setCursor(0);
    setDone(false);
    started.current = false;
    finished.current = false;
  }} />;

  const answered = Object.keys(answers).length;
  const pct = Math.round((answered / TOTAL_QUESTIONS) * 100);
  const block = BLOCKS[current.blockIndex];

  return (
    <div>
      {/* 「ひとつ戻る」で1問目に帰ってきたときに説明が復活しないよう、
          カーソルではなく回答数で判定する */}
      {answered === 0 &&
        (focus ? (
          // ファーストビューの選択肢から来た人には、こちらだけを出す。
          // 説明文と並べると同じことを2回言うことになり、
          // その2ブロックぶん設問が下に押される。
          <div className="mb-8 border-l-2 border-asagi pl-4">
            <p className="text-[15px] leading-[1.9] text-keshizumi">
              <span className="font-bold text-sumi">{AREA_LABEL_SHORT[focus]}</span>
              ですね。そこも含めて、全体の順番を見ます。
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.85] text-ainezu">
              {TOTAL_QUESTIONS}問・約3分。1つだけ見ても順番は出ないので、まず全体から。
            </p>
          </div>
        ) : (
          intro
        ))}

      {/* 進捗。残り何問かを出す。「あと少し」は書かない */}
      <div className="sticky top-0 z-10 -mx-5 border-b border-shironezu bg-shironeri/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[12.5px] text-ainezu">{block.label}</p>
          <p className="text-[12.5px] tabular-nums text-ainezu">
            {answered} / {TOTAL_QUESTIONS}
          </p>
        </div>
        <div className="mt-2 h-[3px] w-full bg-shironezu">
          <div
            className="h-full bg-asagi transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="pt-8" aria-live="polite">
        {/* 見出しに focus を当てて読み上げさせる手もあるが、
            :focus-visible の枠が見出しを囲ってしまい、目で見ている人には
            不具合に見える。読み上げは aria-live に任せて、focus は動かさない。 */}
        <h2
          className="text-[21px] leading-[1.65] sm:text-[25px]"
          style={{ ...MINCHO, fontWeight: 700 }}
        >
          {current.q.q}
        </h2>
        {current.q.hint && (
          <p className="mt-3 text-[13.5px] leading-[1.9] text-ainezu">{current.q.hint}</p>
        )}

        <ul className="mt-7 flex flex-col gap-2.5">
          {current.q.choices.map((c) => {
            const selected = answers[current.q.id] === c.value;
            return (
              <li key={c.value}>
                <button
                  type="button"
                  onClick={() => answer(c.value)}
                  className={`w-full border px-5 py-4 text-left text-[15.5px] leading-[1.7] transition-colors ${
                    selected
                      ? "border-asagi bg-asagi/5 text-sumi"
                      : "border-shironezu bg-hakuji text-keshizumi hover:border-asagi hover:text-sumi"
                  }`}
                >
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>

        {cursor > 0 && (
          <button
            type="button"
            onClick={back}
            className="mt-8 text-[13.5px] text-ainezu underline decoration-shironezu underline-offset-[5px] transition-colors hover:text-asagi"
          >
            ← ひとつ戻る
          </button>
        )}
      </div>
    </div>
  );
}

// ── 結果 ────────────────────────────────────

function Result({
  r,
  articles,
  onRedo,
}: {
  r: ReturnType<typeof evaluate>;
  articles: Record<string, ArticleRef[]>;
  onRedo: () => void;
}) {
  return (
    <div className="pt-4">
      <p className="text-[13px] text-asagi">診断の結果</p>
      <h2
        className="mt-3 text-[24px] leading-[1.55] sm:text-[31px]"
        style={{ ...MINCHO, fontWeight: 700 }}
      >
        {summarize(r)}
      </h2>

      {/* 現在地。人を採点しているように見せない。数えているのは項目の数だけ */}
      <div className="mt-8 border border-shironezu bg-hakuji px-5 py-6 sm:px-6">
        <p className="text-[13px] text-ainezu">いまの状態（12項目）</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-7 gap-y-2">
          <p className="text-[15px]">
            <span className="text-[30px] tabular-nums" style={{ ...MINCHO, fontWeight: 700 }}>
              {12 - r.untouched - r.partial}
            </span>
            <span className="ml-1.5 text-ainezu">できている</span>
          </p>
          <p className="text-[15px]">
            <span className="text-[22px] tabular-nums" style={{ ...MINCHO, fontWeight: 700 }}>
              {r.partial}
            </span>
            <span className="ml-1.5 text-ainezu">ときどき抜ける</span>
          </p>
          <p className="text-[15px]">
            <span className="text-[22px] tabular-nums" style={{ ...MINCHO, fontWeight: 700 }}>
              {r.untouched}
            </span>
            <span className="ml-1.5 text-ainezu">手つかず</span>
          </p>
        </div>
        <p className="mt-4 text-[13.5px] leading-[1.9] text-ainezu">
          これは良し悪しの点数ではなく、手をつけている項目の数です。
          全部を埋める必要はありません。順番があります。
        </p>
      </div>

      {/* 今月の3つ — 結果の中で、いちばん先に読まれる位置に置く */}
      <section className="mt-12">
        <h3 className="text-[18px] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
          今月やること、3つだけ
        </h3>
        <ol className="mt-5 border-t border-shironezu">
          {r.thisMonth.map((a) => (
            <li key={a.text} className="flex gap-4 border-b border-shironezu py-4">
              <span className="w-[3em] shrink-0 pt-[0.15em] text-[12.5px] text-asagi">
                {a.when}
              </span>
              <span className="text-[15px] leading-[1.9] text-keshizumi">{a.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 順番 */}
      {r.steps.length > 0 && (
        <section className="mt-14">
          <h3 className="text-[18px] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
            この順番で進めます
          </h3>
          <p className="mt-3 text-[14px] leading-[1.95] text-ainezu">
            並びは好みではなく、変わりやすさと目に入りやすさで決めています。
          </p>
          <div className="mt-7 flex flex-col gap-9">
            {r.steps.map((s) => {
              const list = (articles[s.areaId] ?? []).slice(0, 2);
              return (
                <div key={s.areaId} className="border-l-2 border-asagi pl-5 sm:pl-6">
                  <p className="text-[12.5px] tabular-nums text-asagi">STEP {s.n}</p>
                  <h4
                    className="mt-1.5 text-[17px] leading-[1.6]"
                    style={{ ...MINCHO, fontWeight: 700 }}
                  >
                    {s.label}
                  </h4>
                  <p className="mt-2.5 text-[14.5px] leading-[1.95] text-keshizumi">{s.why}</p>
                  {list.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2">
                      {list.map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={`/areas/${s.areaId}/${a.slug}`}
                            onClick={() =>
                              track("check_article_click", { area: s.areaId, slug: a.slug })
                            }
                            className="text-[14.5px] font-bold leading-[1.75] text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
                          >
                            {a.title}
                            <span aria-hidden> →</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* やらなくていいこと — 売っている側には書けない部分。ここが核 */}
      {r.skip.length > 0 && (
        <section className="mt-14 border border-shironezu bg-hakuji px-5 py-6 sm:px-6">
          <h3 className="text-[16px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 700 }}>
            いまは、やらなくていいこと
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {r.skip.map((s) => (
              <li key={s.label} className="text-[14.5px] leading-[1.9] text-keshizumi">
                <span className="font-bold text-sumi">{s.label}</span>
                <span className="mx-2 text-shironezu" aria-hidden>
                  |
                </span>
                {s.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
        ※ この診断は、手をつける順番を整理するためのものです。
        病気の診断ではなく、効果を示すものでもありません。
        気になる症状がある場合は医療機関にご相談ください。
        回答は保存していません。
      </p>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-shironezu pt-8 text-[14px]">
        <button
          type="button"
          onClick={onRedo}
          className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
        >
          もう一度やる
        </button>
        <Link
          href="/#index"
          className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
        >
          記事をさがす<span aria-hidden> →</span>
        </Link>
      </div>
    </div>
  );
}
