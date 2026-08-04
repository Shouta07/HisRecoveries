"use client";

// 診断の本体。1画面1問で、選んだら自動で次へ進む。
//
// 本体は5問。選んだら自動で次へ進むので、30秒で終わる。
// ページ送りのボタンを別に押させると、ここで倍のタップ数になり、
// 完了率がはっきり落ちる。
//
// 気になっていない領域は、先頭の設問で「特にない」を選んだ時点で
// 残りを飛ばす。答えなかったこと自体が「該当なし」という回答になる。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BLOCKS,
  type Block,
  type Stage,
  CORE_QUESTIONS,
  DETAIL_QUESTIONS,
  AREA_LABEL_SHORT,
  evaluate,
  isAreaId,
  summarize,
  type AreaId,
  type Answers,
  type Question,
} from "@/lib/check";
import { track } from "@/lib/analytics";
import { encodeAnswers, decodeAnswers, isComplete } from "@/lib/checkLink";
import ShareRow from "@/components/ShareRow";
import StepOptions from "@/components/check/StepOptions";
import { buildPlan } from "@/lib/plan";
import { costLabel } from "@/lib/options";
import { site } from "@/lib/site";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export type ArticleRef = { slug: string; title: string };

/** 質問を1本の配列に伸ばしておく */
type Flat = { q: Question; block: Block; indexInBlock: number };

/**
 * その段階の設問を並べる。
 *
 * ── 5問にした ────────────────────────────────
 * 以前は36問だった。訊く数を増やすほど精度は上がるが、
 * 完了しない診断はレポートを1枚も出せない。精度より完了を取る。
 * 領域別の詳細19問は削り、減点12項目は任意の段階に移した。
 *
 * ── 先に答えたものは訊かない ─────────────────────
 * ファーストビューで悩みを選んだ人には、同じことを訊かない。
 * 本人が選んだ答えを引き継ぐだけなので、代わりに答えたことにはならない。
 */
function buildFlat(stage: Stage, answered: Answers): Flat[] {
  return BLOCKS.filter((b) => b.stage === stage).flatMap((b) =>
    b.questions
      .map((q, qi) => ({ q, block: b, indexInBlock: qi }))
      .filter((f) => answered[f.q.id] === undefined),
  );
}

export default function CheckFlow({
  articles,
  intro,
  note,
}: {
  articles: Record<string, ArticleRef[]>;
  /** 設問の上に出す短い一行。まだ1問も答えていないときだけ */
  intro?: React.ReactNode;
  /** 選択肢の下に出す説明。上に置くと選択肢が画面の外に出るので、下に回す */
  note?: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [cursor, setCursor] = useState(0);
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState<Stage>("core");
  const started = useRef(false);
  const finished = useRef(false);

  // ファーストビューでどの悩みから入ったか。
  // 回答を先に埋めることはしない（本人の代わりに答えることになる）。
  // 使うのは ①入ってきた入口の記録 ②「その話も見ます」と返すことの2つだけ。
  const params = useSearchParams();
  const raw = params.get("focus");
  const focus: AreaId | null = isAreaId(raw) ? raw : null;

  // ?r= から結果を戻す。
  // 自分で保存したリンクを開いた人と、人から送られてきた人の両方が、
  // 1問も答えずに結果の画面から始まる。
  // 壊れた値・足りない値は decode 側で落とすので、ここでは数だけ見る。
  const restored = useMemo<Answers>(() => decodeAnswers(params.get("r")), [params]);
  const hasRestored = isComplete(restored);

  // ファーストビューで選んだ悩みは、そのまま c1 の答えとして引き継ぐ
  const seeded: Answers = useMemo<Answers>(() => {
    const a: Answers = {};
    if (focus) a.c1 = focus;
    return a;
  }, [focus]);
  const all = useMemo(
    () => (hasRestored ? { ...restored, ...answers } : { ...seeded, ...answers }),
    [hasRestored, restored, seeded, answers],
  );
  const flat = useMemo(() => buildFlat(stage, seeded), [stage, seeded]);
  const current = flat[cursor];

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
    (fromIndex: number) => {
      const i = fromIndex + 1;
      if (i >= flat.length) {
        finished.current = true;
        setDone(true);
        return;
      }
      setCursor(i);
    },
    [flat],
  );

  function answer(value: string) {
    const ans = { ...answers, [current.q.id]: value };
    setAnswers(ans);
    if (!started.current) {
      started.current = true;
      track("check_start");
    }
    next(cursor);
  }

  function back() {
    if (cursor > 0) setCursor(cursor - 1);
  }

  const result = useMemo(() => (done || hasRestored ? evaluate(all) : null), [done, hasRestored, all]);

  // 復元して開いただけのものを「完了」に混ぜない。
  // 混ぜると、共有リンクが1回開かれるたびに完了が1件増えて、
  // 完了率が実態より高く出る。別の名前で数える。
  useEffect(() => {
    if (!result) return;
    if (hasRestored && !done) {
      track("check_restored", { first: result.steps[0]?.areaId ?? "none" });
      return;
    }
    track("check_complete", {
      first: result.steps[0]?.areaId ?? "none",
      untouched: result.untouched,
      focus: focus ?? "none",
      detailed: result.detailed,
    });
  }, [result, focus, hasRestored, done]);

  if (result)
    return (
      <Result
        r={result}
        articles={articles}
        link={`${site.url}/check?r=${encodeURIComponent(encodeAnswers(all))}`}
        onRedo={() => {
          // ?r= を消してから初期化する。消さないと、状態を空にした瞬間に
          // URLから同じ結果がまた復元されて、1問目に戻れない。
          if (typeof window !== "undefined" && window.location.search) {
            window.history.replaceState(null, "", "/check");
          }
          setAnswers({});
          setCursor(0);
          setDone(false);
          setStage("core");
          started.current = false;
          finished.current = false;
        }}
        onDetail={
          result.detailed
            ? undefined
            : () => {
                track("check_detail_start");
                setStage("detail");
                setCursor(0);
                setDone(false);
                finished.current = false;
              }
        }
      />
    );

  const answered = cursor;
  const total = stage === "core" ? flat.length : DETAIL_QUESTIONS;
  const pct = Math.round((answered / Math.max(total, 1)) * 100);
  const block = current.block;

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
              あと{CORE_QUESTIONS - 1}問・30秒で、順番が出ます。
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
            {answered} / {total}
          </p>
        </div>
        <div className="mt-2 h-[3px] w-full bg-shironezu">
          <div
            className="h-full bg-asagi transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 狭い画面では余白を詰める。
          実測で、1問目の選択肢6個のうち下2個が画面の外にあった
          （375x667 で342px はみ出し）。選べないものが見えていないので、
          スクロールして初めて選択肢の数が分かる状態だった。 */}
      <div className="pt-5 sm:pt-8" aria-live="polite">
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
          <p className="mt-2.5 text-[13.5px] leading-[1.9] text-ainezu sm:mt-3">{current.q.hint}</p>
        )}

        <ul className="mt-5 flex flex-col gap-2 sm:mt-7 sm:gap-2.5">
          {current.q.choices.map((c) => {
            const selected = answers[current.q.id] === c.value;
            return (
              <li key={c.value}>
                <button
                  type="button"
                  onClick={() => answer(c.value)}
                  className={`w-full border px-4 py-3.5 text-left text-[15px] leading-[1.65] transition-colors sm:px-5 sm:py-4 sm:text-[15.5px] sm:leading-[1.7] ${
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

        {/* 中身の説明は、選択肢の下に置く。
            上に置くと、その高さのぶんだけ選択肢が画面の外へ出る。
            「何問で終わるか」だけは上のバーが常に出しているので、
            押す前に必要な情報は足りている。 */}
        {answered === 0 && note}
      </div>
    </div>
  );
}

// ── 結果 ────────────────────────────────────

function Result({
  r,
  articles,
  onRedo,
  onDetail,
  link,
}: {
  r: ReturnType<typeof evaluate>;
  articles: Record<string, ArticleRef[]>;
  onRedo: () => void;
  /** 精度を上げる段階へ。すでに答えた人には渡さない */
  onDetail?: () => void;
  /** この結果を復元できるURL。自分で残すのにも、人に送るのにも使う */
  link: string;
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

      {/* 現在地。答えた人にだけ出す。
          5問だけで終える人のほうが多い前提なので、
          未回答のときは空欄を見せず、精度を上げる導線に替える。 */}
      {r.detailed ? (
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
      ) : onDetail ? (
        <div className="mt-8 border border-shironezu bg-hakuji px-5 py-6 sm:px-6">
          <p className="text-[13px] text-ainezu">精度を上げる</p>
          <p className="mt-2 text-[15px] leading-[1.9] text-keshizumi">
            13問（1分）に答えると、いまの状態が12項目で出て、
            <span className="font-bold text-sumi">順番の並びも変わることがあります。</span>
            答えなくても、下の内容はこのまま使えます。
          </p>
          <button
            type="button"
            onClick={onDetail}
            className="mt-4 inline-block border border-asagi bg-asagi px-5 py-2.5 text-[14px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi"
          >
            1分だけ足す
          </button>
        </div>
      ) : null}

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

      {/* 90日ロードマップ。
          順番は優先順位であって予定ではないので、時間軸に展開する。
          フェーズの中身は順番表から作っている（別々に決めると、
          同じ画面に違う順序が2つ並ぶことになる）。 */}
      {r.steps.length > 0 && <Plan steps={r.steps} limits={r.limits} />}

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

                  {/* 順番だけ出しても、次に何を選ぶかが残る。
                      予算・時間・期限で仕分けた選択肢をここに置く。
                      落としたものも理由つきで出す（隠すと比較にならない）。 */}
                  <StepOptions area={s.areaId} limits={r.limits} />

                  {list.length > 0 && (
                    <ul className="mt-5 flex flex-col gap-2 border-t border-shironezu pt-4">
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

      {/* 共有。診断の結果は、記事よりも人に言いたくなる種類のもの
          （「俺はここからだった」）。ここに導線がないと、
          いちばん拡散しやすい瞬間を捨てることになる。

          ── 送っていたものが間違っていた ──────────────────
          ここが配っていたのは /check、つまりまっさらな1問目だった。
          「LINEで送る」を押しても、相手に届くのは空の診断で、
          自分で保存しても、開いたらまた1問目から始まる。
          いちばん関心が高い瞬間に、持ち帰るものが無かった。

          いまは結果を復元できるURLを配る。答えはURLの中だけにあり、
          こちらには何も保存しない。
          そのぶん「送ると答えも相手に見える」ことは下に書く。 */}
      <ShareRow
        label="この結果を残す・送る"
        url={link}
        title="男の改善は、順番で決まる。5問・30秒で、何から始めるかが出ます。"
        // 公開の場には、結果の入っていないURLを出す。
        //
        // ── もとの文面をやめた理由 ────────────────────
        // 「診断したら、私は『清潔感・第一印象』からでした。」を既定にしていた。
        // これは公開の場での自己申告になる。
        // この分野で押しにくいのは、拡散の仕組みが無いからではなく、
        // 押すと「自分にはその問題がある」と言うことになるから。
        // 薄毛・肌・体毛・疲れ顔は、そもそも人前で言わないから検索されている。
        //
        // ── URLも分けた ──────────────────────────
        // link には回答（年代・予算・悩み）が入っている。
        // LINEと「リンクをコピー」は、自分に残す／一人に送る用なのでそのまま。
        // Xは公開の場なので、結果の入っていない /check に差し替える。
        publicUrl={`${site.url}/check`}
      />

      <p className="mt-12 text-[13px] leading-[1.95] text-ainezu">
        ※ この診断は、手をつける順番を整理するためのものです。
        病気の診断ではなく、効果を示すものでもありません。
        気になる症状がある場合は医療機関にご相談ください。
      </p>
      <p className="mt-4 text-[13px] leading-[1.95] text-ainezu">
        ※ 回答は、こちらには保存していません。上のリンクの中にだけ入っています。
        自分で開けばこの結果に戻れますが、
        <span className="font-bold text-keshizumi">人に送ると、答えた内容も相手に見えます。</span>
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

// ── 90日ロードマップ ─────────────────────────────

function Plan({
  steps,
  limits,
}: {
  steps: { areaId: AreaId }[];
  limits: Parameters<typeof buildPlan>[1];
}) {
  const phases = buildPlan(steps, limits);

  return (
    <section className="mt-14">
      <h3 className="text-[18px] sm:text-[20px]" style={{ ...MINCHO, fontWeight: 700 }}>
        90日の進め方
      </h3>
      <p className="mt-3 text-[14px] leading-[1.95] text-ainezu">
        3つに割ってあります。前に進む条件も書いてあるので、期日ではなく状態で進みます。
      </p>

      <div className="mt-7 flex flex-col gap-8">
        {phases.map((p) => (
          <div key={p.n} className="border border-shironezu bg-hakuji px-5 py-6 sm:px-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[12px] tabular-nums text-asagi">
                {p.fromWeek}〜{p.toWeek}週目
              </span>
              <h4 className="text-[17px] leading-[1.5]" style={{ ...MINCHO, fontWeight: 700 }}>
                {p.label}
              </h4>
            </div>
            <p className="mt-2.5 text-[14px] leading-[1.9] text-keshizumi">{p.aim}</p>

            {p.todo.length > 0 ? (
              <ul className="mt-4 border-t border-shironezu">
                {p.todo.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-shironezu py-3">
                    <span className="text-[14.5px] leading-[1.75] text-sumi">{o.label}</span>
                    <span className="text-[11.5px] tabular-nums text-ainezu">{costLabel(o)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13.5px] text-ainezu">
                この期間にやることはありません。前の段階を続けてください。
              </p>
            )}

            {p.moveOn !== "——" && (
              <p className="mt-4 text-[13px] leading-[1.85] text-ainezu">
                <span className="text-keshizumi">次へ進む条件</span>　{p.moveOn}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
